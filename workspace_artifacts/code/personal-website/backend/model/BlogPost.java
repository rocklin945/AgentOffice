package com.personalwebsite.model;

import java.time.LocalDate;
import java.util.List;

/**
 * 博客文章数据模型
 * 对应 PRD 中 6.2 节的数据结构
 */
public class BlogPost {
    private Long id;
    private String title;
    private LocalDate date;
    private String summary;
    private String content;
    private List<String> tags;
    private String category;

    public BlogPost() {}

    public BlogPost(Long id, String title, LocalDate date, String summary, String content, List<String> tags, String category) {
        this.id = id;
        this.title = title;
        this.date = date;
        this.summary = summary;
        this.content = content;
        this.tags = tags;
        this.category = category;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}
