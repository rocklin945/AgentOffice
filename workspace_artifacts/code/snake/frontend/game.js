// ============ 游戏配置常量 ============
const GRID_SIZE = 20;        // 网格尺寸 (20x20)
const CELL_SIZE = 20;       // 每个单元格大小 (px)
const CANVAS_SIZE = 400;    // 画布大小 (px)
const INITIAL_SPEED = 150;  // 初始移动间隔 (ms)
const MIN_SPEED = 80;       // 最小移动间隔 (ms)
const SPEED_INCREASE_INTERVAL = 5;  // 每吃N个食物加速一次
const SPEED_INCREASE_RATE = 0.9;    // 速度增加比例
const POINTS_PER_FOOD = 10;         // 每个食物得分

// ============ 游戏状态枚举 ============
const GameState = {
    IDLE: 'idle',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameOver'
};

// ============ 方向定义 ============
const Direction = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
};

// ============ 游戏类 ============
class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 分数显示元素
        this.currentScoreEl = document.getElementById('current-score');
        this.highScoreEl = document.getElementById('high-score');
        this.finalScoreEl = document.getElementById('final-score');
        
        // 控制按钮
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.restartControlBtn = document.getElementById('restart-control-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.gameOverEl = document.getElementById('game-over');
        
        // 音频上下文
        this.audioContext = null;
        
        // 初始化游戏
        this.init();
    }

    init() {
        // 从 localStorage 读取最高分
        this.highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
        this.highScoreEl.textContent = this.highScore;
        
        // 初始化游戏状态
        this.resetGame();
        
        // 绑定事件
        this.bindEvents();
        
        // 初始渲染
        this.render();
    }

    resetGame() {
        // 蛇初始位置和长度
        this.snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
        
        // 初始方向向右
        this.direction = Direction.RIGHT;
        this.nextDirection = Direction.RIGHT;
        
        // 生成第一个食物
        this.food = this.generateFood();
        
        // 游戏状态
        this.state = GameState.IDLE;
        
        // 分数
        this.score = 0;
        this.currentScoreEl.textContent = this.score;
        
        // 速度
        this.speed = INITIAL_SPEED;
        this.foodCount = 0;
        
        // 游戏循环定时器
        this.gameLoop = null;
        
        // 隐藏游戏结束界面
        this.gameOverEl.classList.add('hidden');
        
        // 更新按钮状态
        this.updateButtonStates();
    }

    bindEvents() {
        // 键盘控制
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // 按钮点击
        this.startBtn.addEventListener('click', () => this.startGame());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.restartControlBtn.addEventListener('click', () => this.restart());
        this.restartBtn.addEventListener('click', () => this.restart());
    }

    handleKeyDown(e) {
        const key = e.key.toLowerCase();
        
        // 方向键或 WASD 控制方向
        if (this.state === GameState.PLAYING) {
            switch (key) {
                case 'arrowup':
                case 'w':
                    if (this.direction !== Direction.DOWN) {
                        this.nextDirection = Direction.UP;
                    }
                    e.preventDefault();
                    break;
                case 'arrowdown':
                case 's':
                    if (this.direction !== Direction.UP) {
                        this.nextDirection = Direction.DOWN;
                    }
                    e.preventDefault();
                    break;
                case 'arrowleft':
                case 'a':
                    if (this.direction !== Direction.RIGHT) {
                        this.nextDirection = Direction.LEFT;
                    }
                    e.preventDefault();
                    break;
                case 'arrowright':
                case 'd':
                    if (this.direction !== Direction.LEFT) {
                        this.nextDirection = Direction.RIGHT;
                    }
                    e.preventDefault();
                    break;
            }
        }
        
        // 空格键暂停
        if (key === ' ') {
            e.preventDefault();
            this.togglePause();
        }
    }

    startGame() {
        if (this.state === GameState.IDLE || this.state === GameState.GAME_OVER) {
            this.state = GameState.PLAYING;
            this.startGameLoop();
            this.updateButtonStates();
        }
    }

    togglePause() {
        if (this.state === GameState.PLAYING) {
            this.pauseGame();
        } else if (this.state === GameState.PAUSED) {
            this.resumeGame();
        }
    }

    pauseGame() {
        this.state = GameState.PAUSED;
        clearInterval(this.gameLoop);
        this.updateButtonStates();
    }

    resumeGame() {
        this.state = GameState.PLAYING;
        this.startGameLoop();
        this.updateButtonStates();
    }

    restart() {
        clearInterval(this.gameLoop);
        this.resetGame();
        this.render();
    }

    startGameLoop() {
        this.gameLoop = setInterval(() => this.update(), this.speed);
    }

    update() {
        // 更新方向
        this.direction = this.nextDirection;
        
        // 计算新的蛇头位置
        const head = this.snake[0];
        const newHead = {
            x: head.x + this.direction.x,
            y: head.y + this.direction.y
        };
        
        // 检测碰撞
        if (this.checkCollision(newHead)) {
            this.gameOver();
            return;
        }
        
        // 添加新蛇头
        this.snake.unshift(newHead);
        
        // 检测是否吃到食物
        if (newHead.x === this.food.x && newHead.y === this.food.y) {
            this.eatFood();
        } else {
            // 没吃到食物，移除蛇尾
            this.snake.pop();
        }
        
        // 重新渲染
        this.render();
    }

    checkCollision(head) {
        // 检测墙壁碰撞
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
            return true;
        }
        
        // 检测自身碰撞 (排除蛇头本身)
        for (let i = 0; i < this.snake.length; i++) {
            if (this.snake[i].x === head.x && this.snake[i].y === head.y) {
                return true;
            }
        }
        
        return false;
    }

    eatFood() {
        // 增加分数
        this.score += POINTS_PER_FOOD;
        this.currentScoreEl.textContent = this.score;
        
        // 播放音效
        this.playSound('eat');
        
        // 更新食物计数
        this.foodCount++;
        
        // 检查是否需要加速
        if (this.foodCount % SPEED_INCREASE_INTERVAL === 0) {
            this.increaseSpeed();
        }
        
        // 生成新食物
        this.food = this.generateFood();
    }

    increaseSpeed() {
        if (this.speed > MIN_SPEED) {
            this.speed = Math.max(MIN_SPEED, Math.floor(this.speed * SPEED_INCREASE_RATE));
            clearInterval(this.gameLoop);
            this.startGameLoop();
        }
    }

    generateFood() {
        let food;
        do {
            food = {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE)
            };
        } while (this.isSnakePosition(food));
        
        return food;
    }

    isSnakePosition(pos) {
        return this.snake.some(segment => segment.x === pos.x && segment.y === pos.y);
    }

    gameOver() {
        this.state = GameState.GAME_OVER;
        clearInterval(this.gameLoop);
        
        // 播放游戏结束音效
        this.playSound('gameOver');
        
        // 检查是否打破最高分
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
            this.highScoreEl.textContent = this.highScore;
        }
        
        // 显示游戏结束界面
        this.finalScoreEl.textContent = this.score;
        this.gameOverEl.classList.remove('hidden');
        
        this.updateButtonStates();
    }

    updateButtonStates() {
        switch (this.state) {
            case GameState.IDLE:
                this.startBtn.disabled = false;
                this.pauseBtn.disabled = true;
                this.pauseBtn.textContent = '暂停';
                break;
            case GameState.PLAYING:
                this.startBtn.disabled = true;
                this.pauseBtn.disabled = false;
                this.pauseBtn.textContent = '暂停';
                break;
            case GameState.PAUSED:
                this.startBtn.disabled = true;
                this.pauseBtn.disabled = false;
                this.pauseBtn.textContent = '继续';
                break;
            case GameState.GAME_OVER:
                this.startBtn.disabled = true;
                this.pauseBtn.disabled = true;
                break;
        }
    }

    render() {
        // 清空画布
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        
        // 绘制网格线 (可选，调试用)
        // this.drawGrid();
        
        // 绘制食物
        this.drawFood();
        
        // 绘制蛇
        this.drawSnake();
    }

    drawGrid() {
        this.ctx.strokeStyle = '#34495e';
        this.ctx.lineWidth = 0.5;
        
        for (let i = 0; i <= GRID_SIZE; i++) {
            // 垂直线
            this.ctx.beginPath();
            this.ctx.moveTo(i * CELL_SIZE, 0);
            this.ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE);
            this.ctx.stroke();
            
            // 水平线
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * CELL_SIZE);
            this.ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE);
            this.ctx.stroke();
        }
    }

    drawFood() {
        const x = this.food.x * CELL_SIZE;
        const y = this.food.y * CELL_SIZE;
        
        // 绘制食物 (圆形)
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.beginPath();
        this.ctx.arc(
            x + CELL_SIZE / 2,
            y + CELL_SIZE / 2,
            CELL_SIZE / 2 - 2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
        
        // 食物高光
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(
            x + CELL_SIZE / 3,
            y + CELL_SIZE / 3,
            CELL_SIZE / 6,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
    }

    drawSnake() {
        this.snake.forEach((segment, index) => {
            const x = segment.x * CELL_SIZE;
            const y = segment.y * CELL_SIZE;
            
            if (index === 0) {
                // 蛇头
                this.ctx.fillStyle = '#27ae60';
            } else {
                // 蛇身渐变
                const ratio = index / this.snake.length;
                this.ctx.fillStyle = this.interpolateColor('#2ecc71', '#27ae60', ratio);
            }
            
            // 绘制圆角矩形
            this.ctx.beginPath();
            this.roundRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2, 4);
            this.ctx.fill();
        });
    }

    roundRect(x, y, width, height, radius) {
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
    }

    interpolateColor(color1, color2, ratio) {
        const hex = (color) => {
            const result = color.match(/\d+/g);
            return result ? parseInt(result, 10) : 0;
        };
        
        const r1 = hex(color1);
        const g1 = hex(color1.slice(color1.indexOf(',') + 1));
        const b1 = hex(color1.slice(color1.lastIndexOf(',') + 1));
        
        const r2 = hex(color2);
        const g2 = hex(color2.slice(color2.indexOf(',') + 1));
        const b2 = hex(color2.slice(color2.lastIndexOf(',') + 1));
        
        const r = Math.round(r1 + (r2 - r1) * ratio);
        const g = Math.round(g1 + (g2 - g1) * ratio);
        const b = Math.round(b1 + (b2 - b1) * ratio);
        
        return `rgb(${r}, ${g}, ${b})`;
    }

    // ============ 音效系统 ============
    initAudio() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    playSound(type) {
        try {
            this.initAudio();
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            if (type === 'eat') {
                // 吃食物音效 - 上升音调
                oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.1);
            } else if (type === 'gameOver') {
                // 游戏结束音效 - 下降音调
                oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.5);
                gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.5);
            }
        } catch (e) {
            // 音频不支持时静默失败
            console.warn('Audio not supported');
        }
    }
}

// ============ 启动游戏 ============
document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});