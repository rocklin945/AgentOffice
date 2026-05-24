package com.personalwebsite.model;

/**
 * 作品集数据模型
 * 对应 PRD 中 6.1 节的数据结构
 */
public class PortfolioItem {
    private Long id;
    private String title;
    private String description;
    private String category; // web, mobile, design
    private String image;
    private String url;

    public PortfolioItem() {}

    public PortfolioItem(Long id, String title, String description, String category, String image, String url) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.image = image;
        this.url = url;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
}
