
// Homepage Shared Album Logic
// Fetches data from Aliyun OSS and populates the gallery slider with random selections.
// Dependencies: oss-config.js (ali-oss), styles.css/ust-album.css (lightbox styles)

let homeClient = null;
let homeCurrentData = []; // Store the data for lightbox access

document.addEventListener('DOMContentLoaded', () => {
    initHomeGallery();
});

async function initHomeGallery() {
    const slider = document.getElementById('home-gallery-slider');
    const thumbs = document.getElementById('home-gallery-thumbs');

    try {
        homeClient = createOSSClient();
        if (!homeClient) {
            console.error("OSS Client failed");
            return;
        }

        // 1. List Metadata
        const result = await homeClient.list({
            prefix: 'data/',
            'max-keys': 100
        });

        if (!result.objects || result.objects.length === 0) {
            slider.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100%;color:#666;">暂无共享照片</div>';
            return;
        }

        // 2. Shuffle and Pick 10 (or fewer)
        const allFiles = result.objects.sort(() => 0.5 - Math.random());
        const selectedFiles = allFiles.slice(0, 10);

        // 3. Fetch Data
        const items = await fetchHomeMetadata(homeClient, selectedFiles);
        homeCurrentData = items; // Store globally regarding this module scope

        if (items.length === 0) {
            slider.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100%;color:#666;">暂无共享照片</div>';
            return;
        }

        // 4. Render Slider & Thumbs
        renderHomeSlider(items, slider, thumbs);

    } catch (e) {
        console.error("Error loading home gallery:", e);
        slider.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100%;color:red;">加载失败</div>';
    }
}

async function fetchHomeMetadata(client, files) {
    const promises = files.map(async (f) => {
        try {
            const res = await client.get(f.name);
            const text = new TextDecoder("utf-8").decode(res.content);
            const data = JSON.parse(text);
            data._filename = f.name;
            return data;
        } catch (e) { return null; }
    });
    return (await Promise.all(promises)).filter(d => d);
}

function renderHomeSlider(items, sliderContainer, thumbContainer) {
    sliderContainer.innerHTML = '';
    thumbContainer.innerHTML = '';

    items.forEach((data, index) => {
        // Slide
        const slide = document.createElement('div');
        slide.className = `gallery-slide ${index === 0 ? 'active' : ''}`;
        slide.dataset.index = index;

        const secureUrl = data.image_url.replace(/^http:/, 'https:');

        // Add click listener to open lightbox
        slide.style.cursor = 'pointer';
        slide.onclick = () => openHomeLightbox(data);

        slide.innerHTML = `
            <img src="${secureUrl}" alt="${data.description || '共享相册'}">
            <div style="position:absolute; bottom:20px; right:20px; background:rgba(0,0,0,0.6); color:white; padding:5px 10px; border-radius:4px; font-size:12px; pointer-events:none;">
                By ${data.photographer_name || '匿名'}
            </div>
        `;

        sliderContainer.appendChild(slide);

        // Thumbnail
        const thumb = document.createElement('div');
        thumb.className = `thumbnail ${index === 0 ? 'active' : ''}`;
        thumb.dataset.index = index;
        thumb.innerHTML = `<img src="${secureUrl}" alt="Thumb">`;

        thumb.onclick = () => switchSlide(index);

        thumbContainer.appendChild(thumb);
    });
}

function switchSlide(index) {
    const slides = document.querySelectorAll('.gallery-slide');
    const thumbs = document.querySelectorAll('.thumbnail');

    slides.forEach(s => s.classList.remove('active'));
    thumbs.forEach(t => t.classList.remove('active'));

    if (slides[index]) slides[index].classList.add('active');
    if (thumbs[index]) thumbs[index].classList.add('active');
}

// Lightbox Logic (Copied/Adapted from ust-album.js)
// We need to support Like/Comment logic here too if we want full fidelity.
// Yes, the user asked for "details page".

function openHomeLightbox(data) {
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');

    img.src = data.image_url.replace(/^http:/, 'https:');

    document.getElementById('lb-photographer').textContent = data.photographer_name;
    document.getElementById('lb-major').textContent = data.photographer_major;
    document.getElementById('lb-desc').textContent = data.description || "暂无描述";

    try {
        const d = new Date(data.created_at);
        document.getElementById('lb-date').textContent = d.getFullYear() + '/' + (d.getMonth() + 1).toString().padStart(2, '0') + '/' + d.getDate().toString().padStart(2, '0');
    } catch (e) { document.getElementById('lb-date').textContent = ""; }

    renderHomeLikeState(data);
    renderHomeComments(data);

    lightbox.style.display = 'block';
    document.body.style.overflow = 'hidden';

    // Bind Events
    const likeBtn = document.querySelector('.lb-like-btn');
    // Remove old listeners by recreating element or just overwriting onclick
    likeBtn.onclick = () => handleHomeLike(data);

    const sendBtn = document.querySelector('.lb-comment-input button');
    const input = document.querySelector('.lb-comment-input input');

    input.value = '';
    sendBtn.onclick = () => handleHomeComment(data, input.value, input);
    input.onkeypress = (e) => {
        if (e.key === 'Enter') handleHomeComment(data, input.value, input);
    }
}

function renderHomeLikeState(data) {
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

async function handleHomeLike(data) {
    if (localStorage.getItem(`liked_${data._filename}`)) return;
    data.likes = (data.likes || 0) + 1;
    localStorage.setItem(`liked_${data._filename}`, 'true');
    renderHomeLikeState(data);
    await saveHomeMetadata(data);
}

function renderHomeComments(data) {
    const list = document.querySelector('.lb-comment-list');
    list.innerHTML = '';

    if (!data.comments || data.comments.length === 0) {
        list.innerHTML = '<div class="lb-empty-comment">快来发布第一条评论吧~</div>';
        return;
    }

    data.comments.forEach(c => {
        const item = document.createElement('div');
        item.className = 'comment-item';
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
    list.scrollTop = list.scrollHeight;
}

async function handleHomeComment(data, text, inputElement) {
    if (!text || !text.trim()) return;
    const newComment = { text: text.trim(), date: new Date().toISOString() };
    data.comments = (data.comments || []).concat(newComment);
    inputElement.value = '';
    renderHomeComments(data);
    await saveHomeMetadata(data);
}

async function saveHomeMetadata(data) {
    if (!homeClient || !data._filename) return;
    try {
        const content = JSON.stringify(data);
        const blob = new Blob([content], { type: 'application/json' });
        await homeClient.put(data._filename, blob);
    } catch (e) { console.error("Save failed", e); }
}

function escapeHtml(text) {
    if (!text) return "";
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Close handlers
const closeBtn = document.querySelector('.lightbox-close');
if (closeBtn) closeBtn.addEventListener('click', closeHomeLightbox);

const lbStart = document.getElementById('lightbox');
if (lbStart) lbStart.addEventListener('click', (e) => {
    if (e.target.id === 'lightbox' || e.target.classList.contains('lightbox-content')) closeHomeLightbox();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeHomeLightbox();
});

function closeHomeLightbox() {
    const lb = document.getElementById('lightbox');
    if (lb) lb.style.display = 'none';
    document.body.style.overflow = '';
}
