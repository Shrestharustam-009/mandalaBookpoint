-- MandalaBookPoint Library Database Schema
-- Compatible with MySQL, PostgreSQL, and SQLite

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug)
);

-- Books Table
CREATE TABLE IF NOT EXISTS books (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(500) NOT NULL,
    author VARCHAR(255) NOT NULL,
    category_id INT NOT NULL,
    description TEXT,
    isbn VARCHAR(50),
    price DECIMAL(10, 2) NULL,
    discount DECIMAL(5, 2) DEFAULT 0,
    availability BOOLEAN DEFAULT TRUE,
    stock INT DEFAULT 0,
    weight DECIMAL(10, 2) NULL,
    cover_image VARCHAR(500) DEFAULT '/placeholder.jpg',
    tags JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    INDEX idx_category (category_id),
    INDEX idx_title (title),
    INDEX idx_author (author),
    INDEX idx_isbn (isbn),
    INDEX idx_stock (stock),
    FULLTEXT INDEX idx_search (title, author, description)
);

-- Book-Categories mapping (many-to-many)
CREATE TABLE IF NOT EXISTS book_categories (
    book_id INT NOT NULL,
    category_id INT NOT NULL,
    PRIMARY KEY (book_id, category_id),
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    INDEX idx_book_categories_book (book_id),
    INDEX idx_book_categories_category (category_id)
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    book_id INT NOT NULL,
    user_id INT NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_book (book_id),
    INDEX idx_user (user_id)
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    shipping_address TEXT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(50),
    paco_order_no VARCHAR(50),
    transaction_id VARCHAR(100),
    order_items JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at),
    INDEX idx_paco_order (paco_order_no),
    INDEX idx_transaction (transaction_id)
);

-- Payment Transactions Table (audit trail for all payment attempts)
CREATE TABLE IF NOT EXISTS payment_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    paco_order_no VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(100),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'NPR',
    status VARCHAR(50) DEFAULT 'initiated',
    payment_page_url TEXT,
    paco_response JSON,
    callback_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_pt_order (order_id),
    INDEX idx_pt_paco_order (paco_order_no),
    INDEX idx_pt_transaction (transaction_id),
    INDEX idx_pt_status (status)
);

-- Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS newsletters (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN DEFAULT TRUE,
    INDEX idx_email (email),
    INDEX idx_active (active)
);

-- Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    author VARCHAR(255),
    excerpt TEXT,
    content LONGTEXT,
    published BOOLEAN DEFAULT TRUE,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_blog_slug (slug),
    INDEX idx_blog_published (published),
    INDEX idx_blog_published_at (published_at)
);

-- Insert Sample Blog Posts
INSERT INTO blog_posts (title, slug, author, excerpt, content, published, published_at)
VALUES
('Welcome to Mandala Book Point', 'welcome-to-mandala-book-point', 'Mandala Book Point Team',
'An introduction to our digital book platform and what you can do here.',
'Welcome to Mandala Book Point! This is your space to discover new books, track your favourites, and explore curated collections from different genres.',
TRUE, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE title = title;

-- Popups Table
CREATE TABLE IF NOT EXISTS popups (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'announcement',
    active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active (active),
    INDEX idx_expires (expires_at)
);

-- Insert Sample Categories
INSERT INTO categories (name, slug, description) VALUES
('Fiction', 'fiction', 'Novels and short stories'),
('Non-Fiction', 'non-fiction', 'Educational and informative books'),
('Science', 'science', 'Scientific and technical books'),
('Biography', 'biography', 'Life stories and memoirs')
ON DUPLICATE KEY UPDATE name=name;

-- Insert Sample Books
INSERT INTO books (title, author, category_id, description, price, discount, availability, stock, cover_image, tags) VALUES
('The Great Gatsby', 'F. Scott Fitzgerald', 1, 'A classic novel about wealth and love in the Jazz Age', 2500.00, 10.00, TRUE, 50, '/placeholder.jpg', '["classic", "romance", "american-literature"]'),
('Sapiens', 'Yuval Noah Harari', 2, 'A brief history of humankind', 3000.00, 0.00, TRUE, 30, '/placeholder.jpg', '["history", "science", "non-fiction"]'),
('A Brief History of Time', 'Stephen Hawking', 3, 'Understanding the universe and our place in it', 2800.00, 5.00, TRUE, 25, '/placeholder.jpg', '["science", "physics", "cosmology"]'),
('Steve Jobs', 'Walter Isaacson', 4, 'The exclusive biography of the Apple founder', 2200.00, 15.00, TRUE, 40, '/placeholder.jpg', '["biography", "technology", "business"]')
ON DUPLICATE KEY UPDATE title=title;

-- Ensure book_categories has at least a primary category mapping for existing books
INSERT INTO book_categories (book_id, category_id)
SELECT id, category_id FROM books
ON DUPLICATE KEY UPDATE category_id = VALUES(category_id);
