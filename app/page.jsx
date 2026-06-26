'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/auth-context';
import siteConfig from '@/config/siteConfig';
import { api } from '@/lib/api';
import Header from '@/components/Header';
import PopupManager from '@/components/PopupManager';
import BookCard from '@/components/BookCard';
import './home.css';
import './books/books.css';

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Filter books based on category and search (same as browse page)
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

  // Recently added (by createdAt if available, otherwise order from API)
  const recentBooks = [...books].sort((a, b) => {
    if (a.createdAt && b.createdAt) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    return 0;
  }).slice(0, 8);

  // Featured books (by discount)
  const featuredBooks = books
    .filter(book => (book.discount || 0) > 0)
    .sort((a, b) => (b.discount || 0) - (a.discount || 0))
    .slice(0, 8);

  if (loading) {
    return (
      <>
        <Header isAuthenticated={isAuthenticated} user={user} />
        <div className="books-page">
          <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <p>Loading...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header isAuthenticated={isAuthenticated} user={user} />
      <PopupManager />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-text-content">
            <h1 className="hero-title">
              Discover Your<br />Next Great Read.
            </h1>
            <p className="hero-subtitle">
              Curated collections and new arrivals for the<br />discerning reader.
            </p>
            <Link href="/books" className="hero-btn">
              Explore Collection &rarr;
            </Link>
          </div>
          <div className="hero-visual">
            <div className="floating-books">
              {recentBooks.slice(0, 5).map((book, idx) => (
                <div key={idx} className={`floating-book floating-book-${idx + 1}`}>
                  <img src={book.coverImage || "/placeholder.svg"} alt={book.title} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Curated Collections Section */}
      {featuredBooks.length > 0 && (
        <section className="curated-section">
          <div className="container">
            <div className="section-header-modern">
              <h2 className="section-title-modern">Curated Collections</h2>
              <p className="section-description">
                Curated collections beyond comparing reads.
              </p>
            </div>
            <div className="books-grid-modern">
              {featuredBooks.map(book => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals Section */}
      {recentBooks.length > 0 && (
        <section className="new-arrivals-section">
          <div className="container">
            <div className="section-header-modern header-with-arrows">
              <div>
                <h2 className="section-title-modern">New Arrivals</h2>
                <p className="section-description">
                  Scroll-reveal animation and new book collections.
                </p>
              </div>
              <div className="carousel-arrows">
                <button className="carousel-arrow">&lt;</button>
                <button className="carousel-arrow active">&gt;</button>
              </div>
            </div>
            <div className="books-carousel-container">
              <div className="books-grid-modern carousel-layout">
                {recentBooks.map(book => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header-modern centered">
            <h2 className="section-title-modern">Why BookHaven?</h2>
            <p className="section-description">
              More than just a bookstore - a community of passionate readers
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3 className="feature-title">Curated Selection</h3>
              <p className="feature-description">
                Every book is handpicked by our team of literary experts and passionate readers
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3 className="feature-title">Fast Delivery</h3>
              <p className="feature-description">
                Get your books delivered to your doorstep within 2-3 business days
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💎</div>
              <h3 className="feature-title">Exclusive Deals</h3>
              <p className="feature-description">
                Members get access to special discounts and early access to new releases
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌟</div>
              <h3 className="feature-title">Book Recommendations</h3>
              <p className="feature-description">
                Personalized suggestions based on your reading preferences and history
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-modern">
        <div className="newsletter-container">
          <div className="newsletter-content-modern">
            <div className="newsletter-icon">📬</div>
            <h2 className="newsletter-title">Stay in the Loop</h2>
            <p className="newsletter-description">
              Get the latest book releases, exclusive deals, and personalized recommendations 
              delivered straight to your inbox every week.
            </p>
            <form className="newsletter-form-modern">
              <div className="newsletter-input-group">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="newsletter-input-modern"
                  required
                />
                <button type="submit" className="newsletter-btn-modern">
                  Subscribe
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M7 14L13 8L7 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              <p className="newsletter-privacy">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </form>
          </div>
          <div className="newsletter-visual">
            <div className="newsletter-book-stack">
              <div className="book-spine" style={{ '--delay': '0s' }}></div>
              <div className="book-spine" style={{ '--delay': '0.1s' }}></div>
              <div className="book-spine" style={{ '--delay': '0.2s' }}></div>
              <div className="book-spine" style={{ '--delay': '0.3s' }}></div>
              <div className="book-spine" style={{ '--delay': '0.4s' }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header-modern centered">
            <div className="section-label">Reader Stories</div>
            <h2 className="section-title-modern">What Our Readers Say</h2>
          </div>

          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">
                "BookHaven has completely transformed my reading habits. The curated selections 
                introduced me to authors I would have never discovered on my own!"
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">SK</div>
                <div>
                  <div className="testimonial-name">Sarah Kim</div>
                  <div className="testimonial-role">Book Enthusiast</div>
                </div>
              </div>
            </div>
            
            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">
                "The personalized recommendations are spot-on. I've found so many amazing books 
                that perfectly match my taste. It's like having a personal librarian!"
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">MJ</div>
                <div>
                  <div className="testimonial-name">Michael Johnson</div>
                  <div className="testimonial-role">Avid Reader</div>
                </div>
              </div>
            </div>
            
            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">
                "Fast delivery, great prices, and an incredible selection. BookHaven is now 
                my go-to place for all my reading needs. Highly recommend!"
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">EP</div>
                <div>
                  <div className="testimonial-name">Emily Parker</div>
                  <div className="testimonial-role">Book Collector</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-modern">
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand">
              <h3 className="footer-logo">{siteConfig.siteName}</h3>
              <p className="footer-tagline">{siteConfig.siteDescription}</p>
              <div className="footer-social">
                {siteConfig.socialLinks.twitter && (
                  <a href={siteConfig.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Twitter">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                  </a>
                )}
                {siteConfig.socialLinks.instagram && (
                  <a href={siteConfig.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Instagram">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </a>
                )}
                {siteConfig.socialLinks.facebook && (
                  <a href={siteConfig.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Facebook">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
                  </a>
                )}
                {siteConfig.socialLinks.youtube && (
                  <a href={siteConfig.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="social-link" aria-label="YouTube">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  </a>
                )}
              </div>
            </div>

            <div className="footer-links">
              <div className="footer-column">
                <h4 className="footer-heading">Quick Links</h4>
                <ul className="footer-list">
                  <li><Link href="/">Home</Link></li>
                  <li><Link href="/books">Browse Books</Link></li>
                  <li><Link href="/blog">Blog</Link></li>
                  <li><Link href="/about">About Us</Link></li>
                </ul>
              </div>

              <div className="footer-column">
                <h4 className="footer-heading">Support</h4>
                <ul className="footer-list">
                  <li><Link href="/contact">Contact Us</Link></li>
                  <li><Link href="/faq">FAQ</Link></li>
                  <li><Link href="/returns">Returns Policy</Link></li>
                  <li><Link href="/privacy">Privacy Policy</Link></li>
                </ul>
              </div>

              <div className="footer-column">
                <h4 className="footer-heading">Contact</h4>
                <ul className="footer-list">
                  <li>{siteConfig.address}</li>
                  <li>Tel: {siteConfig.phone}</li>
                  <li>E-mail: {siteConfig.email}</li>
                  {siteConfig.website && <li>Website: {siteConfig.website}</li>}
                </ul>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2024 {siteConfig.siteName}. All rights reserved.</p>
            <div className="footer-bottom-links">
              <Link href="/terms">Terms of Service</Link>
              <span>•</span>
              <Link href="/privacy">Privacy Policy</Link>
              <span>•</span>
              <Link href="/cookies">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}