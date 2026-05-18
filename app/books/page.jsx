'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import { useAuth } from '@/app/auth-context';
import { api } from '@/lib/api';
import BookCard from '@/components/BookCard';
import siteConfig from '@/config/siteConfig';
import './books.css';

function BooksContent() {
  const { isAuthenticated, user } = useAuth();
  const searchParams = useSearchParams();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const sliderRef = useRef(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isUserHovering, setIsUserHovering] = useState(false);

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(parseInt(categoryParam));
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [booksData, categoriesData] = await Promise.all([
          api.books.getAll(),
          api.categories.getAll(),
        ]);
        setBooks(Array.isArray(booksData) ? booksData : []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError({
          message: error.message || 'Failed to load books. Please try again later.',
          type: 'fetch_error'
        });
        setBooks([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const latestBooks = books.slice(0, 10);

  const displayBooks = books.filter(book => {
    const matchesCategory = selectedCategory ? (book.categoryId || book.category_id) === selectedCategory : true;
    const matchesSearch = searchQuery.trim()
      ? (book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         book.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         book.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
         book.description?.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    return matchesCategory && matchesSearch;
  });

  // Auto-hover cycling effect
  useEffect(() => {
    if (latestBooks.length === 0) return;

    let currentIndex = 0;
    const HIGHLIGHT_DURATION = 1200; // ms each book is highlighted
    const PAUSE_BETWEEN = 300;       // ms gap between highlights

    const cycle = () => {
      if (isUserHovering) return;
      setHoveredIndex(currentIndex);
      currentIndex = (currentIndex + 1) % latestBooks.length;
    };

    // Start immediately
    cycle();
    const interval = setInterval(cycle, HIGHLIGHT_DURATION + PAUSE_BETWEEN);

    // Clear highlight briefly between cycles
    const clearTimer = setInterval(() => {
      if (!isUserHovering) setHoveredIndex(null);
    }, HIGHLIGHT_DURATION);

    return () => {
      clearInterval(interval);
      clearInterval(clearTimer);
    };
  }, [latestBooks.length, isUserHovering]);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    const fetchData = async () => {
      try {
        const [booksData, categoriesData] = await Promise.all([
          api.books.getAll(),
          api.categories.getAll(),
        ]);
        setBooks(Array.isArray(booksData) ? booksData : []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        setError(null);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError({
          message: error.message || 'Failed to load books. Please try again later.',
          type: 'fetch_error'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  };

  if (loading) {
    return (
      <>
        <Header isAuthenticated={isAuthenticated} user={user} />
        <div className="books-page">
          <div className="container">
            <div className="page-header">
              <h1>Browse Books</h1>
              <p>Discover our collection</p>
            </div>
            <div style={{ textAlign: 'center', padding: '80px 20px', color: '#6b7280' }}>
              <div style={{ fontSize: '52px', marginBottom: '16px' }}>📚</div>
              <p style={{ fontSize: '16px', margin: 0 }}>Loading books...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header isAuthenticated={isAuthenticated} user={user} />
      <div className="books-page">
        <div className="container">

          {/* Page Header */}
          <div className="page-header">
            <h1>Browse Books</h1>
            <p>Discover our collection of carefully curated books</p>
          </div>

          {/* Latest Books Slider */}
          {!error && latestBooks.length > 0 && (
            <>
              <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af' }}>
                  Latest Arrivals
                </span>
                <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
              </div>
              <div className="latest-books-slider-container">
                <div className="latest-books-slider" ref={sliderRef}>
                  {latestBooks.map((book, index) => (
                    <Link
                      key={book.id}
                      href={`/books/${book.id}`}
                      className={`latest-book-slide${hoveredIndex === index ? ' auto-hovered' : ''}`}
                      onMouseEnter={() => { setIsUserHovering(true); setHoveredIndex(index); }}
                      onMouseLeave={() => { setIsUserHovering(false); setHoveredIndex(null); }}
                    >
                      <Image
                        src={book.coverImage || "/placeholder.svg"}
                        alt={book.title}
                        width={130}
                        height={195}
                        className="latest-book-image"
                        priority={false}
                      />
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Error */}
          {error && (
            <div className="error-message" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '30px',
            }}>
              <div style={{ flex: 1 }}>
                <strong style={{ display: 'block', marginBottom: '4px' }}>Error Loading Books</strong>
                <span>{error.message}</span>
              </div>
              <button
                onClick={handleRetry}
                style={{
                  padding: '9px 18px',
                  background: '#991b1b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'background 0.2s',
                }}
                onMouseOver={(e) => e.target.style.background = '#7f1d1d'}
                onMouseOut={(e) => e.target.style.background = '#991b1b'}
              >
                Retry
              </button>
            </div>
          )}

          {!error && (
            <>
              {/* Search & Filters */}
              <div className="search-filters-bar">
                <div className="search-bar">
                  <input
                    type="text"
                    placeholder="Search by title, author, or keyword…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                </div>
                <div className="filters-row">
                  {(searchQuery || selectedCategory) && (
                    <button
                      className="clear-filters-btn"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory(null);
                      }}
                    >
                      ✕ Clear Filters
                    </button>
                  )}
                </div>
              </div>

              <div className="books-layout">
                {/* Sidebar */}
                <aside className="books-sidebar">
                  <h3 className="filter-title">Categories</h3>
                  <div className="category-list">
                    <button
                      className={`category-item ${selectedCategory === null ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(null)}
                    >
                      All Books
                    </button>
                    {categories.map(category => (
                      <button
                        key={category.id}
                        className={`category-item ${selectedCategory === category.id ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </aside>

                {/* Main */}
                <main className="books-main">
                  <div className="results-info">
                    <p>
                      {displayBooks.length === 0
                        ? 'No books found'
                        : `Showing ${displayBooks.length} ${displayBooks.length === 1 ? 'book' : 'books'}`}
                      {selectedCategory && (
                        <span> in <strong>{categories.find(c => c.id === selectedCategory)?.name}</strong></span>
                      )}
                      {searchQuery && (
                        <span> matching "<strong>{searchQuery}</strong>"</span>
                      )}
                    </p>
                  </div>

                  {displayBooks.length > 0 ? (
                    <div className="books-grid">
                      {displayBooks.map(book => (
                        <BookCard key={book.id} book={book} />
                      ))}
                    </div>
                  ) : (
                    <div className="no-results">
                      <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.4 }}>📚</div>
                      <p>No books found</p>
                      {(searchQuery || selectedCategory) && (
                        <button
                          className="reset-btn"
                          onClick={() => {
                            setSearchQuery('');
                            setSelectedCategory(null);
                          }}
                        >
                          Clear Filters
                        </button>
                      )}
                      {!searchQuery && !selectedCategory && books.length === 0 && (
                        <p style={{ marginTop: '12px', fontSize: '14px', color: '#9ca3af' }}>
                          Check back soon for new additions to our collection.
                        </p>
                      )}
                    </div>
                  )}
                </main>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default function BooksPage() {
  return (
    <Suspense fallback={
      <>
        <Header isAuthenticated={false} user={null} />
        <div className="books-page">
          <div className="container">
            <div className="page-header">
              <h1>Browse Books</h1>
              <p>Discover our collection</p>
            </div>
            <div style={{ textAlign: 'center', padding: '80px 20px', color: '#6b7280' }}>
              <div style={{ fontSize: '52px', marginBottom: '16px' }}>📚</div>
              <p style={{ fontSize: '16px', margin: 0 }}>Loading...</p>
            </div>
          </div>
        </div>
      </>
    }>
      <BooksContent />
    </Suspense>
  );
}