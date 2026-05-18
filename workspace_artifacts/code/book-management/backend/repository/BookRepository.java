package com.example.book.repository;

import com.example.book.entity.Book;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.List;
import java.util.Objects;

@Repository
public class BookRepository {
    private final JdbcTemplate jdbcTemplate;

    public BookRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Book> findAll() {
        String sql = "SELECT * FROM books ORDER BY create_time DESC";
        return jdbcTemplate.query(sql, this::extractBook);
    }

    public Book findById(Long id) {
        String sql = "SELECT * FROM books WHERE id = ?";
        return jdbcTemplate.query(sql, this::extractBook, id).stream().findFirst().orElse(null);
    }

    public List<Book> searchByTitle(String keyword) {
        String sql = "SELECT * FROM books WHERE title LIKE ? ORDER BY create_time DESC";
        return jdbcTemplate.query(sql, this::extractBook, "%" + keyword + "%");
    }

    public Book save(Book book) {
        if (book.getId() == null) {
            String sql = "INSERT INTO books (title, author, isbn, price, create_time) VALUES (?, ?, ?, ?, ?)";
            KeyHolder keyHolder = new GeneratedKeyHolder();
            jdbcTemplate.update(connection -> {
                PreparedStatement statement = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
                statement.setString(1, book.getTitle());
                statement.setString(2, book.getAuthor());
                statement.setString(3, book.getIsbn());
                statement.setBigDecimal(4, book.getPrice());
                statement.setTimestamp(5, Timestamp.valueOf(java.time.LocalDateTime.now()));
                return statement;
            }, keyHolder);
            book.setId(Objects.requireNonNull(keyHolder.getKey()).longValue());
        } else {
            String sql = "UPDATE books SET title = ?, author = ?, isbn = ?, price = ? WHERE id = ?";
            jdbcTemplate.update(sql, book.getTitle(), book.getAuthor(), book.getIsbn(), book.getPrice(), book.getId());
        }
        return book;
    }

    public void deleteById(Long id) {
        String sql = "DELETE FROM books WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }

    private Book extractBook(ResultSet rs, int rowNum) throws SQLException {
        Book book = new Book();
        book.setId(rs.getLong("id"));
        book.setTitle(rs.getString("title"));
        book.setAuthor(rs.getString("author"));
        book.setIsbn(rs.getString("isbn"));
        book.setPrice(rs.getBigDecimal("price"));
        book.setCreateTime(rs.getTimestamp("create_time").toLocalDateTime());
        return book;
    }
}
