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
        weight: formData.weight ? Number(parseFloat(formData.weight).toFixed(2)) : null,
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 m-0">Books Management</h1>
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full sm:w-auto">
          <input
            type="search"
            placeholder="Search books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none shadow-sm"
            style={{ minWidth: '220px' }}
          />
          <button className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(79,70,229,0.25)] whitespace-nowrap" onClick={() => setShowForm(true)}>
            + Add Book
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" id="edit-id">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300" onClick={handleCancel}></div>
          <div className="relative bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 md:p-8 z-10">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">
              {editingId ? 'Edit Book' : 'Add New Book'}
            </h2>
            <form onSubmit={handleSubmit}>
            {/* Image Upload Section */}
            <div className="form-group mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Cover Image</label>
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                <div className="w-full sm:w-auto flex flex-col gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                  <div className="flex flex-row gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      className="btn-secondary flex-1 sm:flex-none"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? 'Uploading...' : 'Choose Image'}
                    </button>
                    {imagePreview && (
                      <button
                        type="button"
                        className="btn-danger flex-1 sm:flex-none"
                        onClick={handleRemoveImage}
                      >
                        Remove
                      </button>
                    )}
                  </div>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Author</label>
                <input
                  type="text"
                  name="author"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none"
                  value={formData.author}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">ISBN Number</label>
                <input
                  type="text"
                  name="isbn"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none"
                  value={formData.isbn}
                  onChange={handleInputChange}
                  placeholder="e.g., 978-3-16-148410-0"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Categories</label>
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price (NRs) <span style={{ color: '#6b7280', fontWeight: 'normal' }}>(Optional)</span></label>
                <input
                  type="number"
                  name="price"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  placeholder="Leave empty if no price"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Stock</label>
                <input
                  type="number"
                  name="stock"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none"
                  value={formData.stock}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="0"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Discount (%)</label>
                <input
                  type="number"
                  name="discount"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none"
                  value={formData.discount}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none"
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none min-h-[120px] resize-y"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tags (comma-separated)</label>
              <input
                type="text"
                name="tags"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="e.g., fiction, classic, bestseller"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-100">
              <button 
                type="submit" 
                className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(79,70,229,0.25)]" 
                disabled={uploadingImage}
              >
                {editingId ? 'Update Book' : 'Create Book'}
              </button>
              <button 
                type="button" 
                className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all duration-200" 
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] overflow-hidden border border-gray-100/50">
        {books.length > 0 ? (
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[800px] text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="text-center px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Image</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Author</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">ISBN</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Weight</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Discount</th>
                  <th className="text-center px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Available</th>
                  <th className="text-center px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider" style={{ width: '150px' }}>Actions</th>
                </tr>
              </thead>
            <tbody>
              {filteredBooks.map(book => (
                <tr key={book.id} className="hover:bg-gray-50/80 transition-colors duration-200 border-b border-gray-100">
                  <td data-label="Image" className="text-center align-middle px-6 py-4">
                    <div className="flex justify-center">
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
                    </div>
                  </td>
                  <td data-label="Title" className="text-left align-middle font-medium px-6 py-4">{book.title || 'Untitled'}</td>
                  <td data-label="Author" className="text-left align-middle px-6 py-4">{book.author || 'Unknown'}</td>
                  <td data-label="Category" className="text-left align-middle px-6 py-4">
                    {book.categories && book.categories.length > 0
                      ? book.categories.map(c => c.name).join(', ')
                      : getCategoryName(book.categoryId || book.category_id)}
                  </td>
                  <td data-label="ISBN" className="text-left align-middle whitespace-nowrap px-6 py-4">{book.isbn || '-'}</td>
                  <td data-label="Price" className="text-right align-middle whitespace-nowrap px-6 py-4">{book.price != null ? `Rs. ${parseFloat(book.price).toFixed(2)}` : '-'}</td>
                  <td data-label="Stock" className="text-right align-middle px-6 py-4">{book.stock ?? 0}</td>
                  <td data-label="Weight" className="text-right align-middle whitespace-nowrap px-6 py-4">{book.weight ? `${book.weight} kg` : '-'}</td>
                  <td data-label="Discount" className="text-right align-middle px-6 py-4">{book.discount || 0}%</td>
                  <td data-label="Available" className="text-center align-middle px-6 py-4">{book.availability ? '✓' : '✗'}</td>
                  <td data-label="Actions" className="text-center align-middle px-6 py-4">
                    <button
                      className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      onClick={() => handleEdit(book)}
                      style={{ marginRight: '5px' }}
                    >
                      Edit
                    </button>
                    <button
                      className="px-3 py-1.5 text-xs font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 shadow-sm transition-colors"
                      onClick={() => handleDelete(book.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
            {searchQuery ? `No books match "${searchQuery}".` : 'No books yet. Add one to get started!'}
          </p>
        )}
      </div>
    </div>
  );
}