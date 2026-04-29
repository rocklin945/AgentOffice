import React, { useState } from 'react';
import { CheckCircleFilled, ClockCircleFilled, SendOutlined, TeamOutlined } from '@ant-design/icons';
import { DonutChart, Panel, ProgressTrack, StatusPill } from '../components/AppPrimitives';

const staffList = [
  {
    id: 'xiaoyu',
    name: '小雨',
    title: '产品经理',
    badge: '思考中',
    badgeColor: 'purple',
    employeeNo: 'EMP1002',
    duty: '负责需求分析、原型设计、跨团队沟通与任务拆解',
    skills: ['PRD', 'Figma', 'Axure', 'Roadmap'],
    task: '梳理登录流程与异常场景',
    progress: 100,
    nextEmployee: 'alex',
    workingTime: '3小时10分钟',
    commits: '16次',
    testPass: '12个',
    deployCount: '2次',
  },
  {
    id: 'alex',
    name: 'Alex',
    title: '开发工程师',
    badge: '工作中',
    badgeColor: 'green',
    employeeNo: 'EMP1001',
    duty: '负责后端接口开发、业务逻辑实现、性能优化等工作',
    skills: ['JavaScript', 'Node.js', 'Express', 'MongoDB', 'Docker'],
    task: '开发用户登录接口',
    progress: 75,
    nextEmployee: 'testbot',
    workingTime: '2小时35分钟',
    commits: '126次',
    testPass: '45个',
    deployCount: '12次',
  },
  {
    id: 'testbot',
    name: 'TestBot',
    title: '测试工程师',
    badge: '测试中',
    badgeColor: 'blue',
    employeeNo: 'EMP1003',
    duty: '负责自动化测试、回归验证、用例编排和质量报告输出',
    skills: ['Playwright', 'Jest', 'CI/CD', 'API Test'],
    task: '编写登录接口测试用例',
    progress: 40,
    nextEmployee: 'ops',
    workingTime: '1小时52分钟',
    commits: '34次',
    testPass: '31个',
    deployCount: '4次',
  },
  {
    id: 'ops',
    name: 'OpsMaster',
    title: '运维工程师',
    badge: '部署中',
    badgeColor: 'purple',
    employeeNo: 'EMP1004',
    duty: '负责环境部署、容器编排、监控告警与日志巡检',
    skills: ['K8s', 'Nginx', 'Prometheus', 'Linux'],
    task: '部署通知服务 order-service',
    progress: 60,
    nextEmployee: null,
    workingTime: '2小时08分钟',
    commits: '52次',
    testPass: '20个',
    deployCount: '26次',
  },
];

const allMessages = [
  { id: 1, sender: '小雨', avatar: '#8b5cf6', text: '登录流程需求文档已完成，@Alex 可以开始开发了', time: '10:30' },
  { id: 2, sender: 'Alex', avatar: '#2bb36b', text: '好的，接口设计已同步到仓库', time: '10:32' },
  { id: 3, sender: 'Alex', avatar: '#2bb36b', text: '登录接口开发完成，@TestBot 可以开始测试了', time: '10:35' },
  { id: 4, sender: 'TestBot', avatar: '#2f6bff', text: '测试用例已同步到CI pipeline，@OpsMaster 准备部署环境', time: '10:38' },
  { id: 5, sender: 'OpsMaster', avatar: '#ff8a32', text: '测试环境已就绪，可以开始部署', time: '10:40' },
];

const employeeColors = {
  xiaoyu: '#8b5cf6',
  alex: '#2bb36b',
  testbot: '#2f6bff',
  ops: '#ff8a32',
};

const donutItems = [
  { label: '工作中', value: 6, color: '#2f6bff' },
  { label: '思考中', value: 2, color: '#8b5cf6' },
  { label: '测试中', value: 1, color: '#2bb36b' },
  { label: '部署中', value: 1, color: '#ff8a32' },
  { label: '空闲中', value: 2, color: '#b8becb' },
];

const statCards = [
  { label: '员工总数', value: '4人', icon: <TeamOutlined />, iconClass: 'bg-[#edf4ff] text-[#2f6bff]' },
  { label: '在线员工', value: '4人', icon: <CheckCircleFilled />, iconClass: 'bg-[#ebfbf1] text-[#2bb36b]' },
  { label: '忙碌中', value: '3人', icon: <ClockCircleFilled />, iconClass: 'bg-[#fff4ea] text-[#ff8a32]' },
  { label: '空闲中', value: '1人', icon: <ClockCircleFilled />, iconClass: 'bg-[#fff8e8] text-[#f4b53f]' },
  { label: '今日完成任务', value: '2个', icon: <CheckCircleFilled />, iconClass: 'bg-[#ebfbf1] text-[#2bb36b]' },
];

