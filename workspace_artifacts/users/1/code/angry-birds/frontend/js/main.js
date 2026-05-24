// 主程序入口
(function() {
    'use strict';

    const STORAGE_KEY = 'angry_birds_progress';
    const LEADERBOARD_KEY = 'angry_birds_leaderboard';

    let progress = loadProgress();
    let currentLevel = 1;

    document.addEventListener('DOMContentLoaded', function() {
        initUI();
        initEventListeners();
    });

    function initUI() {
        showScreen('start-screen');
    }

    function initEventListeners() {
        document.getElementById('start-btn').addEventListener('click', function() {
            currentLevel = 1;
            startGame();
        });

        document.getElementById('level-select-btn').addEventListener('click', function() {
            renderLevelCards();
            showScreen('level-select-screen');
        });

        // 关卡按钮
        document.querySelectorAll('.level-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                if (this.disabled) return;
                const level = parseInt(this.getAttribute('data-level'));
                currentLevel = level;
                startGame();
            });
        });

        document.getElementById('back-to-menu').addEventListener('click', function() {
            showScreen('start-screen');
        });

        document.getElementById('pause-btn').addEventListener('click', togglePause);

        document.getElementById('next-level-btn').addEventListener('click', function() {
            if (currentLevel < 3) {
                currentLevel++;
                startGame();
            } else {
                showScreen('start-screen');
            }
        });

        document.getElementById('replay-btn').addEventListener('click', function() {
            startGame();
        });

        document.getElementById('menu-btn').addEventListener('click', function() {
            showScreen('start-screen');
        });

        document.getElementById('retry-btn').addEventListener('click', function() {
            startGame();
        });

        document.getElementById('menu-btn-defeat').addEventListener('click', function() {
            showScreen('start-screen');
        });

        document.getElementById('leaderboard-btn-menu').addEventListener('click', openLeaderboard);
        document.getElementById('leaderboard-btn-victory').addEventListener('click', openLeaderboard);

        document.getElementById('sound-toggle').addEventListener('change', function() {
            if (window.AudioManager) window.AudioManager.soundEnabled = this.checked;
        });

        document.getElementById('music-toggle').addEventListener('change', function() {
            if (window.AudioManager) window.AudioManager.musicEnabled = this.checked;
        });
    }

    // 从 localStorage 加载进度
    function loadProgress() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) return JSON.parse(raw);
        } catch (e) {}
        return { unlockedLevel: 1, bestScores: {}, bestStars: {} };
    }

    function saveProgress() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    }

    // 渲染关卡卡片
    function renderLevelCards() {
        for (let i = 1; i <= 3; i++) {
            const btn = document.querySelector('.level-card[data-level="' + i + '"] .level-btn');
            const starsEl = document.getElementById('level-stars-' + i);
            const scoreEl = document.getElementById('level-score-' + i);

            const unlocked = i <= (progress.unlockedLevel || 1);
            if (btn) btn.disabled = !unlocked;

            const bestScore = progress.bestScores[i] || 0;
            const bestStars = progress.bestStars[i] || 0;

            if (starsEl) starsEl.textContent = '⭐'.repeat(bestStars) + '☆'.repeat(3 - bestStars);
            if (scoreEl) scoreEl.textContent = '最高分: ' + bestScore;
        }
    }

    function startGame() {
        if (!window.Game) {
            console.error('Game module not loaded!');
            return;
        }
        window.Game.initEngine();
        window.Game.loadLevel(currentLevel);
        window.Game.gameState = 'playing';
        showScreen('game-screen');
        if (window.Slingshot) window.Slingshot.init();
    }

    function togglePause() {
        if (!window.Game) return;
        window.Game.isPaused = !window.Game.isPaused;
        const pauseBtn = document.getElementById('pause-btn');
        if (window.Game.isPaused) {
            pauseBtn.textContent = '▶️ 继续';
            if (window.runner) Matter.Runner.stop(window.runner);
        } else {
            pauseBtn.textContent = '⏸️ 暂停';
            if (window.runner) Matter.Runner.run(window.runner, window.engine);
        }
    }

    function showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(function(screen) {
            screen.style.display = 'none';
        });
        const target = document.getElementById(screenId);
        if (target) target.style.display = 'flex';

        if (screenId === 'start-screen' || screenId === 'level-select-screen') {
            if (window.render) Matter.Render.stop(window.render);
            if (window.runner) Matter.Runner.stop(window.runner);
            if (window.engine) {
                Matter.World.clear(window.engine.world);
                Matter.Engine.clear(window.engine);
            }
            if (window.Game) window.Game.gameState = 'menu';
        }
    }

    // 提交分数并更新进度（纯 localStorage）
    window.submitVictory = function(score, stars) {
        progress.bestScores[currentLevel] = Math.max(progress.bestScores[currentLevel] || 0, score);
        progress.bestStars[currentLevel] = Math.max(progress.bestStars[currentLevel] || 0, stars);
        if (currentLevel >= progress.unlockedLevel && currentLevel < 3) {
            progress.unlockedLevel = currentLevel + 1;
        }
        saveProgress();

        // 保存到本地排行榜
        const records = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || '[]');
        records.push({
            level: currentLevel,
            score: score,
            stars: stars,
            playerName: '玩家',
            timestamp: Date.now()
        });
        localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(records));
    };

    // 打开排行榜（纯 localStorage）
    function openLeaderboard() {
        const modal = document.getElementById('leaderboard-modal');
        const content = document.getElementById('leaderboard-content');
        modal.style.display = 'block';

        const records = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || '[]');
        const list = records
            .sort(function(a, b) { return b.score - a.score; })
            .slice(0, 10);

        if (list.length === 0) {
            content.innerHTML = '<div style="text-align:center;padding:20px;color:#999;">暂无记录</div>';
        } else {
            let html = '';
            list.forEach(function(item, idx) {
                html += '<div class="leaderboard-row">' +
                    '<span class="rank">#' + (idx + 1) + '</span>' +
                    '<span class="name">' + (item.playerName || '玩家') + '</span>' +
                    '<span>关卡' + item.level + '</span>' +
                    '<span class="score-val">' + item.score + '</span>' +
                    '</div>';
            });
            content.innerHTML = html;
        }
    }

    document.addEventListener('keydown', function(e) {
        if (e.code === 'Escape') {
            if (window.Game && window.Game.gameState !== 'menu') {
                showScreen('start-screen');
            }
        } else if (e.code === 'KeyP') {
            if (window.Game && window.Game.gameState === 'playing') {
                togglePause();
            }
        }
    });

    window.Main = {
        startGame: startGame,
        showScreen: showScreen,
        togglePause: togglePause,
        loadProgress: loadProgress
    };
})();