// Deprecated compatibility wrapper.
// New pages should load:
// - js/oss-client.js
// - js/oss-public-config.js
// - js/oss-student-config.js
// or the dedicated admin config files.

(function () {
    console.warn('js/oss-config.js 已废弃，请改用按角色拆分的 OSS 配置文件。');

    window.OSS_CONFIG = window.USTLeafOSS && window.USTLeafOSS.getConfig
        ? window.USTLeafOSS.getConfig('public')
        : null;

    window.createOSSClient = function createOSSClient() {
        if (!window.USTLeafOSS || typeof window.USTLeafOSS.createClient !== 'function') {
            console.error('USTLeafOSS helper not loaded.');
            return null;
        }

        return window.USTLeafOSS.createClient('public');
    };
})();
