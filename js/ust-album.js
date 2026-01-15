// Logic for UST Album Page (Aliyun OSS Version)
// Dependencies: oss-config.js

let currentClient = null; // Store client for reuse in interactions

document.addEventListener('DOMContentLoaded', () => {
    initGallery();
});

async function initGallery() {
    const loader = document.getElementById('gallery-loading');
    const galleryContainer = document.getElementById('album-gallery');

    if (loader) loader.classList.add('active');

    try {
        currentClient = createOSSClient();
        if (!currentClient) throw new Error("OSS client initialization failed.");

        // 1. List Metadata Files in 'data/' folder
        // max-keys: 100 (default), can be increased.
        const result = await currentClient.list({
            prefix: 'data/',
            'max-keys': 100
        });

        // 2. Check if empty
        if (!result.objects || result.objects.length === 0) {
            // Keep default hero, just show empty state in gallery
            showEmptyState(document.getElementById('masonry-grid'));
            return;
        }

        // 3. Sort Descending (Newest first)
        // Check filenames: data/170538..._abcd.json. String sort works for timestamp prefix.
        const sortedFiles = result.objects.sort((a, b) => b.name.localeCompare(a.name));

        // 4. Fetch JSON Contents (Parallel)
        // Limit concurrency if needed, but 20-50 small JSONs should be fine in browsers.
        const validData = await fetchAllMetadata(currentClient, sortedFiles);

        if (validData.length === 0) {
            showEmptyState(document.getElementById('masonry-grid'));
            return;
        }

        // 5. Render
        renderGallery(validData);
        setupHero(validData);
        setupFooterQuote(); // Init listener

    } catch (err) {
        console.error("Error loading gallery:", err);
        showErrorState(galleryContainer, err.message);
    } finally {
        if (loader) loader.classList.remove('active');
        // Show the quote after loading
        const quote = document.getElementById('album-footer-quote');
        if (quote) quote.style.display = 'block';
    }
}

// Footer Quote Logic
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

    // Click handler
    quote.addEventListener('click', () => {
        switchQuote(quote);
    });

    // Scroll Handler (Debounced)
    window.addEventListener('scroll', () => {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
            // Near bottom
            const now = Date.now();
            if (now - lastScrollSwitch > 1000) { // 1 second cooldown
                switchQuote(quote);
                lastScrollSwitch = now;
            }
        }
    });
}

function switchQuote(element) {
    quoteIndex = (quoteIndex + 1) % quoteTexts.length;
    element.textContent = quoteTexts[quoteIndex];

    // Animation
    element.style.transition = "transform 0.1s";
    element.style.transform = "scale(0.95)";
    setTimeout(() => element.style.transform = "scale(1)", 100);
}


// Helpers

function showEmptyState(container) {
    if (!container) return;
    container.innerHTML = '<div style="width:100%; text-align:center; padding:40px; color:#666;">暂无照片，快来点击右下角上传第一张吧！</div>';
}

function showErrorState(container, errorMsg) {
    const errMsg = document.createElement('div');
    Object.assign(errMsg.style, {
        color: 'red',
        textAlign: 'center',
        padding: '20px'
    });
    errMsg.innerText = "加载失败: " + errorMsg;
    container.appendChild(errMsg);
}

async function fetchAllMetadata(client, files) {
    const promises = files.map(async (fileObj) => {
        try {
            // client.get returns { content: Buffer, res: ... }
            const result = await client.get(fileObj.name);
            const text = new TextDecoder("utf-8").decode(result.content);
            const data = JSON.parse(text);
            // Attach filename for updates
            data._filename = fileObj.name;
            return data;
        } catch (e) {
            console.warn("Failed to load metadata:", fileObj.name, e);
            return null;
        }
    });

    const results = await Promise.all(promises);
    return results.filter(item => item !== null);
}

function renderGallery(images) {
    const grid = document.getElementById('masonry-grid');
    if (!grid) return;

    const columns = Array.from(grid.children);
    if (columns.length === 0) return;

    // Clear columns
    columns.forEach(col => col.innerHTML = '');

    images.forEach((imgData, index) => {
        const card = createCard(imgData);
        // Distribute to columns: 0->col1, 1->col2, 2->col3
        const colIndex = index % columns.length;
        columns[colIndex].appendChild(card);
    });
}

