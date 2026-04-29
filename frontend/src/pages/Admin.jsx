import React, { useState } from 'react';
import { Card, Table, Button, Tag, Modal, Form, Input, Select, message } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  CheckSquareOutlined,
  CloudOutlined,
  DashboardOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons';

const menuItems = [
  { key: 'dashboard', label: '管理面板', icon: <DashboardOutlined /> },
  { key: 'users', label: '用户管理', icon: <UserOutlined /> },
  { key: 'employees', label: '员工管理', icon: <TeamOutlined /> },
  { key: 'tasks', label: '任务管理', icon: <CheckSquareOutlined /> },
  { key: 'services', label: '服务管理', icon: <CloudOutlined /> },
  { key: 'system', label: '系统设置', icon: <SettingOutlined /> },
];

const userColumns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '用户名', dataIndex: 'name', key: 'name' },
  { title: '邮箱', dataIndex: 'email', key: 'email' },
  { title: '角色', dataIndex: 'role', key: 'role', render: (r) => <Tag color={r === 'admin' ? 'red' : 'blue'}>{r}</Tag> },
  { title: '状态', dataIndex: 'status', key: 'status', render: (s) => <Tag color={s === 'active' ? 'green' : 'default'}>{s === 'active' ? '正常' : '禁用'}</Tag> },
  { title: '创建时间', dataIndex: 'created', key: 'created' },
  {
    title: '操作',
    key: 'action',
    render: () => (
      <div className="flex gap-2">
        <Button size="small" type="link">编辑</Button>
        <Button size="small" type="link" danger>删除</Button>
      </div>
    ),
  },
];

const users = [
  { id: 1, name: 'admin', email: 'admin@example.com', role: 'admin', status: 'active', created: '2024-01-01' },
  { id: 2, name: 'zhangsan', email: 'zhangsan@example.com', role: 'user', status: 'active', created: '2024-03-15' },
  { id: 3, name: 'lisi', email: 'lisi@example.com', role: 'user', status: 'disabled', created: '2024-04-20' },
  { id: 4, name: 'wangwu', email: 'wangwu@example.com', role: 'user', status: 'active', created: '2024-05-01' },
  { id: 5, name: 'zhaoliu', email: 'zhaoliu@example.com', role: 'user', status: 'active', created: '2024-05-10' },
];

const employeeColumns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '姓名', dataIndex: 'name', key: 'name' },
  { title: '角色', dataIndex: 'role', key: 'role' },
  { title: '状态', dataIndex: 'status', key: 'status', render: (s) => <Tag color={s === '在线' ? 'green' : 'default'}>{s}</Tag> },
  { title: '效率', dataIndex: 'efficiency', key: 'efficiency' },
  { title: '任务数', dataIndex: 'tasks', key: 'tasks' },
  {
    title: '操作',
    key: 'action',
    render: () => (
      <div className="flex gap-2">
        <Button size="small" type="link">编辑</Button>
        <Button size="small" type="link" danger>删除</Button>
      </div>
    ),
  },
];

const employees = [
  { id: 'E001', name: 'Alex', role: '开发工程师', status: '在线', efficiency: '85%', tasks: 3 },
  { id: 'E002', name: 'TestBot', role: '测试工程师', status: '在线', efficiency: '78%', tasks: 2 },
  { id: 'E003', name: 'OpsMaster', role: '运维工程师', status: '离线', efficiency: '90%', tasks: 2 },
  { id: 'E004', name: 'ProductKing', role: '产品经理', status: '在线', efficiency: '88%', tasks: 1 },
  { id: 'E005', name: 'DocHelper', role: '文档工程师', status: '离线', efficiency: '70%', tasks: 0 },
];

const taskColumns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '任务名称', dataIndex: 'name', key: 'name' },
  { title: '负责人', dataIndex: 'owner', key: 'owner' },
  { title: '状态', dataIndex: 'status', key: 'status', render: (s) => <Tag color={s === '已完成' ? 'green' : s === '进行中' ? 'blue' : 'orange'}>{s}</Tag> },
  { title: '优先级', dataIndex: 'level', key: 'level', render: (l) => <Tag color={l === '高' ? 'red' : l === '中' ? 'orange' : 'default'}>{l}</Tag> },
  { title: '进度', dataIndex: 'progress', key: 'progress' },
  {
    title: '操作',
    key: 'action',
    render: () => (
      <div className="flex gap-2">
        <Button size="small" type="link">编辑</Button>
        <Button size="small" type="link" danger>删除</Button>
      </div>
    ),
  },
];

