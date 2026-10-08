const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../lib/db-service.js');
let content = fs.readFileSync(file, 'utf8');

const regex = /search: async \(queryText\) => \{[\s\S]*?return results\.map/m;

const newSearch = `search: async (queryText) => {
      const terms = queryText.trim().toLowerCase().split(/\\s+/).filter(t => t.length > 0);
      if (terms.length === 0) return [];

      const exactMatch = queryText.trim().toLowerCase();
      
      let relevanceScoreSql = \`
        (CASE WHEN LOWER(title) = ? THEN 200 ELSE 0 END) +
        (CASE WHEN LOWER(title) LIKE ? THEN 100 ELSE 0 END)\`;
      
      let params = [exactMatch, \`\${exactMatch}%\`];
      let whereConditions = [];

      terms.forEach(term => {
        const likeTerm = \`%\${term}%\`;
        relevanceScoreSql += \`
          + (CASE WHEN LOWER(title) LIKE ? THEN 30 ELSE 0 END)
          + (CASE WHEN LOWER(author) LIKE ? THEN 15 ELSE 0 END)
          + (CASE WHEN LOWER(description) LIKE ? THEN 2 ELSE 0 END)\`;
        params.push(likeTerm, likeTerm, likeTerm);

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
      );
      
      return results.map`;

content = content.replace(regex, newSearch);

fs.writeFileSync(file, content, 'utf8');
console.log('Search patched!');
