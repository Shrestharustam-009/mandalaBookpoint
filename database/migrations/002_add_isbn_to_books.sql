-- Migration: Add ISBN column to books table
-- Run for MySQL/PostgreSQL databases

ALTER TABLE books ADD COLUMN isbn VARCHAR(50) NULL;

