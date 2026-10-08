const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../lib/db-service.js');
let content = fs.readFileSync(file, 'utf8');

// I need to replace the entire search block again. 
// Instead of simple replacement, I'll use regex to grab the search function.
// Since it's nested in orders/books, I'll just write a custom script.
// Wait, I can just replace the block I just put in.

const oldSearch = `    search: async (queryText) => {
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

const newSearch = `    search: async (queryText) => {
      const terms = queryText.trim().toLowerCase().split(/\\s+/).filter(t => t.length > 0);
      if (terms.length === 0) return [];

      const exactMatch = queryText.trim().toLowerCase();
      
      let relevanceScoreSql = \`
        (CASE WHEN LOWER(title) = ? THEN 200 ELSE 0 END) +
        (CASE WHEN LOWER(title) LIKE ? THEN 100 ELSE 0 END)
      \`;
      
      let params = [exactMatch, \`\${exactMatch}%\`];
      let whereConditions = [];

      terms.forEach(term => {
        const likeTerm = \`%\${term}%\`;
        // Add score for each word matched
        relevanceScoreSql += \`
          + (CASE WHEN LOWER(title) LIKE ? THEN 30 ELSE 0 END)
          + (CASE WHEN LOWER(author) LIKE ? THEN 15 ELSE 0 END)
          + (CASE WHEN LOWER(description) LIKE ? THEN 2 ELSE 0 END)
        \`;
        params.push(likeTerm, likeTerm, likeTerm);

        // Word must exist in either title, author, or description (AND logic between words)
        whereConditions.push(\`(LOWER(title) LIKE ? OR LOWER(author) LIKE ? OR LOWER(description) LIKE ?)\`);
        params.push(likeTerm, likeTerm, likeTerm);
      });

      const whereClause = whereConditions.join(' AND ');

      // Production-grade multi-word weighted SQL search
      const results = await query(
        \`SELECT *, (\${relevanceScoreSql}) AS relevance
         FROM books 
         WHERE \${whereClause}
         ORDER BY relevance DESC, created_at DESC
         LIMIT 50\`,
        params
      );`;

content = content.replace(oldSearch, newSearch);

fs.writeFileSync(file, content, 'utf8');
console.log('Advanced search applied');
