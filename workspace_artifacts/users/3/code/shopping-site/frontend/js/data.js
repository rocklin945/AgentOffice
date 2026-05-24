// ========================================
// SimpleShop - 商品数据
// ========================================

const productsData = [
    {
        id: 'prod001',
        name: 'iPhone 15 Pro Max 256GB',
        price: 8999,
        originalPrice: 9999,
        image: 'https://picsum.photos/400/400?random=1',
        category: 'electronics',
        description: '苹果最新款旗舰手机，搭载A17 Pro芯片，钛金属设计，全新相机系统，支持ProRes视频拍摄。',
        stock: 100,
        rating: 5
    },
    {
        id: 'prod002',
        name: 'MacBook Pro 14英寸 M3 Pro',
        price: 16999,
        originalPrice: 18999,
        image: 'https://picsum.photos/400/400?random=2',
        category: 'electronics',
        description: '搭载M3 Pro芯片，14英寸Liquid视网膜XDR显示屏，支持长达17小时电池续航。',
        stock: 50,
        rating: 5
    },
    {
        id: 'prod003',
        name: 'AirPods Pro 第二代',
        price: 1799,
        originalPrice: 1999,
        image: 'https://picsum.photos/400/400?random=3',
        category: 'electronics',
        description: '主动降噪，自适应音频，个性化空间音频，MagSafe充电盒，续航可达30小时。',
        stock: 200,
        rating: 4
    },
    {
        id: 'prod004',
        name: 'Sony WH-1000XM5 头戴式耳机',
        price: 2299,
        originalPrice: 2699,
        image: 'https://picsum.photos/400/400?random=4',
        category: 'electronics',
        description: '行业领先降噪效果，30小时续航，支持Hi-Res音频，自动降噪优化器。',
        stock: 80,
        rating: 5
    },
    {
        id: 'prod005',
        name: 'Nike Air Max 270 运动鞋',
        price: 799,
        originalPrice: 999,
        image: 'https://picsum.photos/400/400?random=5',
        category: 'clothing',
        description: '采用Air Max气垫技术，舒适缓震，透气网面设计，适合日常运动和休闲穿着。',
        stock: 150,
        rating: 4
    },
    {
        id: 'prod006',
        name: 'Adidas Originals 三叶草卫衣',
        price: 599,
        originalPrice: 699,
        image: 'https://picsum.photos/400/400?random=6',
        category: 'clothing',
        description: '经典三叶草Logo，舒适棉质面料，宽松版型，百搭时尚。',
        stock: 120,
        rating: 4
    },
    {
        id: 'prod007',
        name: ' Levi\'s 501 经典牛仔裤',
        price: 459,
        originalPrice: 599,
        image: 'https://picsum.photos/400/400?random=7',
        category: 'clothing',
        description: '经典直筒版型，100%纯棉材质，舒适耐穿，永不过时的时尚单品。',
        stock: 100,
        rating: 5
    },
    {
        id: 'prod008',
        name: '北欧风实木餐桌 1.4米',
        price: 1299,
        originalPrice: 1599,
        image: 'https://picsum.photos/400/400?random=8',
        category: 'home',
        description: '精选白橡木框架，环保水性漆，可容纳4-6人，简约北欧风格。',
        stock: 30,
        rating: 4
    },
    {
        id: 'prod009',
        name: 'IKEA MALM 马尔姆六斗柜',
        price: 799,
        originalPrice: 999,
        image: 'https://picsum.photos/400/400?random=9',
        category: 'home',
        description: '简约设计，多层储物空间，易于清洁，适合卧室或走廊使用。',
        stock: 45,
        rating: 4
    },
    {
        id: 'prod010',
        name: '小米米家空气净化器4 Pro',
        price: 1299,
        originalPrice: 1499,
        image: 'https://picsum.photos/400/400?random=10',
        category: 'home',
        description: '高效净化，甲醛去除，智能联动，LED显示屏，适用面积60㎡。',
        stock: 60,
        rating: 4
    },
    {
        id: 'prod011',
        name: '《活着》余华 著',
        price: 29,
        originalPrice: 35,
        image: 'https://picsum.photos/400/400?random=11',
        category: 'books',
        description: '茅盾文学奖得主余华代表作，讲述普通人福贵的人生起伏，感动无数读者。',
        stock: 500,
        rating: 5
    },
    {
        id: 'prod012',
        name: '《人类简史》尤瓦尔·赫拉利',
        price: 68,
        originalPrice: 88,
        image: 'https://picsum.photos/400/400?random=12',
        category: 'books',
        description: '从动物到上帝，宏观讲述人类发展史，引发对人类未来的深度思考。',
        stock: 300,
        rating: 5
    },
    {
        id: 'prod013',
        name: 'SONY PS5 游戏主机',
        price: 3899,
        originalPrice: 4299,
        image: 'https://picsum.photos/400/400?random=13',
        category: 'electronics',
        description: '次世代游戏主机，支持4K游戏，HDR技术，快速加载，沉浸式体验。',
        stock: 40,
        rating: 5
    },
    {
        id: 'prod014',
        name: 'SK-II 护肤精华露 230ml',
        price: 899,
        originalPrice: 1099,
        image: 'https://picsum.photos/400/400?random=14',
        category: 'beauty',
        description: '神仙水明星产品，改善肌肤屏障，平衡水油，焕发肌肤光泽。',
        stock: 100,
        rating: 5
    },
    {
        id: 'prod015',
        name: 'La Mer 海蓝之谜面霜 60ml',
        price: 2180,
        originalPrice: 2680,
        image: 'https://picsum.photos/400/400?random=15',
        category: 'beauty',
        description: '经典精华面霜，深层滋养，修护肌肤，延缓衰老，肌肤焕发年轻光彩。',
        stock: 50,
        rating: 5
    },
    {
        id: 'prod016',
        name: '戴森V15 Detect吸尘器',
        price: 4999,
        originalPrice: 5499,
        image: 'https://picsum.photos/400/400?random=16',
        category: 'home',
        description: '智能感应，激光探测微尘，LCD屏幕实时显示，60分钟续航。',
        stock: 35,
        rating: 5
    }
];

// 分类名称映射
const categoryNames = {
    'electronics': '数码电子',
    'clothing': '服装鞋帽',
    'home': '家居生活',
    'books': '图书音像',
    'beauty': '美妆护肤'
};