SET NAMES utf8mb4;



CREATE TABLE IF NOT EXISTS books (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL COMMENT 'book title',
    author VARCHAR(50) COMMENT 'author',
    isbn VARCHAR(20) COMMENT 'isbn',
    price DECIMAL(10,2) COMMENT 'price',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'created time',
    INDEX idx_title (title),
    INDEX idx_author (author)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='books';

INSERT INTO books (title, author, isbn, price)
SELECT 'Java编程思想', 'Bruce Eckel', '978-7-111-21412-4', 108.00
WHERE NOT EXISTS (SELECT 1 FROM books WHERE isbn = '978-7-111-21412-4');

INSERT INTO books (title, author, isbn, price)
SELECT 'Effective Java', 'Joshua Bloch', '978-7-111-34746-4', 88.00
WHERE NOT EXISTS (SELECT 1 FROM books WHERE isbn = '978-7-111-34746-4');

INSERT INTO books (title, author, isbn, price)
SELECT 'Spring Boot实战', 'Craig Walls', '978-7-115-42665-6', 79.00
WHERE NOT EXISTS (SELECT 1 FROM books WHERE isbn = '978-7-115-42665-6');
