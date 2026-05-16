DROP DATABASE IF EXISTS agent_office;
CREATE DATABASE IF NOT EXISTS agent_office DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE agent_office;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS chat_message;
DROP TABLE IF EXISTS chat_session;
DROP TABLE IF EXISTS operation_log;
DROP TABLE IF EXISTS notification_message;
DROP TABLE IF EXISTS system_config;
DROP TABLE IF EXISTS deploy_service;
DROP TABLE IF EXISTS dev_file;
DROP TABLE IF EXISTS dev_project;
DROP TABLE IF EXISTS task_step;
DROP TABLE IF EXISTS work_product;
DROP TABLE IF EXISTS employee_permission;
DROP TABLE IF EXISTS task_info;
DROP TABLE IF EXISTS office_desk;
DROP TABLE IF EXISTS agent_employee;
DROP TABLE IF EXISTS sys_user;

CREATE TABLE sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    username VARCHAR(50) NOT NULL COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码',
    nickname VARCHAR(50) DEFAULT NULL COMMENT '昵称',
    avatar VARCHAR(255) DEFAULT NULL COMMENT '头像 URL',
    email VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
    role VARCHAR(20) DEFAULT 'user' COMMENT 'role user/admin',
    phone VARCHAR(20) DEFAULT NULL COMMENT '手机号',
    status TINYINT DEFAULT 1 COMMENT '状态: 0 禁用, 1 正常',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_username (username),
    KEY idx_status (status),
    KEY idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

