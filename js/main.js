// ===== Global JS: Navigation, Dark Mode, Toast, Scroll Reveal, Utilities =====

document.addEventListener('DOMContentLoaded', function() {

    // =============================================
    // --- Debounce Utility ---
    // =============================================
    function debounce(fn, delay) {
        let timer;
        return function() {
            var context = this, args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function() { fn.apply(context, args); }, delay);
        };
    }

    // =============================================
    // --- Toast Notification System ---
    // =============================================
    var toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    window.showToast = function(message, type) {
        if (type === undefined) type = 'success';
        var toast = document.createElement('div');
        toast.className = 'toast toast-' + type;

        var iconMap = {
            success: '<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>',
            error: '<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>',
            info: '<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
        };
        toast.innerHTML = (iconMap[type] || '') + '<span>' + message + '</span>';
        toastContainer.appendChild(toast);

        setTimeout(function() {
            toast.classList.add('toast-exit');
            setTimeout(function() {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 300);
        }, 3000);
    };

    // =============================================
    // --- Page Fade-in ---
    // =============================================
    // Fade-in is handled by CSS animation on body.
    // Ensure page starts visible even if CSS hasn't loaded.
    document.body.style.opacity = '1';

    // =============================================
    // --- Dark Mode ---
    // =============================================
    const darkToggle = document.getElementById('dark-toggle');
    const html = document.documentElement;

    function setDarkMode(isDark) {
        if (isDark) {
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
        }
        localStorage.setItem('dark-mode', isDark ? 'true' : 'false');
        updateDarkIcon(isDark);
    }

    function updateDarkIcon(isDark) {
        if (!darkToggle) return;
        const sun = darkToggle.querySelector('.dark-icon-sun');
        const moon = darkToggle.querySelector('.dark-icon-moon');
        if (sun && moon) {
            sun.classList.toggle('hidden', !isDark);
            moon.classList.toggle('hidden', isDark);
        }
    }

    // Init dark mode: prefer localStorage, then system preference
    const storedDark = localStorage.getItem('dark-mode');
    if (storedDark !== null) {
        setDarkMode(storedDark === 'true');
    } else {
        setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }

    if (darkToggle) {
        darkToggle.addEventListener('click', function() {
            setDarkMode(!html.classList.contains('dark'));
        });
    }

    // Listen for system changes when no stored preference
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
        if (localStorage.getItem('dark-mode') === null) {
            setDarkMode(e.matches);
        }
    });

    // =============================================
    // --- Mobile Menu with Slide Animation ---
    // =============================================
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuToggle && mobileMenu) {
        // Initialize closed state: ensure hidden class is present
        mobileMenu.classList.remove('open');

        menuToggle.addEventListener('click', function() {
            const isOpen = mobileMenu.classList.contains('open');
            mobileMenu.classList.toggle('open');
            menuToggle.innerHTML = !isOpen
                ? '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>'
                : '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>';
        });
    }

    // =============================================
    // --- Search Modal ---
    // =============================================
    const searchBtn = document.getElementById('search-btn');
    const searchModal = document.getElementById('search-modal');
    const searchClose = document.getElementById('search-close');
    const searchInput = document.getElementById('search-input');

    if (searchBtn && searchModal) {
        searchBtn.addEventListener('click', function() {
            searchModal.classList.remove('hidden');
            searchModal.classList.add('open', 'flex');
            if (searchInput) setTimeout(function() { searchInput.focus(); }, 100);
            document.body.style.overflow = 'hidden';
        });
    }

    if (searchClose && searchModal) {
        searchClose.addEventListener('click', closeSearch);
    }

    function closeSearch() {
        if (searchModal) {
            searchModal.classList.add('hidden');
            searchModal.classList.remove('open', 'flex');
            document.body.style.overflow = '';
        }
    }

    // Close search on Escape with focus trap awareness
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (searchModal && !searchModal.classList.contains('hidden')) {
                closeSearch();
                return;
            }
        }
        // Ctrl+K to open search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (searchBtn) searchBtn.click();
        }
    });

    // Close search on backdrop click
    if (searchModal) {
        searchModal.addEventListener('click', function(e) {
            if (e.target === searchModal) closeSearch();
        });
    }

    // =============================================
    // --- Reading Progress ---
    // =============================================
    const progressBar = document.getElementById('reading-progress');
    if (progressBar) {
        var updateProgress = debounce(function() {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            progressBar.style.width = scrollPercent + '%';
        }, 16); // ~60fps
        window.addEventListener('scroll', updateProgress, { passive: true });
    }

    // =============================================
    // --- Sticky Nav Shadow ---
    // =============================================
    const nav = document.querySelector('nav');
    if (nav) {
        var updateNavShadow = debounce(function() {
            if (window.scrollY > 10) {
                nav.classList.add('nav-scrolled');
            } else {
                nav.classList.remove('nav-scrolled');
            }
        }, 16);
        window.addEventListener('scroll', updateNavShadow, { passive: true });
        // Initial check
        updateNavShadow();
    }

    // =============================================
    // --- Back to Top ---
    // =============================================
    const backToTop = document.getElementById('back-to-top');
    if (backToTop) {
        var updateBackToTop = debounce(function() {
            if (window.scrollY > 300) {
                backToTop.classList.remove('hidden');
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.add('hidden');
                backToTop.classList.remove('visible');
            }
        }, 100);
        window.addEventListener('scroll', updateBackToTop, { passive: true });
        backToTop.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // =============================================
    // --- Smooth Scroll for All Internal Anchor Links ---
    // =============================================
    document.addEventListener('click', function(e) {
        var link = e.target.closest('a');
        if (!link) return;
        var href = link.getAttribute('href');
        if (!href || href.indexOf('#') !== 0) return;
        if (href === '#') return;

        var targetEl = document.getElementById(href.substring(1));
        if (targetEl) {
            e.preventDefault();
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Update URL hash without jumping
            if (history.pushState) {
                history.pushState(null, null, href);
            }
        }
    });

    // =============================================
    // --- Table of Contents Highlight & Auto-generation ---
    // =============================================
    const tocItems = document.querySelectorAll('.toc-item');
    const headings = document.querySelectorAll('.article-content h2, .article-content h3');
    var tocContainer = document.querySelector('.toc-sidebar ul, .toc-sidebar');

    // Auto-generate ToC items if none exist with data-target, but h2/h3 headings exist
    if (tocItems.length === 0 && headings.length > 0 && tocContainer) {
        headings.forEach(function(h) {
            if (!h.id) {
                h.id = h.textContent.toLowerCase().replace(/[^a-z0-9一-龥]+/g, '-').replace(/^-|-$/g, '');
            }
            var item = document.createElement('div');
            item.className = 'toc-item ' + h.tagName.toLowerCase();
            item.setAttribute('data-target', h.id);
            item.textContent = h.textContent;
            item.addEventListener('click', function() {
                var target = document.getElementById(this.getAttribute('data-target'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    if (history.pushState) {
                        history.pushState(null, null, '#' + this.getAttribute('data-target'));
                    }
                }
            });
            tocContainer.appendChild(item);
        });
        // Re-query after auto-generation
        var updatedTocItems = document.querySelectorAll('.toc-item');
        if (updatedTocItems.length > 0 && headings.length > 0) {
            var updateToc = debounce(function() {
                var current = '';
                headings.forEach(function(h) {
                    var top = h.getBoundingClientRect().top;
                    if (top <= 100) current = h.id;
                });
                updatedTocItems.forEach(function(item) {
                    item.classList.remove('active');
                    if (item.getAttribute('data-target') === current) {
                        item.classList.add('active');
                    }
                });
            }, 100);
            window.addEventListener('scroll', updateToc, { passive: true });
        }
    } else if (tocItems.length > 0 && headings.length > 0) {
        var updateToc = debounce(function() {
            var current = '';
            headings.forEach(function(h) {
                var top = h.getBoundingClientRect().top;
                if (top <= 100) current = h.id;
            });
            tocItems.forEach(function(item) {
                item.classList.remove('active');
                if (item.getAttribute('data-target') === current) {
                    item.classList.add('active');
                }
            });
        }, 100);
        window.addEventListener('scroll', updateToc, { passive: true });
    }

    // =============================================
    // --- Copy Code Buttons ---
    // =============================================
    document.querySelectorAll('.article-content pre').forEach(function(pre) {
        // Skip if already has a copy button
        if (pre.querySelector('.copy-btn')) return;

        const btn = document.createElement('button');
        btn.className = 'copy-btn';
        btn.textContent = '复制';
        btn.addEventListener('click', function() {
            const code = pre.querySelector('code');
            if (!code) return;
            const text = code.textContent;
            navigator.clipboard.writeText(text).then(function() {
                btn.textContent = '已复制!';
                btn.classList.add('copied');
                if (window.showToast) showToast('代码已复制到剪贴板', 'success');
                setTimeout(function() {
                    btn.textContent = '复制';
                    btn.classList.remove('copied');
                }, 2000);
            }).catch(function() {
                // Fallback
                const ta = document.createElement('textarea');
                ta.value = text;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                btn.textContent = '已复制!';
                btn.classList.add('copied');
                if (window.showToast) showToast('代码已复制到剪贴板', 'success');
                setTimeout(function() {
                    btn.textContent = '复制';
                    btn.classList.remove('copied');
                }, 2000);
            });
        });
        pre.appendChild(btn);
    });

    // =============================================
    // --- Active nav highlight ---
    // =============================================
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-link').forEach(function(link) {
        const href = link.getAttribute('href');
        if (href && currentPath.includes(href) && href !== '/') {
            link.classList.add('text-indigo-500', 'dark:text-indigo-400');
        }
    });

    // =============================================
    // --- Scroll Reveal (Intersection Observer) ---
    // =============================================
    function initScrollReveal() {
        var revealElements = document.querySelectorAll('.reveal, .stagger-item, section > .grid, .article-card, .tool-card, .category-card');

        if ('IntersectionObserver' in window) {
            var observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.08,
                rootMargin: '0px 0px -50px 0px'
            });

            revealElements.forEach(function(el) {
                // Only observe elements not already visible
                if (!el.classList.contains('visible')) {
                    // Add reveal base class if not already present
                    if (!el.classList.contains('reveal') && !el.classList.contains('stagger-item')) {
                        el.classList.add('reveal');
                    }
                    observer.observe(el);
                }
            });
        } else {
            // Fallback: show everything immediately
            revealElements.forEach(function(el) {
                el.classList.add('visible');
            });
        }
    }

    // Run scroll reveal after a small delay to let the page render
    setTimeout(initScrollReveal, 100);

    // Also run on dynamic content changes
    var revealObserver = new MutationObserver(function() {
        initScrollReveal();
    });
    var mainContent = document.querySelector('main') || document.body;
    revealObserver.observe(mainContent, { childList: true, subtree: true });

    // =============================================
    // --- Lazy Image Loading ---
    // =============================================
    document.querySelectorAll('img[loading]').forEach(function(img) {
        if (img.getAttribute('loading') !== 'lazy') return;
        // Already lazy-loaded by native attribute, but add observer for older browsers
        if ('IntersectionObserver' in window) {
            var imgObserver = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        var el = entry.target;
                        if (el.dataset.src) el.src = el.dataset.src;
                        imgObserver.unobserve(el);
                    }
                });
            });
            imgObserver.observe(img);
        }
    });

    console.log('AI编程指南 - 站点已加载, 版本 2.0');
});
