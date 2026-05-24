// ============================================================
// 俄罗斯方块 (Tetris) - 核心游戏逻辑
// ============================================================

// ===== 常量定义 =====
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30; // 像素
const NEXT_BLOCK_SIZE = 24;

// 方块颜色映射（PRD 定义）
const COLORS = {
    I: '#00f0f0', // 青色
    O: '#f0f000', // 黄色
    T: '#a000f0', // 紫色
    S: '#00f000', // 绿色
    Z: '#f00000', // 红色
    J: '#0000f0', // 蓝色
    L: '#f0a000'  // 橙色
};

// 7种标准方块的形状定义（4x4矩阵）
const SHAPES = {
    I: [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    O: [
        [1, 1],
        [1, 1]
    ],
    T: [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],
    S: [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
    ],
    Z: [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
    ],
    J: [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],
    L: [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0]
    ]
};

const PIECE_NAMES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

// 分数规则
const SCORE_TABLE = {
    1: 100,   // Single
    2: 300,   // Double
    3: 500,   // Triple
    4: 800    // Tetris
};

// 等级速度（毫秒）
const LEVEL_SPEEDS = [
    800, 720, 630, 550, 470,
    380, 300, 220, 150, 100,
    80, 60, 50, 40, 30
];

// ===== DOM 元素引用 =====
const mainMenu = document.getElementById('mainMenu');
const gameScreen = document.getElementById('gameScreen');
const startBtn = document.getElementById('startBtn');
const helpBtn = document.getElementById('helpBtn');
const closeHelp = document.getElementById('closeHelp');
const helpModal = document.getElementById('helpModal');
const restartBtn = document.getElementById('restartBtn');
const backToMenuBtn = document.getElementById('backToMenuBtn');

const gameCanvas = document.getElementById('gameCanvas');
const ctx = gameCanvas.getContext('2d');
const nextCanvas = document.getElementById('nextCanvas');
const nextCtx = nextCanvas.getContext('2d');

const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const linesEl = document.getElementById('lines');
const finalScoreEl = document.getElementById('finalScore');
const menuHighScoreEl = document.getElementById('menuHighScore');
const newRecordEl = document.getElementById('newRecord');
const pauseOverlay = document.getElementById('pauseOverlay');
const gameOverOverlay = document.getElementById('gameOverOverlay');

// ===== 游戏状态 =====
let board = [];
let currentPiece = null;
let nextPiece = null;
let score = 0;
let level = 1;
let lines = 0;
let gameRunning = false;
let gamePaused = false;
let gameOver = false;
let dropInterval = null;
let animationId = null;
let highScore = 0;

// ===== 音效（使用 Web Audio API 生成简单音效） =====
let audioCtx = null;
let soundEnabled = true;

function initAudio() {
    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        soundEnabled = false;
    }
}

function playTone(frequency, duration, type = 'square') {
    if (!soundEnabled || !audioCtx) return;
    try {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.type = type;
        oscillator.frequency.value = frequency;
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + duration);
    } catch (e) { /* ignore */ }
}

function playClearSound() {
    playTone(523, 0.15);
    setTimeout(() => playTone(659, 0.15), 100);
    setTimeout(() => playTone(784, 0.2), 200);
}

function playDropSound() {
    playTone(200, 0.1, 'triangle');
}

function playGameOverSound() {
    playTone(400, 0.2);
    setTimeout(() => playTone(300, 0.2), 200);
    setTimeout(() => playTone(200, 0.4), 400);
}

// ===== 工具函数 =====

// 创建空棋盘
function createBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

// 随机生成方块（7-bag 算法）
class PieceBag {
    constructor() {
        this.bag = [];
        this.refill();
    }

    refill() {
        this.bag = [...PIECE_NAMES];
        // Fisher-Yates 洗牌
        for (let i = this.bag.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
        }
    }

    next() {
        if (this.bag.length === 0) {
            this.refill();
        }
        return this.bag.pop();
    }
}

let pieceBag = null;

