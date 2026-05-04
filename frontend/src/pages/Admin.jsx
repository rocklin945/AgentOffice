import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Form, Input, Modal, Select, Table, Tag, message } from 'antd';
import {
  CheckSquareOutlined,
  CloudOutlined,
  DashboardOutlined,
  DeleteOutlined,
  EditOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { adminApi, deployApi, employeeApi, taskApi, uiApi } from '../api';

const menuItems = [
  { key: 'dashboard', label: '管理面板', icon: <DashboardOutlined /> },
  { key: 'users', label: '用户管理', icon: <UserOutlined /> },
  { key: 'employees', label: '员工管理', icon: <TeamOutlined /> },
  { key: 'tasks', label: '任务管理', icon: <CheckSquareOutlined /> },
  { key: 'services', label: '服务管理', icon: <CloudOutlined /> },
  { key: 'system', label: '系统设置', icon: <SettingOutlined /> },
];

const tagColor = (status) => {
  if (['运行中', '已完成', '工作中', '在线'].includes(status)) return 'green';
  if (['进行中', '待分配'].includes(status)) return 'blue';
  if (['异常', '已失败'].includes(status)) return 'red';
  return 'default';
};

const percent = (value) => `${Number(value || 0)}%`;
const time = (value) => value ? String(value).replace('T', ' ').slice(0, 16) : '-';

function Dashboard({ employees, tasks, services, dashboard }) {
  const stats = [
    { label: '员工总数', value: employees.length, color: '#2bb36b' },
    { label: '任务总数', value: dashboard?.totalTasks || tasks.length, color: '#ff9b42' },
    { label: '完成任务', value: dashboard?.completedTasks || 0, color: '#4f8dff' },
    { label: '服务总数', value: services.length, color: '#f5a544' },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => <div key={stat.label} className="rounded-[14px] border border-[#edf1f8] bg-white p-4"><div className="text-[12px] text-[#8d99ae]">{stat.label}</div><div className="mt-2 text-[24px] font-semibold" style={{ color: stat.color }}>{stat.value}</div></div>)}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-[14px] border border-[#edf1f8] bg-white p-4"><div className="mb-3 text-[14px] font-medium text-[#1d2740]">平均效率</div><div className="text-[32px] font-semibold text-[#2bb36b]">{percent(dashboard?.avgEfficiency)}</div></div>
        <div className="rounded-[14px] border border-[#edf1f8] bg-white p-4"><div className="mb-3 text-[14px] font-medium text-[#1d2740]">运行服务</div><div className="text-[32px] font-semibold text-[#2f6bff]">{services.filter((item) => item.status === '运行中').length}</div></div>
      </div>
    </div>
  );
}

function ActionButtons({ onEdit, onDelete }) {
  return (
    <div className="flex gap-2">
      <Button size="small" type="text" title="编辑" icon={<EditOutlined />} onClick={onEdit} />
      <Button size="small" type="text" danger title="删除" icon={<DeleteOutlined />} onClick={onDelete} />
    </div>
  );
}

