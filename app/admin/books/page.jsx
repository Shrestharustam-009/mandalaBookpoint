'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category_id: '',
    description: '',
    isbn: '',
    price: '',
    discount: '',
    weight: '',
    stock: 0,
    availability: true,
    cover_image: '/placeholder.jpg',
    tags: '',
  });
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [booksData, categoriesData] = await Promise.all([
          api.books.getAll(),
          api.categories.getAll(),
        ]);
        setBooks(booksData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'stock' ? (value === '' ? 0 : parseInt(value, 10) || 0) : value),
    }));
  };

  const handleCategoryToggle = (e) => {
    const value = parseInt(e.target.value);
    if (Number.isNaN(value)) return;
    setSelectedCategories(prev =>
      prev.includes(value) ? prev.filter(id => id !== value) : [...prev, value]
    );
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    try {
      setUploadingImage(true);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload image
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      
      setFormData(prev => ({
        ...prev,
        cover_image: data.url,
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      cover_image: '/placeholder.jpg',
    }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (selectedCategories.length === 0) {
        alert('Please select at least one category');
        return;
      }

      const bookData = {
        title: formData.title,
        author: formData.author,
        category_id: selectedCategories[0],
        categoryIds: selectedCategories,
        description: formData.description,
        isbn: formData.isbn.trim() || null,
        price: formData.price ? parseFloat(formData.price) : null,
        discount: parseFloat(formData.discount) || 0,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        stock: parseInt(formData.stock, 10) || 0,
        availability: formData.availability,
        cover_image: formData.cover_image,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      };

      if (editingId) {
        await api.books.update(editingId, bookData);
      } else {
        await api.books.create(bookData);
      }
      
      const updatedBooks = await api.books.getAll();
      setBooks(updatedBooks);
      resetForm();
    } catch (error) {
      console.error('Error saving book:', error);
      alert('Failed to save book. Please try again.');
    }
  };

  const handleEdit = (book) => {

    // Handle both camelCase (from API) and snake_case (from form)
    const coverImage = book.coverImage || book.cover_image || '/placeholder.jpg';
    const categoryIds = book.categoryIds || book.category_ids || (book.categoryId ? [book.categoryId] : book.category_id ? [book.category_id] : []);

    setFormData({
      title: book.title || '',
      author: book.author || '',
      category_id: (categoryIds && categoryIds[0]) || '',
      description: book.description || '',
      isbn: book.isbn || '',
      price: book.price ?? '',
      discount: book.discount || 0,
      weight: book.weight || '',
      stock: book.stock != null ? parseInt(book.stock, 10) : 0,
      availability: book.availability !== undefined ? book.availability : true,
      cover_image: coverImage,
      tags: Array.isArray(book.tags) ? book.tags.join(', ') : (book.tags || ''),
    });
    setSelectedCategories(categoryIds || []);
    setEditingId(book.id);
    setShowForm(true);
    setTimeout(() => {
      document.getElementById('edit-id').scrollIntoView({ behavior: 'smooth' });
    }, 100);
    setImagePreview(coverImage !== '/placeholder.jpg' ? coverImage : null);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this book?')) {
      try {
        await api.books.delete(id);
        const updatedBooks = await api.books.getAll();
        setBooks(updatedBooks);
      } catch (error) {
        console.error('Error deleting book:', error);
        alert('Failed to delete book. Please try again.');
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setImagePreview(null);
    setFormData({
      title: '',
      author: '',
      category_id: '',
      description: '',
      isbn: '',
      price: '',
      discount: '',
      weight: '',
      stock: 0,
      availability: true,
      cover_image: '/placeholder.jpg',
      tags: '',
    });
    setSelectedCategories([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCancel = () => {
    resetForm();
  };

  const getCategoryName = (id) => {
    return categories.find(c => c.id === id)?.name || 'Unknown';
  };

  const filteredBooks = searchQuery.trim()
    ? books.filter(b =>
        (b.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.author || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : books;

  return (
    <div>
      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <h1 style={{ margin: 0 }}>Books Management</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="search"
            placeholder="Search books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ minWidth: '220px', padding: '8px 12px' }}
          />
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            + Add Book
          </button>
        </div>
      </div>

      {showForm && (
        <div className="admin-card" id="edit-id">
          <div className="admin-card-title">
            {editingId ? 'Edit Book' : 'Add New Book'}
          </div>
          <form onSubmit={handleSubmit}>
            {/* Image Upload Section */}
            <div className="form-group" style={{ marginBottom: '30px' }}>
              <label className="form-label">Cover Image</label>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? 'Uploading...' : 'Choose Image'}
                  </button>
                  {imagePreview && (
                    <button
                      type="button"
                      className="btn-danger"
                      onClick={handleRemoveImage}
                      style={{ marginLeft: '10px' }}
                    >
                      Remove
                    </button>
                  )}
                </div>
                {imagePreview && (
                  <div style={{
                    width: '150px',
                    height: '200px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f9fafb'
                  }}>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
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
                <label className="form-label">Author</label>
                <input
                  type="text"
                  name="author"
                  className="form-input"
                  value={formData.author}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">ISBN Number</label>
                <input
                  type="text"
                  name="isbn"
                  className="form-input"
                  value={formData.isbn}
                  onChange={handleInputChange}
                  placeholder="e.g., 978-3-16-148410-0"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Categories</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {categories.map(cat => (
                    <label
                      key={cat.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        value={cat.id}
                        checked={selectedCategories.includes(cat.id)}
                        onChange={handleCategoryToggle}
                      />
                      <span>{cat.name}</span>
                    </label>
                  ))}
                </div>
                <p style={{ marginTop: '6px', fontSize: '12px', color: '#6b7280' }}>
                  Select one or more categories. The first selected will be used as the primary category.
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">Price (NRs) <span style={{ color: '#6b7280', fontWeight: 'normal' }}>(Optional)</span></label>
                <input
                  type="number"
                  name="price"
                  className="form-input"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  placeholder="Leave empty if no price"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Stock</label>
                <input
                  type="number"
                  name="stock"
                  className="form-input"
                  value={formData.stock}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="0"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Discount (%)</label>
                <input
                  type="number"
                  name="discount"
                  className="form-input"
                  value={formData.discount}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  className="form-input"
                  value={formData.weight}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  placeholder="Optional"
                />
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="availability"
                    checked={formData.availability}
                    onChange={handleInputChange}
                  />
                  <span>Available for Purchase</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                className="form-textarea"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tags (comma-separated)</label>
              <input
                type="text"
                name="tags"
                className="form-input"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="e.g., fiction, classic, bestseller"
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn-primary" disabled={uploadingImage}>
                {editingId ? 'Update Book' : 'Create Book'}
              </button>
              <button type="button" className="btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-card">
        {books.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Author</th>
                <th>Category</th>
                <th>ISBN</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Weight</th>
                <th>Discount</th>
                <th>Available</th>
                <th style={{ width: '150px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map(book => (
                <tr key={book.id}>
                  <td data-label="Image">
                    <img
                      src={(book.coverImage || book.cover_image || '/placeholder.jpg').startsWith('http') 
                        ? (book.coverImage || book.cover_image) 
                        : (book.coverImage || book.cover_image || '/placeholder.jpg')}
                      alt={book.title || 'Book cover'}
                      style={{
                        width: '40px',
                        height: '60px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                        backgroundColor: '#f3f4f6'
                      }}
                      onError={(e) => {
                        if (e.target.src !== '/placeholder.jpg') {
                          e.target.src = '/placeholder.jpg';
                        }
                      }}
                    />
                  </td>
                  <td data-label="Title">{book.title || 'Untitled'}</td>
                  <td data-label="Author">{book.author || 'Unknown'}</td>
                  <td data-label="Category">
                    {book.categories && book.categories.length > 0
                      ? book.categories.map(c => c.name).join(', ')
                      : getCategoryName(book.categoryId || book.category_id)}
                  </td>
                  <td data-label="ISBN">{book.isbn || '-'}</td>
                  <td data-label="Price">{book.price != null ? `Rs. ${parseFloat(book.price).toFixed(2)}` : '-'}</td>
                  <td data-label="Stock">{book.stock ?? 0}</td>
                  <td data-label="Weight">{book.weight ? `${book.weight} kg` : '-'}</td>
                  <td data-label="Discount">{book.discount || 0}%</td>
                  <td data-label="Available">{book.availability ? '✓' : '✗'}</td>
                  <td data-label="Actions">
                    <button
                      className="btn-secondary"
                      onClick={() => handleEdit(book)}
                      style={{ marginRight: '5px' }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => handleDelete(book.id)}
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
            {searchQuery ? `No books match "${searchQuery}".` : 'No books yet. Add one to get started!'}
          </p>
        )}
      </div>
    </div>
  );
}