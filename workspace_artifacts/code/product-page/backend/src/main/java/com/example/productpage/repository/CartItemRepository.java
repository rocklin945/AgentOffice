package com.example.productpage.repository;

import com.example.productpage.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 购物车项Repository
 * @author AlexBE
 */
@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    /**
     * 根据用户ID查询购物车项
     * @param userId 用户ID
     * @return 购物车项列表
     */
    List<CartItem> findByUserId(Long userId);

    /**
     * 根据用户ID和商品ID查询购物车项
     * @param userId 用户ID
     * @param productId 商品ID
     * @return 购物车项
     */
    Optional<CartItem> findByUserIdAndProductId(Long userId, Long productId);
}