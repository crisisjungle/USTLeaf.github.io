(function () {
    const LEGACY_LOCATION_FALLBACK = '历史投稿，位置未记录';

    function extractObjectKeyFromUrl(url) {
        if (!url) {
            return '';
        }

        try {
            const parsed = new URL(url);
            return decodeURIComponent(parsed.pathname.replace(/^\/+/, ''));
        } catch (error) {
            return String(url).replace(/^https?:\/\/[^/]+\//, '');
        }
    }

    function normalizeRecord(record) {
        const contributorName = (record.contributor_name || record.photographer_name || '').trim();
        const note = (record.note || record.description || '').trim();
        const imageKey = record.image_key || extractObjectKeyFromUrl(record.image_url || '');

        return {
            ...record,
            id: record.id || '',
            submission_group_id: record.submission_group_id || (record.id ? `legacy-${record.id}` : 'legacy'),
            status: record.status || 'approved',
            created_at: record.created_at || '',
            reviewed_at: record.reviewed_at || null,
            contributor_name: contributorName,
            location_text: (record.location_text || '').trim(),
            plant_guess: (record.plant_guess || '').trim(),
            note,
            image_key: imageKey,
            image_url: record.image_url || '',
            source: record.source || 'student_upload'
        };
    }

    function getDisplayName(record) {
        return normalizeRecord(record).contributor_name || '匿名同学';
    }

    function getDisplayLocation(record) {
        return normalizeRecord(record).location_text || LEGACY_LOCATION_FALLBACK;
    }

    function getDisplayPlantGuess(record) {
        return normalizeRecord(record).plant_guess || '';
    }

    function getDisplayNote(record) {
        return normalizeRecord(record).note || '投稿者没有留下补充说明。';
    }

    function formatDate(value) {
        if (!value) {
            return '';
        }

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return '';
        }

        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${date.getFullYear()}/${month}/${day}`;
    }

    function escapeHtml(text) {
        if (!text) {
            return '';
        }

        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    window.USTLeafAlbum = {
        LEGACY_LOCATION_FALLBACK,
        extractObjectKeyFromUrl,
        normalizeRecord,
        getDisplayName,
        getDisplayLocation,
        getDisplayPlantGuess,
        getDisplayNote,
        formatDate,
        escapeHtml
    };
})();
