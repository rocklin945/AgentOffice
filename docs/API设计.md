# AgentOffice API 设计文档

## 一、API概述

- **基础路径**: `/api`
- **认证方式**: JWT Token
- **请求格式**: JSON
- **响应格式**: `Result<T>`

## 二、统一响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

| code | 说明 |
|------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

---

## 三、认证模块 `/api/auth`

### 3.1 用户登录
```
POST /api/auth/login
```
**请求参数**:
```json
{
  "username": "admin",
  "password": "admin123"
}
```
**响应**:
```json
{
  "code": 200,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "nickname": "管理员",
      "avatar": "https://...",
      "email": "admin@agent.com"
    }
  }
}
```

### 3.2 用户注册
```
POST /api/auth/register
```
**请求参数**:
```json
{
  "username": "user1",
  "password": "pass123",
  "nickname": "用户1",
  "email": "user1@agent.com"
}
```

### 3.3 获取当前用户
```
GET /api/auth/current
```
**响应**: 用户信息

### 3.4 退出登录
```
POST /api/auth/logout
```

---

## 四、员工管理模块 `/api/employees`

### 4.1 员工列表
```
GET /api/employees
```
**Query参数**:
- `status` - 状态筛选
- `role` - 角色筛选
- `keyword` - 搜索关键字
- `page` - 页码
- `pageSize` - 每页条数

**响应**:
```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": 1,
        "name": "张三",
        "avatar": "https://...",
        "role": "开发工程师",
        "position": "高级开发",
        "status": "工作中",
        "taskCount": 5,
        "efficiency": 92.5,
        "deskCode": "A1"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 10
  }
}
```

### 4.2 获取单个员工
```
GET /api/employees/:id
```

### 4.3 创建员工
```
POST /api/employees
```
**请求参数**:
```json
{
  "name": "张三",
  "avatar": "https://...",
  "role": "开发工程师",
  "position": "高级开发",
  "deskId": 1
}
```

### 4.4 更新员工
```
PUT /api/employees/:id
```
**请求参数**:
```json
{
  "name": "张三",
  "role": "开发工程师",
  "position": "高级开发",
  "status": "工作中"
}
```

### 4.5 删除员工
```
DELETE /api/employees/:id
```

### 4.6 更新员工状态
```
PATCH /api/employees/:id/status
```
**请求参数**:
```json
{
  "status": "思考中"
}
```

---

## 五、任务管理模块 `/api/tasks`

### 5.1 任务列表
```
GET /api/tasks
```
**Query参数**:
- `status` - 状态筛选 (进行中/已完成/已失败/待分配)
- `priority` - 优先级筛选
- `executorId` - 执行人ID
- `page` - 页码
- `pageSize` - 每页条数

### 5.2 获取单个任务(含步骤)
```
GET /api/tasks/:id
```
**响应**:
```json
{
  "code": 200,
  "data": {
    "id": 1,
    "taskName": "用户登录功能开发",
    "description": "实现用户登录注册功能",
    "priority": "高",
    "executor": {
      "id": 1,
      "name": "张三",
      "avatar": "https://..."
    },
    "status": "进行中",
    "progress": 60,
    "steps": [
      {"id": 1, "stepName": "需求分析", "stepOrder": 1, "status": "已完成", "completeTime": "2024-01-01 10:00:00"},
      {"id": 2, "stepName": "接口设计", "stepOrder": 2, "status": "已完成", "completeTime": "2024-01-02 10:00:00"},
      {"id": 3, "stepName": "代码开发", "stepOrder": 3, "status": "进行中"},
      {"id": 4, "stepName": "测试验证", "stepOrder": 4, "status": "待处理"},
      {"id": 5, "stepName": "部署上线", "stepOrder": 5, "status": "待处理"}
    ],
    "logs": [
      {"time": "2024-01-01 09:00:00", "content": "任务已创建"},
      {"time": "2024-01-01 10:00:00", "content": "需求分析完成"}
    ],
    "createTime": "2024-01-01 09:00:00"
  }
}
```

### 5.3 创建任务
```
POST /api/tasks
```
**请求参数**:
```json
{
  "taskName": "用户登录功能开发",
  "description": "实现用户登录注册功能",
  "priority": "高",
  "executorId": 1,
  "steps": ["需求分析", "接口设计", "代码开发", "测试验证", "部署上线"]
}
```

### 5.4 更新任务
```
PUT /api/tasks/:id
```

### 5.5 删除任务
```
DELETE /api/tasks/:id
```

### 5.6 更新任务进度
```
PATCH /api/tasks/:id/progress
```
**请求参数**:
```json
{
  "progress": 80
}
```

### 5.7 更新任务状态
```
PATCH /api/tasks/:id/status
```
**请求参数**:
```json
{
  "status": "已完成"
}
```

### 5.8 更新步骤状态
```
PATCH /api/tasks/:taskId/steps/:stepId
```
**请求参数**:
```json
{
  "status": "已完成"
}
```

### 5.9 分配任务
```
POST /api/tasks/:id/assign
```
**请求参数**:
```json
{
  "executorId": 1
}
```

