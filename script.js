document.addEventListener('DOMContentLoaded', () => {
    // Элементы DOM
    const articlesList = document.getElementById('articles-list');
    const viewerContainer = document.getElementById('viewer-container');
    const editorContainer = document.getElementById('editor-container');
    const articleEditor = document.getElementById('article-editor');
    const searchInput = document.getElementById('search-input');
    const saveBtn = document.getElementById('save-article');
    const cancelBtn = document.getElementById('cancel-edit');
    const newArticleBtn = document.getElementById('new-article');
    const themeToggle = document.getElementById('theme-toggle');
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');

    // Константы
    const CONTENTS_PATH = 'contents';
    const CACHE_PREFIX = 'wiki-cache-';
    let currentFile = null;
    let simpleMDE = null;

    // Инициализация редактора
    function initEditor() {
        simpleMDE = new SimpleMDE({
            element: articleEditor,
            spellChecker: false,
            autosave: {
                enabled: true,
                uniqueId: "wikipezd-editor",
                delay: 1000,
            },
        });
    }

    // Загрузка списка статей
    async function loadArticles() {
        try {
            const response = await fetch('articles.json');
            const articles = response.ok ? await response.json() : ["test.md"];
            renderArticlesList(articles);
        } catch (error) {
            console.error('Error loading articles:', error);
            renderArticlesList(["test.md"]);
        }
    }

    // Рендер списка статей
    function renderArticlesList(articles) {
        articlesList.innerHTML = '';
        articles.forEach(file => {
            const fileName = file.replace('.md', '');
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <a href="#" data-file="${file}">${fileName}</a>
                <button class="edit-btn" data-file="${file}">✏️</button>
            `;
            articlesList.appendChild(listItem);
        });

        // Обработчики кликов
        document.querySelectorAll('#articles-list a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                loadArticleContent(link.dataset.file);
            });
        });

        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                editArticle(btn.dataset.file);
            });
        });
    }

    // Загрузка содержимого статьи
    async function loadArticleContent(filename) {
        currentFile = filename;
        const cacheKey = CACHE_PREFIX + filename;
        const cached = localStorage.getItem(cacheKey);

        if (cached) {
            renderArticle(cached);
        }

        try {
            const response = await fetch(`${CONTENTS_PATH}/${filename}`);
            if (!response.ok) throw new Error('Article not found');
            
            const markdown = await response.text();
            localStorage.setItem(cacheKey, markdown);
            renderArticle(markdown);
            updateUrl(filename);
        } catch (error) {
            showError(error, filename);
        }
    }

    // Рендер статьи
    function renderArticle(markdown) {
        viewerContainer.innerHTML = marked.parse(markdown);
        viewerContainer.classList.remove('hidden');
        editorContainer.classList.remove('visible');
        hljs.highlightAll();
    }

    // Редактирование статьи
    async function editArticle(filename) {
        currentFile = filename;
        try {
            const response = await fetch(`${CONTENTS_PATH}/${filename}`);
            const markdown = await response.text();
            
            viewerContainer.classList.add('hidden');
            editorContainer.classList.add('visible');
            simpleMDE.value(markdown);
        } catch (error) {
            console.error('Error loading article for edit:', error);
        }
    }

    // Сохранение статьи
    async function saveArticle() {
        const content = simpleMDE.value();
        localStorage.setItem(CACHE_PREFIX + currentFile, content);
        
        // В реальном проекте здесь бы был fetch на сервер
        console.log('Saved:', currentFile, content);
        
        renderArticle(content);
    }

    // Создание новой статьи
    function newArticle() {
        currentFile = `new-${Date.now()}.md`;
        simpleMDE.value('# New Article\n\nStart writing here...');
        viewerContainer.classList.add('hidden');
        editorContainer.classList.add('visible');
    }

    // Поиск с debounce
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const filter = searchInput.value.toLowerCase();
            document.querySelectorAll('#articles-list li').forEach(item => {
                const text = item.textContent.toLowerCase();
                item.style.display = text.includes(filter) ? 'block' : 'none';
            });
        }, 300);
    });

    // Обработчики кнопок
    saveBtn.addEventListener('click', saveArticle);
    cancelBtn.addEventListener('click', () => {
        viewerContainer.classList.remove('hidden');
        editorContainer.classList.remove('visible');
    });
    newArticleBtn.addEventListener('click', newArticle);
    themeToggle.addEventListener('click', toggleTheme);
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('visible');
    });

    // Инициализация
    initEditor();
    loadArticles();
    
    // Загрузка статьи из URL
    const urlParams = new URLSearchParams(window.location.search);
    const articleParam = urlParams.get('article');
    if (articleParam) {
        loadArticleContent(`${articleParam}.md`);
    }

    // Вспомогательные функции
    function updateUrl(filename) {
        history.pushState(null, null, `?article=${filename.replace('.md', '')}`);
    }

    function showError(error, filename) {
        viewerContainer.innerHTML = `
            <div class="error">
                <h3>Error loading article</h3>
                <p>${error.message}</p>
                <p>Please check if file <code>${filename}</code> exists.</p>
            </div>
        `;
    }

    function toggleTheme() {
        document.body.dataset.theme = 
            document.body.dataset.theme === 'dark' ? 'light' : 'dark';
    }
});
