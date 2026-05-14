// ===== Global JS: Navigation, Dark Mode, Utilities =====

document.addEventListener('DOMContentLoaded', function() {

    // --- Dark Mode ---
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

    // --- Mobile Menu ---
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
            const isOpen = !mobileMenu.classList.contains('hidden');
            menuToggle.innerHTML = isOpen
                ? '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>'
                : '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>';
        });
    }

    // --- Search Modal ---
    const searchBtn = document.getElementById('search-btn');
    const searchModal = document.getElementById('search-modal');
    const searchClose = document.getElementById('search-close');
    const searchInput = document.getElementById('search-input');

    if (searchBtn && searchModal) {
        searchBtn.addEventListener('click', function() {
            searchModal.classList.remove('hidden');
            searchModal.classList.add('flex');
            if (searchInput) setTimeout(() => searchInput.focus(), 100);
            document.body.style.overflow = 'hidden';
        });
    }

    if (searchClose && searchModal) {
        searchClose.addEventListener('click', closeSearch);
    }

    function closeSearch() {
        if (searchModal) {
            searchModal.classList.add('hidden');
            searchModal.classList.remove('flex');
            document.body.style.overflow = '';
        }
    }

    // Close search on Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeSearch();
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

    // --- Reading Progress ---
    const progressBar = document.getElementById('reading-progress');
    if (progressBar) {
        window.addEventListener('scroll', function() {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            progressBar.style.width = scrollPercent + '%';
        });
    }

    // --- Back to Top ---
    const backToTop = document.getElementById('back-to-top');
    if (backToTop) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                backToTop.classList.remove('hidden');
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.add('hidden');
                backToTop.classList.remove('visible');
            }
        });
        backToTop.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- Table of Contents Highlight ---
    const tocItems = document.querySelectorAll('.toc-item');
    const headings = document.querySelectorAll('.article-content h2, .article-content h3');
    if (tocItems.length > 0 && headings.length > 0) {
        window.addEventListener('scroll', function() {
            let current = '';
            headings.forEach(function(h) {
                const top = h.getBoundingClientRect().top;
                if (top <= 100) current = h.id;
            });
            tocItems.forEach(function(item) {
                item.classList.remove('active');
                if (item.dataset.target === current) {
                    item.classList.add('active');
                }
            });
        });
    }

    // --- Copy Code Buttons ---
    document.querySelectorAll('.article-content pre').forEach(function(pre) {
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
                setTimeout(function() {
                    btn.textContent = '复制';
                    btn.classList.remove('copied');
                }, 2000);
            });
        });
        pre.appendChild(btn);
    });

    // --- Active nav highlight ---
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-link').forEach(function(link) {
        const href = link.getAttribute('href');
        if (href && currentPath.includes(href) && href !== '/') {
            link.classList.add('text-indigo-500', 'dark:text-indigo-400');
        }
    });
});
