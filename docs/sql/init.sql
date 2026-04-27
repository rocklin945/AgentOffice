-- AgentOffice 数据库初始化脚本
-- 数据库名: agent_office

CREATE DATABASE IF NOT EXISTS agent_office DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE agent_office;

-- ----------------------------
-- 1. 用户表
-- ----------------------------
DROP TABLE IF EXISTS sys_user;
CREATE TABLE sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    username VARCHAR(50) NOT NULL COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码',
    nickname VARCHAR(50) DEFAULT NULL COMMENT '昵称',
    avatar VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
    email VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
    phone VARCHAR(20) DEFAULT NULL COMMENT '手机号',
    status TINYINT DEFAULT 1 COMMENT '状态(0禁用,1正常)',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_username (username),
    KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- ----------------------------
-- 2. 员工表
-- ----------------------------
DROP TABLE IF EXISTS agent_employee;
CREATE TABLE agent_employee (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    name VARCHAR(50) NOT NULL COMMENT '员工姓名',
    avatar VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
    role VARCHAR(50) NOT NULL COMMENT '角色(开发/测试/运维/产品)',
    position VARCHAR(50) DEFAULT NULL COMMENT '职位',
    status VARCHAR(20) DEFAULT '空闲' COMMENT '状态(工作中/思考中/编译中/部署中/完成/空闲/在线)',
    task_count INT DEFAULT 0 COMMENT '任务数',
    efficiency DECIMAL(5,2) DEFAULT 0.00 COMMENT '效率百分比',
    desk_id BIGINT DEFAULT NULL COMMENT '工位ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    KEY idx_status (status),
    KEY idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='员工表';

-- ----------------------------
-- 3. 工位表
-- ----------------------------
DROP TABLE IF EXISTS office_desk;
CREATE TABLE office_desk (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    desk_code VARCHAR(20) NOT NULL COMMENT '工位编号',
    row_num INT NOT NULL COMMENT '排号',
    col_num INT NOT NULL COMMENT '列号',
    employee_id BIGINT DEFAULT NULL COMMENT '员工ID',
    status TINYINT DEFAULT 0 COMMENT '状态(0空闲,1占用)',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY uk_desk_code (desk_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工位表';

-- ----------------------------
-- 4. 任务表
-- ----------------------------
DROP TABLE IF EXISTS task_info;
CREATE TABLE task_info (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    task_name VARCHAR(100) NOT NULL COMMENT '任务名称',
    description TEXT COMMENT '任务描述',
    priority VARCHAR(20) DEFAULT '中' COMMENT '优先级(高/中/低)',
    executor_id BIGINT DEFAULT NULL COMMENT '执行人ID',
    status VARCHAR(20) DEFAULT '待分配' COMMENT '状态(进行中/已完成/已失败/待分配)',
    progress INT DEFAULT 0 COMMENT '进度(0-100)',
    create_user BIGINT DEFAULT NULL COMMENT '创建人',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    end_time DATETIME DEFAULT NULL COMMENT '结束时间',
    KEY idx_executor_id (executor_id),
    KEY idx_status (status),
    KEY idx_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务表';

-- ----------------------------
-- 5. 任务步骤表
-- ----------------------------
DROP TABLE IF EXISTS task_step;
CREATE TABLE task_step (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    task_id BIGINT NOT NULL COMMENT '任务ID',
    step_name VARCHAR(100) NOT NULL COMMENT '步骤名称',
    step_order INT NOT NULL COMMENT '步骤顺序',
    status VARCHAR(20) DEFAULT '待处理' COMMENT '状态(已完成/进行中/待处理)',
    complete_time DATETIME DEFAULT NULL COMMENT '完成时间',
    KEY idx_task_id (task_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务步骤表';

-- ----------------------------
-- 6. 项目表
-- ----------------------------
DROP TABLE IF EXISTS dev_project;
CREATE TABLE dev_project (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    project_name VARCHAR(100) NOT NULL COMMENT '项目名称',
    description TEXT COMMENT '项目描述',
    language VARCHAR(20) DEFAULT 'java' COMMENT '语言类型',
    owner_id BIGINT DEFAULT NULL COMMENT '负责人',
    status TINYINT DEFAULT 1 COMMENT '状态(0禁用,1正常)',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    KEY idx_owner_id (owner_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目表';

-- ----------------------------
-- 7. 文件表
-- ----------------------------
DROP TABLE IF EXISTS dev_file;
CREATE TABLE dev_file (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    project_id BIGINT NOT NULL COMMENT '项目ID',
    file_name VARCHAR(255) NOT NULL COMMENT '文件名',
    file_path VARCHAR(500) NOT NULL COMMENT '文件路径',
    file_type VARCHAR(20) DEFAULT NULL COMMENT '文件类型',
    content LONGTEXT COMMENT '文件内容',
    parent_id BIGINT DEFAULT NULL COMMENT '父目录ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    KEY idx_project_id (project_id),
    KEY idx_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文件表';

-- ----------------------------
-- 8. 服务表
-- ----------------------------
DROP TABLE IF EXISTS deploy_service;
CREATE TABLE deploy_service (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    service_name VARCHAR(100) NOT NULL COMMENT '服务名称',
    image VARCHAR(255) DEFAULT NULL COMMENT '镜像',
    version VARCHAR(50) DEFAULT NULL COMMENT '版本',
    status VARCHAR(20) DEFAULT '已停止' COMMENT '状态(运行中/已停止/异常)',
    port INT DEFAULT NULL COMMENT '端口',
    container_id VARCHAR(100) DEFAULT NULL COMMENT '容器ID',
    cpu_usage DECIMAL(5,2) DEFAULT 0.00 COMMENT 'CPU使用率',
    memory_usage DECIMAL(5,2) DEFAULT 0.00 COMMENT '内存使用',
    running_time BIGINT DEFAULT 0 COMMENT '运行时间(秒)',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='服务表';

-- ----------------------------
-- 9. 操作日志表
-- ----------------------------
DROP TABLE IF EXISTS operation_log;
CREATE TABLE operation_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    user_id BIGINT DEFAULT NULL COMMENT '用户ID',
    action VARCHAR(50) DEFAULT NULL COMMENT '操作类型',
    target_type VARCHAR(50) DEFAULT NULL COMMENT '目标类型',
    target_id BIGINT DEFAULT NULL COMMENT '目标ID',
    detail TEXT COMMENT '详情',
    ip_address VARCHAR(50) DEFAULT NULL COMMENT 'IP地址',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    KEY idx_user_id (user_id),
    KEY idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

-- ----------------------------
-- 10. 会话表
-- ----------------------------
DROP TABLE IF EXISTS chat_session;
CREATE TABLE chat_session (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    session_id VARCHAR(100) NOT NULL COMMENT '会话ID',
    user_id BIGINT DEFAULT NULL COMMENT '用户ID',
    agent_id BIGINT DEFAULT NULL COMMENT 'Agent ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_session_id (session_id),
    KEY idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会话表';

-- ----------------------------
-- 11. 消息表
-- ----------------------------
DROP TABLE IF EXISTS chat_message;
CREATE TABLE chat_message (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    session_id BIGINT NOT NULL COMMENT '会话ID',
    role VARCHAR(20) NOT NULL COMMENT '角色(user/assistant)',
    content TEXT COMMENT '内容',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    KEY idx_session_id (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='消息表';

-- ----------------------------
-- 初始数据
-- ----------------------------

-- 插入默认管理员用户 (密码: admin123)
INSERT INTO sys_user (username, password, nickname, email, status) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '管理员', 'admin@agent.com', 1);

-- 插入示例员工
INSERT INTO agent_employee (name, avatar, role, position, status, task_count, efficiency) VALUES
('张三', 'https://api.dicebear.com/7.x/avataaars/svg?seed=张三', '开发工程师', '高级开发', '工作中', 5, 92.5),
('李四', 'https://api.dicebear.com/7.x/avataaars/svg?seed=李四', '测试工程师', '测试组长', '思考中', 3, 88.0),
('王五', 'https://api.dicebear.com/7.x/avataaars/svg?seed=王五', '运维工程师', '运维专家', '空闲', 2, 95.0),
('赵六', 'https://api.dicebear.com/7.x/avataaars/svg?seed=赵六', '产品经理', '产品负责人', '在线', 4, 90.0);

-- 插入工位
INSERT INTO office_desk (desk_code, row_num, col_num, status) VALUES
('A1', 1, 1, 1),
('A2', 1, 2, 1),
('A3', 1, 3, 1),
('A4', 1, 4, 1),
('B1', 2, 1, 0),
('B2', 2, 2, 0),
('B3', 2, 3, 0),
('B4', 2, 4, 0);

-- 更新员工工位
UPDATE agent_employee SET desk_id = 1 WHERE name = '张三';
UPDATE agent_employee SET desk_id = 2 WHERE name = '李四';
UPDATE agent_employee SET desk_id = 3 WHERE name = '王五';
UPDATE agent_employee SET desk_id = 4 WHERE name = '赵六';
UPDATE office_desk SET employee_id = 1 WHERE desk_code = 'A1';
UPDATE office_desk SET employee_id = 2 WHERE desk_code = 'A2';
UPDATE office_desk SET employee_id = 3 WHERE desk_code = 'A3';
UPDATE office_desk SET employee_id = 4 WHERE desk_code = 'A4';

-- 插入示例任务
INSERT INTO task_info (task_name, description, priority, executor_id, status, progress, create_user) VALUES
('用户登录功能开发', '实现用户登录注册功能', '高', 1, '进行中', 60, 1),
('接口性能优化', '优化核心接口响应时间', '中', 1, '已完成', 100, 1),
('自动化测试用例编写', '编写核心业务测试用例', '中', 2, '进行中', 30, 1),
('CI/CD流程搭建', '搭建持续集成部署流程', '高', 3, '待分配', 0, 1),
('数据库索引优化', '优化慢查询SQL', '低', NULL, '已失败', 0, 1);

-- 插入任务步骤
INSERT INTO task_step (task_id, step_name, step_order, status) VALUES
(1, '需求分析', 1, '已完成'),
(1, '接口设计', 2, '已完成'),
(1, '代码开发', 3, '进行中'),
(1, '测试验证', 4, '待处理'),
(1, '部署上线', 5, '待处理');

-- 插入示例服务
INSERT INTO deploy_service (service_name, image, version, status, port, cpu_usage, memory_usage, running_time) VALUES
('user-service', 'agentoffice/user-service', 'v1.0.0', '运行中', 8080, 25.5, 40.2, 86400),
('order-service', 'agentoffice/order-service', 'v1.2.0', '运行中', 8081, 18.3, 35.0, 172800),
('payment-service', 'agentoffice/payment-service', 'v1.1.0', '已停止', 8082, 0, 0, 0),
('message-service', 'agentoffice/message-service', 'v2.0.0', '异常', 8083, 95.0, 85.0, 1000);

-- 插入示例项目
INSERT INTO dev_project (project_name, description, language, owner_id, status) VALUES
('user-center', '用户中心服务', 'java', 1, 1),
('agent-core', 'AI智能代理核心', 'java', 1, 1),
('web-frontend', '前端管理系统', 'typescript', 4, 1);
