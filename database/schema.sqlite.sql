-- SQLite-specific schema (for easier local development)
-- MandalaBookPoint Library Database Schema

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- Books Table
CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    category_id INTEGER NOT NULL,
    description TEXT,
    isbn TEXT,
    price REAL,
    discount REAL DEFAULT 0,
    availability INTEGER DEFAULT 1,
    stock INTEGER DEFAULT 0,
    cover_image TEXT DEFAULT '/placeholder.jpg',
    tags TEXT,
    weight REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

-- Book-Categories mapping (many-to-many)
CREATE TABLE IF NOT EXISTS book_categories (
    book_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    PRIMARY KEY (book_id, category_id),
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_book_categories_book ON book_categories(book_id);
CREATE INDEX IF NOT EXISTS idx_book_categories_category ON book_categories(category_id);

CREATE INDEX IF NOT EXISTS idx_books_category ON books(category_id);
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    user_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reviews_book ON reviews(book_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    shipping_address TEXT NOT NULL,
    total_amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    payment_method TEXT,
    paco_order_no TEXT,
    transaction_id TEXT,
    order_items TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_paco ON orders(paco_order_no);
CREATE INDEX IF NOT EXISTS idx_orders_transaction ON orders(transaction_id);

-- Payment Transactions Table (audit trail)
CREATE TABLE IF NOT EXISTS payment_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    paco_order_no TEXT NOT NULL,
    transaction_id TEXT,
    amount REAL NOT NULL,
    currency TEXT NOT NULL DEFAULT 'NPR',
    status TEXT DEFAULT 'initiated',
    payment_page_url TEXT,
    paco_response TEXT,
    callback_data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_pt_order ON payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_pt_paco_order ON payment_transactions(paco_order_no);
CREATE INDEX IF NOT EXISTS idx_pt_transaction ON payment_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_pt_status ON payment_transactions(status);

-- Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS newsletters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    active INTEGER DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_newsletters_email ON newsletters(email);
CREATE INDEX IF NOT EXISTS idx_newsletters_active ON newsletters(active);

-- Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    author TEXT,
    excerpt TEXT,
    content TEXT,
    published INTEGER DEFAULT 1,
    published_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at);

-- Insert Sample Blog Posts
INSERT OR IGNORE INTO blog_posts (title, slug, author, excerpt, content, published, published_at)
VALUES
('Welcome to MandalaBookPoint', 'welcome-to-mandalabookpoint', 'MandalaBookPoint Team',
'An introduction to our digital library platform and what you can do here.',
'Welcome to MandalaBookPoint! This is your space to discover new books, track your favourites, and explore curated collections from different genres.',
1, CURRENT_TIMESTAMP);

-- Popups Table
CREATE TABLE IF NOT EXISTS popups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'announcement',
    active INTEGER DEFAULT 1,
    expires_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_popups_active ON popups(active);
CREATE INDEX IF NOT EXISTS idx_popups_expires ON popups(expires_at);

-- Insert Sample Categories
INSERT OR IGNORE INTO categories (name, slug, description) VALUES
('Fiction', 'fiction', 'Novels and short stories'),
('Non-Fiction', 'non-fiction', 'Educational and informative books'),
('Science', 'science', 'Scientific and technical books'),
('Biography', 'biography', 'Life stories and memoirs');

-- Insert Sample Books
INSERT OR IGNORE INTO books (title, author, category_id, description, price, discount, availability, stock, cover_image, tags) VALUES
('The Great Gatsby', 'F. Scott Fitzgerald', 1, 'A classic novel about wealth and love in the Jazz Age', 2500.00, 10.00, 1, 50, '/placeholder.jpg', '["classic", "romance", "american-literature"]'),
('Sapiens', 'Yuval Noah Harari', 2, 'A brief history of humankind', 3000.00, 0.00, 1, 30, '/placeholder.jpg', '["history", "science", "non-fiction"]'),
('A Brief History of Time', 'Stephen Hawking', 3, 'Understanding the universe and our place in it', 2800.00, 5.00, 1, 25, '/placeholder.jpg', '["science", "physics", "cosmology"]'),
('Steve Jobs', 'Walter Isaacson', 4, 'The exclusive biography of the Apple founder', 2200.00, 15.00, 1, 40, '/placeholder.jpg', '["biography", "technology", "business"]');

-- Ensure book_categories has at least a primary category mapping for existing books
INSERT OR IGNORE INTO book_categories (book_id, category_id)
SELECT id, category_id FROM books;
