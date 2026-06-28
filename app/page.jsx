'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Target, Truck, Tag, ThumbsUp, Mail } from 'lucide-react';
import { useAuth } from '@/app/auth-context';
import siteConfig from '@/config/siteConfig';
import { api } from '@/lib/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
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
  const displayBooks = useMemo(() => {
    return books.filter(book => {
      const matchesCategory = selectedCategory ? (book.categoryId || book.category_id) === selectedCategory : true;
      const matchesSearch = searchQuery.trim()
        ? (book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           book.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           book.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
           book.description?.toLowerCase().includes(searchQuery.toLowerCase()))
        : true;
      return matchesCategory && matchesSearch;
    });
  }, [books, selectedCategory, searchQuery]);

  // Recently added (by createdAt if available, otherwise order from API)
  const recentBooks = useMemo(() => {
    return [...books].sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return 0;
    }).slice(0, 8);
  }, [books]);

  // Featured books (by discount)
  const featuredBooks = useMemo(() => {
    return books
      .filter(book => (book.discount || 0) > 0)
      .sort((a, b) => (b.discount || 0) - (a.discount || 0))
      .slice(0, 8);
  }, [books]);

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
                  <Image src={book.coverImage || "/placeholder.svg"} alt={book.title} width={180} height={260} priority={true} style={{ width: '100%', height: 'auto' }} />
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
                  Discover the latest additions to our collection, fresh off the press.
                </p>
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
            <h2 className="section-title-modern">Why Mandala Book Point?</h2>
            <p className="section-description">
              More than just a bookstore - a community of passionate readers
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon"><Target size={40} strokeWidth={1.5} /></div>
              <h3 className="feature-title">Curated Selection</h3>
              <p className="feature-description">
                Every book is handpicked by our team of literary experts and passionate readers
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><Truck size={40} strokeWidth={1.5} /></div>
              <h3 className="feature-title">Fast Delivery</h3>
              <p className="feature-description">
                Get your books delivered to your doorstep within 2-3 business days
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><Tag size={40} strokeWidth={1.5} /></div>
              <h3 className="feature-title">Exclusive Deals</h3>
              <p className="feature-description">
                Members get access to special discounts and early access to new releases
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><ThumbsUp size={40} strokeWidth={1.5} /></div>
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
            <div className="newsletter-icon"><Mail size={48} strokeWidth={1.5} color="#10b981" /></div>
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
                "Mandala Book Point has completely transformed my reading habits. The curated selections 
                introduced me to authors I would have never discovered on my own!"
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">RS</div>
                <div>
                  <div className="testimonial-name">Ramesh Shahi</div>
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
                <div className="testimonial-avatar">RK</div>
                <div>
                  <div className="testimonial-name">Rahul KC</div>
                  <div className="testimonial-role">Avid Reader</div>
                </div>
              </div>
            </div>
            
            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">
                "Fast delivery, great prices, and an incredible selection. Mandala Book Point is now 
                my go-to place for all my reading needs. Highly recommend!"
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">BB</div>
                <div>
                  <div className="testimonial-name">Binod Bohara</div>
                  <div className="testimonial-role">Book Collector</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </>
  );
}