-- Migration: Add payment transaction tracking
-- Run this against your MySQL database

-- Add payment tracking columns to orders table
ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS paco_order_no VARCHAR(50) NULL AFTER payment_method,
  ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(100) NULL AFTER paco_order_no;

-- Add indexes (ignore if they already exist)
CREATE INDEX idx_paco_order ON orders (paco_order_no);
CREATE INDEX idx_transaction ON orders (transaction_id);

-- Payment Transactions Table (full audit trail for every payment attempt)
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
