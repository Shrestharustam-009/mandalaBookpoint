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
        <h1 style={{ margin: 0 }}>Blog Management</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + Add Post
        </button>
      </div>

      {showForm && (
        <div className="admin-card">
          <div className="admin-card-title">
            {editingSlug ? 'Edit Blog Post' : 'Add New Blog Post'}
          </div>
          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
              }}
            >
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
                <label className="form-label">Slug</label>
                <input
                  type="text"
                  name="slug"
                  className="form-input"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="e.g., welcome-to-bookhaven"
                  required
                  disabled={!!editingSlug}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Author</label>
                <input
                  type="text"
                  name="author"
                  className="form-input"
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
              <label className="form-label">Excerpt</label>
              <textarea
                name="excerpt"
                className="form-textarea"
                value={formData.excerpt}
                onChange={handleInputChange}
                placeholder="Short summary shown in the blog list"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Content</label>
              <textarea
                name="content"
                className="form-textarea"
                value={formData.content}
                onChange={handleInputChange}
                rows={8}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn-primary">
                {editingSlug ? 'Update Post' : 'Create Post'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-card">
        {posts.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Slug</th>
                <th>Author</th>
                <th>Published</th>
                <th>Published At</th>
                <th style={{ width: '170px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(post => (
                <tr key={post.id}>
                  <td data-label="Title">{post.title}</td>
                  <td data-label="Slug">{post.slug}</td>
                  <td data-label="Author">{post.author || '-'}</td>
                  <td data-label="Published">{post.published ? '✓' : '✗'}</td>
                  <td data-label="Published At">
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString()
                      : '-'}
                  </td>
                  <td data-label="Actions">
                    <button
                      className="btn-secondary"
                      onClick={() => handleEdit(post)}
                      style={{ marginRight: '5px' }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => handleDelete(post.slug)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

