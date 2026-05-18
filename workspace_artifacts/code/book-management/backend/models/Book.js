/**
 * Book 模型
 * 处理图书的数据库操作
 */

const db = require('../config/database');

class Book {
  /**
   * 获取所有图书
   */
  static findAll() {
    return db.prepare('SELECT * FROM books ORDER BY created_at DESC').all();
  }

  /**
   * 根据 ID 获取图书
   */
  static findById(id) {
    return db.prepare('SELECT * FROM books WHERE id = ?').get(id);
  }

  /**
   * 根据书名搜索图书
   */
  static findByTitle(title) {
    return db.prepare('SELECT * FROM books WHERE title LIKE ? ORDER BY created_at DESC')
      .all(`%${title}%`);
  }

  /**
   * 创建图书
   */
  static create(book) {
    const { title, author, price, description } = book;
    const result = db.prepare(`
      INSERT INTO books (title, author, price, description)
      VALUES (?, ?, ?, ?)
    `).run(title, author, price, description);
    
    return this.findById(result.lastInsertRowid);
  }

  /**
   * 更新图书
   */
  static update(id, book) {
    const { title, author, price, description } = book;
    db.prepare(`
      UPDATE books 
      SET title = ?, author = ?, price = ?, description = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(title, author, price, description);
    
    return this.findById(id);
  }

  /**
   * 删除图书
   */
  static delete(id) {
    return db.prepare('DELETE FROM books WHERE id = ?').run(id);
  }
}

module.exports = Book;