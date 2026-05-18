'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import ReviewSection from '@/components/ReviewSection';
import { useAuth } from '@/app/auth-context';
import { useCart } from '@/app/cart-context';
import { api } from '@/lib/api';
import { currencyUtils, discountUtils } from '@/lib/configHelper';
import siteConfig from '@/config/siteConfig';
import ShareButtons from '@/components/ShareButtons';
import './book-detail.css';
import { useParams } from 'next/navigation';

export default function BookDetailPage({ params }) {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { addToCart } = useCart();
  const [book, setBook] = useState(null);
  const [category, setCategory] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchBookData = async () => {
      try {
        setLoading(true);
        const foundBook = await api.books.getById(id);
        if (foundBook) {
          setBook(foundBook);
          
          // Fetch category
          if (foundBook.categoryId) {
            const categoryData = await api.categories.getById(foundBook.categoryId);
            setCategory(categoryData);
          }

          // Find related books (same category or similar tags)
          const allBooks = await api.books.getAll();
          const related = allBooks.filter(b => 
            b.id !== foundBook.id && (
              b.categoryId === foundBook.categoryId ||
              b.tags?.some(tag => foundBook.tags?.includes(tag))
            )
          ).slice(0, 4);
          setRelatedBooks(related);
        }
      } catch (error) {
        console.error('Error fetching book:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookData();
  }, [id]);

  if (loading) {
    return (
      <>
        <Header isAuthenticated={isAuthenticated} user={user} />
        <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <p>Loading...</p>
        </div>
      </>
    );
  }

  if (!book) {
    return (
      <>
        <Header isAuthenticated={isAuthenticated} user={user} />
        <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <h1>Book not found</h1>
          <p>The book you're looking for doesn't exist.</p>
          <Link href="/books" className="btn-back">
            ← Back to Books
          </Link>
        </div>
      </>
    );
  }

  const hasPrice = book.price != null && book.price > 0;
  const canPurchase = book.availability && hasPrice;
  const maxQuantity = Math.max(1, book.stock ?? 1);

  const discountedPrice = hasPrice && book.discount > 0
    ? discountUtils.applyDiscount(book.price, book.discount)
    : book.price;

  const priceInfo = hasPrice ? currencyUtils.formatPriceDual(book.price) : null;
  const discountedPriceInfo = hasPrice && book.discount > 0
    ? currencyUtils.formatPriceDual(discountedPrice)
    : null;

  const bulkDiscount = discountUtils.calculateBulkDiscount(quantity);
  const bulkPrice = hasPrice && bulkDiscount > 0
    ? discountUtils.applyDiscount(discountedPrice, bulkDiscount)
    : discountedPrice;

  return (
    <>
      <Header isAuthenticated={isAuthenticated} user={user} />

      <div className="book-detail-page">
        <div className="container">
          <Link href="/books" className="breadcrumb-back">
            ← Back to Books
          </Link>

          <div className="book-detail-container">
            {/* Left: Book Image & Info */}
            <div className="book-detail-left">
              <div className="book-cover-container">
                <Image
                  src={book.coverImage || "/placeholder.svg"}
                  alt={book.title}
                  width={300}
                  height={450}
                  className="book-cover"
                  priority
                />
                {book.discount > 0 && (
                  <div className="discount-badge-large">
                    -{book.discount}%
                  </div>
                )}
                {!book.availability && (
                  <div className="unavailable-badge">
                    {book.stock === 0 ? 'Out of Stock' : 'Unavailable'}
                  </div>
                )}
              </div>

              <div className="book-quick-info">
                <p className="rating">⭐⭐⭐⭐⭐ (5 reviews)</p>
                <p className="availability">
                  {book.availability ? `✓ In Stock (${book.stock ?? 0} available)` : '✗ Out of Stock'}
                </p>
                {book.weight && (
                  <p className="weight">
                    Weight: {book.weight} kg
                  </p>
                )}
              </div>
            </div>

            {/* Right: Book Details */}
            <div className="book-detail-right">
              <h1 className="book-title">{book.title}</h1>
              <p className="book-author">by {book.author}</p>

              <div className="book-meta">
                <span className="category-tag">{category?.name || 'Uncategorized'}</span>
                {book.weight && (
                  <span className="weight-tag">Weight: {book.weight} kg</span>
                )}
                {book.isbn && (
                  <span className="weight-tag">ISBN: {book.isbn}</span>
                )}
              </div>

              {/* Pricing Section - only show when book has price */}
              {hasPrice && (
                <div className="pricing-section">
                  <div className="price-display">
                    {discountedPriceInfo ? (
                      <>
                        <span className="original-price">{priceInfo.primary}</span>
                        <span className="current-price">{discountedPriceInfo.primary}</span>
                        <span className="savings">Save {book.discount}%</span>
                      </>
                    ) : (
                      <span className="current-price">{priceInfo.primary}</span>
                    )}
                  </div>

                  {quantity > 1 && bulkDiscount > 0 && (
                    <div className="bulk-discount-info">
                      <p>Bulk discount applied: {bulkDiscount}%</p>
                      <p className="bulk-price">Final Price: {currencyUtils.formatPrice(bulkPrice, 'primary')}</p>
                    </div>
                  )}
                </div>
              )}
              <p className="book-description">{book.description}</p>


              {/* Quantity & Add to Cart */}
              <div className="purchase-section">
                {canPurchase && (
                  <div className="quantity-selector">
                    <label>Quantity:</label>
                    <div className="quantity-controls">
                      <button
                        className="qty-btn"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.min(maxQuantity, Math.max(1, parseInt(e.target.value) || 1)))}
                        className="qty-input"
                        min="1"
                        max={maxQuantity}
                      />
                      <button
                        className="qty-btn"
                        onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                        disabled={quantity >= maxQuantity}
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                <button
                  className="btn-add-to-cart-large"
                  disabled={!canPurchase || addingToCart}
                  onClick={async () => {
                    if (!canPurchase) return;
                    setAddingToCart(true);
                    addToCart(book, Math.min(quantity, maxQuantity));
                    setTimeout(() => setAddingToCart(false), 500);
                  }}
                >
                  {addingToCart ? 'Adding...' : canPurchase ? 'Add to Cart' : !hasPrice ? 'Price on request' : 'Out of Stock'}
                </button>

                <ShareButtons
                  url={typeof window !== 'undefined' ? `${window.location.origin}/books/${book.id}` : ''}
                  title={book.title}
                />
              </div>

              {/* Bulk Discount Info - only when book has price */}
              {hasPrice && siteConfig.bulkDiscounts.length > 0 && (
                <div className="bulk-info-box">
                  <h4>Bulk Discounts Available</h4>
                  <ul>
                    {siteConfig.bulkDiscounts.map((rule, idx) => (
                      <li key={idx}>
                        Buy {rule.quantity}+ books → {rule.discountPercent}% off
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tags */}
              {book.tags && book.tags.length > 0 && (
                <div className="tags-section">
                  <h4>Tags</h4>
                  <div className="tags-list">
                    {book.tags.map((tag, idx) => (
                      <span key={idx} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reviews Section */}
          <ReviewSection bookId={book.id} isAuthenticated={isAuthenticated} user={user} />

          {/* Related Books */}
          {relatedBooks.length > 0 && (
            <section className="related-section">
              <h2>Related Books</h2>
              <div className="related-books-grid">
                {relatedBooks.map(relatedBook => (
                  <Link
                    key={relatedBook.id}
                    href={`/books/${relatedBook.id}`}
                    className="related-book-card"
                  >
                    <div className="related-book-image">
                      <Image
                        src={relatedBook.coverImage || "/placeholder.svg"}
                        alt={relatedBook.title}
                        width={150}
                        height={220}
                      />
                    </div>
                    <h4>{relatedBook.title}</h4>
                    <p className="author">{relatedBook.author}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <h3>{siteConfig.siteName}</h3>
              <p>{siteConfig.siteDescription}</p>
            </div>
            <div>
              <h4>Quick Links</h4>
              <ul>
                <li><Link href="/">Home</Link></li>
                <li><Link href="/books">Browse Books</Link></li>
              </ul>
            </div>
            <div>
              <h4>Contact</h4>
              <p>Email: {siteConfig.email}</p>
              <p>Phone: {siteConfig.phone}</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 {siteConfig.siteName}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
