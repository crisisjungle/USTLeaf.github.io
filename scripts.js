// 你可以在这里添加交互功能
document.addEventListener('DOMContentLoaded', function() {
    // --- 图片懒加载逻辑 ---
    const lazyImages = document.querySelectorAll('img.lazy');
    const placeholderSrc = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='; // 透明占位符

    if ("IntersectionObserver" in window) {
      let lazyImageObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            let lazyImage = entry.target;
            // 检查 data-src 是否存在且不为空
            if (lazyImage.dataset.src) {
              lazyImage.src = lazyImage.dataset.src;
              lazyImage.removeAttribute('data-src'); // 加载后移除 data-src
              lazyImage.classList.remove('lazy');    // 移除 lazy 类
              lazyImage.classList.add('lazy-loaded'); // 添加加载完成标志（可选）
              observer.unobserve(lazyImage);         // 停止观察已加载的图片
            } else {
              // 如果没有 data-src，也停止观察，避免错误
               console.warn('Lazy image has no data-src:', lazyImage);
               observer.unobserve(lazyImage);
               lazyImage.classList.remove('lazy'); 
            }
          }
        });
      });

      lazyImages.forEach(function(lazyImage) {
        // 确保图片有 src 属性（即使是占位符），否则 IntersectionObserver 可能不触发
        if (!lazyImage.src) {
          lazyImage.src = placeholderSrc;
        }
        lazyImageObserver.observe(lazyImage);
      });
    } else {
      // --- 旧浏览器回退 (Fallback) ---
      let active = false;
      const lazyLoadFallback = function() {
        if (active === false) {
          active = true;
          setTimeout(function() {
            let remainingLazyImages = document.querySelectorAll('img.lazy'); // 需要重新查询
            remainingLazyImages.forEach(function(lazyImage) {
              if ((lazyImage.getBoundingClientRect().top <= window.innerHeight && lazyImage.getBoundingClientRect().bottom >= 0) && getComputedStyle(lazyImage).display !== "none") {
                 if (lazyImage.dataset.src) {
                   lazyImage.src = lazyImage.dataset.src;
                   lazyImage.removeAttribute('data-src');
                   lazyImage.classList.remove('lazy');
                   lazyImage.classList.add('lazy-loaded');
                 } else {
                   console.warn('Lazy image has no data-src (fallback):', lazyImage);
                   lazyImage.classList.remove('lazy'); 
                 }
              }
            });
            active = false;
            // 如果没有更多懒加载图片，移除事件监听器
            if (document.querySelectorAll('img.lazy').length === 0) {
              document.removeEventListener("scroll", lazyLoadFallback);
              window.removeEventListener("resize", lazyLoadFallback);
              window.removeEventListener("orientationchange", lazyLoadFallback);
            }
          }, 200); // 节流
        }
      };

      document.addEventListener("scroll", lazyLoadFallback);
      window.addEventListener("resize", lazyLoadFallback);
      window.addEventListener("orientationchange", lazyLoadFallback);
      lazyLoadFallback(); // 初始检查
    }
    // --- 懒加载逻辑结束 ---

    // -- 全局变量和检查 --
    const body = document.body; // Get body element
    /* // 移除进入动画检查
    const urlParams = new URLSearchParams(window.location.search);
    const transitionType = urlParams.get('transition');

    // 检查并应用进入动画
    if (transitionType === 'zoom-in') {
        body.classList.add('transition-incoming-zoom-in');
        // 动画结束后移除类并清理URL
        setTimeout(() => {
            body.classList.remove('transition-incoming-zoom-in');
            history.replaceState(null, '', window.location.pathname);
        }, 600); // 匹配动画时长
    }
    */

    const isAboutPage = window.location.pathname.endsWith('about.html');
    const isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/USTLeaf/');
    const isTrailPage = window.location.pathname.endsWith('plant-trail.html');
    const isGalleryPage = window.location.pathname.endsWith('gallery.html'); // Check for gallery page
    const isPlantInfoPage = window.location.pathname.includes('plant-info-'); // Check for plant info pages
    const header = document.querySelector('header');
    const headerHeight = header?.offsetHeight || 0; // Get header height safely

    // Add body classes based on page type
    if (isHomePage) body.classList.add('is-home');
    if (isAboutPage) body.classList.add('is-about');
    if (isTrailPage) body.classList.add('is-trail');
    if (isGalleryPage) body.classList.add('is-gallery');
    if (isPlantInfoPage) body.classList.add('is-plant-info');

    // -- 通用导航链接处理 --
    const navLinks = document.querySelectorAll('nav ul li a, .logo a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            const href = this.getAttribute('href');
            const targetIsHomepageLink = href === 'index.html' || href.endsWith('/'); 

            console.log(`Navigating to: ${href}, Is homepage target: ${targetIsHomepageLink}`); 

            // 1. 目标是主页
            if (targetIsHomepageLink) {
                console.log('Homepage navigation link detected.'); 
                if (isHomePage && !href.includes('#')) {
                    event.preventDefault(); 
                    window.scrollTo({ top: 0, behavior: 'smooth' }); 
                    console.log('Already on homepage, scrolling to top.');
                } else {
                    console.log('Navigating to homepage URL via browser.');
                    // Allow default navigation
                }
                 return; 
            }

            // 2. 目标是 about 页面
            if (href.includes('about.html')) {
                console.log('About page navigation link detected.');
                const hasHash = href.includes('#');
                // 如果是带锚点的关于页面链接，允许浏览器默认跳转到对应的section
                if (hasHash) {
                    return;
                }
                // 如果是纯about页面链接且当前已在about页面，则滚动到顶部
                if (isAboutPage && href === 'about.html') {
                    event.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
                // 其他情况让浏览器处理
                return;
            }
            
            // 3. 包含锚点的链接 (非主页/About页目标)
            if (href.includes('#')) {
                const targetPage = href.split('#')[0];
                const targetId = href.split('#')[1];
                const isTargetCurrentPage = 
                    (window.location.pathname.endsWith(targetPage || '/')) || 
                    (targetPage === 'index.html' && isHomePage) || 
                    (targetPage === '' && !isHomePage && isTrailPage) || // Handles href="#id" on trail page
                    (targetPage === '' && isHomePage); // Handles href="#id" on home page

                console.log(`Anchor link detected. Target: ${href}, Is Target Current Page: ${isTargetCurrentPage}`);
                
                // 如果是当前页面内的锚点 (且非About页)
                if (isTargetCurrentPage && !isAboutPage) { 
                    console.log('Anchor link on current non-about page, attempting scroll.'); 
                    event.preventDefault();
                    const targetSection = document.getElementById(targetId);
                    if (targetSection) {
                        // 如果在植物足迹页，使用特定的滚动函数（如果存在）
                        if (isTrailPage && typeof trailScrollToSectionById === 'function') {
                             trailScrollToSectionById(targetId);
                        } else {
                            // 否则使用通用滚动
                             window.scrollTo({
                                top: targetSection.offsetTop - headerHeight,
                                behavior: 'smooth'
                            });
                        }
                    } else {
                        console.log(`Target section #${targetId} not found.`);
                    }
                } 
                // 指向其他页面的锚点，让浏览器处理
                else if (!isTargetCurrentPage) {
                    console.log('Anchor link for different page, allowing default navigation.'); 
                }
            }
            // 4. 其他普通链接，让浏览器处理
             else {
                 console.log('Normal page link, allowing default navigation.'); 
             }
        });
    });

    // -- 页面加载时处理锚点 --
    if (isHomePage && window.location.hash) {
        history.replaceState(null, '', window.location.pathname);
    }
    if (isAboutPage && window.location.hash) {
        history.replaceState(null, '', window.location.pathname);
    }

    // -- 全局返回顶部按钮 --
    const backToTopButton = document.getElementById('back-to-top');
    if (backToTopButton) {
        backToTopButton.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // -- 主页特定逻辑 --
    if (isHomePage) {
        console.log("Initializing homepage specific logic.");
        
        // 添加hero按钮转场效果 (仅保留 Trail 按钮)
        const exploreTrailBtn = document.querySelector('.hero-button[href="plant-trail.html"]');
        // const exploreGalleryBtn = document.querySelector('.hero-button[href="gallery.html"]'); // 移除 Gallery 按钮

        if (exploreTrailBtn) {
            exploreTrailBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const heroSection = document.getElementById('hero');
                const header = document.querySelector('header');
                const heroContent = heroSection?.querySelector('.hero-content');
                const heroImage = heroSection?.querySelector('.hero-image'); // 选择图片容器
                const targetHref = this.getAttribute('href');

                // 添加转场效果类
                document.body.classList.add('transition-active', 'transition-zoom-in');
                // 给特定元素添加动画触发类 (由 CSS 处理具体动画)
                if(header) header.classList.add('fade-out-effect');
                if(heroContent) heroContent.classList.add('fade-out-effect');
                if(heroImage) heroImage.classList.add('zoom-in-effect'); // 图片放大模糊

                // 动画结束后跳转到目标页面 (带参数)
                setTimeout(() => {
                    window.location.href = targetHref + '?transition=zoom-in'; // 添加参数
                }, 600); // 动画持续时间
            });
        }

        /* // 移除 Gallery 按钮的监听器
        if (exploreGalleryBtn) {
            exploreGalleryBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const heroSection = document.getElementById('hero');
                const targetHref = this.getAttribute('href');

                // 添加转场效果类 - 拉远效果
                document.body.classList.add('transition-active', 'transition-zoom-out');
                heroSection.classList.add('zoom-out-effect');

                // 动画结束后跳转到目标页面 (带参数)
                setTimeout(() => {
                    window.location.href = targetHref + '?transition=zoom-out'; // 添加参数
                }, 600); // 动画持续时间
            });
        }
        */
        
        // Hero 自动向下滚动逻辑
        let hasScrolledOffHero = false;
        const heroSection = document.getElementById('hero'); 
        const storiesSection = document.getElementById('stories');
        const handleInitialHeroScroll = (event) => {
            if (!heroSection || !storiesSection) return;
            if (!hasScrolledOffHero && event.deltaY > 0 && window.scrollY < heroSection.offsetHeight * 0.4) { 
                console.log("Initial scroll down from hero detected on homepage.");
                event.preventDefault(); 
                hasScrolledOffHero = true; 
                // Recalculate header height just before scroll
                const currentHeaderHeight = header?.offsetHeight || 0;
                window.scrollTo({ top: storiesSection.offsetTop - currentHeaderHeight, behavior: 'smooth' });
                window.removeEventListener('wheel', handleInitialHeroScroll, { passive: false });
            }
        };
        window.addEventListener('wheel', handleInitialHeroScroll, { passive: false });
        window.addEventListener('beforeunload', () => { hasScrolledOffHero = false; });
        console.log("Initial hero scroll listener added for homepage.");

        // 主页相册逻辑 (如果需要移到这里)
        const galleryElement = document.querySelector('.gallery'); 
        if (galleryElement) { 
            // ... (主页相册的 Intersection Observer 和自动播放逻辑) ...
             const gallerySlider = galleryElement.querySelector('.gallery-slider');
             const slides = galleryElement.querySelectorAll('.gallery-slide');
             const thumbnails = galleryElement.querySelectorAll('.gallery-thumbnails-bottom .thumbnail');
             let currentSlide = 0;
             let autoplayInterval = null; 
             let isGalleryVisible = false;
             
             function showSlide(index) {
                 if (!slides.length || !thumbnails.length) return;
                 slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
                 thumbnails.forEach((thumbnail, i) => thumbnail.classList.toggle('active', i === index));
                 if (thumbnails[index] && isGalleryVisible) { 
                     thumbnails[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                 }
             }
             function nextSlide() { if (!slides.length) return; currentSlide = (currentSlide + 1) % slides.length; showSlide(currentSlide); }
             function prevSlide() { if (!slides.length) return; currentSlide = (currentSlide - 1 + slides.length) % slides.length; showSlide(currentSlide); }
             function startAutoplay() { if (isGalleryVisible && !autoplayInterval) { console.log("Starting gallery autoplay"); autoplayInterval = setInterval(nextSlide, 5000); } }
             function stopAutoplay() { if (autoplayInterval) { console.log("Stopping gallery autoplay"); clearInterval(autoplayInterval); autoplayInterval = null; } }
             
             thumbnails.forEach((thumbnail, index) => {
                 thumbnail.addEventListener('click', function() {
                     stopAutoplay(); currentSlide = index; showSlide(currentSlide); setTimeout(startAutoplay, 5000);
                 });
             });
             document.addEventListener('keydown', function(e) {
                 if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
                 if (isGalleryVisible) { 
                     if (e.key === 'ArrowLeft') { stopAutoplay(); prevSlide(); setTimeout(startAutoplay, 5000); }
                     else if (e.key === 'ArrowRight') { stopAutoplay(); nextSlide(); setTimeout(startAutoplay, 5000); }
                 }
             });
             let touchStartX = 0;
             if (gallerySlider) {
                 gallerySlider.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; stopAutoplay(); });
                 gallerySlider.addEventListener('touchend', (e) => {
                     const touchEndX = e.changedTouches[0].clientX;
                     const swipeDistance = touchStartX - touchEndX;
                     const minSwipeDistance = 50;
                     if (swipeDistance > minSwipeDistance) { nextSlide(); } 
                     else if (swipeDistance < -minSwipeDistance) { prevSlide(); }
                     setTimeout(startAutoplay, 5000);
                 });
             }
             const galleryObserver = new IntersectionObserver((entries) => {
                 entries.forEach(entry => {
                     if (entry.isIntersecting) { console.log("Gallery entered viewport"); isGalleryVisible = true; startAutoplay(); }
                     else { console.log("Gallery left viewport"); isGalleryVisible = false; stopAutoplay(); }
                 });
             }, { threshold: 0.1 });
             galleryObserver.observe(galleryElement);
             showSlide(currentSlide);
        }
    }

    // -- 植物信息页特定逻辑 (合并到下方通用滚动逻辑) --
    /*
    if (isPlantInfoPage) {
        // ... (旧的 plant-info 滚动逻辑 - 已合并)
    }
    */

    // -- 植物足迹页特定逻辑 (部分合并，保留足迹特有功能) --
    if (isTrailPage) {
        console.log("Initializing plant trail page specific logic.");
        const sections = document.querySelectorAll('.full-page-image');
        const dots = document.querySelectorAll('.page-indicator .dot');
        const plantInfoCard = document.getElementById('plantInfoCard');
        const cardOverlay = document.getElementById('cardOverlay');
        const closeBtn = plantInfoCard?.querySelector('.close-btn');
        const markers = document.querySelectorAll('.marker'); // Select all markers on the page

        // 定义植物数据 (确保包含所有区域的植物)
        // TODO: 将此数据移至外部JSON文件可能更佳
        const plants = [
            // Section 1: 红鸟广场 (section-image3) - 更新图片并补充信息
            {
                id: '1', sectionId: 'section-image3',
                name: '王棕', scientificName: 'Roystonea regia',
                image: 'plant-database/0101王棕/t2.jpeg',
                family: '棕榈科 Arecaceae',
                habit: '常绿乔木',
                flowering: '4-6月',
                distribution: '原产古巴和加勒比地区，现广泛种植于全球热带地区',
                description: '高大优美的棕榈树，高可达25米。树干挺直如柱，灰白色，中部常膨大。叶为大型羽状复叶，长可达4米，小叶片线形，优雅下垂。是热带和亚热带地区最重要的观赏棕榈之一。',
                infoLink: 'plant-info-0101.html'
            },
            {
                id: '2', sectionId: 'section-image3',
                name: '假连翘', scientificName: 'Duranta erecta',
                image: 'plant-database/0107假连翘/l1.jpeg',
                family: '马鞭草科 Verbenaceae',
                habit: '常绿灌木或小乔木',
                flowering: '夏季至秋季',
                distribution: '原产美洲热带地区，现广泛栽培于热带和亚热带地区',
                description: '常绿灌木或小乔木，高2-6米。花成顶生或腋生总状花序，淡紫色或蓝紫色。果实球形浆果，成熟时金黄色，有毒但极具观赏价值。适应性强，耐修剪，常用于绿篱或独立观赏。',
                infoLink: 'plant-info-0107.html'
            },
            {
                id: '3', sectionId: 'section-image3',
                name: '红花檵木', scientificName: 'Loropetalum chinense var. rubrum',
                image: 'plant-database/0108红花檵木/l1.jpeg',
                family: '金缕梅科 Hamamelidaceae',
                habit: '常绿灌木或小乔木',
                flowering: '3-4月',
                distribution: '中国南方原生种的园艺变种',
                description: '常绿灌木或小乔木，高1-3米。叶卵形至椭圆形，叶面呈紫红色至暗红褐色。花瓣带状，鲜红色或粉红色，十分艳丽。耐寒性较强，适应性广，是优良的观赏植物。',
                infoLink: 'plant-info-0108.html'
            },
            {
                id: '4', sectionId: 'section-image3',
                name: '异叶南洋杉', scientificName: 'Araucaria heterophylla',
                image: 'plant-database/0105异叶南洋杉/t1.jpeg',
                family: '南洋杉科 Araucariaceae',
                habit: '常绿乔木',
                flowering: '5-7月',
                distribution: '原产诺福克岛，现广泛引种于全球热带和亚热带地区',
                description: '常绿乔木，树形优美，呈塔状。',
                infoLink: 'plant-info-0105.html'
            },
            {
                id: '5', sectionId: 'section-image3',
                name: '细叶榕', scientificName: 'Ficus microcarpa',
                image: 'plant-database/0102细叶榕/b1.jpeg',
                family: '桑科 Moraceae',
                habit: '常绿乔木',
                flowering: '全年',
                distribution: '亚洲热带和亚热带地区',
                description: '常绿乔木，叶片革质，适应性强。',
                infoLink: 'plant-info-0102.html'
            },
            {
                id: '6', sectionId: 'section-image3',
                name: '朱蕉', scientificName: 'Cordyline fruticosa',
                image: 'plant-database/0106朱蕉/l2.jpeg',
                family: '天门冬科 Asparagaceae',
                habit: '常绿灌木',
                flowering: '春夏季',
                distribution: '原产亚洲热带地区和太平洋岛屿',
                description: '常绿灌木，高2-3米。茎干直立，叶片披针形或椭圆状披针形，叶色多样，有绿、红、紫等多种色彩和花纹。圆锥花序顶生，花小而芳香，白色或淡紫色。喜温暖湿润环境，是受欢迎的室内外观叶植物。',
                infoLink: 'plant-info-0106.html'
            },
            {
                id: '7', sectionId: 'section-image3',
                name: '凤凰木', scientificName: 'Delonix regia',
                image: 'plant-database/0103凤凰木/t1.jpeg',
                family: '豆科 Fabaceae',
                habit: '落叶乔木',
                flowering: '5-7月',
                distribution: '原产马达加斯加，现广泛种植于热带地区',
                description: '落叶大乔木，高可达15米，树冠开展呈伞形。叶为二回羽状复叶，小叶细小。花大而艳丽，鲜红色或橙红色，花期长。果荚大型，黑褐色。是著名的热带观赏树种，有"热带火焰树"之称。',
                infoLink: 'plant-info-0103.html'
            },
            {
                id: '8', sectionId: 'section-image3',
                name: '樟树', scientificName: 'Cinnamomum camphora',
                image: 'plant-database/0104樟树/t1.jpeg',
                family: '樟科 Lauraceae',
                habit: '常绿乔木',
                flowering: '4-5月',
                distribution: '中国南方、日本、韩国等东亚地区',
                description: '大型常绿乔木，高可达30米，树冠广阔。全株具樟脑香气，为重要的药用植物和工业原料来源。叶革质，卵形，有光泽。花小，黄绿色。果实球形，成熟时蓝黑色。寿命长，树形优美，是重要的园林树种。',
                infoLink: 'plant-info-0104.html'
            },
            // Section 2: 偷情小径 (section-image1)
            {
                id: '1', sectionId: 'section-image1',
                name: '麻楝', scientificName: 'Chukrasia tabularis',
                image: 'plant-database/0331麻楝/l1.jpg',
                family: '楝科', habit: '乔木', flowering: '春末夏初', distribution: '亚洲热带',
                description: '落叶乔木，高达30米。羽状复叶，小叶卵形或长椭圆形。圆锥花序顶生，花白色或淡黄色。',
                infoLink: 'plant-info-mahlian.html'
            },
            // ... (其他偷情小径植物数据) ...
             {
                id: '2', sectionId: 'section-image1',
                name: '蒲葵', scientificName: 'Livistona chinensis',
                image: 'plant-database/0328蒲葵/t1.jpg',
                family: '棕榈科', habit: '常绿乔木', flowering: '春季', distribution: '中国南部、日本南部',
                description: '常绿乔木，高可达20米。叶扇形，深裂。肉穗花序多分枝，花小，黄绿色。果实椭圆形，成熟时蓝黑色。',
                infoLink: 'plant-info-pukui.html'
            },
            {
                id: '3', sectionId: 'section-image1',
                name: '黄葛树', scientificName: 'Ficus virens',
                image: 'plant-database/0327黄葛树/r1.jpg',
                family: '桑科', habit: '落叶乔木', flowering: '春夏季', distribution: '亚洲热带至澳大利亚',
                description: '大型落叶乔木，有气根。叶卵形或椭圆形。隐头花序生于叶腋或老枝上。',
                infoLink: 'plant-info-huanggeshu.html'
            },
             {
                id: '4', sectionId: 'section-image1',
                name: '山指甲', scientificName: 'Ligustrum sinense', // Corrected from Rhododendron
                image: 'plant-database/0307山指甲/f5.JPG',
                family: '木犀科 Oleaceae', habit: '常绿灌木或小乔木', flowering: '春末夏初', distribution: '东亚',
                description: '半常绿或常绿灌木/小乔木。叶对生，椭圆形或卵形。圆锥花序顶生，花小，白色，有芳香。',
                infoLink: 'plant-info-shanzhijia.html'
            },
             {
                id: '5', sectionId: 'section-image1',
                name: '石栗', scientificName: 'Aleurites moluccana',
                image: 'plant-database/0341石栗/t1.jpg',
                family: '大戟科', habit: '常绿乔木', flowering: '春夏季', distribution: '亚洲热带至太平洋岛屿',
                description: '常绿乔木，高达20米。叶卵形，幼叶常掌状分裂。圆锥花序顶生，花白色。果实核果状。',
                infoLink: 'plant-info-shili.html'
            },
            {
                id: '6', sectionId: 'section-image1',
                name: '锦绣杜鹃', scientificName: 'Rhododendron pulchrum', // Updated name
                image: 'plant-database/0314锦绣杜鹃/f1.jpg', // Updated path and verified filename
                family: '杜鹃花科', habit: '常绿或半常绿灌木', flowering: '春季', distribution: '园艺栽培种，广泛分布',
                description: '锦绣杜鹃是常见的园艺品种，常绿或半常绿灌木，高1-2米。叶椭圆形或卵状披针形。花冠漏斗状，色彩艳丽，通常为玫瑰红色或紫色。',
                infoLink: 'plant-info-jinxidujuan.html' // Updated link
            },
            {
                id: '7', sectionId: 'section-image1',
                name: '银珠', scientificName: 'Ardisia crenata',
                image: 'plant-database/0340银珠/t1.jpg',
                family: '紫金牛科', habit: '常绿小灌木', flowering: '夏季', distribution: '东亚、东南亚',
                description: '常绿小灌木，高1-2米。叶椭圆形，边缘波状。伞形花序顶生或腋生，花白色或粉红色。果实球形，红色。',
                infoLink: 'plant-info-yinzhu.html'
            },
             {
                id: '8', sectionId: 'section-image1',
                name: '圆柏', scientificName: 'Juniperus chinensis',
                image: 'plant-database/0333圆柏/t1.jpg',
                family: '柏科', habit: '常绿乔木或灌木', flowering: '春季', distribution: '东亚',
                description: '常绿乔木或灌木。叶有鳞形和刺形两种。球果近球形，成熟时蓝黑色，被白粉。',
                infoLink: 'plant-info-yuanbai.html'
            },
            // Section 3: 天一泉 (section-image2)
            // 注意：这里的植物信息需要根据实际情况填写
            {
                id: '1', sectionId: 'section-image2',
                name: '细叶榕', scientificName: 'Ficus microcarpa',
                image: 'plant-database/0424细叶榕/b3.JPG',
                family: '桑科', habit: '常绿乔木', flowering: '全年', distribution: '亚洲热带和亚热带',
                description: '高达20米，冠幅广阔，常有气根，叶片革质卵形至椭圆形，果实为隐头花序。',
                infoLink: 'plant-info-xiyerong.html' // 可能需要不同的链接
            },
            {
                id: '2', sectionId: 'section-image2',
                name: '日本葵', scientificName: 'Cycas revoluta',
                image: 'plant-database/0421日本葵/l3.JPG',
                family: '苏铁科', habit: '常绿棕榈状木本植物', flowering: '夏季', distribution: '日本南部、中国东南部',
                description: '茎干粗壮，圆柱形。羽状复叶簇生于茎顶。雌雄异株，雄花序圆柱状，雌花序扁球形。',
                infoLink: 'plant-info-ribenkui.html'
            },
             {
                id: '3', sectionId: 'section-image2',
                name: '菲岛福木', scientificName: 'Garcinia subelliptica',
                image: 'plant-database/0418菲岛福木/t1.JPG',
                family: '藤黄科', habit: '常绿乔木', flowering: '春夏季', distribution: '菲律宾、台湾、琉球群岛',
                description: '常绿乔木，高可达20米。叶对生，厚革质，倒卵形或椭圆形。花单性，雌雄异株。果实球形，黄色。',
                infoLink: 'plant-info-feidaofumu.html'
            },
            {
                id: '4', sectionId: 'section-image2',
                name: '桃花心木', scientificName: 'Swietenia mahagoni',
                image: 'plant-database/0417桃花心木/b1.JPG',
                family: '楝科', habit: '半常绿乔木', flowering: '春夏季', distribution: '美洲热带',
                description: '半常绿乔木，高达20米。羽状复叶，小叶卵形或披针形。圆锥花序腋生，花小，黄绿色。蒴果卵形，木质。',
                infoLink: 'plant-info-taohuaxinmu.html'
            },
            {
                id: '5', sectionId: 'section-image2',
                name: '王棕', scientificName: 'Roystonea regia',
                image: 'plant-database/0416王棕/l3.JPG',
                family: '棕榈科', habit: '常绿乔木', flowering: '春夏季', distribution: '美洲热带',
                description: '高达20–30米，树干灰白色，羽状复叶长可达4米，花小而白色，果实为橙黄色浆果。',
                infoLink: 'plant-info-wangzong.html' // 可能需要不同的链接
            },
            {
                id: '6', sectionId: 'section-image2',
                name: '蒲葵', scientificName: 'Livistona chinensis',
                image: 'plant-database/0415蒲葵/FR0A5825.JPG',
                family: '棕榈科', habit: '常绿乔木', flowering: '春季', distribution: '中国南部、日本南部',
                description: '常绿乔木，高可达20米。叶扇形，深裂。肉穗花序多分枝，花小，黄绿色。果实椭圆形，成熟时蓝黑色。',
                infoLink: 'plant-info-pukui-new.html' // 可能需要不同的链接
            },
            // ... (可以添加更多植物数据)
        ];

        let currentSectionIndex = 0;
        let isScrolling = false;
        let scrollTimeout;

        console.log(`Found ${sections.length} sections on trail page:`);
        sections.forEach((sec, idx) => console.log(`  [${idx}]: #${sec.id}`));

        dots.forEach((dot, index) => {
            if (sections[index]) {
                dot.setAttribute('data-target', sections[index].id);
            }
        });

        const heroSection = document.getElementById('section-hero'); // 获取 Hero Section

        // Specific function for scrolling within trail page by index
        function trailScrollToSectionByIndex(index) {
            hidePlantCard();
            // isScrolling is assumed true when this is called
            if (index >= 0 && index < sections.length) {
                const targetSection = sections[index];
                console.log(`Scrolling to section index: ${index}, ID: #${targetSection.id}`);
                const currentHeaderHeight = header?.offsetHeight || 0;
                window.scrollTo({
                    top: targetSection.offsetTop - currentHeaderHeight,
                    behavior: 'smooth'
                });
                currentSectionIndex = index; 
                updateActiveStates(currentSectionIndex);
                
                // Reset isScrolling AFTER the scroll animation likely completes
                setTimeout(() => { 
                    isScrolling = false; 
                    console.log(`Scrolling flag reset after section ${index} scroll.`); 
                }, 1200); // <<<< INCREASED DELAY TO 1200ms >>>>
            } else {
                console.warn(`Invalid section index: ${index}. Resetting scroll lock.`);
                isScrolling = false; // Reset immediately if the call was invalid
            }
        }
        
        // Function to scroll to Hero section
        function scrollToHero() {
            hidePlantCard();
             // isScrolling is assumed true when this is called
            console.log("Scrolling to Hero section");
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            currentSectionIndex = -1; 
            updateActiveStates(currentSectionIndex);
            
            // Reset isScrolling AFTER the scroll animation likely completes
            setTimeout(() => { 
                isScrolling = false; 
                console.log("Scrolling flag reset after hero scroll."); 
            }, 1200); // <<<< INCREASED DELAY TO 1200ms >>>>
        }

        // Specific function for scrolling within trail page by ID
        window.trailScrollToSectionById = function(targetId) {
            if (isScrolling) return; // Prevent clicks during scroll
            isScrolling = true; // Lock immediately
            if (targetId === 'section-hero') {
                scrollToHero();
            } else {
                const targetIndex = Array.from(sections).findIndex(sec => sec.id === targetId);
                if (targetIndex !== -1) {
                    trailScrollToSectionByIndex(targetIndex);
                } else {
                    console.log(`Target section #${targetId} not found for trail scroll.`);
                    isScrolling = false; // Unlock if target not found
                }
            }
        }
        
        function updateActiveStates(activeIndex) {
            // 更新页面指示器
            dots.forEach((dot, index) => {
                // 假设第一个点对应 Hero
                 const targetSectionId = dot.dataset.target;
                 let isActive = false;
                 if (activeIndex === -1 && targetSectionId === 'section-hero') {
                     isActive = true;
                 } else if (activeIndex !== -1 && sections[activeIndex] && targetSectionId === sections[activeIndex].id) {
                     isActive = true;
                 }
                 dot.classList.toggle('active', isActive);
            });
            
            // 更新快速跳转按钮状态 (稍后添加按钮后再实现)
            const quickJumpButtons = document.querySelectorAll('.quick-jump-nav button');
            quickJumpButtons.forEach(button => {
                const targetId = button.dataset.target;
                let isActive = false;
                if (activeIndex === -1 && targetId === 'section-hero') {
                    isActive = true;
                } else if (activeIndex !== -1 && sections[activeIndex] && targetId === sections[activeIndex].id) {
                    isActive = true;
                }
                button.classList.toggle('active', isActive);
            });
        }

        function trailInitCurrentSectionIndex() {
            const scrollTop = window.scrollY;
            const currentHeaderHeight = header?.offsetHeight || 0;
            let foundIndex = -1; // 默认为 Hero

            // 检查是否在 Hero 或之上
            if (heroSection && scrollTop < sections[0].offsetTop - currentHeaderHeight - 100) {
                 foundIndex = -1;
            } else {
                // 查找当前主要的 .full-page-image section
                for (let i = sections.length - 1; i >= 0; i--) {
                    if (scrollTop >= sections[i].offsetTop - currentHeaderHeight - 100) {
                        foundIndex = i;
                        break;
                    }
                }
            }
            currentSectionIndex = foundIndex;
            console.log(`Initial trail section index: ${currentSectionIndex}`);
            updateActiveStates(currentSectionIndex);
        }

        trailInitCurrentSectionIndex();

        // 滚轮事件监听 - 节流版
        window.addEventListener('wheel', function(event) {
            // Check isScrolling FIRST
            if (isScrolling) {
                event.preventDefault(); 
                console.log("滚动中，忽略");
                return;
            }
            
            // Determine target based on current index BEFORE potential scroll
            const currentIndex = currentSectionIndex; // Use the index before this scroll event
            let intendedScroll = false;
            let targetIndex = currentIndex;
            let targetIsHero = false;

            if (event.deltaY > 0) { // Downward scroll attempt
                if (currentIndex < sections.length - 1 || currentIndex === -1) { 
                    intendedScroll = true;
                    if (currentIndex === -1) { 
                        targetIndex = 0;
                    } else { 
                        targetIndex = currentIndex + 1;
                    }
                }
            } else if (event.deltaY < 0) { // Upward scroll attempt
                 if (currentIndex > 0 || currentIndex === 0 ) { 
                     intendedScroll = true;
                     if (currentIndex > 0) { 
                         targetIndex = currentIndex - 1;
                     } else if (currentIndex === 0) { 
                         targetIsHero = true;
                         targetIndex = -1; // Logical target
                     }
                 }
            }
            
            // If a scroll is intended, lock and execute
            if (intendedScroll) {
                 event.preventDefault(); 
                 isScrolling = true; // <<<<<< LOCK HERE
                 console.log(`滚轮 ${event.deltaY > 0 ? '向下' : '向上'}，触发滚动`);
                 if(targetIsHero) {
                     scrollToHero();
                 } else {
                     trailScrollToSectionByIndex(targetIndex);
                 }
            }
            // isScrolling is reset inside the scroll functions via setTimeout
        }, { passive: false });
        console.log("节流版滚轮滚动功能已初始化 (800ms解锁)");

        // 键盘事件支持 (也需要节流)
        document.addEventListener('keydown', (e) => {
             if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
             if (isScrolling) return; // Ignore keydown during scroll
            
            trailInitCurrentSectionIndex();
            const currentIndex = currentSectionIndex;
            
            let targetIndex = currentIndex;
            if (e.key === 'ArrowDown') {
                if (currentIndex === -1) {
                     targetIndex = 0;
                } else if (currentIndex < sections.length - 1) {
                     targetIndex = currentIndex + 1;
                }
            } else if (e.key === 'ArrowUp') {
                if (currentIndex > 0) {
                     targetIndex = currentIndex - 1;
                } else if (currentIndex === 0) {
                     targetIndex = -1; // Target Hero
                }
            }
            
            if (targetIndex !== currentIndex) {
                 console.log(`Trail Key ${e.key} detected, attempting scroll`);
                 if(targetIndex === -1) {
                     scrollToHero();
                 } else {
                     trailScrollToSectionByIndex(targetIndex);
                 }
            }
        });
        console.log("Trail page keydown listener updated for Hero.");

        // 触摸滑动支持 - 节流版
        let trailTouchStartY = 0;
        let trailTouchStartX = 0;
        const touchThreshold = 80; 
        
        document.addEventListener('touchstart', (e) => {
             if (!isScrolling) {
                 trailTouchStartY = e.touches[0].clientY;
                 trailTouchStartX = e.touches[0].clientX;
             } else {
                 trailTouchStartY = 0;
                 trailTouchStartX = 0;
             }
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            // Check isScrolling FIRST and ensure start points are valid
            if (isScrolling || trailTouchStartY === 0) {
                 console.log("忽略触摸结束：正在滚动或无有效起始点");
                 return; 
            }
            
            const trailTouchEndY = e.changedTouches[0].clientY;
            const trailTouchEndX = e.changedTouches[0].clientX;
            const swipeDistanceY = trailTouchStartY - trailTouchEndY;
            const swipeDistanceX = trailTouchStartX - trailTouchEndX;
            
            // Reset start points immediately
            resetTouchPosition(); 

            // Check for valid swipe (vertical and exceeds threshold)
            if (Math.abs(swipeDistanceY) < Math.abs(swipeDistanceX) || Math.abs(swipeDistanceY) < touchThreshold) {
                console.log("水平滑动或垂直滑动距离不足，忽略");
                return;
            }
            
             // Determine target based on current index BEFORE potential scroll
             const currentIndex = currentSectionIndex;
             let intendedScroll = false;
             let targetIndex = currentIndex;
             let targetIsHero = false;

            if (swipeDistanceY > 0) { // Swipe Up
                 if (currentIndex < sections.length - 1 || currentIndex === -1) { 
                     intendedScroll = true;
                     if (currentIndex === -1) {
                        targetIndex = 0;
                     } else { 
                        targetIndex = currentIndex + 1;
                     }
                 }
            } else if (swipeDistanceY < 0) { // Swipe Down
                 if (currentIndex > 0 || currentIndex === 0 ) { 
                     intendedScroll = true;
                     if (currentIndex > 0) {
                         targetIndex = currentIndex - 1;
                     } else if (currentIndex === 0) {
                         targetIsHero = true;
                         targetIndex = -1; // Logical target
                     }
                 }
            }
            
            // If a scroll is intended, lock and execute
            if (intendedScroll) {
                 // Note: preventDefault() might not be needed or effective in touchend
                 isScrolling = true; // <<<<<< LOCK HERE
                 console.log(`触摸 ${swipeDistanceY > 0 ? '向上' : '向下'}，触发滚动`);
                 if(targetIsHero) {
                     scrollToHero();
                 } else {
                     trailScrollToSectionByIndex(targetIndex);
                 }
            }
            // isScrolling is reset inside the scroll functions via setTimeout
        });
        
        function resetTouchPosition() {
            trailTouchStartY = 0; 
            trailTouchStartX = 0;
        }
        
        console.log("节流版触摸滑动功能已初始化 (800ms解锁)");

        // 页面指示器点击事件 (增加Hero处理)
        dots.forEach((dot) => {
            dot.addEventListener('click', () => {
                const targetId = dot.getAttribute('data-target');
                console.log(`Trail Dot click detected for target: #${targetId}`);
                window.trailScrollToSectionById(targetId); // 使用更新后的函数
            });
        });

        // 卡片点击事件 (保持不变，卡片只控制向下滚动)
        document.querySelectorAll('.card-container').forEach((card, index) => {
            card.addEventListener('click', () => {
                hidePlantCard(); 
                const targetIndex = Math.min(index + 1, sections.length - 1); 
                 console.log(`Trail Card click detected, attempting scroll to index ${targetIndex}`);
                 trailScrollToSectionByIndex(targetIndex);
            });
        });
        
        // 定期更新当前 Section Index (保持不变)
        setInterval(() => {
             if (!isScrolling) {
                 trailInitCurrentSectionIndex();
             }
        }, 1500); 

        // 获取所有标记并添加事件监听器
        const trailMarkers = document.querySelectorAll('.marker');
        console.log(`Found ${trailMarkers.length} markers on trail page.`);

        trailMarkers.forEach(marker => {
            marker.addEventListener('click', function(e) {
                e.stopPropagation(); 
                markers.forEach(m => m.classList.remove('active'));
                this.classList.add('active');
                
                // 获取marker数据
                const plantId = this.getAttribute('data-index');
                const infoLinkOverride = this.getAttribute('data-info-link'); // 可能的链接覆盖
                
                // 获取当前marker所在的section
                const currentSection = this.closest('.full-page-image');
                const sectionId = currentSection ? currentSection.id : null;
                
                // --- 判断是否来自 LG7 (section-image2) ---
                const isFromLG7 = sectionId === 'section-image2';
                console.log(`Marker clicked in section: ${sectionId}, Is from LG7: ${isFromLG7}`);

                // 尝试找到匹配的植物数据
                let finalPlantData = null;
                
                // 首先尝试查找包含sectionId和plantId的精确匹配
                if (sectionId) {
                    const sectionSpecificPlant = plants.find(p => p.sectionId === sectionId && p.id === plantId);
                    if (sectionSpecificPlant) {
                        finalPlantData = { ...sectionSpecificPlant };
                        console.log(`Found section-specific plant data for section ${sectionId}, plant ID ${plantId}`);
                    }
                }
                
                // 如果没有找到特定区域的植物数据，则尝试查找通用植物数据
                if (!finalPlantData) {
                    const basePlantData = plants.find(p => p.id === plantId && !p.sectionId); 
                    if (basePlantData) {
                        finalPlantData = { ...basePlantData };
                        console.log(`Using generic plant data for plant ID ${plantId}`);
                    }
                }
                
                // 如果有data-info-link属性，优先使用它
                if (finalPlantData && infoLinkOverride) {
                    finalPlantData.infoLink = infoLinkOverride;
                }
                
                // 如果找不到预设的数据，尝试从marker卡片HTML中提取
                if (!finalPlantData) {
                    const card = this.querySelector('.marker-card');
                    if (card) {
                        const imgElement = card.querySelector('img');
                        const pElement = card.querySelector('p');
                        finalPlantData = {
                            name: pElement ? pElement.textContent.trim() : '未知植物',
                            image: imgElement ? imgElement.getAttribute('src') : '',
                            scientificName: '', 
                            family: '',
                            habit: '',
                            flowering: '',
                            distribution: '',
                            description: '暂无详细描述。',
                            infoLink: infoLinkOverride || '#' // 使用data-info-link (如果存在)
                        };
                        console.log("Using fallback data from marker card HTML:", finalPlantData);
                    }
                }
                
                // 如果最终有数据，则填充并显示卡片
                if (finalPlantData) {
                    fillPlantCard(finalPlantData);
                    showPlantCard(isFromLG7); // <-- 传递标记位置信息
                } else {
                    console.error('Could not find plant data for the clicked marker.');
                    // 显示错误/默认卡片
                    fillPlantCard({ name: '信息加载失败', description: '无法找到该植物的详细信息。', image: '', infoLink: '#' });
                    showPlantCard(false); // 默认从右侧弹出错误卡片
                }
            });
        });
        console.log("Plant info card listeners added.");
    }

    // -- 通用导航栏背景渐变与阴影效果 (适用于主页, 关于, 植物信息, 植物足迹, 图库页) --
    if (isHomePage || isAboutPage || isPlantInfoPage || isTrailPage || isGalleryPage) {
        console.log(`Initializing header background effect for relevant page.`);
        const headerForEffect = document.querySelector('header');
        if (headerForEffect) {
            const maxScroll = 400; // 滚动范围
            const startFade = 10; // 开始渐变位置

            const updateHeaderStyle = () => {
                const scrollY = window.scrollY;
                if (scrollY > 0) {
                    const progress = Math.max(0, Math.min(1, (scrollY - startFade) / (maxScroll - startFade)));
                    const eased = progress * progress * (3 - 2 * progress); // cubic-bezier(0.25, 0.1, 0.25, 1.0) approximation
                    const opacity = Math.min(0.95, eased * 0.95);

                    requestAnimationFrame(() => {
                        headerForEffect.style.backgroundColor = `rgba(0, 120, 68, ${opacity})`;
                        if (scrollY > 50) {
                            headerForEffect.classList.add('has-shadow');
                        } else {
                            headerForEffect.classList.remove('has-shadow');
                        }
                    });
                } else {
                    requestAnimationFrame(() => {
                        headerForEffect.style.backgroundColor = 'transparent';
                        headerForEffect.classList.remove('has-shadow');
                    });
                }
            };

            // 初始检查
            updateHeaderStyle();

            // 添加滚动监听
            window.addEventListener('scroll', updateHeaderStyle);
            console.log('Unified header background scroll listener added.');
        }
    }

    // -- 植物信息卡片逻辑 (全局，因为它依赖于 marker 点击) --
    const plantInfoCard = document.getElementById('plantInfoCard');
    if (plantInfoCard) { // Only setup if the card exists on the page
        const cardOverlay = document.getElementById('cardOverlay');
        const closeCardBtn = document.querySelector('.plant-card-header .close-btn');
        const markers = document.querySelectorAll('.marker');
        const plants = [
            // 红鸟广场区域的植物 (新添加)
            { id: "1", sectionId: "section-image3", name: "王棕", scientificName: "Roystonea regia", family: "棕榈科 Arecaceae", habit: "常绿乔木", flowering: "4-7月", distribution: "原产古巴和中美洲，现广泛引种于全球热带和亚热带地区", description: "高大优美的棕榈树，树干挺直如柱，灰白色。", image: "plant-database/0101王棕/t2.jpeg", infoLink: "plant-info-0101.html" },
            { id: "2", sectionId: "section-image3", name: "假连翘", scientificName: "Duranta erecta", family: "马鞭草科 Verbenaceae", habit: "常绿灌木", flowering: "4-10月", distribution: "原产美洲热带和亚热带地区，现广泛引种于全球热带和亚热带地区", description: "常绿灌木，花朵紫色或白色，果实黄色。", image: "plant-database/0107假连翘/l1.jpeg", infoLink: "plant-info-0107.html" },
            { id: "3", sectionId: "section-image3", name: "红花檵木", scientificName: "Loropetalum chinense var. rubrum", family: "金缕梅科 Hamamelidaceae", habit: "常绿灌木或小乔木", flowering: "3-4月", distribution: "中国南部、日本", description: "常绿灌木或小乔木，叶色紫红，花朵粉红色或红色。", image: "plant-database/0108红花檵木/l1.jpeg", infoLink: "plant-info-0108.html" },
            { id: "4", sectionId: "section-image3", name: "异叶南洋杉", scientificName: "Araucaria heterophylla", family: "南洋杉科 Araucariaceae", habit: "常绿乔木", flowering: "5-7月", distribution: "原产诺福克岛，现广泛引种于全球热带和亚热带地区", description: "常绿乔木，树形优美，呈塔状。", image: "plant-database/0105异叶南洋杉/t1.jpeg", infoLink: "plant-info-0105.html" },
            { id: "5", sectionId: "section-image3", name: "细叶榕", scientificName: "Ficus microcarpa", family: "桑科 Moraceae", habit: "常绿乔木", flowering: "全年", distribution: "亚洲热带和亚热带地区", description: "常绿乔木，叶片革质，适应性强。", image: "plant-database/0102细叶榕/b1.jpeg", infoLink: "plant-info-0102.html" },
            { id: "6", sectionId: "section-image3", name: "朱蕉", scientificName: "Cordyline fruticosa", family: "龙舌兰科 Agavaceae", habit: "常绿灌木", flowering: "不明显", distribution: "原产亚洲东南部和太平洋岛屿，现广泛引种于全球热带和亚热带地区", description: "常绿灌木，叶色多样，常用于园林观赏。", image: "plant-database/0106朱蕉/l2.jpeg", infoLink: "plant-info-0106.html" },
            { id: "7", sectionId: "section-image3", name: "凤凰木", scientificName: "Delonix regia", family: "豆科 Fabaceae", habit: "落叶乔木", flowering: "5-7月", distribution: "原产马达加斯加，现广泛引种于全球热带地区", description: "落叶乔木，夏季开鲜艳的红色花朵。", image: "plant-database/0103凤凰木/t1.jpeg", infoLink: "plant-info-0103.html" },
            { id: "8", sectionId: "section-image3", name: "樟树", scientificName: "Cinnamomum camphora", family: "樟科 Lauraceae", habit: "常绿乔木", flowering: "4-5月", distribution: "中国南部、日本、韩国", description: "常绿乔木，全株具樟脑香气。", image: "plant-database/0104樟树/t1.jpeg", infoLink: "plant-info-0104.html" },

            // 偷情小径区域的植物
            { id: "1", sectionId: "section-image1", name: "麻楝 (Chukrasia tabularis)", family: "楝科 Meliaceae", habit: "常绿乔木", flowering: "5-6月", distribution: "热带亚洲，包括中国南部、印度和东南亚", description: "麻楝是一种高大的常绿乔木，常高达20-30米。叶子呈羽状复叶，花小而芳香。在多种环境中生长良好，树龄可达百年以上。", image: "plant-database/0331麻楝/l1.jpg", infoLink: "plant-info-mahlian.html" },
            { id: "2", sectionId: "section-image1", name: "蒲葵 (Livistona chinensis)", family: "棕榈科 Arecaceae", habit: "常绿乔木", flowering: "4-5月", distribution: "中国南部、日本、琉球群岛", description: "蒲葵是一种优雅的扇形棕榈树，树干挺直，树冠呈圆形。叶子大而圆，呈扇形，边缘下垂，形似中国传统的蒲扇，因而得名。在广东、福建、台湾等地常见于庭园种植。", image: "plant-database/0328蒲葵/t1.jpg", infoLink: "plant-info-pukui.html" },
            { id: "3", sectionId: "section-image1", name: "黄葛树 (Ficus virens)", family: "桑科 Moraceae", habit: "常绿乔木", flowering: "3-5月", distribution: "亚洲热带和亚热带地区", description: "黄葛树是一种高大的常绿乔木，树冠广阔，有气生根。叶片卵形至椭圆形，深绿色有光泽。果实小而多，成熟时呈红色或紫色。在中国南方常作为行道树或庭院树种植。", image: "plant-database/0327黄葛树/r1.jpg", infoLink: "plant-info-huanggeshu.html" },
            { id: "4", sectionId: "section-image1", name: "山指甲 (Rhododendron simsii)", family: "杜鹃花科 Ericaceae", habit: "常绿或半常绿灌木", flowering: "2-4月", distribution: "中国中南部和华南地区、越南", description: "山指甲是一种灌木，高1-3米。叶片椭圆形或卵形，花朵艳丽，颜色多变，从粉红到深红。是中国原生杜鹃花的一种，常用于园林观赏。", image: "plant-database/0307山指甲/f5.JPG", infoLink: "plant-info-shanzhijia.html" },
            { id: "5", sectionId: "section-image1", name: "石栗 (Aleurites moluccana)", family: "大戟科 Euphorbiaceae", habit: "常绿乔木", flowering: "5-7月", distribution: "东南亚、印度、太平洋岛屿", description: "石栗是一种中型至大型常绿乔木，高可达20米。叶片宽大，星状或掌状，表面有一层蜡质粉末，呈银白色。果实大而圆，有硬壳，类似于栗子，内含油性种子。在热带地区广泛种植，种子可提取油脂用于照明和食用。", image: "plant-database/0341石栗/t1.jpg", infoLink: "plant-info-shili.html" },
            { id: "6", sectionId: "section-image1", name: "锦绣杜鹃 (Rhododendron pulchrum)", family: "杜鹃花科 Ericaceae", habit: "常绿或半常绿灌木", flowering: "3-5月", distribution: "中国南部、日本", description: "锦绣杜鹃是常见的园艺品种，常绿或半常绿灌木，高1-2米。叶椭圆形或卵状披针形。花冠漏斗状，色彩艳丽，通常为玫瑰红色或紫色。", image: "plant-database/0314锦绣杜鹃/f1.jpg", infoLink: "plant-info-jinxidujuan.html" },
            { id: "7", sectionId: "section-image1", name: "银珠 (Ardisia crenata)", family: "紫金牛科 Myrsinaceae", habit: "常绿灌木", flowering: "6-8月", distribution: "中国南部、日本、朝鲜半岛", description: "银珠是一种小型常绿灌木，高度通常不超过1米。叶子深绿色有光泽，边缘有细锯齿。开小白花，结鲜红色浆果，冬季尤为醒目，故又称'十样锦'。耐阴性强，适合作为室内或阴凉处的观赏植物。", image: "plant-database/0340银珠/t1.jpg", infoLink: "plant-info-yinzhu.html" },
            { id: "8", sectionId: "section-image1", name: "圆柏 (Juniperus chinensis)", family: "柏科 Cupressaceae", habit: "常绿乔木", flowering: "3-4月", distribution: "中国北部和中部、蒙古、日本、韩国", description: "圆柏是一种常绿针叶树，可长成高大乔木或修剪成灌木形态。叶子鳞片状或针状，深绿色。球果小而圆，成熟时呈蓝黑色。适应性强，耐干旱和贫瘠土壤，常用于园林绿化和防风固沙。", image: "plant-database/0333圆柏/t1.jpg", infoLink: "plant-info-yuanbai.html" },
            
            // 天一泉区域的植物
            { id: "1", sectionId: "section-image2", name: "细叶榕", scientificName: "Ficus microcarpa", description: "常绿乔木，叶片革质，卵形至椭圆形，果实为隐头果。适应性强，常见于公园和街道两旁。", image: "plant-database/0424细叶榕/b3.JPG", infoLink: "plant-info-xiyerong.html" },
            { id: "2", sectionId: "section-image2", name: "日本葵 (Fatsia japonica)", family: "五加科 Araliaceae", habit: "常绿灌木", flowering: "10-11月", distribution: "日本、韩国、台湾", description: "日本葵是一种常绿灌木，高可达3米。叶子大而漂亮，掌状深裂，革质，深绿有光泽。花小而白，排列成伞形花序。耐阴性强，喜湿润环境，是常见的室内观叶植物，也适合作为庭院或公园的下层绿化植物。", image: "plant-database/0421日本葵/l3.JPG", infoLink: "plant-info-ribenkui.html" },
            { id: "3", sectionId: "section-image2", name: "菲岛福木 (Garcinia subelliptica)", family: "藤黄科 Clusiaceae", habit: "常绿乔木", flowering: "5-6月", distribution: "中国南部、日本琉球群岛、菲律宾", description: "菲岛福木是一种中型常绿乔木，高可达10米。树冠圆整，枝叶密集。叶片椭圆形，革质，深绿色有光泽。花小而芳香，雌雄异株。果实球形，成熟时呈橙黄色，可食用。木材坚硬，可用于建筑和家具制作。树形优美，常作为园林观赏树或行道树栽培。", image: "plant-database/0418菲岛福木/t1.JPG", infoLink: "plant-info-feidaofumu.html" },
            { id: "4", sectionId: "section-image2", name: "桃花心木 (Swietenia macrophylla)", family: "楝科 Meliaceae", habit: "常绿乔木", flowering: "4-5月", distribution: "原产中南美洲，现广泛引种于亚洲热带地区", description: "桃花心木是著名的热带珍贵用材树种，高可达45米。树干通直，树冠广展。叶为偶数羽状复叶，小叶片镰刀状长椭圆形。果实为大型木质蒴果，种子扁平有翅。木材红褐色，纹理美观，是制作高级家具的优良材料。在园林中常作为行道树或景观树种植。", image: "plant-database/0417桃花心木/b1.JPG", infoLink: "plant-info-taohuaxinmu.html" },
            { id: "5", sectionId: "section-image2", name: "王棕 (Roystonea regia)", family: "棕榈科 Arecaceae", habit: "常绿乔木", flowering: "4-7月", distribution: "原产古巴和中美洲，现广泛引种于全球热带和亚热带地区", description: "王棕是一种高大优美的棕榈树，高可达25米。树干挺直如柱，灰白色，中部常膨大。叶为大型羽状复叶，长可达4米，小叶片线形，优雅下垂。花序大型，分枝多。果实椭圆形，红色至紫黑色。是热带和亚热带地区最重要的观赏棕榈之一，常用于道路、广场和公园绿化。", image: "plant-database/0416王棕/l3.JPG", infoLink: "plant-info-wangzong.html" },
            { id: "6", sectionId: "section-image2", name: "蒲葵 (Livistona chinensis)", family: "棕榈科 Arecaceae", habit: "常绿乔木", flowering: "3-5月", distribution: "中国南部、日本、琉球群岛", description: "蒲葵是一种优雅的扇形棕榈树，树干挺直，树冠呈圆形。叶子大而圆，呈扇形，边缘下垂，形似中国传统的蒲扇，因而得名。在广东、福建、台湾等地常见于庭园种植。叶片可用于编织扇子、帽子等生活用品，树干可用于建筑和家具制作，果实和幼芽可食用，全株均有药用价值。", image: "plant-database/0415蒲葵/b1.JPG", infoLink: "plant-info-pukui-new.html" }
        ];
        
        // --- 新增：标记点击事件处理 ---
        markers.forEach(marker => {
            marker.addEventListener('click', () => {
                const index = marker.dataset.index;
                const section = marker.closest('section.full-page-image');
                const sectionId = section?.id;

                console.log(`Marker clicked: Index=${index}, SectionId=${sectionId}`);

                // 在plants数组中查找匹配的植物信息
                const plant = plants.find(p => 
                    p.id === index && p.sectionId === sectionId
                );

                if (plant) {
                    console.log('Found plant data:', plant);
                    fillPlantCard(plant);
                    showPlantCard(true); // 从左侧滑入
                } else {
                    console.error(`未找到 Index=${index}, SectionId=${sectionId} 的植物数据`);
                    // 可以选择显示一个错误信息或默认卡片
                    // fillPlantCard({ name: "信息加载错误", description: "无法找到该植物的详细信息。", image: "images/placeholder-plant.jpg" });
                    // showPlantCard(true);
                }
            });
        });
        // --- 结束：标记点击事件处理 ---

        // 检查植物图片是否存在并返回有效路径
        async function findValidPlantImage(originalPath) {
            // 如果没有提供路径，返回null
            if (!originalPath) return null;
            
            // 检查原始路径是否有效
            if (await checkImageExistsPromise(originalPath)) {
                return originalPath;
            }
            
            // 处理特定植物的特殊情况
            if (originalPath.includes('0314锦绣杜鹃')) {
                // 杜鹃备用图片
                const dujuanBackups = [
                    'plant-database/0314锦绣杜鹃/0314_1s.jpg',
                    'plant-database/0314锦绣杜鹃/0314_3s.jpg',
                    'plant-database/0314锦绣杜鹃/0314_4s.jpg'
                ];
                
                // 检查每个备用图片是否有效
                for (const backup of dujuanBackups) {
                    if (await checkImageExistsPromise(backup)) {
                        console.log('找到有效的杜鹃备用图片:', backup);
                        return backup;
                    }
                }
            }
            
            // 如果是其他植物，尝试分析文件夹路径并查找备用图片
            const folderMatch = originalPath.match(/^(.*?\/[^\/]+\/)/);
            if (folderMatch) {
                const folderPath = folderMatch[1];
                const possibleImages = [
                    `${folderPath}1.jpg`,
                    `${folderPath}1.JPG`,
                    `${folderPath}01.jpg`,
                    `${folderPath}01.JPG`
                ];
                
                // 检查可能的图片
                for (const possible of possibleImages) {
                    if (await checkImageExistsPromise(possible)) {
                        console.log('找到有效的备用图片:', possible);
                        return possible;
                    }
                }
            }
            
            // 返回默认占位图
            return 'images/placeholder-plant.jpg';
        }

        // 检查图片是否存在
        function checkImageExistsPromise(url) {
            return new Promise(resolve => {
                const img = new Image();
                img.onload = () => resolve(true);
                img.onerror = () => resolve(false);
                img.src = url;
            });
        }

        function fillPlantCard(plant) {
            const plantNameEl = document.querySelector('.plant-name');
            const scientificNameEl = document.querySelector('.plant-scientific-name');
            const imageEl = document.querySelector('.plant-image');
            const familyEl = document.querySelector('.plant-family');
            const habitEl = document.querySelector('.plant-habit');
            const floweringEl = document.querySelector('.plant-flowering');
            const distributionEl = document.querySelector('.plant-distribution');
            const descriptionEl = document.querySelector('.plant-description');
            const learnMoreBtn = document.querySelector('.learn-more-btn');

            let imagePath = plant.image || 'images/placeholder-plant.jpg'; // Default to placeholder if no path
            
            // --- Extract Common Name and Scientific Name ---
            let commonName = plant.name || '未知植物';
            let scientificName = plant.scientificName || ''; // Use existing scientificName field first if available

            // If scientificName is empty and name contains parentheses, try to extract it
            if (!scientificName && commonName.includes('(') && commonName.includes(')')) {
                const openParenIndex = commonName.indexOf('(');
                const closeParenIndex = commonName.indexOf(')');
                if (openParenIndex !== -1 && closeParenIndex > openParenIndex) {
                    scientificName = commonName.substring(openParenIndex + 1, closeParenIndex).trim();
                    commonName = commonName.substring(0, openParenIndex).trim();
                }
            }
            // --- End Extraction ---

            // 设置植物图片 (直接使用路径，不再检查或添加onerror)
            imageEl.src = imagePath; 
            imageEl.alt = commonName; // Set alt text
            
            // // 注释掉 onerror 处理
            // imageEl.onerror = function() {
            //     console.error('图片加载失败:', imagePath);
            //     imageEl.src = 'images/placeholder-plant.jpg';
            // };
            
            // // 注释掉 findValidPlantImage 调用
            // findValidPlantImage(imagePath).then(validPath => {
            //     if (validPath && validPath !== imagePath) {
            //         console.log(`图片路径从 ${imagePath} 更新为 ${validPath}`);
            //         imageEl.src = validPath;
            //     }
            // });

            // 设置提取后的名称
            plantNameEl.textContent = commonName;
            scientificNameEl.textContent = scientificName; // Set the extracted or provided scientific name

            // 设置植物详细信息
            familyEl.textContent = plant.family || '未知';
            habitEl.textContent = plant.habit || '未知';
            floweringEl.textContent = plant.flowering || '未知';
            distributionEl.textContent = plant.distribution || '未知';
            descriptionEl.textContent = plant.description || '暂无描述';
            
            // 处理"了解更多"按钮
            if (plant.infoLink && plant.infoLink !== '#') { // Check if infoLink is valid
                learnMoreBtn.href = plant.infoLink;
                learnMoreBtn.style.display = 'inline-block'; // Ensure it's visible if link exists
                // Make sure parent is visible if button is
                 const actionArea = learnMoreBtn.closest('.plant-card-action');
                 if (actionArea) {
                     actionArea.style.display = 'block'; // Or 'flex', depending on layout needs
                 }
            } else {
                learnMoreBtn.style.display = 'none'; // Hide button if no valid link
                 // Optionally hide the parent action area too
                 const actionArea = learnMoreBtn.closest('.plant-card-action');
                 if (actionArea) {
                     actionArea.style.display = 'none'; 
                 }
            }
            
            // // 显示植物卡片 (这部分逻辑应该在调用 fillPlantCard 的地方处理，这里不需要)
            // const plantInfoCard = document.getElementById('plantInfoCard');
            // plantInfoCard.classList.add('active');
        }
        
        function showPlantCard(fromLeft = false) { 
            // 1. 确保 .show 类被移除，这样我们总是从隐藏状态开始
            plantInfoCard.classList.remove('show');

            // 2. 根据 fromLeft 添加或移除 slide-from-left 类
            if (fromLeft) {
                plantInfoCard.classList.add('slide-from-left');
                console.log("Added slide-from-left for showing.");
            } else {
                plantInfoCard.classList.remove('slide-from-left');
                console.log("Removed slide-from-left for showing (will slide from right by default).");
            }

            // 3. 稍微增加延迟后添加 show 类
            setTimeout(() => {
                plantInfoCard.classList.add('show');
                cardOverlay?.classList.add('show');
                document.body.style.overflow = 'hidden';
                console.log("Added .show after delay.");
            }, 60); // 增加延迟到 60ms
        }
        
        function hidePlantCard() {
            plantInfoCard.classList.remove('show');
            // 确认：只移除 show，不移除方向类
            cardOverlay?.classList.remove('show');
            document.body.style.overflow = '';
            markers.forEach(m => m.classList.remove('active'));
        }
        
        // --- 通用标记点击处理 (排除 LG7) ---
        markers.forEach(marker => {
            marker.addEventListener('click', function(e) {
                e.stopPropagation(); 

                // 获取当前marker所在的section
                const currentSection = this.closest('.full-page-image');
                const sectionId = currentSection ? currentSection.id : null;

                // 如果是 LG7 区域的标记，则跳过此通用处理器
                if (sectionId === 'section-image2') {
                    console.log("Marker in LG7 section, skipping general handler.");
                    return; 
                }
                
                // --- 以下为非 LG7 区域的处理逻辑 ---
                console.log(`General marker click in section: ${sectionId}`);
                markers.forEach(m => m.classList.remove('active'));
                this.classList.add('active');
                
                const plantId = this.getAttribute('data-index');
                const infoLinkOverride = this.getAttribute('data-info-link'); 
                
                // ... (查找植物数据的逻辑保持不变) ...
                let finalPlantData = null;
                if (sectionId) {
                    const sectionSpecificPlant = plants.find(p => p.sectionId === sectionId && p.id === plantId);
                    if (sectionSpecificPlant) finalPlantData = { ...sectionSpecificPlant };
                }
                if (!finalPlantData) {
                    const basePlantData = plants.find(p => p.id === plantId && !p.sectionId);
                    if (basePlantData) finalPlantData = { ...basePlantData };
                }
                if (finalPlantData && infoLinkOverride) finalPlantData.infoLink = infoLinkOverride;
                if (!finalPlantData) {
                     const card = this.querySelector('.marker-card');
                     if (card) {
                         const imgElement = card.querySelector('img');
                         const pElement = card.querySelector('p');
                         finalPlantData = {
                             name: pElement ? pElement.textContent.trim() : '未知植物',
                             image: imgElement ? imgElement.getAttribute('src') : '',
                             scientificName: '', family: '', habit: '', flowering: '', distribution: '', description: '暂无详细描述。', infoLink: infoLinkOverride || '#'
                         };
                     }
                }

                if (finalPlantData) {
                    fillPlantCard(finalPlantData);
                    showPlantCard(false); // 非 LG7 区域，默认从右侧滑入
                } else {
                    console.error('Could not find plant data for the clicked marker (general handler).');
                    fillPlantCard({ name: '信息加载失败', description: '无法找到该植物的详细信息。', image: '', infoLink: '#' });
                    showPlantCard(false); 
                }
            });
        });

        // --- LG7 区域标记点击处理 ---
        const lg7Markers = document.querySelectorAll('#section-image2 .marker');
        lg7Markers.forEach(marker => {
            marker.addEventListener('click', function(e) {
                e.stopPropagation();
                console.log("LG7 marker click detected.");
                markers.forEach(m => m.classList.remove('active')); // 移除所有标记的 active
                this.classList.add('active'); // 激活当前标记

                const plantId = this.getAttribute('data-index');
                const infoLinkOverride = this.getAttribute('data-info-link');

                // ... (查找植物数据的逻辑与上面类似，但可以简化，因为我们知道 sectionId) ...
                let finalPlantData = null;
                const sectionSpecificPlant = plants.find(p => p.sectionId === 'section-image2' && p.id === plantId);
                if (sectionSpecificPlant) finalPlantData = { ...sectionSpecificPlant };
                 // (如果需要，这里也可以添加从 HTML 卡片提取数据的备用逻辑)
                 if (!finalPlantData) {
                     const card = this.querySelector('.marker-card');
                     if (card) {
                         const imgElement = card.querySelector('img');
                         const pElement = card.querySelector('p');
                         finalPlantData = {
                             name: pElement ? pElement.textContent.trim() : '未知植物',
                             image: imgElement ? imgElement.getAttribute('src') : '',
                             scientificName: '', family: '', habit: '', flowering: '', distribution: '', description: '暂无详细描述。', infoLink: infoLinkOverride || '#'
                         };
                     }
                 }

                if (finalPlantData && infoLinkOverride) finalPlantData.infoLink = infoLinkOverride;

                if (finalPlantData) {
                    fillPlantCard(finalPlantData);
                    showPlantCard(true); // LG7 区域，强制从左侧滑入
                } else {
                    console.error('Could not find plant data for the clicked marker (LG7 handler).');
                    fillPlantCard({ name: '信息加载失败', description: '无法找到该植物的详细信息。', image: '', infoLink: '#' });
                    showPlantCard(true); // 即使错误，也尝试从左侧滑入
                }
            });
        });

        closeCardBtn?.addEventListener('click', hidePlantCard);
        cardOverlay?.addEventListener('click', hidePlantCard);
        document.addEventListener('click', function(e) { if (!e.target.closest('.marker') && !e.target.closest('.plant-info-card') && plantInfoCard.classList.contains('show')) { hidePlantCard(); } });
        document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && plantInfoCard.classList.contains('show')) { hidePlantCard(); } });
        console.log("Plant info card listeners added.");
    }

    // -- 导航栏背景渐变效果结束 --

    // -- 全局导航栏 Padding 控制 (这个需要保留，适用于所有页面) --
    const headerForPadding = document.querySelector('header');
    if (headerForPadding) {
        const checkScrollPadding = () => {
            if (window.scrollY > 50) {
                headerForPadding.classList.add('scrolled');
            } else {
                headerForPadding.classList.remove('scrolled');
            }
        };
        checkScrollPadding();
        window.addEventListener('scroll', checkScrollPadding);
        console.log("Global padding scroll listener added.");
    }

    // --- GALLERY PAGE SPECIFIC LOGIC --- 
    if (isGalleryPage) {
        console.log("Initializing Gallery Page specific logic.");

        // --- 0. Animate Hero Counts --- 
        const countParagraph = document.querySelector('.gallery-hero .hero-content p');

        // Function to animate number counter
        function animateCounter(targetValue, duration, updateCallback) {
            let startTimestamp = null;
            const step = (timestamp) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                const currentValue = Math.floor(progress * targetValue);
                updateCallback(currentValue);
                if (progress < 1) {
                    window.requestAnimationFrame(step);
                }
            };
            window.requestAnimationFrame(step);
        }

        // --- 1. Gallery Photo Data (Generated from file structure) ---
        const galleryPhotos = [
                       // --- 新增植物图片开始 ---
            // 0101 王棕
            { src: 'plant-database/0101王棕/b1.jpeg', plantName: '王棕', scientificName: 'Roystonea regia', category: 'b', alt: '王棕 树皮 1' },
            { src: 'plant-database/0101王棕/b2.jpeg', plantName: '王棕', scientificName: 'Roystonea regia', category: 'b', alt: '王棕 树皮 2' },
            { src: 'plant-database/0101王棕/l1.jpeg', plantName: '王棕', scientificName: 'Roystonea regia', category: 'l', alt: '王棕 叶 1' },
            { src: 'plant-database/0101王棕/l2.jpeg', plantName: '王棕', scientificName: 'Roystonea regia', category: 'l', alt: '王棕 叶 2' },
            { src: 'plant-database/0101王棕/r1.jpeg', plantName: '王棕', scientificName: 'Roystonea regia', category: 'r', alt: '王棕 根 1' },
            { src: 'plant-database/0101王棕/t1.jpeg', plantName: '王棕', scientificName: 'Roystonea regia', category: 't', alt: '王棕 树型 1' },
            { src: 'plant-database/0101王棕/t2.jpeg', plantName: '王棕', scientificName: 'Roystonea regia', category: 't', alt: '王棕 树型 2' },
            // 0102 细叶榕
            { src: 'plant-database/0102细叶榕/b1.jpeg', plantName: '细叶榕', scientificName: 'Ficus microcarpa', category: 'b', alt: '细叶榕 树皮 1' },
            { src: 'plant-database/0102细叶榕/b2.jpeg', plantName: '细叶榕', scientificName: 'Ficus microcarpa', category: 'b', alt: '细叶榕 树皮 2' },
            { src: 'plant-database/0102细叶榕/l1.jpeg', plantName: '细叶榕', scientificName: 'Ficus microcarpa', category: 'l', alt: '细叶榕 叶 1' },
            { src: 'plant-database/0102细叶榕/l2.jpeg', plantName: '细叶榕', scientificName: 'Ficus microcarpa', category: 'l', alt: '细叶榕 叶 2' },
            { src: 'plant-database/0102细叶榕/t1.jpeg', plantName: '细叶榕', scientificName: 'Ficus microcarpa', category: 't', alt: '细叶榕 树型 1' },
            { src: 'plant-database/0102细叶榕/t2.jpeg', plantName: '细叶榕', scientificName: 'Ficus microcarpa', category: 't', alt: '细叶榕 树型 2' },
            { src: 'plant-database/0102细叶榕/t3.jpeg', plantName: '细叶榕', scientificName: 'Ficus microcarpa', category: 't', alt: '细叶榕 树型 3' },
            // 0103 凤凰木
            { src: 'plant-database/0103凤凰木/b1.jpeg', plantName: '凤凰木', scientificName: 'Delonix regia', category: 'b', alt: '凤凰木 树皮 1' },
            { src: 'plant-database/0103凤凰木/l1.jpeg', plantName: '凤凰木', scientificName: 'Delonix regia', category: 'l', alt: '凤凰木 叶 1' },
            { src: 'plant-database/0103凤凰木/l2.jpeg', plantName: '凤凰木', scientificName: 'Delonix regia', category: 'l', alt: '凤凰木 叶 2' },
            { src: 'plant-database/0103凤凰木/l3.jpeg', plantName: '凤凰木', scientificName: 'Delonix regia', category: 'l', alt: '凤凰木 叶 3' },
            { src: 'plant-database/0103凤凰木/r1.jpeg', plantName: '凤凰木', scientificName: 'Delonix regia', category: 'r', alt: '凤凰木 根 1' },
            { src: 'plant-database/0103凤凰木/t1.jpeg', plantName: '凤凰木', scientificName: 'Delonix regia', category: 't', alt: '凤凰木 树型 1' },
            { src: 'plant-database/0103凤凰木/t2.jpeg', plantName: '凤凰木', scientificName: 'Delonix regia', category: 't', alt: '凤凰木 树型 2' },
            // 0104 樟树
            { src: 'plant-database/0104樟树/b1.jpeg', plantName: '樟树', scientificName: 'Cinnamomum camphora', category: 'b', alt: '樟树 树皮 1' },
            { src: 'plant-database/0104樟树/b2.jpeg', plantName: '樟树', scientificName: 'Cinnamomum camphora', category: 'b', alt: '樟树 树皮 2' },
            { src: 'plant-database/0104樟树/b3.jpeg', plantName: '樟树', scientificName: 'Cinnamomum camphora', category: 'b', alt: '樟树 树皮 3' },
            { src: 'plant-database/0104樟树/l1.jpeg', plantName: '樟树', scientificName: 'Cinnamomum camphora', category: 'l', alt: '樟树 叶 1' },
            { src: 'plant-database/0104樟树/l2.jpeg', plantName: '樟树', scientificName: 'Cinnamomum camphora', category: 'l', alt: '樟树 叶 2' },
            { src: 'plant-database/0104樟树/t1.jpeg', plantName: '樟树', scientificName: 'Cinnamomum camphora', category: 't', alt: '樟树 树型 1' },
            // 0105 异叶南洋杉
            { src: 'plant-database/0105异叶南洋杉/b1.jpeg', plantName: '异叶南洋杉', scientificName: 'Araucaria heterophylla', category: 'b', alt: '异叶南洋杉 树皮 1' },
            { src: 'plant-database/0105异叶南洋杉/l1.jpeg', plantName: '异叶南洋杉', scientificName: 'Araucaria heterophylla', category: 'l', alt: '异叶南洋杉 叶 1' },
            { src: 'plant-database/0105异叶南洋杉/l2.jpeg', plantName: '异叶南洋杉', scientificName: 'Araucaria heterophylla', category: 'l', alt: '异叶南洋杉 叶 2' },
            { src: 'plant-database/0105异叶南洋杉/l3.jpeg', plantName: '异叶南洋杉', scientificName: 'Araucaria heterophylla', category: 'l', alt: '异叶南洋杉 叶 3' },
            { src: 'plant-database/0105异叶南洋杉/t1.jpeg', plantName: '异叶南洋杉', scientificName: 'Araucaria heterophylla', category: 't', alt: '异叶南洋杉 树型 1' },
            // 0106 朱蕉
            { src: 'plant-database/0106朱蕉/l1.jpeg', plantName: '朱蕉', scientificName: 'Cordyline fruticosa', category: 'l', alt: '朱蕉 叶 1' },
            { src: 'plant-database/0106朱蕉/l2.jpeg', plantName: '朱蕉', scientificName: 'Cordyline fruticosa', category: 'l', alt: '朱蕉 叶 2' },
            { src: 'plant-database/0106朱蕉/l3.jpeg', plantName: '朱蕉', scientificName: 'Cordyline fruticosa', category: 'l', alt: '朱蕉 叶 3' },
            { src: 'plant-database/0106朱蕉/t1.jpeg', plantName: '朱蕉', scientificName: 'Cordyline fruticosa', category: 't', alt: '朱蕉 植株 1' },
            // 0107 假连翘
            { src: 'plant-database/0107假连翘/l1.jpeg', plantName: '假连翘', scientificName: 'Duranta erecta', category: 'l', alt: '假连翘 叶/花 1' },
            { src: 'plant-database/0107假连翘/l2.jpeg', plantName: '假连翘', scientificName: 'Duranta erecta', category: 'l', alt: '假连翘 叶/花 2' },
            { src: 'plant-database/0107假连翘/t1.jpeg', plantName: '假连翘', scientificName: 'Duranta erecta', category: 't', alt: '假连翘 植株 1' },
            // 0108 红花檵木
            { src: 'plant-database/0108红花檵木/l1.jpeg', plantName: '红花檵木', scientificName: 'Loropetalum chinense var. rubrum', category: 'l', alt: '红花檵木 叶/花 1' },
            { src: 'plant-database/0108红花檵木/l2.jpeg', plantName: '红花檵木', scientificName: 'Loropetalum chinense var. rubrum', category: 'l', alt: '红花檵木 叶/花 2' },
            { src: 'plant-database/0108红花檵木/t1.jpeg', plantName: '红花檵木', scientificName: 'Loropetalum chinense var. rubrum', category: 't', alt: '红花檵木 植株 1' },
            { src: 'plant-database/0108红花檵木/t2.jpeg', plantName: '红花檵木', scientificName: 'Loropetalum chinense var. rubrum', category: 't', alt: '红花檵木 植株 2' },
            // --- 新增植物图片结束 ---
            { src: 'plant-database/0415蒲葵/b1.JPG', plantName: '蒲葵', scientificName: 'Livistona chinensis', category: 'b', alt: '蒲葵 枝干/树皮' },
            { src: 'plant-database/0415蒲葵/b2.JPG', plantName: '蒲葵', scientificName: 'Livistona chinensis', category: 'b', alt: '蒲葵 枝干/树皮' },
            { src: 'plant-database/0415蒲葵/l1.JPG', plantName: '蒲葵', scientificName: 'Livistona chinensis', category: 'l', alt: '蒲葵 叶' },
            { src: 'plant-database/0415蒲葵/l2.JPG', plantName: '蒲葵', scientificName: 'Livistona chinensis', category: 'l', alt: '蒲葵 叶' },
            { src: 'plant-database/0414台湾相思/t1.JPG', plantName: '台湾相思', scientificName: 'Acacia confusa', category: 't', alt: '台湾相思 树型' },
            { src: 'plant-database/0414台湾相思/l1.JPG', plantName: '台湾相思', scientificName: 'Acacia confusa', category: 'l', alt: '台湾相思 叶' },
            { src: 'plant-database/0414台湾相思/l2.JPG', plantName: '台湾相思', scientificName: 'Acacia confusa', category: 'l', alt: '台湾相思 叶' },
            { src: 'plant-database/0414台湾相思/t2.JPG', plantName: '台湾相思', scientificName: 'Acacia confusa', category: 't', alt: '台湾相思 树型' },
            { src: 'plant-database/0341石栗/b1.jpg', plantName: '石栗', scientificName: 'Aleurites moluccana', category: 'b', alt: '石栗 枝干/树皮' },
            { src: 'plant-database/0341石栗/b2.jpg', plantName: '石栗', scientificName: 'Aleurites moluccana', category: 'b', alt: '石栗 枝干/树皮' },
            { src: 'plant-database/0341石栗/b3.jpg', plantName: '石栗', scientificName: 'Aleurites moluccana', category: 'b', alt: '石栗 枝干/树皮' },
            { src: 'plant-database/0341石栗/l1.jpg', plantName: '石栗', scientificName: 'Aleurites moluccana', category: 'l', alt: '石栗 叶' },
            { src: 'plant-database/0341石栗/l2.jpg', plantName: '石栗', scientificName: 'Aleurites moluccana', category: 'l', alt: '石栗 叶' },
            { src: 'plant-database/0341石栗/t1.jpg', plantName: '石栗', scientificName: 'Aleurites moluccana', category: 't', alt: '石栗 树型' },
            { src: 'plant-database/0341石栗/t2.jpg', plantName: '石栗', scientificName: 'Aleurites moluccana', category: 't', alt: '石栗 树型' },
            { src: 'plant-database/0340银珠/b1.jpg', plantName: '银珠', scientificName: 'Ardisia crenata', category: 'b', alt: '银珠 枝干/树皮' },
            { src: 'plant-database/0340银珠/l1.jpg', plantName: '银珠', scientificName: 'Ardisia crenata', category: 'l', alt: '银珠 叶' },
            { src: 'plant-database/0340银珠/l2.jpg', plantName: '银珠', scientificName: 'Ardisia crenata', category: 'l', alt: '银珠 叶' },
            { src: 'plant-database/0340银珠/t2.jpg', plantName: '银珠', scientificName: 'Ardisia crenata', category: 't', alt: '银珠 树型' },
            { src: 'plant-database/0340银珠/t1.jpg', plantName: '银珠', scientificName: 'Ardisia crenata', category: 't', alt: '银珠 树型' },
            { src: 'plant-database/0333圆柏/b1.jpg', plantName: '圆柏', scientificName: 'Juniperus chinensis', category: 'b', alt: '圆柏 枝干/树皮' },
            { src: 'plant-database/0333圆柏/b2.jpg', plantName: '圆柏', scientificName: 'Juniperus chinensis', category: 'b', alt: '圆柏 枝干/树皮' },
            { src: 'plant-database/0333圆柏/b3.jpg', plantName: '圆柏', scientificName: 'Juniperus chinensis', category: 'b', alt: '圆柏 枝干/树皮' },
            { src: 'plant-database/0333圆柏/b4.jpg', plantName: '圆柏', scientificName: 'Juniperus chinensis', category: 'b', alt: '圆柏 枝干/树皮' },
            { src: 'plant-database/0333圆柏/b5.jpg', plantName: '圆柏', scientificName: 'Juniperus chinensis', category: 'b', alt: '圆柏 枝干/树皮' },
            { src: 'plant-database/0333圆柏/l1.jpg', plantName: '圆柏', scientificName: 'Juniperus chinensis', category: 'l', alt: '圆柏 叶' },
            { src: 'plant-database/0333圆柏/l2.jpg', plantName: '圆柏', scientificName: 'Juniperus chinensis', category: 'l', alt: '圆柏 叶' },
            { src: 'plant-database/0333圆柏/l3.jpg', plantName: '圆柏', scientificName: 'Juniperus chinensis', category: 'l', alt: '圆柏 叶' },
            { src: 'plant-database/0333圆柏/t1.jpg', plantName: '圆柏', scientificName: 'Juniperus chinensis', category: 't', alt: '圆柏 树型' },
            { src: 'plant-database/0331麻楝/b1.jpg', plantName: '麻楝', scientificName: 'Chukrasia tabularis', category: 'b', alt: '麻楝 枝干/树皮' },
            { src: 'plant-database/0331麻楝/b2.jpg', plantName: '麻楝', scientificName: 'Chukrasia tabularis', category: 'b', alt: '麻楝 枝干/树皮' },
            { src: 'plant-database/0331麻楝/b3.jpg', plantName: '麻楝', scientificName: 'Chukrasia tabularis', category: 'b', alt: '麻楝 枝干/树皮' },
            { src: 'plant-database/0331麻楝/b4.jpg', plantName: '麻楝', scientificName: 'Chukrasia tabularis', category: 'b', alt: '麻楝 枝干/树皮' },
            { src: 'plant-database/0331麻楝/b5.jpg', plantName: '麻楝', scientificName: 'Chukrasia tabularis', category: 'b', alt: '麻楝 枝干/树皮' },
            { src: 'plant-database/0331麻楝/l1.jpg', plantName: '麻楝', scientificName: 'Chukrasia tabularis', category: 'l', alt: '麻楝 叶' },
            { src: 'plant-database/0331麻楝/l2.jpg', plantName: '麻楝', scientificName: 'Chukrasia tabularis', category: 'l', alt: '麻楝 叶' },
            { src: 'plant-database/0331麻楝/t1.jpg', plantName: '麻楝', scientificName: 'Chukrasia tabularis', category: 't', alt: '麻楝 树型' },
            { src: 'plant-database/0328蒲葵/b1.jpg', plantName: '蒲葵', scientificName: 'Livistona chinensis', category: 'b', alt: '蒲葵 枝干/树皮' },
            { src: 'plant-database/0328蒲葵/b2.jpg', plantName: '蒲葵', scientificName: 'Livistona chinensis', category: 'b', alt: '蒲葵 枝干/树皮' },
            { src: 'plant-database/0328蒲葵/b3.jpg', plantName: '蒲葵', scientificName: 'Livistona chinensis', category: 'b', alt: '蒲葵 枝干/树皮' },
            { src: 'plant-database/0328蒲葵/l1.jpg', plantName: '蒲葵', scientificName: 'Livistona chinensis', category: 'l', alt: '蒲葵 叶' },
            { src: 'plant-database/0328蒲葵/l2.jpg', plantName: '蒲葵', scientificName: 'Livistona chinensis', category: 'l', alt: '蒲葵 叶' },
            { src: 'plant-database/0328蒲葵/l3.jpg', plantName: '蒲葵', scientificName: 'Livistona chinensis', category: 'l', alt: '蒲葵 叶' },
            { src: 'plant-database/0328蒲葵/l4.jpg', plantName: '蒲葵', scientificName: 'Livistona chinensis', category: 'l', alt: '蒲葵 叶' },
            { src: 'plant-database/0328蒲葵/r1.jpg', plantName: '蒲葵', scientificName: 'Livistona chinensis', category: 'r', alt: '蒲葵 根' },
            { src: 'plant-database/0328蒲葵/t1.jpg', plantName: '蒲葵', scientificName: 'Livistona chinensis', category: 't', alt: '蒲葵 树型' },
            { src: 'plant-database/0328蒲葵/t2.jpg', plantName: '蒲葵', scientificName: 'Livistona chinensis', category: 't', alt: '蒲葵 树型' },
            { src: 'plant-database/0327黄葛树/r2.jpg', plantName: '黄葛树', scientificName: 'Ficus virens', category: 'r', alt: '黄葛树 根' },
            { src: 'plant-database/0327黄葛树/b1.jpg', plantName: '黄葛树', scientificName: 'Ficus virens', category: 'b', alt: '黄葛树 枝干/树皮' },
            { src: 'plant-database/0327黄葛树/b2.jpg', plantName: '黄葛树', scientificName: 'Ficus virens', category: 'b', alt: '黄葛树 枝干/树皮' },
            { src: 'plant-database/0327黄葛树/b3.jpg', plantName: '黄葛树', scientificName: 'Ficus virens', category: 'b', alt: '黄葛树 枝干/树皮' },
            { src: 'plant-database/0327黄葛树/l1.jpg', plantName: '黄葛树', scientificName: 'Ficus virens', category: 'l', alt: '黄葛树 叶' },
            { src: 'plant-database/0327黄葛树/l2.jpg', plantName: '黄葛树', scientificName: 'Ficus virens', category: 'l', alt: '黄葛树 叶' },
            { src: 'plant-database/0327黄葛树/r1.jpg', plantName: '黄葛树', scientificName: 'Ficus virens', category: 'r', alt: '黄葛树 根' },
            { src: 'plant-database/0327黄葛树/r3.jpg', plantName: '黄葛树', scientificName: 'Ficus virens', category: 'r', alt: '黄葛树 根' },
            { src: 'plant-database/0327黄葛树/t1.jpg', plantName: '黄葛树', scientificName: 'Ficus virens', category: 't', alt: '黄葛树 树型' },
            { src: 'plant-database/0327黄葛树/t2.jpg', plantName: '黄葛树', scientificName: 'Ficus virens', category: 't', alt: '黄葛树 树型' },
            { src: 'plant-database/0307山指甲/f1.jpg', plantName: '山指甲', scientificName: 'Rhododendron simsii', category: 'f', alt: '山指甲 花' },
            { src: 'plant-database/0307山指甲/f2.jpg', plantName: '山指甲', scientificName: 'Rhododendron simsii', category: 'f', alt: '山指甲 花' },
            { src: 'plant-database/0307山指甲/f3.jpg', plantName: '山指甲', scientificName: 'Rhododendron simsii', category: 'f', alt: '山指甲 花' },
            { src: 'plant-database/0307山指甲/f4.jpg', plantName: '山指甲', scientificName: 'Rhododendron simsii', category: 'f', alt: '山指甲 花' },
            { src: 'plant-database/0307山指甲/f5.JPG', plantName: '山指甲', scientificName: 'Rhododendron simsii', category: 'f', alt: '山指甲 花' },
            { src: 'plant-database/0307山指甲/l1.jpg', plantName: '山指甲', scientificName: 'Rhododendron simsii', category: 'l', alt: '山指甲 叶' },
            { src: 'plant-database/0314锦绣杜鹃/f2.JPG', plantName: '杜鹃', scientificName: 'Rhododendron pulchrum', category: 'f', alt: '杜鹃 花' },
            { src: 'plant-database/0314锦绣杜鹃/f3.JPG', plantName: '杜鹃', scientificName: 'Rhododendron pulchrum', category: 'f', alt: '杜鹃 花' },
            { src: 'plant-database/0314锦绣杜鹃/f1.jpg', plantName: '杜鹃', scientificName: 'Rhododendron pulchrum', category: 'f', alt: '杜鹃 花' },
            { src: 'plant-database/0314锦绣杜鹃/l1.jpg', plantName: '杜鹃', scientificName: 'Rhododendron pulchrum', category: 'l', alt: '杜鹃 叶' },
            { src: 'plant-database/0314锦绣杜鹃/l2.jpg', plantName: '杜鹃', scientificName: 'Rhododendron pulchrum', category: 'l', alt: '杜鹃 叶' },
            { src: 'plant-database/0314锦绣杜鹃/l3.jpg', plantName: '杜鹃', scientificName: 'Rhododendron pulchrum', category: 'l', alt: '杜鹃 叶' },
            { src: 'plant-database/0314锦绣杜鹃/l4.jpg', plantName: '杜鹃', scientificName: 'Rhododendron pulchrum', category: 'l', alt: '杜鹃 叶' },
            { src: 'plant-database/0401鹅掌藤/l1.JPG', plantName: '鹅掌藤', scientificName: 'Schefflera octophylla', category: 'l', alt: '鹅掌藤 叶' },
            { src: 'plant-database/0401鹅掌藤/l2.JPG', plantName: '鹅掌藤', scientificName: 'Schefflera octophylla', category: 'l', alt: '鹅掌藤 叶' },
            { src: 'plant-database/0401鹅掌藤/l3.JPG', plantName: '鹅掌藤', scientificName: 'Schefflera octophylla', category: 'l', alt: '鹅掌藤 叶' },
            { src: 'plant-database/0401鹅掌藤/l4.JPG', plantName: '鹅掌藤', scientificName: 'Schefflera octophylla', category: 'l', alt: '鹅掌藤 叶' },
            { src: 'plant-database/0401鹅掌藤/l5.JPG', plantName: '鹅掌藤', scientificName: 'Schefflera octophylla', category: 'l', alt: '鹅掌藤 叶' },
            { src: 'plant-database/0401鹅掌藤/l6.JPG', plantName: '鹅掌藤', scientificName: 'Schefflera octophylla', category: 'l', alt: '鹅掌藤 叶' },
            { src: 'plant-database/0401鹅掌藤/l7.JPG', plantName: '鹅掌藤', scientificName: 'Schefflera octophylla', category: 'l', alt: '鹅掌藤 叶' },
            { src: 'plant-database/0401鹅掌藤/l8.JPG', plantName: '鹅掌藤', scientificName: 'Schefflera octophylla', category: 'l', alt: '鹅掌藤 叶' },
            { src: 'plant-database/0424细叶榕/b3.JPG', plantName: '细叶榕', scientificName: 'Ficus microcarpa', category: 'b', alt: '细叶榕 枝干/树皮' },
            { src: 'plant-database/0424细叶榕/l1.jpg', plantName: '细叶榕', scientificName: 'Ficus microcarpa', category: 'l', alt: '细叶榕 叶' },
            { src: 'plant-database/0424细叶榕/l2.JPG', plantName: '细叶榕', scientificName: 'Ficus microcarpa', category: 'l', alt: '细叶榕 叶' },
            { src: 'plant-database/0424细叶榕/l3.JPG', plantName: '细叶榕', scientificName: 'Ficus microcarpa', category: 'l', alt: '细叶榕 叶' },
            { src: 'plant-database/0424细叶榕/t1.jpg', plantName: '细叶榕', scientificName: 'Ficus microcarpa', category: 't', alt: '细叶榕 树型' },
            { src: 'plant-database/0424细叶榕/t2.jpg', plantName: '细叶榕', scientificName: 'Ficus microcarpa', category: 't', alt: '细叶榕 树型' },
            { src: 'plant-database/0424细叶榕/t3.JPG', plantName: '细叶榕', scientificName: 'Ficus microcarpa', category: 't', alt: '细叶榕 树型' },
            { src: 'plant-database/0424细叶榕/b1.jpg', plantName: '细叶榕', scientificName: 'Ficus microcarpa', category: 'b', alt: '细叶榕 枝干/树皮' },
            { src: 'plant-database/0424细叶榕/b2.jpg', plantName: '细叶榕', scientificName: 'Ficus microcarpa', category: 'b', alt: '细叶榕 枝干/树皮' },
            { src: 'plant-database/0416王棕/b2.JPG', plantName: '王棕', scientificName: 'Roystonea regia', category: 'b', alt: '王棕 枝干/树皮' },
            { src: 'plant-database/0416王棕/l1.JPG', plantName: '王棕', scientificName: 'Roystonea regia', category: 'l', alt: '王棕 叶' },
            { src: 'plant-database/0416王棕/l3.JPG', plantName: '王棕', scientificName: 'Roystonea regia', category: 'l', alt: '王棕 叶' },
            { src: 'plant-database/0416王棕/l6.JPG', plantName: '王棕', scientificName: 'Roystonea regia', category: 'l', alt: '王棕 叶' },
            { src: 'plant-database/0421日本葵/b1.JPG', plantName: '日本葵', scientificName: 'Fatsia japonica', category: 'b', alt: '日本葵 枝干/树皮' },
            { src: 'plant-database/0421日本葵/l1.JPG', plantName: '日本葵', scientificName: 'Fatsia japonica', category: 'l', alt: '日本葵 叶' },
            { src: 'plant-database/0421日本葵/l2.JPG', plantName: '日本葵', scientificName: 'Fatsia japonica', category: 'l', alt: '日本葵 叶' },
            { src: 'plant-database/0421日本葵/l3.JPG', plantName: '日本葵', scientificName: 'Fatsia japonica', category: 'l', alt: '日本葵 叶' },
            { src: 'plant-database/0421日本葵/t1.JPG', plantName: '日本葵', scientificName: 'Fatsia japonica', category: 't', alt: '日本葵 树型' },
            { src: 'plant-database/0421日本葵/t2.JPG', plantName: '日本葵', scientificName: 'Fatsia japonica', category: 't', alt: '日本葵 树型' },
            { src: 'plant-database/0418菲岛福木/l1.JPG', plantName: '菲岛福木', scientificName: 'Garcinia subelliptica', category: 'l', alt: '菲岛福木 叶' },
            { src: 'plant-database/0418菲岛福木/l2.JPG', plantName: '菲岛福木', scientificName: 'Garcinia subelliptica', category: 'l', alt: '菲岛福木 叶' },
            { src: 'plant-database/0418菲岛福木/l3.JPG', plantName: '菲岛福木', scientificName: 'Garcinia subelliptica', category: 'l', alt: '菲岛福木 叶' },
            { src: 'plant-database/0418菲岛福木/l4.JPG', plantName: '菲岛福木', scientificName: 'Garcinia subelliptica', category: 'l', alt: '菲岛福木 叶' },
            { src: 'plant-database/0418菲岛福木/l5.JPG', plantName: '菲岛福木', scientificName: 'Garcinia subelliptica', category: 'l', alt: '菲岛福木 叶' },
            { src: 'plant-database/0418菲岛福木/t1.JPG', plantName: '菲岛福木', scientificName: 'Garcinia subelliptica', category: 't', alt: '菲岛福木 树型' },
            { src: 'plant-database/0417桃花心木/l2.JPG', plantName: '桃花心木', scientificName: 'Swietenia macrophylla', category: 'l', alt: '桃花心木 叶' },
            { src: 'plant-database/0417桃花心木/l3.JPG', plantName: '桃花心木', scientificName: 'Swietenia macrophylla', category: 'l', alt: '桃花心木 叶' },
            { src: 'plant-database/0417桃花心木/l4.JPG', plantName: '桃花心木', scientificName: 'Swietenia macrophylla', category: 'l', alt: '桃花心木 叶' },
            { src: 'plant-database/0417桃花心木/b1.JPG', plantName: '桃花心木', scientificName: 'Swietenia macrophylla', category: 'b', alt: '桃花心木 枝干/树皮' },
            { src: 'plant-database/0417桃花心木/l1.JPG', plantName: '桃花心木', scientificName: 'Swietenia macrophylla', category: 'l', alt: '桃花心木 叶' }
        ];

        // Calculate actual counts AFTER galleryPhotos is defined
        if (countParagraph) {
            const uniquePlantNames = new Set(galleryPhotos.map(p => p.plantName));
            const numSpecies = uniquePlantNames.size;
            const numPhotos = galleryPhotos.length;
            const duration = 1500; // Animation duration in ms

            // Store original format for update
            let textFormat = `浏览校园 {s} 种植物，{p} 张植物图片`; 
            countParagraph.textContent = textFormat.replace('{s}', 0).replace('{p}', 0); // Initialize display

            // Animate Species Count
            animateCounter(numSpecies, duration, (currentValue) => {
                // Need to preserve the other number while animating one
                const currentText = countParagraph.textContent;
                const photoCountMatch = currentText.match(/，(\d+) 张/);
                const currentPhotoCount = photoCountMatch ? photoCountMatch[1] : 0;
                countParagraph.textContent = textFormat.replace('{s}', currentValue).replace('{p}', currentPhotoCount);
            });

            // Animate Photo Count (with a slight delay? or run concurrently?)
            // Running concurrently, but the update function preserves the other value.
            animateCounter(numPhotos, duration, (currentValue) => {
                const currentText = countParagraph.textContent;
                const speciesCountMatch = currentText.match(/校园 (\d+) 种/);
                const currentSpeciesCount = speciesCountMatch ? speciesCountMatch[1] : 0;
                countParagraph.textContent = textFormat.replace('{s}', currentSpeciesCount).replace('{p}', currentValue);
            });
             console.log("Hero counts animation initialized.");
                    } else {
            console.warn("Hero count paragraph not found.");
        }

        // Category mapping: internal code -> filter button data-filter value
        const categoryMap = {
            't': 'tree',
            'l': 'leaf',
            'f': 'flower',
            'r': 'root', // Map 'r' to the new 'root' filter
            'b': 'bark',
            'g': 'fruit'
        };

        // --- 2. Get DOM Elements ---
        const galleryGrid = document.querySelector('.gallery-grid');
        const filterButtonsContainer = document.querySelector('.filter-buttons');
        const filterButtons = filterButtonsContainer?.querySelectorAll('.filter-button');
        const heroCategoryCards = document.querySelectorAll('.gallery-hero .category-cards .card-container'); // Get Hero cards

        // --- 3. Function to Display Photos ---
        function displayPhotos(photosToDisplay) {
            if (!galleryGrid) return;
            galleryGrid.innerHTML = ''; // Clear existing grid

            // 中文标签映射
            const categoryChineseMap = {
                'tree': '树',
                'leaf': '叶',
                'flower': '花',
                'root': '根',
                'bark': '皮',
                'unknown': '未知',
                'fruit': '果'
            };

            photosToDisplay.forEach(photo => {
                const categoryClass = categoryMap[photo.category] || 'unknown'; // Map category code to class/filter value
                const categoryText = categoryChineseMap[categoryClass] || categoryClass; // 获取中文标签，如果映射失败则显示英文
                const scientificName = photo.scientificName || ''; // Get scientific name
                
                // 创建infoLink - 根据植物名称生成对应的信息页链接
                const plantNameLower = photo.plantName.toLowerCase();
                let infoLink = '';
                
                // 根据植物名称对应到相应的信息页
                switch(plantNameLower) {
                    case '蒲葵':
                        infoLink = 'plant-info-pukui.html';
                        break;
                    case '黄葛树':
                        infoLink = 'plant-info-huanggeshu.html';
                        break;
                    case '杜鹃':
                        infoLink = 'plant-info-dujuan.html';
                        break;
                    case '麻楝':
                        infoLink = 'plant-info-mahlian.html';
                        break;
                    case '山指甲':
                        infoLink = 'plant-info-shanzhijia.html';
                        break;
                    case '石栗':
                        infoLink = 'plant-info-shili.html';
                        break;
                    case '银珠':
                        infoLink = 'plant-info-yinzhu.html';
                        break;
                    case '圆柏':
                        infoLink = 'plant-info-yuanbai.html';
                        break;
                    case '台湾相思':
                        infoLink = 'plant-info-taiwanxiangsi.html';
                        break;
                    case '鹅掌藤':
                        infoLink = 'plant-info-schefflera-heptaphylla.html';
                        break;
                    case '细叶榕':
                        infoLink = 'plant-info-xiyerong.html';
                        break;
                    case '王棕':
                        infoLink = 'plant-info-wangzong.html';
                        break;
                    case '日本葵':
                        infoLink = 'plant-info-ribenkui.html';
                        break;
                    case '菲岛福木':
                        infoLink = 'plant-info-feidaofumu.html';
                        break;
                    case '桃花心木':
                        infoLink = 'plant-info-taohuaxinmu.html';
                        break;
                    case '凤凰木':
                        infoLink = 'plant-info-0103.html';
                        break;
                    case '樟树':
                        if (photo.src.includes('/0104')) {
                            infoLink = 'plant-info-0104.html';
                        } else {
                            infoLink = '#';
                        }
                        break;
                    case '异叶南洋杉':
                        infoLink = 'plant-info-0105.html';
                        break;
                    case '朱蕉':
                        infoLink = 'plant-info-0106.html';
                        break;
                    case '假连翘':
                        infoLink = 'plant-info-0107.html';
                        break;
                    case '红花檵木':
                        infoLink = 'plant-info-0108.html';
                        break;
                    default:
                        infoLink = '#'; // 默认为空链接
                }

                const item = document.createElement('div');
                item.classList.add('gallery-item-dynamic'); // Use a new class to avoid conflict potentially
                item.dataset.category = categoryClass; 
                // 添加data-link属性，用于跳转
                item.dataset.link = infoLink;
                // 添加cursor样式，表示可点击
                item.style.cursor = 'pointer';

                // Updated card structure
                item.innerHTML = `
                    <div class="gallery-image">
                        <img src="${photo.src}" alt="${photo.alt}" loading="lazy">
                        <span class="category-label ${categoryClass}">${categoryText}</span> 
                    </div>
                    <div class="gallery-info-simple">
                        <span class="plant-name">${photo.plantName}</span>
                        <span class="scientific-name">${scientificName}</span>
                    </div>
                `;
                
                // --- Add onerror handler to hide broken images ---
                const imgElement = item.querySelector('img');
                if (imgElement) {
                    imgElement.onerror = () => {
                        console.warn(`Image failed to load, hiding card: ${photo.src}`);
                        item.classList.add('hidden'); // Hide the entire card if image fails
                    };
                }
                // --- End of onerror handler ---
                
                // 添加点击事件
                item.addEventListener('click', function() {
                    const targetLink = this.dataset.link;
                    if (targetLink && targetLink !== '#') {
                        window.location.href = targetLink;
                    }
                });
                
                // 添加鼠标悬停效果
                item.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-5px)';
                    this.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.1)';
                    this.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
                });
                
                item.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0)';
                    this.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.05)';
                });
                
                galleryGrid.appendChild(item);
            });
        }

        // --- 4. Function to Handle Filtering ---
        function filterGallery(filter) {
            const items = galleryGrid?.querySelectorAll('.gallery-item-dynamic');
            if (!items) return;

            items.forEach(item => {
                const itemCategory = item.dataset.category;
                if (filter === 'all' || itemCategory === filter) {
                    item.classList.remove('hidden'); // Show item
                } else {
                    item.classList.add('hidden'); // Hide item
                }
            });

            // Update active button state
            filterButtons?.forEach(button => {
                button.classList.toggle('active', button.dataset.filter === filter);
            });
        }

        // --- 4.5 Function to Scroll to Gallery ---
        function scrollToGallery() {
            const gallerySection = document.getElementById('gallery-photos');
            if (gallerySection) {
                // Use setTimeout to ensure content is rendered before scrolling
                setTimeout(() => {
                    const headerHeight = document.querySelector('header')?.offsetHeight || 0;
                    window.scrollTo({
                        top: gallerySection.offsetTop - headerHeight,
                        behavior: 'smooth'
                    });
                }, 50); // Reduced delay slightly
            }
        }

        // --- 5. Initial Display & Event Listener Setup ---
        if (galleryGrid && filterButtonsContainer) {
            displayPhotos(galleryPhotos); // Display all photos initially

            // --- 5.1 Handle Filter from URL Parameter --- 
            const urlParamsGallery = new URLSearchParams(window.location.search);
            const initialFilter = urlParamsGallery.get('filter');
            const hash = window.location.hash;

            if (initialFilter) {
                console.log(`Applying initial filter from URL: ${initialFilter}`);
                filterGallery(initialFilter);
                if (hash === '#gallery-photos') {
                    scrollToGallery();
                }
                // Clean the URL parameter
                history.replaceState(null, '', window.location.pathname + window.location.hash);
            }

            // --- 5.2 Filter Button Click Listeners ---
            filterButtonsContainer.addEventListener('click', (event) => {
                if (event.target.classList.contains('filter-button')) {
                    const filterValue = event.target.dataset.filter;
                    if (filterValue) {
                        filterGallery(filterValue);
                    }
                }
            });

            // --- 5.3 Hero Category Card Click Listeners ---
            heroCategoryCards.forEach(card => {
                // Infer filter value from the card's image alt text or title
                let filterValue = null;
                const cardTitle = card.querySelector('.card-title')?.textContent || '';
                if (cardTitle.includes('树')) filterValue = 'tree';
                else if (cardTitle.includes('花')) filterValue = 'flower';
                else if (cardTitle.includes('叶')) filterValue = 'leaf';
                else if (cardTitle.includes('果')) filterValue = 'fruit';

                if (filterValue) {
                    card.style.cursor = 'pointer'; // Make it look clickable
                    card.addEventListener('click', () => {
                        console.log(`Hero card clicked, filtering for: ${filterValue}`);
                        filterGallery(filterValue); // Apply filter
                        scrollToGallery(); // Scroll down
                    });
                }
            });

            console.log("Dynamic gallery grid, filters, and hero card listeners initialized.");
            } else {
            console.error("Gallery grid or filter buttons not found!");
        }

    }
    // --- END OF GALLERY PAGE LOGIC ---

    // --- Quick Jump Navigation Logic ---
    const quickJumpNav = document.querySelector('.quick-jump-nav');
    if (quickJumpNav) {
        const quickJumpButtons = quickJumpNav.querySelectorAll('button[data-target]');
        quickJumpButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetId = button.dataset.target;
                console.log(`Quick jump button clicked for: ${targetId}`);
                window.trailScrollToSectionById(targetId); // Use the updated function
            });
        });
        console.log("Quick jump navigation listeners added.");
    }
    
    // ... (获取所有标记并添加事件监听器 保持不变) ...

}); 