package com.personalwebsite.controller;

import com.personalwebsite.model.BlogPost;
import com.personalwebsite.service.DataStore;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 博客 API 控制器
 * 提供博客文章的 RESTful 接口
 * 对应 PRD 中 2.4 节 - 博客功能
 */
@RestController
@RequestMapping("/api/blog")
@CrossOrigin(origins = "*")
public class BlogController {

    private final DataStore dataStore;

    public BlogController(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    /**
     * 获取所有博客文章
     * GET /api/blog
     * 支持按分类筛选：GET /api/blog?category=技术
     */
    @GetMapping
    public ResponseEntity<List<BlogPost>> getAllPosts(
            @RequestParam(required = false) String category) {
        List<BlogPost> posts = dataStore.getBlogPostsByCategory(category);
        return ResponseEntity.ok(posts);
    }

    /**
     * 获取单篇博客文章详情
     * GET /api/blog/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<BlogPost> getPostById(@PathVariable Long id) {
        return dataStore.getBlogPostById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 新增博客文章
     * POST /api/blog
     */
    @PostMapping
    public ResponseEntity<BlogPost> createPost(@RequestBody BlogPost post) {
        BlogPost created = dataStore.addBlogPost(post);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * 删除博客文章
     * DELETE /api/blog/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        if (dataStore.deleteBlogPost(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
