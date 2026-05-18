-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 14, 2026 at 03:01 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `bookhaven`
--

-- --------------------------------------------------------

--
-- Table structure for table `blog_posts`
--

CREATE TABLE `blog_posts` (
  `id` int(11) NOT NULL,
  `title` varchar(500) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `author` varchar(255) DEFAULT NULL,
  `excerpt` text DEFAULT NULL,
  `content` longtext DEFAULT NULL,
  `published` tinyint(1) DEFAULT 1,
  `published_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `blog_posts`
--

INSERT INTO `blog_posts` (`id`, `title`, `slug`, `author`, `excerpt`, `content`, `published`, `published_at`, `created_at`, `updated_at`) VALUES
(1, 'Welcome to Mandala Book Point', 'welcome-to-mandala-book-point', 'Mandala Book Point Team', 'An introduction to our digital book platform and what you can do here.', 'Welcome to Mandala Book Point! This is your space to discover new books, track your favourites, and explore curated collections from different genres.', 1, '2026-02-11 12:38:54', '2026-02-11 12:38:54', '2026-02-11 12:38:54');

-- --------------------------------------------------------

--
-- Table structure for table `books`
--

CREATE TABLE `books` (
  `id` int(11) NOT NULL,
  `title` varchar(500) NOT NULL,
  `author` varchar(255) NOT NULL,
  `category_id` int(11) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `discount` decimal(5,2) DEFAULT 0.00,
  `availability` tinyint(1) DEFAULT 1,
  `cover_image` varchar(500) DEFAULT '/placeholder.jpg',
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `weight` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `books`
--

INSERT INTO `books` (`id`, `title`, `author`, `category_id`, `description`, `price`, `discount`, `availability`, `cover_image`, `tags`, `created_at`, `updated_at`, `weight`) VALUES
(1, 'The Great Gatsby', 'F. Scott Fitzgerald', 1, 'A classic novel about wealth and love in the Jazz Age', 2500.00, 10.00, 1, '/placeholder.jpg', '[\"classic\", \"romance\", \"american-literature\"]', '2026-01-30 11:14:41', '2026-01-30 11:14:41', NULL),
(2, 'Sapiens', 'Yuval Noah Harari', 2, 'A brief history of humankind', 3000.00, 0.00, 1, '/placeholder.jpg', '[\"history\", \"science\", \"non-fiction\"]', '2026-01-30 11:14:41', '2026-01-30 11:14:41', NULL),
(3, 'A Brief History of Time', 'Stephen Hawking', 3, 'Understanding the universe and our place in it', 2800.00, 5.00, 1, '/placeholder.jpg', '[\"science\", \"physics\", \"cosmology\"]', '2026-01-30 11:14:41', '2026-01-30 11:14:41', NULL),
(4, 'Steve Jobs', 'Walter Isaacson', 4, 'The exclusive biography of the Apple founder', 2200.00, 15.00, 1, '/placeholder.jpg', '[\"biography\", \"technology\", \"business\"]', '2026-01-30 11:14:41', '2026-01-30 11:14:41', NULL),
(5, 'testing', 'digdarshan ghimire', 4, 'heiiii', 1500.00, 10.00, 1, '/uploads/1770982831243-pf.jpg', '[\"fiction\",\"classic\"]', '2026-02-13 11:41:00', '2026-02-13 11:41:00', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Fiction', 'fiction', 'Novels and short stories', '2026-01-30 11:14:41', '2026-01-30 11:14:41'),
(2, 'Non-Fiction', 'non-fiction', 'Educational and informative books', '2026-01-30 11:14:41', '2026-01-30 11:14:41'),
(3, 'Science', 'science', 'Scientific and technical books', '2026-01-30 11:14:41', '2026-01-30 11:14:41'),
(4, 'Biography', 'biography', 'Life stories and memoirs', '2026-01-30 11:14:41', '2026-01-30 11:14:41');

-- --------------------------------------------------------

--
-- Table structure for table `newsletters`
--

CREATE TABLE `newsletters` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `subscribed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `customer_name` varchar(255) NOT NULL,
  `customer_email` varchar(255) NOT NULL,
  `customer_phone` varchar(50) DEFAULT NULL,
  `shipping_address` text NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `payment_method` varchar(50) DEFAULT NULL,
  `order_items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`order_items`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `customer_name`, `customer_email`, `customer_phone`, `shipping_address`, `total_amount`, `status`, `payment_method`, `order_items`, `created_at`, `updated_at`) VALUES
(1, 1, 'DIGDARSHAN GHIMIRE', 'digdarshang81@gmail.com', NULL, '', 2660.00, 'pending', 'paco', '[{\"bookId\":3,\"title\":\"A Brief History of Time\",\"author\":\"Stephen Hawking\",\"price\":2800,\"discount\":5,\"quantity\":1}]', '2026-02-11 11:32:51', '2026-02-11 11:32:51'),
(2, 1, 'DIGDARSHAN GHIMIRE', 'digdarshang81@gmail.com', NULL, '', 2660.00, 'pending', 'paco', '[{\"bookId\":3,\"title\":\"A Brief History of Time\",\"author\":\"Stephen Hawking\",\"price\":2800,\"discount\":5,\"quantity\":1}]', '2026-02-12 09:15:57', '2026-02-12 09:15:57'),
(3, 1, 'DIGDARSHAN GHIMIRE', 'digdarshang81@gmail.com', NULL, '', 2660.00, 'pending', 'paco', '[{\"bookId\":3,\"title\":\"A Brief History of Time\",\"author\":\"Stephen Hawking\",\"price\":2800,\"discount\":5,\"quantity\":1}]', '2026-02-12 09:37:56', '2026-02-12 09:37:56'),
(4, 1, 'DIGDARSHAN GHIMIRE', 'digdarshang81@gmail.com', NULL, '', 2660.00, 'pending', 'paco', '[{\"bookId\":3,\"title\":\"A Brief History of Time\",\"author\":\"Stephen Hawking\",\"price\":2800,\"discount\":5,\"quantity\":1}]', '2026-02-12 09:46:10', '2026-02-12 09:46:10'),
(5, 1, 'DIGDARSHAN GHIMIRE', 'digdarshang81@gmail.com', NULL, '', 2660.00, 'pending', 'paco', '[{\"bookId\":3,\"title\":\"A Brief History of Time\",\"author\":\"Stephen Hawking\",\"price\":2800,\"discount\":5,\"quantity\":1}]', '2026-02-12 09:46:37', '2026-02-12 09:46:37'),
(6, 1, 'DIGDARSHAN GHIMIRE', 'digdarshang81@gmail.com', NULL, '', 2660.00, 'pending', 'paco', '[{\"bookId\":3,\"title\":\"A Brief History of Time\",\"author\":\"Stephen Hawking\",\"price\":2800,\"discount\":5,\"quantity\":1}]', '2026-02-12 09:48:26', '2026-02-12 09:48:26'),
(7, 1, 'DIGDARSHAN GHIMIRE', 'digdarshang81@gmail.com', NULL, '', 2660.00, 'pending', 'paco', '[{\"bookId\":3,\"title\":\"A Brief History of Time\",\"author\":\"Stephen Hawking\",\"price\":2800,\"discount\":5,\"quantity\":1}]', '2026-02-12 09:50:38', '2026-02-12 09:50:38'),
(8, 1, 'DIGDARSHAN GHIMIRE', 'digdarshang81@gmail.com', NULL, '', 2660.00, 'pending', 'paco', '[{\"bookId\":3,\"title\":\"A Brief History of Time\",\"author\":\"Stephen Hawking\",\"price\":2800,\"discount\":5,\"quantity\":1}]', '2026-02-12 09:52:55', '2026-02-12 09:52:55'),
(9, 1, 'DIGDARSHAN GHIMIRE', 'digdarshang81@gmail.com', NULL, '', 2660.00, 'pending', 'paco', '[{\"bookId\":3,\"title\":\"A Brief History of Time\",\"author\":\"Stephen Hawking\",\"price\":2800,\"discount\":5,\"quantity\":1}]', '2026-02-12 09:54:00', '2026-02-12 09:54:00'),
(10, 1, 'DIGDARSHAN GHIMIRE', 'digdarshang81@gmail.com', NULL, '', 2660.00, 'pending', 'paco', '[{\"bookId\":3,\"title\":\"A Brief History of Time\",\"author\":\"Stephen Hawking\",\"price\":2800,\"discount\":5,\"quantity\":1}]', '2026-02-12 10:03:12', '2026-02-12 10:03:12'),
(11, 1, 'DIGDARSHAN GHIMIRE', 'digdarshang81@gmail.com', NULL, '', 2660.00, 'pending', 'paco', '[{\"bookId\":3,\"title\":\"A Brief History of Time\",\"author\":\"Stephen Hawking\",\"price\":2800,\"discount\":5,\"quantity\":1}]', '2026-02-12 10:15:37', '2026-02-12 10:15:37'),
(12, 1, 'DIGDARSHAN GHIMIRE', 'digdarshang81@gmail.com', NULL, '', 2660.00, 'pending', 'paco', '[{\"bookId\":3,\"title\":\"A Brief History of Time\",\"author\":\"Stephen Hawking\",\"price\":2800,\"discount\":5,\"quantity\":1}]', '2026-02-12 10:17:51', '2026-02-12 10:17:51'),
(13, 1, 'DIGDARSHAN GHIMIRE', 'digdarshang81@gmail.com', NULL, '', 2660.00, 'pending', 'paco', '[{\"bookId\":3,\"title\":\"A Brief History of Time\",\"author\":\"Stephen Hawking\",\"price\":2800,\"discount\":5,\"quantity\":1}]', '2026-02-12 10:21:50', '2026-02-12 10:21:50'),
(14, 1, 'DIGDARSHAN GHIMIRE', 'digdarshang81@gmail.com', NULL, '', 2660.00, 'pending', 'paco', '[{\"bookId\":3,\"title\":\"A Brief History of Time\",\"author\":\"Stephen Hawking\",\"price\":2800,\"discount\":5,\"quantity\":1}]', '2026-02-12 10:30:02', '2026-02-12 10:30:02'),
(15, 1, 'DIGDARSHAN GHIMIRE', 'digdarshang81@gmail.com', NULL, '', 2660.00, 'pending', 'paco', '[{\"bookId\":3,\"title\":\"A Brief History of Time\",\"author\":\"Stephen Hawking\",\"price\":2800,\"discount\":5,\"quantity\":1}]', '2026-02-12 10:30:23', '2026-02-12 10:30:23'),
(16, 1, 'DIGDARSHAN GHIMIRE', 'digdarshang81@gmail.com', NULL, '', 2660.00, 'pending', 'paco', '[{\"bookId\":3,\"title\":\"A Brief History of Time\",\"author\":\"Stephen Hawking\",\"price\":2800,\"discount\":5,\"quantity\":1}]', '2026-02-12 10:33:19', '2026-02-12 10:33:19'),
(17, 1, 'DIGDARSHAN GHIMIRE', 'digdarshang81@gmail.com', NULL, '', 2660.00, 'pending', 'paco', '[{\"bookId\":3,\"title\":\"A Brief History of Time\",\"author\":\"Stephen Hawking\",\"price\":2800,\"discount\":5,\"quantity\":1}]', '2026-02-12 10:52:41', '2026-02-12 10:52:41'),
(18, 1, 'DIGDARSHAN GHIMIRE', 'digdarshang81@gmail.com', NULL, '', 2660.00, 'pending', 'paco', '[{\"bookId\":3,\"title\":\"A Brief History of Time\",\"author\":\"Stephen Hawking\",\"price\":2800,\"discount\":5,\"quantity\":1}]', '2026-02-12 11:59:46', '2026-02-12 11:59:46'),
(19, 1, 'DIGDARSHAN GHIMIRE', 'digdarshang81@gmail.com', NULL, '', 2660.00, 'pending', 'paco', '[{\"bookId\":3,\"title\":\"A Brief History of Time\",\"author\":\"Stephen Hawking\",\"price\":2800,\"discount\":5,\"quantity\":1}]', '2026-02-12 12:01:30', '2026-02-12 12:01:30'),
(20, 1, 'DIGDARSHAN GHIMIRE', 'digdarshang81@gmail.com', NULL, '', 2660.00, 'pending', 'paco', '[{\"bookId\":3,\"title\":\"A Brief History of Time\",\"author\":\"Stephen Hawking\",\"price\":2800,\"discount\":5,\"quantity\":1}]', '2026-02-12 12:04:07', '2026-02-12 12:04:07'),
(21, 1, 'DIGDARSHAN GHIMIRE', 'digdarshang81@gmail.com', NULL, '', 2660.00, 'pending', 'paco', '[{\"bookId\":3,\"title\":\"A Brief History of Time\",\"author\":\"Stephen Hawking\",\"price\":2800,\"discount\":5,\"quantity\":1}]', '2026-02-12 12:05:34', '2026-02-12 12:05:34'),
(22, 1, 'DIGDARSHAN GHIMIRE', 'digdarshang81@gmail.com', NULL, '', 2660.00, 'pending', 'paco', '[{\"bookId\":3,\"title\":\"A Brief History of Time\",\"author\":\"Stephen Hawking\",\"price\":2800,\"discount\":5,\"quantity\":1}]', '2026-02-12 12:55:50', '2026-02-12 12:55:50'),
(23, 1, 'DIGDARSHAN GHIMIRE', 'digdarshang81@gmail.com', NULL, '', 2660.00, 'pending', 'paco', '[{\"bookId\":3,\"title\":\"A Brief History of Time\",\"author\":\"Stephen Hawking\",\"price\":2800,\"discount\":5,\"quantity\":1}]', '2026-02-12 13:14:24', '2026-02-12 13:14:24'),
(24, 1, 'DIGDARSHAN GHIMIRE', 'digdarshang81@gmail.com', NULL, '', 2660.00, 'pending', 'paco', '[{\"bookId\":3,\"title\":\"A Brief History of Time\",\"author\":\"Stephen Hawking\",\"price\":2800,\"discount\":5,\"quantity\":1}]', '2026-02-12 13:17:17', '2026-02-12 13:17:17'),
(25, 1, 'DIGDARSHAN GHIMIRE', 'digdarshang81@gmail.com', NULL, '', 2660.00, 'pending', 'paco', '[{\"bookId\":3,\"title\":\"A Brief History of Time\",\"author\":\"Stephen Hawking\",\"price\":2800,\"discount\":5,\"quantity\":1}]', '2026-02-12 13:19:51', '2026-02-12 13:19:51'),
(26, 1, 'DIGDARSHAN GHIMIRE', 'digdarshang81@gmail.com', NULL, '', 2660.00, 'pending', 'paco', '[{\"bookId\":3,\"title\":\"A Brief History of Time\",\"author\":\"Stephen Hawking\",\"price\":2800,\"discount\":5,\"quantity\":1}]', '2026-02-12 13:21:13', '2026-02-12 13:21:13'),
(27, 1, 'DIGDARSHAN GHIMIRE', 'digdarshang81@gmail.com', NULL, '', 2660.00, 'pending', 'paco', '[{\"bookId\":3,\"title\":\"A Brief History of Time\",\"author\":\"Stephen Hawking\",\"price\":2800,\"discount\":5,\"quantity\":1}]', '2026-02-12 13:30:20', '2026-02-12 13:30:20'),
(28, 1, 'DIGDARSHAN GHIMIRE', 'digdarshang81@gmail.com', NULL, '', 2660.00, 'pending', 'paco', '[{\"bookId\":3,\"title\":\"A Brief History of Time\",\"author\":\"Stephen Hawking\",\"price\":2800,\"discount\":5,\"quantity\":1}]', '2026-02-12 13:31:50', '2026-02-12 13:31:50'),
(29, 1, 'DIGDARSHAN GHIMIRE', 'digdarshang81@gmail.com', NULL, '', 2660.00, 'pending', 'paco', '[{\"bookId\":3,\"title\":\"A Brief History of Time\",\"author\":\"Stephen Hawking\",\"price\":2800,\"discount\":5,\"quantity\":1}]', '2026-02-12 13:32:36', '2026-02-12 13:32:36'),
(30, 1, 'DIGDARSHAN GHIMIRE', 'digdarshang81@gmail.com', NULL, '', 2660.00, 'pending', 'paco', '[{\"bookId\":3,\"title\":\"A Brief History of Time\",\"author\":\"Stephen Hawking\",\"price\":2800,\"discount\":5,\"quantity\":1}]', '2026-02-13 02:12:47', '2026-02-13 02:12:47');

-- --------------------------------------------------------

--
-- Table structure for table `popups`
--

CREATE TABLE `popups` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `type` varchar(50) DEFAULT 'announcement',
  `active` tinyint(1) DEFAULT 1,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `popups`
--

INSERT INTO `popups` (`id`, `title`, `content`, `type`, `active`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 'a popup', 'hi', 'announcement', 1, '2026-02-12 11:34:00', '2026-02-11 11:34:36', '2026-02-11 11:34:36');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `user_name` varchar(255) NOT NULL,
  `rating` int(11) NOT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `comment` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `book_id`, `user_id`, `user_name`, `rating`, `comment`, `created_at`, `updated_at`) VALUES
(1, 3, 1, 'DIGDARSHAN GHIMIRE', 3, 'good book must buy', '2026-02-08 08:47:04', '2026-02-08 08:47:04'),
(2, 1, 1, 'DIGDARSHAN GHIMIRE', 5, 'very nice book', '2026-02-08 15:54:49', '2026-02-08 15:54:49');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `created_at`, `updated_at`) VALUES
(1, 'DIGDARSHAN GHIMIRE', 'digdarshang81@gmail.com', 'topshop12', 'user', '2026-02-08 08:46:29', '2026-02-08 08:46:29');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `blog_posts`
--
ALTER TABLE `blog_posts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_blog_slug` (`slug`),
  ADD KEY `idx_blog_published` (`published`),
  ADD KEY `idx_blog_published_at` (`published_at`);

--
-- Indexes for table `books`
--
ALTER TABLE `books`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_category` (`category_id`),
  ADD KEY `idx_title` (`title`),
  ADD KEY `idx_author` (`author`);
ALTER TABLE `books` ADD FULLTEXT KEY `idx_search` (`title`,`author`,`description`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_slug` (`slug`);

--
-- Indexes for table `newsletters`
--
ALTER TABLE `newsletters`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_active` (`active`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indexes for table `popups`
--
ALTER TABLE `popups`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_active` (`active`),
  ADD KEY `idx_expires` (`expires_at`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_book` (`book_id`),
  ADD KEY `idx_user` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `blog_posts`
--
ALTER TABLE `blog_posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `books`
--
ALTER TABLE `books`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `newsletters`
--
ALTER TABLE `newsletters`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `popups`
--
ALTER TABLE `popups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `books`
--
ALTER TABLE `books`
  ADD CONSTRAINT `books_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`);

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