export default function Admin() {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [data, setData] = useState({ users: [], employees: [], tasks: [], services: [], dashboard: {}, systemSettings: [] });
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const reload = () => uiApi.getAdmin().then((res) => setData((prev) => ({ ...prev, ...res.data }))).catch(() => {});
  useEffect(() => { reload(); }, []);

  const openEdit = (type, record) => {
    setEditing({ type, record });
    form.setFieldsValue({
      ...record,
      name: record.name || record.taskName || record.serviceName || record.username,
      priority: record.priority,
      executorId: record.executorId || '',
      cpuUsage: Number(record.cpuUsage || 0),
      memoryUsage: Number(record.memoryUsage || 0),
    });
  };

  const saveEdit = async () => {
    const values = await form.validateFields();
    const { type, record } = editing;
    if (type === 'users') {
      await adminApi.updateUser(record.id, { ...record, ...values, username: values.username || values.name });
    }
    if (type === 'employees') {
      await employeeApi.update(record.id, { ...record, ...values, taskCount: record.taskCount || 0, efficiency: Number(values.efficiency ?? record.efficiency ?? 0) });
    }
    if (type === 'tasks') {
      await taskApi.update(record.id, { ...record, ...values, taskName: values.taskName || values.name, progress: Number(values.progress || 0), executorId: values.executorId || null });
    }
    if (type === 'services') {
      await deployApi.updateService(record.id, { ...record, ...values, serviceName: values.serviceName || values.name, port: values.port ? Number(values.port) : null });
    }
    message.success('保存成功');
    setEditing(null);
    form.resetFields();
    reload();
  };

  const removeRecord = async (type, record) => {
    if (type === 'users') await adminApi.deleteUser(record.id);
    if (type === 'employees') await employeeApi.delete(record.id);
    if (type === 'tasks') await taskApi.delete(record.id);
    if (type === 'services') await deployApi.deleteService(record.id);
    message.success('删除成功');
    reload();
  };

  const updateSystemSetting = async (key, value) => {
    await adminApi.updateSystemSettings({ [key]: value });
    setData((current) => ({
      ...current,
      systemSettings: current.systemSettings.map((item) => item.configKey === key ? { ...item, configValue: value } : item),
    }));
    message.success('设置已保存');
  };

  const columnsMap = useMemo(() => ({
    users: [
      { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
      { title: '用户名', dataIndex: 'username', key: 'username' },
      { title: '邮箱', dataIndex: 'email', key: 'email' },
      { title: '状态', dataIndex: 'status', key: 'status', render: (s) => <Tag color={Number(s) === 1 ? 'green' : 'default'}>{Number(s) === 1 ? '正常' : '禁用'}</Tag> },
      { title: '创建时间', dataIndex: 'createTime', key: 'createTime', render: time },
      { title: '操作', key: 'action', render: (_, record) => <ActionButtons onEdit={() => openEdit('users', record)} onDelete={() => removeRecord('users', record)} /> },
    ],
    employees: [
      { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
      { title: '姓名', dataIndex: 'name', key: 'name' },
      { title: '角色', dataIndex: 'role', key: 'role' },
      { title: '状态', dataIndex: 'status', key: 'status', render: (s) => <Tag color={tagColor(s)}>{s}</Tag> },
      { title: '效率', dataIndex: 'efficiency', key: 'efficiency', render: percent },
      { title: '任务数', dataIndex: 'taskCount', key: 'taskCount' },
      { title: '操作', key: 'action', render: (_, record) => <ActionButtons onEdit={() => openEdit('employees', record)} onDelete={() => removeRecord('employees', record)} /> },
    ],
    tasks: [
      { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
      { title: '任务名称', dataIndex: 'taskName', key: 'taskName' },
      { title: '负责人', dataIndex: 'executorName', key: 'executorName', render: (v) => v || '-' },
      { title: '状态', dataIndex: 'status', key: 'status', render: (s) => <Tag color={tagColor(s)}>{s}</Tag> },
      { title: '优先级', dataIndex: 'priority', key: 'priority' },
      { title: '进度', dataIndex: 'progress', key: 'progress', render: percent },
      { title: '操作', key: 'action', render: (_, record) => <ActionButtons onEdit={() => openEdit('tasks', record)} onDelete={() => removeRecord('tasks', record)} /> },
    ],
    services: [
      { title: '服务名', dataIndex: 'serviceName', key: 'serviceName' },
      { title: '镜像', dataIndex: 'image', key: 'image' },
      { title: '状态', dataIndex: 'status', key: 'status', render: (s) => <Tag color={tagColor(s)}>{s}</Tag> },
      { title: '端口', dataIndex: 'port', key: 'port' },
      { title: 'CPU', dataIndex: 'cpuUsage', key: 'cpuUsage', render: percent },
      { title: '内存', dataIndex: 'memoryUsage', key: 'memoryUsage', render: percent },
      { title: '操作', key: 'action', render: (_, record) => <ActionButtons onEdit={() => openEdit('services', record)} onDelete={() => removeRecord('services', record)} /> },
    ],
  }), [data]);

  const renderEditFields = () => {
    if (!editing) return null;
    if (editing.type === 'users') return <><Form.Item name="username" label="用户名" rules={[{ required: true }]}><Input /></Form.Item><Form.Item name="email" label="邮箱"><Input /></Form.Item><Form.Item name="nickname" label="昵称"><Input /></Form.Item><Form.Item name="status" label="状态"><Select options={[{ value: 1, label: '正常' }, { value: 0, label: '禁用' }]} /></Form.Item></>;
    if (editing.type === 'employees') return <><Form.Item name="name" label="姓名" rules={[{ required: true }]}><Input /></Form.Item><Form.Item name="role" label="角色"><Input /></Form.Item><Form.Item name="position" label="职位"><Input /></Form.Item><Form.Item name="status" label="状态"><Select options={['空闲', '在线', '工作中', '思考中', '部署中'].map((v) => ({ value: v, label: v }))} /></Form.Item><Form.Item name="efficiency" label="效率"><Input type="number" /></Form.Item></>;
    if (editing.type === 'tasks') return <><Form.Item name="taskName" label="任务名称" rules={[{ required: true }]}><Input /></Form.Item><Form.Item name="priority" label="优先级"><Select options={['高', '中', '低'].map((v) => ({ value: v, label: v }))} /></Form.Item><Form.Item name="status" label="状态"><Select options={['待分配', '进行中', '部署中', '已完成', '已失败'].map((v) => ({ value: v, label: v }))} /></Form.Item><Form.Item name="progress" label="进度"><Input type="number" /></Form.Item><Form.Item name="description" label="描述"><Input /></Form.Item></>;
    return <><Form.Item name="serviceName" label="服务名称" rules={[{ required: true }]}><Input /></Form.Item><Form.Item name="image" label="镜像"><Input /></Form.Item><Form.Item name="version" label="版本"><Input /></Form.Item><Form.Item name="status" label="状态"><Select options={['运行中', '已停止', '异常'].map((v) => ({ value: v, label: v }))} /></Form.Item><Form.Item name="port" label="端口"><Input type="number" /></Form.Item></>;
  };

  const renderContent = () => {
    if (activeMenu === 'dashboard') return <Dashboard employees={data.employees} tasks={data.tasks} services={data.services} dashboard={data.dashboard} />;
    if (activeMenu === 'system') {
      return (
        <Card className="rounded-[14px] border-[#edf1f8]">
          <div className="mb-4 text-[16px] font-medium text-[#1d2740]">系统设置</div>
          <div className="space-y-4">
            {data.systemSettings.map((item) => (
              <div key={item.configKey} className="flex items-center justify-between rounded-[12px] bg-[#f6f8fc] px-4 py-3">
                <div>
                  <div className="text-[14px] font-medium text-[#1d2740]">{item.configLabel}</div>
                  <div className="text-[12px] text-[#8d99ae]">{item.configDesc}</div>
                </div>
                <Select className="w-[120px]" value={item.configValue === 'true' ? 'true' : 'false'} onChange={(value) => updateSystemSetting(item.configKey, value)} options={[{ value: 'true', label: '开启' }, { value: 'false', label: '关闭' }]} />
              </div>
            ))}
          </div>
        </Card>
      );
    }
    return <><div className="mb-4 text-[16px] font-medium text-[#1d2740]">{menuItems.find((m) => m.key === activeMenu)?.label}</div><Table columns={columnsMap[activeMenu]} dataSource={data[activeMenu]} rowKey="id" pagination={{ pageSize: 5 }} /></>;
  };

  return (
    <div className="flex h-[calc(100vh-140px)] rounded-[18px] bg-white shadow-sm">
      <div className="w-[220px] shrink-0 border-r border-[#edf1f8] p-4"><div className="mb-4 px-3 text-[18px] font-semibold text-[#1d2740]">管理后台</div><nav className="space-y-1">{menuItems.map((item) => <button key={item.key} type="button" onClick={() => setActiveMenu(item.key)} className={`flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-[14px] transition ${activeMenu === item.key ? 'bg-[#2f6bff] text-white' : 'text-[#5f6d83] hover:bg-[#f6f8fc]'}`}><span className="text-[16px]">{item.icon}</span><span>{item.label}</span></button>)}</nav></div>
      <div className="flex-1 overflow-y-auto p-5">{renderContent()}</div>
      <Modal title="编辑" open={!!editing} onOk={saveEdit} onCancel={() => setEditing(null)} okText="保存" cancelText="取消">
        <Form form={form} layout="vertical">{renderEditFields()}</Form>
      </Modal>
    </div>
  );
}