const tasks = [
  { id: 'T001', name: '开发用户登录接口', owner: 'Alex', status: '进行中', level: '高', progress: '75%' },
  { id: 'T002', name: '编写登录接口测试用例', owner: 'TestBot', status: '进行中', level: '中', progress: '60%' },
  { id: 'T003', name: '部署登录服务到测试环境', owner: 'OpsMaster', status: '部署中', level: '高', progress: '40%' },
  { id: 'T004', name: '用户登录功能需求分析', owner: 'ProductKing', status: '已完成', level: '中', progress: '100%' },
  { id: 'T005', name: '编写接口文档', owner: 'DocHelper', status: '已完成', level: '低', progress: '100%' },
];

const serviceColumns = [
  { title: '服务名', dataIndex: 'name', key: 'name' },
  { title: '镜像', dataIndex: 'image', key: 'image' },
  { title: '状态', dataIndex: 'status', key: 'status', render: (s) => <Tag color={s === '运行中' ? 'green' : 'red'}>{s}</Tag> },
  { title: '实例数', dataIndex: 'instances', key: 'instances' },
  { title: 'CPU', dataIndex: 'cpu', key: 'cpu' },
  { title: '内存', dataIndex: 'memory', key: 'memory' },
  {
    title: '操作',
    key: 'action',
    render: () => (
      <div className="flex gap-2">
        <Button size="small" type="link">重启</Button>
        <Button size="small" type="link" danger>停止</Button>
      </div>
    ),
  },
];

const services = [
  { name: 'user-service', image: 'user-service:1.2.0', status: '运行中', instances: 3, cpu: '12%', memory: '256MB' },
  { name: 'order-service', image: 'order-service:1.1.0', status: '运行中', instances: 2, cpu: '8%', memory: '128MB' },
  { name: 'payment-service', image: 'payment-service:1.0.0', status: '已停止', instances: 0, cpu: '-', memory: '-' },
  { name: 'nginx-proxy', image: 'nginx:latest', status: '运行中', instances: 2, cpu: '3%', memory: '64MB' },
  { name: 'redis-cache', image: 'redis:alpine', status: '运行中', instances: 1, cpu: '2%', memory: '32MB' },
];

const systemSettings = [
  { label: '维护模式', desc: '启用后普通用户无法访问系统', value: false },
  { label: '用户注册', desc: '允许新用户注册系统', value: true },
  { label: '日志记录', desc: '记录所有用户操作日志', value: true },
  { label: '邮件通知', desc: '发送系统通知邮件', value: true },
  { label: '实时推送', desc: '启用WebSocket实时推送', value: true },
];

