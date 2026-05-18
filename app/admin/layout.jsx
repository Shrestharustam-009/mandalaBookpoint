'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/app/auth-context';
import siteConfig from '@/config/siteConfig';
import './admin.css';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout, loading: authLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Protect admin routes - check authentication and admin role
  useEffect(() => {
    // Don't redirect if we're already on the login page
    if (pathname === '/admin/login') {
      return;
    }

    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }

    // Redirect to login if not authenticated or not admin
    if (!isAuthenticated || !user || user.role !== 'admin') {
      router.push('/admin/login');
    }
  }, [isAuthenticated, user, authLoading, pathname, router]);

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="admin-layout">
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh',
          fontSize: '16px',
          color: '#6b7280'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  // Don't render admin layout if not authenticated or not admin (will redirect)
  if (pathname !== '/admin/login' && (!isAuthenticated || !user || user.role !== 'admin')) {
    return null;
  }

  // Don't render admin layout for login page - let it render standalone
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  const menuItems = [
    { label: 'Dashboard', href: '/admin', icon: '📊' },
    { label: 'Categories', href: '/admin/categories', icon: '📚' },
    { label: 'Books', href: '/admin/books', icon: '📖' },
    { label: 'Blog', href: '/admin/blog', icon: '📝' },
    { label: 'Users', href: '/admin/users', icon: '👥' },
    { label: 'Reviews', href: '/admin/reviews', icon: '⭐' },
    { label: 'Popups', href: '/admin/popups', icon: '📢' },
    { label: 'Newsletter', href: '/admin/newsletter', icon: '📧' },
    { label: 'Orders', href: '/admin/orders', icon: '🛍️' },
    { label: 'Settings', href: '/admin/settings', icon: '⚙️' },
  ];

  return (
    <div className="admin-layout">
      {isMobile && sidebarOpen && (
        <div 
          className="admin-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-title">
            <Link href="/admin" className="logo-link">
              {siteConfig.siteName}
            </Link>
          </h1>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href} className="nav-item">
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link href="/" className="footer-link">
            ← Back to Site
          </Link>
        </div>
      </div>

      <div className="admin-main">
        <div className="admin-header">
          {isMobile && (
            <button
              className="sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
              style={{ marginRight: '15px' }}
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
          <h2>Admin Dashboard</h2>
          <div className="header-actions">
            <span className="user-info">{user?.name || user?.email || 'Admin User'}</span>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