// 创建方块对象
function createPiece(name) {
    const shape = SHAPES[name].map(row => [...row]);
    return {
        name: name,
        shape: shape,
        color: COLORS[name],
        x: Math.floor((COLS - shape[0].length) / 2),
        y: 0,
        size: shape.length
    };
}

// 旋转矩阵（顺时针90度）
function rotateMatrix(matrix) {
    const n = matrix.length;
    const rotated = Array.from({ length: n }, () => Array(n).fill(0));
    for (let y = 0; y < n; y++) {
        for (let x = 0; x < n; x++) {
            rotated[x][n - 1 - y] = matrix[y][x];
        }
    }
    return rotated;
}

// 碰撞检测
function isValidMove(piece, board, offsetX = 0, offsetY = 0) {
    const shape = piece.shape;
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (shape[y][x]) {
                const newX = piece.x + x + offsetX;
                const newY = piece.y + y + offsetY;
                // 超出边界
                if (newX < 0 || newX >= COLS || newY >= ROWS) return false;
                // 与已固定的方块重叠
                if (newY >= 0 && board[newY][newX] !== null) return false;
            }
        }
    }
    return true;
}

// 固定当前方块到棋盘
function lockPiece() {
    const shape = currentPiece.shape;
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (shape[y][x]) {
                const boardY = currentPiece.y + y;
                const boardX = currentPiece.x + x;
                if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
                    board[boardY][boardX] = currentPiece.color;
                }
            }
        }
    }
    playDropSound();
}

// 消除满行并更新分数
function clearLines() {
    let cleared = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(cell => cell !== null)) {
            board.splice(y, 1);
            board.unshift(Array(COLS).fill(null));
            cleared++;
            y++; // 重新检查当前行
        }
    }

    if (cleared > 0) {
        // 计分
        const points = SCORE_TABLE[cleared] || 0;
        score += points;
        lines += cleared;

        // 每消除10行升级
        const newLevel = Math.floor(lines / 10) + 1;
        if (newLevel > level) {
            level = newLevel;
            resetDropTimer();
        }

        // 更新显示
        updateInfo();
        playClearSound();
    }
}

// 检查游戏是否结束
function checkGameOver() {
    // 如果新方块无法放置，游戏结束
    if (!isValidMove(currentPiece, board)) {
        return true;
    }
    return false;
}

// ===== 游戏操作 =====

function moveLeft() {
    if (!gameRunning || gamePaused || gameOver) return;
    if (isValidMove(currentPiece, board, -1, 0)) {
        currentPiece.x--;
    }
}

function moveRight() {
    if (!gameRunning || gamePaused || gameOver) return;
    if (isValidMove(currentPiece, board, 1, 0)) {
        currentPiece.x++;
    }
}

function moveDown() {
    if (!gameRunning || gamePaused || gameOver) return;
    if (isValidMove(currentPiece, board, 0, 1)) {
        currentPiece.y++;
        return true;
    } else {
        lockAndSpawn();
        return false;
    }
}

function rotatePiece() {
    if (!gameRunning || gamePaused || gameOver) return;
    const rotated = rotateMatrix(currentPiece.shape);
    const originalShape = currentPiece.shape;
    currentPiece.shape = rotated;

    // 踢墙处理（简单版：左右微移）
    if (!isValidMove(currentPiece, board)) {
        // 尝试左移
        currentPiece.x--;
        if (!isValidMove(currentPiece, board)) {
            currentPiece.x += 2;
            if (!isValidMove(currentPiece, board)) {
                currentPiece.x--;
                currentPiece.shape = originalShape; // 恢复
            }
        }
    }
}

function hardDrop() {
    if (!gameRunning || gamePaused || gameOver) return;
    while (isValidMove(currentPiece, board, 0, 1)) {
        currentPiece.y++;
    }
    lockAndSpawn();
}

function togglePause() {
    if (!gameRunning || gameOver) return;
    gamePaused = !gamePaused;
    pauseOverlay.classList.toggle('hidden', !gamePaused);
    if (gamePaused) {
        clearInterval(dropInterval);
    } else {
        resetDropTimer();
    }
}

