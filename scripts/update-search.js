const fs = require('fs');
const path = require('path');

const headerFile = path.join(__dirname, '../components/Header.jsx');
let content = fs.readFileSync(headerFile, 'utf8');

// Add imports
if (!content.includes('useRef')) {
  content = content.replace("import { useState } from 'react';", "import { useState, useEffect, useRef } from 'react';\nimport { api } from '@/lib/api';");
}

// Add state variables inside component
const stateCode = `  const { getCartItemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const cartItemCount = getCartItemCount();

  // Search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setIsSearching(true);
        try {
          const results = await api.books.search(searchQuery);
          setSearchResults(results.slice(0, 5));
        } catch (err) {
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowDropdown(false);
      router.push(\`/books?search=\${encodeURIComponent(searchQuery)}\`);
    }
  };`;

content = content.replace(/  const { getCartItemCount } = useCart\(\);\n  const \[menuOpen, setMenuOpen\] = useState\(false\);\n  const cartItemCount = getCartItemCount\(\);/, stateCode);

// Replace the HTML form
const oldSearch = `<form className="header-search desktop-only" onSubmit={(e) => { e.preventDefault(); router.push(\`/books?search=\${e.target.elements.search.value}\`); }}>
            <input type="text" name="search" placeholder="Search for books or authors..." className="header-search-input" />
            <button type="submit" className="header-search-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </button>
          </form>`;

const newSearch = `<div className="header-search-container desktop-only" ref={searchRef}>
            <form className="header-search" onSubmit={handleSearchSubmit}>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => {
                  if (searchQuery.trim().length > 1) setShowDropdown(true);
                }}
                placeholder="Search for books or authors..." 
                className="header-search-input" 
              />
              <button type="submit" className="header-search-btn" aria-label="Search">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </button>
            </form>

            {/* Live Search Dropdown */}
            {showDropdown && searchQuery.trim().length > 1 && (
              <div className="search-dropdown">
                {isSearching ? (
                  <div className="search-dropdown-message">Searching...</div>
                ) : searchResults.length > 0 ? (
                  <>
                    <div className="search-results-list">
                      {searchResults.map(book => (
                        <Link 
                          key={book.id} 
                          href={\`/books/\${book.id}\`}
                          className="search-result-item"
                          onClick={() => {
                            setShowDropdown(false);
                            setSearchQuery('');
                          }}
                        >
                          <img src={book.coverImage || '/placeholder.jpg'} alt={book.title} className="search-result-img" />
                          <div className="search-result-info">
                            <h4 className="search-result-title">{book.title}</h4>
                            <span className="search-result-author">{book.author}</span>
                          </div>
                          <div className="search-result-price">
                            NPR {book.price}
                          </div>
                        </Link>
                      ))}
                    </div>
                    <Link 
                      href={\`/books?search=\${encodeURIComponent(searchQuery)}\`}
                      className="search-view-all"
                      onClick={() => setShowDropdown(false)}
                    >
                      View all results for "{searchQuery}"
                    </Link>
                  </>
                ) : (
                  <div className="search-dropdown-message">No books found for "{searchQuery}"</div>
                )}
              </div>
            )}
          </div>`;

content = content.replace(oldSearch, newSearch);
fs.writeFileSync(headerFile, content, 'utf8');
console.log('Header.jsx updated!');
