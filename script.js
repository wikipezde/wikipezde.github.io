document.addEventListener('DOMContentLoaded', () => {
    const articlesList = document.getElementById('articles-list');
    const articleContent = document.getElementById('article-content');
    const searchInput = document.getElementById('search-input');
    
    // Путь к папке с контентом
    const CONTENTS_PATH = 'contents';
    
    // Загрузка списка статей
    async function loadArticles() {
        try {
            // Пытаемся получить автоматически сгенерированный список
            const response = await fetch('articles.json');
            
            if (response.ok) {
                const articles = await response.json();
                renderArticlesList(articles);
            } else {
                // Fallback для локальной разработки
                const testArticles = [
                    "test.md",
                    "example.md"
                ];
                renderArticlesList(testArticles);
            }
        } catch (error) {
            console.error('Error loading articles:', error);
            renderArticlesList(["test.md"]);
        }
    }

    function renderArticlesList(articles) {
        articlesList.innerHTML = '';
        
        articles.forEach(file => {
            const fileName = file.replace('.md', '');
            const listItem = document.createElement('li');
            listItem.innerHTML = `<a href="#" data-file="${file}">${fileName}</a>`;
            articlesList.appendChild(listItem);
        });
        
        // Добавляем обработчики кликов
        document.querySelectorAll('#articles-list a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                loadArticleContent(link.dataset.file);
            });
        });
        
        // Загружаем статью из URL, если есть параметр
        const urlParams = new URLSearchParams(window.location.search);
        const articleParam = urlParams.get('article');
        
        if (articleParam) {
            loadArticleContent(`${articleParam}.md`);
        } else if (articles.includes('test.md')) {
            // По умолчанию загружаем test.md если она существует
            loadArticleContent('test.md');
        }
    }

    async function loadArticleContent(filename) {
        try {
            const response = await fetch(`${CONTENTS_PATH}/${filename}`);
            if (!response.ok) throw new Error('Article not found');
            
            const markdown = await response.text();
            articleContent.innerHTML = marked.parse(markdown);
            
            // Обновляем URL без перезагрузки страницы
            history.pushState(null, null, `?article=${filename.replace('.md', '')}`);
            
        } catch (error) {
            articleContent.innerHTML = `
                <div class="error">
                    <h3>Error loading article</h3>
                    <p>${error.message}</p>
                    <p>Please check if file <code>${filename}</code> exists in ${CONTENTS_PATH}/ directory.</p>
                </div>
            `;
        }
    }

    // Поиск по статьям
    searchInput.addEventListener('input', () => {
        const filter = searchInput.value.toLowerCase();
        const items = articlesList.querySelectorAll('li');
        
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(filter) ? 'block' : 'none';
        });
    });

    // Инициализация
    loadArticles();
});
