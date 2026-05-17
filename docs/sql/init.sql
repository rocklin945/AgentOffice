DROP DATABASE IF EXISTS agent_office;
CREATE DATABASE IF NOT EXISTS agent_office DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE agent_office;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS chat_message;
DROP TABLE IF EXISTS chat_session;
DROP TABLE IF EXISTS operation_log;
DROP TABLE IF EXISTS notification_message;
DROP TABLE IF EXISTS deploy_service;
DROP TABLE IF EXISTS dev_file;
DROP TABLE IF EXISTS dev_project;
DROP TABLE IF EXISTS work_product;
DROP TABLE IF EXISTS employee_permission;
DROP TABLE IF EXISTS task_info;
DROP TABLE IF EXISTS office_desk;
DROP TABLE IF EXISTS agent_employee;
DROP TABLE IF EXISTS model_config;
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

CREATE TABLE model_config (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    config_name VARCHAR(80) NOT NULL COMMENT '配置名称',
    provider VARCHAR(80) DEFAULT 'OpenAI Compatible' COMMENT '模型供应商',
    model_name VARCHAR(120) NOT NULL COMMENT '模型名称',
    api_base VARCHAR(255) DEFAULT NULL COMMENT 'API Base',
    api_key VARCHAR(500) DEFAULT NULL COMMENT 'API Key',
    is_default TINYINT DEFAULT 0 COMMENT '是否默认模型 0/1',
    enabled TINYINT DEFAULT 1 COMMENT '是否启用 0/1',
    remark VARCHAR(255) DEFAULT NULL COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    KEY idx_default (is_default),
    KEY idx_enabled (enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='模型配置表';

CREATE TABLE agent_employee (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    name VARCHAR(50) NOT NULL COMMENT '员工姓名',
    avatar VARCHAR(255) DEFAULT NULL COMMENT '头像 URL',
    role VARCHAR(50) NOT NULL COMMENT '角色',
    position VARCHAR(50) DEFAULT NULL COMMENT '职位',
    status VARCHAR(20) DEFAULT '空闲' COMMENT '状态',
    desk_id BIGINT DEFAULT NULL COMMENT '工位 ID',
    model_config_id BIGINT DEFAULT NULL COMMENT '模型配置 ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    KEY idx_status (status),
    KEY idx_role (role),
    KEY idx_desk_id (desk_id),
    KEY idx_model_config_id (model_config_id)
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

CREATE TABLE task_info (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    task_name VARCHAR(100) NOT NULL COMMENT '任务名称',
    task_type VARCHAR(30) DEFAULT 'custom' COMMENT '任务类型',
    description TEXT COMMENT '任务描述',
    priority VARCHAR(20) DEFAULT '中' COMMENT '优先级',
    executor_id BIGINT DEFAULT NULL COMMENT '执行人 ID',
    status VARCHAR(20) DEFAULT '待分配' COMMENT '状态',
    create_user BIGINT DEFAULT NULL COMMENT '创建人',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    end_time DATETIME DEFAULT NULL COMMENT '结束时间',
    KEY idx_executor_id (executor_id),
    KEY idx_status (status),
    KEY idx_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务表';


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
    category VARCHAR(30) NOT NULL DEFAULT 'task' COMMENT '消息分类 task/test/deploy',
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

INSERT INTO model_config (config_name, provider, model_name, api_base, api_key, is_default, enabled, remark) VALUES
('默认模型', 'MiniMax', 'MiniMax-M2.7', 'https://api.minimaxi.com/v1', 'sk-cp-v0V4WR8igps5rEUZhdWR-0FGHxPPVkmT35iFNFi3Nb1ffU64aHTyZqnLewRs1ikeZIEjYM6teHmlzbM22SXkSRqVp4DF3XOn40glCrsoo0SkjjXdUw8X2og', 1, 1, '系统默认模型，员工未单独配置时使用'),
('DeepSeek', 'DeepSeek', 'deepseek-v4-flash', 'https://api.deepseek.com', 'sk-29fd74c3c34a43bb8fb97b4d3c9cd330', 0, 1, '适合开发、Code Review 和测试分析');

INSERT INTO agent_employee (name, avatar, role, position, status, desk_id, model_config_id) VALUES
('ProductKing', 'https://api.dicebear.com/7.x/avataaars/svg?seed=ProductKing', '产品经理', '产品负责人', '在线', 1, 1),
('Dispatcher', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dispatcher', '调度员', '任务调度', '在线', 2, 1),
('AlexBE', 'https://api.dicebear.com/7.x/avataaars/svg?seed=AlexBE', '后端开发工程师', '后端开发', '在线', 3, 2),
('LilyFE', 'https://api.dicebear.com/7.x/avataaars/svg?seed=LilyFE', '前端开发工程师', '前端开发', '在线', 4, 2),
('ReviewBot', 'https://api.dicebear.com/7.x/avataaars/svg?seed=ReviewBot', 'CodeReviewer', '代码审查', '在线', 5, 2),
('OpsMaster', 'https://api.dicebear.com/7.x/avataaars/svg?seed=OpsMaster', '运维工程师', '容器运维', '在线', 6, 1);

INSERT INTO employee_permission (employee_id, permission_code, permission_name, enabled) VALUES
(1, 'task.view', '查看任务', 1), (1, 'product.plan', '产品规划', 1), (1, 'task.assign', '任务拆解', 1), (1, 'report.write', '输出报告', 1),
(2, 'task.view', '查看任务', 1), (2, 'task.assign', '任务拆解', 1), (2, 'task.execute', '执行任务', 1),
(3, 'task.view', '查看任务', 1), (3, 'task.execute', '执行任务', 1), (3, 'dev.code', '代码开发', 1),
(4, 'task.view', '查看任务', 1), (4, 'task.execute', '执行任务', 1), (4, 'dev.code', '代码开发', 1),
(5, 'task.view', '查看任务', 1), (5, 'code.review', 'Code Review', 1), (5, 'report.write', '输出报告', 1),
(6, 'task.view', '查看任务', 1), (6, 'deploy.manage', '部署服务', 1), (6, 'log.view', '查看日志', 1);

INSERT INTO deploy_service (service_name, image, version, status, port, container_id, cpu_usage, memory_usage, running_time) VALUES
('user-service', 'agentoffice/user-service', 'v1.0.0', '运行中', 8080, 'container_user_001', 25.50, 40.20, 86400),
('order-service', 'agentoffice/order-service', 'v1.2.0', '运行中', 8081, 'container_order_001', 18.30, 35.00, 172800),
('payment-service', 'agentoffice/payment-service', 'v1.1.0', '已停止', 8082, NULL, 0.00, 0.00, 0),
('message-service', 'agentoffice/message-service', 'v2.0.0', '异常', 8083, 'container_msg_001', 95.00, 85.00, 1000);

SET FOREIGN_KEY_CHECKS = 1;
