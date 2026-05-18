'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCart } from '@/app/cart-context';
import { Menu, X, LogOut, ShoppingCart } from 'lucide-react';
import siteConfig from '@/config/siteConfig';
import './Header.css';

export default function Header({ isAuthenticated, user }) {
  const router = useRouter();
  const { getCartItemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const cartItemCount = getCartItemCount();

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.reload();
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-logo">
          <Link href="/" className="logo-link" onClick={() => setMenuOpen(false)}>
            <span className="logo-text">{siteConfig.siteName}</span>
          </Link>
        </div>

        <nav className={`header-nav ${menuOpen ? 'open' : ''}`}>
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
          <Link href="/cart" className="cart-link" onClick={() => setMenuOpen(false)}>
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
