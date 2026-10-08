const fs = require('fs');
const path = require('path');

const headerFile = path.join(__dirname, '../components/Header.jsx');
let content = fs.readFileSync(headerFile, 'utf8');

// 1. Add mobileSearchRef and update useEffect
content = content.replace("const searchRef = useRef(null);", "const searchRef = useRef(null);\n  const mobileSearchRef = useRef(null);");

const oldUseEffect = `  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);`;

const newUseEffect = `  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        (searchRef.current && !searchRef.current.contains(event.target)) &&
        (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target))
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);`;

content = content.replace(oldUseEffect, newUseEffect);

// 2. Extract renderSearch function
const searchJSX = `          <div className="header-search-container desktop-only" ref={searchRef}>
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
                            setMenuOpen(false); // Close mobile menu too
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
                      onClick={() => { setShowDropdown(false); setMenuOpen(false); }}
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

const renderSearchFn = `  const renderSearch = (isMobile = false) => (
    <div className={\`header-search-container \${isMobile ? 'mobile-only' : 'desktop-only'}\`} ref={isMobile ? mobileSearchRef : searchRef}>
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
                      setMenuOpen(false);
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
                onClick={() => { setShowDropdown(false); setMenuOpen(false); }}
              >
                View all results for "{searchQuery}"
              </Link>
            </>
          ) : (
            <div className="search-dropdown-message">No books found for "{searchQuery}"</div>
          )}
        </div>
      )}
    </div>
  );

  return (`;

content = content.replace("  return (", renderSearchFn);

// 3. Inject {renderSearch(true)} at the top of header-nav
const navOpen = `<nav className={\`header-nav \${menuOpen ? 'open' : ''}\`}>`;
content = content.replace(navOpen, navOpen + "\n          {renderSearch(true)}");

// 4. Replace the old hardcoded search block with {renderSearch(false)}
content = content.replace(searchJSX, "{renderSearch(false)}");

fs.writeFileSync(headerFile, content, 'utf8');
console.log('Mobile search added!');
