// 游戏配置
const CONFIG = {
    canvas: {
        width: 1200,
        height: 600
    },
    physics: {
        gravity: 1,
        friction: 0.5,
        restitution: 0.3
    },
    slingshot: {
        x: 150,
        y: 450,
        maxPull: 150
    },
    bird: {
        radius: 20,
        types: ['red', 'yellow', 'blue']
    },
    pig: {
        sizes: {
            small: 25,
            medium: 35,
            large: 45
        }
    },
    blocks: {
        wood: { health: 100, color: '#8B4513' },
        stone: { health: 200, color: '#808080' },
        glass: { health: 50, color: 'rgba(135, 206, 235, 0.7)' }
    }
};

// 全局变量
let engine, render, world, runner;
let currentLevel = 1;
let score = 0;
let birdsRemaining = 3;
let currentBird = null;
let isAiming = false;
let isDragging = false;
let isPaused = false;
let gameState = 'menu'; // menu, playing, paused, victory, defeat
let pigs = [];
let blocks = [];
let birds = [];
let launchedBirds = [];

// 音频管理
let soundEnabled = true;
let musicEnabled = true;

// 初始化 Matter.js 引擎
function initEngine() {
    engine = Matter.Engine.create();
    world = engine.world;
    engine.world.gravity.y = CONFIG.physics.gravity;

    const canvas = document.getElementById('game-canvas');
    render = Matter.Render.create({
        canvas: canvas,
        engine: engine,
        options: {
            width: CONFIG.canvas.width,
            height: CONFIG.canvas.height,
            wireframes: false,
            background: 'linear-gradient(180deg, #87CEEB 0%, #90EE90 50%, #228B22 100%)'
        }
    });

    // 创建边界
    const ground = Matter.Bodies.rectangle(600, 590, 1200, 20, {
        isStatic: true,
        render: { fillStyle: '#228B22' }
    });
    const leftWall = Matter.Bodies.rectangle(-10, 300, 20, 600, { isStatic: true });
    const rightWall = Matter.Bodies.rectangle(1210, 300, 20, 600, { isStatic: true });

    Matter.Composite.add(world, [ground, leftWall, rightWall]);

    // 碰撞检测
    Matter.Events.on(engine, 'collisionStart', handleCollision);

    Matter.Render.run(render);
    runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    // 自定义渲染
    Matter.Events.on(render, 'afterRender', customRender);

    // 画布点击：飞行中的小鸟触发能力
    canvas.addEventListener('click', function(e) {
        if (gameState !== 'playing' || isPaused) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = CONFIG.canvas.width / rect.width;
        const scaleY = CONFIG.canvas.height / rect.height;
        const mx = (e.clientX - rect.left) * scaleX;
        const my = (e.clientY - rect.top) * scaleY;

        launchedBirds.forEach(function(bird) {
            if (bird && bird.birdType && !bird.usedAbility && !bird.activated) {
                const dx = mx - bird.position.x;
                const dy = my - bird.position.y;
                if (Math.sqrt(dx * dx + dy * dy) < 40) {
                    if (window.Bird && window.Bird.activateAbility) {
                        window.Bird.activateAbility(bird);
                    }
                }
            }
        });
    });
}

// 处理碰撞
function handleCollision(event) {
    const pairs = event.pairs;
    
    pairs.forEach(pair => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;
        
        // 计算碰撞力度
        const relativeVelocity = Math.abs(pair.collision.depth);
        
        // 鸟撞到东西
        if (bodyA.label === 'bird' || bodyB.label === 'bird') {
            const bird = bodyA.label === 'bird' ? bodyA : bodyB;
            const other = bodyA.label === 'bird' ? bodyB : bodyA;
            
            if (other.label === 'pig') {
                damagePig(other, relativeVelocity * 10);
            } else if (other.label === 'block') {
                damageBlock(other, relativeVelocity * 5);
            }
            
            // 鸟的特殊能力
            activateBirdAbility(bird);
        }
        
        // 方块碰撞
        if (bodyA.label === 'block' || bodyB.label === 'block') {
            const block = bodyA.label === 'block' ? bodyA : bodyB;
            const other = bodyA.label === 'block' ? bodyB : bodyA;
            
            if (other.label === 'pig' && relativeVelocity > 2) {
                damagePig(other, relativeVelocity * 3);
            }
        }
    });
}

// 自定义渲染
function customRender() {
    const ctx = render.context;
    
    // 绘制弹弓
    drawSlingshot(ctx);
    
    // 绘制轨迹
    if (isDragging && currentBird) {
        drawTrajectory(ctx);
    }
    
    // 绘制瞄准线
    if (isDragging) {
        drawAimLine(ctx);
    }
}

