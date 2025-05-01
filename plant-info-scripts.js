// plant-info-scripts.js
// Image gallery logic might be added here later, 
// e.g., for a modal or lightbox when 'More Photos' is clicked.

document.addEventListener('DOMContentLoaded', function() {
    console.log('植物信息页脚本加载...');
    
    // 尝试使用多种选择器查找主图和缩略图容器
    const mainImage = document.getElementById('main-plant-image') || 
                     document.querySelector('.main-image-container img') ||
                     document.querySelector('.plant-image-main img');
                     
    const thumbnailContainer = document.querySelector('.thumbnail-container') ||
                              document.querySelector('.plant-thumbnails');
                              
    console.log('找到主图元素:', !!mainImage);
    console.log('找到缩略图容器:', !!thumbnailContainer);
    
    if (thumbnailContainer) {
        console.log('缩略图容器HTML:', thumbnailContainer.outerHTML);
        const existingThumbs = thumbnailContainer.querySelectorAll('.thumbnail');
        console.log('现有缩略图数量:', existingThumbs.length);
    }
    
    const morePhotosBtn = document.querySelector('.more-photos');
    const imageList = document.getElementById('vertical-image-list');
    const scrollUpBtn = document.querySelector('.scroll-up');
    const scrollDownBtn = document.querySelector('.scroll-down');

    // 从当前URL获取植物名称
    function getPlantNameFromURL() {
        const path = window.location.pathname;
        const filename = path.substring(path.lastIndexOf('/') + 1);
        
        // 从文件名中提取植物名称
        if (filename.startsWith('plant-info-')) {
            let plantCode = filename.replace('plant-info-', '').replace('.html', '');
            
            // 映射植物代码到中文名称
            const plantMap = {
                'yuanbai': '圆柏',
                'dujuan': '杜鹃',
                'zijing': '紫荆',
                'zhangshu': '樟树',
                'huanggeshu': '黄葛树',
                'pukui': '蒲葵',
                'wangzong': '王棕',
                'mahlian': '麻楝',
                'shili': '石栗',
                'yinzhu': '银珠',
                'xiyerong': '细叶榕',
                'taiwanxiangsi': '台湾相思',
                'taohuaxinmu': '桃花心木',
                'feidaofumu': '菲岛福木',
                'ribenkui': '日本葵'
                // 可以根据需要添加更多映射
            };
            
            return plantMap[plantCode] || plantCode;
        }
        
        return null;
    }
    
    // 从JSON文件加载植物图片
    async function loadPlantImagesFromJSON() {
        try {
            const plantName = getPlantNameFromURL();
            if (!plantName) {
                console.log('无法确定当前植物名称');
                return;
            }
            
            console.log(`正在为 ${plantName} 加载图片...`);
            
            // 内嵌的备用数据，以防JSON加载失败
            const fallbackData = {
                "plants": {
                    "木耳树": {
                        "folderPath": "images/plants/木耳树/",
                        "images": ["1.jpg", "2.jpg", "3.jpg", "4.jpg", "木耳树.jpg", "木耳树_leaf01.jpg", "木耳树_flower01.jpg"]
                    },
                    "圆柏": {
                        "folderPath": "plant-database/0333圆柏/",
                        "images": ["1106-1137_1.jpg", "1106-1137_2.jpg", "1106-1137_3.jpg", "1106-1137_4.jpg", "1106-1137_bark01.jpg", "1106-1137_bark02.jpg", "1106-1137_bark03.jpg", "1106-1137_bark04.jpg", "1106-1137_branch01.jpg", "1106-1137_branch02.jpg", "1106-1137_trunk01.jpg", "1106-1137_trunk02.jpg"]
                    },
                    "杜鹃": {
                        "folderPath": "plant-database/0314锦绣杜鹃/",
                        "images": ["0314_1s.jpg", "0314_3s.jpg", "0314_4s.jpg", "0314_5l.jpg", "0314_6l.jpg", "0314f1.JPG", "0314f2.JPG"]
                    }
                }
            };
            
            let catalog;
            
            try {
                // 获取植物目录JSON - 尝试多种路径
                const paths = ['plant-catalog.json', '/plant-catalog.json', './plant-catalog.json'];
                let response = null;
                
                for (const path of paths) {
                    try {
                        console.log(`尝试从 ${path} 加载JSON...`);
                        response = await fetch(path);
                        if (response.ok) {
                            console.log(`从 ${path} 成功加载JSON`);
                            break;
                        }
                    } catch (e) {
                        console.log(`从 ${path} 加载失败:`, e.message);
                    }
                }
                
                if (response && response.ok) {
                    catalog = await response.json();
                    console.log('成功加载植物目录JSON:', catalog);
                } else {
                    console.warn('无法从任何路径加载JSON，使用备用数据');
                    catalog = fallbackData;
                }
            } catch (e) {
                console.warn('加载JSON时出错，使用备用数据:', e);
                catalog = fallbackData;
            }
            
            const plantInfo = catalog.plants[plantName];
            
            if (!plantInfo) {
                console.log(`未找到植物 "${plantName}" 的信息，尝试使用备用数据`);
                
                // 为防止在备用数据中也没有，我们为常见植物创建默认配置
                if (plantName === '圆柏') {
                    processPlantImages("plant-database/0333圆柏/", ["1106-1137_1.jpg", "1106-1137_2.jpg", "1106-1137_3.jpg", "1106-1137_4.jpg", "1106-1137_bark01.jpg", "1106-1137_bark02.jpg"]);
                } else if (plantName === '杜鹃') {
                    // 使用备用配置，使用实际的图片文件名
                    processPlantImages("plant-database/0314锦绣杜鹃/", ["0314_1s.jpg", "0314_3s.jpg", "0314_4s.jpg", "0314_5l.jpg", "0314_6l.jpg", "0314f1.JPG", "0314f2.JPG"]);
                } else {
                    console.error(`没有 ${plantName} 的备用数据`);
                }
                return;
            }
            
            const { folderPath, images } = plantInfo;
            processPlantImages(folderPath, images);
            
        } catch (error) {
            console.error('加载植物图片时出错:', error);
        }
    }
    
    // 处理植物图片逻辑
    async function processPlantImages(folderPath, imagesFromJSON) {
        console.log(`开始处理图片，文件夹: ${folderPath}`);
        
        // 确保缩略图容器存在
        if (!thumbnailContainer) {
            console.error('未找到缩略图容器，无法添加图片');
            return;
        }
        
        // 清空现有缩略图
        thumbnailContainer.innerHTML = '';
        
        // 用于存储检查后确认存在的图片完整路径
        const foundImages = new Set();
        
        // 定义检查模式
        const namingPatterns = ['t', 'l', 'f', 'g', 'b'];
        const indices = Array.from({length: 20}, (_, i) => i + 1); // 1 to 20
        const extensions = ['.jpg', '.JPG'];
        
        // 检查新格式命名 (t1.jpg, l2.JPG, etc.)
        for (const pattern of namingPatterns) {
            for (const index of indices) {
                for (const ext of extensions) {
                    const filename = `${pattern}${index}${ext}`;
                    const fullPath = folderPath + filename;
                    try {
                        if (await checkImageExistsPromise(fullPath)) {
                            foundImages.add(fullPath);
                        }
                    } catch (e) { /*忽略检查错误*/ }
                }
            }
        }
        
        // 检查旧格式命名 (0XXX_1s.jpg, 0XXX_2l.JPG, etc.)
        const folderName = folderPath.split('/').filter(p => p.length > 0).pop();
        if (folderName && folderName.match(/^\d{4}/)) {
            const prefix = folderName.substring(0, 4);
            const oldSuffixes = ['_1s', '_2s', '_3s', '_4s', '_5s', '_1l', '_2l', '_3l', '_4l', '_5l', 'f1', 'f2', 'f3', 'b1', 'b2', 'b3', 'bark01', 'bark02', 'branch01', 'trunk01'];
            for (const suffix of oldSuffixes) {
                for (const ext of extensions) {
                    const filename = `${prefix}${suffix}${ext}`;
                    const fullPath = folderPath + filename;
                    try {
                        if (await checkImageExistsPromise(fullPath)) {
                            foundImages.add(fullPath);
                        }
                    } catch (e) { /*忽略检查错误*/ }
                }
            }
        }
        
        // 检查简单数字命名 (1.jpg, 2.JPG, etc.)
        for (let i = 1; i <= 5; i++) {
             for (const ext of extensions) {
                 const filename = `${i}${ext}`;
                 const fullPath = folderPath + filename;
                 try {
                    if (await checkImageExistsPromise(fullPath)) {
                        foundImages.add(fullPath);
                    }
                 } catch (e) { /*忽略检查错误*/ }
             }
        }
        
        // 检查JSON文件中明确列出的图片是否存在
        if (imagesFromJSON && Array.isArray(imagesFromJSON)) {
            for (const imageName of imagesFromJSON) {
                const fullPath = folderPath + imageName;
                try {
                    if (await checkImageExistsPromise(fullPath)) {
                        foundImages.add(fullPath);
                    }
                } catch (e) { /*忽略检查错误*/ }
            }
        }
        
        console.log(`共找到 ${foundImages.size} 张有效图片`);
        
        // 将Set转换为数组以便排序或处理
        const imagePathsToAdd = Array.from(foundImages);
        
        // (可选) 你可以在这里对 imagePathsToAdd进行排序，例如按名称排序
        imagePathsToAdd.sort();
        
        // 添加所有找到的有效图片作为缩略图
        const addPromises = [];
        imagePathsToAdd.forEach(imagePath => {
            const thumbnailPromise = addThumbnail(imagePath, thumbnailContainer);
            if (thumbnailPromise) {
                addPromises.push(thumbnailPromise);
            }
        });
        
        // 等待所有缩略图加载（或失败）
        Promise.allSettled(addPromises).then(results => {
            const successfullyLoadedThumbs = results
                .filter(result => result.status === 'fulfilled' && result.value)
                .map(result => result.value);
            
            console.log(`最终成功添加了 ${successfullyLoadedThumbs.length} 个缩略图`);
            
            // 在这里设置类别，确保是在缩略图添加到DOM之后
            setImageCategoriesByFilename();
            
            // 确保主图已加载
            ensureMainImageLoaded();
            
            // 稍微延迟后设置点击事件，确保DOM渲染完成
            setTimeout(() => {
                console.log('延迟后调用 setupThumbnailClickEvents');
                setupThumbnailClickEvents(); 
            }, 100); // 延迟100毫秒
        });
    }
    
    // 添加缩略图到容器
    function addThumbnail(imagePath, container, plantName = '') {
        // 如果没有提供植物名，尝试从URL获取
        if (!plantName) {
            plantName = getPlantNameFromURL() || '';
        }
        
        console.log(`为 ${plantName} 添加缩略图: ${imagePath}`);
        
        // 检查是否已存在相同图片
        const existingThumbs = container.querySelectorAll('.thumbnail');
        for (let i = 0; i < existingThumbs.length; i++) {
            const existingSrc = existingThumbs[i].getAttribute('data-large-src');
            if (existingSrc === imagePath) {
                console.log(`已存在相同图片，跳过添加: ${imagePath}`);
                return null; // 返回null表示未添加新缩略图
            }
        }
        
        // 创建新的缩略图元素
        const thumbnail = document.createElement('div');
        thumbnail.className = 'thumbnail';
        thumbnail.setAttribute('data-large-src', imagePath);
        
        const thumbnailImage = document.createElement('img');
        
        // 从图片路径提取文件名
        const fileName = imagePath.substring(imagePath.lastIndexOf('/') + 1);
        const baseName = fileName.substring(0, fileName.lastIndexOf('.'));
        
        // 设置alt文本
        const altText = plantName ? `${plantName} ${baseName} 缩略图` : `${baseName} 缩略图`;
        thumbnailImage.alt = altText;
        
        // 先添加图片到DOM
        thumbnail.appendChild(thumbnailImage);
        
        // 添加到容器
        container.appendChild(thumbnail);
        
        // 创建Promise用于检测图片是否成功加载
        const loadPromise = new Promise((resolve, reject) => {
            // 图片加载错误处理
            thumbnailImage.onerror = function() {
                console.warn(`图片加载失败，将移除: ${imagePath}`);
                // 从容器中移除加载失败的缩略图
                if (container.contains(thumbnail)) {
                    container.removeChild(thumbnail);
                }
                reject(new Error(`图片加载失败: ${imagePath}`));
            };
            
            // 图片加载成功
            thumbnailImage.onload = function() {
                resolve(thumbnail);
            };
            
            // 设置src属性触发加载
            thumbnailImage.src = imagePath;
        });
        
        return loadPromise.catch(err => {
            console.error(err.message);
            return null; // 返回null表示图片加载失败
        });
    }
    
    // 设置所有缩略图的点击事件
    function setupThumbnailClickEvents() {
        const thumbnails = document.querySelectorAll('.thumbnail');
        if (thumbnails.length === 0) {
            console.log('未找到缩略图，无需设置点击事件。');
            return;
        }
        
        console.log(`为 ${thumbnails.length} 个缩略图设置点击事件...`);
        
        thumbnails.forEach((thumbnail, idx) => {
            // 添加标记，防止重复设置事件
            if (thumbnail.hasAttribute('data-click-setup')) {
                console.log(`缩略图 #${idx+1} 已设置点击事件，跳过。`);
                return;
            }
            
            // 为缩略图设置点击事件
            thumbnail.addEventListener('click', function() {
                console.log(`点击缩略图 #${idx+1}`);
                
                // 获取大图源地址
                const largeSrc = this.dataset.largeSrc || this.getAttribute('data-large-src');
                
                if (largeSrc && mainImage) {
                    console.log(`更新主图为: ${largeSrc}`);
                    // 更新主图
                    mainImage.src = largeSrc;
                    // 更新alt文本
                    const thumbImg = this.querySelector('img');
                    if (thumbImg) {
                        mainImage.alt = thumbImg.alt.replace('缩略图', '主图');
                    }

                    // 更新缩略图激活状态
                    document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                    
                    // 获取并设置主图的类别标识
                    const category = this.getAttribute('data-category');
                    updateMainImageCategory(category);
                } else {
                    console.error('缩略图上未找到图片路径或主图元素不存在:', {
                        largeSrc,
                        mainImage: !!mainImage
                    });
                }
            });
            
            // 标记已设置点击事件
            thumbnail.setAttribute('data-click-setup', 'true');
        });
        
        console.log('缩略图点击事件设置完成');
        
        // 初始化主图的类别标识
        const activeThumb = document.querySelector('.thumbnail.active');
        if (activeThumb) {
            const category = activeThumb.getAttribute('data-category');
            updateMainImageCategory(category);
        }
    }
    
    // 更新主图的类别标识
    function updateMainImageCategory(category) {
        const mainImageContainer = document.querySelector('.main-image-container');
        if (mainImageContainer) {
            // 移除所有可能的类别类 (添加了 root)
            mainImageContainer.classList.remove('tree', 'leaf', 'bark', 'flower', 'fruit', 'root');
            
            // 添加当前类别类
            if (category) {
                mainImageContainer.classList.add(category);
            }
        }
    }
    
    // 根据文件名自动设置图片类别
    function setImageCategoriesByFilename() {
        const thumbnails = document.querySelectorAll('.thumbnail');
        
        thumbnails.forEach(thumbnail => {
            const imgSrc = thumbnail.getAttribute('data-large-src');
            if (imgSrc) {
                // 提取文件名
                const filename = imgSrc.split('/').pop();
                let category = '';
                
                // 根据文件名前缀确定类别
                if (filename.startsWith('t')) {
                    category = 'tree';
                } else if (filename.startsWith('l')) {
                    category = 'leaf';
                } else if (filename.startsWith('b')) {
                    category = 'bark';
                } else if (filename.startsWith('f')) {
                    category = 'flower';
                } else if (filename.startsWith('g')) {
                    category = 'fruit';
                } else if (filename.startsWith('r')) { // 新增 root 类别
                    category = 'root';
                } else {
                    // 尝试识别旧格式的文件名
                    // 例如: 0314_1s.jpg (s可能是树形), 0314_5l.jpg (l可能是叶片)
                    // 或者: 0314f1.JPG (f可能是花朵)
                    
                    if (filename.includes('_1s') || filename.includes('_2s') || 
                        filename.includes('_3s') || filename.includes('_4s') || 
                        filename.includes('_5s')) {
                        category = 'tree'; // 假设_s结尾的是树形
                    } else if (filename.includes('_1l') || filename.includes('_2l') || 
                               filename.includes('_3l') || filename.includes('_4l') || 
                               filename.includes('_5l')) {
                        category = 'leaf'; // 假设_l结尾的是叶片
                    } else if (filename.includes('f1') || filename.includes('f2') || 
                               filename.includes('f3')) {
                        category = 'flower'; // 假设包含f的是花朵
                    } else if (filename.includes('b1') || filename.includes('b2') || 
                               filename.includes('b3') || filename.includes('bark')) {
                        category = 'bark'; // 假设包含b或bark的是树皮
                    } else if (filename.match(/^\d+\.jpg$/i)) {
                        // 纯数字文件名 (例如: 1.jpg)
                        category = 'tree'; // 默认为树形
                    }
                }
                
                // 设置类别属性
                if (category && !thumbnail.hasAttribute('data-category')) {
                    thumbnail.setAttribute('data-category', category);
                }
            }
        });
        
        // 更新当前活动缩略图的主图类别
        const activeThumb = document.querySelector('.thumbnail.active');
        if (activeThumb) {
            const category = activeThumb.getAttribute('data-category');
            updateMainImageCategory(category);
        }
    }
    
    // 检查图片是否存在
    function checkImageExistsPromise(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = function() {
                resolve(true);
            };
            img.onerror = function() {
                resolve(false);
            };
            img.src = url;
        });
    }
    
    // 确保主图、hero图片已加载
    async function ensureMainImageLoaded() {
        // 如果主图已经有内容并且不是显示错误，则无需处理
        if (mainImage && mainImage.complete && mainImage.naturalWidth > 0) {
            console.log('主图已正常加载，无需更换');
            // 确保hero图片也被设置
            updateHeroImage(mainImage.src);
            return;
        }
        
        console.log('主图未加载或加载错误，尝试使用文件夹中的第一张图片');
        
        // 获取文件夹路径
        let folderPath = '';
        const morePhotosBtn = document.getElementById('more-photos-btn');
        
        if (morePhotosBtn) {
            folderPath = morePhotosBtn.getAttribute('data-folder');
        }
        
        if (!folderPath) {
            // 尝试从URL推断文件夹路径
            const path = window.location.pathname;
            const filename = path.substring(path.lastIndexOf('/') + 1);
            
            if (filename.startsWith('plant-info-')) {
                const plantCode = filename.replace('plant-info-', '').replace('.html', '');
                
                // 映射常见的代码到文件夹
                const folderMap = {
                    'dujuan': 'plant-database/0314锦绣杜鹃/',
                    'yuanbai': 'plant-database/0333圆柏/',
                    'zijing': 'plant-database/0312紫荆/',
                    'zhangshu': 'plant-database/0317樟树/',
                    'xiyerong': 'plant-database/0441细叶榕/',
                    'huanggeshu': 'plant-database/0507黄葛树/',
                    'pukui': 'plant-database/0602蒲葵/',
                    'wangzong': 'plant-database/0604王棕/',
                    'mahlian': 'plant-database/0401麻楝/',
                    'taiwanxiangsi': 'plant-database/0406台湾相思/',
                    'ribenkui': 'plant-database/0443日本葵/',
                    'feidaofumu': 'plant-database/0435菲岛福木/',
                    'taohuaxinmu': 'plant-database/0424桃花心木/',
                    'shili': 'plant-database/0313石栗/',
                    'yinzhu': 'plant-database/0316银珠/'
                };
                
                folderPath = folderMap[plantCode] || '';
            }
        }
        
        if (folderPath) {
            // 尝试不同格式的图片名称
            const possibleImageNames = [
                // 首先尝试新格式命名
                't1.jpg', 'l1.jpg', 'f1.jpg', 'g1.jpg', 'b1.jpg',
                't1.JPG', 'l1.JPG', 'f1.JPG', 'g1.JPG', 'b1.JPG',
                
                // 然后尝试旧格式命名
                '1.jpg', '1.JPG', 
                '0314_1s.jpg', '0333_1s.jpg', '0317_1s.jpg', '0312_1s.jpg', 
                '0441_1s.jpg', '0507_1s.jpg', '0602_1s.jpg', '0604_1s.jpg', 
                '0401_1s.jpg', '0406_1s.jpg', '0443_1s.jpg', '0435_1s.jpg', 
                '0424_1s.jpg', '0313_1s.jpg', '0316_1s.jpg'
            ];
            
            // 如果文件夹名包含编号，添加以该编号开头的可能文件名
            const folderName = folderPath.split('/').filter(p => p.length > 0).pop();
            if (folderName && folderName.match(/^\d{4}/)) {
                const prefix = folderName.substring(0, 4); // 例如"0314"
                possibleImageNames.push(`${prefix}_1s.jpg`, `${prefix}_1l.jpg`, `${prefix}f1.JPG`, `${prefix}b1.jpg`);
            }
            
            // 逐个尝试图片
            for (const imageName of possibleImageNames) {
                const imagePath = folderPath + imageName;
                try {
                    const exists = await checkImageExistsPromise(imagePath);
                    if (exists) {
                        console.log(`找到有效图片: ${imagePath}，设置为主图`);
                        
                        // 更新主图
                        if (mainImage) {
                            mainImage.src = imagePath;
                            const plantName = getPlantNameFromURL() || '';
                            mainImage.alt = `${plantName} 主图`;
                        }
                        
                        // 更新hero图片
                        updateHeroImage(imagePath);
                        
                        // 如果没有活动的缩略图，设置第一个缩略图为活动
                        const activeThumb = document.querySelector('.thumbnail.active');
                        if (!activeThumb) {
                            const firstThumb = document.querySelector('.thumbnail');
                            if (firstThumb) {
                                firstThumb.classList.add('active');
                            }
                        }
                        
                        // 设置图片类别
                        setFirstImageCategory(imageName);
                        break;
                    }
                } catch (error) {
                    console.error(`检查图片 ${imagePath} 时出错:`, error);
                }
            }
        }
    }
    
    // 更新hero图片
    function updateHeroImage(imagePath) {
        // 获取hero区域的背景图片
        const heroImage = document.querySelector('.plant-hero-fullscreen .hero-bg-image');
        if (heroImage && (!heroImage.complete || heroImage.naturalWidth === 0)) {
            console.log(`更新hero图片为: ${imagePath}`);
            heroImage.src = imagePath;
        }
    }
    
    // 设置第一张图片的类别
    function setFirstImageCategory(imageName) {
        let category = '';
        
        // 根据文件名确定类别
        if (imageName.startsWith('t')) {
            category = 'tree';
        } else if (imageName.startsWith('l')) {
            category = 'leaf';
        } else if (imageName.startsWith('b')) {
            category = 'bark';
        } else if (imageName.startsWith('f')) {
            category = 'flower';
        } else if (imageName.startsWith('g')) {
            category = 'fruit';
        } else if (imageName.startsWith('r')) { // 新增 root 类别
             category = 'root';
        } else if (imageName.includes('_1s') || imageName.includes('_2s')) {
            category = 'tree';
        } else if (imageName.includes('_1l') || imageName.includes('_2l')) {
            category = 'leaf';
        } else {
            category = 'tree'; // 默认为树形
        }
        
        // 更新主图容器类别
        updateMainImageCategory(category);
    }

    // --- 修改后的调用逻辑 ---
    if (thumbnailContainer) {
        // 检查HTML中是否已存在缩略图
        const existingThumbs = thumbnailContainer.querySelectorAll('.thumbnail');
        if (existingThumbs.length > 0) {
            console.log('发现HTML中已定义缩略图，跳过动态加载，直接设置事件。');
            // 如果HTML中有缩略图，直接为它们设置事件
            setImageCategoriesByFilename(); // 尝试根据文件名设置类别
            setupThumbnailClickEvents();
            // 确保主图和Hero图使用第一个缩略图
            const firstThumbSrc = existingThumbs[0].getAttribute('data-large-src');
            if (firstThumbSrc && mainImage) {
                if (!mainImage.src || mainImage.naturalWidth === 0) {
                    mainImage.src = firstThumbSrc;
                    const thumbImg = existingThumbs[0].querySelector('img');
                    if (thumbImg) mainImage.alt = thumbImg.alt.replace('缩略图', '主图');
                }
                updateHeroImage(mainImage.src); // 确保Hero图也更新
            }
            // 确保主图最终有内容 (兜底逻辑)
            ensureMainImageLoaded(); 
        } else {
            console.log('HTML中未发现缩略图，尝试动态加载...');
            // 如果HTML中没有，则尝试动态加载
            loadPlantImagesFromJSON();
        }
    } else {
        console.error('未找到缩略图容器元素。');
        // 即使没有容器，也尝试确保主图有内容
        ensureMainImageLoaded();
    }
}); 