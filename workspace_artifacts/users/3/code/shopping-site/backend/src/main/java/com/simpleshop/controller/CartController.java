package com.simpleshop.controller;

import com.simpleshop.entity.Cart;
import com.simpleshop.entity.CartItem;
import com.simpleshop.entity.Product;
import com.simpleshop.repository.CartItemRepository;
import com.simpleshop.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {
    
    @Autowired
    private CartItemRepository cartItemRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @GetMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> getCart(@PathVariable Long userId) {
        List<CartItem> items = cartItemRepository.findByCartId(userId);
        
        BigDecimal totalPrice = BigDecimal.ZERO;
        int totalQuantity = 0;
        
        for (CartItem item : items) {
            totalPrice = totalPrice.add(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            totalQuantity += item.getQuantity();
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("items", items);
        response.put("totalPrice", totalPrice);
        response.put("totalQuantity", totalQuantity);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/{userId}/add")
    @Transactional
    public ResponseEntity<Map<String, Object>> addToCart(
            @PathVariable Long userId,
            @RequestParam Long productId,
            @RequestParam(defaultValue = "1") Integer quantity) {
        
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("商品不存在"));
        
        CartItem existingItem = cartItemRepository.findByCartIdAndProductId(userId, productId)
            .orElse(null);
        
        Map<String, Object> response = new HashMap<>();
        
        if (existingItem != null) {
            existingItem.setQuantity(existingItem.getQuantity() + quantity);
            cartItemRepository.save(existingItem);
            response.put("message", "商品数量已更新");
        } else {
            CartItem newItem = new CartItem();
            newItem.setCartId(userId);
            newItem.setProductId(productId);
            newItem.setQuantity(quantity);
            newItem.setPrice(product.getPrice());
            newItem.setProductName(product.getName());
            newItem.setProductImage(product.getImage());
            cartItemRepository.save(newItem);
            response.put("message", "商品已添加到购物车");
        }
        
        response.put("success", true);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{userId}/update")
    @Transactional
    public ResponseEntity<Map<String, Object>> updateQuantity(
            @PathVariable Long userId,
            @RequestParam Long productId,
            @RequestParam Integer quantity) {
        
        CartItem item = cartItemRepository.findByCartIdAndProductId(userId, productId)
            .orElseThrow(() -> new RuntimeException("购物车商品不存在"));
        
        item.setQuantity(quantity);
        cartItemRepository.save(item);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "数量已更新");
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{userId}/remove/{productId}")
    @Transactional
    public ResponseEntity<Map<String, Object>> removeFromCart(
            @PathVariable Long userId,
            @PathVariable Long productId) {
        
        cartItemRepository.deleteByCartIdAndProductId(userId, productId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "商品已从购物车移除");
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{userId}/clear")
    @Transactional
    public ResponseEntity<Map<String, Object>> clearCart(@PathVariable Long userId) {
        cartItemRepository.deleteAllByCartId(userId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "购物车已清空");
        return ResponseEntity.ok(response);
    }
}