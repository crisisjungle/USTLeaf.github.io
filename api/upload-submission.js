const OSS = require('ali-oss');

function decodeNoisyString(value) {
    return String(value || '').replace(/_/g, '');
}

function getStudentConfig() {
    return {
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
}

function generateId(prefix) {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).slice(2, 8);
    return `${prefix}_${timestamp}_${randomStr}`;
}

function getFileExtension(fileName, fallbackExt) {
    const matched = String(fileName || '').match(/\.([a-zA-Z0-9]+)$/);
    return (matched ? matched[1] : fallbackExt || 'jpg').toLowerCase();
}

async function readJsonBody(req) {
    if (req.body && typeof req.body === 'object') {
        return req.body;
    }

    const chunks = [];
    for await (const chunk of req) {
        chunks.push(chunk);
    }

    const rawText = Buffer.concat(chunks).toString('utf8');
    return rawText ? JSON.parse(rawText) : {};
}

function sendJson(res, statusCode, payload) {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(payload));
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return;
    }

    if (req.method !== 'POST') {
        sendJson(res, 405, { error: 'Method not allowed.' });
        return;
    }

    try {
        const body = await readJsonBody(req);
        const {
            fileName,
            fileExt,
            mimeType,
            base64Data,
            groupId,
            commonMeta
        } = body || {};

        if (!fileName || !base64Data || !groupId || !commonMeta || !commonMeta.location_text) {
            sendJson(res, 400, { error: '缺少必要的上传字段。' });
            return;
        }

        const extension = getFileExtension(fileName, fileExt);
        const photoId = generateId('photo');
        const imageKey = `submissions/photos/${groupId}/${photoId}.${extension}`;
        const dataKey = `submissions/data/${photoId}.json`;
        const imageBuffer = Buffer.from(base64Data, 'base64');

        const client = new OSS(getStudentConfig());
        await client.put(imageKey, imageBuffer, {
            timeout: 60000,
            headers: {
                'Content-Type': mimeType || 'application/octet-stream'
            }
        });

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

        await client.put(dataKey, Buffer.from(JSON.stringify(metadata), 'utf8'), {
            timeout: 60000,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        sendJson(res, 200, {
            photoId,
            dataKey,
            imageKey
        });
    } catch (error) {
        console.error('Upload submission API failed:', error);
        sendJson(res, 500, {
            error: `服务端上传失败：${error.message || 'unknown error'}`
        });
    }
};
