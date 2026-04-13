(function() {
    const content = window.UST_LEAF_CONTENT;
    if (!content) {
        return;
    }

    const body = document.body;
    const pageKey = body?.dataset.page || '';
    const navKey = ({
        album: 'gallery',
        plantDetail: 'gallery'
    })[pageKey] || pageKey;

    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const inGalleryFolder = pathSegments[pathSegments.length - 2] === 'gallery';
    const basePrefix = inGalleryFolder ? '../' : '';

    function resolvePath(path) {
        if (!path || path.startsWith('http') || path.startsWith('#')) {
            return path;
        }
        return `${basePrefix}${path}`;
    }

    function renderHeader() {
        const items = content.navigation.map((item) => {
            const itemClass = item.key === navKey ? ' class="active"' : '';
            const children = item.children.map((child) => (
                `<li><a href="${resolvePath(child.href)}">${child.label}</a></li>`
            )).join('');

            return `
                <li><a href="${resolvePath(item.href)}"${itemClass}>${item.label}</a>
                    <ul>${children}</ul>
                </li>
            `;
        }).join('');

        return `
            <div class="logo">
                <a href="${resolvePath('index.html')}">
                    <img src="${resolvePath('images/logo.png')}" alt="一叶知科" class="logo-image">
                </a>
            </div>
            <nav>
                <ul>${items}</ul>
            </nav>
        `;
    }

    function renderFooter(variant) {
        const sections = content.footer.sections.map((section) => {
            const links = section.links.map((link) => (
                `<li><a href="${resolvePath(link.href)}">${link.label}</a></li>`
            )).join('');

            return `
                <div class="footer-section">
                    <h3>${section.title}</h3>
                    <div class="section-divider"></div>
                    <ul>${links}</ul>
                </div>
            `;
        }).join('');

        const social = variant === 'minimal'
            ? ''
            : `
                <div class="footer-divider short"></div>
                <div class="social-media">
                    <span>${content.footer.socialLabel}</span>
                    ${content.footer.socialLinks.map((link) => (
                        `<a href="${link.href}"><img src="${resolvePath(link.icon)}" alt="${link.label}"></a>`
                    )).join('')}
                </div>
            `;

        return `
            <div class="footer-nav">${sections}</div>
            <div class="footer-divider short"></div>
            ${social}
            <p>${content.footer.copyright}</p>
        `;
    }

    const header = document.querySelector('[data-site-header]');
    if (header) {
        header.innerHTML = renderHeader();
    }

    const footer = document.querySelector('[data-site-footer]');
    if (footer) {
        footer.innerHTML = renderFooter(footer.dataset.siteFooter || 'default');
    }

    const pageTitle = content.pageTitles[pageKey];
    if (pageTitle) {
        document.title = pageTitle;
    }
})();