function EmployeeCard({ employee, isSelected, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-[14px] border bg-white p-3 transition-all ${
        isSelected
          ? 'border-[#2f6bff] shadow-md'
          : 'border-[#edf1f8] hover:border-[#2f6bff]'
      }`}
    >
      <div className="flex items-center gap-2">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-bold text-white"
          style={{ background: employeeColors[employee.id] }}
        >
          {employee.name.slice(0, 1)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-medium text-[#1d2740]">{employee.name}</span>
            <StatusPill color={employee.badgeColor} className="text-[10px]">{employee.badge}</StatusPill>
          </div>
          <div className="text-[11px] text-[#8d99ae]">{employee.title}</div>
        </div>
      </div>
      <div className="mt-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-[#8d99ae]">{employee.task}</span>
          <span className="text-[#5f6d83]">{employee.progress}%</span>
        </div>
        <ProgressTrack value={employee.progress} className="mt-1" />
      </div>

      {isSelected && (
        <div className="mt-3 border-t border-[#edf1f8] pt-3">
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="text-[#8d99ae]">工时：<span className="text-[#1d2740]">{employee.workingTime}</span></div>
            <div className="text-[#8d99ae]">提交：<span className="text-[#1d2740]">{employee.commits}</span></div>
            <div className="text-[#8d99ae]">测试：<span className="text-[#1d2740]">{employee.testPass}</span></div>
            <div className="text-[#8d99ae]">部署：<span className="text-[#1d2740]">{employee.deployCount}</span></div>
          </div>
          <div className="mt-2 text-[11px] text-[#8d99ae]">职责：<span className="text-[#5f6d83]">{employee.duty}</span></div>
          <div className="mt-2 flex flex-wrap gap-1">
            {employee.skills.map((skill) => (
              <span key={skill} className="rounded-full bg-[#f0f4ff] px-1.5 py-0.5 text-[10px] text-[#2f6bff]">
                {skill}
              </span>
            ))}
          </div>
          {employee.nextEmployee && (
            <div className="mt-2 rounded-[6px] bg-[#fff4ea] px-2 py-1.5 text-[11px] text-[#8d99ae]">
              下一步：<span className="font-medium text-[#ff8a32]">@{staffList.find(e => e.id === employee.nextEmployee)?.name}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ChatPanel() {
  const [messages, setMessages] = useState(allMessages);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, {
      id: Date.now(),
      sender: '我',
      avatar: '#2f6bff',
      text: input.trim(),
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    }]);
    setInput('');
  };

  const renderMessageText = (text) => {
    if (!text.includes('@')) return <span className="text-[#5f6d83]">{text}</span>;
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        const name = part.slice(1);
        const emp = staffList.find(e => e.name === name);
        const color = emp ? employeeColors[emp.id] : '#2f6bff';
        return <span key={i} className="font-medium" style={{ color }}>{part}</span>;
      }
      return <span key={i} className="text-[#5f6d83]">{part}</span>;
    });
  };

  return (
    <div className="flex h-full flex-col rounded-[16px] border border-[#edf1f8] bg-[#fbfcff] p-4 shadow-sm">
      <div className="mb-3 border-b border-[#edf1f8] pb-3">
        <div className="text-[16px] font-semibold text-[#1d2740]">群聊</div>
        <div className="mt-1 text-[12px] text-[#8d99ae]">团队协作沟通</div>
      </div>
      <div className="flex-1 space-y-3 overflow-auto">
        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-2">
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
              style={{ background: msg.avatar }}
            >
              {msg.sender.slice(0, 1)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-[12px] font-medium text-[#1d2740]">{msg.sender}</span>
                <span className="text-[11px] text-[#b8c0d0]">{msg.time}</span>
              </div>
              <div className="mt-1 rounded-[10px] rounded-tl-sm border border-[#edf1f8] bg-white px-3 py-2 text-[13px] shadow-sm">
                {renderMessageText(msg.text)}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="输入消息..."
          className="flex-1 rounded-[10px] border border-[#dde4f0] bg-white px-3 py-2 text-[13px] text-[#1d2740] placeholder-[#b8c0d0] focus:border-[#2f6bff] focus:outline-none focus:shadow-sm"
        />
        <button
          onClick={handleSend}
          className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#2f6bff] bg-[#2f6bff] text-white transition-colors hover:bg-[#1d5ae8]"
        >
          <SendOutlined />
        </button>
      </div>
    </div>
  );
}

export default function Office() {
  const [selected, setSelected] = useState(staffList[1]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-semibold text-[#1d2740]">团队协作</h1>
      </div>

      <div className="flex h-[calc(100vh-220px)] gap-4">
        <div className="flex-1 overflow-auto">
          <div className="mb-3 text-[15px] font-medium text-[#8d99ae]">员工列表</div>
          <div className="grid gap-3 xl:grid-cols-3">
            {staffList.map((emp) => (
              <EmployeeCard
                key={emp.id}
                employee={emp}
                isSelected={selected.id === emp.id}
                onClick={() => setSelected(emp)}
              />
            ))}
          </div>
        </div>
        <div className="w-[380px] shrink-0">
          <ChatPanel />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        {statCards.map((card) => (
          <Panel key={card.label} className="flex items-center gap-4 px-6 py-5">
            <div className={`flex h-11 w-11 items-center justify-center rounded-full text-[18px] ${card.iconClass}`}>
              {card.icon}
            </div>
            <div>
              <div className="text-[13px] text-[#95a1b5]">{card.label}</div>
              <div className="mt-1 text-[18px] font-semibold text-[#1d2740]">{card.value}</div>
            </div>
          </Panel>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel className="p-5">
          <div className="text-[18px] font-semibold text-[#1d2740]">员工状态分布</div>
          <div className="mt-6">
            <DonutChart items={donutItems} />
          </div>
        </Panel>

        <Panel className="p-5">
          <div className="text-[18px] font-semibold text-[#1d2740]">任务执行情况</div>
          <div className="mt-6 overflow-hidden rounded-[18px] border border-[#edf1f8]">
            <div className="h-2 w-full bg-[linear-gradient(90deg,#2f6bff_0_55%,#34d399_55%_82%,#ff7a59_82%_100%)]" />
            <div className="grid grid-cols-4 border-b border-[#edf1f8] text-center">
              {[['全部任务', '15'], ['进行中', '5'], ['已完成', '8'], ['已失败', '2']].map(([label, value]) => (
                <div key={label} className="px-4 py-4">
                  <div className="text-[13px] text-[#95a1b5]">{label}</div>
                  <div className="mt-1 text-[24px] font-semibold text-[#1d2740]">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}