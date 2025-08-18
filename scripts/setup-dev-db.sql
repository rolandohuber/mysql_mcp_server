-- Development database setup script
-- Run this to create a sample database for testing the MCP server

CREATE DATABASE IF NOT EXISTS mysql_mcp_dev;
USE mysql_mcp_dev;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role ENUM('admin', 'user', 'moderator') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Categories table
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    parent_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_parent (parent_id)
);

-- Products table
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category_id INT NOT NULL,
    stock_quantity INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    INDEX idx_category (category_id),
    INDEX idx_price (price),
    INDEX idx_active (is_active)
);

-- Orders table
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    shipping_address TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
);

-- Order items table
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    INDEX idx_order (order_id),
    INDEX idx_product (product_id)
);

-- Reviews table
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product (user_id, product_id),
    INDEX idx_product (product_id),
    INDEX idx_rating (rating)
);

-- Insert sample data
INSERT INTO categories (name, description) VALUES
('Electronics', 'Electronic devices and gadgets'),
('Books', 'Books and educational materials'),
('Clothing', 'Apparel and accessories'),
('Home & Garden', 'Home improvement and gardening supplies');

INSERT INTO categories (name, description, parent_id) VALUES
('Smartphones', 'Mobile phones and accessories', 1),
('Laptops', 'Portable computers', 1),
('Fiction', 'Fiction books', 2),
('Non-Fiction', 'Educational and reference books', 2);

INSERT INTO users (name, email, role) VALUES
('John Admin', 'admin@example.com', 'admin'),
('Jane User', 'jane@example.com', 'user'),
('Bob Moderator', 'bob@example.com', 'moderator'),
('Alice Customer', 'alice@example.com', 'user'),
('Charlie Buyer', 'charlie@example.com', 'user');

INSERT INTO products (name, description, price, category_id, stock_quantity) VALUES
('iPhone 15', 'Latest Apple smartphone', 999.99, 5, 50),
('MacBook Pro', 'Professional laptop for developers', 2499.99, 6, 25),
('The Great Gatsby', 'Classic American novel', 12.99, 7, 100),
('Clean Code', 'Programming best practices', 45.99, 8, 75),
('Wireless Headphones', 'Bluetooth noise-canceling headphones', 199.99, 1, 80);

-- Create some sample orders
INSERT INTO orders (user_id, total_amount, status, shipping_address) VALUES
(2, 1012.98, 'delivered', '123 Main St, Anytown, USA'),
(4, 2499.99, 'processing', '456 Oak Ave, Another City, USA'),
(5, 245.98, 'shipped', '789 Pine Rd, Somewhere, USA');

INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES
(1, 1, 1, 999.99, 999.99),
(1, 3, 1, 12.99, 12.99),
(2, 2, 1, 2499.99, 2499.99),
(3, 5, 1, 199.99, 199.99),
(3, 4, 1, 45.99, 45.99);

INSERT INTO reviews (product_id, user_id, rating, comment) VALUES
(1, 2, 5, 'Excellent phone, great camera quality!'),
(1, 4, 4, 'Good phone but expensive'),
(2, 5, 5, 'Perfect for development work'),
(3, 2, 4, 'Classic book, well written'),
(5, 4, 5, 'Amazing sound quality and comfort');
