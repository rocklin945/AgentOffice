// ========================================
// SimpleShop - 购物车管理
// ========================================

// 获取购物车数据
function getCart() {
    return JSON.parse(localStorage.getItem('simpleshop_cart') || '[]');
}

// 保存购物车数据
function saveCart(cart) {
    localStorage.setItem('simpleshop_cart', JSON.stringify(cart));
    updateCartBadge();
}

// 添加商品到购物车
function addToCart(productId, quantity = 1) {
    const cart = getCart();
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ id: productId, quantity: quantity });
    }
    
    saveCart(cart);
    showNotification('商品已添加到购物车');
}

// 从购物车移除商品
function removeFromCart(productId) {
    const cart = getCart();
    const newCart = cart.filter(item => item.id !== productId);
    saveCart(newCart);
}

// 更新购物车商品数量
function updateCartItemQuantity(productId, quantity) {
    const cart = getCart();
    const item = cart.find(i => i.id === productId);
    
    if (item) {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = quantity;
            saveCart(cart);
        }
    }
}

// 清空购物车
function clearCart() {
    localStorage.removeItem('simpleshop_cart');
    updateCartBadge();
}

// 计算购物车总价
function calculateCartTotal() {
    const cart = getCart();
    let total = 0;
    
    cart.forEach(item => {
        const product = productsData.find(p => p.id === item.id);
        if (product) {
            total += product.price * item.quantity;
        }
    });
    
    return total;
}

// 计算购物车商品总数
function calculateCartCount() {
    const cart = getCart();
    return cart.reduce((sum, item) => sum + item.quantity, 0);
}

// 更新购物车徽章数量
function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (badge) {
        const count = calculateCartCount();
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline-block' : 'none';
    }
}

// 显示通知消息
function showNotification(message) {
    // 简单实现，实际项目中可以使用更复杂的通知组件
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background-color: #52c41a;
        color: white;
        padding: 15px 25px;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// 获取当前登录用户
function getCurrentUser() {
    const userStr = localStorage.getItem('simpleshop_current_user');
    return userStr ? JSON.parse(userStr) : null;
}

// 更新用户链接状态
function updateUserLink() {
    const userLink = document.getElementById('userLink');
    const user = getCurrentUser();
    
    if (user) {
        userLink.textContent = user.username;
    }
}

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    updateCartBadge();
    updateUserLink();
});