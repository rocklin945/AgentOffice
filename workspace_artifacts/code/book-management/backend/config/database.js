/**
 * 数据库配置
 * 使用 better-sqlite3（同步 API，更适合小项目）
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// 确保 data 目录存在
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'books.db');
const db = new Database(dbPath);

// 启用 WAL 模式（提升并发性能）
db.pragma('journal_mode = WAL');

// 初始化数据库
function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT DEFAULT '',
      price REAL DEFAULT 0,
      description TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 检查是否需要插入示例数据
  const count = db.prepare('SELECT COUNT(*) as count FROM books').get();
  if (count.count === 0) {
    console.log('📚 正在初始化示例数据...');
    initSampleData();
  }
}

// 插入示例数据
function initSampleData() {
  const insert = db.prepare(`
    INSERT INTO books (title, author, price, description)
    VALUES (@title, @author, @price, @description)
  `);

  const sampleBooks = [
    { title: 'JavaScript高级程序设计', author: 'Nicholas C. Zakas', price: 119.00, description: 'JS经典著作，涵盖ES6+新特性' },
    { title: '深入理解计算机系统', author: 'Randal E. Bryant', price: 139.00, description: 'CSAPP，程序员必读' },
    { title: '算法导论', author: 'Thomas H. Cormen', price: 128.00, description: '算法领域经典教材' },
    { title: 'Python编程：从入门到实践', author: 'Eric Matthes', price: 79.00, description: 'Python入门经典' },
    { title: 'Effective Java', author: 'Joshua Bloch', price: 99.00, description: 'Java最佳实践指南' }
  ];

  const insertMany = db.transaction((books) => {
    for (const book of books) {
      insert.run(book);
    }
  });

  insertMany(sampleBooks);
  console.log('✅ 示例数据初始化完成');
}

// 启动时初始化
initDatabase();

module.exports = db;