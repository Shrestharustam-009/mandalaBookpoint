'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [reviewsData, booksData] = await Promise.all([
          api.reviews.getAll(),
          api.books.getAll(),
        ]);
        setReviews(reviewsData);
        setBooks(booksData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getBookTitle = (bookId) => {
    return books.find(b => b.id === bookId)?.title || 'Unknown';
  };

  return (
    <div>
      <h1 style={{ marginBottom: '30px' }}>Book Reviews</h1>

      <div className="admin-card">
        {reviews.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Book</th>
                <th>User</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map(review => (
                <tr key={review.id}>
                  <td>{getBookTitle(review.bookId)}</td>
                  <td>{review.userName}</td>
                  <td>{'⭐'.repeat(review.rating)}</td>
                  <td>{review.comment.substring(0, 50)}...</td>
                  <td>{new Date(review.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn-secondary" style={{ marginRight: '5px' }}>View</button>
                    <button className="btn-danger">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
            No reviews yet.
          </p>
        )}
      </div>
    </div>
  );
}
