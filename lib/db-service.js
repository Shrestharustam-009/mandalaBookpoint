/**
 * Database service layer
 * Replaces the mock database with real database operations
 */

import { query, insert, execute } from './database';

// Helper to parse JSON fields
function parseJsonField(value) {
  if (!value) return [];
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  }
  return value;
}

// Helper to stringify JSON fields
function stringifyJsonField(value) {
  return Array.isArray(value) ? JSON.stringify(value) : value;
}

// Helper to fetch categories for a list of books (many-to-many)
async function getCategoriesForBooks(bookIds) {
  if (!bookIds || bookIds.length === 0) return {};
  
  const placeholders = bookIds.map(() => '?').join(', ');
  const sql = `
    SELECT bc.book_id, c.id AS category_id, c.name
    FROM book_categories bc
    JOIN categories c ON c.id = bc.category_id
    WHERE bc.book_id IN (${placeholders})
    ORDER BY c.name
  `;
  
  const rows = await query(sql, bookIds);
  const map = {};
  for (const row of rows) {
    if (!map[row.book_id]) {
      map[row.book_id] = [];
    }
    map[row.book_id].push({
      id: row.category_id,
      name: row.name,
    });
  }
  return map;
}

export const dbService = {
  // Categories
  categories: {
    getAll: async () => {
      const results = await query('SELECT * FROM categories ORDER BY name');
      return results.map(row => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        createdAt: row.created_at,
      }));
    },

    getById: async (id) => {
      const results = await query('SELECT * FROM categories WHERE id = ?', [id]);
      if (results.length === 0) return null;
      const row = results[0];
      return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        createdAt: row.created_at,
      };
    },

    getBySlug: async (slug) => {
      const results = await query('SELECT * FROM categories WHERE slug = ?', [slug]);
      if (results.length === 0) return null;
      const row = results[0];
      return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        createdAt: row.created_at,
      };
    },

    create: async (category) => {
      const id = await insert(
        'INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)',
        [category.name, category.slug, category.description || null]
      );
      return dbService.categories.getById(id);
    },

    update: async (id, updates) => {
      const fields = [];
      const values = [];
      
      if (updates.name !== undefined) {
        fields.push('name = ?');
        values.push(updates.name);
      }
      if (updates.slug !== undefined) {
        fields.push('slug = ?');
        values.push(updates.slug);
      }
      if (updates.description !== undefined) {
        fields.push('description = ?');
        values.push(updates.description);
      }
      if (updates.isbn !== undefined) {
        fields.push('isbn = ?');
        values.push(updates.isbn || null);
      }
      
      if (fields.length === 0) return null;
      
      values.push(id);
      await execute(
        `UPDATE categories SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        values
      );
      return dbService.categories.getById(id);
    },

    delete: async (id) => {
      await execute('DELETE FROM categories WHERE id = ?', [id]);
    },
  },

  // Books
  books: {
    getAll: async () => {
      const results = await query('SELECT * FROM books ORDER BY created_at DESC');
      const bookIds = results.map(row => row.id);
      const categoriesMap = await getCategoriesForBooks(bookIds);

      return results.map(row => {
        const categories = categoriesMap[row.id] || [];
        const stock = row.stock != null ? parseInt(row.stock, 10) : 0;
        const inStock = stock > 0;
        return {
          id: row.id,
          title: row.title,
          author: row.author,
          categoryId: row.category_id,
          categoryIds: categories.map(c => c.id),
          categories,
          description: row.description,
          isbn: row.isbn || null,
          price: row.price != null ? parseFloat(row.price) : null,
          discount: parseFloat(row.discount || 0),
          availability: Boolean(row.availability) && inStock,
          stock,
          weight: row.weight != null ? parseFloat(row.weight) : null,
          coverImage: row.cover_image,
          tags: parseJsonField(row.tags),
          createdAt: row.created_at,
        };
      });
    },

    getById: async (id) => {
      const results = await query('SELECT * FROM books WHERE id = ?', [id]);
      if (results.length === 0) return null;
      const row = results[0];
      const categoriesMap = await getCategoriesForBooks([row.id]);
      const categories = categoriesMap[row.id] || [];
      const stock = row.stock != null ? parseInt(row.stock, 10) : 0;
      const inStock = stock > 0;
      return {
        id: row.id,
        title: row.title,
        author: row.author,
        categoryId: row.category_id,
        categoryIds: categories.map(c => c.id),
        categories,
        description: row.description,
        isbn: row.isbn || null,
        price: row.price != null ? parseFloat(row.price) : null,
        discount: parseFloat(row.discount || 0),
        availability: Boolean(row.availability) && inStock,
        stock,
        weight: row.weight != null ? parseFloat(row.weight) : null,
        coverImage: row.cover_image,
        tags: parseJsonField(row.tags),
        createdAt: row.created_at,
      };
    },

    getByCategoryId: async (categoryId) => {
      // Use mapping table to support multiple categories per book
      const results = await query(
        `SELECT b.* 
         FROM books b
         JOIN book_categories bc ON bc.book_id = b.id
         WHERE bc.category_id = ?
         ORDER BY b.created_at DESC`,
        [categoryId]
      );
      const bookIds = results.map(row => row.id);
      const categoriesMap = await getCategoriesForBooks(bookIds);

      return results.map(row => {
        const categories = categoriesMap[row.id] || [];
        const stock = row.stock != null ? parseInt(row.stock, 10) : 0;
        const inStock = stock > 0;
        return {
          id: row.id,
          title: row.title,
          author: row.author,
          categoryId: row.category_id,
          categoryIds: categories.map(c => c.id),
          categories,
          description: row.description,
          isbn: row.isbn || null,
          price: row.price != null ? parseFloat(row.price) : null,
          discount: parseFloat(row.discount || 0),
          availability: Boolean(row.availability) && inStock,
          stock,
          weight: row.weight != null ? parseFloat(row.weight) : null,
          coverImage: row.cover_image,
          tags: parseJsonField(row.tags),
          createdAt: row.created_at,
        };
      });
    },

    search: async (queryText) => {
      const searchTerm = `%${queryText.toLowerCase()}%`;
      const results = await query(
        `SELECT * FROM books 
         WHERE LOWER(title) LIKE ? 
            OR LOWER(author) LIKE ? 
            OR LOWER(description) LIKE ?
         ORDER BY created_at DESC`,
        [searchTerm, searchTerm, searchTerm]
      );
      return results.map(row => {
        const stock = row.stock != null ? parseInt(row.stock, 10) : 0;
        const inStock = stock > 0;
        return {
          id: row.id,
          title: row.title,
          author: row.author,
          categoryId: row.category_id,
          description: row.description,
          isbn: row.isbn || null,
          price: row.price != null ? parseFloat(row.price) : null,
          discount: parseFloat(row.discount || 0),
          availability: Boolean(row.availability) && inStock,
          stock,
          weight: row.weight != null ? parseFloat(row.weight) : null,
          coverImage: row.cover_image,
          tags: parseJsonField(row.tags),
          createdAt: row.created_at,
        };
      });
    },

    create: async (book) => {
      const categoryIds = Array.isArray(book.categoryIds) ? book.categoryIds.map(id => parseInt(id)).filter(Boolean) : [];
      const primaryCategoryId = categoryIds[0] || book.categoryId;

      const stock = book.stock != null ? parseInt(book.stock, 10) : 0;
      const id = await insert(
        `INSERT INTO books (title, author, category_id, description, isbn, price, discount, availability, stock, cover_image, tags, weight) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          book.title,
          book.author,
          primaryCategoryId,
          book.description || null,
          book.isbn || null,
          book.price ?? null,
          book.discount || 0,
          book.availability !== false ? 1 : 0,
          stock,
          book.coverImage || '/placeholder.jpg',
          stringifyJsonField(book.tags || []),
          book.weight != null && book.weight !== '' ? Number(parseFloat(book.weight).toFixed(2)) : null,
        ]
      );

      // Insert category mappings (many-to-many)
      const allCategoryIds = categoryIds.length > 0 ? categoryIds : [primaryCategoryId];
      const uniqueCategoryIds = Array.from(new Set(allCategoryIds)).filter(Boolean);
      for (const categoryId of uniqueCategoryIds) {
        await insert(
          'INSERT INTO book_categories (book_id, category_id) VALUES (?, ?)',
          [id, categoryId]
        );
      }

      return dbService.books.getById(id);
    },

    update: async (id, updates) => {
      const fields = [];
      const values = [];
      
      if (updates.title !== undefined) {
        fields.push('title = ?');
        values.push(updates.title);
      }
      if (updates.author !== undefined) {
        fields.push('author = ?');
        values.push(updates.author);
      }
      // Primary category (from categoryId or first of categoryIds)
      const hasCategoryIdsArray = Array.isArray(updates.categoryIds) && updates.categoryIds.length > 0;
      if (updates.categoryId !== undefined || hasCategoryIdsArray) {
        const primaryCategoryId = hasCategoryIdsArray ? updates.categoryIds[0] : updates.categoryId;
        fields.push('category_id = ?');
        values.push(primaryCategoryId);
      }
      if (updates.description !== undefined) {
        fields.push('description = ?');
        values.push(updates.description);
      }
      if (updates.price !== undefined) {
        fields.push('price = ?');
        values.push(updates.price);
      }
      if (updates.discount !== undefined) {
        fields.push('discount = ?');
        values.push(updates.discount);
      }
      if (updates.availability !== undefined) {
        fields.push('availability = ?');
        values.push(updates.availability ? 1 : 0);
      }
      if (updates.coverImage !== undefined || updates.cover_image !== undefined) {
        fields.push('cover_image = ?');
        values.push(updates.coverImage ?? updates.cover_image);
      }
      if (updates.tags !== undefined) {
        fields.push('tags = ?');
        values.push(stringifyJsonField(updates.tags));
      }
      if (updates.stock !== undefined) {
        fields.push('stock = ?');
        values.push(parseInt(updates.stock, 10));
      }
      if (updates.isbn !== undefined) {
        fields.push('isbn = ?');
        values.push(updates.isbn || null);
      }
      if (updates.weight !== undefined) {
        fields.push('weight = ?');
        values.push(updates.weight != null && updates.weight !== '' ? Number(parseFloat(updates.weight).toFixed(2)) : null);
      }
      
      if (fields.length === 0) return null;
      
      values.push(id);
      await execute(
        `UPDATE books SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        values
      );

      // Update category mappings if categoryIds provided
      if (Array.isArray(updates.categoryIds)) {
        const uniqueCategoryIds = Array.from(new Set(updates.categoryIds.map(id => parseInt(id)).filter(Boolean)));
        // Clear existing mappings
        await execute('DELETE FROM book_categories WHERE book_id = ?', [id]);
        // Re-insert mappings
        for (const categoryId of uniqueCategoryIds) {
          await insert(
            'INSERT INTO book_categories (book_id, category_id) VALUES (?, ?)',
            [id, categoryId]
          );
        }
      }

      return dbService.books.getById(id);
    },

    delete: async (id) => {
      await execute('DELETE FROM books WHERE id = ?', [id]);
    },
  },

  // Users
  users: {
    getAll: async () => {
      const results = await query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
      return results.map(row => ({
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
        createdAt: row.created_at,
      }));
    },

    getById: async (id) => {
      const results = await query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [id]);
      if (results.length === 0) return null;
      const row = results[0];
      return {
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
        createdAt: row.created_at,
      };
    },

    getByEmail: async (email) => {
      const results = await query('SELECT * FROM users WHERE email = ?', [email]);
      if (results.length === 0) return null;
      const row = results[0];
      return {
        id: row.id,
        name: row.name,
        email: row.email,
        password: row.password,
        role: row.role,
        createdAt: row.created_at,
      };
    },

    create: async (user) => {
      const id = await insert(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [user.name, user.email, user.password, user.role || 'user']
      );
      return dbService.users.getById(id);
    },

    update: async (id, updates) => {
      const fields = [];
      const values = [];
      
      if (updates.name !== undefined) {
        fields.push('name = ?');
        values.push(updates.name);
      }
      if (updates.email !== undefined) {
        fields.push('email = ?');
        values.push(updates.email);
      }
      if (updates.password !== undefined) {
        fields.push('password = ?');
        values.push(updates.password);
      }
      if (updates.role !== undefined) {
        fields.push('role = ?');
        values.push(updates.role);
      }
      
      if (fields.length === 0) return null;
      
      values.push(id);
      await execute(
        `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        values
      );
      return dbService.users.getById(id);
    },
  },

  // Reviews
  reviews: {
    getAll: async () => {
      const results = await query('SELECT * FROM reviews ORDER BY created_at DESC');
      return results.map(row => ({
        id: row.id,
        bookId: row.book_id,
        userId: row.user_id,
        userName: row.user_name,
        rating: row.rating,
        comment: row.comment,
        createdAt: row.created_at,
      }));
    },

    getByBookId: async (bookId) => {
      const results = await query('SELECT * FROM reviews WHERE book_id = ? ORDER BY created_at DESC', [bookId]);
      return results.map(row => ({
        id: row.id,
        bookId: row.book_id,
        userId: row.user_id,
        userName: row.user_name,
        rating: row.rating,
        comment: row.comment,
        createdAt: row.created_at,
      }));
    },

    create: async (review) => {
      // Ensure all values are defined (convert undefined to null)
      const bookId = review.bookId ?? null;
      const userId = review.userId ?? null;
      const userName = review.userName ?? null;
      const rating = review.rating ?? null;
      const comment = review.comment ?? null;
      
      // Validate required fields
      if (!bookId || !userId || !userName || !rating || !comment) {
        throw new Error('All review fields are required: bookId, userId, userName, rating, comment');
      }
      
      const id = await insert(
        'INSERT INTO reviews (book_id, user_id, user_name, rating, comment) VALUES (?, ?, ?, ?, ?)',
        [bookId, userId, userName, rating, comment]
      );
      const results = await query('SELECT * FROM reviews WHERE id = ?', [id]);
      const row = results[0];
      return {
        id: row.id,
        bookId: row.book_id,
        userId: row.user_id,
        userName: row.user_name,
        rating: row.rating,
        comment: row.comment,
        createdAt: row.created_at,
      };
    },
  },

  // Blog posts
  blog: {
    getAll: async () => {
      const results = await query('SELECT * FROM blog_posts WHERE published = 1 ORDER BY published_at DESC');
      return results.map(row => ({
        id: row.id,
        title: row.title,
        slug: row.slug,
        author: row.author,
        excerpt: row.excerpt,
        content: row.content,
        published: Boolean(row.published),
        publishedAt: row.published_at,
        createdAt: row.created_at,
      }));
    },

    getBySlug: async (slug) => {
      const results = await query('SELECT * FROM blog_posts WHERE slug = ? AND published = 1', [slug]);
      if (results.length === 0) return null;
      const row = results[0];
      return {
        id: row.id,
        title: row.title,
        slug: row.slug,
        author: row.author,
        excerpt: row.excerpt,
        content: row.content,
        published: Boolean(row.published),
        publishedAt: row.published_at,
        createdAt: row.created_at,
      };
    },

    create: async (post) => {
      const id = await insert(
        `INSERT INTO blog_posts (title, slug, author, excerpt, content, published, published_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)` ,
        [
          post.title,
          post.slug,
          post.author || null,
          post.excerpt || null,
          post.content || '',
          post.published ? 1 : 0,
          post.published ? (post.publishedAt || new Date()) : null,
        ]
      );
      const results = await query('SELECT * FROM blog_posts WHERE id = ?', [id]);
      const row = results[0];
      return {
        id: row.id,
        title: row.title,
        slug: row.slug,
        author: row.author,
        excerpt: row.excerpt,
        content: row.content,
        published: Boolean(row.published),
        publishedAt: row.published_at,
        createdAt: row.created_at,
      };
    },

    update: async (id, updates) => {
      const fields = [];
      const values = [];

      if (updates.title !== undefined) {
        fields.push('title = ?');
        values.push(updates.title);
      }
      if (updates.slug !== undefined) {
        fields.push('slug = ?');
        values.push(updates.slug);
      }
      if (updates.author !== undefined) {
        fields.push('author = ?');
        values.push(updates.author);
      }
      if (updates.excerpt !== undefined) {
        fields.push('excerpt = ?');
        values.push(updates.excerpt);
      }
      if (updates.content !== undefined) {
        fields.push('content = ?');
        values.push(updates.content);
      }
      if (updates.published !== undefined) {
        fields.push('published = ?');
        values.push(updates.published ? 1 : 0);
      }
      if (updates.publishedAt !== undefined) {
        fields.push('published_at = ?');
        values.push(updates.publishedAt || null);
      }

      if (fields.length === 0) return null;

      values.push(id);
      await execute(
        `UPDATE blog_posts SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        values
      );
      const results = await query('SELECT * FROM blog_posts WHERE id = ?', [id]);
      if (results.length === 0) return null;
      const row = results[0];
      return {
        id: row.id,
        title: row.title,
        slug: row.slug,
        author: row.author,
        excerpt: row.excerpt,
        content: row.content,
        published: Boolean(row.published),
        publishedAt: row.published_at,
        createdAt: row.created_at,
      };
    },

    delete: async (id) => {
      await execute('DELETE FROM blog_posts WHERE id = ?', [id]);
    },
  },

  // Newsletter
  newsletter: {
    getAll: async () => {
      const results = await query('SELECT * FROM newsletters WHERE active = 1 ORDER BY subscribed_at DESC');
      return results.map(row => ({
        id: row.id,
        email: row.email,
        subscribedAt: row.subscribed_at,
      }));
    },

    subscribe: async (email) => {
      // Check if already subscribed
      const existing = await query('SELECT id FROM newsletters WHERE email = ?', [email]);
      if (existing.length > 0) {
        // Update to active if exists
        await execute('UPDATE newsletters SET active = 1 WHERE email = ?', [email]);
        return;
      }
      
      await insert('INSERT INTO newsletters (email, active) VALUES (?, 1)', [email]);
    },
  },

  // Popups
  popups: {
    getAll: async () => {
      const results = await query('SELECT * FROM popups ORDER BY created_at DESC');
      return results.map(row => ({
        id: row.id,
        title: row.title,
        content: row.content,
        type: row.type,
        active: Boolean(row.active),
        expiresAt: row.expires_at,
        createdAt: row.created_at,
      }));
    },

    getActive: async () => {
      const dbType = process.env.DB_TYPE || 'mysql';
      let sql;
      
      if (dbType === 'sqlite') {
        sql = `SELECT * FROM popups 
               WHERE active = 1 
                 AND (expires_at IS NULL OR expires_at > datetime('now'))
               ORDER BY created_at DESC`;
      } else {
        // MySQL and PostgreSQL use NOW()
        sql = `SELECT * FROM popups 
               WHERE active = 1 
                 AND (expires_at IS NULL OR expires_at > NOW())
               ORDER BY created_at DESC`;
      }
      
      const results = await query(sql);
      return results.map(row => ({
        id: row.id,
        title: row.title,
        content: row.content,
        type: row.type,
        active: Boolean(row.active),
        expiresAt: row.expires_at,
        createdAt: row.created_at,
      }));
    },

    create: async (popup) => {
      const id = await insert(
        'INSERT INTO popups (title, content, type, active, expires_at) VALUES (?, ?, ?, ?, ?)',
        [
          popup.title,
          popup.content,
          popup.type || 'announcement',
          popup.active !== false ? 1 : 0,
          popup.expiresAt || null,
        ]
      );
      const results = await query('SELECT * FROM popups WHERE id = ?', [id]);
      const row = results[0];
      return {
        id: row.id,
        title: row.title,
        content: row.content,
        type: row.type,
        active: Boolean(row.active),
        expiresAt: row.expires_at,
        createdAt: row.created_at,
      };
    },

    update: async (id, updates) => {
      const fields = [];
      const values = [];
      
      if (updates.title !== undefined) {
        fields.push('title = ?');
        values.push(updates.title);
      }
      if (updates.content !== undefined) {
        fields.push('content = ?');
        values.push(updates.content);
      }
      if (updates.type !== undefined) {
        fields.push('type = ?');
        values.push(updates.type);
      }
      if (updates.active !== undefined) {
        fields.push('active = ?');
        values.push(updates.active ? 1 : 0);
      }
      if (updates.expiresAt !== undefined) {
        fields.push('expires_at = ?');
        values.push(updates.expiresAt || null);
      }
      
      if (fields.length === 0) return null;
      
      values.push(id);
      await execute(
        `UPDATE popups SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        values
      );
      const results = await query('SELECT * FROM popups WHERE id = ?', [id]);
      if (results.length === 0) return null;
      const row = results[0];
      return {
        id: row.id,
        title: row.title,
        content: row.content,
        type: row.type,
        active: Boolean(row.active),
        expiresAt: row.expires_at,
        createdAt: row.created_at,
      };
    },

    delete: async (id) => {
      await execute('DELETE FROM popups WHERE id = ?', [id]);
    },
  },

  // Orders
  orders: {
    getAll: async () => {
      const results = await query('SELECT * FROM orders ORDER BY created_at DESC');
      return results.map(row => ({
        id: row.id,
        userId: row.user_id,
        customerName: row.customer_name,
        customerEmail: row.customer_email,
        customerPhone: row.customer_phone,
        shippingAddress: row.shipping_address,
        totalAmount: parseFloat(row.total_amount),
        status: row.status,
        paymentMethod: row.payment_method,
        orderItems: parseJsonField(row.order_items),
        createdAt: row.created_at,
      }));
    },

    getById: async (id) => {
      const results = await query('SELECT * FROM orders WHERE id = ?', [id]);
      if (results.length === 0) return null;
      const row = results[0];
      return {
        id: row.id,
        userId: row.user_id,
        customerName: row.customer_name,
        customerEmail: row.customer_email,
        customerPhone: row.customer_phone,
        shippingAddress: row.shipping_address,
        totalAmount: parseFloat(row.total_amount),
        status: row.status,
        paymentMethod: row.payment_method,
        orderItems: parseJsonField(row.order_items),
        createdAt: row.created_at,
      };
    },

    create: async (order) => {
      const orderItems = order.orderItems || [];
      if (orderItems.length === 0) {
        throw new Error('Order must contain at least one item');
      }

      // Validate stock and price for each item before creating order
      for (const item of orderItems) {
        const book = await dbService.books.getById(item.bookId);
        if (!book) {
          throw new Error(`Book "${item.title || item.bookId}" not found`);
        }
        if (book.price == null || book.price <= 0) {
          throw new Error(`"${book.title}" is not available for purchase (no price)`);
        }
        const qty = parseInt(item.quantity, 10) || 1;
        const stock = book.stock != null ? parseInt(book.stock, 10) : 0;
        if (stock < qty) {
          throw new Error(`Insufficient stock for "${book.title}". Available: ${stock}, requested: ${qty}`);
        }
      }

      // Verify user exists if a userId was provided
      let validUserId = null;
      if (order.userId) {
        try {
          const userCheck = await query('SELECT id FROM users WHERE id = ?', [order.userId]);
          if (userCheck && userCheck.length > 0) {
            validUserId = order.userId;
          }
        } catch (e) {
          console.warn('Could not verify user ID, falling back to guest checkout:', e);
        }
      }

      const id = await insert(
        `INSERT INTO orders (user_id, customer_name, customer_email, customer_phone, shipping_address, total_amount, status, payment_method, order_items) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          validUserId,
          order.customerName,
          order.customerEmail,
          order.customerPhone || null,
          order.shippingAddress,
          order.totalAmount,
          order.status || 'pending',
          order.paymentMethod || null,
          stringifyJsonField(orderItems),
        ]
      );

      // Stock deduction is deferred until payment is confirmed to prevent inventory depletion attacks.

      return dbService.orders.getById(id);
    },

    update: async (id, updates) => {
      const fields = [];
      const values = [];
      
      if (updates.status !== undefined) {
        fields.push('status = ?');
        values.push(updates.status);
      }
      if (updates.shippingAddress !== undefined) {
        fields.push('shipping_address = ?');
        values.push(updates.shippingAddress);
      }
      if (updates.paymentMethod !== undefined) {
        fields.push('payment_method = ?');
        values.push(updates.paymentMethod);
      }
      if (updates.pacoOrderNo !== undefined) {
        fields.push('paco_order_no = ?');
        values.push(updates.pacoOrderNo);
      }
      if (updates.transactionId !== undefined) {
        fields.push('transaction_id = ?');
        values.push(updates.transactionId);
      }
      
      if (fields.length === 0) return null;
      
      values.push(id);
      await execute(
        `UPDATE orders SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        values
      );
      return dbService.orders.getById(id);
    },
  },

  // Payment Transactions
  paymentTransactions: {
    create: async (txData) => {
      const id = await insert(
        `INSERT INTO payment_transactions (order_id, paco_order_no, transaction_id, amount, currency, status, payment_page_url, paco_response)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          txData.orderId,
          txData.pacoOrderNo,
          txData.transactionId || null,
          txData.amount,
          txData.currency || 'NPR',
          txData.status || 'initiated',
          txData.paymentPageUrl || null,
          txData.pacoResponse ? JSON.stringify(txData.pacoResponse) : null,
        ]
      );
      return dbService.paymentTransactions.getById(id);
    },

    getById: async (id) => {
      const results = await query('SELECT * FROM payment_transactions WHERE id = ?', [id]);
      if (results.length === 0) return null;
      const row = results[0];
      return {
        id: row.id,
        orderId: row.order_id,
        pacoOrderNo: row.paco_order_no,
        transactionId: row.transaction_id,
        amount: parseFloat(row.amount),
        currency: row.currency,
        status: row.status,
        paymentPageUrl: row.payment_page_url,
        pacoResponse: parseJsonField(row.paco_response),
        callbackData: parseJsonField(row.callback_data),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    },

    getByOrderId: async (orderId) => {
      const results = await query(
        'SELECT * FROM payment_transactions WHERE order_id = ? ORDER BY created_at DESC',
        [orderId]
      );
      return results.map(row => ({
        id: row.id,
        orderId: row.order_id,
        pacoOrderNo: row.paco_order_no,
        transactionId: row.transaction_id,
        amount: parseFloat(row.amount),
        currency: row.currency,
        status: row.status,
        paymentPageUrl: row.payment_page_url,
        pacoResponse: parseJsonField(row.paco_response),
        callbackData: parseJsonField(row.callback_data),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    },

    getByPacoOrderNo: async (pacoOrderNo) => {
      const results = await query(
        'SELECT * FROM payment_transactions WHERE paco_order_no = ? ORDER BY created_at DESC LIMIT 1',
        [pacoOrderNo]
      );
      if (results.length === 0) return null;
      const row = results[0];
      return {
        id: row.id,
        orderId: row.order_id,
        pacoOrderNo: row.paco_order_no,
        transactionId: row.transaction_id,
        amount: parseFloat(row.amount),
        currency: row.currency,
        status: row.status,
        paymentPageUrl: row.payment_page_url,
        pacoResponse: parseJsonField(row.paco_response),
        callbackData: parseJsonField(row.callback_data),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    },

    updateStatus: async (id, status, callbackData = null) => {
      const fields = ['status = ?'];
      const values = [status];

      if (callbackData) {
        fields.push('callback_data = ?');
        values.push(JSON.stringify(callbackData));
      }

      values.push(id);
      await execute(
        `UPDATE payment_transactions SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        values
      );
      return dbService.paymentTransactions.getById(id);
    },

    updateByPacoOrderNo: async (pacoOrderNo, updates) => {
      const fields = [];
      const values = [];

      if (updates.status !== undefined) {
        fields.push('status = ?');
        values.push(updates.status);
      }
      if (updates.transactionId !== undefined) {
        fields.push('transaction_id = ?');
        values.push(updates.transactionId);
      }
      if (updates.callbackData !== undefined) {
        fields.push('callback_data = ?');
        values.push(JSON.stringify(updates.callbackData));
      }

      if (fields.length === 0) return null;

      values.push(pacoOrderNo);
      await execute(
        `UPDATE payment_transactions SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE paco_order_no = ?`,
        values
      );
      return dbService.paymentTransactions.getByPacoOrderNo(pacoOrderNo);
    },
  },
};
