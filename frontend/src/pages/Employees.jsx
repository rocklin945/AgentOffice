import React, { useEffect, useState } from 'react';
import { UserOutlined, CheckCircleFilled, CloseCircleFilled, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { employeeApi, modelConfigApi } from '../api';
import { Panel, ProgressTrack, StatusPill } from '../components/AppPrimitives';
import { getAvatarColor } from '../utils';
import { buildEmployeePageData } from '../pageData';

function AvatarToken({ employee }) {
  const name = employee?.name || '';
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-semibold text-white" style={{ background: getAvatarColor(employee) }}>
        {name.slice(0, 1)}
      </div>
      <span>{name}</span>
    </div>
  );
}

function CreateEmployeeModal({ onClose, roleCards, modelConfigs, onCreated }) {
  const steps = ['选择角色', '配置员工', '工作权限'];
  const basePermissions = [
    { code: 'task.view', name: '查看任务' },
    { code: 'task.execute', name: '执行任务' },
    { code: 'log.view', name: '查看日志' },
    { code: 'report.write', name: '输出报告' },
    { code: 'dev.code', name: '代码开发' },
    { code: 'deploy.manage', name: '部署服务' },
    { code: 'task.assign', name: '任务拆解' },
    { code: 'product.plan', name: '产品规划' },
    { code: 'code.review', name: 'Code Review' },
  ];
  const rolePermissionMap = {
    产品经理: ['task.view', 'task.assign', 'product.plan', 'report.write'],
    调度员: ['task.view', 'task.assign', 'task.execute'],
    前端开发工程师: ['task.view', 'task.execute', 'dev.code', 'log.view'],
    后端开发工程师: ['task.view', 'task.execute', 'dev.code', 'log.view'],
    CodeReviewer: ['task.view', 'task.execute', 'code.review', 'report.write', 'log.view'],
    运维工程师: ['task.view', 'deploy.manage', 'log.view'],
  };
  const [form, setForm] = useState({
    name: '',
    role: roleCards[0]?.[0] || '产品经理',
    position: '',
    status: '空闲',
    modelConfigId: modelConfigs.find((item) => item.isDefault)?.id || '',
    permissions: [],
  });
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const selectRole = (role) => {
    setForm((current) => ({
      ...current,
      role,
      permissions: rolePermissionMap[role] || ['task.view'],
    }));
  };
  const togglePermission = (code) => {
    setForm((current) => ({
      ...current,
      permissions: current.permissions.includes(code)
        ? current.permissions.filter((item) => item !== code)
        : [...current.permissions, code],
    }));
  };
  useEffect(() => {
    if (!form.permissions.length) selectRole(form.role);
  }, []);

  const next = () => {
    if (step === 1 && !form.name.trim()) {
      setError('请填写员工姓名');
      return;
    }
    setError('');
    setStep((current) => Math.min(current + 1, steps.length - 1));
  };
  const submit = async () => {
    if (!form.name.trim()) {
      setError('请填写员工姓名');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await employeeApi.create({
        name: form.name.trim(),
        role: form.role,
        position: form.position.trim(),
        status: form.status,
        modelConfigId: form.modelConfigId ? Number(form.modelConfigId) : null,
        permissions: basePermissions.map((permission) => ({
          ...permission,
          enabled: form.permissions.includes(permission.code),
        })),
      });
      await onCreated();
      onClose();
    } catch (err) {
      setError(err.message || '创建员工失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(12,18,28,0.26)] px-6">
      <div className="w-full max-w-[1080px] rounded-[18px] bg-white px-8 py-7 shadow-[0_32px_80px_rgba(18,30,52,0.18)]">
        <div className="flex items-center justify-between">
          <div className="text-[18px] font-semibold text-[#1d2740]">创建新员工</div>
          <button type="button" onClick={onClose} className="text-[22px] text-[#97a3b8]">×</button>
        </div>
        <div className="mt-7 flex items-center">
          {steps.map((stepLabel, index) => (
            <React.Fragment key={stepLabel}>
              <div className="flex items-center gap-2">
                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-medium ${index <= step ? 'bg-[#2f6bff] text-white' : 'bg-[#eef3fb] text-[#7e8ca4]'}`}>{index + 1}</span>
                <span className={`text-[13px] ${index === step ? 'font-medium text-[#1d2740]' : 'text-[#8d99ae]'}`}>{stepLabel}</span>
              </div>
              {index !== steps.length - 1 ? <div className="mx-4 h-px flex-1 bg-[#edf1f8]" /> : null}
            </React.Fragment>
          ))}
        </div>
        {step === 0 ? (
          <div className="mt-8 grid grid-cols-3 gap-4">
            {roleCards.map(([title, desc]) => (
              <button key={title} type="button" onClick={() => selectRole(title)} className={`rounded-[14px] border px-5 py-6 text-left ${form.role === title ? 'border-[#2f6bff] bg-[#f7fbff] shadow-[inset_0_0_0_1px_#a8c8ff]' : 'border-[#edf1f8] bg-white'}`}>
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef4ff] text-[#2f6bff]"><UserOutlined /></span>
                  <span className="text-[15px] font-semibold text-[#1d2740]">{title}</span>
                </div>
                <div className="mt-4 text-[13px] leading-6 text-[#8a97ad]">{desc}</div>
              </button>
            ))}
          </div>
        ) : null}
        {step === 1 ? (
          <div className="mt-8 grid grid-cols-4 gap-4">
            <label className="text-[13px] text-[#5f6d83]">员工姓名<input value={form.name} onChange={(event) => update('name', event.target.value)} className="mt-2 h-10 w-full rounded-[8px] border border-[#dfe7f5] px-3 outline-none focus:border-[#2f6bff]" /></label>
            <label className="text-[13px] text-[#5f6d83]">职位<input value={form.position} onChange={(event) => update('position', event.target.value)} className="mt-2 h-10 w-full rounded-[8px] border border-[#dfe7f5] px-3 outline-none focus:border-[#2f6bff]" /></label>
            <label className="text-[13px] text-[#5f6d83]">状态<select value={form.status} onChange={(event) => update('status', event.target.value)} className="mt-2 h-10 w-full rounded-[8px] border border-[#dfe7f5] px-3 outline-none focus:border-[#2f6bff]">{['空闲', '在线', '工作中', '思考中', '部署中'].map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
            <label className="text-[13px] text-[#5f6d83]">模型<select value={form.modelConfigId || ''} onChange={(event) => update('modelConfigId', event.target.value)} className="mt-2 h-10 w-full rounded-[8px] border border-[#dfe7f5] px-3 outline-none focus:border-[#2f6bff]"><option value="">使用默认模型</option>{modelConfigs.map((model) => <option key={model.id} value={model.id}>{model.configName} / {model.modelName}</option>)}</select></label>
          </div>
        ) : null}
        {step === 2 ? (
          <div className="mt-8 grid grid-cols-4 gap-3">
            {basePermissions.map((permission) => (
              <button key={permission.code} type="button" onClick={() => togglePermission(permission.code)} className={`rounded-[12px] border px-4 py-3 text-left text-[13px] ${form.permissions.includes(permission.code) ? 'border-[#2f6bff] bg-[#f7fbff] text-[#2f6bff]' : 'border-[#edf1f8] text-[#5f6d83]'}`}>
                {permission.name}
              </button>
            ))}
          </div>
        ) : null}
        {error ? <div className="mt-4 text-[13px] text-[#ff5c5c]">{error}</div> : null}
        <div className="mt-12 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="h-[40px] w-[92px] rounded-[8px] border border-[#dfe7f5] text-[14px] text-[#5d6a82]">取消</button>
          {step > 0 ? <button type="button" onClick={() => setStep((current) => current - 1)} className="h-[40px] w-[92px] rounded-[8px] border border-[#dfe7f5] text-[14px] text-[#5d6a82]">上一步</button> : null}
          {step < steps.length - 1 ? (
            <button type="button" onClick={next} className="h-[40px] w-[104px] rounded-[8px] bg-[#2f6bff] text-[14px] font-medium text-white">下一步</button>
          ) : (
            <button type="button" onClick={submit} disabled={saving} className="h-[40px] w-[104px] rounded-[8px] bg-[#2f6bff] text-[14px] font-medium text-white">{saving ? '创建中' : '创建'}</button>
          )}
        </div>
      </div>
    </div>
  );
}

function EditEmployeeModal({ employee, modelConfigs, onClose, onSaved }) {
  const steps = ['选择角色', '配置员工', '工作权限'];
  const basePermissions = [
    { code: 'task.view', name: '查看任务' },
    { code: 'task.execute', name: '执行任务' },
    { code: 'log.view', name: '查看日志' },
    { code: 'report.write', name: '输出报告' },
    { code: 'dev.code', name: '代码开发' },
    { code: 'deploy.manage', name: '部署服务' },
    { code: 'task.assign', name: '任务拆解' },
    { code: 'product.plan', name: '产品规划' },
    { code: 'code.review', name: 'Code Review' },
  ];
  const rolePermissionMap = {
    产品经理: ['task.view', 'task.assign', 'product.plan', 'report.write'],
    调度员: ['task.view', 'task.assign', 'task.execute'],
    前端开发工程师: ['task.view', 'task.execute', 'dev.code', 'log.view'],
    后端开发工程师: ['task.view', 'task.execute', 'dev.code', 'log.view'],
    CodeReviewer: ['task.view', 'task.execute', 'code.review', 'report.write', 'log.view'],
    运维工程师: ['task.view', 'deploy.manage', 'log.view'],
  };
  const [form, setForm] = useState({
    name: employee.name || '',
    role: employee.role || '',
    position: employee.duty === '-' ? '' : employee.duty || '',
    status: employee.status || '空闲',
    modelConfigId: employee.modelConfigId || '',
    permissions: (employee.permissions || []).filter((item) => item.enabled).map((item) => item.code),
  });
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const selectRole = (role) => {
    setForm((current) => ({ ...current, role, permissions: rolePermissionMap[role] || current.permissions }));
  };
  const togglePermission = (code) => {
    setForm((current) => ({
      ...current,
      permissions: current.permissions.includes(code) ? current.permissions.filter((item) => item !== code) : [...current.permissions, code],
    }));
  };
  const next = () => {
    if (step === 1 && !form.name.trim()) {
      setError('请填写员工姓名');
      return;
    }
    setError('');
    setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const submit = async () => {
    if (!form.name.trim()) {
      setError('请填写员工姓名');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await employeeApi.update(employee.id, {
        name: form.name.trim(),
        role: form.role,
        position: form.position.trim(),
        status: form.status,
        modelConfigId: form.modelConfigId ? Number(form.modelConfigId) : null,
        taskCount: Number(employee.tasks || 0),
        efficiency: Number(String(employee.efficiency || '0').replace('%', '')),
        permissions: basePermissions.map((permission) => ({
          ...permission,
          enabled: form.permissions.includes(permission.code),
        })),
      });
      await onSaved();
      onClose();
    } catch (err) {
      setError(err.message || '保存员工失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(12,18,28,0.26)] px-6">
      <div className="w-full max-w-[1080px] rounded-[18px] bg-white px-8 py-7 shadow-[0_32px_80px_rgba(18,30,52,0.18)]">
        <div className="flex items-center justify-between">
          <div className="text-[18px] font-semibold text-[#1d2740]">编辑员工</div>
          <button type="button" onClick={onClose} className="text-[22px] text-[#97a3b8]">×</button>
        </div>
        <div className="mt-7 flex items-center">{steps.map((stepLabel, index) => <React.Fragment key={stepLabel}><div className="flex items-center gap-2"><span className={`flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-medium ${index <= step ? 'bg-[#2f6bff] text-white' : 'bg-[#eef3fb] text-[#7e8ca4]'}`}>{index + 1}</span><span className={`text-[13px] ${index === step ? 'font-medium text-[#1d2740]' : 'text-[#8d99ae]'}`}>{stepLabel}</span></div>{index !== steps.length - 1 ? <div className="mx-4 h-px flex-1 bg-[#edf1f8]" /> : null}</React.Fragment>)}</div>
        {step === 0 ? <div className="mt-8 grid grid-cols-3 gap-4">{Object.keys(rolePermissionMap).map((role) => <button key={role} type="button" onClick={() => selectRole(role)} className={`rounded-[14px] border px-5 py-6 text-left ${form.role === role ? 'border-[#2f6bff] bg-[#f7fbff] shadow-[inset_0_0_0_1px_#a8c8ff]' : 'border-[#edf1f8] bg-white'}`}><div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef4ff] text-[#2f6bff]"><UserOutlined /></span><span className="text-[15px] font-semibold text-[#1d2740]">{role}</span></div></button>)}</div> : null}
        {step === 1 ? <div className="mt-8 grid grid-cols-4 gap-4"><label className="text-[13px] text-[#5f6d83]">员工姓名<input value={form.name} onChange={(event) => update('name', event.target.value)} className="mt-2 h-10 w-full rounded-[8px] border border-[#dfe7f5] px-3 outline-none focus:border-[#2f6bff]" /></label><label className="text-[13px] text-[#5f6d83]">职位<input value={form.position} onChange={(event) => update('position', event.target.value)} className="mt-2 h-10 w-full rounded-[8px] border border-[#dfe7f5] px-3 outline-none focus:border-[#2f6bff]" /></label><label className="text-[13px] text-[#5f6d83]">状态<select value={form.status} onChange={(event) => update('status', event.target.value)} className="mt-2 h-10 w-full rounded-[8px] border border-[#dfe7f5] px-3 outline-none focus:border-[#2f6bff]">{['空闲', '在线', '工作中', '思考中', '部署中'].map((status) => <option key={status} value={status}>{status}</option>)}</select></label><label className="text-[13px] text-[#5f6d83]">模型<select value={form.modelConfigId || ''} onChange={(event) => update('modelConfigId', event.target.value)} className="mt-2 h-10 w-full rounded-[8px] border border-[#dfe7f5] px-3 outline-none focus:border-[#2f6bff]"><option value="">使用默认模型</option>{modelConfigs.map((model) => <option key={model.id} value={model.id}>{model.configName} / {model.modelName}</option>)}</select></label></div> : null}
        {step === 2 ? <div className="mt-8 grid grid-cols-4 gap-3">{basePermissions.map((permission) => <button key={permission.code} type="button" onClick={() => togglePermission(permission.code)} className={`rounded-[12px] border px-4 py-3 text-left text-[13px] ${form.permissions.includes(permission.code) ? 'border-[#2f6bff] bg-[#f7fbff] text-[#2f6bff]' : 'border-[#edf1f8] text-[#5f6d83]'}`}>{permission.name}</button>)}</div> : null}
        {error ? <div className="mt-4 text-[13px] text-[#ff5c5c]">{error}</div> : null}
        <div className="mt-8 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="h-[40px] w-[92px] rounded-[8px] border border-[#dfe7f5] text-[14px] text-[#5d6a82]">取消</button>
          {step > 0 ? <button type="button" onClick={() => setStep((current) => current - 1)} className="h-[40px] w-[92px] rounded-[8px] border border-[#dfe7f5] text-[14px] text-[#5d6a82]">上一步</button> : null}
          {step < steps.length - 1 ? <button type="button" onClick={next} className="h-[40px] w-[104px] rounded-[8px] bg-[#2f6bff] text-[14px] font-medium text-white">下一步</button> : <button type="button" onClick={submit} disabled={saving} className="h-[40px] w-[104px] rounded-[8px] bg-[#2f6bff] text-[14px] font-medium text-white">{saving ? '保存中' : '保存'}</button>}
        </div>
      </div>
    </div>
  );
}

function EmployeeDetailPanel({ employee, onClose }) {
  const [activeTab, setActiveTab] = useState('info');
  return (
    <div className="rounded-[16px] border border-[#edf1f8] bg-[#fbfcff] p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-[#edf1f8] pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full text-[20px] font-bold text-white" style={{ background: getAvatarColor(employee) }}>{employee.name.slice(0, 1)}</div>
          <div><div className="text-[16px] font-semibold text-[#1d2740]">{employee.name}</div><div className="text-[12px] text-[#8d99ae]">{employee.role} · {employee.employeeNo}</div></div>
        </div>
        <button type="button" onClick={onClose} className="text-[20px] text-[#a0abc0]">×</button>
      </div>
      <div className="mt-4 flex border-b border-[#edf1f8] text-[14px]">
        {['基本信息', '工作权限'].map((tab, index) => (
          <button key={tab} type="button" onClick={() => setActiveTab(index === 0 ? 'info' : 'permissions')} className={`mr-6 pb-2 font-medium ${activeTab === (index === 0 ? 'info' : 'permissions') ? 'border-b-2 border-[#2f6bff] text-[#2f6bff]' : 'text-[#7b879b]'}`}>{tab}</button>
        ))}
      </div>
      {activeTab === 'info' ? (
        <div className="mt-4 space-y-4">
          <div><div className="mb-2 text-[13px] font-medium text-[#1d2740]">当前任务</div><div className="flex items-center gap-3"><span className="text-[14px] text-[#5f6d83]">{employee.task}</span><span className="text-[12px] text-[#8d99ae]">({employee.progress}%)</span></div><ProgressTrack value={employee.progress} className="mt-2" /></div>
          <div className="grid grid-cols-4 gap-3">
            {['workingTime', 'commits', 'testPass', 'deployCount'].map((key, index) => <div key={key} className="rounded-[10px] bg-white p-3"><div className="text-[11px] text-[#98a3b7]">{['工作时长', '提交次数', 'Review 通过', '部署次数'][index]}</div><div className="mt-1 text-[14px] font-medium text-[#1d2740]">{employee[key]}</div></div>)}
          </div>
          <div><div className="mb-2 text-[13px] font-medium text-[#1d2740]">职责</div><div className="text-[13px] text-[#6d7b92]">{employee.duty}</div></div>
          <div><div className="mb-2 text-[13px] font-medium text-[#1d2740]">技能</div><div className="flex flex-wrap gap-2">{employee.skills.map((skill) => <span key={skill} className="rounded-full bg-[#f0f4ff] px-3 py-1 text-[12px] text-[#2f6bff]">{skill}</span>)}</div></div>
          <div className="grid grid-cols-2 gap-3 text-[13px]"><div className="text-[#8d99ae]">员工编号：<span className="text-[#5f6d83]">{employee.employeeNo}</span></div><div className="text-[#8d99ae]">加入时间：<span className="text-[#5f6d83]">{employee.joinedAt}</span></div></div>
          <div className="text-[13px] text-[#8d99ae]">模型配置：<span className="text-[#5f6d83]">{employee.modelConfigName || employee.modelName || '默认模型'}</span></div>
        </div>
      ) : (
        <div className="mt-4"><div className="mb-3 text-[13px] font-medium text-[#1d2740]">工作权限</div><div className="grid grid-cols-2 gap-2">{(employee.permissions || []).map((permission) => <div key={permission.code || permission.name} className="flex items-center gap-2 rounded-[8px] bg-white px-3 py-2">{permission.enabled ? <CheckCircleFilled className="text-[#2bb36b]" /> : <CloseCircleFilled className="text-[#ff5c5c]" />}<span className={`text-[13px] ${permission.enabled ? 'text-[#5f6d83]' : 'text-[#9aa5b8]'}`}>{permission.name || permission}</span></div>)}</div></div>
      )}
    </div>
  );
}

export default function Employees() {
  const [open, setOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [roleCards, setRoleCards] = useState([]);
  const [modelConfigs, setModelConfigs] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const reload = async () => {
    try {
      const res = await employeeApi.getList();
      const list = res.data || [];
      const detailed = await Promise.all(list.map(async (employee) => {
        try {
          const detail = await employeeApi.getById(employee.id);
          return detail.data || employee;
        } catch {
          return employee;
        }
      }));
      const next = buildEmployeePageData(detailed);
      setEmployees(next.employees);
      setRoleCards(next.roleCards);
      const models = await modelConfigApi.getList({ enabledOnly: true });
      setModelConfigs(models.data || []);
    } catch {
      setEmployees([]);
      setRoleCards([]);
      setModelConfigs([]);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const getStatusColor = (status) => {
    if (status === '编码中') return 'green';
    if (status === 'Review中') return 'blue';
    if (status === '部署中') return 'purple';
    if (status === '思考中') return 'orange';
    return 'gray';
  };

  const deleteEmployee = async (employee, event) => {
    event.stopPropagation();
    await employeeApi.delete(employee.id);
    if (selectedEmployee?.id === employee.id) setSelectedEmployee(null);
    reload();
  };

  return (
    <>
      <div className="flex gap-5">
        <div className={selectedEmployee ? 'w-1/2' : 'w-full'}>
          <Panel className="p-5">
            <div className="flex items-start justify-between">
              <div><div className="text-[18px] font-semibold text-[#1d2740]">员工管理</div><div className="mt-1 text-[12px] text-[#98a3b7]">管理 AI 数字员工的职责、权限和专属模型</div></div>
              <button type="button" onClick={() => setOpen(true)} className="rounded-[8px] bg-[#2f6bff] px-4 py-2 text-[12px] font-medium text-white">+ 创建员工</button>
            </div>
            <div className="mt-5 overflow-hidden rounded-[14px] border border-[#edf1f8]">
              <div className="grid grid-cols-[1.4fr_1.1fr_1fr_1.2fr_0.6fr_0.7fr_0.7fr] bg-[#fbfcff] px-4 py-3 text-[12px] text-[#8d99ae]"><div>员工信息</div><div>角色</div><div>状态</div><div>模型</div><div>任务</div><div>效率</div><div>操作</div></div>
              {employees.map((emp, index) => (
                <div key={emp.id || emp.name} className={`grid grid-cols-[1.4fr_1.1fr_1fr_1.2fr_0.6fr_0.7fr_0.7fr] cursor-pointer items-center px-4 py-4 text-[13px] text-[#5f6d83] transition-colors ${index !== employees.length - 1 ? 'border-t border-[#f1f4f8]' : ''} ${selectedEmployee?.name === emp.name ? 'bg-[#f7fbff]' : 'hover:bg-[#fafbff]'}`} onClick={() => setSelectedEmployee(emp)}>
                  <AvatarToken employee={emp} /><div>{emp.role}</div><div><StatusPill color={getStatusColor(emp.status)}>{emp.status}</StatusPill></div><div className="truncate pr-2">{emp.modelConfigName || emp.modelName || '默认模型'}</div><div>{emp.tasks}</div><div>{emp.efficiency}</div><div className="flex gap-2"><button type="button" title="编辑" onClick={(event) => { event.stopPropagation(); setEditingEmployee(emp); }} className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#2f6bff] hover:bg-[#eef4ff]"><EditOutlined /></button><button type="button" title="删除" onClick={(event) => deleteEmployee(emp, event)} className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#ff5c5c] hover:bg-[#fff1f1]"><DeleteOutlined /></button></div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
        {selectedEmployee && <div className="w-1/2"><EmployeeDetailPanel employee={selectedEmployee} onClose={() => setSelectedEmployee(null)} /></div>}
      </div>
      {open ? <CreateEmployeeModal onClose={() => setOpen(false)} roleCards={roleCards} modelConfigs={modelConfigs} onCreated={reload} /> : null}
      {editingEmployee ? <EditEmployeeModal employee={editingEmployee} modelConfigs={modelConfigs} onClose={() => setEditingEmployee(null)} onSaved={reload} /> : null}
    </>
  );
}