function lockAndSpawn() {
    lockPiece();
    clearLines();
    spawnNewPiece();

    if (!isValidMove(currentPiece, board)) {
        // 游戏结束
        gameOver = true;
        gameRunning = false;
        clearInterval(dropInterval);
        playGameOverSound();
        showGameOver();
    }
}

// ===== 生成新方块 =====
function spawnNewPiece() {
    currentPiece = nextPiece;
    const name = pieceBag.next();
    nextPiece = createPiece(name);
    currentPiece.x = Math.floor((COLS - currentPiece.shape[0].length) / 2);
    currentPiece.y = 0;
    drawNextPiece();
}

// ===== 计时器管理 =====
function resetDropTimer() {
    if (dropInterval) clearInterval(dropInterval);
    const speed = LEVEL_SPEEDS[Math.min(level - 1, LEVEL_SPEEDS.length - 1)];
    dropInterval = setInterval(() => {
        if (!gamePaused && !gameOver) {
            moveDown();
        }
    }, speed);
}

// ===== 渲染 =====

// 绘制网格背景
function drawGrid() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 0.5;

    for (let x = 0; x <= COLS; x++) {
        ctx.beginPath();
        ctx.moveTo(x * BLOCK_SIZE, 0);
        ctx.lineTo(x * BLOCK_SIZE, ROWS * BLOCK_SIZE);
        ctx.stroke();
    }

    for (let y = 0; y <= ROWS; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * BLOCK_SIZE);
        ctx.lineTo(COLS * BLOCK_SIZE, y * BLOCK_SIZE);
        ctx.stroke();
    }
}

// 绘制一个方块
function drawBlock(context, x, y, color, size = BLOCK_SIZE) {
    const padding = 1;
    context.fillStyle = color;
    context.fillRect(x * size + padding, y * size + padding, size - padding * 2, size - padding * 2);

    // 高光效果
    context.fillStyle = 'rgba(255, 255, 255, 0.2)';
    context.fillRect(x * size + padding, y * size + padding, size - padding * 2, 3);
    context.fillRect(x * size + padding, y * size + padding, 3, size - padding * 2);

    // 阴影效果
    context.fillStyle = 'rgba(0, 0, 0, 0.2)';
    context.fillRect(x * size + padding, (y + 1) * size - 3, size - padding * 2, 3);
    context.fillRect((x + 1) * size - 3, y * size + padding, 3, size - padding * 2);
}

// 绘制棋盘
function drawBoard() {
    ctx.clearRect(0, 0, COLS * BLOCK_SIZE, ROWS * BLOCK_SIZE);

    // 绘制已固定的方块
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (board[y][x] !== null) {
                drawBlock(ctx, x, y, board[y][x]);
            }
        }
    }

    // 绘制当前方块
    if (currentPiece && !gameOver) {
        const shape = currentPiece.shape;
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const boardX = currentPiece.x + x;
                    const boardY = currentPiece.y + y;
                    if (boardY >= 0) {
                        drawBlock(ctx, boardX, boardY, currentPiece.color);
                    }
                }
            }
        }

        // 绘制投影（落点预览）
        let ghostY = currentPiece.y;
        while (isValidMove(currentPiece, board, 0, ghostY - currentPiece.y + 1)) {
            ghostY++;
        }
        ctx.globalAlpha = 0.2;
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const boardX = currentPiece.x + x;
                    const boardY = ghostY + y;
                    if (boardY >= 0) {
                        drawBlock(ctx, boardX, boardY, currentPiece.color);
                    }
                }
            }
        }
        ctx.globalAlpha = 1.0;
    }

    drawGrid();
}

