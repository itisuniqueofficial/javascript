const jo = {};

class JetTheme {
    constructor() {
        // Core utilities
        this.doc = document;
        this.win = window;
        this.storage = localStorage;
        this.defer = { js: [], css: [], dom: [] };

        // DOM elements
        this.elements = {
            header: this.doc.getElementById('header'),
            searchToggle: this.doc.getElementById('search-toggle'),
            searchHeader: this.doc.getElementById('search-header'),
            navToggle: this.doc.getElementById('navbar-toggle'),
            navbar: this.doc.getElementById('navbar'),
            backToTop: this.doc.getElementById('back-to-top'),
            darkToggler: this.doc.getElementById('dark-toggler'),
            html: this.doc.querySelector('html'),
            commentBtn: this.doc.getElementById('comment-button'),
            commentForm: this.doc.getElementById('threaded-comment-form'),
            commentEditor: this.doc.getElementById('comment-editor'),
            commentEditorSrc: this.doc.getElementById('comment-editor-src'),
            commentScript: this.doc.getElementById('comment-script'),
            commentReplies: this.doc.querySelectorAll('.comment-reply'),
            noscripts: this.doc.querySelectorAll('.entry-text noscript'),
            contactForms: this.doc.querySelectorAll('.contact-form-blogger'),
            adsPost: this.doc.getElementById('ads-post'),
            postBody: this.doc.getElementById('post-body'),
            relatedPosts: this.doc.querySelector('.related-posts'),
            relatedInline: this.doc.querySelector('.related-inline')
        };

        // Configuration
        this.config = {
            isPreview: typeof isPreview !== 'undefined' ? isPreview : false,
            siteUrl: typeof siteUrl !== 'undefined' ? siteUrl.replace(/(^\w+:|^)\/\//, '') : '',
            currentUrl: typeof currentUrl !== 'undefined' ? currentUrl : '',
            blogId: typeof blogId !== 'undefined' ? blogId : '',
            blogTitle: typeof blogTitle !== 'undefined' ? blogTitle : '',
            titleSeparator: typeof titleSeparator !== 'undefined' ? titleSeparator : ' - ',
            pageTitle: typeof pageTitle !== 'undefined' ? pageTitle : 'Page',
            analyticId: typeof analyticId !== 'undefined' ? analyticId : false,
            caPubAdsense: typeof caPubAdsense !== 'undefined' ? caPubAdsense.replace(/^\D+/g, '') : false,
            innerAdsDelimiter: typeof innerAdsDelimiter !== 'undefined' ? innerAdsDelimiter : 'p,br,div',
            ignoreAdsDelimiter: typeof ignoreAdsDelimiter !== 'undefined' ? ignoreAdsDelimiter : 'pre,ul,ol,table,blockquote',
            autoTOC: typeof autoTOC !== 'undefined' ? autoTOC : false,
            tocTemp: typeof toc_temp === 'function' ? toc_temp : false,
            positionTOC: typeof positionTOC !== 'undefined' ? positionTOC : false,
            jtCallback: typeof jtCallback === 'function' ? jtCallback : false,
            isLazy: this.storage && this.storage.getItem('lazy') === '1'
        };

        this.baseUrl = `https://${this.config.siteUrl}`;
        this.adsClient = this.config.caPubAdsense ? `ca-pub-${this.config.caPubAdsense}` : false;
        this.currentPage = this.getUrlParam('page', this.config.currentUrl);

        this.initialize();
    }

    // Utility Functions
    hasClass(element, className) {
        return element && ` ${element.className} `.includes(` ${className} `);
    }

    addClass(element, className) {
        if (!element || this.hasClass(element, className)) return;
        element.className += element.className ? ` ${className}` : className;
    }

    removeClass(element, className) {
        if (!element) return;
        element.className = element.className
            .replace(new RegExp(`(?:^|\\s)${className}(?!\\S)`), '')
            .trim();
    }

    toggleClass(element, className, condition = null) {
        if (!element) return;
        condition === null
            ? this.hasClass(element, className)
                ? this.removeClass(element, className)
                : this.addClass(element, className)
            : condition
                ? this.addClass(element, className)
                : this.removeClass(element, className);
    }

    getUrlParam(param, url) {
        const regex = new RegExp(`[?&]${param}=([^&#=]*)`);
        const match = regex.exec(url);
        return match && match[1] ? match[1] : null;
    }

    generateId() {
        return (Math.random() + 1).toString(36).substring(7);
    }

    // Pagination
    createPagination(totalItems, currentPage, pageSize, maxPages) {
        totalItems = parseInt(totalItems);
        currentPage = parseInt(currentPage);
        pageSize = parseInt(pageSize);
        maxPages = parseInt(maxPages);

        const totalPages = Math.ceil(totalItems / pageSize);
        currentPage = Math.max(1, Math.min(currentPage, totalPages));

        let startPage, endPage;
        const halfMax = Math.floor(maxPages / 2);

        if (totalPages <= maxPages) {
            startPage = 1;
            endPage = totalPages;
        } else if (currentPage <= halfMax) {
            startPage = 1;
            endPage = maxPages;
        } else if (currentPage + halfMax >= totalPages) {
            startPage = totalPages - maxPages + 1;
            endPage = totalPages;
        } else {
            startPage = currentPage - halfMax;
            endPage = currentPage + halfMax;
        }

        const pages = Array.from(
            { length: endPage - startPage + 1 },
            (_, i) => startPage + i
        );

        return {
            totalItems,
            currentPage,
            pageSize,
            totalPages,
            startPage,
            endPage,
            startIndex: (currentPage - 1) * pageSize,
            endIndex: Math.min(currentPage * pageSize - 1, totalItems - 1),
            pages
        };
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Image Processing
    processImage(imgElement) {
        const src = imgElement.getAttribute('data-src');
        if (!src) return;

        const dpr = this.config.isLazy && window.devicePixelRatio > 1 ? window.devicePixelRatio : 1.5;
        const width = (imgElement.offsetWidth * dpr).toFixed(0);
        const height = (imgElement.offsetHeight * dpr).toFixed(0);

        if (src.match(/(bp.blogspot|googleusercontent)/)) {
            const parts = src.split('/');
            const lastEq = src.lastIndexOf('=') + 1;
            const sizeParam = this.hasClass(imgElement.parentElement, 'ratio')
                ? `w${width}-h${height}-c-rw`
                : `s${Math.max(30, width)}-rw`;

            const newSrc = src.match(/(img\/a|proxy\/)/)
                ? (lastEq ? src.slice(0, lastEq) + sizeParam : `${src}=${sizeParam}`)
                : src.replace(parts[parts.length - 2], sizeParam);
                
            imgElement.setAttribute('data-src', newSrc);
        } else if (src.match(/(img.youtube|i.ytimg)/)) {
            imgElement.setAttribute('data-src', `${src.substring(0, src.lastIndexOf('/'))}/mqdefault.jpg`);
        }
    }

    // Content Loading
    loadPagination(container) {
        const posts = container.getAttribute('data-posts');
        const label = encodeURIComponent(container.getAttribute('data-label') || '');
        const isLabel = container.getAttribute('data-label') !== null;
        const labelPath = label ? `-/${label}/` : '';
        const labelUrl = label ? `/label/${label}` : '';
        
        const maxResults = this.getUrlParam('max-results', this.config.currentUrl) || posts;
        const page = this.getUrlParam('page', this.config.currentUrl) || 1;

        if (container.getAttribute('data-pagination') === 'false') {
            this.removeClass(container, 'visually-hidden');
            return;
        }

        this.loadScript(`${this.baseUrl}/feeds/posts/summary/${labelPath}?alt=json&callback=jo.pagination_${this.generateId()}&max-results=1`);

        jo[`pagination_${this.generateId()}`] = (data) => {
            const total = parseInt(data.feed.openSearch$totalResults.$t);
            if (posts >= total) {
                this.removeClass(container, 'visually-hidden');
                return;
            }

            const pagination = this.createPagination(total, page, maxResults, 5);
            const ul = this.doc.createElement('ul');
            this.addClass(ul, 'pagination mb-0');

            if (pagination.currentPage !== 1) {
                ul.appendChild(this.createPageItem(pagination.currentPage - 1, '', '<svg aria-hidden="true" class="jt-icon"><use xlink:href="#i-arrow-l"/></svg>'));
            }

            if (!pagination.pages.includes(1)) {
                ul.appendChild(this.createPageItem(1, pagination.currentPage, '1 . .'));
            }

            pagination.pages.forEach(pageNum => {
                ul.appendChild(this.createPageItem(pageNum, pagination.currentPage));
            });

            if (!pagination.pages.includes(pagination.totalPages)) {
                ul.appendChild(this.createPageItem(pagination.totalPages, pagination.currentPage, `. . ${pagination.totalPages}`));
            }

            if (pagination.currentPage !== pagination.totalPages) {
                ul.appendChild(this.createPageItem(pagination.currentPage + 1, '', '<svg aria-hidden="true" class="jt-icon"><use xlink:href="#i-arrow-r"/></svg>'));
            }

            container.innerHTML = '';
            container.appendChild(ul);
            this.removeClass(container, 'visually-hidden');
        };
    }

    createPageItem(pageNum, currentPage, text = null) {
        const li = this.doc.createElement('li');
        const span = this.doc.createElement('span');
        
        this.addClass(span, 'btn btn-sm rounded-pill jt-icon-center');
        span.innerHTML = text || pageNum;
        span.setAttribute('data-page', pageNum);

        if (pageNum === currentPage) {
            this.addClass(span, 'jt-btn-primary');
        } else {
            this.addClass(span, 'jt-btn-light hover-btn-primary');
            span.addEventListener('click', (e) => {
                e.preventDefault();
                const targetPage = span.getAttribute('data-page');
                if (targetPage === '1') {
                    const url = this.baseUrl + (isLabel ? `/search${labelUrl}` : '') + `?max-results=${maxResults}&page=${targetPage}`;
                    window.location.href = url;
                } else {
                    const startIndex = (targetPage - 1) * maxResults;
                    this.loadScript(`${this.baseUrl}/feeds/posts/summary/${labelPath}?start-index=${startIndex}&alt=json&callback=jo.pagination_date&max-results=1`);
                }
            });
        }

        li.appendChild(span);
        return li;
    }

    loadCustomPosts(container) {
        const id = this.generateId();
        const label = container.getAttribute('data-label') || container.innerHTML;
        const title = container.getAttribute('data-title');
        const items = parseInt(container.getAttribute('data-items'));
        const shuffle = container.getAttribute('data-shuffle');
        const noItem = container.getAttribute('data-no-item');
        const func = container.getAttribute('data-func');
        const callback = container.getAttribute('data-callback');
        
        const labels = label.split(',');
        const labelPath = labels.length > 1 
            ? `-/${encodeURIComponent(labels[Math.floor(Math.random() * labels.length)])}/?`
            : label && label !== 'false' 
                ? `-/${encodeURIComponent(label.trim())}/?` 
                : '?';

        const maxResults = noItem ? items + 1 : items;
        this.loadScript(`${this.baseUrl}/feeds/posts/summary/${labelPath}alt=json&callback=jo.custom_posts_${id}&max-results=${maxResults}`);

        jo[`custom_posts_${id}`] = (data) => {
            const total = parseInt(data.feed.openSearch$totalResults.$t);
            if (total === 0) return;

            const result = {
                title,
                posts: [],
                categories: data.feed.category
            };

            data.feed.entry.slice(0, items).forEach(entry => {
                const url = entry.link[entry.link.length - 1].href;
                if (url === noItem) return;

                const date = new Date(entry.published.$t);
                result.posts.push({
                    grup_id: id,
                    url,
                    title: entry.title.$t,
                    summary: entry.summary.$t.trim(),
                    img: entry.media$thumbnail?.url,
                    author: entry.author[0].name.$t,
                    comment: entry.thr$total?.$t,
                    label: entry.category,
                    date: `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
                });
            });

            const customFunc = window[func];
            if (typeof customFunc === 'function' && result.posts.length > 0) {
                if (shuffle) {
                    result.posts = this.shuffleArray(result.posts).slice(0, shuffle);
                }
                container.innerHTML = customFunc(result).trim();
                this.removeClass(container, 'visually-hidden');
                this.observeLazyElements(`.lazy-${id}`);
                
                const cbFunc = window[callback];
                if (callback && typeof cbFunc === 'function') cbFunc();
            }
        };
    }

    // Event Handlers
    initializeEvents() {
        let lastScroll = 0;
        this.win.addEventListener('scroll', () => {
            const scrollY = this.win.pageYOffset;
            if (scrollY < lastScroll && this.hasClass(this.elements.header, 'header-hidden')) {
                clearTimeout(this.headerTimeout);
                this.headerTimeout = setTimeout(() => this.removeClass(this.elements.header, 'header-hidden'), 500);
            } else if (scrollY > lastScroll && this.hasClass(this.elements.header, 'header-animate')) {
                clearTimeout(this.headerTimeout);
                this.addClass(this.elements.header, 'header-hidden');
            }
            lastScroll = scrollY;
            
            this.toggleClass(this.elements.header, 'shadow-sm', scrollY >= 1);
            this.toggleClass(this.elements.backToTop, 'd-none', scrollY < 1000);
        });

        this.elements.searchToggle?.addEventListener('change', () => {
            this.toggleHeaderAnimate();
            if (this.elements.searchToggle.checked) {
                setTimeout(() => this.doc.getElementById('search-input')?.focus(), 100);
            }
        });

        this.elements.navToggle?.addEventListener('change', () => {
            this.toggleHeaderAnimate();
            if (this.elements.navToggle.checked) {
                this.addClass(this.elements.navbar, 'show');
            } else {
                this.removeClass(this.elements.navbar, 'show');
            }
        });

        this.elements.darkToggler?.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleClass(this.elements.html, 'dark-mode');
            this.storage.setItem('theme', this.hasClass(this.elements.html, 'dark-mode') ? 'dark' : 'light');
        });

        this.elements.commentBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            this.loadCommentForm(this.elements.commentBtn.href);
        });

        this.elements.commentReplies.forEach(reply => {
            reply.addEventListener('click', (e) => {
                e.preventDefault();
                const commentId = reply.getAttribute('data-comment-id');
                this.loadCommentForm(reply.href, `c${commentId}`);
            });
        });

        this.elements.contactForms.forEach(form => {
            form.addEventListener('submit', (e) => this.handleContactForm(e, form));
        });
    }

    toggleHeaderAnimate() {
        this.toggleClass(this.elements.header, 'header-animate', 
            this.elements.searchToggle?.checked || this.elements.navToggle?.checked);
    }

    loadCommentForm(url, targetId = 'add-comment') {
        if (url !== this.elements.commentEditorSrc.href) {
            this.addClass(this.elements.commentForm, 'loader');
            this.elements.commentEditorSrc.href = url;
            this.elements.commentEditor.src = url;
        }

        if (this.hasClass(this.elements.commentForm, 'd-none')) {
            this.removeClass(this.elements.commentForm, 'd-none');
            const scriptUrl = this.elements.commentScript.value.match(/<script.*?src='(.*?)'/)[1];
            this.loadScript(scriptUrl, 'comment-js', 500, () => {
                window.BLOG_CMT_createIframe('https://www.blogger.com/rpc_relay.html');
            });
        }

        if (this.elements.commentForm.parentElement.id !== targetId) {
            this.doc.getElementById(targetId).appendChild(this.elements.commentForm);
        }
    }

    handleContactForm(e, form) {
        e.preventDefault();
        this.addClass(form, 'loading');

        const formData = new FormData(form);
        let data = `blogID=${this.config.blogId}`;
        formData.forEach((value, key) => {
            data += `&${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
        });

        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://www.blogger.com/contact-form.do');
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200 && xhr.responseText) {
                this.removeClass(form, 'loading');
                const response = JSON.parse(xhr.responseText.trim());
                if (response?.details?.emailSentStatus === 'true') {
                    form.reset();
                    this.removeClass(form, 'send-error');
                    this.addClass(form, 'send-success');
                } else {
                    this.removeClass(form, 'send-success');
                    this.addClass(form, 'send-error');
                }
            }
        };
        xhr.send(data);
    }

    // Lazy Loading
    observeLazyElements(selector) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        if (entry.target.tagName === 'IMG') {
                            this.processImage(entry.target);
                        }
                        this.addClass(entry.target, 'loaded');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { rootMargin: '200%' }
        );

        this.doc.querySelectorAll(selector).forEach(el => observer.observe(el));
    }

    // Initialization
    initialize() {
        this.initializeEvents();

        if (!this.config.isLazy && this.storage) {
            this.storage.setItem('lazy', '1');
        }

        // Process noscript content
        this.elements.noscripts.forEach((noscript, index) => {
            const textarea = this.doc.createElement('textarea');
            textarea.innerHTML = noscript.innerHTML.replace(
                /src="(.*?)"/g,
                'src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" loading="lazy" lazyload="true" data-src="$1"'
            );
            const div = this.doc.createElement('div');
            div.innerHTML = textarea.value;
            if (index === 0) this.addClass(div, 'feature-image full-width');
            noscript.parentElement.insertBefore(div, noscript);
        });

        // Handle related posts
        if (this.elements.relatedPosts && this.elements.relatedInline) {
            this.elements.relatedInline.innerHTML = this.elements.relatedPosts.innerHTML;
            this.elements.relatedInline.setAttribute('data-no-item', 
                this.elements.relatedPosts.getAttribute('data-no-item'));
        }

        // Ads insertion
        if (this.elements.postBody && this.elements.adsPost) {
            const delimiters = this.elements.postBody.querySelectorAll(
                `${this.config.innerAdsDelimiter},${this.config.ignoreAdsDelimiter}`
            );
            const ads = this.elements.adsPost.children;
            const validDelimiters = Array.from(delimiters).filter(el => {
                const closestIgnore = el.closest(this.config.ignoreAdsDelimiter);
                return !closestIgnore || closestIgnore === el;
            });

            Array.from(ads).forEach((ad, index) => {
                const position = index === ads.length - 1 
                    ? validDelimiters.length - 1 
                    : Math.round(validDelimiters.length / ads.length) * index;
                const target = validDelimiters[position]?.nextSibling;
                if (target) {
                    target.parentElement.insertBefore(ad, target);
                } else if (index === 0) {
                    this.elements.postBody.appendChild(ad);
                }
            });
        }

        // Table of Contents
        if (this.config.autoTOC && this.config.tocTemp && this.elements.postBody?.firstChild) {
            const headings = this.elements.postBody.querySelectorAll('h2,h3,h4,h5,h6');
            const tocContainer = this.doc.createElement('div');
            const tocTarget = this.elements.postBody.querySelector(this.config.positionTOC) || 
                this.elements.postBody.firstChild;

            const tocItems = Array.from(headings).map(heading => {
                const id = heading.textContent.replace(/[^\w!?]/g, '_').replace(/__/g, '_');
                heading.id = id;
                return {
                    level: parseInt(heading.tagName.replace('H', '')),
                    title: heading.textContent,
                    id
                };
            });

            if (tocItems.length > 0) {
                tocContainer.innerHTML = this.config.tocTemp(tocItems).trim();
                tocTarget.nextSibling?.parentElement.insertBefore(tocContainer, tocTarget.nextSibling);
            }
        }

        // Third-party integrations
        if (!this.config.isPreview) {
            if (this.adsClient) {
                this.loadScript(`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${this.adsClient}`, 'adsbygoogle', 100);
                window.adsbygoogle = window.adsbygoogle || [];
            }
            if (this.config.analyticId) {
                this.loadScript(`https://www.googletagmanager.com/gtag/js?id=${this.config.analyticId}`, 'analytics', 100, () => {
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', this.config.analyticId);
                });
            }
            if (this.config.blogId) {
                this.loadCss(`https://www.blogger.com/dyn-css/authorization.css?targetBlogID=${this.config.blogId}`);
            }
            if (this.config.jtCallback) this.config.jtCallback();
        }

        // Page title
        if (this.currentPage) {
            this.doc.title = this.doc.title.replace(
                this.config.titleSeparator,
                `${this.config.titleSeparator}${this.config.pageTitle} ${this.currentPage}${this.config.titleSeparator}`
            );
        }

        // Lazy loading
        this.observeLazyElements('.lazyload');
        this.observeElements('#post-pager', this.loadPostPager);
        this.observeElements('#pagination', this.loadPagination);
        this.observeElements('.custom-posts', this.loadCustomPosts);
    }

    loadScript(src, id, delay = 0, callback) {
        const script = this.doc.createElement('script');
        script.src = src;
        if (id) script.id = id;
        if (callback) script.onload = callback;
        setTimeout(() => this.doc.body.appendChild(script), delay);
    }

    loadCss(href) {
        const link = this.doc.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        this.doc.head.appendChild(link);
    }

    observeElements(selector, callback) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        callback.call(this, entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { rootMargin: '200%' }
        );

        this.doc.querySelectorAll(selector).forEach(el => observer.observe(el));
    }

    loadPostPager(container) {
        container.querySelectorAll('a').forEach(link => {
            const span = this.doc.createElement('span');
            this.addClass(span, 'd-block fw-bold pt-2 jt-text-primary');
            link.appendChild(span);
            
            const xhr = new XMLHttpRequest();
            xhr.open('GET', link.href);
            xhr.setRequestHeader('Content-Type', 'text/html');
            xhr.onload = () => {
                const title = xhr.responseText.match(/<title>(.*?)<\/title>/)[1];
                span.innerHTML = title.replace(this.config.titleSeparator + this.config.blogTitle, '');
            };
            xhr.send();
        });
    }
}

(function() {
    new JetTheme();
})();
