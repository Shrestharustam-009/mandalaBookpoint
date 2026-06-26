'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/app/cart-context';
import { currencyUtils, discountUtils } from '@/lib/configHelper';
import ShareButtons from '@/components/ShareButtons';
import './BookCard.css';

export default function BookCard({ book }) {
  const { addToCart } = useCart();
  const hasPrice = book.price != null && book.price > 0;
  const canPurchase = book.availability && hasPrice;

  const discountedPrice = hasPrice && book.discount > 0
    ? discountUtils.applyDiscount(book.price, book.discount)
    : book.price;

  const priceInfo = hasPrice ? currencyUtils.formatPriceDual(book.price) : null;
  const discountedPriceInfo = hasPrice && book.discount > 0
    ? currencyUtils.formatPriceDual(discountedPrice)
    : null;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (canPurchase) {
      // Flying book animation
      const cardEl = e.target.closest('.book-card');
      const imgEl = cardEl ? cardEl.querySelector('.book-image') : null;
      const cartIcon = document.getElementById('cart-icon');
      
      if (imgEl && cartIcon) {
        const imgRect = imgEl.getBoundingClientRect();
        const cartRect = cartIcon.getBoundingClientRect();
        
        const flyingImg = document.createElement('img');
        flyingImg.src = book.coverImage || "/placeholder.svg";
        flyingImg.className = 'flying-book-anim';
        flyingImg.style.left = `${imgRect.left}px`;
        flyingImg.style.top = `${imgRect.top}px`;
        flyingImg.style.width = `${imgRect.width}px`;
        flyingImg.style.height = `${imgRect.height}px`;
        
        document.body.appendChild(flyingImg);
        
        // Trigger reflow to start animation
        void flyingImg.offsetWidth;
        
        flyingImg.style.transform = `translate(${cartRect.left - imgRect.left + 10}px, ${cartRect.top - imgRect.top}px) scale(0.1) rotate(15deg)`;
        flyingImg.style.opacity = '0.5';
        
        setTimeout(() => {
          if (document.body.contains(flyingImg)) {
            document.body.removeChild(flyingImg);
          }
        }, 800);
      }
      
      addToCart(book, 1);
    }
  };

  const bookUrl = typeof window !== 'undefined' ? `${window.location.origin}/books/${book.id}` : '';

  return (
    <div className="book-card">
      <Link href={`/books/${book.id}`} className="book-card-link">
        <div className="book-image-container">
          <Image
            src={book.coverImage || "/placeholder.svg"}
            alt={book.title}
            width={180}
            height={260}
            className="book-image"
            priority={false}
          />
          {book.discount > 0 && (
            <div className="discount-badge">
              -{book.discount}%
            </div>
          )}
        </div>

        <div className="book-info">
          <h3 className="book-title">{book.title}</h3>
          <p className="book-author">by {book.author}</p>

          {hasPrice && (
            <div className="book-price">
              {discountedPriceInfo ? (
                <>
                  <span className="original-price">{priceInfo.primary}</span>
                  <span className="discounted-price">{discountedPriceInfo.primary}</span>
                </>
              ) : (
                <span className="price">{priceInfo.primary}</span>
              )}
            </div>
          )}

          <div className="book-tags">
            {book.tags && book.tags.slice(0, 2).map((tag, idx) => (
              <span key={idx} className="tag">{tag}</span>
            ))}
          </div>
        </div>
      </Link>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
        <button 
          className="btn-add-to-cart" 
          disabled={!canPurchase}
          onClick={handleAddToCart}
        >
          {canPurchase ? 'Add to Cart' : !hasPrice ? 'Price on request' : 'Out of Stock'}
        </button>
        <ShareButtons url={bookUrl} title={book.title} />
      </div>
    </div>
  );
}
