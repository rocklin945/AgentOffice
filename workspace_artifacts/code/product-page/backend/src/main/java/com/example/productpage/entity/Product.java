package com.example.productpage.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 商品实体类
 * @author AlexBE
 */
@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 商品名称
     */
    @Column(nullable = false, length = 200)
    private String name;

    /**
     * 商品描述
     */
    @Column(length = 2000)
    private String description;

    /**
     * 原价
     */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal originalPrice;

    /**
     * 促销价
     */
    @Column(precision = 10, scale = 2)
    private BigDecimal salePrice;

    /**
     * 商品图片URL
     */
    @Column(length = 500)
    private String imageUrl;

    /**
     * 库存数量
     */
    @Column(nullable = false)
    private Integer stock;

    /**
     * 商品状态: 0-下架, 1-上架
     */
    @Column(nullable = false)
    private Integer status = 1;

    /**
     * 商品规格(JSON格式: 颜色、尺寸等)
     */
    @Column(columnDefinition = "TEXT")
    private String specifications;

    /**
     * 创建时间
     */
    @Column(nullable = false, updatable = false)
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    @Column(nullable = false)
    private LocalDateTime updateTime;

    @PrePersist
    protected void onCreate() {
        createTime = LocalDateTime.now();
        updateTime = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updateTime = LocalDateTime.now();
    }
}