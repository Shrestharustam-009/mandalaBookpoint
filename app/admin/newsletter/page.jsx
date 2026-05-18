'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        setLoading(true);
        const data = await api.newsletter.getAll();
        setSubscribers(data);
      } catch (error) {
        console.error('Error fetching subscribers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscribers();
  }, []);
  const [showSendForm, setShowSendForm] = useState(false);
  const [newsletterData, setNewsletterData] = useState({
    subject: '',
    content: '',
    type: 'announcement',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewsletterData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSend = (e) => {
    e.preventDefault();
    // Newsletter sending logic would go here
    alert(`Newsletter sent to ${subscribers.length} subscribers!`);
    setNewsletterData({ subject: '', content: '', type: 'announcement' });
    setShowSendForm(false);
  };

  return (
    <div>
      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>Newsletter Management</h1>
        <button className="btn-primary" onClick={() => setShowSendForm(true)}>
          + Send Newsletter
        </button>
      </div>

      {showSendForm && (
        <div className="admin-card">
          <div className="admin-card-title">Send Newsletter</div>
          <form onSubmit={handleSend}>
            <div className="form-group">
              <label className="form-label">Subject</label>
              <input
                type="text"
                name="subject"
                className="form-input"
                value={newsletterData.subject}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Type</label>
              <select
                name="type"
                className="form-select"
                value={newsletterData.type}
                onChange={handleInputChange}
              >
                <option value="announcement">Announcement</option>
                <option value="promotion">Promotion</option>
                <option value="newarrivals">New Arrivals</option>
                <option value="update">Update</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Content</label>
              <textarea
                name="content"
                className="form-textarea"
                value={newsletterData.content}
                onChange={handleInputChange}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn-primary">
                Send to {subscribers.length} Subscribers
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowSendForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-card">
        <div className="admin-card-title">Newsletter Subscribers ({subscribers.length})</div>
        {subscribers.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Subscribed On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map(subscriber => (
                <tr key={subscriber.id}>
                  <td>{subscriber.email}</td>
                  <td>{new Date(subscriber.subscribedAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn-danger">Unsubscribe</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
            No subscribers yet.
          </p>
        )}
      </div>
    </div>
  );
}
