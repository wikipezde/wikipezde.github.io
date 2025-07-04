# Wikipezde Documentation

Simple web application for viewing Markdown documentation. A mini-wiki with search, dynamic article loading, and responsive design.

## Features

- Load articles from the `contents` folder (supports .md files).
- Search through article titles (no page reload).
- Render Markdown with syntax highlighting (via marked.js).
- Responsive design (works on mobile devices).
- Dynamic URLs (e.g., `?article=test`).

## Installation & Setup

1. Clone the repository:
   git clone https://github.com///wikipezde.git
   cd wikipezde

2. Add articles:
   - Create a `contents` folder and add .md files (e.g., `test.md`).

3. Run:
   - Open `index.html` in a browser or use Live Server in VS Code.

4. (Optional) For automatic article listing:
   - Generate `articles.json` (see example script below).

## Project Structure

wikipezde/
├── contents/          # Folder for Markdown articles
│   ├── test.md
│   └── example.md
├── index.html         # Main page
├── styles.css         # Styles
├── script.js          # Application logic
└── articles.json      # Auto-generated article list (optional)

## Generating articles.json

Example Node.js script (`generate-articles.js`):
const fs = require('fs');
const path = './contents';
const files = fs.readdirSync(path).filter(file => file.endsWith('.md'));
fs.writeFileSync('articles.json', JSON.stringify(files));

Run: node generate-articles.js.

## Dependencies

- marked.js (https://marked.js.org/) — Markdown parsing (loaded via CDN).

## License

MIT. Free to use!

---

Note: This project is for learning/demo purposes. For production, add a backend (e.g., Node.js + Express).
