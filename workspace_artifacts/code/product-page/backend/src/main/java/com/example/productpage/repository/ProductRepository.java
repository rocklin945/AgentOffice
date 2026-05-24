package com.example.productpage.repository;

import com.example.productpage.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 商品Repository
 * @author AlexBE
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    /**
     * 根据状态查询商品列表
     * @param status 商品状态
     * @return 商品列表
     */
    List<Product> findByStatus(Integer status);

    /**
     * 根据名称模糊查询
     * @param name 商品名称
     * @return 商品列表
     */
    List<Product> findByNameContaining(String name);
}