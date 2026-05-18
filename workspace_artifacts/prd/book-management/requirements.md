# 图书管理系统 - 产品需求文档 (PRD)

## 1. 项目概述

### 项目名称
图书管理系统（Book Management System）

### 项目类型
简易全栈演示项目

### 核心目标
验证前后端交互能力，最小化实现可运行的图书增删改查功能。

### 技术栈
- **前端**：HTML + 原生JavaScript（无框架）
- **后端**：SpringBoot（Java）
- **数据库**：MySQL
- **通信**：RESTful API + JSON

---

## 2. 功能需求

### 2.1 图书管理（CRUD）

| 操作 | 功能描述 |
|------|----------|
| 新增图书 | 添加图书信息（书名、作者、ISBN、价格） |
| 查询图书 | 列表展示所有图书，支持按书名搜索 |
| 编辑图书 | 修改已有图书信息 |
| 删除图书 | 删除指定图书记录 |

### 2.2 数据模型

**图书表 (books)**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键，自增 |
| title | VARCHAR(100) | 书名，必填 |
| author | VARCHAR(50) | 作者 |
| isbn | VARCHAR(20) | ISBN编号 |
| price | DECIMAL(10,2) | 价格 |
| create_time | DATETIME | 创建时间 |

---

## 3. 界面需求

### 3.1 页面结构

**单个HTML文件**，包含：
- 标题区域
- 添加图书表单
- 图书列表表格
- 搜索框

### 3.2 交互流程

1. 页面加载 → 自动请求后端API获取图书列表
2. 填写表单 → 提交POST请求添加图书
3. 点击编辑 → 弹出表单修改图书
4. 点击删除 → 确认后发送DELETE请求

---

## 4. API 设计

### 4.1 接口清单

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/books | 获取所有图书 |
| GET | /api/books/{id} | 获取单个图书 |
| POST | /api/books | 新增图书 |
| PUT | /api/books/{id} | 更新图书 |
| DELETE | /api/books/{id} | 删除图书 |

### 4.2 数据格式

**请求/响应体示例：**
```json
{
  "title": "Java编程思想",
  "author": "Bruce Eckel",
  "isbn": "978-7-111-21412-4",
  "price": 108.00
}
```

---

## 5. 非功能性需求

### 5.1 部署要求
- 后端运行端口：8080
- 前端直接用浏览器打开HTML文件即可访问
- 数据库：localhost:3306

### 5.2 最小化原则
- 不使用前端框架（Vue/React）
- 不使用ORM框架（MyBatis），直接用JDBC
- 不使用构建工具（Maven多模块），单项目结构
- 代码行数控制在200行以内

---

## 6. 项目结构

```
book-management/
├── code/
│   ├── frontend/
│   │   └── index.html
│   └── backend/
│       ├── src/main/java/com/example/book/
│       │   ├── BookApplication.java
│       │   ├── entity/Book.java
│       │   ├── repository/BookRepository.java
│       │   └── controller/BookController.java
│       ├── src/main/resources/
│       │   └── application.yml
│       └── pom.xml
├── prd/
│   └── requirements.md
└── deploy/
    └── docker-compose.yml
```

---

## 7. 验收标准

- [ ] 启动SpringBoot后端，访问 http://localhost:8080
- [ ] 打开 index.html 可以显示图书列表
- [ ] 可以成功添加、编辑、删除图书
- [ ] 数据正确持久化到MySQL数据库