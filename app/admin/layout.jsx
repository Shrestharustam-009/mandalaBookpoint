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
    <div className="min-h-screen bg-[#fafafa] flex font-sans text-gray-900">
      
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity duration-300 ease-soft"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Glassmorphism Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/80 backdrop-blur-md border-r border-gray-200/60 shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col transition-transform duration-[400ms] ease-spring ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h1 className="text-xl font-bold tracking-tight text-gray-900">
            <Link href="/admin" className="hover:text-primary transition-colors duration-200">
              {siteConfig.siteName}
            </Link>
          </h1>
          {isMobile && (
            <button
              className="p-2 -mr-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {menuItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ease-out hover:scale-[1.02] ${
                pathname === item.href 
                  ? 'bg-primary/10 text-primary font-medium shadow-[0_4px_12px_rgba(79,70,229,0.08)]' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <Link 
            href="/" 
            className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors"
          >
            ← Back to Site
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main 
        className={`flex-1 flex flex-col min-w-0 transition-all duration-[400ms] ease-spring ${
          sidebarOpen ? 'md:ml-64' : 'ml-0'
        }`}
      >
        {/* Glassmorphism Header */}
        <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-md border-b border-gray-200/60 px-6 py-4 flex items-center justify-between shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-4">
            <button
              className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={24} />
            </button>
            <h2 className="hidden sm:block text-lg font-semibold text-gray-800">Admin Dashboard</h2>
          </div>
          
          <div className="flex items-center gap-5">
            <span className="text-sm font-medium text-gray-600 hidden sm:block">
              {user?.name || user?.email || 'Admin User'}
            </span>
            <button 
              className="px-4 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary hover:text-white rounded-lg transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(79,70,229,0.2)]"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="p-4 md:p-8 lg:p-10 mx-auto w-full max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
