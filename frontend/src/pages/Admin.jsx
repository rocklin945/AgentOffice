import React, { useEffect, useMemo, useState } from 'react';
import { Card, Table, Tag } from 'antd';
import { UserOutlined, TeamOutlined, CheckSquareOutlined, CloudOutlined, DashboardOutlined, SettingOutlined } from '@ant-design/icons';
import { uiApi } from '../api';

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

export default function Admin() {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [data, setData] = useState({ users: [], employees: [], tasks: [], services: [], dashboard: {} });

  useEffect(() => {
    uiApi.getAdmin().then((res) => setData((prev) => ({ ...prev, ...res.data }))).catch(() => {});
  }, []);

  const columnsMap = useMemo(() => ({
    users: [
      { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
      { title: '用户名', dataIndex: 'username', key: 'username' },
      { title: '邮箱', dataIndex: 'email', key: 'email' },
      { title: '状态', dataIndex: 'status', key: 'status', render: (s) => <Tag color={Number(s) === 1 ? 'green' : 'default'}>{Number(s) === 1 ? '正常' : '禁用'}</Tag> },
      { title: '创建时间', dataIndex: 'createTime', key: 'createTime', render: time },
    ],
    employees: [
      { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
      { title: '姓名', dataIndex: 'name', key: 'name' },
      { title: '角色', dataIndex: 'role', key: 'role' },
      { title: '状态', dataIndex: 'status', key: 'status', render: (s) => <Tag color={tagColor(s)}>{s}</Tag> },
      { title: '效率', dataIndex: 'efficiency', key: 'efficiency', render: percent },
      { title: '任务数', dataIndex: 'taskCount', key: 'taskCount' },
    ],
    tasks: [
      { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
      { title: '任务名称', dataIndex: 'taskName', key: 'taskName' },
      { title: '负责人', dataIndex: 'executorName', key: 'executorName', render: (v) => v || '-' },
      { title: '状态', dataIndex: 'status', key: 'status', render: (s) => <Tag color={tagColor(s)}>{s}</Tag> },
      { title: '优先级', dataIndex: 'priority', key: 'priority' },
      { title: '进度', dataIndex: 'progress', key: 'progress', render: percent },
    ],
    services: [
      { title: '服务名', dataIndex: 'serviceName', key: 'serviceName' },
      { title: '镜像', dataIndex: 'image', key: 'image' },
      { title: '状态', dataIndex: 'status', key: 'status', render: (s) => <Tag color={tagColor(s)}>{s}</Tag> },
      { title: '端口', dataIndex: 'port', key: 'port' },
      { title: 'CPU', dataIndex: 'cpuUsage', key: 'cpuUsage', render: percent },
      { title: '内存', dataIndex: 'memoryUsage', key: 'memoryUsage', render: percent },
    ],
  }), []);

  const renderContent = () => {
    if (activeMenu === 'dashboard') return <Dashboard employees={data.employees} tasks={data.tasks} services={data.services} dashboard={data.dashboard} />;
    if (activeMenu === 'system') return <Card className="rounded-[14px] border-[#edf1f8]"><div className="text-[14px] text-[#6d7b92]">系统设置数据请接入后端配置表后展示。</div></Card>;
    return <><div className="mb-4 text-[16px] font-medium text-[#1d2740]">{menuItems.find((m) => m.key === activeMenu)?.label}</div><Table columns={columnsMap[activeMenu]} dataSource={data[activeMenu]} rowKey="id" pagination={{ pageSize: 5 }} /></>;
  };

  return (
    <div className="flex h-[calc(100vh-140px)] rounded-[18px] bg-white shadow-sm">
      <div className="w-[220px] shrink-0 border-r border-[#edf1f8] p-4"><div className="mb-4 px-3 text-[18px] font-semibold text-[#1d2740]">管理后台</div><nav className="space-y-1">{menuItems.map((item) => <button key={item.key} type="button" onClick={() => setActiveMenu(item.key)} className={`flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-[14px] transition ${activeMenu === item.key ? 'bg-[#2f6bff] text-white' : 'text-[#5f6d83] hover:bg-[#f6f8fc]'}`}><span className="text-[16px]">{item.icon}</span><span>{item.label}</span></button>)}</nav></div>
      <div className="flex-1 overflow-y-auto p-5">{renderContent()}</div>
    </div>
  );
}
