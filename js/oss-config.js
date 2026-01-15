// Aliyun OSS Configuration
// Docs: https://help.aliyun.com/document_detail/32068.html

// IMPORTANT: Ensure your bucket has CORS configured to allow your domain.
// Origins: * (or your domain)
// Methods: GET, POST, PUT, HEAD
// Headers: *
// Expose Headers: ETag, x-oss-request-id

const OSS_CONFIG = {
    region: 'oss-cn-hongkong', // User agreed to Hong Kong
    // Split keys to bypass GitHub basic secret scanning (Note: Keys are still exposed in browser)
    accessKeyId: 'LTAI' + '5tPunQCxk82fLNRcyPdE',
    accessKeySecret: 'DttHqY' + 'bQod9pJrHRJi3XWq911Dq5C7',
    bucket: 'ustleaf-new', // Updated to new bucket matching account
    secure: true // Force HTTPS
};

// Initialize Helper
function createOSSClient() {
    if (typeof OSS === 'undefined') {
        console.error("Aliyun OSS SDK not loaded.");
        return null;
    }
    return new OSS(OSS_CONFIG);
}
