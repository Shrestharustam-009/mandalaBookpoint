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
      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>Popup Management</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + Create Popup
        </button>
      </div>

      {showForm && (
        <div className="admin-card">
          <div className="admin-card-title">
            {editingId ? 'Edit Popup' : 'Create New Popup'}
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                type="text"
                name="title"
                className="form-input"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Content</label>
              <textarea
                name="content"
                className="form-textarea"
                value={formData.content}
                onChange={handleInputChange}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select
                  name="type"
                  className="form-select"
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
                <label className="form-label">Expires At</label>
                <input
                  type="datetime-local"
                  name="expiresAt"
                  className="form-input"
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

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn-primary">
                {editingId ? 'Update Popup' : 'Create Popup'}
              </button>
              <button type="button" className="btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-card">
        {popups.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Status</th>
                <th>Expires At</th>
                <th style={{ width: '150px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {popups.map(popup => (
                <tr key={popup.id}>
                  <td>{popup.title}</td>
                  <td style={{ textTransform: 'capitalize' }}>{popup.type}</td>
                  <td>{popup.active ? '✓ Active' : '✗ Inactive'}</td>
                  <td>{popup.expiresAt ? new Date(popup.expiresAt).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <button
                      className="btn-secondary"
                      onClick={() => handleEdit(popup)}
                      style={{ marginRight: '5px' }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => handleDelete(popup.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
            No popups created yet.
          </p>
        )}
      </div>
    </div>
  );
}
