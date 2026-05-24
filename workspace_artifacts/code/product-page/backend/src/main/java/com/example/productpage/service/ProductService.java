package com.example.productpage.service;

import com.example.productpage.dto.AddToCartRequest;
import com.example.productpage.dto.ProductDTO;
import com.example.productpage.entity.CartItem;
import com.example.productpage.entity.Product;
import com.example.productpage.repository.CartItemRepository;
import com.example.productpage.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 商品Service
 * @author AlexBE
 */
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CartItemRepository cartItemRepository;

    /**
     * 获取商品详情
     * @param productId 商品ID
     * @param userId 用户ID（可选，用于判断是否已加入购物车）
     * @return 商品DTO
     */
    public ProductDTO getProductById(Long productId, Long userId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("商品不存在"));
        
        ProductDTO dto = convertToDTO(product);
        
        // 判断是否已在购物车
        if (userId != null) {
            Optional<CartItem> cartItem = cartItemRepository.findByUserIdAndProductId(userId, productId);
            dto.setInCart(cartItem.isPresent());
        }
        
        return dto;
    }

    /**
     * 获取所有上架商品列表
     * @return 商品DTO列表
     */
    public List<ProductDTO> getAllProducts() {
        return productRepository.findByStatus(1).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * 搜索商品
     * @param keyword 关键词
     * @return 商品DTO列表
     */
    public List<ProductDTO> searchProducts(String keyword) {
        return productRepository.findByNameContaining(keyword).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * 添加商品到购物车
     * @param request 添加购物车请求
     * @return 购物车项
     */
    @Transactional
    public CartItem addToCart(AddToCartRequest request) {
        // 检查商品是否存在且有足够库存
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("商品不存在"));
        
        if (product.getStock() < request.getQuantity()) {
            throw new RuntimeException("库存不足");
        }
        
        // 检查是否已在购物车
        Optional<CartItem> existingItem = cartItemRepository.findByUserIdAndProductId(
                request.getUserId(), request.getProductId());
        
        if (existingItem.isPresent()) {
            // 更新数量
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
            return cartItemRepository.save(item);
        } else {
            // 新增购物车项
            CartItem cartItem = new CartItem();
            cartItem.setUserId(request.getUserId());
            cartItem.setProductId(request.getProductId());
            cartItem.setQuantity(request.getQuantity());
            cartItem.setSpecifications(request.getSpecifications());
            return cartItemRepository.save(cartItem);
        }
    }

    /**
     * 更新购物车商品数量
     * @param cartItemId 购物车项ID
     * @param quantity 新数量
     * @return 更新后的购物车项
     */
    @Transactional
    public CartItem updateCartQuantity(Long cartItemId, Integer quantity) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("购物车项不存在"));
        
        // 检查库存
        Product product = productRepository.findById(item.getProductId())
                .orElseThrow(() -> new RuntimeException("商品不存在"));
        
        if (product.getStock() < quantity) {
            throw new RuntimeException("库存不足");
        }
        
        item.setQuantity(quantity);
        return cartItemRepository.save(item);
    }

    /**
     * 从购物车移除
     * @param cartItemId 购物车项ID
     */
    @Transactional
    public void removeFromCart(Long cartItemId) {
        cartItemRepository.deleteById(cartItemId);
    }

    /**
     * 获取用户购物车列表
     * @param userId 用户ID
     * @return 购物车项列表
     */
    public List<CartItem> getCartItems(Long userId) {
        return cartItemRepository.findByUserId(userId);
    }

    /**
     * 将Product实体转换为ProductDTO
     * @param product 商品实体
     * @return 商品DTO
     */
    private ProductDTO convertToDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setOriginalPrice(product.getOriginalPrice());
        dto.setSalePrice(product.getSalePrice());
        dto.setImageUrl(product.getImageUrl());
        dto.setStock(product.getStock());
        dto.setStatus(product.getStatus());
        dto.setSpecifications(product.getSpecifications());
        dto.setInCart(false);
        return dto;
    }
}