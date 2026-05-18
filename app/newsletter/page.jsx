'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { useAuth } from '@/app/auth-context';
import { api } from '@/lib/api';
import siteConfig from '@/config/siteConfig';
import './newsletter.css';

export default function NewsletterPage() {
  const { isAuthenticated, user } = useAuth();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [message, setMessage] = useState('');
  const [subscriberCount, setSubscriberCount] = useState(0);

  useEffect(() => {
    const fetchSubscriberCount = async () => {
      try {
        const subscribers = await api.newsletter.getAll();
        setSubscriberCount(subscribers.length);
      } catch (error) {
        console.error('Error fetching subscriber count:', error);
      }
    };
    fetchSubscriberCount();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setMessage('Please enter your email address');
      return;
    }

    try {
      await api.newsletter.subscribe(email);
      setSubscribed(true);
      setMessage('Thank you for subscribing! You\'ll receive our latest updates.');
      setEmail('');
      setSubscriberCount(prev => prev + 1);
      
      // Reset message after 5 seconds
      setTimeout(() => {
        setMessage('');
      }, 5000);
    } catch (error) {
      console.error('Error subscribing:', error);
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <>
      <Header isAuthenticated={isAuthenticated} user={user} />

      <div className="newsletter-page">
        <div className="container">
          <section className="newsletter-hero">
            <div className="newsletter-content">
              <h1>Stay Updated</h1>
              <p>Get the latest book releases, exclusive discounts, and reading recommendations delivered to your inbox.</p>

              {!subscribed ? (
                <form onSubmit={handleSubmit} className="newsletter-form-large">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="newsletter-input-large"
                    required
                  />
                  <button type="submit" className="btn-subscribe">
                    Subscribe Now
                  </button>
                </form>
              ) : (
                <div className="success-message">
                  <div className="success-icon">✓</div>
                  <p>Welcome to our newsletter! Check your email for confirmation.</p>
                </div>
              )}

              {message && (
                <p className={`form-message ${subscribed ? 'success' : 'error'}`}>
                  {message}
                </p>
              )}
            </div>

            <div className="newsletter-image">
              <div className="image-placeholder">
                📧
              </div>
            </div>
          </section>

          <section className="newsletter-benefits">
            <h2>Why Subscribe?</h2>
            <div className="benefits-grid">
              <div className="benefit-card">
                <div className="benefit-icon">📚</div>
                <h3>New Releases</h3>
                <p>Be the first to know about new book releases and upcoming titles in your favorite categories.</p>
              </div>

              <div className="benefit-card">
                <div className="benefit-icon">🎉</div>
                <h3>Exclusive Deals</h3>
                <p>Get exclusive discounts and special promotions that are only available to our subscribers.</p>
              </div>

              <div className="benefit-card">
                <div className="benefit-icon">⭐</div>
                <h3>Recommendations</h3>
                <p>Receive personalized book recommendations based on your reading preferences and interests.</p>
              </div>

              <div className="benefit-card">
                <div className="benefit-icon">📖</div>
                <h3>Book Reviews</h3>
                <p>Read in-depth reviews and expert insights about popular and upcoming books.</p>
              </div>

              <div className="benefit-card">
                <div className="benefit-icon">🎤</div>
                <h3>Author Updates</h3>
                <p>Stay connected with your favorite authors and learn about book events and signings.</p>
              </div>

              <div className="benefit-card">
                <div className="benefit-icon">💡</div>
                <h3>Reading Tips</h3>
                <p>Get reading tips, book club suggestions, and literary insights to enhance your reading experience.</p>
              </div>
            </div>
          </section>

          <section className="newsletter-faq">
            <h2>Frequently Asked Questions</h2>
            <div className="faq-grid">
              <div className="faq-item">
                <h4>How often will I receive emails?</h4>
                <p>We send newsletters approximately twice a month, featuring new releases, special offers, and reading recommendations. You can adjust your preferences at any time.</p>
              </div>

              <div className="faq-item">
                <h4>Can I unsubscribe anytime?</h4>
                <p>Yes! You can unsubscribe at any time by clicking the unsubscribe link at the bottom of any newsletter email. We respect your privacy.</p>
              </div>

              <div className="faq-item">
                <h4>Will my email be shared?</h4>
                <p>No, we never share your email address with third parties. Your information is used solely for {siteConfig.siteName} communications.</p>
              </div>

              <div className="faq-item">
                <h4>How are recommendations personalized?</h4>
                <p>We use your browsing history and reading preferences to suggest books that match your interests. More data helps us provide better recommendations.</p>
              </div>

              <div className="faq-item">
                <h4>What if I don't receive the confirmation?</h4>
                <p>Check your spam or promotions folder. If you still don't see it after 10 minutes, contact us at {siteConfig.email} for assistance.</p>
              </div>

              <div className="faq-item">
                <h4>Can I change my subscription preferences?</h4>
                <p>Yes! Once logged in, you can visit your account settings to customize which types of emails you want to receive.</p>
              </div>
            </div>
          </section>

          <section className="newsletter-cta">
            <h2>Ready to Discover Your Next Favorite Book?</h2>
            <p>Join {subscriberCount}+ readers who trust us for curated book recommendations</p>
            <Link href="/books" className="btn-browse">
              Browse Our Collection
            </Link>
          </section>
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
                <li><Link href="/newsletter">Newsletter</Link></li>
              </ul>
            </div>
            <div>
              <h4>Support</h4>
              <ul>
                <li><Link href="/contact">Contact Us</Link></li>
                <li><a href={`mailto:${siteConfig.email}`}>Email</a></li>
              </ul>
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
