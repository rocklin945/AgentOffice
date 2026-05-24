// 关卡配置
(function() {
    'use strict';

    // 关卡数据结构
    const LEVELS = {
        1: {
            name: '关卡 1 - 新手村',
            description: '学习基本操作',
            stars: {
                three: 3000,
                two: 2000,
                one: 1000
            },
            birds: 3,
            pigs: [
                { x: 800, y: 520, size: 'small' },
                { x: 850, y: 520, size: 'small' },
                { x: 825, y: 465, size: 'small' }
            ],
            structures: [
                { type: 'block', x: 825, y: 400, width: 150, height: 20, material: 'wood' },
                { type: 'block', x: 775, y: 360, width: 20, height: 60, material: 'wood' },
                { type: 'block', x: 875, y: 360, width: 20, height: 60, material: 'wood' }
            ],
            background: 'day'
        },
        2: {
            name: '关卡 2 - 石头堡垒',
            description: '利用石头弱点',
            stars: {
                three: 5000,
                two: 3500,
                one: 2000
            },
            birds: 4,
            pigs: [
                { x: 750, y: 520, size: 'small' },
                { x: 850, y: 520, size: 'small' },
                { x: 950, y: 520, size: 'small' },
                { x: 800, y: 465, size: 'medium' },
                { x: 900, y: 465, size: 'medium' }
            ],
            structures: [
                { type: 'block', x: 800, y: 400, width: 120, height: 20, material: 'stone' },
                { type: 'block', x: 900, y: 400, width: 120, height: 20, material: 'stone' },
                { type: 'block', x: 750, y: 350, width: 20, height: 80, material: 'stone' },
                { type: 'block', x: 950, y: 350, width: 20, height: 80, material: 'stone' },
                { type: 'block', x: 850, y: 300, width: 220, height: 20, material: 'wood' },
                { type: 'pig', x: 850, y: 265, size: 'small' }
            ],
            background: 'sunset'
        },
        3: {
            name: '关卡 3 - 终极挑战',
            description: '综合挑战所有技能',
            stars: {
                three: 8000,
                two: 5000,
                one: 3000
            },
            birds: 5,
            pigs: [
                { x: 700, y: 520, size: 'small' },
                { x: 800, y: 520, size: 'medium' },
                { x: 900, y: 520, size: 'large' },
                { x: 1000, y: 520, size: 'small' },
                { x: 850, y: 310, size: 'medium' }
            ],
            structures: [
                { type: 'block', x: 700, y: 450, width: 100, height: 20, material: 'wood' },
                { type: 'block', x: 800, y: 450, width: 100, height: 20, material: 'stone' },
                { type: 'block', x: 900, y: 450, width: 100, height: 20, material: 'wood' },
                { type: 'block', x: 1000, y: 450, width: 100, height: 20, material: 'stone' },
                { type: 'block', x: 700, y: 400, width: 20, height: 80, material: 'glass' },
                { type: 'block', x: 800, y: 400, width: 20, height: 80, material: 'wood' },
                { type: 'block', x: 900, y: 400, width: 20, height: 80, material: 'wood' },
                { type: 'block', x: 1000, y: 400, width: 20, height: 80, material: 'glass' },
                { type: 'block', x: 750, y: 350, width: 120, height: 20, material: 'stone' },
                { type: 'block', x: 950, y: 350, width: 120, height: 20, material: 'stone' }
            ],
            background: 'night'
        }
    };

    // 获取关卡配置
    function getLevelConfig(levelNum) {
        return LEVELS[levelNum] || LEVELS[1];
    }

    // 获取所有关卡列表
    function getAllLevels() {
        return Object.keys(LEVELS).map(num => ({
            number: parseInt(num),
            name: LEVELS[num].name,
            description: LEVELS[num].description,
            stars: LEVELS[num].stars
        }));
    }

    // 计算星星数量
    function calculateStars(levelNum, score) {
        const config = getLevelConfig(levelNum);
        if (score >= config.stars.three) return 3;
        if (score >= config.stars.two) return 2;
        if (score >= config.stars.one) return 1;
        return 0;
    }

    // 获取关卡总数
    function getTotalLevels() {
        return Object.keys(LEVELS).length;
    }

    // 导出
    window.LevelConfig = {
        LEVELS,
        getLevelConfig,
        getAllLevels,
        calculateStars,
        getTotalLevels
    };
})();