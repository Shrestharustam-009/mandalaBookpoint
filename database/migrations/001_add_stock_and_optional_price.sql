-- Migration: Add stock column and make price optional
-- Run this on existing MySQL databases: mysql -u user -p database < 001_add_stock_and_optional_price.sql

-- Add stock column (skip if already exists - run manually if error)
ALTER TABLE books ADD COLUMN stock INT DEFAULT 0;

-- Set default stock for existing books that have availability
UPDATE books SET stock = 99 WHERE stock = 0 AND availability = 1;

-- Make price nullable (books without price are for display/inquiry only)
ALTER TABLE books MODIFY COLUMN price DECIMAL(10, 2) NULL;
