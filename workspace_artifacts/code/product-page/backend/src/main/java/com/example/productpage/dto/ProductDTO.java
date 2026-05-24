package com.example.productpage.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

/**
 * 商品DTO
 * @author AlexBE
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {
    
    private Long id;
    private String name;
    private String description;
    private BigDecimal originalPrice;
    private BigDecimal salePrice;
    private String imageUrl;
    private Integer stock;
    private Integer status;
    private String specifications;
    private Boolean inCart; // 是否已在购物车
}