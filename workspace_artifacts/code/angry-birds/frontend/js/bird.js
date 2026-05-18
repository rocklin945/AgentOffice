// 小鸟类
(function() {
    'use strict';

    // 小鸟类型定义
    const BIRD_TYPES = {
        red: {
            name: '红鸟',
            color: '#FF4444',
            ability: '基础小鸟',
            description: '普通的红色小鸟，撞击造成中等伤害'
        },
        yellow: {
            name: '黄鸟',
            color: '#FFD700',
            ability: '加速',
            description: '点击后速度提升1.5倍'
        },
        blue: {
            name: '蓝鸟',
            color: '#00BFFF',
            ability: '分裂',
            description: '点击后分裂成3只小鸟'
        }
    };

    // 创建小鸟
    function createBird(x, y, type) {
        if (!window.Matter) {
            console.error('Matter.js not loaded!');
            return null;
        }

        const birdType = BIRD_TYPES[type] || BIRD_TYPES.red;
        const radius = 20;

        const bird = Matter.Bodies.circle(x, y, radius, {
            label: 'bird',
            render: {
                fillStyle: birdType.color,
                strokeStyle: '#000',
                lineWidth: 2
            },
            restitution: 0.5,
            friction: 0.5,
            density: 0.002
        });

        bird.birdType = type;
        bird.usedAbility = false;
        bird.activated = false;

        return bird;
    }

    // 绘制小鸟（自定义渲染）
    function drawBird(ctx, bird) {
        const type = bird.birdType || 'red';
        const birdData = BIRD_TYPES[type];
        const x = bird.position.x;
        const y = bird.position.y;
        const radius = 20;

        ctx.save();

        // 身体
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = birdData.color;
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 眼睛
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(x - 5, y - 5, 8, 0, Math.PI * 2);
        ctx.arc(x + 5, y - 5, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(x - 5, y - 5, 4, 0, Math.PI * 2);
        ctx.arc(x + 5, y - 5, 4, 0, Math.PI * 2);
        ctx.fill();

        // 眉毛（愤怒表情）
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - 12, y - 12);
        ctx.lineTo(x - 2, y - 8);
        ctx.moveTo(x + 12, y - 12);
        ctx.lineTo(x + 2, y - 8);
        ctx.stroke();

        // 嘴巴
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.moveTo(x - 4, y + 3);
        ctx.lineTo(x + 4, y + 3);
        ctx.lineTo(x, y + 10);
        ctx.closePath();
        ctx.fill();

        // 羽毛（头顶）
        ctx.fillStyle = birdData.color;
        ctx.beginPath();
        ctx.moveTo(x - 5, y - 18);
        ctx.lineTo(x, y - 25);
        ctx.lineTo(x + 5, y - 18);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    // 激活小鸟能力
    function activateAbility(bird) {
        if (!bird || bird.usedAbility || bird.activated) return;

        const type = bird.birdType;
        const Matter = window.Matter;

        switch (type) {
            case 'yellow':
                // 黄鸟加速
                const currentVel = bird.velocity;
                Matter.Body.setVelocity(bird, {
                    x: currentVel.x * 1.5,
                    y: currentVel.y * 1.5
                });
                bird.usedAbility = true;
                playAbilitySound('speed');
                break;

            case 'blue':
                // 蓝鸟分裂
                if (!bird.splitCount) bird.splitCount = 0;
                if (bird.splitCount >= 2) {
                    bird.usedAbility = true;
                    return;
                }
                
                const baseX = bird.position.x;
                const baseY = bird.position.y;
                bird.splitCount++;
                
                // 创建两只分裂的小鸟
                for (let i = 0; i < 2; i++) {
                    const newBird = createBird(baseX, baseY, 'blue');
                    Matter.Body.setVelocity(newBird, {
                        x: (i === 0 ? -1 : 1) * 8,
                        y: -5
                    });
                    Matter.Composite.add(window.Game.world, newBird);
                    window.Game.launchedBirds.push(newBird);
                }
                
                playAbilitySound('split');
                break;
        }
    }

    // 播放能力音效
    function playAbilitySound(type) {
        if (!window.Game || !window.Game.soundEnabled) return;
        
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            if (type === 'speed') {
                oscillator.frequency.value = 800;
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            } else if (type === 'split') {
                oscillator.frequency.value = 600;
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            }
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            console.warn('Audio not supported');
        }
    }

    // 导出
    window.Bird = {
        BIRD_TYPES,
        createBird,
        drawBird,
        activateAbility
    };
})();