function createCard(data) {
    const card = document.createElement('div');
    card.className = 'gallery-card';

    // Image
    const img = document.createElement('img');
    // Ensure URL is HTTPS
    const secureUrl = data.image_url.replace(/^http:/, 'https:');
    img.src = secureUrl;
    img.alt = data.description || "科大植物";
    img.loading = "lazy";

    // Info
    const info = document.createElement('div');
    info.className = 'info';

    const name = document.createElement('div');
    name.className = 'photographer';
    name.textContent = data.photographer_name || "匿名";

    const major = document.createElement('span');
    major.className = 'major';
    major.textContent = data.photographer_major || "";

    const desc = document.createElement('div');
    desc.className = 'desc';
    desc.textContent = data.description || "";

    info.appendChild(name);
    info.appendChild(major);
    if (data.description) info.appendChild(desc);

    card.appendChild(img);
    card.appendChild(info);

    // Click event for Lightbox
    card.addEventListener('click', () => openLightbox(data));

    return card;
}

function setupHero(images) {
    if (!images || images.length === 0) return;

    // Shuffle and pick 5
    const shuffled = [...images].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);

    const heroContainer = document.getElementById('hero-carousel');
    if (!heroContainer) return;

    // Clear default placeholder ONLY if we have images
    heroContainer.innerHTML = '';

    selected.forEach((imgData, index) => {
        const div = document.createElement('div');
        div.className = `carousel-item ${index === 0 ? 'active' : ''}`;

        const img = document.createElement('img');
        img.src = imgData.image_url.replace(/^http:/, 'https:');

        const overlay = document.createElement('div');
        overlay.className = 'overlay'; // Actually used for credit now

        // Truncate description for placeholder? No, hero is just visual now basically + Credit.
        // We only show "By Name" dynamically.

        overlay.innerHTML = `
            <div class="hero-credit">
                <p>By ${imgData.photographer_name}</p>
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
    // Clear any existing interval to prevent double speed if init called twice
    if (container.dataset.interval) clearInterval(container.dataset.interval);

    // Initial state
    items[0].classList.add('active');

    const id = setInterval(() => {
        items[current].classList.remove('active');
        current = (current + 1) % items.length;
        items[current].classList.add('active');
    }, 5000);

    container.dataset.interval = id;
}

// Lightbox & Interaction Logic
let currentLightboxData = null;

function openLightbox(data) {
    currentLightboxData = data; // Store reference for updates
    const lightbox = document.getElementById('lightbox');

    // 1. Populate Info
    const img = document.getElementById('lightbox-img');
    img.src = data.image_url.replace(/^http:/, 'https:');

    document.getElementById('lb-photographer').textContent = data.photographer_name;
    document.getElementById('lb-major').textContent = data.photographer_major;
    document.getElementById('lb-desc').textContent = data.description || "暂无描述";

    // Date
    try {
        const d = new Date(data.created_at);
        document.getElementById('lb-date').textContent = d.getFullYear() + '/' + (d.getMonth() + 1).toString().padStart(2, '0') + '/' + d.getDate().toString().padStart(2, '0');
    } catch (e) { document.getElementById('lb-date').textContent = ""; }

    // 2. Setup Likes
    renderLikeState(data);

    // 3. Setup Comments
    renderComments(data);

    lightbox.style.display = 'block';
    document.body.style.overflow = 'hidden';

    // Bind Event Listeners only once? No, easy way is to unbind or just handle clean logic.
    // Better: use onclick handlers in HTML or re-assign here. Re-assigning onclick is safest/simplest for no-rebind issues.

    const likeBtn = document.querySelector('.lb-like-btn');
    likeBtn.onclick = () => handleLike(data);

    const sendBtn = document.querySelector('.lb-comment-input button');
    const input = document.querySelector('.lb-comment-input input');

    // Clear input
    input.value = '';

    sendBtn.onclick = () => handleComment(data, input.value, input);
    // Enter key
    input.onkeypress = (e) => {
        if (e.key === 'Enter') handleComment(data, input.value, input);
    }
}

function renderLikeState(data) {
    const likeBtn = document.querySelector('.lb-like-btn');
    const likeCount = data.likes || 0;
    const isLiked = localStorage.getItem(`liked_${data._filename}`);

    likeBtn.className = `lb-like-btn ${isLiked ? 'liked' : ''}`;
    likeBtn.innerHTML = `
        <svg width="20" height="20" fill="${isLiked ? '#ff4081' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
        </svg>
        <span>${likeCount > 0 ? likeCount : '点赞'}</span>
    `;
}

async function handleLike(data) {
    if (localStorage.getItem(`liked_${data._filename}`)) return; // Prevent duplicate

    // Optimistic Update
    data.likes = (data.likes || 0) + 1;
    localStorage.setItem(`liked_${data._filename}`, 'true');
    renderLikeState(data);

    // Save
    await saveMetadata(data);
}

function renderComments(data) {
    const list = document.querySelector('.lb-comment-list');
    list.innerHTML = '';

    if (!data.comments || data.comments.length === 0) {
        list.innerHTML = '<div class="lb-empty-comment">快来发布第一条评论吧~</div>';
        return;
    }

    data.comments.forEach(c => {
        const item = document.createElement('div');
        item.className = 'comment-item';

        // Random Avatar Color based on text hash
        const hash = c.text.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
        const colors = ['#FFCDD2', '#C8E6C9', '#BBDEFB', '#FFF9C4', '#E1BEE7', '#D7CCC8'];
        const color = colors[hash % colors.length];

        item.innerHTML = `
            <div class="comment-avatar" style="background-color: ${color}; display:flex; align-items:center; justify-content:center;">
                <span style="font-size:12px;">🙂</span>
            </div>
            <div class="comment-content">
                <div>${escapeHtml(c.text)}</div>
                <span class="comment-date">${new Date(c.date).toLocaleDateString()}</span>
            </div>
        `;
        list.appendChild(item);
    });

    // Auto scroll bottom
    list.scrollTop = list.scrollHeight;
}

async function handleComment(data, text, inputElement) {
    if (!text || !text.trim()) return;

    const newComment = {
        text: text.trim(),
        date: new Date().toISOString()
    };

    // Update Data
    data.comments = (data.comments || []).concat(newComment);

    // Optimistic UI interaction
    inputElement.value = '';
    renderComments(data);

    // Save
    await saveMetadata(data);
}

// Save Metadata to OSS
async function saveMetadata(data) {
    if (!currentClient || !data._filename) return;

    try {
        // Clone and remove internals if needed? No, _filename is fine to keep or remove. 
        // Better remove _filename before saving to keep JSON clean, but keeping it is harmless too.
        // Let's keep it simple.
        const content = JSON.stringify(data);
        const blob = new Blob([content], { type: 'application/json' });
        await currentClient.put(data._filename, blob);
        console.log('Metadata updated:', data._filename);
    } catch (e) {
        console.error("Failed to save metadata", e);
        // Could show toast error
    }
}

function escapeHtml(text) {
    if (!text) return "";
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

const closeBtn = document.querySelector('.lightbox-close');
if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

const lbStart = document.getElementById('lightbox');
if (lbStart) lbStart.addEventListener('click', (e) => {
    // Close if clicking on the background (not the image or info)
    // The structure is lightbox -> lightbox-content -> img, info
    // If target is lightbox or lightbox-content, close.
    if (e.target.id === 'lightbox' || e.target.classList.contains('lightbox-content')) closeLightbox();
});

// ESC Key Listener
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const lightbox = document.getElementById('lightbox');
        if (lightbox && lightbox.style.display === 'block') {
            closeLightbox();
        }
        // Also close upload modal if open
        const uploadModal = document.getElementById('upload-modal');
        if (uploadModal && uploadModal.style.display !== 'none') {
            uploadModal.style.display = 'none'; // Or trigger close button click
            document.body.style.overflow = '';
        }
    }
});

function closeLightbox() {
    document.getElementById('lightbox').style.display = 'none';
    document.body.style.overflow = '';
}
