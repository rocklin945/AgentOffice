import React, { useState } from 'react';
import { Panel, ProgressTrack, StatusPill } from '../components/AppPrimitives';

const tasks = [
  { id: 'login-api', name: '开发用户登录接口', level: '高', owner: 'Alex', role: '开发工程师', status: '开发中', progress: 75, createdAt: '2024-05-20 10:30' },
  { id: 'login-test', name: '编写登录接口测试用例', level: '中', owner: 'TestBot', role: '测试工程师', status: '开发中', progress: 60, createdAt: '2024-05-20 10:35' },
  { id: 'deploy-env', name: '部署登录服务到测试环境', level: '高', owner: 'OpsMaster', role: '运维工程师', status: '部署中', progress: 40, createdAt: '2024-05-20 10:40' },
  { id: 'analysis', name: '用户登录功能需求分析', level: '中', owner: 'ProductKing', role: '产品经理', status: '已完成', progress: 100, createdAt: '2024-05-20 09:20' },
  { id: 'doc', name: '编写接口文档', level: '低', owner: 'DocHelper', role: '文档工程师', status: '已完成', progress: 100, createdAt: '2024-05-20 09:30' },
];

const executionSteps = [
  { step: 1, name: '需求分析', role: '产品经理', owner: 'ProductKing', status: '已完成' },
  { step: 2, name: '接口设计', role: '开发工程师', owner: 'Alex', status: '已完成' },
  { step: 3, name: '代码开发', role: '开发工程师', owner: 'Alex', status: '开发中' },
  { step: 4, name: '测试验证', role: '测试工程师', owner: 'TestBot', status: '待开始' },
  { step: 5, name: '部署上线', role: '运维工程师', owner: 'OpsMaster', status: '待开始' },
];

const executionLogs = [
  '10:30 任务创建',
  '10:32 ProductKing 开始需求分析',
  '10:35 需求分析完成',
  '10:40 Alex 开始接口设计',
  '10:45 接口设计完成',
  '10:50 Alex 开始代码开发',
  '11:20 代码开发完成',
];

const results = [
  { label: '代码提交', value: '12次' },
  { label: '测试用例', value: '28个' },
  { label: '通过率', value: '92%' },
  { label: '覆盖分支', value: '85%' },
];

const files = [
  { name: 'login.js', type: '接口文件', size: '2.4KB', time: '11:20' },
  { name: 'login.test.js', type: '测试文件', size: '1.8KB', time: '11:15' },
  { name: '接口文档.md', type: '文档', size: '5.2KB', time: '10:45' },
  { name: '部署配置.yaml', type: '配置文件', size: '1.1KB', time: '11:25' },
];

