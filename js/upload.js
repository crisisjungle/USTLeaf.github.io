
// Upload Logic for student submissions.
// Dependencies:
// - oss-client.js
// - oss-student-config.js
// - browser-image-compression (loaded via CDN)

function generateId(prefix) {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).slice(2, 8);
    return `${prefix}_${timestamp}_${randomStr}`;
}

function isLocalDevHost() {
    const hostname = window.location.hostname;
    return hostname === '127.0.0.1' || hostname === 'localhost';
}

function guessMimeType(fileExt) {
    const extension = String(fileExt || '').toLowerCase();
    if (extension === 'png') return 'image/png';
    if (extension === 'webp') return 'image/webp';
    if (extension === 'gif') return 'image/gif';
    if (extension === 'heic' || extension === 'heif') return 'image/heic';
    return 'image/jpeg';
}

function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = String(reader.result || '');
            const base64 = result.includes(',') ? result.split(',')[1] : result;
            resolve(base64);
        };
        reader.onerror = () => reject(reader.error || new Error('Failed to read file.'));
        reader.readAsDataURL(blob);
    });
}

/**
 * Compresses an image file using browser-image-compression
 * @param {File} file - The file to compress
 * @returns {Promise<File>} - The compressed file
 */
async function compressImage(file) {
    const options = {
        maxSizeMB: 1,          // Compress to <= 1MB
        maxWidthOrHeight: 1920, // Resize if larger than 1920px
        useWebWorker: true
    };
    try {
        return await imageCompression(file, options);
    } catch (error) {
        console.error("Image compression error:", error);
        return file; // Return original if compression fails
    }
}

/**
 * Uploads a single pending submission to Aliyun OSS
 */
async function uploadPendingSubmissionDirect(client, file, commonMeta, groupId) {
    const fileExt = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const photoId = generateId('photo');
    const imageKey = `submissions/photos/${groupId}/${photoId}.${fileExt}`;
    const dataKey = `submissions/data/${photoId}.json`;

    let compressedFile = file;
    if (typeof imageCompression !== 'undefined') {
        try {
            console.log('Compressing:', file.name);
            compressedFile = await compressImage(file);
        } catch (e) {
            console.warn('Compression skipped:', e);
        }
    } else {
        console.warn('browser-image-compression lib not loaded. Uploading original.');
    }

    await client.put(imageKey, compressedFile, { timeout: 60000 });

    const metadata = {
        id: photoId,
        submission_group_id: groupId,
        status: 'pending',
        created_at: new Date().toISOString(),
        reviewed_at: null,
        image_key: imageKey,
        image_url: '',
        contributor_name: commonMeta.contributor_name || '',
        location_text: commonMeta.location_text,
        plant_guess: commonMeta.plant_guess || '',
        note: commonMeta.note || '',
        source: 'student_upload'
    };

    const jsonBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
    await client.put(dataKey, jsonBlob, { timeout: 60000 });

    return {
        photoId,
        dataKey,
        imageKey
    };
}

async function uploadPendingSubmissionViaApi(file, commonMeta, groupId) {
    const fileExt = (file.name.split('.').pop() || 'jpg').toLowerCase();

    let compressedFile = file;
    if (typeof imageCompression !== 'undefined') {
        try {
            console.log('Compressing:', file.name);
            compressedFile = await compressImage(file);
        } catch (error) {
            console.warn('Compression skipped:', error);
        }
    }

    const base64Data = await blobToBase64(compressedFile);
    const response = await fetch('/api/upload-submission', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            fileName: file.name,
            fileExt,
            mimeType: compressedFile.type || file.type || guessMimeType(fileExt),
            base64Data,
            groupId,
            commonMeta
        })
    });

    if (!response.ok) {
        let message = `上传接口返回 ${response.status}`;
        try {
            const payload = await response.json();
            if (payload && payload.error) {
                message = payload.error;
            }
        } catch (error) {
            const text = await response.text().catch(() => '');
            if (text) {
                message = text;
            }
        }
        throw new Error(message);
    }

    return response.json();
}

async function uploadPendingSubmission(client, file, commonMeta, groupId) {
    try {
        return await uploadPendingSubmissionViaApi(file, commonMeta, groupId);
    } catch (error) {
        const isMissingApi = /404|Cannot POST|not found/i.test(String(error.message || ''));
        if (isMissingApi && isLocalDevHost() && client) {
            console.warn('Upload API is unavailable locally, falling back to direct OSS upload.');
            return uploadPendingSubmissionDirect(client, file, commonMeta, groupId);
        }
        throw error;
    }
}

/**
 * Handles the batch upload process
 * @param {File[]} files - Array of files to upload
 * @param {Object} commonMeta - Batch metadata shared by all files
 * @param {Function} onProgress - Callback(percent)
 * @returns {Promise<{success: number, failed: number, errors: string[], groupId: string}>}
 */
async function uploadBatch(files, commonMeta, onProgress) {
    const client = window.USTLeafOSS && window.USTLeafOSS.createClient
        ? window.USTLeafOSS.createClient('student')
        : null;

    if (!client && isLocalDevHost()) {
        const message = window.USTLeafOSS && window.USTLeafOSS.getConfigErrorMessage
            ? window.USTLeafOSS.getConfigErrorMessage('student')
            : '未能初始化学生上传凭证。';
        throw new Error(message);
    }

    const groupId = generateId('group');
    let completed = 0;
    const total = files.length;
    let successCount = 0;
    let failCount = 0;
    const errors = [];

    const chunkHelp = async (file) => {
        try {
            await uploadPendingSubmission(client, file, commonMeta, groupId);
            successCount++;
        } catch (err) {
            console.error(`Failed to process ${file.name}:`, err);
            failCount++;
            errors.push(`${file.name}: ${err.message}`);
        } finally {
            completed++;
            if (onProgress) onProgress((completed / total) * 100);
        }
    };

    const CONCURRENCY = 3;
    const pool = [];

    for (const file of files) {
        const p = chunkHelp(file).then(() => {
            pool.splice(pool.indexOf(p), 1);
        });
        pool.push(p);

        if (pool.length >= CONCURRENCY) {
            await Promise.race(pool);
        }
    }

    await Promise.all(pool);

    return { success: successCount, failed: failCount, errors, groupId };
}

window.USTUpload = {
    uploadBatch
};
