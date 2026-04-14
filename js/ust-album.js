// Shared album page logic
// Dependencies:
// - oss-client.js
// - oss-public-config.js
// - shared-album-utils.js

let currentClient = null;

document.addEventListener('DOMContentLoaded', () => {
    initGallery();
    bindAlbumLightboxClose();
});

async function initGallery() {
    const loader = document.getElementById('gallery-loading');
    const galleryContainer = document.getElementById('album-gallery');
    if (loader) loader.classList.add('active');

    try {
        currentClient = window.USTLeafOSS.createClient('public');
        if (!currentClient) {
            throw new Error(window.USTLeafOSS.getConfigErrorMessage('public'));
        }

        const metadataFiles = await listPublishedMetadataFiles(currentClient);
        if (metadataFiles.length === 0) {
            showEmptyState(document.getElementById('masonry-grid'));
            return;
        }

        const sortedFiles = metadataFiles.sort((a, b) => b.name.localeCompare(a.name));
        const validData = await fetchAllMetadata(currentClient, sortedFiles);

        if (validData.length === 0) {
            showEmptyState(document.getElementById('masonry-grid'));
            return;
        }

        renderGallery(validData);
        setupHero(validData);
        setupFooterQuote();
    } catch (error) {
        console.error('Error loading gallery:', error);
        showErrorState(galleryContainer, error.message);
    } finally {
        if (loader) loader.classList.remove('active');
        const quote = document.getElementById('album-footer-quote');
        if (quote) quote.style.display = 'block';
    }
}

async function listPublishedMetadataFiles(client) {
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

const quoteTexts = [
    "未完待续，等你执笔。",
    "上传照片，续写自然的篇章。",
    "我们需要你的镜头，来拓宽这里的边界。",
    "真的没有了 (O_o)，除非……你愿意现在贡献一张私房照（植物的）",
    "有这手速，不如去点右上角上传两张？"
];
let quoteIndex = 0;
let lastScrollSwitch = 0;

function setupFooterQuote() {
    const quote = document.getElementById('album-footer-quote');
    if (!quote) return;

    quote.addEventListener('click', () => {
        switchQuote(quote);
    });

    window.addEventListener('scroll', () => {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
            const now = Date.now();
            if (now - lastScrollSwitch > 1000) {
                switchQuote(quote);
                lastScrollSwitch = now;
            }
        }
    });
}

function switchQuote(element) {
    quoteIndex = (quoteIndex + 1) % quoteTexts.length;
    element.textContent = quoteTexts[quoteIndex];
    element.style.transition = 'transform 0.1s';
    element.style.transform = 'scale(0.95)';
    setTimeout(() => {
        element.style.transform = 'scale(1)';
    }, 100);
}

function showEmptyState(container) {
    if (!container) return;
    container.innerHTML = '<div style="width:100%; text-align:center; padding:40px; color:#666;">暂无照片，快来点击右下角提交第一批校园照片吧！</div>';
}

function showErrorState(container, errorMsg) {
    const errMsg = document.createElement('div');
    Object.assign(errMsg.style, {
        color: 'red',
        textAlign: 'center',
        padding: '20px'
    });
    errMsg.innerText = '加载失败: ' + errorMsg;
    container.appendChild(errMsg);
}

async function fetchAllMetadata(client, files) {
    const results = await Promise.all(files.map(async (fileObj) => {
        try {
            const result = await client.get(fileObj.name);
            const text = new TextDecoder('utf-8').decode(result.content);
            const data = JSON.parse(text);
            return window.USTLeafAlbum.normalizeRecord({
                ...data,
                _filename: fileObj.name
            });
        } catch (error) {
            console.warn('Failed to load metadata:', fileObj.name, error);
            return null;
        }
    }));

    return results.filter(Boolean);
}

function renderGallery(images) {
    const grid = document.getElementById('masonry-grid');
    if (!grid) return;

    const columns = Array.from(grid.children);
    if (columns.length === 0) return;

    columns.forEach((col) => {
        col.innerHTML = '';
    });

    images.forEach((imgData, index) => {
        const card = createCard(imgData);
        const colIndex = index % columns.length;
        columns[colIndex].appendChild(card);
    });
}

function createCard(record) {
    const card = document.createElement('div');
    card.className = 'gallery-card';

    const imageUrl = record.image_url || window.USTLeafOSS.getObjectUrl(null, record.image_key, { role: 'public' });

    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = record.note || record.location_text || '科大植物';
    img.loading = 'lazy';

    const info = document.createElement('div');
    info.className = 'info';

    const name = document.createElement('div');
    name.className = 'photographer';
    name.textContent = window.USTLeafAlbum.getDisplayName(record);

    const location = document.createElement('span');
    location.className = 'location';
    location.textContent = window.USTLeafAlbum.getDisplayLocation(record);

    info.appendChild(name);
    info.appendChild(location);

    if (record.note) {
        const desc = document.createElement('div');
        desc.className = 'desc';
        desc.textContent = record.note;
        info.appendChild(desc);
    }

    card.appendChild(img);
    card.appendChild(info);
    card.addEventListener('click', () => openLightbox(record));
    return card;
}

function setupHero(images) {
    if (!images || images.length === 0) return;

    const shuffled = [...images].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);
    const heroContainer = document.getElementById('hero-carousel');
    if (!heroContainer) return;

    heroContainer.innerHTML = '';

    selected.forEach((imgData, index) => {
        const div = document.createElement('div');
        div.className = `carousel-item ${index === 0 ? 'active' : ''}`;

        const img = document.createElement('img');
        img.src = imgData.image_url || window.USTLeafOSS.getObjectUrl(null, imgData.image_key, { role: 'public' });

        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        overlay.innerHTML = `
            <div class="hero-credit">
                <p>By ${window.USTLeafAlbum.escapeHtml(window.USTLeafAlbum.getDisplayName(imgData))}</p>
            </div>
        `;

        div.appendChild(img);
        div.appendChild(overlay);
        heroContainer.appendChild(div);
    });

    startCarousel(heroContainer);
}

function startCarousel(container) {
    const items = container.querySelectorAll('.carousel-item');
    if (items.length <= 1) return;

    let current = 0;
    if (container.dataset.interval) clearInterval(container.dataset.interval);
    items[0].classList.add('active');

    const id = setInterval(() => {
        items[current].classList.remove('active');
        current = (current + 1) % items.length;
        items[current].classList.add('active');
    }, 5000);

    container.dataset.interval = id;
}

function fillAlbumLightbox(record) {
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

function openLightbox(record) {
    fillAlbumLightbox(record);
    const lightbox = document.getElementById('lightbox');
    lightbox.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function bindAlbumLightboxClose() {
    const closeBtn = document.querySelector('.lightbox-close');
    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.addEventListener('click', (event) => {
            if (event.target.id === 'lightbox' || event.target.classList.contains('lightbox-content')) {
                closeLightbox();
            }
        });
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeLightbox();

            const uploadModal = document.getElementById('upload-modal');
            if (uploadModal && uploadModal.style.display !== 'none') {
                uploadModal.style.display = 'none';
                document.body.style.overflow = '';
            }
        }
    });
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.style.display = 'none';
    }
    document.body.style.overflow = '';
}
