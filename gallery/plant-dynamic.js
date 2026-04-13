// plant-dynamic.js
// Dynamic plant detail page renderer

(function() {
    'use strict';

    const siteContent = window.UST_LEAF_CONTENT || {};
    const plantDetailContent = siteContent.ui?.plantDetail || {};
    const plantDetailText = {
        sections: {
            details: '物种资料',
            gallery: '植物相册',
            ...(plantDetailContent.sections || {})
        },
        buttons: {
            back: '← 返回',
            backToGallery: '返回植物图库',
            ...(plantDetailContent.buttons || {})
        },
        labels: {
            cnName: '中文名',
            latinName: '学名',
            family: '科名',
            type: '种类',
            synonyms: '异名',
            nativeHk: '香港原生',
            description: '形态描述',
            cap586: '《保护濒危动植物物种条例》(第586章)',
            cap96: '《林区及郊区条例》(第96章)',
            redbook: '中国植物红皮书',
            iucn: 'IUCN红色名录',
            hkSpeciesDb: '香港物种数据库',
            viewHkSpeciesDb: '查看香港物种数据库',
            sourceInfo: '资料集详情',
            ...(plantDetailContent.labels || {})
        },
        statusDisplay: {
            yes: '是',
            no: '否',
            info: '未列入',
            unknown: '未评估',
            warning: '易危 (VU)',
            ...(plantDetailContent.statusDisplay || {})
        },
        errors: {
            notFoundTitle: '植物未找到',
            missingId: '未指定植物ID。请使用格式: gallery/plant.html?id=0101',
            loadFailed: '无法加载植物数据。',
            notFoundPrefix: '未找到ID为 "',
            notFoundSuffix: '" 的植物。',
            ...(plantDetailContent.errors || {})
        }
    };

    // Get plant ID from URL parameter
    function getPlantIdFromURL() {
        const params = new URLSearchParams(window.location.search);
        return params.get('id') || '';
    }

    // Fetch plants.json
    async function fetchPlantsData() {
        try {
            const response = await fetch('../plants.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.plants || [];
        } catch (error) {
            console.error('Error fetching plants.json:', error);
            return [];
        }
    }

    // Find plant by ID
    function findPlantById(plants, plantId) {
        return plants.find(plant => plant.id === plantId);
    }

    // Format synonyms array to string
    function formatSynonyms(synonyms) {
        if (!synonyms || synonyms.length === 0) {
            return '无';
        }
        return synonyms.join('；');
    }

    // Get status display text
    function getStatusDisplay(status) {
        return plantDetailText.statusDisplay[status] || status;
    }

    function renderStaticText() {
        const detailsHeading = document.getElementById('plant-details-heading');
        const galleryHeading = document.getElementById('plant-gallery-heading');
        const backLink = document.getElementById('plant-back-link');

        if (detailsHeading) {
            detailsHeading.textContent = plantDetailText.sections.details;
        }
        if (galleryHeading) {
            galleryHeading.textContent = plantDetailText.sections.gallery;
        }
        if (backLink) {
            backLink.textContent = plantDetailText.buttons.back;
        }
    }

    // Render plant details
    function renderPlantDetails(plant) {
        const detailsList = document.getElementById('plant-details');
        if (!detailsList) return;

        const labels = plantDetailText.labels;
        const synonymsStr = formatSynonyms(plant.synonyms);
        const nativeHkDisplay = plant.native_hk ? '是' : '否';
        const cap586Display = getStatusDisplay(plant.cap586_status || 'info');
        const cap96Display = getStatusDisplay(plant.cap96_status || 'info');
        const redbookDisplay = getStatusDisplay(plant.redbook_status || 'info');

        // Build external links HTML
        let externalLinksHTML = '';
        if (plant.external_links && plant.external_links.hk_species_db) {
            externalLinksHTML = `
                        <dt>${labels.hkSpeciesDb}</dt>
                        <dd><a href="${plant.external_links.hk_species_db}" target="_blank" class="external-link">${labels.viewHkSpeciesDb}</a></dd>`;
        }

        detailsList.innerHTML = `
            <dt>${labels.cnName}</dt><dd class="plant-name">${escapeHtml(plant.cn_name)}</dd>
            <dt>${labels.latinName}</dt><dd class="scientific-name"><i>${escapeHtml(plant.latin_name)}</i></dd>
            <dt>${labels.family}</dt><dd class="family-name">${escapeHtml(plant.family || '')}</dd>
            <dt>${labels.type}</dt><dd class="plant-type">${escapeHtml(plant.type || '')}</dd>
            <dt>${labels.synonyms}</dt><dd class="synonyms">${escapeHtml(synonymsStr)}</dd>
            <dt>${labels.nativeHk}</dt><dd class="native-status">${nativeHkDisplay}</dd>
            <dt>${labels.description}</dt><dd class="description">${escapeHtml(plant.description || '')}</dd>
            <dt><a href="https://www.elegislation.gov.hk/hk/cap586" target="_blank">${labels.cap586}</a></dt>
            <dd><span class="status-cap586 status-tag ${plant.cap586_status || 'info'}">${cap586Display}</span></dd>
            <dt><a href="https://www.elegislation.gov.hk/hk/cap96" target="_blank">${labels.cap96}</a></dt>
            <dd><span class="status-cap96 status-tag ${plant.cap96_status || 'info'}">${cap96Display}</span></dd>
            <dt>${labels.redbook}</dt>
            <dd><span class="status-redbook status-tag ${plant.redbook_status || 'info'}">${redbookDisplay}</span></dd>
            <dt>${labels.iucn}</dt>
            <dd class="iucn-status">${escapeHtml(plant.iucn_status || '')}</dd>
            ${externalLinksHTML}
            <dt>${labels.sourceInfo}</dt><dd class="source-info">${escapeHtml(plant.source_info || '港科大校园植物调查')}</dd>
        `;
    }

    // Render hero section
    function renderHero(plant) {
        const heroBg = document.getElementById('hero-bg-image');
        const heroTitle = document.getElementById('plant-cn-name');
        const heroSubtitle = document.getElementById('plant-latin-name');

        if (heroTitle) heroTitle.textContent = plant.cn_name;
        if (heroSubtitle) heroSubtitle.textContent = plant.latin_name;

        if (heroBg && plant.image_folder && plant.hero_image) {
            heroBg.src = `../plant-database/${plant.image_folder}/${plant.hero_image}`;
            heroBg.alt = `${plant.cn_name} 背景`;
        }
    }

    // Render main image
    function renderMainImage(plant) {
        const mainImage = document.getElementById('main-plant-image');
        if (!mainImage) return;

        if (plant.image_folder && plant.hero_image) {
            mainImage.src = `../plant-database/${plant.image_folder}/${plant.hero_image}`;
            mainImage.alt = `${plant.cn_name} 主图`;
        }
    }

    // Render thumbnails
    function renderThumbnails(plant) {
        const container = document.getElementById('thumbnail-container');
        if (!container || !plant.images || plant.images.length === 0) return;

        container.innerHTML = '';

        plant.images.forEach((img, index) => {
            const imagePath = `../plant-database/${plant.image_folder}/${img.filename}`;
            const isActive = img.filename === plant.hero_image ? 'active' : '';
            const category = img.category || 'tree';

            const thumbnail = document.createElement('div');
            thumbnail.className = `thumbnail ${isActive}`;
            thumbnail.setAttribute('data-large-src', imagePath);
            thumbnail.setAttribute('data-category', category);

            const imgTag = document.createElement('img');
            imgTag.src = imagePath;
            imgTag.alt = `${plant.cn_name} 缩略图 ${img.filename}`;

            thumbnail.appendChild(imgTag);
            container.appendChild(thumbnail);

            // Add click handler
            thumbnail.addEventListener('click', function() {
                updateMainImage(imagePath, category);
                updateActiveThumbnail(thumbnail);
            });
        });
    }

    // Update main image when thumbnail is clicked
    function updateMainImage(imagePath, category) {
        const mainImage = document.getElementById('main-plant-image');
        const mainContainer = document.querySelector('.main-image-container');

        if (mainImage) {
            mainImage.src = imagePath;
        }

        // Update category class on container
        if (mainContainer) {
            mainContainer.className = 'main-image-container ' + category;
        }
    }

    // Update active thumbnail
    function updateActiveThumbnail(activeThumb) {
        const thumbnails = document.querySelectorAll('.thumbnail');
        thumbnails.forEach(thumb => thumb.classList.remove('active'));
        activeThumb.classList.add('active');
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Update page title
    function updatePageTitle(plant) {
        if (plant && plant.cn_name) {
            document.title = `${plant.cn_name} - 一叶知科`;
        }
    }

    // Show error message
    function showError(message) {
        const mainContent = document.querySelector('.main-content-area');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="content-card">
                    <div class="card-body">
                        <div style="text-align: center; padding: 40px;">
                            <h2>${plantDetailText.errors.notFoundTitle}</h2>
                            <p>${escapeHtml(message)}</p>
                            <p><a href="../gallery.html" class="button back-btn-inline">${plantDetailText.buttons.backToGallery}</a></p>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    // Main initialization
    async function init() {
        renderStaticText();
        const plantId = getPlantIdFromURL();
        
        if (!plantId) {
            showError(plantDetailText.errors.missingId);
            return;
        }

        // Fetch plants data
        const plants = await fetchPlantsData();
        if (plants.length === 0) {
            showError(plantDetailText.errors.loadFailed);
            return;
        }

        // Find plant
        const plant = findPlantById(plants, plantId);
        if (!plant) {
            showError(`${plantDetailText.errors.notFoundPrefix}${plantId}${plantDetailText.errors.notFoundSuffix}`);
            return;
        }

        // Render plant data
        updatePageTitle(plant);
        renderHero(plant);
        renderMainImage(plant);
        renderPlantDetails(plant);
        renderThumbnails(plant);
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
