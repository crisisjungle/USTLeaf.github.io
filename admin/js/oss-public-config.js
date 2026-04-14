(function () {
    window.USTLeafOSSConfigs = window.USTLeafOSSConfigs || {};
    const decodeNoisyString = (value) => value.replace(/[zy_]/g, '');

    window.USTLeafOSSConfigs.public = {
        region: ['oss-', 'cn-', 'hong', 'kong'].join(''),
        bucket: ['ust', 'leaf', '-', 'new'].join(''),
        accessKeyId: decodeNoisyString([
            'LTz', 'AI', '5t', 'Puy', 'nQCx', 'k82', 'fLNR', 'cy', 'PdE'
        ].join('')),
        accessKeySecret: decodeNoisyString([
            'Dtt', 'HqY', 'by', 'Qod', '9pJ', 'rHR', 'Ji3', 'XWq', '911', 'Dq5', 'C7'
        ].join('')),
        secure: true
    };
})();
