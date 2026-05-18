/**
 * Database configuration and initialization
 * Currently using mock/in-memory data, ready for database integration
 */

// Mock database store (replace with real database when ready)
let mockDatabase = {
  categories: [],
  books: [],
  users: [],
  reviews: [],
  orders: [],
  newsletters: [],
  popups: [],
};

/**
 * Initialize database with sample data
 */
export const initializeDatabase = () => {
  // Sample categories
  mockDatabase.categories = [
    {
      id: 1,
      name: 'Fiction',
      slug: 'fiction',
      description: 'Novels and short stories',
      createdAt: new Date(),
    },
    {
      id: 2,
      name: 'Non-Fiction',
      slug: 'non-fiction',
      description: 'Educational and informative books',
      createdAt: new Date(),
    },
    {
      id: 3,
      name: 'Science',
      slug: 'science',
      description: 'Scientific and technical books',
      createdAt: new Date(),
    },
    {
      id: 4,
      name: 'Biography',
      slug: 'biography',
      description: 'Life stories and memoirs',
      createdAt: new Date(),
    },
  ];

  // Sample books
  mockDatabase.books = [
    {
      id: 1,
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      categoryId: 1,
      description: 'A classic novel about wealth and love in the Jazz Age',
      price: 2500, // NRs
      discount: 10,
      availability: true,
      coverImage: '/placeholder.jpg',
      tags: ['classic', 'romance', 'american-literature'],
      reviews: [],
      createdAt: new Date(),
    },
    {
      id: 2,
      title: 'Sapiens',
      author: 'Yuval Noah Harari',
      categoryId: 2,
      description: 'A brief history of humankind',
      price: 3000, // NRs
      discount: 0,
      availability: true,
      coverImage: '/placeholder.jpg',
      tags: ['history', 'science', 'non-fiction'],
      reviews: [],
      createdAt: new Date(),
    },
    {
      id: 3,
      title: 'A Brief History of Time',
      author: 'Stephen Hawking',
      categoryId: 3,
      description: 'Understanding the universe and our place in it',
      price: 2800, // NRs
      discount: 5,
      availability: true,
      coverImage: '/placeholder.jpg',
      tags: ['science', 'physics', 'cosmology'],
      reviews: [],
      createdAt: new Date(),
    },
    {
      id: 4,
      title: 'Steve Jobs',
      author: 'Walter Isaacson',
      categoryId: 4,
      description: 'The exclusive biography of the Apple founder',
      price: 2200, // NRs
      discount: 15,
      availability: true,
      coverImage: '/placeholder.jpg',
      tags: ['biography', 'technology', 'business'],
      reviews: [],
      createdAt: new Date(),
    },
  ];
};

/**
 * Database operations
 */