// 绘制弹弓
function drawSlingshot(ctx) {
    const x = CONFIG.slingshot.x;
    const y = CONFIG.slingshot.y;
    
    ctx.save();
    
    // 弹弓支柱
    ctx.fillStyle = '#654321';
    ctx.fillRect(x - 5, y - 80, 10, 100);
    
    // 弹弓叉
    ctx.beginPath();
    ctx.moveTo(x - 20, y - 80);
    ctx.lineTo(x - 30, y - 120);
    ctx.lineTo(x - 25, y - 120);
    ctx.lineTo(x - 5, y - 80);
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(x + 20, y - 80);
    ctx.lineTo(x + 30, y - 120);
    ctx.lineTo(x + 25, y - 120);
    ctx.lineTo(x + 5, y - 80);
    ctx.fill();
    
    // 弹弓皮筋
    if (currentBird && !launchedBirds.includes(currentBird)) {
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x - 27, y - 110);
        ctx.lineTo(currentBird.position.x, currentBird.position.y);
        ctx.lineTo(x + 27, y - 110);
        ctx.stroke();
    } else if (!currentBird) {
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x - 27, y - 110);
        ctx.lineTo(x - 27, y - 70);
        ctx.lineTo(x + 27, y - 70);
        ctx.lineTo(x + 27, y - 110);
        ctx.stroke();
    }
    
    ctx.restore();
}

// 绘制瞄准轨迹
function drawTrajectory(ctx) {
    if (!currentBird) return;
    
    const bird = currentBird;
    const pullX = CONFIG.slingshot.x - bird.position.x;
    const pullY = CONFIG.slingshot.y - 90 - bird.position.y;
    const power = Math.sqrt(pullX * pullX + pullY * pullY);
    const angle = Math.atan2(pullY, pullX);
    
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    
    const velocity = {
        x: Math.cos(angle) * power * 0.15,
        y: Math.sin(angle) * power * 0.15
    };
    
    let px = bird.position.x;
    let py = bird.position.y;
    let vx = velocity.x;
    let vy = velocity.y;
    
    for (let i = 0; i < 30; i++) {
        px += vx;
        py += vy;
        vy += 0.5; // 重力
        
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
}

// 绘制瞄准线
function drawAimLine(ctx) {
    if (!currentBird) return;
    
    const bird = currentBird;
    const targetX = CONFIG.slingshot.x;
    const targetY = CONFIG.slingshot.y - 90;
    
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    ctx.beginPath();
    ctx.moveTo(bird.position.x, bird.position.y);
    ctx.lineTo(targetX, targetY);
    ctx.stroke();
    
    ctx.restore();
}

// 伤害猪猪
function damagePig(pig, damage) {
    if (!pig.health) pig.health = pig.pigSize === 'large' ? 150 : pig.pigSize === 'medium' ? 100 : 50;
    
    pig.health -= damage;
    
    if (pig.health <= 0) {
        destroyPig(pig);
    }
}

// 销毁猪猪
function destroyPig(pig) {
    const index = pigs.indexOf(pig);
    if (index > -1) {
        pigs.splice(index, 1);
    }
    Matter.Composite.remove(world, pig);
    score += 500;
    updateUI();
    playSound('pig');
    
    checkWinCondition();
}

// 伤害方块
function damageBlock(block, damage) {
    if (!block.health) block.health = 100;
    
    block.health -= damage;
    
    if (block.health <= 0) {
        destroyBlock(block);
    }
}

// 销毁方块
function destroyBlock(block) {
    const index = blocks.indexOf(block);
    if (index > -1) {
        blocks.splice(index, 1);
    }
    Matter.Composite.remove(world, block);
    score += 100;
    updateUI();
}

// 激活小鸟能力
function activateBirdAbility(bird) {
    if (bird.usedAbility) return;
    
    const speed = Math.sqrt(
        bird.velocity.x * bird.velocity.x + 
        bird.velocity.y * bird.velocity.y
    );
    
    // 只有速度足够快才触发能力
    if (speed < 5) return;
    
    bird.usedAbility = true;
    
    switch (bird.birdType) {
        case 'yellow':
            // 黄鸟加速
            Matter.Body.setVelocity(bird, {
                x: bird.velocity.x * 1.5,
                y: bird.velocity.y * 1.5
            });
            playSound('speed');
            break;
            
        case 'blue':
            // 蓝鸟分裂
            bird.usedAbility = false; // 可以多次使用
            splitBird(bird);
            break;
    }
}

// 分裂蓝鸟
function splitBird(bird) {
    const baseX = bird.position.x;
    const baseY = bird.position.y;
    
    for (let i = 0; i < 2; i++) {
        const newBird = createBird(baseX, baseY, 'blue');
        Matter.Body.setVelocity(newBird, {
            x: (i === 0 ? -1 : 1) * 5,
            y: -3
        });
        launchedBirds.push(newBird);
    }
}

// 更新UI
function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('birds-count').textContent = birdsRemaining;
}

