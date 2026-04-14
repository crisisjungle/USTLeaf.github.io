// Homepage shared album logic
// Dependencies:
// - oss-client.js
// - oss-public-config.js
// - shared-album-utils.js

let homeClient = null;

document.addEventListener('DOMContentLoaded', () => {
    initHomeGallery();
    bindHomeLightboxClose();
});

async function initHomeGallery() {
    const slider = document.getElementById('home-gallery-slider');
    const thumbs = document.getElementById('home-gallery-thumbs');

    try {
        homeClient = window.USTLeafOSS.createClient('public');
        if (!homeClient) {
            throw new Error(window.USTLeafOSS.getConfigErrorMessage('public'));
        }

        const metadataFiles = await listHomeMetadataFiles(homeClient);
        if (metadataFiles.length === 0) {
            slider.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100%;color:#666;">暂无共享照片</div>';
            thumbs.innerHTML = '';
            return;
        }

        const allFiles = metadataFiles.sort(() => 0.5 - Math.random()).slice(0, 10);
        const items = await fetchHomeMetadata(homeClient, allFiles);

        if (items.length === 0) {
            slider.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100%;color:#666;">暂无共享照片</div>';
            thumbs.innerHTML = '';
            return;
        }

        renderHomeSlider(items, slider, thumbs);
    } catch (error) {
        console.error('Error loading home gallery:', error);
        slider.innerHTML = `<div style="display:flex;justify-content:center;align-items:center;height:100%;color:red;">${window.USTLeafAlbum.escapeHtml(error.message || '加载失败')}</div>`;
        thumbs.innerHTML = '';
    }
}

async function listHomeMetadataFiles(client) {
    const allObjects = [];
    let marker = '';
    let hasMore = true;

    while (hasMore) {
        const result = await client.list({
            prefix: 'published/data/',
            marker,
            'max-keys': 100
        });

        if (result.objects) {
            allObjects.push(...result.objects);
        }

        hasMore = Boolean(result.isTruncated);
        marker = result.nextMarker || '';
    }

    return allObjects;
}

async function fetchHomeMetadata(client, files) {
    const records = await Promise.all(files.map(async (file) => {
        try {
            const res = await client.get(file.name);
            const text = new TextDecoder('utf-8').decode(res.content);
            const data = JSON.parse(text);
            return window.USTLeafAlbum.normalizeRecord({
                ...data,
                _filename: file.name
            });
        } catch (error) {
            console.warn('Failed to load metadata:', file.name, error);
            return null;
        }
    }));

    return records.filter(Boolean);
}

function renderHomeSlider(items, sliderContainer, thumbContainer) {
    sliderContainer.innerHTML = '';
    thumbContainer.innerHTML = '';

    items.forEach((record, index) => {
        const objectUrl = record.image_url || window.USTLeafOSS.getObjectUrl(null, record.image_key, { role: 'public' });

        const slide = document.createElement('div');
        slide.className = `gallery-slide ${index === 0 ? 'active' : ''}`;
        slide.dataset.index = index;
        slide.style.cursor = 'pointer';
        slide.onclick = () => openHomeLightbox(record);
        slide.innerHTML = `
            <img src="${objectUrl}" alt="${window.USTLeafAlbum.escapeHtml(record.note || record.location_text || '共享相册')}">
            <div style="position:absolute; bottom:20px; right:20px; background:rgba(0,0,0,0.6); color:white; padding:8px 12px; border-radius:10px; font-size:12px; pointer-events:none;">
                By ${window.USTLeafAlbum.escapeHtml(window.USTLeafAlbum.getDisplayName(record))}
            </div>
        `;
        sliderContainer.appendChild(slide);

        const thumb = document.createElement('div');
        thumb.className = `thumbnail ${index === 0 ? 'active' : ''}`;
        thumb.dataset.index = index;
        thumb.innerHTML = `<img src="${objectUrl}" alt="Thumb">`;
        thumb.onclick = () => switchSlide(index);
        thumbContainer.appendChild(thumb);
    });
}

function switchSlide(index) {
    const slides = document.querySelectorAll('.gallery-slide');
    const thumbs = document.querySelectorAll('.thumbnail');

    slides.forEach((slide) => slide.classList.remove('active'));
    thumbs.forEach((thumb) => thumb.classList.remove('active'));

    if (slides[index]) slides[index].classList.add('active');
    if (thumbs[index]) thumbs[index].classList.add('active');
}

function fillSharedLightbox(record) {
    const normalized = window.USTLeafAlbum.normalizeRecord(record);
    const imageUrl = normalized.image_url || window.USTLeafOSS.getObjectUrl(null, normalized.image_key, { role: 'public' });

    document.getElementById('lightbox-img').src = imageUrl;
    document.getElementById('lb-date').textContent = window.USTLeafAlbum.formatDate(normalized.created_at);
    document.getElementById('lb-photographer').textContent = window.USTLeafAlbum.getDisplayName(normalized);
    document.getElementById('lb-location').textContent = window.USTLeafAlbum.getDisplayLocation(normalized);
    document.getElementById('lb-desc').textContent = window.USTLeafAlbum.getDisplayNote(normalized);

    const plantGuessRow = document.getElementById('lb-plant-guess-row');
    const plantGuess = window.USTLeafAlbum.getDisplayPlantGuess(normalized);
    if (plantGuess) {
        plantGuessRow.style.display = 'flex';
        document.getElementById('lb-plant-guess').textContent = plantGuess;
    } else {
        plantGuessRow.style.display = 'none';
        document.getElementById('lb-plant-guess').textContent = '';
    }
}

function openHomeLightbox(record) {
    fillSharedLightbox(record);
    const lightbox = document.getElementById('lightbox');
    lightbox.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function bindHomeLightboxClose() {
    const closeBtn = document.querySelector('.lightbox-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeHomeLightbox);
    }

    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.addEventListener('click', (event) => {
            if (event.target.id === 'lightbox' || event.target.classList.contains('lightbox-content')) {
                closeHomeLightbox();
            }
        });
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeHomeLightbox();
        }
    });
}

function closeHomeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.style.display = 'none';
    }
    document.body.style.overflow = '';
}
