package com.simpleshop.entity;

import java.io.Serializable;

public class CartItemId implements Serializable {
    private Long cartId;
    private Long productId;
    
    public CartItemId() {}
    
    public CartItemId(Long cartId, Long productId) {
        this.cartId = cartId;
        this.productId = productId;
    }

    public Long getCartId() {
        return cartId;
    }

    public void setCartId(Long cartId) {
        this.cartId = cartId;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CartItemId that = (CartItemId) o;
        return cartId != null && cartId.equals(that.cartId) && productId != null && productId.equals(that.productId);
    }

    @Override
    public int hashCode() {
        return 31 * (cartId != null ? cartId.hashCode() : 0) + (productId != null ? productId.hashCode() : 0);
    }
}