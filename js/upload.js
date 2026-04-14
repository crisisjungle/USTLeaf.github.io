
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
async function uploadPendingSubmission(client, file, commonMeta, groupId) {
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

    if (!client) {
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
