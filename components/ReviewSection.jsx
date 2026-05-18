'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import './ReviewSection.css';

export default function ReviewSection({ bookId, isAuthenticated, user }) {
  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
  });

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        if (!bookId) {
          setReviews([]);
          return;
        }
        const bookReviews = await api.reviews.getByBookId(Number(bookId));
        setReviews(bookReviews);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setError('Unable to load reviews right now. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [bookId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      alert('Please log in to leave a review');
      return;
    }

     if (!user.id) {
      alert('Your account information is incomplete. Please log out and log back in.');
      return;
    }

    if (formData.comment.trim().length < 10) {
      alert('Please write a slightly longer review (at least 10 characters).');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      // Ensure all values are properly set
      const bookIdNum = parseInt(bookId);
      if (isNaN(bookIdNum)) {
        throw new Error('Invalid book ID');
      }
      
      if (!user.id) {
        throw new Error('User ID is missing. Please log out and log back in.');
      }
      
      if (!user.name || user.name.trim() === '') {
        throw new Error('User name is missing. Please log out and log back in.');
      }
      
      const newReview = await api.reviews.create({
        bookId: bookIdNum,
        userId: user.id,
        userName: user.name.trim(),
        rating: formData.rating || 5,
        comment: formData.comment.trim(),
      });

      setReviews(prev => [newReview, ...prev]);
      setFormData({ rating: 5, comment: '' });
      setShowForm(false);
    } catch (error) {
      console.error('Error creating review:', error);
      setError(error.message || 'Failed to submit review. Please try again.');
      alert(error.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <section className="review-section">
      <div className="review-header">
        <h2>Customer Reviews</h2>
        <div className="review-stats">
          <span className="avg-rating">
            ⭐ {averageRating} / 5 ({reviews.length} reviews)
          </span>
        </div>
      </div>

      {error && (
        <div className="login-prompt" style={{ marginBottom: 12, color: '#b91c1c' }}>
          {error}
        </div>
      )}

      {loading && (
        <div className="no-reviews">
          <p>Loading reviews...</p>
        </div>
      )}

      {!showForm && isAuthenticated && (
        <button
          className="btn-leave-review"
          onClick={() => setShowForm(true)}
        >
          + Leave a Review
        </button>
      )}

      {showForm && (
        <div className="review-form-container">
          <h3>Share Your Thoughts</h3>
          <form onSubmit={handleSubmit} className="review-form">
            <div className="form-group">
              <label className="form-label">Rating</label>
              <div className="rating-selector">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    className={`star-btn ${formData.rating >= star ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Your Review</label>
              <textarea
                name="comment"
                className="form-textarea"
                value={formData.comment}
                onChange={handleInputChange}
                placeholder="Share your thoughts about this book..."
                required
                minLength={10}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-submit">
                {submitting ? 'Posting...' : 'Post Review'}
              </button>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {!isAuthenticated && (
        <div className="login-prompt">
          <p>Please <a href="/login">log in</a> to leave a review.</p>
        </div>
      )}

      {reviews.length > 0 ? (
        <div className="reviews-list">
          {reviews.map(review => (
            <div key={review.id} className="review-item">
              <div className="review-header-item">
                <div>
                  <h4 className="review-author">{review.userName}</h4>
                  <div className="review-rating">
                    {'⭐'.repeat(review.rating)}
                  </div>
                </div>
                <span className="review-date">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="review-comment">{review.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-reviews">
          <p>No reviews yet. Be the first to review this book!</p>
        </div>
      )}
    </section>
  );
}
