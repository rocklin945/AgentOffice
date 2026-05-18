package com.personalwebsite.service;

import com.personalwebsite.model.BlogPost;
import com.personalwebsite.model.ContactForm;
import com.personalwebsite.model.PortfolioItem;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class DataStore {

    private final JdbcTemplate jdbcTemplate;

    public DataStore(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<PortfolioItem> getAllPortfolioItems() {
        return jdbcTemplate.query("SELECT id, title, description, category, image, url FROM portfolio_items ORDER BY id DESC",
                (rs, rowNum) -> new PortfolioItem(
                        rs.getLong("id"),
                        rs.getString("title"),
                        rs.getString("description"),
                        rs.getString("category"),
                        rs.getString("image"),
                        rs.getString("url")
                ));
    }

    public List<PortfolioItem> getPortfolioItemsByCategory(String category) {
        if (category == null || category.isBlank() || "all".equals(category)) {
            return getAllPortfolioItems();
        }
        return jdbcTemplate.query("SELECT id, title, description, category, image, url FROM portfolio_items WHERE category = ? ORDER BY id DESC",
                (rs, rowNum) -> new PortfolioItem(
                        rs.getLong("id"),
                        rs.getString("title"),
                        rs.getString("description"),
                        rs.getString("category"),
                        rs.getString("image"),
                        rs.getString("url")
                ),
                category);
    }

    public Optional<PortfolioItem> getPortfolioItemById(Long id) {
        List<PortfolioItem> rows = jdbcTemplate.query("SELECT id, title, description, category, image, url FROM portfolio_items WHERE id = ?",
                (rs, rowNum) -> new PortfolioItem(
                        rs.getLong("id"),
                        rs.getString("title"),
                        rs.getString("description"),
                        rs.getString("category"),
                        rs.getString("image"),
                        rs.getString("url")
                ),
                id);
        return rows.stream().findFirst();
    }

    public PortfolioItem addPortfolioItem(PortfolioItem item) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO portfolio_items (title, description, category, image, url) VALUES (?, ?, ?, ?, ?)",
                    Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, item.getTitle());
            ps.setString(2, item.getDescription());
            ps.setString(3, item.getCategory());
            ps.setString(4, item.getImage());
            ps.setString(5, item.getUrl());
            return ps;
        }, keyHolder);
        Number key = keyHolder.getKey();
        if (key != null) {
            item.setId(key.longValue());
        }
        return item;
    }

    public Optional<PortfolioItem> updatePortfolioItem(Long id, PortfolioItem updated) {
        int count = jdbcTemplate.update(
                "UPDATE portfolio_items SET title = ?, description = ?, category = ?, image = ?, url = ? WHERE id = ?",
                updated.getTitle(), updated.getDescription(), updated.getCategory(), updated.getImage(), updated.getUrl(), id);
        return count > 0 ? getPortfolioItemById(id) : Optional.empty();
    }

    public boolean deletePortfolioItem(Long id) {
        return jdbcTemplate.update("DELETE FROM portfolio_items WHERE id = ?", id) > 0;
    }

    public List<BlogPost> getAllBlogPosts() {
        return jdbcTemplate.query("SELECT id, title, post_date, summary, content, tags, category FROM blog_posts ORDER BY post_date DESC",
                (rs, rowNum) -> new BlogPost(
                        rs.getLong("id"),
                        rs.getString("title"),
                        rs.getDate("post_date").toLocalDate(),
                        rs.getString("summary"),
                        rs.getString("content"),
                        splitTags(rs.getString("tags")),
                        rs.getString("category")
                ));
    }

    public List<BlogPost> getBlogPostsByCategory(String category) {
        if (category == null || category.isBlank() || "all".equals(category)) {
            return getAllBlogPosts();
        }
        return jdbcTemplate.query("SELECT id, title, post_date, summary, content, tags, category FROM blog_posts WHERE category = ? ORDER BY post_date DESC",
                (rs, rowNum) -> new BlogPost(
                        rs.getLong("id"),
                        rs.getString("title"),
                        rs.getDate("post_date").toLocalDate(),
                        rs.getString("summary"),
                        rs.getString("content"),
                        splitTags(rs.getString("tags")),
                        rs.getString("category")
                ),
                category);
    }

    public Optional<BlogPost> getBlogPostById(Long id) {
        List<BlogPost> rows = jdbcTemplate.query("SELECT id, title, post_date, summary, content, tags, category FROM blog_posts WHERE id = ?",
                (rs, rowNum) -> new BlogPost(
                        rs.getLong("id"),
                        rs.getString("title"),
                        rs.getDate("post_date").toLocalDate(),
                        rs.getString("summary"),
                        rs.getString("content"),
                        splitTags(rs.getString("tags")),
                        rs.getString("category")
                ),
                id);
        return rows.stream().findFirst();
    }

    public BlogPost addBlogPost(BlogPost post) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO blog_posts (title, post_date, summary, content, tags, category) VALUES (?, ?, ?, ?, ?, ?)",
                    Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, post.getTitle());
            ps.setDate(2, Date.valueOf(post.getDate()));
            ps.setString(3, post.getSummary());
            ps.setString(4, post.getContent());
            ps.setString(5, String.join(",", post.getTags() == null ? List.of() : post.getTags()));
            ps.setString(6, post.getCategory());
            return ps;
        }, keyHolder);
        Number key = keyHolder.getKey();
        if (key != null) {
            post.setId(key.longValue());
        }
        return post;
    }

    public boolean deleteBlogPost(Long id) {
        return jdbcTemplate.update("DELETE FROM blog_posts WHERE id = ?", id) > 0;
    }

    public ContactForm submitContactForm(ContactForm form) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        LocalDateTime submittedAt = LocalDateTime.now();
        form.setSubmittedAt(submittedAt);
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO contact_forms (name, email, subject, message, submitted_at) VALUES (?, ?, ?, ?, ?)",
                    Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, form.getName());
            ps.setString(2, form.getEmail());
            ps.setString(3, form.getSubject());
            ps.setString(4, form.getMessage());
            ps.setTimestamp(5, Timestamp.valueOf(submittedAt));
            return ps;
        }, keyHolder);
        Number key = keyHolder.getKey();
        if (key != null) {
            form.setId(key.longValue());
        }
        return form;
    }

    public List<ContactForm> getAllContactForms() {
        return jdbcTemplate.query("SELECT id, name, email, subject, message, submitted_at FROM contact_forms ORDER BY submitted_at DESC",
                (rs, rowNum) -> {
                    ContactForm form = new ContactForm();
                    form.setId(rs.getLong("id"));
                    form.setName(rs.getString("name"));
                    form.setEmail(rs.getString("email"));
                    form.setSubject(rs.getString("subject"));
                    form.setMessage(rs.getString("message"));
                    form.setSubmittedAt(rs.getTimestamp("submitted_at").toLocalDateTime());
                    return form;
                });
    }

    public String getThemePreference() {
        return jdbcTemplate.queryForObject("SELECT value FROM app_settings WHERE name = 'theme'", String.class);
    }

    public void setThemePreference(String theme) {
        if ("light".equals(theme) || "dark".equals(theme)) {
            jdbcTemplate.update("UPDATE app_settings SET value = ? WHERE name = 'theme'", theme);
        }
    }

    private List<String> splitTags(String tags) {
        if (tags == null || tags.isBlank()) {
            return List.of();
        }
        return List.of(tags.split(","));
    }
}
