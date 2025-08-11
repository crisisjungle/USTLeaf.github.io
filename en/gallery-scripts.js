// 植物图库页面的特定脚本
document.addEventListener('DOMContentLoaded', function() {
    // 调用植物数据库统计函数
    updatePlantDatabaseStats();
    
    // 图库过滤功能
    const filterButtons = document.querySelectorAll('.filter-button');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    // 植物卡片点击跳转功能
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            const targetLink = this.getAttribute('data-link');
            if (targetLink) {
                window.location.href = targetLink;
            }
        });
        
        // 添加鼠标悬停效果，使卡片看起来像可点击的按钮
        item.style.cursor = 'pointer';
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.transition = 'transform 0.3s ease';
            // 添加轻微的阴影效果
            this.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.1)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.05)';
        });
    });
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除所有按钮的active类
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // 为当前点击的按钮添加active类
            this.classList.add('active');
            
            // 获取过滤类别
            const filterValue = this.getAttribute('data-filter');
            
            // 显示或隐藏对应类别的图片项
            galleryItems.forEach(item => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.style.display = 'block';
                    // 添加动画效果
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, 100);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
    
    // 分类卡片点击事件
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            // 获取卡片标题
            const categoryTitle = this.querySelector('h3').textContent;
            
            // 根据不同分类设置过滤器
            let filterToActivate;
            switch(categoryTitle) {
                case '植物形态分类':
                    filterToActivate = 'all';
                    break;
                case '花色分类':
                    filterToActivate = 'flower';
                    break;
                case '叶型分类':
                    filterToActivate = 'leaf';
                    break;
                case '树形分类':
                    filterToActivate = 'tree';
                    break;
                default:
                    filterToActivate = 'all';
            }
            
            // 滚动到图片库部分
            document.getElementById('gallery-photos').scrollIntoView({
                behavior: 'smooth'
            });
            
            // 延迟激活对应的过滤按钮
            setTimeout(() => {
                const buttonToClick = document.querySelector(`.filter-button[data-filter="${filterToActivate}"]`);
                if (buttonToClick) {
                    buttonToClick.click();
                }
            }, 800);
        });
    });
    
    // 搜索功能
    const searchInput = document.querySelector('.search-input');
    const searchButton = document.querySelector('.search-button');
    
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            return; // 如果搜索框为空，不执行任何操作
        }
        
        // 过滤所有分类按钮，显示"全部"
        filterButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelector('.filter-button[data-filter="all"]').classList.add('active');
        
        // 过滤图片
        let hasResults = false;
        
        galleryItems.forEach(item => {
            const title = item.querySelector('h3').textContent.toLowerCase();
            const description = item.querySelector('p').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                item.style.display = 'block';
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, 100);
                hasResults = true;
            } else {
                item.style.opacity = '0';
                item.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    item.style.display = 'none';
                }, 300);
            }
        });
        
        // 滚动到图片库部分
        document.getElementById('gallery-photos').scrollIntoView({
            behavior: 'smooth'
        });
        
        // 如果没有搜索结果，可以添加提示
        const existingNoResults = document.querySelector('.no-results-message');
        if (existingNoResults) {
            existingNoResults.remove();
        }
        
        if (!hasResults) {
            const noResultsMessage = document.createElement('div');
            noResultsMessage.className = 'no-results-message';
            noResultsMessage.innerHTML = `
                <p>未找到与 "${searchTerm}" 相关的植物，请尝试其他关键词。</p>
            `;
            noResultsMessage.style.textAlign = 'center';
            noResultsMessage.style.margin = '40px 0';
            noResultsMessage.style.color = '#666';
            noResultsMessage.style.fontSize = '1.2rem';
            
            document.querySelector('.gallery-grid').after(noResultsMessage);
        }
    }
    
    // 加载更多功能
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            // 这里可以添加加载更多图片的逻辑
            alert('加载更多功能即将推出...');
        });
    }
    
    // 修改后的平滑滚动到锚点功能
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                // 使用平滑滚动，但不阻止继续滚动
                window.scrollTo({
                    top: targetElement.offsetTop,
                    behavior: 'smooth'
                });
                
                // 更新页面指示器
                updatePageIndicator(targetId);
            }
        });
    });
    
    // 添加滚动事件监听，动态更新页面指示器
    window.addEventListener('scroll', function() {
        const scrollPosition = window.scrollY + window.innerHeight / 2;
        
        // 获取所有可能的区域
        const sections = [
            document.getElementById('gallery-database'),
            document.getElementById('gallery-photos')
        ];
        
        // 确定当前所在区域
        let currentSection = null;
        sections.forEach(section => {
            if (!section) return;
            
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition <= sectionBottom) {
                currentSection = section.id;
            }
        });
        
        // 更新页面指示器
        if (currentSection) {
            updatePageIndicator(currentSection);
        }
    });
    
    // 页面指示器功能
    function updatePageIndicator(sectionId) {
        document.querySelectorAll('.page-indicator .dot').forEach(dot => {
            dot.classList.toggle('active', dot.getAttribute('data-section') === sectionId);
        });
    }
    
    // 为页面指示器添加点击事件
    document.querySelectorAll('.page-indicator .dot').forEach(dot => {
        dot.addEventListener('click', function() {
            const targetId = this.getAttribute('data-section');
            if (targetId) {
                // 使用平滑滚动，但不阻止继续滚动
                window.scrollTo({
                    top: document.getElementById(targetId).offsetTop,
                    behavior: 'smooth'
                });
                
                updatePageIndicator(targetId);
            }
        });
    });
    
    // 返回顶部按钮
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        // 显示或隐藏返回顶部按钮
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                backToTopBtn.style.display = 'block';
                backToTopBtn.style.opacity = '1';
            } else {
                backToTopBtn.style.opacity = '0';
                setTimeout(() => {
                    if (window.scrollY <= 300) {
                        backToTopBtn.style.display = 'none';
                    }
                }, 300);
            }
        });
        
        // 点击返回顶部
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // 初始化动画效果
    galleryItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'all 0.5s ease';
        
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, 300);
    });
});

