'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function PopupsPage() {
  const [popups, setPopups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'announcement',
    active: true,
    expiresAt: '',
  });

  useEffect(() => {
    const fetchPopups = async () => {
      try {
        setLoading(true);
        const data = await api.popups.getAll();
        setPopups(data);
      } catch (error) {
        console.error('Error fetching popups:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPopups();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await api.popups.update(editingId, formData);
      } else {
        await api.popups.create(formData);
      }
      
      const updatedPopups = await api.popups.getAll();
      setPopups(updatedPopups);
      setFormData({ title: '', content: '', type: 'announcement', active: true, expiresAt: '' });
      setShowForm(false);
      setEditingId(null);
    } catch (error) {
      console.error('Error saving popup:', error);
      alert('Failed to save popup. Please try again.');
    }
  };

  const handleEdit = (popup) => {
    setFormData({
      title: popup.title,
      content: popup.content,
      type: popup.type,
      active: popup.active,
      expiresAt: popup.expiresAt || '',
    });
    setEditingId(popup.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this popup?')) {
      try {
        await api.popups.delete(id);
        const updatedPopups = await api.popups.getAll();
        setPopups(updatedPopups);
      } catch (error) {
        console.error('Error deleting popup:', error);
        alert('Failed to delete popup. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ title: '', content: '', type: 'announcement', active: true, expiresAt: '' });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 m-0">Popup Management</h1>
        <button className="px-5 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(79,70,229,0.25)] whitespace-nowrap" onClick={() => setShowForm(true)}>
          + Create Popup
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300"></div>
          <div className="relative bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 z-10">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">
            {editingId ? 'Edit Popup' : 'Create New Popup'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
              <input
                type="text"
                name="title"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Content</label>
              <textarea
                name="content"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none min-h-[120px] resize-y"
                value={formData.content}
                onChange={handleInputChange}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                <select
                  name="type"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none appearance-none"
                  value={formData.type}
                  onChange={handleInputChange}
                >
                  <option value="announcement">Announcement</option>
                  <option value="offer">Special Offer</option>
                  <option value="event">Event</option>
                  <option value="promotion">Promotion</option>
                </select>
              </div>

              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Expires At</label>
                <input
                  type="datetime-local"
                  name="expiresAt"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none"
                  value={formData.expiresAt}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleInputChange}
                />
                <span>Active (Will appear on website)</span>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-100">
              <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(79,70,229,0.25)] whitespace-nowrap">
                {editingId ? 'Update Popup' : 'Create Popup'}
              </button>
              <button type="button" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] overflow-hidden border border-gray-100/50 mb-8">
        {popups.length > 0 ? (
          <div className="overflow-x-auto w-full"><table className="w-full min-w-max text-left border-collapse">
            <thead className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Expires At</th>
                <th style={{ width: '150px' }} className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {popups.map(popup => (
                <tr key={popup.id} className="hover:bg-gray-50/80 transition-colors duration-200 border-b border-gray-100">
                  <td className="align-middle px-6 py-4">{popup.title}</td>
                  <td style={{ textTransform: 'capitalize' }} className="align-middle px-6 py-4">{popup.type}</td>
                  <td className="align-middle px-6 py-4">{popup.active ? '✓ Active' : '✗ Inactive'}</td>
                  <td className="align-middle px-6 py-4">{popup.expiresAt ? new Date(popup.expiresAt).toLocaleDateString() : 'N/A'}</td>
                  <td className="align-middle px-6 py-4">
                    <button
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      onClick={() => handleEdit(popup)}
                      style={{ marginRight: '5px' }}
                    >
                      Edit
                    </button>
                    <button
                      className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 shadow-sm transition-colors"
                      onClick={() => handleDelete(popup.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        ) : (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
            No popups created yet.
          </p>
        )}
      </div>
    </div>
  );
}
