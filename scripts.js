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
      // --- 旧浏览器回退 (Fallback) ----
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
    const siteContent = window.UST_LEAF_CONTENT || {};
    const trailPlants = Array.isArray(siteContent.trailPlants) ? siteContent.trailPlants : [];
    const plantCardText = siteContent.ui?.plantCard || {};
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
    const isGalleryPage = window.location.pathname.endsWith('gallery.html');
    const isPlantDetailPage = window.location.pathname.includes('gallery/plant.html') || window.location.pathname.endsWith('/plant.html');
    const header = document.querySelector('header');
    const headerHeight = header?.offsetHeight || 0; // Get header height safely

    // Add body classes based on page type
    if (isHomePage) body.classList.add('is-home');
    if (isAboutPage) body.classList.add('is-about');
    if (isTrailPage) body.classList.add('is-trail');
    if (isGalleryPage) body.classList.add('is-gallery');
    if (isPlantDetailPage) body.classList.add('is-plant-info');

    // -- 通用导航链接处理 --
    const navLinks = document.querySelectorAll('nav ul li a, .logo a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            const href = this.getAttribute('href');
            const targetIsHomepageLink = href === '/' || href.endsWith('index.html') || href.endsWith('/');

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
    if (isPlantDetailPage) {
        // ... (旧的 gallery/plant-info 滚动逻辑 - 已合并)
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

        const plants = trailPlants;

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

    }

    // -- 通用导航栏背景渐变与阴影效果 (适用于主页, 关于, 植物信息, 植物足迹, 图库页) --
    if (isHomePage || isAboutPage || isPlantDetailPage || isTrailPage || isGalleryPage) {
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
        const plants = trailPlants;
        
        function buildFallbackPlantData(marker, infoLinkOverride) {
            const card = marker.querySelector('.marker-card');
            if (!card) {
                return null;
            }

            const imgElement = card.querySelector('img');
            const textContent = card.querySelector('p')?.textContent?.trim() || '';

            return {
                name: textContent || (plantCardText.unknown || '未知植物'),
                image: imgElement?.getAttribute('data-src') || imgElement?.getAttribute('src') || '',
                scientificName: '',
                family: '',
                habit: '',
                flowering: '',
                distribution: '',
                description: plantCardText.noDescription || '暂无描述',
                infoLink: infoLinkOverride || '#'
            };
        }

        function findPlantForMarker(sectionId, plantId) {
            if (!sectionId || !plantId) {
                return null;
            }

            return plants.find((plant) => plant.sectionId === sectionId && plant.id === plantId) || null;
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

            const imagePath = plant.image || 'images/placeholder-plant.jpg';
            
            // --- Extract Common Name and Scientific Name ---
            let commonName = plant.name || (plantCardText.unknown || '未知植物');
            let scientificName = plant.scientificName || '';

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

            imageEl.src = imagePath; 
            imageEl.alt = commonName;

            plantNameEl.textContent = commonName;
            scientificNameEl.textContent = scientificName;

            familyEl.textContent = plant.family || (plantCardText.unknown || '未知');
            habitEl.textContent = plant.habit || (plantCardText.unknown || '未知');
            floweringEl.textContent = plant.flowering || (plantCardText.unknown || '未知');
            distributionEl.textContent = plant.distribution || (plantCardText.unknown || '未知');
            descriptionEl.textContent = plant.description || (plantCardText.noDescription || '暂无描述');
            
            const actionArea = learnMoreBtn.closest('.plant-card-action');
            learnMoreBtn.textContent = plantCardText.learnMoreLabel || '了解更多 →';

            if (plant.infoLink && plant.infoLink !== '#') {
                learnMoreBtn.href = plant.infoLink;
                learnMoreBtn.style.display = 'inline-block';
                if (actionArea) {
                    actionArea.style.display = 'block';
                }
            } else {
                learnMoreBtn.style.display = 'none';
                if (actionArea) {
                    actionArea.style.display = 'none';
                }
            }
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
        
        function handleMarkerClick(event) {
            event.stopPropagation();

            const marker = event.currentTarget;
            const sectionId = marker.closest('.full-page-image')?.id || '';
            const plantId = marker.getAttribute('data-index');
            const infoLinkOverride = marker.getAttribute('data-info-link');

            markers.forEach((item) => item.classList.remove('active'));
            marker.classList.add('active');

            let plantData = findPlantForMarker(sectionId, plantId);
            if (plantData) {
                plantData = { ...plantData };
                if (infoLinkOverride) {
                    plantData.infoLink = infoLinkOverride;
                }
            } else {
                plantData = buildFallbackPlantData(marker, infoLinkOverride);
            }

            if (!plantData) {
                console.error('Could not find plant data for the clicked marker.');
                plantData = {
                    name: plantCardText.loadErrorName || '信息加载失败',
                    description: plantCardText.loadErrorDescription || '无法找到该植物的详细信息。',
                    image: '',
                    infoLink: '#'
                };
            }

            fillPlantCard(plantData);
            showPlantCard(sectionId === 'section-image2');
        }

        markers.forEach((marker) => {
            marker.addEventListener('click', handleMarkerClick);
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

        const countParagraph = document.querySelector('.gallery-hero .hero-content p');
        const galleryGrid = document.querySelector('.gallery-grid');
        const filterButtonsContainer = document.querySelector('.filter-buttons');
        const filterButtons = filterButtonsContainer?.querySelectorAll('.filter-button');
        const heroCategoryCards = document.querySelectorAll('.gallery-hero .category-cards .card-container');

        const categoryMap = {
            't': 'tree',
            'l': 'leaf',
            'f': 'flower',
            'r': 'root',
            'b': 'bark',
            'g': 'fruit'
        };

        const categoryCodeMap = {
            tree: 't',
            leaf: 'l',
            flower: 'f',
            root: 'r',
            bark: 'b',
            fruit: 'g'
        };

        const categoryChineseMap = {
            tree: '树',
            leaf: '叶',
            flower: '花',
            root: '根',
            bark: '皮',
            unknown: '未知',
            fruit: '果'
        };

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

        function getGalleryScientificName(latinName = '') {
            const trimmedName = latinName.trim();
            if (!trimmedName) {
                return '';
            }

            const tokens = trimmedName.split(/\s+/);
            if (tokens.length <= 2) {
                return trimmedName;
            }

            if (['subsp.', 'var.', 'f.'].includes(tokens[2])) {
                return tokens.slice(0, Math.min(4, tokens.length)).join(' ');
            }

            return tokens.slice(0, 2).join(' ');
        }

        function buildGalleryAltText(plantName, categoryClass, index) {
            const safePlantName = plantName || (plantCardText.unknown || '未知植物');
            const categoryLabel = categoryChineseMap[categoryClass] || '图片';
            return `${safePlantName} ${categoryLabel} ${index + 1}`;
        }

        function transformPlantsToGalleryPhotos(plants) {
            return plants.reduce((photos, plant) => {
                const images = Array.isArray(plant.images) ? plant.images : [];
                const plantName = plant.cn_name || (plantCardText.unknown || '未知植物');
                const scientificName = getGalleryScientificName(plant.latin_name || '');
                const plantId = plant.detail_page_id || plant.id || '';

                images.forEach((image, index) => {
                    const normalizedCategory = String(image.category || '').toLowerCase();
                    const categoryCode = categoryCodeMap[normalizedCategory] || 'unknown';
                    const categoryClass = categoryMap[categoryCode] || 'unknown';

                    photos.push({
                        src: `plant-database/${plant.image_folder}/${image.filename}`,
                        plantId,
                        plantName,
                        scientificName,
                        category: categoryCode,
                        alt: buildGalleryAltText(plantName, categoryClass, index)
                    });
                });

                return photos;
            }, []);
        }

        async function fetchGalleryPhotos() {
            try {
                const response = await fetch('plants.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                const plants = Array.isArray(data.plants) ? data.plants : [];
                return transformPlantsToGalleryPhotos(plants);
            } catch (error) {
                console.error('Error fetching gallery photo data from plants.json:', error);
                return [];
            }
        }

        function updateHeroCounts(galleryPhotos) {
            if (!countParagraph) {
                console.warn("Hero count paragraph not found.");
                return;
            }

            const uniquePlantNames = new Set(galleryPhotos.map((photo) => photo.plantName));
            const numSpecies = uniquePlantNames.size;
            const numPhotos = galleryPhotos.length;
            const duration = 1500;
            const textFormat = `浏览校园 {s} 种植物，{p} 张植物图片`;

            countParagraph.textContent = textFormat.replace('{s}', 0).replace('{p}', 0);

            animateCounter(numSpecies, duration, (currentValue) => {
                const currentText = countParagraph.textContent;
                const photoCountMatch = currentText.match(/，(\d+) 张/);
                const currentPhotoCount = photoCountMatch ? photoCountMatch[1] : 0;
                countParagraph.textContent = textFormat.replace('{s}', currentValue).replace('{p}', currentPhotoCount);
            });

            animateCounter(numPhotos, duration, (currentValue) => {
                const currentText = countParagraph.textContent;
                const speciesCountMatch = currentText.match(/校园 (\d+) 种/);
                const currentSpeciesCount = speciesCountMatch ? speciesCountMatch[1] : 0;
                countParagraph.textContent = textFormat.replace('{s}', currentSpeciesCount).replace('{p}', currentValue);
            });

            console.log("Hero counts animation initialized.");
        }

        function displayPhotos(photosToDisplay) {
            if (!galleryGrid) return;
            galleryGrid.innerHTML = '';

            photosToDisplay.forEach((photo) => {
                const categoryClass = categoryMap[photo.category] || 'unknown';
                const categoryText = categoryChineseMap[categoryClass] || categoryClass;
                const scientificName = photo.scientificName || '';
                const infoLink = photo.plantId ? `gallery/plant.html?id=${photo.plantId}` : '#';

                const item = document.createElement('div');
                item.classList.add('gallery-item-dynamic');
                item.dataset.category = categoryClass;
                item.dataset.link = infoLink;
                item.style.cursor = 'pointer';

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

                const imgElement = item.querySelector('img');
                if (imgElement) {
                    imgElement.onerror = () => {
                        console.warn(`Image failed to load, hiding card: ${photo.src}`);
                        item.classList.add('hidden');
                    };
                }

                item.addEventListener('click', function() {
                    const targetLink = this.dataset.link;
                    if (targetLink && targetLink !== '#') {
                        window.location.href = targetLink;
                    }
                });

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

        function filterGallery(filter) {
            const items = galleryGrid?.querySelectorAll('.gallery-item-dynamic');
            if (!items) return;

            items.forEach((item) => {
                const itemCategory = item.dataset.category;
                if (filter === 'all' || itemCategory === filter) {
                    item.classList.remove('hidden');
                } else {
                    item.classList.add('hidden');
                }
            });

            filterButtons?.forEach((button) => {
                button.classList.toggle('active', button.dataset.filter === filter);
            });
        }

        function scrollToGallery() {
            const gallerySection = document.getElementById('gallery-photos');
            if (gallerySection) {
                setTimeout(() => {
                    const headerHeight = document.querySelector('header')?.offsetHeight || 0;
                    window.scrollTo({
                        top: gallerySection.offsetTop - headerHeight,
                        behavior: 'smooth'
                    });
                }, 50);
            }
        }

        async function initGalleryPage() {
            const galleryPhotos = await fetchGalleryPhotos();
            updateHeroCounts(galleryPhotos);

            if (galleryGrid && filterButtonsContainer) {
                displayPhotos(galleryPhotos);

                const urlParamsGallery = new URLSearchParams(window.location.search);
                const initialFilter = urlParamsGallery.get('filter');
                const hash = window.location.hash;

                if (initialFilter) {
                    console.log(`Applying initial filter from URL: ${initialFilter}`);
                    filterGallery(initialFilter);
                    if (hash === '#gallery-photos') {
                        scrollToGallery();
                    }
                    history.replaceState(null, '', window.location.pathname + window.location.hash);
                }

                filterButtonsContainer.addEventListener('click', (event) => {
                    if (event.target.classList.contains('filter-button')) {
                        const filterValue = event.target.dataset.filter;
                        if (filterValue) {
                            filterGallery(filterValue);
                        }
                    }
                });

                heroCategoryCards.forEach((card) => {
                    let filterValue = null;
                    const cardTitle = card.querySelector('.card-title')?.textContent || '';
                    if (cardTitle.includes('树')) filterValue = 'tree';
                    else if (cardTitle.includes('花')) filterValue = 'flower';
                    else if (cardTitle.includes('叶')) filterValue = 'leaf';
                    else if (cardTitle.includes('果')) filterValue = 'fruit';

                    if (filterValue) {
                        card.style.cursor = 'pointer';
                        card.addEventListener('click', () => {
                            console.log(`Hero card clicked, filtering for: ${filterValue}`);
                            filterGallery(filterValue);
                            scrollToGallery();
                        });
                    }
                });

                console.log("Dynamic gallery grid, filters, and hero card listeners initialized.");
            } else {
                console.error("Gallery grid or filter buttons not found!");
            }
        }

        initGalleryPage();
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
