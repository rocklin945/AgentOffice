// ========================================
// SimpleShop - 主应用逻辑
// ========================================

let currentView = 'grid';

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    // 判断当前页面
    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1);
    
    if (page === 'index.html' || page === '' || page === '/') {
        renderHomeProducts();
    }
    
    updateCartBadge();
    updateUserLink();
});

// 渲染首页商品
function renderHomeProducts() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    
    // 显示前12个商品作为热门推荐
    const homeProducts = productsData.slice(0, 12);
    productsGrid.innerHTML = homeProducts.map(product => createProductCard(product)).join('');
}

// 创建商品卡片 HTML
function createProductCard(product) {
    const discount = product.originalPrice 
        ? Math.round((1 - product.price / product.originalPrice) * 100) 
        : 0;
    
    return `
        <div class="product-card" onclick="goToProduct('${product.id}')">
            <img src="${product.image}" alt="${product.name}">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">
                    <span class="current-price">¥${product.price}</span>
                    ${product.originalPrice ? `<span class="original-price">¥${product.originalPrice}</span>` : ''}
                    ${discount > 0 ? `<span class="discount-tag">${discount}折</span>` : ''}
                </div>
                <div class="product-actions" onclick="event.stopPropagation()">
                    <button class="btn-add-cart" onclick="addToCart('${product.id}')">加入购物车</button>
                </div>
            </div>
        </div>
    `;
}

// 跳转到商品详情页
function goToProduct(productId) {
    window.location.href = `product.html?id=${productId}`;
}

// 添加到购物车
function addToCart(productId) {
    const cart = getCart();
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }
    
    saveCart(cart);
    showNotification('商品已添加到购物车');
}

// 切换视图模式
function toggleView(view) {
    currentView = view;
    const productsGrid = document.getElementById('productsGrid');
    const viewBtns = document.querySelectorAll('.view-btn');
    
    viewBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
    });
    
    if (view === 'list') {
        productsGrid.classList.add('list-view');
    } else {
        productsGrid.classList.remove('list-view');
    }
}

// 跳转到搜索结果页
function goToSearch() {
    const keyword = document.getElementById('searchInput').value.trim();
    if (keyword) {
        window.location.href = `search.html?keyword=${encodeURIComponent(keyword)}`;
    }
}

// 搜索框回车事件
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                goToSearch();
            }
        });
    }
});

// 显示通知消息
function showNotification(message) {
    // 移除已存在的通知
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
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
    
    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// 更新购物车徽章
function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (badge) {
        const count = calculateCartCount();
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline-block' : 'none';
    }
}

// 更新用户链接状态
function updateUserLink() {
    const userLink = document.getElementById('userLink');
    if (userLink) {
        const user = getCurrentUser();
        if (user) {
            userLink.textContent = user.username;
        }
    }
}