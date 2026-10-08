const fs = require('fs');
const path = require('path');

const cssFile = path.join(__dirname, '../components/Header.css');
let content = fs.readFileSync(cssFile, 'utf8');

content += `
.mobile-only {
  display: none;
}

@media (max-width: 768px) {
  .mobile-only {
    display: block;
    margin-bottom: 20px;
    width: 100%;
  }
  
  .mobile-only .header-search {
    margin-right: 0;
    width: 100%;
  }

  .mobile-only .header-search-input {
    width: 100%;
  }
  
  .mobile-only .search-dropdown {
    width: 100%;
    left: 0;
    right: 0;
  }
}
`;

fs.writeFileSync(cssFile, content, 'utf8');
console.log('Header.css updated for mobile search');