// 检查胜利条件
function checkWinCondition() {
    if (pigs.length === 0) {
        setTimeout(() => {
            showVictory();
        }, 500);
    }
}

// 检查失败条件
function checkDefeatCondition() {
    if (birdsRemaining === 0 && launchedBirds.every(b => isSettled(b))) {
        if (pigs.length > 0) {
            setTimeout(() => {
                showDefeat();
            }, 1000);
        }
    }
}

// 判断物体是否静止
function isSettled(body) {
    const speed = Math.sqrt(
        body.velocity.x * body.velocity.x + 
        body.velocity.y * body.velocity.y
    );
    return speed < 0.5;
}

// 创建小鸟
function createBird(x, y, type = 'red') {
    const bird = Matter.Bodies.circle(x, y, CONFIG.bird.radius, {
        label: 'bird',
        render: {
            fillStyle: type === 'red' ? '#FF4444' : type === 'yellow' ? '#FFD700' : '#00BFFF',
            strokeStyle: '#000',
            lineWidth: 2
        }
    });
    
    bird.birdType = type;
    bird.usedAbility = false;
    Matter.Composite.add(world, bird);
    birds.push(bird);
    
    return bird;
}

// 创建猪猪
function createPig(x, y, size = 'small') {
    const radius = CONFIG.pig.sizes[size];
    const pig = Matter.Bodies.circle(x, y, radius, {
        label: 'pig',
        render: {
            fillStyle: '#90EE90',
            strokeStyle: '#228B22',
            lineWidth: 3
        }
    });
    
    pig.pigSize = size;
    pig.health = size === 'large' ? 150 : size === 'medium' ? 100 : 50;
    pig.eyeOffset = 0;
    Matter.Composite.add(world, pig);
    pigs.push(pig);
    
    return pig;
}

// 创建方块
function createBlock(x, y, width, height, material = 'wood') {
    const block = Matter.Bodies.rectangle(x, y, width, height, {
        label: 'block',
        render: {
            fillStyle: CONFIG.blocks[material].color,
            strokeStyle: '#333',
            lineWidth: 1
        }
    });
    
    block.material = material;
    block.health = CONFIG.blocks[material].health;
    block.width = width;
    block.height = height;
    Matter.Composite.add(world, block);
    blocks.push(block);
    
    return block;
}

// 加载关卡
function loadLevel(levelNum) {
    // 清除旧对象
    pigs.forEach(p => Matter.Composite.remove(world, p));
    blocks.forEach(b => Matter.Composite.remove(world, b));
    birds.forEach(b => Matter.Composite.remove(world, b));
    launchedBirds = [];

    pigs = [];
    blocks = [];
    birds = [];

    score = 0;
    currentLevel = levelNum;

    const config = window.LevelConfig ? window.LevelConfig.getLevelConfig(levelNum) : null;
    birdsRemaining = config ? config.birds : 3;
    isAiming = false;
    isDragging = false;

    updateUI();

    if (config) {
        // 猪猪
        (config.pigs || []).forEach(p => createPig(p.x, p.y, p.size));
        // 结构
        (config.structures || []).forEach(s => {
            if (s.type === 'block') {
                createBlock(s.x, s.y, s.width, s.height, s.material);
            } else if (s.type === 'pig') {
                createPig(s.x, s.y, s.size);
            }
        });
    } else {
        // 兜底
        loadLevel1();
    }

    prepareNextBird();
}

// 关卡1
function loadLevel1() {
    // 创建简单的猪猪阵列
    createPig(800, 520, 'small');
    createPig(850, 520, 'small');
    createPig(825, 470, 'small');
    
    // 创建木质结构
    createBlock(825, 400, 150, 20, 'wood');
    createBlock(775, 360, 20, 60, 'wood');
    createBlock(875, 360, 20, 60, 'wood');
}

// 关卡2
function loadLevel2() {
    // 更多猪猪
    createPig(750, 520, 'small');
    createPig(850, 520, 'small');
    createPig(950, 520, 'small');
    createPig(800, 470, 'medium');
    createPig(900, 470, 'medium');
    
    // 石块结构
    createBlock(800, 400, 120, 20, 'stone');
    createBlock(900, 400, 120, 20, 'stone');
    createBlock(750, 350, 20, 80, 'stone');
    createBlock(950, 350, 20, 80, 'stone');
    createBlock(850, 300, 220, 20, 'wood');
    createPig(850, 270, 'small');
}