CREATE TABLE agent_employee (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    name VARCHAR(50) NOT NULL COMMENT '员工姓名',
    avatar VARCHAR(255) DEFAULT NULL COMMENT '头像 URL',
    role VARCHAR(50) NOT NULL COMMENT '角色',
    position VARCHAR(50) DEFAULT NULL COMMENT '职位',
    status VARCHAR(20) DEFAULT '空闲' COMMENT '状态',
    task_count INT DEFAULT 0 COMMENT '任务数',
    efficiency DECIMAL(5,2) DEFAULT 0.00 COMMENT '效率百分比',
    desk_id BIGINT DEFAULT NULL COMMENT '工位 ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    KEY idx_status (status),
    KEY idx_role (role),
    KEY idx_desk_id (desk_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='员工表';

CREATE TABLE employee_permission (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    employee_id BIGINT NOT NULL COMMENT '员工 ID',
    permission_code VARCHAR(50) NOT NULL COMMENT '权限编码',
    permission_name VARCHAR(50) NOT NULL COMMENT '权限名称',
    enabled TINYINT DEFAULT 1 COMMENT '是否启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    KEY idx_employee_id (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='员工工作权限表';

CREATE TABLE office_desk (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    desk_code VARCHAR(20) NOT NULL COMMENT '工位编号',
    row_num INT NOT NULL COMMENT '排号',
    col_num INT NOT NULL COMMENT '列号',
    employee_id BIGINT DEFAULT NULL COMMENT '员工 ID',
    status TINYINT DEFAULT 0 COMMENT '状态: 0 空闲, 1 占用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY uk_desk_code (desk_code),
    KEY idx_employee_id (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工位表';

CREATE TABLE task_info (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    task_name VARCHAR(100) NOT NULL COMMENT '任务名称',
    task_type VARCHAR(30) DEFAULT 'custom' COMMENT '任务类型',
    description TEXT COMMENT '任务描述',
    priority VARCHAR(20) DEFAULT '中' COMMENT '优先级',
    executor_id BIGINT DEFAULT NULL COMMENT '执行人 ID',
    status VARCHAR(20) DEFAULT '待分配' COMMENT '状态',
    progress INT DEFAULT 0 COMMENT '进度',
    create_user BIGINT DEFAULT NULL COMMENT '创建人',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    end_time DATETIME DEFAULT NULL COMMENT '结束时间',
    KEY idx_executor_id (executor_id),
    KEY idx_status (status),
    KEY idx_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务表';

CREATE TABLE task_step (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    task_id BIGINT NOT NULL COMMENT '任务 ID',
    step_name VARCHAR(100) NOT NULL COMMENT '步骤名称',
    step_order INT NOT NULL COMMENT '步骤顺序',
    status VARCHAR(20) DEFAULT '待处理' COMMENT '状态',
    complete_time DATETIME DEFAULT NULL COMMENT '完成时间',
    KEY idx_task_id (task_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务步骤表';

CREATE TABLE work_product (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    employee_id BIGINT NOT NULL COMMENT '员工 ID',
    task_id BIGINT DEFAULT NULL COMMENT '任务 ID',
    name VARCHAR(120) NOT NULL COMMENT '产物名称',
    product_type VARCHAR(30) DEFAULT NULL COMMENT '产物类型',
    status VARCHAR(20) DEFAULT '进行中' COMMENT '状态',
    file_url VARCHAR(500) DEFAULT NULL COMMENT '文件地址',
    content LONGTEXT COMMENT '产物正文',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    KEY idx_employee_id (employee_id),
    KEY idx_task_id (task_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工作产物表';

CREATE TABLE dev_project (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    project_name VARCHAR(100) NOT NULL COMMENT '项目名称',
    description TEXT COMMENT '项目描述',
    language VARCHAR(20) DEFAULT 'java' COMMENT '语言类型',
    owner_id BIGINT DEFAULT NULL COMMENT '负责人',
    status TINYINT DEFAULT 1 COMMENT '状态: 0 禁用, 1 正常',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    KEY idx_owner_id (owner_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目表';

CREATE TABLE dev_file (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    project_id BIGINT NOT NULL COMMENT '项目 ID',
    file_name VARCHAR(255) NOT NULL COMMENT '文件名',
    file_path VARCHAR(500) NOT NULL COMMENT '文件路径',
    file_type VARCHAR(20) DEFAULT NULL COMMENT '文件类型',
    parent_id BIGINT DEFAULT NULL COMMENT '父目录 ID',
    is_directory TINYINT DEFAULT 0 COMMENT '是否目录',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    KEY idx_project_id (project_id),
    KEY idx_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文件表';

CREATE TABLE deploy_service (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    service_name VARCHAR(100) NOT NULL COMMENT '服务名称',
    image VARCHAR(255) DEFAULT NULL COMMENT '镜像',
    version VARCHAR(50) DEFAULT NULL COMMENT '版本',
    status VARCHAR(20) DEFAULT '已停止' COMMENT '状态',
    port INT DEFAULT NULL COMMENT '端口',
    container_id VARCHAR(100) DEFAULT NULL COMMENT '容器 ID',
    cpu_usage DECIMAL(5,2) DEFAULT 0.00 COMMENT 'CPU 使用率',
    memory_usage DECIMAL(5,2) DEFAULT 0.00 COMMENT '内存使用率',
    running_time BIGINT DEFAULT 0 COMMENT '运行时长',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='部署服务表';

CREATE TABLE operation_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    user_id BIGINT DEFAULT NULL COMMENT '用户 ID',
    action VARCHAR(50) DEFAULT NULL COMMENT '操作类型',
    target_type VARCHAR(50) DEFAULT NULL COMMENT '目标类型',
    target_id BIGINT DEFAULT NULL COMMENT '目标 ID',
    detail TEXT COMMENT '详情',
    ip_address VARCHAR(50) DEFAULT NULL COMMENT 'IP 地址',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    KEY idx_user_id (user_id),
    KEY idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

CREATE TABLE notification_message (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    user_id BIGINT DEFAULT NULL COMMENT '用户 ID，NULL 表示全局消息',
    category VARCHAR(30) NOT NULL DEFAULT 'system' COMMENT '消息分类 task/test/deploy/system',
    title VARCHAR(120) NOT NULL COMMENT '标题',
    content VARCHAR(500) NOT NULL COMMENT '内容',
    source_type VARCHAR(50) DEFAULT NULL COMMENT '来源类型',
    source_id BIGINT DEFAULT NULL COMMENT '来源 ID',
    read_status TINYINT DEFAULT 0 COMMENT '是否已读 0/1',
    priority VARCHAR(20) DEFAULT 'normal' COMMENT '优先级 normal/high',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    KEY idx_user_id (user_id),
    KEY idx_category (category),
    KEY idx_read_status (read_status),
    KEY idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='通知消息表';

CREATE TABLE system_config (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    config_key VARCHAR(50) NOT NULL COMMENT '配置键',
    config_label VARCHAR(50) NOT NULL COMMENT '配置名称',
    config_desc VARCHAR(255) DEFAULT NULL COMMENT '配置描述',
    config_value VARCHAR(50) NOT NULL DEFAULT 'false' COMMENT '配置值',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_config_key (config_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统设置表';

CREATE TABLE chat_session (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    session_id VARCHAR(100) NOT NULL COMMENT '会话 ID',
    user_id BIGINT DEFAULT NULL COMMENT '用户 ID',
    agent_id BIGINT DEFAULT NULL COMMENT 'Agent ID',
    session_type VARCHAR(30) DEFAULT 'collaboration' COMMENT 'session type',
    title VARCHAR(120) DEFAULT NULL COMMENT 'title',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_session_id (session_id),
    KEY idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会话表';

CREATE TABLE chat_message (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    session_id BIGINT NOT NULL COMMENT '会话 ID',
    role VARCHAR(20) NOT NULL COMMENT '角色',
    sender VARCHAR(50) DEFAULT NULL COMMENT 'sender',
    employee_id BIGINT DEFAULT NULL COMMENT 'employee id',
    content TEXT COMMENT '内容',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    KEY idx_session_id (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='消息表';

INSERT INTO sys_user (username, password, nickname, email, role, status) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '管理员', 'admin@agent.com', 'admin', 1);

INSERT INTO office_desk (desk_code, row_num, col_num, status) VALUES
('A1', 1, 1, 1), ('A2', 1, 2, 1), ('A3', 1, 3, 1), ('A4', 1, 4, 1),
('B1', 2, 1, 0), ('B2', 2, 2, 0), ('B3', 2, 3, 0), ('B4', 2, 4, 0),
('C1', 3, 1, 0), ('C2', 3, 2, 0), ('C3', 3, 3, 0), ('C4', 3, 4, 0);

INSERT INTO agent_employee (name, avatar, role, position, status, task_count, efficiency, desk_id) VALUES
('Alex', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', '开发工程师', '后端开发', '工作中', 5, 92.50, 1),
('TestBot', 'https://api.dicebear.com/7.x/avataaars/svg?seed=TestBot', '测试工程师', '自动化测试', '思考中', 3, 88.00, 2),
('OpsMaster', 'https://api.dicebear.com/7.x/avataaars/svg?seed=OpsMaster', '运维工程师', '容器运维', '部署中', 2, 95.00, 3),
('ProductKing', 'https://api.dicebear.com/7.x/avataaars/svg?seed=ProductKing', '产品经理', '产品负责人', '在线', 4, 90.00, 4);

UPDATE office_desk SET employee_id = 1 WHERE id = 1;
UPDATE office_desk SET employee_id = 2 WHERE id = 2;
UPDATE office_desk SET employee_id = 3 WHERE id = 3;
UPDATE office_desk SET employee_id = 4 WHERE id = 4;

INSERT INTO employee_permission (employee_id, permission_code, permission_name, enabled) VALUES
(1, 'task.view', '查看任务', 1), (1, 'task.execute', '执行任务', 1), (1, 'dev.code', '代码开发', 1),
(2, 'task.view', '查看任务', 1), (2, 'test.run', '执行测试', 1), (2, 'report.write', '输出报告', 1),
(3, 'task.view', '查看任务', 1), (3, 'deploy.manage', '部署服务', 1), (3, 'log.view', '查看日志', 1),
(4, 'task.view', '查看任务', 1), (4, 'product.plan', '产品规划', 1), (4, 'task.assign', '任务拆解', 1);

INSERT INTO task_info (task_name, task_type, description, priority, executor_id, status, progress, create_user) VALUES
('用户登录功能开发', 'development', '实现用户登录注册和 JWT 鉴权能力', '高', 1, '进行中', 60, 1),
('接口性能优化', 'development', '优化核心接口响应时间', '中', 1, '已完成', 100, 1),
('自动化测试用例编写', 'testing', '编写核心业务回归测试用例', '中', 2, '进行中', 30, 1),
('CI/CD 流程搭建', 'deployment', '搭建持续集成和部署流程', '高', 3, '待分配', 0, 1),
('数据库索引优化', 'development', '优化慢查询 SQL', '低', NULL, '已失败', 0, 1);

INSERT INTO task_step (task_id, step_name, step_order, status, complete_time) VALUES
(1, '需求分析', 1, '已完成', NOW()),
(1, '接口设计', 2, '已完成', NOW()),
(1, '代码开发', 3, '进行中', NULL),
(1, '测试验证', 4, '待处理', NULL),
(1, '部署上线', 5, '待处理', NULL);

INSERT INTO work_product (employee_id, task_id, name, product_type, status, file_url, content) VALUES
(1, 1, '登录接口实现代码', '代码', '进行中', '/products/login-api-code', '登录接口代码已进入开发中，当前完成 JWT 鉴权入口和用户校验逻辑。'),
(1, 2, '接口性能优化报告', '报告', '已完成', '/products/performance-report', '接口性能优化完成：慢查询已增加索引，核心接口响应时间下降。'),
(2, 3, '自动化测试用例清单', '测试用例', '进行中', '/products/login-test-cases', '已覆盖登录成功、密码错误、Token 过期和权限不足场景。'),
(3, 4, 'CI/CD 部署配置', '部署配置', '进行中', '/products/cicd-config', 'CI/CD 配置正在搭建，包含构建、镜像推送和部署健康检查步骤。'),
(4, 1, '登录功能需求说明', '需求文档', '已完成', '/products/login-prd', '目标：完成用户登录注册与 JWT 鉴权。验收：登录成功返回 Token，失败提示清晰，接口可追踪。');

INSERT INTO deploy_service (service_name, image, version, status, port, container_id, cpu_usage, memory_usage, running_time) VALUES
('user-service', 'agentoffice/user-service', 'v1.0.0', '运行中', 8080, 'container_user_001', 25.50, 40.20, 86400),
('order-service', 'agentoffice/order-service', 'v1.2.0', '运行中', 8081, 'container_order_001', 18.30, 35.00, 172800),
('payment-service', 'agentoffice/payment-service', 'v1.1.0', '已停止', 8082, NULL, 0.00, 0.00, 0),
('message-service', 'agentoffice/message-service', 'v2.0.0', '异常', 8083, 'container_msg_001', 95.00, 85.00, 1000);

INSERT INTO notification_message (user_id, category, title, content, source_type, source_id, read_status, priority) VALUES
(1, 'task', '任务进度更新', '用户登录功能开发已推进到测试验证阶段，请关注后续测试结果。', 'task', 1, 0, 'high'),
(1, 'test', '测试任务启动', '自动化测试用例编写任务已开始执行，TestBot 正在准备回归用例。', 'task', 3, 0, 'normal'),
(1, 'deploy', '服务部署异常', 'message-service 当前资源占用较高，请在运维部署中查看服务详情。', 'deploy_service', 4, 0, 'high'),
(1, 'system', '系统设置已同步', '后台管理中的实时推送配置已启用，消息通知页面会持续展示系统事件。', 'system_config', NULL, 1, 'normal');

INSERT INTO system_config (config_key, config_label, config_desc, config_value) VALUES
('maintenanceMode', '维护模式', '启用后普通用户无法访问系统', 'false'),
('userRegistration', '用户注册', '允许新用户注册系统', 'true'),
('operationLog', '日志记录', '记录所有用户操作日志', 'true'),
('emailNotification', '邮件通知', '发送系统通知邮件', 'true'),
('realtimePush', '实时推送', '启用WebSocket实时推送', 'true');

INSERT INTO dev_project (project_name, description, language, owner_id, status) VALUES
('user-center', '用户中心服务', 'java', 1, 1),
('agent-core', 'AI 智能代理核心', 'java', 1, 1),
('web-frontend', '前端管理系统', 'javascript', 1, 1);

INSERT INTO dev_file (project_id, file_name, file_path, file_type, parent_id, is_directory) VALUES
(1, 'src', '/src', 'directory', NULL, 1),
(1, 'Main.java', '/src/Main.java', 'java', 1, 0),
(1, 'README.md', '/README.md', 'markdown', NULL, 0);

SET FOREIGN_KEY_CHECKS = 1;