// 自动计算植物数据库统计信息的函数
async function updatePlantDatabaseStats() {
    try {
        // 由于前端不能直接扫描服务器文件系统，我们创建一个函数来计算已知的植物文件夹
        // 这个函数会返回根据当前网站实际情况的计算结果
        const stats = await calculatePlantStats();
        
        // 更新页面上的数值
        const statsElement = document.querySelector('.gallery-hero .hero-content p');
        if (statsElement) {
            statsElement.textContent = `Check ${stats.speciesCount} types of plants on campus, ${stats.imageCount} plant pictures`;
            console.log(`植物统计数据已更新: ${stats.speciesCount}种植物，${stats.imageCount}张图片`);
        }
    } catch (error) {
        console.error('获取植物统计数据失败:', error);
    }
}

// 计算植物统计数据
async function calculatePlantStats() {
    // 创建一个植物文件夹列表，这个列表需要与实际的plant-database文件夹内容匹配
    const plantFolders = [
        "0307山指甲", "0314锦绣杜鹃", "0327黄葛树", "0328蒲葵", "0331麻楝", 
        "0333圆柏", "0340银珠", "0341石栗", "0414台湾相思", "0415蒲葵", 
        "0416王棕", "0417桃花心木", "0417十大科树", "0418菲岛福木", "0421日本葵"
    ];
    
    // 每个文件夹的实际图片数量，已包含特殊命名的图片
    const folderImagesCount = {
        "0307山指甲": 6,     
        "0314锦绣杜鹃": 9,       // 包含_stamen.JPG, _bud.JPG等特殊命名图片
        "0327黄葛树": 9,
        "0328蒲葵": 9,
        "0331麻楝": 6,
        "0333圆柏": 8,
        "0340银珠": 5,
        "0341石栗": 6,
        "0414台湾相思": 7,
        "0415蒲葵": 6,
        "0416王棕": 6,
        "0417桃花心木": 6,
        "0417十大科树": 6,
        "0418菲岛福木": 7,
        "0421日本葵": 6
    };
    
    // 计算总植物种类数
    const speciesCount = plantFolders.length;
    
    // 计算总图片数
    let imageCount = 0;
    plantFolders.forEach(folder => {
        imageCount += folderImagesCount[folder] || 6; // 如果没有指定数量，默认为6张
    });
    
    // 返回统计结果
    return {
        speciesCount: speciesCount,
        imageCount: imageCount
    };
} 