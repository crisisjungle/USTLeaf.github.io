(function () {
    const PLACEHOLDER_PATTERN = /REPLACE_WITH|YOUR_|<.*?>/i;

    function getConfigs() {
        return window.USTLeafOSSConfigs || {};
    }

    function getConfig(role) {
        return getConfigs()[role] || null;
    }

    function isPlaceholder(value) {
        return !value || PLACEHOLDER_PATTERN.test(String(value));
    }

    function getMissingFields(role) {
        const config = getConfig(role);
        if (!config) {
            return ['config'];
        }

        return ['region', 'bucket', 'accessKeyId', 'accessKeySecret'].filter((field) => (
            isPlaceholder(config[field])
        ));
    }

    function isConfigured(role) {
        return getMissingFields(role).length === 0;
    }

    function getConfigErrorMessage(role) {
        const missingFields = getMissingFields(role);

        if (missingFields.length === 0) {
            return '';
        }

        if (missingFields.includes('config')) {
            return `未找到 ${role} 角色的 OSS 配置文件。`;
        }

        return `请先在 ${role} 角色的 OSS 配置文件中填写: ${missingFields.join(', ')}`;
    }

    function createClient(role) {
        if (typeof OSS === 'undefined') {
            console.error('Aliyun OSS SDK not loaded.');
            return null;
        }

        if (!isConfigured(role)) {
            console.error(getConfigErrorMessage(role));
            return null;
        }

        return new OSS(getConfig(role));
    }

    function encodeObjectKey(objectKey) {
        return String(objectKey)
            .split('/')
            .map((segment) => encodeURIComponent(segment))
            .join('/');
    }

    function buildObjectUrl(objectKey, role) {
        const config = getConfig(role) || getConfig('public');
        if (!config || !objectKey) {
            return '';
        }

        const encodedKey = encodeObjectKey(objectKey);
        const publicBaseUrl = config.publicBaseUrl && !isPlaceholder(config.publicBaseUrl)
            ? config.publicBaseUrl.replace(/\/+$/, '')
            : `https://${config.bucket}.${config.region}.aliyuncs.com`;

        return `${publicBaseUrl}/${encodedKey}`;
    }

    function getObjectUrl(client, objectKey, options = {}) {
        if (!objectKey) {
            return '';
        }

        const { preferSigned = false, expires = 3600, role = 'public' } = options;

        if (preferSigned && client && typeof client.signatureUrl === 'function') {
            try {
                return client.signatureUrl(objectKey, { expires });
            } catch (error) {
                console.warn('Failed to build signed OSS URL, falling back to public URL.', error);
            }
        }

        return buildObjectUrl(objectKey, role);
    }

    window.USTLeafOSS = {
        getConfig,
        getMissingFields,
        isConfigured,
        getConfigErrorMessage,
        createClient,
        buildObjectUrl,
        getObjectUrl
    };
})();
