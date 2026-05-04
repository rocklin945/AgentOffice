import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card, Form, Input, Modal, Select, Steps, Table, Tag, message } from 'antd';
import * as echarts from 'echarts';
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
      <div className="grid grid-cols-2 gap-4">
        <ChartCard title="任务状态分布" option={{
          tooltip: { trigger: 'item' },
          color: ['#2f6bff', '#2bb36b', '#ff8a32', '#ff5c5c', '#8b5cf6'],
          series: [{ type: 'pie', radius: ['45%', '70%'], data: ['待分配', '进行中', '部署中', '已完成', '已失败'].map((status) => ({ name: status, value: tasks.filter((task) => task.status === status).length })) }],
        }} />
        <ChartCard title="员工任务数排行" option={{
          tooltip: { trigger: 'axis' },
          grid: { left: 36, right: 18, top: 28, bottom: 32 },
          xAxis: { type: 'category', data: employees.map((item) => item.name), axisLabel: { color: '#8d99ae' } },
          yAxis: { type: 'value', axisLabel: { color: '#8d99ae' }, splitLine: { lineStyle: { color: '#eef2f8' } } },
          color: ['#2f6bff'],
          series: [{ type: 'bar', data: employees.map((item) => item.taskCount || 0), barWidth: 24, itemStyle: { borderRadius: [6, 6, 0, 0] } }],
        }} />
      </div>
    </div>
  );
}

function ChartCard({ title, option }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return undefined;
    const chart = echarts.init(ref.current);
    chart.setOption(option);
    const resize = () => chart.resize();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      chart.dispose();
    };
  }, [option]);
  return <div className="rounded-[14px] border border-[#edf1f8] bg-white p-4"><div className="mb-3 text-[14px] font-medium text-[#1d2740]">{title}</div><div ref={ref} className="h-[260px] w-full" /></div>;
}

function ActionButtons({ onEdit, onDelete }) {
  return (
    <div className="flex gap-2">
      <Button size="small" type="text" title="编辑" icon={<EditOutlined />} onClick={onEdit} className="!text-[#2f6bff]" />
      <Button size="small" type="text" danger title="删除" icon={<DeleteOutlined />} onClick={onDelete} />
    </div>
  );
}

const employeeEditSteps = [
  { title: '选择角色' },
  { title: '配置员工' },
  { title: '工作权限' },
];

const employeePermissions = [
  { code: 'task.view', name: '查看任务' },
  { code: 'task.execute', name: '执行任务' },
  { code: 'log.view', name: '查看日志' },
  { code: 'report.write', name: '输出报告' },
  { code: 'dev.code', name: '代码开发' },
  { code: 'deploy.manage', name: '部署服务' },
  { code: 'task.assign', name: '任务拆解' },
  { code: 'product.plan', name: '产品规划' },
];

const employeeRolePermissions = {
  开发工程师: ['task.view', 'task.execute', 'dev.code', 'log.view'],
  测试工程师: ['task.view', 'task.execute', 'report.write', 'log.view'],
  运维工程师: ['task.view', 'deploy.manage', 'log.view'],
  产品经理: ['task.view', 'task.assign', 'product.plan', 'report.write'],
};

