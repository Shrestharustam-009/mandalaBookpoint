'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await api.categories.getAll();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await api.categories.update(editingId, formData);
      } else {
        await api.categories.create(formData);
      }
      
      const updatedCategories = await api.categories.getAll();
      setCategories(updatedCategories);
      setFormData({ name: '', slug: '', description: '' });
      setShowForm(false);
      setEditingId(null);
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Failed to save category. Please try again.');
    }
  };

  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description,
    });
    setEditingId(category.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        await api.categories.delete(id);
        const updatedCategories = await api.categories.getAll();
        setCategories(updatedCategories);
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Failed to delete category. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', slug: '', description: '' });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 m-0">Book Categories</h1>
        <button className="px-5 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(79,70,229,0.25)] whitespace-nowrap" onClick={() => setShowForm(true)}>
          + Add Category
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300"></div>
          <div className="relative bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 z-10">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">
            {editingId ? 'Edit Category' : 'Add New Category'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category Name</label>
              <input
                type="text"
                name="name"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Slug (URL-friendly)</label>
              <input
                type="text"
                name="slug"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none"
                value={formData.slug}
                onChange={handleInputChange}
                placeholder="e.g., fiction"
                required
              />
            </div>

            <div className="form-group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none min-h-[120px] resize-y"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-100">
              <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(79,70,229,0.25)] whitespace-nowrap">
                {editingId ? 'Update Category' : 'Create Category'}
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
        {categories.length > 0 ? (
          <div className="overflow-x-auto w-full"><table className="w-full min-w-max text-left border-collapse">
            <thead className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Slug</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                <th style={{ width: '150px' }} className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(category => (
                <tr key={category.id} className="hover:bg-gray-50/80 transition-colors duration-200 border-b border-gray-100">
                  <td className="align-middle px-6 py-4">{category.name}</td>
                  <td className="align-middle px-6 py-4">{category.slug}</td>
                  <td className="align-middle px-6 py-4">{category.description}</td>
                  <td className="align-middle px-6 py-4">
                    <button
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      onClick={() => handleEdit(category)}
                      style={{ marginRight: '5px' }}
                    >
                      Edit
                    </button>
                    <button
                      className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 shadow-sm transition-colors"
                      onClick={() => handleDelete(category.id)}
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
            No categories yet. Create one to get started!
          </p>
        )}
      </div>
    </div>
  );
}
