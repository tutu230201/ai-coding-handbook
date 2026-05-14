// ===== Search Functionality (Fuse.js) =====

(function() {
    // Load Fuse.js from CDN
    const fuseScript = document.createElement('script');
    fuseScript.src = 'https://cdn.jsdelivr.net/npm/fuse.js@7.0.0/dist/fuse.min.js';
    fuseScript.onload = initSearch;
    document.head.appendChild(fuseScript);

    function initSearch() {
        const searchInput = document.getElementById('search-input');
        const searchResults = document.getElementById('search-results');
        if (!searchInput || !searchResults) return;

        const indexData = window.searchIndex || [];
        const fuse = new Fuse(indexData, {
            keys: [
                { name: 'title', weight: 0.4 },
                { name: 'summary', weight: 0.3 },
                { name: 'tags', weight: 0.2 },
                { name: 'category', weight: 0.1 }
            ],
            threshold: 0.4,
            includeScore: true,
            minMatchCharLength: 1
        });

        searchInput.addEventListener('input', function() {
            const query = this.value.trim();
            if (query.length < 1) {
                searchResults.innerHTML = getEmptyPrompt();
                return;
            }

            const results = fuse.search(query);

            if (results.length === 0) {
                searchResults.innerHTML = getNoResults(query);
                return;
            }

            searchResults.innerHTML = results.slice(0, 10).map(function(result) {
                const item = result.item;
                const difficultyBadge = getDifficultyBadge(item.difficulty);
                return `
                    <a href="${item.url}" class="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors">
                        <div class="flex items-start justify-between">
                            <div class="flex-1 min-w-0">
                                <h4 class="font-medium text-gray-900 dark:text-white truncate">${highlightMatch(item.title, query)}</h4>
                                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">${highlightMatch(item.summary, query)}</p>
                                <div class="flex items-center gap-2 mt-2">
                                    <span class="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">${item.category}</span>
                                    ${difficultyBadge}
                                    <span class="text-xs text-gray-400">${item.readTime || ''}</span>
                                </div>
                            </div>
                        </div>
                    </a>
                `;
            }).join('');
        });

        function getEmptyPrompt() {
            return `
                <div class="p-8 text-center text-gray-400">
                    <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                    <p>输入关键词搜索文章...</p>
                    <p class="text-xs mt-2">支持标题、摘要、标签搜索</p>
                </div>
            `;
        }

        function getNoResults(query) {
            return `
                <div class="p-8 text-center text-gray-400">
                    <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p>未找到 "<strong>${escapeHtml(query)}</strong>" 的相关文章</p>
                    <p class="text-xs mt-2">试试其他关键词</p>
                </div>
            `;
        }
    }

    function getDifficultyBadge(difficulty) {
        const map = {
            '入门': 'badge-beginner',
            '初级': 'badge-elementary',
            '中级': 'badge-intermediate',
            '高级': 'badge-advanced'
        };
        const cls = map[difficulty] || 'bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-300';
        if (!difficulty) return '';
        return `<span class="text-xs px-2 py-0.5 rounded-full ${cls}">${difficulty}</span>`;
    }

    function highlightMatch(text, query) {
        if (!text || !query) return text || '';
        const escaped = escapeHtml(text);
        const q = escapeHtml(query);
        const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return escaped.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">$1</mark>');
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
})();
