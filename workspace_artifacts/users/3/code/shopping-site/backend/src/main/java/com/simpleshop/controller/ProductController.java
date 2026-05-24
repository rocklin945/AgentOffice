package com.simpleshop.controller;

import com.simpleshop.entity.Product;
import com.simpleshop.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    
    @Autowired
    private ProductRepository productRepository;
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllProducts() {
        List<Product> products = productRepository.findAll();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", products);
        response.put("total", products.size());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getProductById(@PathVariable Long id) {
        return productRepository.findById(id)
            .map(product -> {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("data", product);
                return ResponseEntity.ok(response);
            })
            .orElseGet(() -> {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "商品不存在");
                return ResponseEntity.status(404).body(response);
            });
    }
    
    @GetMapping("/hot")
    public ResponseEntity<Map<String, Object>> getHotProducts() {
        List<Product> products = productRepository.findByIsHotTrue();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", products);
        response.put("total", products.size());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/recommended")
    public ResponseEntity<Map<String, Object>> getRecommendedProducts() {
        List<Product> products = productRepository.findByIsRecommendedTrue();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", products);
        response.put("total", products.size());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<Map<String, Object>> getProductsByCategory(
            @PathVariable Long categoryId,
            @RequestParam(required = false, defaultValue = "0") String sort) {
        List<Product> products;
        if ("asc".equals(sort)) {
            products = productRepository.findByCategoryIdOrderByPriceAsc(categoryId);
        } else if ("desc".equals(sort)) {
            products = productRepository.findByCategoryIdOrderByPriceDesc(categoryId);
        } else {
            products = productRepository.findByCategoryId(categoryId);
        }
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", products);
        response.put("total", products.size());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchProducts(@RequestParam String keyword) {
        List<Product> products = productRepository.searchProducts(keyword);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", products);
        response.put("total", products.size());
        return ResponseEntity.ok(response);
    }
}