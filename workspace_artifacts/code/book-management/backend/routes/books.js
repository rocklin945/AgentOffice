/**
 * 图书管理路由
 * 提供图书的 CRUD 接口
 */

const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

// ========== 获取所有图书 ==========
// GET /api/books
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    let books;

    if (search) {
      // 搜索书名
      books = await Book.findByTitle(search);
    } else {
      // 获取所有图书
      books = await Book.findAll();
    }

    // 分页处理
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedBooks = books.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedBooks,
      total: books.length,
      page: parseInt(page),
      totalPages: Math.ceil(books.length / limit)
    });
  } catch (err) {
    console.error('获取图书列表失败:', err);
    res.status(500).json({ success: false, error: '获取图书列表失败' });
  }
});

// ========== 获取单个图书 ==========
// GET /api/books/:id
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ success: false, error: '图书不存在' });
    }

    res.json({ success: true, data: book });
  } catch (err) {
    console.error('获取图书详情失败:', err);
    res.status(500).json({ success: false, error: '获取图书详情失败' });
  }
});

// ========== 创建图书 ==========
// POST /api/books
router.post('/', async (req, res) => {
  try {
    const { title, author, price, description } = req.body;

    // 验证必填字段
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: '书名不能为空' });
    }

    // 验证价格
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ success: false, error: '价格必须是大于等于0的数字' });
    }

    const newBook = await Book.create({ 
      title: title.trim(), 
      author: author?.trim() || '', 
      price: parsedPrice, 
      description: description?.trim() || '' 
    });

    res.status(201).json({ success: true, data: newBook });
  } catch (err) {
    console.error('创建图书失败:', err);
    res.status(500).json({ success: false, error: '创建图书失败' });
  }
});

// ========== 更新图书 ==========
// PUT /api/books/:id
router.put('/:id', async (req, res) => {
  try {
    const { title, author, price, description } = req.body;
    
    // 验证图书是否存在
    const existingBook = await Book.findById(req.params.id);
    if (!existingBook) {
      return res.status(404).json({ success: false, error: '图书不存在' });
    }

    // 验证必填字段
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: '书名不能为空' });
    }

    // 验证价格
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ success: false, error: '价格必须是大于等于0的数字' });
    }

    const updatedBook = await Book.update(req.params.id, {
      title: title.trim(),
      author: author?.trim() || '',
      price: parsedPrice,
      description: description?.trim() || ''
    });

    res.json({ success: true, data: updatedBook });
  } catch (err) {
    console.error('更新图书失败:', err);
    res.status(500).json({ success: false, error: '更新图书失败' });
  }
});

// ========== 删除图书 ==========
// DELETE /api/books/:id
router.delete('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ success: false, error: '图书不存在' });
    }

    await Book.delete(req.params.id);
    res.json({ success: true, message: '图书删除成功' });
  } catch (err) {
    console.error('删除图书失败:', err);
    res.status(500).json({ success: false, error: '删除图书失败' });
  }
});

module.exports = router;