export const db = {
  // Categories
  categories: {
    getAll: () => mockDatabase.categories,
    getById: (id) => mockDatabase.categories.find(c => c.id === id),
    getBySlug: (slug) => mockDatabase.categories.find(c => c.slug === slug),
    create: (category) => {
      const newCategory = {
        id: Math.max(...mockDatabase.categories.map(c => c.id), 0) + 1,
        ...category,
        createdAt: new Date(),
      };
      mockDatabase.categories.push(newCategory);
      return newCategory;
    },
    update: (id, updates) => {
      const index = mockDatabase.categories.findIndex(c => c.id === id);
      if (index !== -1) {
        mockDatabase.categories[index] = { ...mockDatabase.categories[index], ...updates };
        return mockDatabase.categories[index];
      }
      return null;
    },
    delete: (id) => {
      mockDatabase.categories = mockDatabase.categories.filter(c => c.id !== id);
    },
  },

  // Books
  books: {
    getAll: () => mockDatabase.books,
    getById: (id) => mockDatabase.books.find(b => b.id === id),
    getByCategoryId: (categoryId) => mockDatabase.books.filter(b => b.categoryId === categoryId),
    search: (query) => {
      const lowerQuery = query.toLowerCase();
      return mockDatabase.books.filter(b =>
        b.title.toLowerCase().includes(lowerQuery) ||
        b.author.toLowerCase().includes(lowerQuery) ||
        b.tags?.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
        b.description.toLowerCase().includes(lowerQuery)
      );
    },
    create: (book) => {
      const newBook = {
        id: Math.max(...mockDatabase.books.map(b => b.id), 0) + 1,
        ...book,
        reviews: [],
        createdAt: new Date(),
      };
      mockDatabase.books.push(newBook);
      return newBook;
    },
    update: (id, updates) => {
      const index = mockDatabase.books.findIndex(b => b.id === id);
      if (index !== -1) {
        mockDatabase.books[index] = { ...mockDatabase.books[index], ...updates };
        return mockDatabase.books[index];
      }
      return null;
    },
    delete: (id) => {
      mockDatabase.books = mockDatabase.books.filter(b => b.id !== id);
    },
  },

  // Users
  users: {
    getAll: () => mockDatabase.users,
    getById: (id) => mockDatabase.users.find(u => u.id === id),
    getByEmail: (email) => mockDatabase.users.find(u => u.email === email),
    create: (user) => {
      const newUser = {
        id: Math.max(...mockDatabase.users.map(u => u.id), 0) + 1,
        ...user,
        createdAt: new Date(),
      };
      mockDatabase.users.push(newUser);
      return newUser;
    },
    update: (id, updates) => {
      const index = mockDatabase.users.findIndex(u => u.id === id);
      if (index !== -1) {
        mockDatabase.users[index] = { ...mockDatabase.users[index], ...updates };
        return mockDatabase.users[index];
      }
      return null;
    },
  },

  // Reviews
  reviews: {
    getAll: () => mockDatabase.reviews,
    getByBookId: (bookId) => mockDatabase.reviews.filter(r => r.bookId === bookId),
    create: (review) => {
      const newReview = {
        id: Math.max(...mockDatabase.reviews.map(r => r.id), 0) + 1,
        ...review,
        createdAt: new Date(),
      };
      mockDatabase.reviews.push(newReview);
      return newReview;
    },
  },

  // Popups
  popups: {
    getAll: () => mockDatabase.popups,
    getActive: () => mockDatabase.popups.filter(p => p.active),
    create: (popup) => {
      const newPopup = {
        id: Math.max(...mockDatabase.popups.map(p => p.id), 0) + 1,
        ...popup,
        createdAt: new Date(),
      };
      mockDatabase.popups.push(newPopup);
      return newPopup;
    },
    update: (id, updates) => {
      const index = mockDatabase.popups.findIndex(p => p.id === id);
      if (index !== -1) {
        mockDatabase.popups[index] = { ...mockDatabase.popups[index], ...updates };
        return mockDatabase.popups[index];
      }
      return null;
    },
    delete: (id) => {
      mockDatabase.popups = mockDatabase.popups.filter(p => p.id !== id);
    },
  },

  // Newsletter
  newsletter: {
    getAll: () => mockDatabase.newsletters,
    subscribe: (email) => {
      if (!mockDatabase.newsletters.find(n => n.email === email)) {
        mockDatabase.newsletters.push({
          id: Math.max(...mockDatabase.newsletters.map(n => n.id), 0) + 1,
          email,
          subscribedAt: new Date(),
        });
      }
    },
  },

  // Orders
  orders: {
    getAll: () => mockDatabase.orders,
    getById: (id) => mockDatabase.orders.find(o => o.id === id),
    create: (order) => {
      const newOrder = {
        id: Math.max(...mockDatabase.orders.map(o => o.id), 0) + 1,
        ...order,
        createdAt: new Date(),
      };
      mockDatabase.orders.push(newOrder);
      return newOrder;
    },
    update: (id, updates) => {
      const index = mockDatabase.orders.findIndex(o => o.id === id);
      if (index !== -1) {
        mockDatabase.orders[index] = { ...mockDatabase.orders[index], ...updates };
        return mockDatabase.orders[index];
      }
      return null;
    },
  },
};

// Initialize with sample data on first import
initializeDatabase();
