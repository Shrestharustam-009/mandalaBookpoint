'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function BlogAdminPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSlug, setEditingSlug] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    author: '',
    excerpt: '',
    content: '',
    published: true,
  });

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const data = await api.blog.getAll();
        setPosts(data);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
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
      const postData = {
        ...formData,
      };

      if (editingSlug) {
        // Use slug as identifier for update
        await api.blog.update(editingSlug, postData);
      } else {
        await api.blog.create(postData);
      }

      const updatedPosts = await api.blog.getAll();
      setPosts(updatedPosts);
      setFormData({
        title: '',
        slug: '',
        author: '',
        excerpt: '',
        content: '',
        published: true,
      });
      setShowForm(false);
      setEditingSlug(null);
    } catch (error) {
      console.error('Error saving blog post:', error);
      alert('Failed to save blog post. Please try again.');
    }
  };

  const handleEdit = (post) => {
    setFormData({
      title: post.title,
      slug: post.slug,
      author: post.author || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      published: post.published,
    });
    setEditingSlug(post.slug);
    setShowForm(true);
  };

  const handleDelete = async (slug) => {
    if (confirm('Are you sure you want to delete this blog post?')) {
      try {
        await api.blog.delete(slug);
        const updatedPosts = await api.blog.getAll();
        setPosts(updatedPosts);
      } catch (error) {
        console.error('Error deleting blog post:', error);
        alert('Failed to delete blog post. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSlug(null);
    setFormData({
      title: '',
      slug: '',
      author: '',
      excerpt: '',
      content: '',
      published: true,
    });
  };

  return (
    <div>
      <div
        style={{
          marginBottom: '30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 m-0">Blog Management</h1>
        <button className="px-5 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(79,70,229,0.25)] whitespace-nowrap" onClick={() => setShowForm(true)}>
          + Add Post
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300"></div>
          <div className="relative bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 z-10">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">
            {editingSlug ? 'Edit Blog Post' : 'Add New Blog Post'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
              }}
            >
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Slug</label>
                <input
                  type="text"
                  name="slug"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="e.g., welcome-to-bookhaven"
                  required
                  disabled={!!editingSlug}
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Author</label>
                <input
                  type="text"
                  name="author"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none"
                  value={formData.author}
                  onChange={handleInputChange}
                  placeholder="Optional"
                />
              </div>

              <div
                className="form-group"
                style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}
              >
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    margin: 0,
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    name="published"
                    checked={formData.published}
                    onChange={handleInputChange}
                  />
                  <span>Published</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Excerpt</label>
              <textarea
                name="excerpt"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none min-h-[120px] resize-y"
                value={formData.excerpt}
                onChange={handleInputChange}
                placeholder="Short summary shown in the blog list"
              />
            </div>

            <div className="form-group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Content</label>
              <textarea
                name="content"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none min-h-[120px] resize-y"
                value={formData.content}
                onChange={handleInputChange}
                rows={8}
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-100">
              <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(79,70,229,0.25)] whitespace-nowrap">
                {editingSlug ? 'Update Post' : 'Create Post'}
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] overflow-hidden border border-gray-100/50 mb-8">
        {posts.length > 0 ? (
          <div className="overflow-x-auto w-full"><table className="w-full min-w-max text-left border-collapse">
            <thead className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Slug</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Author</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Published</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Published At</th>
                <th style={{ width: '170px' }} className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(post => (
                <tr key={post.id} className="hover:bg-gray-50/80 transition-colors duration-200 border-b border-gray-100">
                  <td data-label="Title" className="align-middle px-6 py-4">{post.title}</td>
                  <td data-label="Slug" className="align-middle px-6 py-4">{post.slug}</td>
                  <td data-label="Author" className="align-middle px-6 py-4">{post.author || '-'}</td>
                  <td data-label="Published" className="align-middle px-6 py-4">{post.published ? '✓' : '✗'}</td>
                  <td data-label="Published At" className="align-middle px-6 py-4">
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString()
                      : '-'}
                  </td>
                  <td data-label="Actions" className="align-middle px-6 py-4">
                    <button
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      onClick={() => handleEdit(post)}
                      style={{ marginRight: '5px' }}
                    >
                      Edit
                    </button>
                    <button
                      className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 shadow-sm transition-colors"
                      onClick={() => handleDelete(post.slug)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        ) : (
          <p
            style={{
              textAlign: 'center',
              color: '#6b7280',
              padding: '20px',
            }}
          >
            No blog posts yet. Add one to get started!
          </p>
        )}
      </div>
    </div>
  );
}

