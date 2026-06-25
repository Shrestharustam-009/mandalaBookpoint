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

      <div className="bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] overflow-hidden border border-gray-100/50 mb-8">
        {reviews.length > 0 ? (
          <div className="overflow-x-auto w-full"><table className="w-full min-w-max text-left border-collapse">
            <thead className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Book</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Comment</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map(review => (
                <tr key={review.id} className="hover:bg-gray-50/80 transition-colors duration-200 border-b border-gray-100">
                  <td className="align-middle px-6 py-4">{getBookTitle(review.bookId)}</td>
                  <td className="align-middle px-6 py-4">{review.userName}</td>
                  <td className="align-middle px-6 py-4">{'⭐'.repeat(review.rating)}</td>
                  <td className="align-middle px-6 py-4">{review.comment.substring(0, 50)}...</td>
                  <td className="align-middle px-6 py-4">{new Date(review.createdAt).toLocaleDateString()}</td>
                  <td className="align-middle px-6 py-4">
                    <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors" style={{ marginRight: '5px' }}>View</button>
                    <button className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 shadow-sm transition-colors">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        ) : (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
            No reviews yet.
          </p>
        )}
      </div>
    </div>
  );
}
