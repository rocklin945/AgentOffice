import React, { useEffect, useState } from 'react';
import { uiApi } from '../api';
import { Panel, ProgressTrack, StatusPill } from '../components/AppPrimitives';

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
  const [tasks, setTasks] = useState([]);
  const [details, setDetails] = useState({});
  const tabs = [{ key: 'all', label: '全部任务' }, { key: 'mine', label: '我的任务' }, { key: 'developing', label: '开发中' }, { key: 'deploying', label: '部署中' }, { key: 'done', label: '已完成' }, { key: 'failed', label: '已失败' }];

  useEffect(() => { uiApi.getTasks().then((res) => { setTasks(res.data.tasks || []); setDetails(res.data.details || {}); }).catch(() => {}); }, []);
  const visible = tasks.filter((task) => activeTab === 'all' || (activeTab === 'mine' && task.owner === 'Alex') || (activeTab === 'developing' && task.status === '开发中') || (activeTab === 'deploying' && task.status === '部署中') || (activeTab === 'done' && task.status === '已完成') || (activeTab === 'failed' && task.status === '已失败'));

  return (
    <div className="space-y-5"><div className="flex gap-5"><div className={selectedTask ? 'w-1/2' : 'w-full'}><Panel className="p-5"><div className="flex items-center justify-between"><div className="text-[18px] font-semibold text-[#1d2740]">任务管理</div><button type="button" className="rounded-[8px] bg-[#2f6bff] px-4 py-2 text-[12px] font-medium text-white">+ 创建任务</button></div><div className="mt-4 flex gap-8 border-b border-[#edf1f8] pb-3 text-[13px]">{tabs.map((tab) => <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)} className={activeTab === tab.key ? 'font-medium text-[#2f6bff]' : 'text-[#8d99ae] hover:text-[#5f6d83]'}>{tab.label}</button>)}</div><div className="mt-4 overflow-hidden rounded-[14px] border border-[#edf1f8]"><div className="grid grid-cols-[1.6fr_0.7fr_1.4fr_0.9fr_1.1fr_1.2fr_0.4fr] bg-[#fbfcff] px-4 py-3 text-[12px] text-[#8d99ae]"><div>任务名称</div><div>优先级</div><div>分配给</div><div>状态</div><div>进度</div><div>创建时间</div><div>操作</div></div>{visible.map((task, index) => <button key={task.id} type="button" onClick={() => setSelectedTask(task)} className={`grid w-full grid-cols-[1.6fr_0.7fr_1.4fr_0.9fr_1.1fr_1.2fr_0.4fr] items-center px-4 py-4 text-left text-[13px] text-[#5f6d83] transition hover:bg-[#fafbff] ${index !== visible.length - 1 ? 'border-t border-[#f1f4f8]' : ''} ${selectedTask?.id === task.id ? 'bg-[#f7fbff]' : ''}`}><div>{task.name}</div><div className={task.level === '高' ? 'text-[#ff6a5f]' : task.level === '中' ? 'text-[#ff9b42]' : 'text-[#2bb36b]'}>{task.level}</div><div>{task.owner}</div><div><StatusPill color={task.status === '已完成' ? 'green' : task.status === '部署中' ? 'purple' : 'blue'}>{task.status}</StatusPill></div><ProgressTrack value={task.progress} /><div>{task.createdAt}</div><div>⋯</div></button>)}</div></Panel></div>{selectedTask && <div className="w-1/2"><TaskDetail task={selectedTask} detail={details[selectedTask.id]} onClose={() => setSelectedTask(null)} /></div>}</div></div>
  );
}
