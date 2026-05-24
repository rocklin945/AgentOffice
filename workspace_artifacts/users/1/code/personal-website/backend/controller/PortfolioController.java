package com.personalwebsite.controller;

import com.personalwebsite.model.PortfolioItem;
import com.personalwebsite.service.DataStore;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 作品集 API 控制器
 * 提供作品集数据的 RESTful 接口
 * 对应 PRD 中 2.3 节 - 作品集功能
 */
@RestController
@RequestMapping("/api/portfolio")
@CrossOrigin(origins = "*")
public class PortfolioController {

    private final DataStore dataStore;

    public PortfolioController(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    /**
     * 获取所有作品集项目
     * GET /api/portfolio
     * 支持按分类筛选：GET /api/portfolio?category=web
     */
    @GetMapping
    public ResponseEntity<List<PortfolioItem>> getAllPortfolio(
            @RequestParam(required = false) String category) {
        List<PortfolioItem> items = dataStore.getPortfolioItemsByCategory(category);
        return ResponseEntity.ok(items);
    }

    /**
     * 获取单个作品集项目详情
     * GET /api/portfolio/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<PortfolioItem> getPortfolioById(@PathVariable Long id) {
        return dataStore.getPortfolioItemById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 新增作品集项目
     * POST /api/portfolio
     */
    @PostMapping
    public ResponseEntity<PortfolioItem> createPortfolio(@RequestBody PortfolioItem item) {
        PortfolioItem created = dataStore.addPortfolioItem(item);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * 更新作品集项目
     * PUT /api/portfolio/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<PortfolioItem> updatePortfolio(
            @PathVariable Long id, @RequestBody PortfolioItem item) {
        return dataStore.updatePortfolioItem(id, item)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 删除作品集项目
     * DELETE /api/portfolio/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePortfolio(@PathVariable Long id) {
        if (dataStore.deletePortfolioItem(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