export default function Admin() {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [data, setData] = useState({ users: [], employees: [], tasks: [], services: [], dashboard: {}, systemSettings: [] });
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const [employeeStep, setEmployeeStep] = useState(0);
  const [employeeDraft, setEmployeeDraft] = useState(null);

  const reload = () => uiApi.getAdmin().then((res) => setData((prev) => ({ ...prev, ...res.data }))).catch(() => {});
  useEffect(() => { reload(); }, []);

  const openEdit = (type, record) => {
    setEditing({ type, record });
    if (type === 'employees') {
      setEmployeeStep(0);
      setEmployeeDraft({
        name: record.name || '',
        role: record.role || '开发工程师',
        position: record.position || '',
        status: record.status || '空闲',
        efficiency: Number(record.efficiency || 0),
        permissions: (record.permissions || [])
          .filter((permission) => permission.enabled === true || permission.enabled === 1)
          .map((permission) => permission.permissionCode || permission.code),
      });
      return;
    }
    form.setFieldsValue({
      ...record,
      name: record.name || record.taskName || record.serviceName || record.username,
      role: record.role || 'user',
      status: type === 'users' ? Number(record.status ?? 1) : record.status,
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
      await adminApi.updateUser(record.id, { ...record, ...values, username: values.username || values.name, status: Number(values.status ?? 1), role: values.role || 'user' });
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

  const updateEmployeeDraft = (key, value) => {
    setEmployeeDraft((current) => ({ ...current, [key]: value }));
  };

  const selectEmployeeRole = (role) => {
    setEmployeeDraft((current) => ({
      ...current,
      role,
      permissions: employeeRolePermissions[role] || current.permissions,
    }));
  };

  const toggleEmployeePermission = (code) => {
    setEmployeeDraft((current) => ({
      ...current,
      permissions: current.permissions.includes(code)
        ? current.permissions.filter((item) => item !== code)
        : [...current.permissions, code],
    }));
  };

  const nextEmployeeStep = () => {
    if (employeeStep === 1 && !employeeDraft.name.trim()) {
      message.error('请填写员工姓名');
      return;
    }
    setEmployeeStep((current) => Math.min(current + 1, employeeEditSteps.length - 1));
  };

  const saveEmployeeEdit = async () => {
    if (!employeeDraft.name.trim()) {
      message.error('请填写员工姓名');
      return;
    }
    const { record } = editing;
    await employeeApi.update(record.id, {
      ...record,
      name: employeeDraft.name.trim(),
      role: employeeDraft.role,
      position: employeeDraft.position.trim(),
      status: employeeDraft.status,
      taskCount: record.taskCount || 0,
      efficiency: Number(employeeDraft.efficiency || 0),
      permissions: employeePermissions.map((permission) => ({
        ...permission,
        enabled: employeeDraft.permissions.includes(permission.code),
      })),
    });
    message.success('保存成功');
    setEditing(null);
    setEmployeeDraft(null);
    setEmployeeStep(0);
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
      { title: '权限', dataIndex: 'role', key: 'role', render: (role) => <Tag color={role === 'admin' ? 'blue' : 'default'}>{role === 'admin' ? '管理员' : '普通用户'}</Tag> },
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
    if (editing.type === 'users') return <><Form.Item name="username" label="用户名" rules={[{ required: true }]}><Input /></Form.Item><Form.Item name="email" label="邮箱"><Input /></Form.Item><Form.Item name="nickname" label="昵称"><Input /></Form.Item><Form.Item name="phone" label="手机号"><Input /></Form.Item><Form.Item name="role" label="后台权限"><Select options={[{ value: 'user', label: '普通用户' }, { value: 'admin', label: '管理员' }]} /></Form.Item><Form.Item name="status" label="状态"><Select options={[{ value: 1, label: '正常' }, { value: 0, label: '禁用' }]} /></Form.Item></>;
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

  const renderEmployeeEditStep = () => {
    if (!employeeDraft) return null;
    if (employeeStep === 0) {
      return (
        <div className="grid grid-cols-2 gap-3">
          {Object.keys(employeeRolePermissions).map((role) => (
            <button key={role} type="button" onClick={() => selectEmployeeRole(role)} className={`rounded-[12px] border px-4 py-4 text-left ${employeeDraft.role === role ? 'border-[#2f6bff] bg-[#f7fbff] text-[#2f6bff]' : 'border-[#edf1f8] text-[#5f6d83]'}`}>
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef4ff] text-[#2f6bff]"><UserOutlined /></span>
                <span className="text-[14px] font-medium">{role}</span>
              </div>
            </button>
          ))}
        </div>
      );
    }
    if (employeeStep === 1) {
      return (
        <div className="grid grid-cols-2 gap-4">
          <label className="text-[13px] text-[#5f6d83]">员工姓名<input value={employeeDraft.name} onChange={(event) => updateEmployeeDraft('name', event.target.value)} className="mt-2 h-10 w-full rounded-[8px] border border-[#dfe7f5] px-3 outline-none focus:border-[#2f6bff]" /></label>
          <label className="text-[13px] text-[#5f6d83]">职位<input value={employeeDraft.position} onChange={(event) => updateEmployeeDraft('position', event.target.value)} className="mt-2 h-10 w-full rounded-[8px] border border-[#dfe7f5] px-3 outline-none focus:border-[#2f6bff]" /></label>
          <label className="text-[13px] text-[#5f6d83]">状态<select value={employeeDraft.status} onChange={(event) => updateEmployeeDraft('status', event.target.value)} className="mt-2 h-10 w-full rounded-[8px] border border-[#dfe7f5] px-3 outline-none focus:border-[#2f6bff]">{['空闲', '在线', '工作中', '思考中', '部署中'].map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
          <label className="text-[13px] text-[#5f6d83]">效率<input type="number" value={employeeDraft.efficiency} onChange={(event) => updateEmployeeDraft('efficiency', event.target.value)} className="mt-2 h-10 w-full rounded-[8px] border border-[#dfe7f5] px-3 outline-none focus:border-[#2f6bff]" /></label>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-2 gap-3">
        {employeePermissions.map((permission) => (
          <button key={permission.code} type="button" onClick={() => toggleEmployeePermission(permission.code)} className={`rounded-[10px] border px-4 py-3 text-left text-[13px] ${employeeDraft.permissions.includes(permission.code) ? 'border-[#2f6bff] bg-[#f7fbff] text-[#2f6bff]' : 'border-[#edf1f8] text-[#5f6d83]'}`}>
            {permission.name}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="flex h-[calc(100vh-140px)] rounded-[18px] bg-white shadow-sm">
      <div className="w-[220px] shrink-0 border-r border-[#edf1f8] p-4"><div className="mb-4 px-3 text-[18px] font-semibold text-[#1d2740]">管理后台</div><nav className="space-y-1">{menuItems.map((item) => <button key={item.key} type="button" onClick={() => setActiveMenu(item.key)} className={`flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-[14px] transition ${activeMenu === item.key ? 'bg-[#2f6bff] text-white' : 'text-[#5f6d83] hover:bg-[#f6f8fc]'}`}><span className="text-[16px]">{item.icon}</span><span>{item.label}</span></button>)}</nav></div>
      <div className="flex-1 overflow-y-auto p-5">{renderContent()}</div>
      <Modal
        title="编辑员工"
        open={editing?.type === 'employees'}
        onCancel={() => {
          setEditing(null);
          setEmployeeDraft(null);
          setEmployeeStep(0);
        }}
        footer={[
          <Button key="cancel" onClick={() => setEditing(null)}>取消</Button>,
          employeeStep > 0 ? <Button key="prev" onClick={() => setEmployeeStep((current) => current - 1)}>上一步</Button> : null,
          employeeStep < employeeEditSteps.length - 1
            ? <Button key="next" type="primary" onClick={nextEmployeeStep}>下一步</Button>
            : <Button key="save" type="primary" onClick={saveEmployeeEdit}>保存</Button>,
        ]}
      >
        <Steps className="mb-5" size="small" current={employeeStep} items={employeeEditSteps} />
        {renderEmployeeEditStep()}
      </Modal>
      <Modal title="编辑" open={!!editing && editing.type !== 'employees'} onOk={saveEdit} onCancel={() => setEditing(null)} okText="保存" cancelText="取消">
        <Form form={form} layout="vertical">{renderEditFields()}</Form>
      </Modal>
    </div>
  );
}
