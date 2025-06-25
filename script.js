document.addEventListener('DOMContentLoaded', () => {
    const articlesList = document.getElementById('articles-list');
    const articleContent = document.getElementById('article-content');
    const searchInput = document.getElementById('search-input');
    
    // GitHub API для получения содержимого папки
    const REPO_OWNER = 'ваш_логин_github';
    const REPO_NAME = 'ваш_репозиторий';
    const CONTENTS_PATH = 'contents';
    const API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${CONTENTS_PATH}`;

    // Загрузка списка статей
    async function loadArticles() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Ошибка загрузки статей');
            
            const files = await response.json();
            articlesList.innerHTML = '';
            
            files.filter(file => file.name.endsWith('.md')).forEach(file => {
                const fileName = file.name.replace('.md', '');
                const listItem = document.createElement('li');
                listItem.innerHTML = `<a href="#" data-url="${file.download_url}">${fileName}</a>`;
                articlesList.appendChild(listItem);
            });
            
            // Обработка кликов
            document.querySelectorAll('#articles-list a').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    loadArticleContent(link.dataset.url);
                });
            });
            
            // Поиск
            searchInput.addEventListener('input', filterArticles);
            
        } catch (error) {
            articlesList.innerHTML = `<li>Ошибка: ${error.message}</li>`;
        }
    }

    // Загрузка содержимого статьи
    async function loadArticleContent(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Ошибка загрузки статьи');
            
            const markdown = await response.text();
            articleContent.innerHTML = marked.parse(markdown);
            
        } catch (error) {
            articleContent.innerHTML = `<p>Ошибка: ${error.message}</p>`;
        }
    }

    // Фильтрация статей
    function filterArticles() {
        const filter = searchInput.value.toLowerCase();
        const items = articlesList.querySelectorAll('li');
        
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(filter) ? 'block' : 'none';
        });
    }

    // Автозагрузка статьи из URL-параметра
    function loadFromUrlParam() {
        const params = new URLSearchParams(window.location.search);
        const article = params.get('article');
        
        if (article) {
            const articleUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/contents/${article}.md`;
            loadArticleContent(articleUrl);
        }
    }

    // Инициализация
    loadArticles();
    loadFromUrlParam();
});
