CREATE TABLE IF NOT EXISTS portfolio_items (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(60),
  image VARCHAR(500),
  url VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  post_date DATE NOT NULL,
  summary TEXT,
  content LONGTEXT,
  tags VARCHAR(500),
  category VARCHAR(60)
);

CREATE TABLE IF NOT EXISTS contact_forms (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL,
  subject VARCHAR(200),
  message TEXT NOT NULL,
  submitted_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS app_settings (
  name VARCHAR(80) PRIMARY KEY,
  value VARCHAR(200) NOT NULL
);

INSERT INTO portfolio_items (title, description, category, image, url)
SELECT '电商平台重构', '使用微服务架构重构电商平台，提升系统可用性和扩展性', 'web', 'images/portfolio-1.jpg', 'https://example.com/ecommerce'
WHERE NOT EXISTS (SELECT 1 FROM portfolio_items);

INSERT INTO portfolio_items (title, description, category, image, url)
SELECT '移动端健身 App', 'React Native 跨平台健身追踪应用', 'mobile', 'images/portfolio-2.jpg', 'https://example.com/fitness'
WHERE (SELECT COUNT(*) FROM portfolio_items) < 2;

INSERT INTO portfolio_items (title, description, category, image, url)
SELECT '品牌官网设计', '为初创企业设计的品牌展示官网', 'design', 'images/portfolio-3.jpg', 'https://example.com/brand'
WHERE (SELECT COUNT(*) FROM portfolio_items) < 3;

INSERT INTO blog_posts (title, post_date, summary, content, tags, category)
SELECT 'Spring Boot 最佳实践', '2024-06-15', '分享 Spring Boot 项目开发中的经验和最佳实践', 'Spring Boot 是 Java 生态中常用的后端框架。', 'Java,Spring Boot,后端', '技术'
WHERE NOT EXISTS (SELECT 1 FROM blog_posts);

INSERT INTO blog_posts (title, post_date, summary, content, tags, category)
SELECT '前端性能优化指南', '2024-05-20', '从图片加载、代码分割、缓存策略等方面提升前端性能', '首屏加载时间直接影响用户体验和转化率。', '前端,性能优化,JavaScript', '技术'
WHERE (SELECT COUNT(*) FROM blog_posts) < 2;

INSERT INTO app_settings (name, value)
SELECT 'theme', 'light'
WHERE NOT EXISTS (SELECT 1 FROM app_settings WHERE name = 'theme');
