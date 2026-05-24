// 弹弓交互控制
(function() {
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let canvas;

    // 初始化
    function init() {
        canvas = document.getElementById('game-canvas');
        if (!canvas) return;

        // 鼠标事件
        canvas.addEventListener('mousedown', onMouseDown);
        canvas.addEventListener('mousemove', onMouseMove);
        canvas.addEventListener('mouseup', onMouseUp);
        canvas.addEventListener('mouseleave', onMouseUp);

        // 触摸事件
        canvas.addEventListener('touchstart', onTouchStart, { passive: false });
        canvas.addEventListener('touchmove', onTouchMove, { passive: false });
        canvas.addEventListener('touchend', onTouchEnd);
    }

    // 获取画布上的鼠标位置
    function getCanvasPosition(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    // 检测是否点击在小鸟上
    function isOnBird(x, y) {
        if (!window.Game || !window.Game.currentBird) return false;
        
        const bird = window.Game.currentBird;
        const dx = x - bird.position.x;
        const dy = y - bird.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance <= 30; // 30px 的点击范围
    }

    // 检测是否点击在弹弓区域
    function isOnSlingshot(x, y) {
        const slingshotX = window.Game.CONFIG.slingshot.x;
        const slingshotY = window.Game.CONFIG.slingshot.y - 90;
        
        return Math.abs(x - slingshotX) < 100 && Math.abs(y - slingshotY) < 150;
    }

    // 鼠标按下
    function onMouseDown(e) {
        if (window.Game.gameState !== 'playing' || window.Game.isPaused) return;
        if (!window.Game.currentBird) return;
        if (window.Game.launchedBirds.indexOf(window.Game.currentBird) === -1) return;

        const pos = getCanvasPosition(e);
        
        if (isOnBird(pos.x, pos.y) || isOnSlingshot(pos.x, pos.y)) {
            isDragging = true;
            window.Game.isDragging = true;
            dragStartX = pos.x;
            dragStartY = pos.y;
            
            // 将小鸟设为动态物体
            Matter.Body.setStatic(window.Game.currentBird, false);
            
            e.preventDefault();
        }
    }

    // 鼠标移动
    function onMouseMove(e) {
        if (!isDragging || !window.Game.currentBird) return;

        const pos = getCanvasPosition(e);
        const slingshotX = window.Game.CONFIG.slingshot.x;
        const slingshotY = window.Game.CONFIG.slingshot.y - 90;
        const maxPull = window.Game.CONFIG.slingshot.maxPull;

        // 计算拖拽距离和角度
        let dx = pos.x - slingshotX;
        let dy = pos.y - slingshotY;
        let distance = Math.sqrt(dx * dx + dy * dy);

        // 限制最大拖拽距离
        if (distance > maxPull) {
            dx = dx / distance * maxPull;
            dy = dy / distance * maxPull;
        }

        // 只允许向后拖拽（向左或下）
        if (dx > 50) dx = 50;

        // 更新小鸟位置
        Matter.Body.setPosition(window.Game.currentBird, {
            x: slingshotX + dx,
            y: slingshotY + dy
        });

        // 将小鸟速度设为0
        Matter.Body.setVelocity(window.Game.currentBird, { x: 0, y: 0 });

        e.preventDefault();
    }

    // 鼠标释放
    function onMouseUp(e) {
        if (!isDragging) return;

        isDragging = false;
        window.Game.isDragging = false;

        if (window.Game.currentBird) {
            const bird = window.Game.currentBird;
            const slingshotX = window.Game.CONFIG.slingshot.x;
            const slingshotY = window.Game.CONFIG.slingshot.y - 90;

            // 计算拖拽距离
            const dx = bird.position.x - slingshotX;
            const dy = bird.position.y - slingshotY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // 如果拖拽距离足够，发射
            if (distance > 20) {
                window.Game.launchBird();
            } else {
                // 否则把鸟放回弹弓
                Matter.Body.setPosition(bird, { x: slingshotX, y: slingshotY });
            }
        }
    }

    // 触摸开始
    function onTouchStart(e) {
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            onMouseDown({
                clientX: touch.clientX,
                clientY: touch.clientY,
                preventDefault: function() { e.preventDefault(); }
            });
        }
    }

    // 触摸移动
    function onTouchMove(e) {
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            onMouseMove({
                clientX: touch.clientX,
                clientY: touch.clientY,
                preventDefault: function() { e.preventDefault(); }
            });
        }
    }

    // 触摸结束
    function onTouchEnd(e) {
        onMouseUp(e);
    }

    // 键盘控制
    function initKeyboard() {
        document.addEventListener('keydown', function(e) {
            if (e.code === 'Space') {
                if (isDragging) {
                    onMouseUp(e);
                } else if (window.Game && window.Game.gameState === 'playing' && window.Game.launchedBirds) {
                    // 未拉弹弓：尝试触发第一个可触发小鸟的能力
                    window.Game.launchedBirds.forEach(function(bird) {
                        if (bird && bird.birdType && !bird.usedAbility && !bird.activated) {
                            if (window.Bird && window.Bird.activateAbility) {
                                window.Bird.activateAbility(bird);
                            }
                        }
                    });
                }
            }
        });
    }

    // 页面加载后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            init();
            initKeyboard();
        });
    } else {
        init();
        initKeyboard();
    }

    // 导出
    window.Slingshot = {
        init,
        isDragging: function() { return isDragging; }
    };
})();