// 绘制下一个方块预览
function drawNextPiece() {
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    if (!nextPiece) return;

    const shape = nextPiece.shape;
    const size = shape.length;
    const blockSize = NEXT_BLOCK_SIZE;

    // 居中计算
    const offsetX = (nextCanvas.width - size * blockSize) / 2;
    const offsetY = (nextCanvas.height - size * blockSize) / 2;

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (shape[y][x]) {
                const padding = 1;
                nextCtx.fillStyle = nextPiece.color;
                nextCtx.fillRect(
                    offsetX + x * blockSize + padding,
                    offsetY + y * blockSize + padding,
                    blockSize - padding * 2,
                    blockSize - padding * 2
                );
                // 高光
                nextCtx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                nextCtx.fillRect(offsetX + x * blockSize + padding, offsetY + y * blockSize + padding, blockSize - padding * 2, 2);
                nextCtx.fillRect(offsetX + x * blockSize + padding, offsetY + y * blockSize + padding, 2, blockSize - padding * 2);
            }
        }
    }
}

// 更新信息面板
function updateInfo() {
    scoreEl.textContent = score;
    levelEl.textContent = level;
    linesEl.textContent = lines;
}

// 显示游戏结束
function showGameOver() {
    finalScoreEl.textContent = score;
    gameOverOverlay.classList.remove('hidden');

    // 检查最高分
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('tetrisHighScore', highScore);
        newRecordEl.classList.remove('hidden');
    } else {
        newRecordEl.classList.add('hidden');
    }
    menuHighScoreEl.textContent = highScore;
}

// ===== 游戏循环 =====
function gameLoop() {
    if (!gameRunning) return;
    drawBoard();
    animationId = requestAnimationFrame(gameLoop);
}

// ===== 游戏生命周期 =====

function startGame() {
    // 初始化
    board = createBoard();
    score = 0;
    level = 1;
    lines = 0;
    gameOver = false;
    gamePaused = false;
    gameRunning = true;

    // 隐藏覆盖层
    pauseOverlay.classList.add('hidden');
    gameOverOverlay.classList.add('hidden');

    // 初始化方块袋
    pieceBag = new PieceBag();

    // 生成初始方块
    const firstName = pieceBag.next();
    currentPiece = createPiece(firstName);
    const secondName = pieceBag.next();
    nextPiece = createPiece(secondName);

    // 更新UI
    updateInfo();
    drawNextPiece();

    // 切换屏幕
    mainMenu.classList.add('hidden');
    gameScreen.classList.remove('hidden');

    // 启动计时器和渲染循环
    resetDropTimer();
    if (animationId) cancelAnimationFrame(animationId);
    gameLoop();
}

function backToMenu() {
    gameRunning = false;
    gameOver = false;
    gamePaused = false;
    if (dropInterval) clearInterval(dropInterval);
    if (animationId) cancelAnimationFrame(animationId);

    gameScreen.classList.add('hidden');
    mainMenu.classList.remove('hidden');
    menuHighScoreEl.textContent = highScore;
}

// ===== 事件绑定 =====

// 键盘事件
document.addEventListener('keydown', (e) => {
    const key = e.key;

    // 防止页面滚动
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(key)) {
        e.preventDefault();
    }

    if (!gameRunning || gameOver) return;

    switch (key) {
        case 'ArrowLeft':
            moveLeft();
            break;
        case 'ArrowRight':
            moveRight();
            break;
        case 'ArrowDown':
            moveDown();
            break;
        case 'ArrowUp':
        case ' ':
            rotatePiece();
            break;
        case 'Enter':
            hardDrop();
            break;
        case 'p':
        case 'P':
        case 'Escape':
            togglePause();
            break;
    }
});

// 按钮事件
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
backToMenuBtn.addEventListener('click', backToMenu);

helpBtn.addEventListener('click', () => {
    helpModal.classList.remove('hidden');
});

closeHelp.addEventListener('click', () => {
    helpModal.classList.add('hidden');
});

helpModal.addEventListener('click', (e) => {
    if (e.target === helpModal) {
        helpModal.classList.add('hidden');
    }
});

// ===== 初始化 =====
function init() {
    initAudio();

    // 加载最高分
    const saved = localStorage.getItem('tetrisHighScore');
    highScore = saved ? parseInt(saved) : 0;
    menuHighScoreEl.textContent = highScore;

    // 绘制空棋盘
    drawBoard();
    drawNextPiece();
}

// 启动
init();