function TaskDetail({ task, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');
  const tabs = [
    { key: 'overview', label: '任务概览' },
    { key: 'process', label: '执行过程' },
    { key: 'result', label: '成果展示' },
    { key: 'files', label: '相关文件' },
  ];

  return (
    <Panel className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-[18px] font-semibold text-[#1d2740]">{task.name}</div>
          <StatusPill color={task.status === '已完成' ? 'green' : task.status === '部署中' ? 'purple' : 'blue'}>
            {task.status}
          </StatusPill>
        </div>
        <button onClick={onClose} type="button" className="text-[18px] text-[#8d99ae] hover:text-[#5f6d83]">×</button>
      </div>
      <div className="text-[12px] text-[#8d99ae]">
        创建时间：{task.createdAt} 优先级：
        <span className={task.level === '高' ? 'text-[#ff6a5f]' : 'text-[#ff9b42]'}>{task.level}</span>
      </div>

      <div className="mt-4 flex gap-6 border-b border-[#edf1f8] pb-2 text-[13px]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`pb-2 font-medium transition-colors ${
              activeTab === tab.key
                ? 'border-b-2 border-[#2f6bff] text-[#2f6bff]'
                : 'text-[#8d99ae] hover:text-[#5f6d83]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-3">
              {results.map((item) => (
                <div key={item.label} className="rounded-[10px] bg-[#f6f8fc] p-3">
                  <div className="text-[11px] text-[#98a3b7]">{item.label}</div>
                  <div className="mt-1 text-[16px] font-semibold text-[#1d2740]">{item.value}</div>
                </div>
              ))}
            </div>
            <div>
              <div className="mb-2 text-[13px] font-medium text-[#1d2740]">当前任务进度</div>
              <ProgressTrack value={task.progress} />
            </div>
            <div className="grid grid-cols-2 gap-3 text-[13px]">
              <div className="text-[#8d99ae]">分配给：<span className="text-[#5f6d83]">{task.owner}</span></div>
              <div className="text-[#8d99ae]">角色：<span className="text-[#5f6d83]">{task.role}</span></div>
            </div>
          </div>
        )}

        {activeTab === 'process' && (
          <div className="space-y-4">
            <div className="space-y-3">
              {executionSteps.map((step) => (
                <div key={step.step} className="flex items-center justify-between rounded-[10px] bg-[#f6f8fc] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-medium ${
                      step.status === '已完成' ? 'bg-[#2bb36b] text-white' :
                      step.status === '开发中' ? 'bg-[#2f6bff] text-white' :
                      'bg-[#eef2f8] text-[#8d99ae]'
                    }`}>
                      {step.step}
                    </span>
                    <div>
                      <div className="text-[13px] font-medium text-[#1d2740]">{step.name}</div>
                      <div className="text-[11px] text-[#8d99ae]">{step.role}：{step.owner}</div>
                    </div>
                  </div>
                  <StatusPill
                    color={step.status === '已完成' ? 'green' : step.status === '开发中' ? 'blue' : 'gray'}
                    className="text-[10px]"
                  >
                    {step.status}
                  </StatusPill>
                </div>
              ))}
            </div>
            <div>
              <div className="mb-2 text-[13px] font-medium text-[#1d2740]">执行日志</div>
              <div className="space-y-2 rounded-[10px] bg-[#f6f8fc] p-4 text-[12px] text-[#6d7b92]">
                {executionLogs.map((log, i) => (
                  <div key={i}>{log}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'result' && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-3">
              {results.map((item) => (
                <div key={item.label} className="rounded-[10px] bg-[#f6f8fc] p-3">
                  <div className="text-[11px] text-[#98a3b7]">{item.label}</div>
                  <div className="mt-1 text-[16px] font-semibold text-[#1d2740]">{item.value}</div>
                </div>
              ))}
            </div>
            <div className="rounded-[10px] border border-[#edf1f8] p-4">
              <div className="mb-3 text-[13px] font-medium text-[#1d2740]">代码片段</div>
              <div className="rounded-[8px] bg-[#1a2235] p-4 font-mono text-[12px] text-[#c8d4e8]">
                <div><span className="text-[#6b7a99]">// login.js</span></div>
                <div><span className="text-[#f3a64a]">router</span>.<span className="text-[#22b07d]">post</span>(<span className="text-[#a9c0db]">'/login'</span>, <span className="text-[#8b5cf6]">async</span> (req, res) {'{'}...</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'files' && (
          <div className="space-y-2">
            {files.map((file) => (
              <div key={file.name} className="flex items-center justify-between rounded-[10px] border border-[#edf1f8] bg-white px-4 py-3 hover:border-[#2f6bff] cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#f0f4ff] text-[#2f6bff]">
                    📄
                  </div>
                  <div>
                    <div className="text-[13px] font-medium text-[#1d2740]">{file.name}</div>
                    <div className="text-[11px] text-[#8d99ae]">{file.type} · {file.size}</div>
                  </div>
                </div>
                <div className="text-[11px] text-[#8d99ae]">{file.time}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Panel>
  );
}

export default function Tasks() {
  const [selectedTask, setSelectedTask] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { key: 'all', label: '全部任务' },
    { key: 'mine', label: '我的任务' },
    { key: 'developing', label: '开发中' },
    { key: 'deploying', label: '部署中' },
    { key: 'done', label: '已完成' },
    { key: 'failed', label: '已失败' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex gap-5">
        <div className={selectedTask ? 'w-1/2' : 'w-full'}>
          <Panel className="p-5">
            <div className="flex items-center justify-between">
              <div className="text-[18px] font-semibold text-[#1d2740]">任务管理</div>
              <button type="button" className="rounded-[8px] bg-[#2f6bff] px-4 py-2 text-[12px] font-medium text-white">
                + 创建任务
              </button>
            </div>

            <div className="mt-4 flex gap-8 border-b border-[#edf1f8] pb-3 text-[13px]">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={activeTab === tab.key ? 'font-medium text-[#2f6bff]' : 'text-[#8d99ae] hover:text-[#5f6d83]'}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="mt-4 overflow-hidden rounded-[14px] border border-[#edf1f8]">
              <div className="grid grid-cols-[1.6fr_0.7fr_1.4fr_0.9fr_1.1fr_1.2fr_0.4fr] bg-[#fbfcff] px-4 py-3 text-[12px] text-[#8d99ae]">
                <div>任务名称</div>
                <div>优先级</div>
                <div>分配给</div>
                <div>状态</div>
                <div>进度</div>
                <div>创建时间</div>
                <div>操作</div>
              </div>
              {tasks.filter((task) => {
                if (activeTab === 'all') return true;
                if (activeTab === 'mine') return task.owner === 'Alex';
                if (activeTab === 'developing') return task.status === '开发中';
                if (activeTab === 'deploying') return task.status === '部署中';
                if (activeTab === 'done') return task.status === '已完成';
                if (activeTab === 'failed') return task.status === '已失败';
                return true;
              }).map((task, index) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => setSelectedTask(task)}
                  className={`grid w-full grid-cols-[1.6fr_0.7fr_1.4fr_0.9fr_1.1fr_1.2fr_0.4fr] items-center px-4 py-4 text-left text-[13px] text-[#5f6d83] transition hover:bg-[#fafbff] ${
                    index !== tasks.length - 1 ? 'border-t border-[#f1f4f8]' : ''
                  } ${selectedTask?.id === task.id ? 'bg-[#f7fbff]' : ''}`}
                >
                  <div>{task.name}</div>
                  <div className={task.level === '高' ? 'text-[#ff6a5f]' : task.level === '中' ? 'text-[#ff9b42]' : 'text-[#2bb36b]'}>
                    {task.level}
                  </div>
                  <div>{task.owner}</div>
                  <div>
                    <StatusPill color={task.status === '已完成' ? 'green' : task.status === '部署中' ? 'purple' : 'blue'}>
                      {task.status}
                    </StatusPill>
                  </div>
                  <ProgressTrack value={task.progress} />
                  <div>{task.createdAt}</div>
                  <div>⋯</div>
                </button>
              ))}
            </div>
          </Panel>
        </div>

        {selectedTask && (
          <div className="w-1/2">
            <TaskDetail task={selectedTask} onClose={() => setSelectedTask(null)} />
          </div>
        )}
      </div>
    </div>
  );
}