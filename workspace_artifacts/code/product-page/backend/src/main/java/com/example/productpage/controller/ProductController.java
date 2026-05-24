package com.example.productpage.controller;

import com.example.productpage.dto.AddToCartRequest;
import com.example.productpage.dto.ProductDTO;
import com.example.productpage.entity.CartItem;
import com.example.productpage.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 商品Controller
 * @author AlexBE
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProductController {

    private final ProductService productService;

    /**
     * 健康检查接口
     * GET /api/health
     * 供运维部署界面检测服务可用性
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> result = new HashMap<>();
        result.put("status", "UP");
        result.put("service", "product-page-backend");
        result.put("message", "服务运行正常");
        result.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(result);
    }

    /**
     * 获取商品详情
     * GET /api/products/{id}
     */
    @GetMapping("/products/{id}")
    public ResponseEntity<ProductDTO> getProduct(
            @PathVariable Long id,
            @RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(productService.getProductById(id, userId));
    }

    /**
     * 获取所有商品列表
     * GET /api/products
     */
    @GetMapping("/products")
    public ResponseEntity<List<ProductDTO>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    /**
     * 搜索商品
     * GET /api/products/search?keyword=xxx
     */
    @GetMapping("/products/search")
    public ResponseEntity<List<ProductDTO>> searchProducts(@RequestParam String keyword) {
        return ResponseEntity.ok(productService.searchProducts(keyword));
    }

    /**
     * 添加商品到购物车
     * POST /api/cart/add
     */
    @PostMapping("/cart/add")
    public ResponseEntity<CartItem> addToCart(@RequestBody AddToCartRequest request) {
        return ResponseEntity.ok(productService.addToCart(request));
    }

    /**
     * 更新购物车商品数量
     * PUT /api/cart/{id}
     */
    @PutMapping("/cart/{id}")
    public ResponseEntity<CartItem> updateCartQuantity(
            @PathVariable Long id,
            @RequestParam Integer quantity) {
        return ResponseEntity.ok(productService.updateCartQuantity(id, quantity));
    }

    /**
     * 从购物车移除
     * DELETE /api/cart/{id}
     */
    @DeleteMapping("/cart/{id}")
    public ResponseEntity<Map<String, Object>> removeFromCart(@PathVariable Long id) {
        productService.removeFromCart(id);
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "已从购物车移除");
        return ResponseEntity.ok(result);
    }

    /**
     * 获取用户购物车列表
     * GET /api/cart?userId=xxx
     */
    @GetMapping("/cart")
    public ResponseEntity<List<CartItem>> getCartItems(@RequestParam Long userId) {
        return ResponseEntity.ok(productService.getCartItems(userId));
    }
}