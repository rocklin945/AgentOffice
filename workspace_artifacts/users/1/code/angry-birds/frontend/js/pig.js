// 猪猪类
(function() {
    'use strict';

    // 猪猪类型定义
    const PIG_TYPES = {
        small: {
            name: '小猪',
            radius: 25,
            health: 50,
            color: '#90EE90'
        },
        medium: {
            name: '中猪',
            radius: 35,
            health: 100,
            color: '#7CCD7C'
        },
        large: {
            name: '大猪',
            radius: 45,
            health: 150,
            color: '#5FBF5F'
        }
    };

    // 创建猪猪
    function createPig(x, y, size) {
        if (!window.Matter) {
            console.error('Matter.js not loaded!');
            return null;
        }

        const pigType = PIG_TYPES[size] || PIG_TYPES.small;

        const pig = Matter.Bodies.circle(x, y, pigType.radius, {
            label: 'pig',
            render: {
                fillStyle: pigType.color,
                strokeStyle: '#228B22',
                lineWidth: 3
            },
            restitution: 0.3,
            friction: 0.8,
            density: 0.001
        });

        pig.pigSize = size;
        pig.health = pigType.health;
        pig.maxHealth = pigType.health;
        pig.blinkTimer = 0;

        return pig;
    }

    // 绘制猪猪
    function drawPig(ctx, pig) {
        const pigType = PIG_TYPES[pig.pigSize] || PIG_TYPES.small;
        const x = pig.position.x;
        const y = pig.position.y;
        const radius = pigType.radius;

        ctx.save();

        // 根据血量调整透明度
        const healthRatio = pig.health / pig.maxHealth;
        ctx.globalAlpha = 0.3 + healthRatio * 0.7;

        // 身体
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = pigType.color;
        ctx.fill();
        ctx.strokeStyle = '#228B22';
        ctx.lineWidth = 3;
        ctx.stroke();

        // 眼睛（白色）
        ctx.fillStyle = '#FFF';
        const eyeOffsetX = radius * 0.35;
        const eyeOffsetY = -radius * 0.15;
        const eyeSize = radius * 0.3;
        
        ctx.beginPath();
        ctx.arc(x - eyeOffsetX, y + eyeOffsetY, eyeSize, 0, Math.PI * 2);
        ctx.arc(x + eyeOffsetX, y + eyeOffsetY, eyeSize, 0, Math.PI * 2);
        ctx.fill();

        // 眼睛（黑色瞳孔）
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(x - eyeOffsetX, y + eyeOffsetY, eyeSize * 0.5, 0, Math.PI * 2);
        ctx.arc(x + eyeOffsetX, y + eyeOffsetY, eyeSize * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // 猪鼻子
        ctx.fillStyle = '#FFB6C1';
        ctx.beginPath();
        ctx.ellipse(x, y + radius * 0.2, radius * 0.25, radius * 0.18, 0, 0, Math.PI * 2);
        ctx.fill();

        // 鼻孔
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.arc(x - radius * 0.08, y + radius * 0.2, radius * 0.05, 0, Math.PI * 2);
        ctx.arc(x + radius * 0.08, y + radius * 0.2, radius * 0.05, 0, Math.PI * 2);
        ctx.fill();

        // 耳朵
        ctx.fillStyle = pigType.color;
        ctx.beginPath();
        ctx.ellipse(x - radius * 0.7, y - radius * 0.5, radius * 0.2, radius * 0.15, -0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x + radius * 0.7, y - radius * 0.5, radius * 0.2, radius * 0.15, 0.5, 0, Math.PI * 2);
        ctx.fill();

        // 嘴巴（根据受伤程度显示不同表情）
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        if (healthRatio > 0.6) {
            // 开心
            ctx.arc(x, y + radius * 0.4, radius * 0.15, 0, Math.PI);
        } else if (healthRatio > 0.3) {
            // 一般
            ctx.moveTo(x - radius * 0.15, y + radius * 0.45);
            ctx.lineTo(x + radius * 0.15, y + radius * 0.45);
        } else {
            // 痛苦
            ctx.arc(x, y + radius * 0.55, radius * 0.15, Math.PI, 0);
        }
        ctx.stroke();

        ctx.restore();
    }

    // 伤害猪猪
    function damagePig(pig, damage) {
        if (!pig) return;

        pig.health -= damage;

        // 受伤闪烁效果
        pig.blinkTimer = 10;

        if (pig.health <= 0) {
            destroyPig(pig);
        }
    }

    // 销毁猪猪
    function destroyPig(pig) {
        if (!pig) return;

        // 从游戏中移除
        if (window.Game) {
            const index = window.Game.pigs.indexOf(pig);
            if (index > -1) {
                window.Game.pigs.splice(index, 1);
            }
            Matter.Composite.remove(window.Game.world, pig);
            window.Game.score += 500;
            window.Game.updateUI();
            
            // 播放音效
            playDestroySound();
            
            // 检查胜利条件
            if (window.Game.pigs.length === 0) {
                setTimeout(() => {
                    window.Game.showVictory();
                }, 500);
            }
        }
    }

    // 播放销毁音效
    function playDestroySound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.3);
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (e) {
            console.warn('Audio not supported');
        }
    }

    // 导出
    window.Pig = {
        PIG_TYPES,
        createPig,
        drawPig,
        damagePig,
        destroyPig
    };
})();