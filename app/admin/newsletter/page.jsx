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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 m-0">Newsletter Management</h1>
        <button className="px-5 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(79,70,229,0.25)] whitespace-nowrap" onClick={() => setShowSendForm(true)}>
          + Send Newsletter
        </button>
      </div>

      {showSendForm && (
        <div className="bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] overflow-hidden border border-gray-100/50 mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">Send Newsletter</h2>
          <form onSubmit={handleSend}>
            <div className="form-group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
              <input
                type="text"
                name="subject"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none"
                value={newsletterData.subject}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
              <select
                name="type"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none appearance-none"
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">Content</label>
              <textarea
                name="content"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none min-h-[120px] resize-y"
                value={newsletterData.content}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-100">
              <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(79,70,229,0.25)] whitespace-nowrap">
                Send to {subscribers.length} Subscribers
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
                onClick={() => setShowSendForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] overflow-hidden border border-gray-100/50 mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">Newsletter Subscribers ({subscribers.length})</h2>
        {subscribers.length > 0 ? (
          <div className="overflow-x-auto w-full"><table className="w-full min-w-max text-left border-collapse">
            <thead className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Subscribed On</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map(subscriber => (
                <tr key={subscriber.id} className="hover:bg-gray-50/80 transition-colors duration-200 border-b border-gray-100">
                  <td className="align-middle px-6 py-4">{subscriber.email}</td>
                  <td className="align-middle px-6 py-4">{new Date(subscriber.subscribedAt).toLocaleDateString()}</td>
                  <td className="align-middle px-6 py-4">
                    <button className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 shadow-sm transition-colors">Unsubscribe</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        ) : (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
            No subscribers yet.
          </p>
        )}
      </div>
    </div>
  );
}
