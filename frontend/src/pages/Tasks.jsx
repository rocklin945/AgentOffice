import React, { useEffect, useState } from 'react';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { employeeApi, taskApi, uiApi } from '../api';
import { Panel, ProgressTrack, StatusPill } from '../components/AppPrimitives';

function CreateTaskModal({ onClose, onCreated }) {
  const [types, setTypes] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ taskName: '', taskType: 'development', priority: '中', executorId: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    taskApi.getTypes().then((res) => {
      const nextTypes = res.data || [];
      setTypes(nextTypes);
      if (nextTypes[0]) setForm((current) => ({ ...current, taskType: nextTypes[0].value }));
    }).catch(() => {});
    employeeApi.getList().then((res) => setEmployees(res.data || [])).catch(() => {});
  }, []);

  const selectedType = types.find((type) => type.value === form.taskType);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async () => {
    if (!form.taskName.trim()) {
      setError('请填写任务名称');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await taskApi.create({
        taskName: form.taskName.trim(),
        taskType: form.taskType,
        priority: form.priority,
        executorId: form.executorId ? Number(form.executorId) : null,
        description: form.description.trim(),
      });
      await onCreated();
      onClose();
    } catch (err) {
      setError(err.message || '创建任务失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(12,18,28,0.26)] px-6">
      <div className="w-full max-w-[920px] rounded-[18px] bg-white px-8 py-7 shadow-[0_32px_80px_rgba(18,30,52,0.18)]">
        <div className="flex items-center justify-between">
          <div className="text-[18px] font-semibold text-[#1d2740]">创建任务</div>
          <button type="button" onClick={onClose} className="text-[22px] text-[#97a3b8]">×</button>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-4">
          {types.map((type) => (
            <button key={type.value} type="button" onClick={() => update('taskType', type.value)} className={`rounded-[14px] border px-5 py-5 text-left ${form.taskType === type.value ? 'border-[#2f6bff] bg-[#f7fbff]' : 'border-[#edf1f8] bg-white'}`}>
              <div className="text-[15px] font-semibold text-[#1d2740]">{type.label}</div>
              <div className="mt-2 text-[12px] leading-5 text-[#8a97ad]">{type.description}</div>
            </button>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <label className="text-[13px] text-[#5f6d83]">
            任务名称
            <input value={form.taskName} onChange={(event) => update('taskName', event.target.value)} className="mt-2 h-10 w-full rounded-[8px] border border-[#dfe7f5] px-3 outline-none focus:border-[#2f6bff]" />
          </label>
          <label className="text-[13px] text-[#5f6d83]">
            优先级
            <select value={form.priority} onChange={(event) => update('priority', event.target.value)} className="mt-2 h-10 w-full rounded-[8px] border border-[#dfe7f5] px-3 outline-none focus:border-[#2f6bff]">
              {['高', '中', '低'].map((priority) => <option key={priority} value={priority}>{priority}</option>)}
            </select>
          </label>
          <label className="text-[13px] text-[#5f6d83]">
            执行员工
            <select value={form.executorId} onChange={(event) => update('executorId', event.target.value)} className="mt-2 h-10 w-full rounded-[8px] border border-[#dfe7f5] px-3 outline-none focus:border-[#2f6bff]">
              <option value="">暂不分配</option>
              {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name} · {employee.role}</option>)}
            </select>
          </label>
          <label className="text-[13px] text-[#5f6d83]">
            任务描述
            <input value={form.description} onChange={(event) => update('description', event.target.value)} className="mt-2 h-10 w-full rounded-[8px] border border-[#dfe7f5] px-3 outline-none focus:border-[#2f6bff]" />
          </label>
        </div>
        <div className="mt-5 rounded-[12px] bg-[#fbfcff] px-4 py-3">
          <div className="text-[13px] font-medium text-[#1d2740]">默认步骤</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {(selectedType?.steps || []).map((step) => <span key={step} className="rounded-full bg-[#eef4ff] px-3 py-1 text-[12px] text-[#2f6bff]">{step}</span>)}
          </div>
        </div>
        {error ? <div className="mt-4 text-[13px] text-[#ff5c5c]">{error}</div> : null}
        <div className="mt-8 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="h-[40px] w-[92px] rounded-[8px] border border-[#dfe7f5] text-[14px] text-[#5d6a82]">取消</button>
          <button type="button" onClick={submit} disabled={saving} className="h-[40px] w-[104px] rounded-[8px] bg-[#2f6bff] text-[14px] font-medium text-white">{saving ? '创建中' : '创建'}</button>
        </div>
      </div>
    </div>
  );
}

function EditTaskModal({ task, employees, onClose, onSaved }) {
  const [form, setForm] = useState({
    taskName: task.name || '',
    description: task.description === '-' ? '' : task.description || '',
    priority: task.level || '中',
    executorId: task.executorId || '',
    status: task.status === '开发中' ? '进行中' : task.status || '待分配',
    progress: task.progress || 0,
    taskType: task.taskType === '-' ? 'custom' : task.taskType || 'custom',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async () => {
    if (!form.taskName.trim()) {
      setError('请填写任务名称');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await taskApi.update(task.id, {
        taskName: form.taskName.trim(),
        taskType: form.taskType,
        description: form.description.trim(),
        priority: form.priority,
        executorId: form.executorId ? Number(form.executorId) : null,
        status: form.status,
        progress: Number(form.progress || 0),
      });
      await onSaved();
      onClose();
    } catch (err) {
      setError(err.message || '保存任务失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(12,18,28,0.26)] px-6">
      <div className="w-full max-w-[760px] rounded-[18px] bg-white px-8 py-7 shadow-[0_32px_80px_rgba(18,30,52,0.18)]">
        <div className="flex items-center justify-between">
          <div className="text-[18px] font-semibold text-[#1d2740]">编辑任务</div>
          <button type="button" onClick={onClose} className="text-[22px] text-[#97a3b8]">×</button>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <label className="text-[13px] text-[#5f6d83]">任务名称<input value={form.taskName} onChange={(event) => update('taskName', event.target.value)} className="mt-2 h-10 w-full rounded-[8px] border border-[#dfe7f5] px-3 outline-none focus:border-[#2f6bff]" /></label>
          <label className="text-[13px] text-[#5f6d83]">优先级<select value={form.priority} onChange={(event) => update('priority', event.target.value)} className="mt-2 h-10 w-full rounded-[8px] border border-[#dfe7f5] px-3 outline-none focus:border-[#2f6bff]">{['高', '中', '低'].map((priority) => <option key={priority} value={priority}>{priority}</option>)}</select></label>
          <label className="text-[13px] text-[#5f6d83]">执行员工<select value={form.executorId || ''} onChange={(event) => update('executorId', event.target.value)} className="mt-2 h-10 w-full rounded-[8px] border border-[#dfe7f5] px-3 outline-none focus:border-[#2f6bff]"><option value="">暂不分配</option>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name} · {employee.role}</option>)}</select></label>
          <label className="text-[13px] text-[#5f6d83]">状态<select value={form.status} onChange={(event) => update('status', event.target.value)} className="mt-2 h-10 w-full rounded-[8px] border border-[#dfe7f5] px-3 outline-none focus:border-[#2f6bff]">{['待分配', '进行中', '部署中', '已完成', '已失败'].map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
          <label className="text-[13px] text-[#5f6d83]">进度<input type="number" min="0" max="100" value={form.progress} onChange={(event) => update('progress', event.target.value)} className="mt-2 h-10 w-full rounded-[8px] border border-[#dfe7f5] px-3 outline-none focus:border-[#2f6bff]" /></label>
          <label className="text-[13px] text-[#5f6d83]">任务描述<input value={form.description} onChange={(event) => update('description', event.target.value)} className="mt-2 h-10 w-full rounded-[8px] border border-[#dfe7f5] px-3 outline-none focus:border-[#2f6bff]" /></label>
        </div>
        {error ? <div className="mt-4 text-[13px] text-[#ff5c5c]">{error}</div> : null}
        <div className="mt-8 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="h-[40px] w-[92px] rounded-[8px] border border-[#dfe7f5] text-[14px] text-[#5d6a82]">取消</button>
          <button type="button" onClick={submit} disabled={saving} className="h-[40px] w-[104px] rounded-[8px] bg-[#2f6bff] text-[14px] font-medium text-white">{saving ? '保存中' : '保存'}</button>
        </div>
      </div>
    </div>
  );
}

function TaskDetail({ task, detail, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');
  const tabs = [{ key: 'overview', label: '任务概览' }, { key: 'process', label: '执行过程' }, { key: 'result', label: '成果展示' }, { key: 'files', label: '相关文件' }];
  const executionSteps = detail?.executionSteps || [];
  const executionLogs = detail?.executionLogs || [];
  const results = detail?.results || [];
  const files = detail?.files || [];

  return (
    <Panel className="p-5">
      <div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-3"><div className="text-[18px] font-semibold text-[#1d2740]">{task.name}</div><StatusPill color={task.status === '已完成' ? 'green' : task.status === '部署中' ? 'purple' : 'blue'}>{task.status}</StatusPill></div><button onClick={onClose} type="button" className="text-[18px] text-[#8d99ae] hover:text-[#5f6d83]">×</button></div>
      <div className="text-[12px] text-[#8d99ae]">创建时间：{task.createdAt} 优先级：<span className={task.level === '高' ? 'text-[#ff6a5f]' : 'text-[#ff9b42]'}>{task.level}</span></div>
      <div className="mt-4 flex gap-6 border-b border-[#edf1f8] pb-2 text-[13px]">{tabs.map((tab) => <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)} className={`pb-2 font-medium transition-colors ${activeTab === tab.key ? 'border-b-2 border-[#2f6bff] text-[#2f6bff]' : 'text-[#8d99ae] hover:text-[#5f6d83]'}`}>{tab.label}</button>)}</div>
      <div className="mt-4">
        {activeTab === 'overview' && <div className="space-y-4"><div className="grid grid-cols-4 gap-3">{results.map((item) => <div key={item.label} className="rounded-[10px] bg-[#f6f8fc] p-3"><div className="text-[11px] text-[#98a3b7]">{item.label}</div><div className="mt-1 text-[16px] font-semibold text-[#1d2740]">{item.value}</div></div>)}</div><div><div className="mb-2 text-[13px] font-medium text-[#1d2740]">当前任务进度</div><ProgressTrack value={task.progress} /></div><div className="grid grid-cols-2 gap-3 text-[13px]"><div className="text-[#8d99ae]">分配给：<span className="text-[#5f6d83]">{task.owner}</span></div><div className="text-[#8d99ae]">角色：<span className="text-[#5f6d83]">{task.role}</span></div></div></div>}
        {activeTab === 'process' && <div className="space-y-4"><div className="space-y-3">{executionSteps.map((step) => <div key={step.step} className="flex items-center justify-between rounded-[10px] bg-[#f6f8fc] px-4 py-3"><div className="flex items-center gap-3"><span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-medium ${step.status === '已完成' ? 'bg-[#2bb36b] text-white' : step.status === '开发中' ? 'bg-[#2f6bff] text-white' : 'bg-[#eef2f8] text-[#8d99ae]'}`}>{step.step}</span><div><div className="text-[13px] font-medium text-[#1d2740]">{step.name}</div><div className="text-[11px] text-[#8d99ae]">{step.role}：{step.owner}</div></div></div><StatusPill color={step.status === '已完成' ? 'green' : step.status === '开发中' ? 'blue' : 'gray'} className="text-[10px]">{step.status}</StatusPill></div>)}</div><div><div className="mb-2 text-[13px] font-medium text-[#1d2740]">执行日志</div><div className="space-y-2 rounded-[10px] bg-[#f6f8fc] p-4 text-[12px] text-[#6d7b92]">{executionLogs.map((log, i) => <div key={i}>{log}</div>)}</div></div></div>}
        {activeTab === 'result' && <div className="grid grid-cols-4 gap-3">{results.map((item) => <div key={item.label} className="rounded-[10px] bg-[#f6f8fc] p-3"><div className="text-[11px] text-[#98a3b7]">{item.label}</div><div className="mt-1 text-[16px] font-semibold text-[#1d2740]">{item.value}</div></div>)}</div>}
        {activeTab === 'files' && <div className="space-y-2">{files.map((file) => <div key={file.name} className="flex items-center justify-between rounded-[10px] border border-[#edf1f8] bg-white px-4 py-3"><div>{file.name}</div><div className="text-[11px] text-[#8d99ae]">{file.time}</div></div>)}</div>}
      </div>
    </Panel>
  );
}

export default function Tasks() {
  const [selectedTask, setSelectedTask] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [details, setDetails] = useState({});
  const [employees, setEmployees] = useState([]);
  const tabs = [{ key: 'all', label: '全部任务' }, { key: 'mine', label: '我的任务' }, { key: 'developing', label: '开发中' }, { key: 'deploying', label: '部署中' }, { key: 'done', label: '已完成' }, { key: 'failed', label: '已失败' }];

  const reload = () => uiApi.getTasks().then((res) => { setTasks(res.data.tasks || []); setDetails(res.data.details || {}); }).catch(() => {});
  useEffect(() => { reload(); employeeApi.getList().then((res) => setEmployees(res.data || [])).catch(() => {}); }, []);
  const visible = tasks.filter((task) => activeTab === 'all' || (activeTab === 'mine' && task.owner === 'Alex') || (activeTab === 'developing' && task.status === '开发中') || (activeTab === 'deploying' && task.status === '部署中') || (activeTab === 'done' && task.status === '已完成') || (activeTab === 'failed' && task.status === '已失败'));
  const deleteTask = async (task, event) => {
    event.stopPropagation();
    await taskApi.delete(task.id);
    if (selectedTask?.id === task.id) setSelectedTask(null);
    reload();
  };

  return (
    <div className="space-y-5"><div className="flex gap-5"><div className={selectedTask ? 'w-1/2' : 'w-full'}><Panel className="p-5"><div className="flex items-center justify-between"><div className="text-[18px] font-semibold text-[#1d2740]">任务管理</div><button type="button" onClick={() => setCreateOpen(true)} className="rounded-[8px] bg-[#2f6bff] px-4 py-2 text-[12px] font-medium text-white">+ 创建任务</button></div><div className="mt-4 flex gap-8 border-b border-[#edf1f8] pb-3 text-[13px]">{tabs.map((tab) => <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)} className={activeTab === tab.key ? 'font-medium text-[#2f6bff]' : 'text-[#8d99ae] hover:text-[#5f6d83]'}>{tab.label}</button>)}</div><div className="mt-4 overflow-hidden rounded-[14px] border border-[#edf1f8]"><div className="grid grid-cols-[1.6fr_0.7fr_1.4fr_0.9fr_1.1fr_1.2fr_0.7fr] bg-[#fbfcff] px-4 py-3 text-[12px] text-[#8d99ae]"><div>任务名称</div><div>优先级</div><div>分配给</div><div>状态</div><div>进度</div><div>创建时间</div><div>操作</div></div>{visible.map((task, index) => <button key={task.id} type="button" onClick={() => setSelectedTask(task)} className={`grid w-full grid-cols-[1.6fr_0.7fr_1.4fr_0.9fr_1.1fr_1.2fr_0.7fr] items-center px-4 py-4 text-left text-[13px] text-[#5f6d83] transition hover:bg-[#fafbff] ${index !== visible.length - 1 ? 'border-t border-[#f1f4f8]' : ''} ${selectedTask?.id === task.id ? 'bg-[#f7fbff]' : ''}`}><div>{task.name}</div><div className={task.level === '高' ? 'text-[#ff6a5f]' : task.level === '中' ? 'text-[#ff9b42]' : 'text-[#2bb36b]'}>{task.level}</div><div>{task.owner}</div><div><StatusPill color={task.status === '已完成' ? 'green' : task.status === '部署中' ? 'purple' : 'blue'}>{task.status}</StatusPill></div><ProgressTrack value={task.progress} /><div>{task.createdAt}</div><div className="flex gap-2"><span role="button" title="编辑" tabIndex={0} onClick={(event) => { event.stopPropagation(); setEditingTask(task); }} className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#2f6bff] hover:bg-[#eef4ff]"><EditOutlined /></span><span role="button" title="删除" tabIndex={0} onClick={(event) => deleteTask(task, event)} className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#ff5c5c] hover:bg-[#fff1f1]"><DeleteOutlined /></span></div></button>)}</div></Panel></div>{selectedTask && <div className="w-1/2"><TaskDetail task={selectedTask} detail={details[selectedTask.id]} onClose={() => setSelectedTask(null)} /></div>}</div>{createOpen ? <CreateTaskModal onClose={() => setCreateOpen(false)} onCreated={reload} /> : null}{editingTask ? <EditTaskModal task={editingTask} employees={employees} onClose={() => setEditingTask(null)} onSaved={reload} /> : null}</div>
  );
}
