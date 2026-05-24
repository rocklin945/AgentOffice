package com.simpleshop.controller;

import com.simpleshop.entity.Category;
import com.simpleshop.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllCategories() {
        List<Category> rootCategories = categoryRepository.findRootCategories();
        
        for (Category root : rootCategories) {
            List<Category> children = categoryRepository.findByParentIdOrderBySortAsc(root.getId());
            root.setChildren(children);
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", rootCategories);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getCategoryById(@PathVariable Long id) {
        return categoryRepository.findById(id)
            .map(category -> {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("data", category);
                return ResponseEntity.ok(response);
            })
            .orElseGet(() -> {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "分类不存在");
                return ResponseEntity.status(404).body(response);
            });
    }
    
    @GetMapping("/{id}/children")
    public ResponseEntity<Map<String, Object>> getChildCategories(@PathVariable Long id) {
        List<Category> children = categoryRepository.findByParentIdOrderBySortAsc(id);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", children);
        return ResponseEntity.ok(response);
    }
}