function Dashboard() {
  const stats = [
    { label: '用户总数', value: '128', color: '#4f8dff' },
    { label: '员工总数', value: '12', color: '#2bb36b' },
    { label: '任务总数', value: '256', color: '#ff9b42' },
    { label: '服务总数', value: '8', color: '#f5a544' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-[14px] border border-[#edf1f8] bg-white p-4">
            <div className="text-[12px] text-[#8d99ae]">{stat.label}</div>
            <div className="mt-2 text-[24px] font-semibold" style={{ color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-[14px] border border-[#edf1f8] bg-white p-4">
          <div className="mb-3 text-[14px] font-medium text-[#1d2740]">在线用户</div>
          <div className="text-[32px] font-semibold text-[#2bb36b]">8</div>
          <div className="mt-2 text-[12px] text-[#8d99ae]">较昨日 +2</div>
        </div>
        <div className="rounded-[14px] border border-[#edf1f8] bg-white p-4">
          <div className="mb-3 text-[14px] font-medium text-[#1d2740]">运行服务</div>
          <div className="text-[32px] font-semibold text-[#2f6bff]">7</div>
          <div className="mt-2 text-[12px] text-[#8d99ae]">较昨日 +1</div>
        </div>
      </div>
    </div>
  );
}

export default function Admin() {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [addOpen, setAddOpen] = useState(false);
  const [form] = Form.useForm();

  const columnsMap = {
    users: userColumns,
    employees: employeeColumns,
    tasks: taskColumns,
    services: serviceColumns,
  };

  const dataMap = {
    users,
    employees,
    tasks,
    services,
  };

  const handleAdd = () => {
    form.validateFields().then(() => {
      message.success('添加成功');
      setAddOpen(false);
      form.resetFields();
    });
  };

  const renderContent = () => {
    if (activeMenu === 'dashboard') return <Dashboard />;
    if (activeMenu === 'system') {
      return (
        <Card className="rounded-[14px] border-[#edf1f8]">
          <div className="mb-4 text-[16px] font-medium text-[#1d2740]">系统设置</div>
          <div className="space-y-4">
            {systemSettings.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-[12px] bg-[#f6f8fc] px-4 py-3">
                <div>
                  <div className="text-[14px] font-medium text-[#1d2740]">{item.label}</div>
                  <div className="text-[12px] text-[#8d99ae]">{item.desc}</div>
                </div>
                <Select
                  className="w-[120px]"
                  defaultValue={item.value ? 'open' : 'close'}
                  options={[{ value: 'open', label: '开启' }, { value: 'close', label: '关闭' }]}
                />
              </div>
            ))}
          </div>
        </Card>
      );
    }

    return (
      <>
        <div className="mb-4 flex items-center justify-between">
          <div className="text-[16px] font-medium text-[#1d2740]">
            {menuItems.find((m) => m.key === activeMenu)?.label}
          </div>
          <Button type="primary" onClick={() => setAddOpen(true)}>+ 新增</Button>
        </div>
        <Table
          columns={columnsMap[activeMenu]}
          dataSource={dataMap[activeMenu]}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </>
    );
  };

  return (
    <div className="flex h-[calc(100vh-140px)] rounded-[18px] bg-white shadow-sm">
      {/* 左侧菜单 */}
      <div className="w-[220px] shrink-0 border-r border-[#edf1f8] p-4">
        <div className="mb-4 px-3 text-[12px] text-[#8d99ae]">管理后台</div>
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setActiveMenu(item.key)}
              className={`flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-[14px] transition ${
                activeMenu === item.key
                  ? 'bg-[#2f6bff] text-white'
                  : 'text-[#5f6d83] hover:bg-[#f6f8fc]'
              }`}
            >
              <span className="text-[16px]">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* 右侧内容 */}
      <div className="flex-1 overflow-y-auto p-5">
        {renderContent()}
      </div>

      <Modal
        title="新增"
        open={addOpen}
        onOk={handleAdd}
        onCancel={() => setAddOpen(false)}
        okText="添加"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          {activeMenu === 'users' && (
            <>
              <Form.Item name="name" label="用户名" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="email" label="邮箱" rules={[{ required: true, type: 'email' }]}>
                <Input />
              </Form.Item>
              <Form.Item name="role" label="角色" rules={[{ required: true }]}>
                <Select options={[{ value: 'admin', label: '管理员' }, { value: 'user', label: '普通用户' }]} />
              </Form.Item>
            </>
          )}
          {activeMenu === 'employees' && (
            <>
              <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="role" label="角色" rules={[{ required: true }]}>
                <Select options={[{ value: '开发工程师', label: '开发工程师' }, { value: '测试工程师', label: '测试工程师' }, { value: '运维工程师', label: '运维工程师' }, { value: '产品经理', label: '产品经理' }]} />
              </Form.Item>
            </>
          )}
          {activeMenu === 'tasks' && (
            <>
              <Form.Item name="name" label="任务名称" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="owner" label="负责人" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="level" label="优先级">
                <Select options={[{ value: '高', label: '高' }, { value: '中', label: '中' }, { value: '低', label: '低' }]} />
              </Form.Item>
            </>
          )}
          {activeMenu === 'services' && (
            <>
              <Form.Item name="name" label="服务名称" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="image" label="镜像" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
}