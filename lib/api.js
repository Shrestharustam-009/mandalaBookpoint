/**
 * API Client Utility
 * Centralized API request handling
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    const text = await response.text();

    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (parseError) {
      throw new ApiError(
        response.ok ? 'Invalid server response' : (text || `Request failed (${response.status})`),
        response.status || 0
      );
    }

    if (!response.ok) {
      throw new ApiError(data.error || data.message || 'An error occurred', response.status);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(error.message || 'Network error', 0);
  }
}

export const api = {
  // Books
  books: {
    getAll: () => request('/books'),
    getById: (id) => request(`/books/${id}`),
    getByCategoryId: (categoryId) => request(`/books?categoryId=${categoryId}`),
    search: (query) => request(`/books/search?q=${encodeURIComponent(query)}`),
    create: (book) => request('/books', { method: 'POST', body: book }),
    update: (id, updates) => request(`/books/${id}`, { method: 'PUT', body: updates }),
    delete: (id) => request(`/books/${id}`, { method: 'DELETE' }),
  },

  // Blog
  blog: {
    getAll: () => request('/blog'),
    getBySlug: (slug) => request(`/blog/${slug}`),
    create: (post) => request('/blog', { method: 'POST', body: post }),
    update: (id, updates) => request(`/blog/${id}`, { method: 'PUT', body: updates }),
    delete: (id) => request(`/blog/${id}`, { method: 'DELETE' }),
  },

  // Categories
  categories: {
    getAll: () => request('/categories'),
    getById: (id) => request(`/categories/${id}`),
    getBySlug: (slug) => request(`/categories/slug/${slug}`),
    create: (category) => request('/categories', { method: 'POST', body: category }),
    update: (id, updates) => request(`/categories/${id}`, { method: 'PUT', body: updates }),
    delete: (id) => request(`/categories/${id}`, { method: 'DELETE' }),
  },

  // Reviews
  reviews: {
    getAll: () => request('/reviews'),
    getByBookId: (bookId) => request(`/reviews?bookId=${bookId}`),
    create: (review) => request('/reviews', { method: 'POST', body: review }),
  },

  // Users
  users: {
    getAll: () => request('/users'),
    getById: (id) => request(`/users/${id}`),
    getByEmail: (email) => request(`/users/email/${email}`),
    create: (user) => request('/users', { method: 'POST', body: user }),
    update: (id, updates) => request(`/users/${id}`, { method: 'PUT', body: updates }),
  },

  // Newsletter
  newsletter: {
    getAll: () => request('/newsletter'),
    subscribe: (email) => request('/newsletter/subscribe', { method: 'POST', body: { email } }),
  },

  // Popups
  popups: {
    getAll: () => request('/popups'),
    getActive: () => request('/popups?active=true'),
    create: (popup) => request('/popups', { method: 'POST', body: popup }),
    update: (id, updates) => request(`/popups/${id}`, { method: 'PUT', body: updates }),
    delete: (id) => request(`/popups/${id}`, { method: 'DELETE' }),
  },

  // Orders
  orders: {
    getAll: () => request('/orders'),
    getById: (id) => request(`/orders/${id}`),
    create: (order) => request('/orders', { method: 'POST', body: order }),
    update: (id, updates) => request(`/orders/${id}`, { method: 'PUT', body: updates }),
  },

  // Auth
  auth: {
    register: (email, password, name) => request('/auth/register', { method: 'POST', body: { email, password, name } }),
    login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  },

  // Payment
  payment: {
    create: (paymentData) => request('/payment/create', { method: 'POST', body: paymentData }),
    generatePage: (paymentData) => request('/payment/generate-page', { method: 'POST', body: paymentData }),
    getStatus: (transactionId, orderId) => {
      const params = new URLSearchParams();
      if (transactionId) params.set('transactionId', transactionId);
      if (orderId) params.set('orderId', orderId);
      return request(`/payment/status?${params.toString()}`);
    },
    getStatusByOrder: (orderId) => request(`/payment/status?orderId=${orderId}`),
  },
};

export { ApiError };
