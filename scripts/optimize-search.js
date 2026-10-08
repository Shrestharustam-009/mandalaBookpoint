const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../lib/db-service.js');
let content = fs.readFileSync(file, 'utf8');

const oldSearch = `    search: async (queryText) => {
      const searchTerm = \`%\${queryText.toLowerCase()}%\`;
      const results = await query(
        \`SELECT * FROM books 
         WHERE LOWER(title) LIKE ? 
            OR LOWER(author) LIKE ? 
            OR LOWER(description) LIKE ?
         ORDER BY created_at DESC\`,
        [searchTerm, searchTerm, searchTerm]
      );`;

const newSearch = `    search: async (queryText) => {
      const cleanTerm = queryText.trim().toLowerCase();
      const exactMatch = cleanTerm;
      const startsWith = \`\${cleanTerm}%\`;
      const contains = \`%\${cleanTerm}%\`;
      
      // Production-grade weighted SQL search for relevance
      const results = await query(
        \`SELECT *,
          (CASE WHEN LOWER(title) = ? THEN 100 ELSE 0 END) +
          (CASE WHEN LOWER(title) LIKE ? THEN 50 ELSE 0 END) +
          (CASE WHEN LOWER(title) LIKE ? THEN 20 ELSE 0 END) +
          (CASE WHEN LOWER(author) LIKE ? THEN 10 ELSE 0 END) +
          (CASE WHEN LOWER(description) LIKE ? THEN 2 ELSE 0 END) AS relevance
         FROM books 
         WHERE LOWER(title) LIKE ? 
            OR LOWER(author) LIKE ? 
            OR LOWER(description) LIKE ?
         ORDER BY relevance DESC, created_at DESC
         LIMIT 50\`,
        [
          exactMatch, startsWith, contains, contains, contains, // For Relevance score
          contains, contains, contains                            // For WHERE clause
        ]
      );`;

content = content.replace(oldSearch, newSearch);

fs.writeFileSync(file, content, 'utf8');
console.log('Search optimized');
