
// Upload Logic specific to USTLeaf (Aliyun OSS Version)
// Dependencies: 
// - oss-config.js (must be loaded before this)
// - browser-image-compression (must be loaded via CDN)

// Constants
// OSS Client is initialized in oss-config.js as `createOSSClient()`

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
 * Uploads image and metadata to Aliyun OSS
 */
async function uploadToOSS(file, commonMeta, description) {
    const client = createOSSClient();
    if (!client) throw new Error("OSS client initialization failed");

    // 1. Prepare Filenames (use timestamp to ensure chronological order)
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const fileExt = file.name.split('.').pop();
    const uuid = `${timestamp}_${randomStr}`;

    const imagePath = `photos/${uuid}.${fileExt}`;
    const dataPath = `data/${uuid}.json`;

    // 2. Compress Image (if library loaded)
    let compressedFile = file;
    if (typeof imageCompression !== 'undefined') {
        try {
            console.log("Compressing:", file.name);
            compressedFile = await compressImage(file);
        } catch (e) {
            console.warn("Compression skipped:", e);
        }
    } else {
        console.warn("browser-image-compression lib not loaded. Uploading original.");
    }

    // 3. Upload Image (with timeout)
    const options = {
        timeout: 60000 // 60s timeout
    };
    const imageResult = await client.put(imagePath, compressedFile, options);
    // Construct Public URL (Avoid using the one from result to ensure https and custom domain if needed)
    // The result.url might be http or have parameters. Safer to construct if standard bucket.
    // simpler: use result.url.replace('http:', 'https:')
    const imageUrl = imageResult.url.replace(/^http:/, 'https:');

    // 4. Create Metadata Object
    const metadata = {
        id: uuid,
        created_at: new Date().toISOString(),
        image_url: imageUrl,
        photographer_name: commonMeta.name,
        photographer_major: commonMeta.major,
        description: description || ""
    };

    // 5. Upload Metadata as JSON
    // Blob is needed for put
    const jsonBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
    await client.put(dataPath, jsonBlob);

    return imageUrl;
}


/**
 * Handles the batch upload process
 * @param {File[]} files - Array of files to upload
 * @param {Object} commonMeta - { name, major }
 * @param {Object} fileSpecificMeta - Map of filename -> description
 * @param {Function} onProgress - Callback(percent)
 * @returns {Promise<{success: number, failed: number, errors: string[]}>}
 */
async function uploadBatch(files, commonMeta, fileSpecificMeta, onProgress) {
    let completed = 0;
    const total = files.length;
    let successCount = 0;
    let failCount = 0;
    const errors = [];

    const chunkHelp = async (file) => {
        try {
            const description = fileSpecificMeta[file.name] || "";
            await uploadToOSS(file, commonMeta, description);
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

    return { success: successCount, failed: failCount, errors };
}

// Make functions available globally
window.USTUpload = {
    uploadBatch
};
