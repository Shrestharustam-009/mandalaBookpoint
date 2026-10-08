const fs = require('fs');
const path = require('path');

const cssFile = path.join(__dirname, '../components/Header.css');
let content = fs.readFileSync(cssFile, 'utf8');

content = content.replace('.header-search {', '.header-search-container { position: relative; margin-right: 15px; }\n\n.header-search {');
content = content.replace('margin-right: 15px;', '/* margin-right moved to container */');

content += `
.search-dropdown { position: absolute; top: calc(100% + 10px); right: 0; width: 320px; background: white; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; z-index: 100; overflow: hidden; }
.search-dropdown-message { padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
.search-results-list { max-height: 350px; overflow-y: auto; }
.search-result-item { display: flex; align-items: center; padding: 12px 15px; border-bottom: 1px solid #f3f4f6; text-decoration: none; transition: background-color 0.2s; gap: 12px; }
.search-result-item:last-child { border-bottom: none; }
.search-result-item:hover { background-color: #f9fafb; }
.search-result-img { width: 40px; height: 56px; object-fit: cover; border-radius: 4px; background-color: #f3f4f6; flex-shrink: 0; }
.search-result-info { flex: 1; min-width: 0; }
.search-result-title { font-size: 14px; font-weight: 600; color: #111827; margin: 0 0 4px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.search-result-author { font-size: 12px; color: #6b7280; display: block; }
.search-result-price { font-size: 14px; font-weight: 700; color: #1e3a8a; white-space: nowrap; }
.search-view-all { display: block; text-align: center; padding: 12px; background: #f8fafc; color: #2563eb; font-size: 14px; font-weight: 600; text-decoration: none; transition: background-color 0.2s; border-top: 1px solid #e5e7eb; }
.search-view-all:hover { background: #f1f5f9; }
`;

fs.writeFileSync(cssFile, content, 'utf8');
console.log('Appended CSS to Header.css');
