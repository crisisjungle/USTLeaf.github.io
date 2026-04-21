(function () {
    window.USTLeafOSSConfigs = window.USTLeafOSSConfigs || {};
    const decodeNoisyString = (value) => value.replace(/_/g, '');

    window.USTLeafOSSConfigs.student = {
        region: ['oss-', 'cn-', 'hong', 'kong'].join(''),
        bucket: ['ust', 'leaf', '-', 'new'].join(''),
        accessKeyId: decodeNoisyString([
            'LTAI_', '5tPun_', 'QCxk82_', 'fLNRcyPdE'
        ].join('')),
        accessKeySecret: decodeNoisyString([
            'DttHqY_', 'bQod9p_', 'JrHRJi3_', 'XWq911_', 'Dq5C7'
        ].join('')),
        secure: true
    };
})();