---

## 六、虚拟办公室模块 `/api/office`

### 6.1 获取办公室布局
```
GET /api/office/layout
```
**响应**:
```json
{
  "code": 200,
  "data": {
    "rows": 4,
    "cols": 4,
    "desks": [
      {
        "id": 1,
        "deskCode": "A1",
        "rowNum": 1,
        "colNum": 1,
        "status": 1,
        "employee": {
          "id": 1,
          "name": "张三",
          "avatar": "https://...",
          "role": "开发工程师",
          "position": "高级开发",
          "status": "工作中"
        }
      }
    ]
  }
}
```

### 6.2 获取所有员工状态概览
```
GET /api/office/employees/status
```
**响应**:
```json
{
  "code": 200,
  "data": {
    "total": 10,
    "working": 5,
    "thinking": 2,
    "compiling": 1,
    "deploying": 1,
    "idle": 1
  }
}
```

---

## 七、云端开发模块 `/api/dev`

### 7.1 项目列表
```
GET /api/dev/projects
```

### 7.2 获取单个项目
```
GET /api/dev/projects/:id
```

### 7.3 创建项目
```
POST /api/dev/projects
```
**请求参数**:
```json
{
  "projectName": "user-center",
  "description": "用户中心服务",
  "language": "java"
}
```

### 7.4 更新项目
```
PUT /api/dev/projects/:id
```

### 7.5 删除项目
```
DELETE /api/dev/projects/:id
```

### 7.6 获取项目文件树
```
GET /api/dev/projects/:id/files
```

### 7.7 获取文件内容
```
GET /api/dev/files/:id
```

### 7.8 创建/更新文件
```
PUT /api/dev/files/:id
```
**请求参数**:
```json
{
  "content": "package com.example;\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello World\");\n    }\n}"
}
```

### 7.9 创建文件
```
POST /api/dev/projects/:id/files
```
**请求参数**:
```json
{
  "fileName": "Hello.java",
  "filePath": "/src/com/example",
  "fileType": "java",
  "content": ""
}
```

### 7.10 删除文件
```
DELETE /api/dev/files/:id
```

### 7.11 运行代码
```
POST /api/dev/run
```
**请求参数**:
```json
{
  "fileId": 1,
  "language": "java"
}
```
**响应**:
```json
{
  "code": 200,
  "data": {
    "output": "Hello World\n",
    "error": "",
    "exitCode": 0,
    "executionTime": 156
  }
}
```

### 7.12 运行测试
```
POST /api/dev/test
```

---

## 八、部署运维模块 `/api/deploy`

### 8.1 服务列表
```
GET /api/deploy/services
```
**Query参数**:
- `status` - 状态筛选

### 8.2 获取单个服务
```
GET /api/deploy/services/:id
```

### 8.3 创建服务
```
POST /api/deploy/services
```
**请求参数**:
```json
{
  "serviceName": "user-service",
  "image": "agentoffice/user-service",
  "version": "v1.0.0",
  "port": 8080
}
```

### 8.4 更新服务
```
PUT /api/deploy/services/:id
```

### 8.5 删除服务
```
DELETE /api/deploy/services/:id
```

### 8.6 启动服务
```
POST /api/deploy/services/:id/start
```

### 8.7 停止服务
```
POST /api/deploy/services/:id/stop
```

### 8.8 重启服务
```
POST /api/deploy/services/:id/restart
```

### 8.9 获取服务日志
```
GET /api/deploy/services/:id/logs
```
**Query参数**:
- `lines` - 日志行数

---

## 九、数据分析模块 `/api/analytics`

### 9.1 获取Dashboard数据
```
GET /api/analytics/dashboard
```
**响应**:
```json
{
  "code": 200,
  "data": {
    "taskCompletionRate": 85.5,
    "totalTasks": 100,
    "completedTasks": 85,
    "avgEfficiency": 88.3,
    "trend": [
      {"date": "2024-01-01", "completed": 10, "total": 12},
      {"date": "2024-01-02", "completed": 8, "total": 10}
    ]
  }
}
```

### 9.2 获取员工效率数据
```
GET /api/analytics/employees
```
**响应**:
```json
{
  "code": 200,
  "data": [
    {"name": "张三", "efficiency": 92.5, "taskCount": 15},
    {"name": "李四", "efficiency": 88.0, "taskCount": 12}
  ]
}
```

### 9.3 获取任务趋势
```
GET /api/analytics/tasks/trend
```
**Query参数**:
- `startDate` - 开始日期
- `endDate` - 结束日期

### 9.4 获取KPI卡片数据
```
GET /api/analytics/kpi
```

---

## 十、系统设置模块 `/api/system`

### 10.1 获取系统配置
```
GET /api/system/config
```

### 10.2 更新系统配置
```
PUT /api/system/config
```

### 10.3 获取操作日志
```
GET /api/system/logs
```
**Query参数**:
- `userId` - 用户ID
- `action` - 操作类型
- `page` - 页码
- `pageSize` - 每页条数

### 10.4 获取当前用户操作日志
```
GET /api/system/logs/my
```
