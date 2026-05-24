package com.simpleshop.repository;

import com.simpleshop.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    List<Product> findByCategoryId(Long categoryId);
    
    List<Product> findByNameContaining(String keyword);
    
    List<Product> findByIsHotTrue();
    
    List<Product> findByIsRecommendedTrue();
    
    @Query("SELECT p FROM Product p WHERE p.name LIKE %:keyword% OR p.description LIKE %:keyword%")
    List<Product> searchProducts(@Param("keyword") String keyword);
    
    @Query("SELECT p FROM Product p WHERE p.categoryId = :categoryId ORDER BY p.price ASC")
    List<Product> findByCategoryIdOrderByPriceAsc(@Param("categoryId") Long categoryId);
    
    @Query("SELECT p FROM Product p WHERE p.categoryId = :categoryId ORDER BY p.price DESC")
    List<Product> findByCategoryIdOrderByPriceDesc(@Param("categoryId") Long categoryId);
}