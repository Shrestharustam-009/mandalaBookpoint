const fs = require('fs');
const path = require('path');

const content = `'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { useCart } from '@/app/cart-context';
import { Menu, X, LogOut, ShoppingCart } from 'lucide-react';
import siteConfig from '@/config/siteConfig';
import './Header.css';

export default function Header({ isAuthenticated, user }) {
  const router = useRouter();
  const { getCartItemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const cartItemCount = getCartItemCount();

  // Search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);

  useEffect(() => {
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
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.reload();
  };

  const renderSearch = (isMobile = false) => (
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

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-logo">
          <Link href="/" className="logo-link" onClick={() => setMenuOpen(false)}>
            <span className="logo-text">{siteConfig.siteName}</span>
          </Link>
        </div>

        <nav className={\`header-nav \${menuOpen ? 'open' : ''}\`}>
          {renderSearch(true)}
          <Link href="/" className="nav-link" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="/books" className="nav-link" onClick={() => setMenuOpen(false)}>Browse Books</Link>
          <Link href="/blog" className="nav-link" onClick={() => setMenuOpen(false)}>Blog</Link>
          <Link href="/about" className="nav-link" onClick={() => setMenuOpen(false)}>About</Link>
          
          {/* Mobile-only actions in nav */}
          <div className="mobile-nav-actions">
            {isAuthenticated && user ? (
              <>
                <div className="user-info-mobile">
                  <span className="user-name-mobile">{user.name}</span>
                </div>
                <button className="btn-logout-mobile" onClick={() => { handleLogout(); setMenuOpen(false); }}>
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-login-mobile" onClick={() => setMenuOpen(false)}>
                  Login
                </Link>
                <Link href="/register" className="btn-register-mobile" onClick={() => setMenuOpen(false)}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </nav>

        <div className="header-actions">
          {renderSearch(false)}
          <Link href="/cart" id="cart-icon" className="cart-link" onClick={() => setMenuOpen(false)}>
            <ShoppingCart size={20} />
            {cartItemCount > 0 && (
              <span className="cart-badge">{cartItemCount}</span>
            )}
          </Link>
          {isAuthenticated && user ? (
            <>
              <div className="user-info desktop-only">
                <span className="user-name">{user.name}</span>
              </div>
              <button className="btn-logout desktop-only" onClick={handleLogout}>
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-login desktop-only">
                Login
              </Link>
              <Link href="/register" className="btn-register desktop-only">
                Sign Up
              </Link>
            </>
          )}
        </div>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Overlay for mobile menu */}
      {menuOpen && (
        <div 
          className="menu-overlay"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </header>
  );
}
`;

fs.writeFileSync(path.join(__dirname, '../components/Header.jsx'), content, 'utf8');
console.log('Fully replaced Header.jsx');