// 关卡3
function loadLevel3() {
    // 三种猪猪
    createPig(700, 520, 'small');
    createPig(800, 520, 'medium');
    createPig(900, 520, 'large');
    createPig(1000, 520, 'small');
    
    // 混合结构
    createBlock(700, 450, 100, 20, 'wood');
    createBlock(800, 450, 100, 20, 'stone');
    createBlock(900, 450, 100, 20, 'wood');
    createBlock(1000, 450, 100, 20, 'stone');
    
    createBlock(700, 400, 20, 80, 'glass');
    createBlock(800, 400, 20, 80, 'wood');
    createBlock(900, 400, 20, 80, 'wood');
    createBlock(1000, 400, 20, 80, 'glass');
    
    createBlock(750, 350, 120, 20, 'stone');
    createBlock(950, 350, 120, 20, 'stone');
    createPig(850, 320, 'medium');
}

// 准备下一只鸟
function prepareNextBird() {
    if (birdsRemaining > 0) {
        const types = ['red', 'yellow', 'blue'];
        const type = types[Math.floor(Math.random() * types.length)];
        currentBird = createBird(CONFIG.slingshot.x, CONFIG.slingshot.y - 90, type);
        launchedBirds.push(currentBird);
    } else {
        currentBird = null;
    }
}

// 发射小鸟
function launchBird() {
    if (!currentBird || launchedBirds.indexOf(currentBird) === -1) return;
    
    const bird = currentBird;
    const pullX = CONFIG.slingshot.x - bird.position.x;
    const pullY = (CONFIG.slingshot.y - 90) - bird.position.y;
    const power = Math.sqrt(pullX * pullX + pullY * pullY);
    const angle = Math.atan2(pullY, pullX);
    
    const velocity = {
        x: Math.cos(angle) * power * 0.15,
        y: Math.sin(angle) * power * 0.15
    };
    
    Matter.Body.setVelocity(bird, velocity);
    
    // 从已发射列表移除（这样皮筋会消失）
    const index = launchedBirds.indexOf(currentBird);
    if (index > -1) {
        launchedBirds.splice(index, 1);
    }
    
    birdsRemaining--;
    currentBird = null;
    
    updateUI();
    playSound('launch');
    
    // 检查是否还有鸟
    setTimeout(() => {
        if (birdsRemaining > 0 || launchedBirds.some(b => !isSettled(b))) {
            if (birdsRemaining > 0 && !currentBird) {
                setTimeout(prepareNextBird, 1000);
            }
        } else {
            checkDefeatCondition();
        }
    }, 3000);
}

// 显示胜利
function showVictory() {
    gameState = 'victory';
    document.getElementById('final-score').textContent = score;

    const config = window.LevelConfig ? window.LevelConfig.getLevelConfig(currentLevel) : null;
    const stars = config
        ? (score >= config.stars.three ? 3 : score >= config.stars.two ? 2 : 1)
        : (score >= 3000 ? 3 : score >= 2000 ? 2 : 1);
    document.getElementById('stars-display').textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);

    // 下一关按钮控制
    const nextBtn = document.getElementById('next-level-btn');
    if (nextBtn) {
        nextBtn.style.display = currentLevel < 3 ? 'inline-block' : 'none';
    }

    showScreen('victory-screen');
    playSound('victory');

    // 提交到后端
    if (window.submitVictory) {
        window.submitVictory(score, stars);
    }
}

// 显示失败
function showDefeat() {
    gameState = 'defeat';
    showScreen('defeat-screen');
    playSound('defeat');
}

// 屏幕切换
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => {
        s.style.display = 'none';
    });
    document.getElementById(screenId).style.display = 'flex';
}

// 播放音效
function playSound(type) {
    if (window.AudioManager && window.AudioManager.playSound) {
        window.AudioManager.playSound(type);
    }
}

// 导出函数供 main.js 使用
window.Game = {
    initEngine,
    loadLevel,
    launchBird,
    showScreen,
    showVictory,
    showDefeat,
    prepareNextBird,
    checkDefeatCondition,
    isSettled,
    launchedBirds,
    currentBird,
    updateUI,
    score,
    gameState,
    isDragging,
    isPaused,
    birdsRemaining,
    CONFIG,
    world,
    pigs,
    blocks,
    birds,
    soundEnabled
};