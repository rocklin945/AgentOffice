// 音频管理器
(function() {
    'use strict';

    // 音频管理器对象
    const AudioManager = {
        soundEnabled: true,
        musicEnabled: true,
        sounds: {},
        music: {},
        audioContext: null,
        masterVolume: 0.5
    };

    // 初始化音频上下文
    function initAudioContext() {
        if (!AudioManager.audioContext) {
            AudioManager.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        return AudioManager.audioContext;
    }

    // 播放音效
    function playSound(type) {
        if (!AudioManager.soundEnabled) return;

        try {
            const ctx = initAudioContext();
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            switch (type) {
                case 'launch':
                    // 发射音效 - 弹射声
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(400, ctx.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.2);
                    gainNode.gain.setValueAtTime(0.3 * AudioManager.masterVolume, ctx.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
                    break;

                case 'impact':
                    // 撞击音效
                    oscillator.type = 'square';
                    oscillator.frequency.setValueAtTime(150, ctx.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.15);
                    gainNode.gain.setValueAtTime(0.2 * AudioManager.masterVolume, ctx.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
                    break;

                case 'pig':
                    // 猪猪死亡音效
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(500, ctx.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
                    gainNode.gain.setValueAtTime(0.4 * AudioManager.masterVolume, ctx.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
                    break;

                case 'wood_break':
                    // 木块破碎
                    oscillator.type = 'sawtooth';
                    oscillator.frequency.setValueAtTime(200, ctx.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.1);
                    gainNode.gain.setValueAtTime(0.15 * AudioManager.masterVolume, ctx.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
                    break;

                case 'stone_break':
                    // 石块破碎
                    oscillator.type = 'square';
                    oscillator.frequency.setValueAtTime(100, ctx.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.15);
                    gainNode.gain.setValueAtTime(0.2 * AudioManager.masterVolume, ctx.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
                    break;

                case 'glass_break':
                    // 玻璃破碎
                    oscillator.type = 'sawtooth';
                    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.08);
                    gainNode.gain.setValueAtTime(0.15 * AudioManager.masterVolume, ctx.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
                    break;

                case 'victory':
                    // 胜利音效 - 上升音阶
                    playMelody([523, 659, 784, 1047], 0.15);
                    return;

                case 'defeat':
                    // 失败音效 - 下降音阶
                    playMelody([400, 300, 200, 100], 0.2);
                    return;

                case 'bird_speed':
                    // 黄鸟加速
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(600, ctx.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
                    gainNode.gain.setValueAtTime(0.3 * AudioManager.masterVolume, ctx.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
                    break;

                case 'bird_split':
                    // 蓝鸟分裂
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(400, ctx.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.05);
                    oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
                    gainNode.gain.setValueAtTime(0.25 * AudioManager.masterVolume, ctx.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
                    break;

                case 'click':
                    // 按钮点击
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
                    gainNode.gain.setValueAtTime(0.1 * AudioManager.masterVolume, ctx.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
                    break;

                default:
                    oscillator.frequency.value = 440;
                    gainNode.gain.setValueAtTime(0.2 * AudioManager.masterVolume, ctx.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
            }

            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.5);

        } catch (e) {
            console.warn('Audio playback not supported:', e);
        }
    }

    // 播放旋律
    function playMelody(notes, duration) {
        try {
            const ctx = initAudioContext();
            
            notes.forEach((freq, index) => {
                const oscillator = ctx.createOscillator();
                const gainNode = ctx.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(ctx.destination);

                oscillator.type = 'sine';
                oscillator.frequency.value = freq;

                const startTime = ctx.currentTime + index * duration;
                gainNode.gain.setValueAtTime(0, startTime);
                gainNode.gain.linearRampToValueAtTime(0.2 * AudioManager.masterVolume, startTime + 0.02);
                gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

                oscillator.start(startTime);
                oscillator.stop(startTime + duration);
            });
        } catch (e) {
            console.warn('Audio playback not supported:', e);
        }
    }

    // 播放背景音乐
    function playMusic(track) {
        if (!AudioManager.musicEnabled) return;
        
        // 简化实现：使用简单的循环音调作为背景音乐
        // 实际项目中应该加载音频文件
        console.log('Background music would play here:', track);
    }

    // 停止背景音乐
    function stopMusic() {
        if (AudioManager.musicSource) {
            AudioManager.musicSource.stop();
            AudioManager.musicSource = null;
        }
    }

    // 设置主音量
    function setMasterVolume(volume) {
        AudioManager.masterVolume = Math.max(0, Math.min(1, volume));
    }

    // 切换音效
    function toggleSound() {
        AudioManager.soundEnabled = !AudioManager.soundEnabled;
        return AudioManager.soundEnabled;
    }

    // 切换音乐
    function toggleMusic() {
        AudioManager.musicEnabled = !AudioManager.musicEnabled;
        if (!AudioManager.musicEnabled) {
            stopMusic();
        }
        return AudioManager.musicEnabled;
    }

    // 导出到全局
    window.AudioManager = AudioManager;
    AudioManager.playSound = playSound;
    AudioManager.playMusic = playMusic;
    AudioManager.stopMusic = stopMusic;
    AudioManager.setMasterVolume = setMasterVolume;
    AudioManager.toggleSound = toggleSound;
    AudioManager.toggleMusic = toggleMusic;

})();