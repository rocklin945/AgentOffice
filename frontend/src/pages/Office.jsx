import React, { useEffect, useState } from 'react';
import { CheckCircleFilled, ClockCircleFilled, SendOutlined, TeamOutlined } from '@ant-design/icons';
import { officeApi } from '../api';
import { DonutChart, Panel, ProgressTrack, StatusPill } from '../components/AppPrimitives';

function metricIcon(label) {
  if (label?.includes('员工')) return <TeamOutlined />;
  if (label?.includes('完成')) return <CheckCircleFilled />;
  return <ClockCircleFilled />;
}

function EmployeeCard({ employee, isSelected, onClick, staff }) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-[10px] border bg-white p-2 transition-all ${
        isSelected ? 'border-[#2f6bff] shadow-sm' : 'border-[#edf1f8] hover:border-[#2f6bff]'
      }`}
    >
      <div className="flex items-center gap-2">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white"
          style={{ background: employee.color || '#2f6bff' }}
        >
          {employee.name?.slice(0, 1)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="text-[12px] font-medium text-[#1d2740]">{employee.name}</span>
            <StatusPill color={employee.badgeColor} className="text-[9px]">
              {employee.badge}
            </StatusPill>
          </div>
          <div className="text-[10px] text-[#8d99ae]">{employee.title}</div>
        </div>
      </div>

      <div className="mt-1.5">
        <div className="flex items-center justify-between text-[10px]">
          <span className="truncate text-[#8d99ae]">{employee.task}</span>
          <span className="text-[#5f6d83]">{employee.progress}%</span>
        </div>
        <ProgressTrack value={employee.progress || 0} className="mt-1" />
      </div>

      {isSelected && (
        <div className="mt-2 border-t border-[#edf1f8] pt-2">
          <div className="grid grid-cols-2 gap-1 text-[10px]">
            <div className="text-[#8d99ae]">工时：<span className="text-[#1d2740]">{employee.workingTime}</span></div>
            <div className="text-[#8d99ae]">提交：<span className="text-[#1d2740]">{employee.commits}</span></div>
            <div className="text-[#8d99ae]">测试：<span className="text-[#1d2740]">{employee.testPass}</span></div>
            <div className="text-[#8d99ae]">部署：<span className="text-[#1d2740]">{employee.deployCount}</span></div>
          </div>
          <div className="mt-1.5 text-[10px] text-[#8d99ae]">
            职责：<span className="text-[#5f6d83]">{employee.duty}</span>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {(employee.skills || []).map((skill) => (
              <span key={skill} className="rounded-full bg-[#f0f4ff] px-1 py-0.5 text-[9px] text-[#2f6bff]">
                {skill}
              </span>
            ))}
          </div>
          {employee.nextEmployee && (
            <div className="mt-1.5 rounded-[4px] bg-[#fff4ea] px-1.5 py-1 text-[10px] text-[#8d99ae]">
              下一步：
              <span className="font-medium text-[#ff8a32]">
                @{staff.find((item) => item.id === employee.nextEmployee)?.name || employee.nextEmployee}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function WorkProductsPanel({ selectedEmployee }) {
  if (!selectedEmployee) {
    return (
      <div className="flex h-full flex-col rounded-[16px] border border-[#edf1f8] bg-[#fbfcff] p-4 shadow-sm">
        <div className="text-[13px] text-[#8d99ae]">等待后端员工数据...</div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-[16px] border border-[#edf1f8] bg-[#fbfcff] p-4 shadow-sm">
      <div className="mb-3 border-b border-[#edf1f8] pb-3">
        <div className="text-[15px] font-semibold text-[#1d2740]">工作产物</div>
      </div>
      <div className="flex-1 space-y-2 overflow-auto">
        {(selectedEmployee.workProducts || []).map((product, index) => (
          <div
            key={`${product.name}-${index}`}
            className="cursor-pointer rounded-[10px] border border-[#edf1f8] bg-white p-3 hover:border-[#2f6bff]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
                  style={{ background: selectedEmployee.color || '#2f6bff' }}
                >
                  {selectedEmployee.name?.slice(0, 1)}
                </div>
                <span className="text-[13px] font-medium text-[#1d2740]">{product.name}</span>
              </div>
              <StatusPill color={product.status === '已完成' ? 'green' : 'blue'} className="text-[10px]">
                {product.status}
              </StatusPill>
            </div>
            <div className="mt-2 text-[11px] text-[#8d99ae]">更新时间：{product.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatPanel({ initialMessages, staff }) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        sender: '我',
        avatar: '#2f6bff',
        text: input.trim(),
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setInput('');
  };

  const renderMessageText = (text) => {
    if (!text?.includes('@')) return <span className="text-[#5f6d83]">{text}</span>;
    return text.split(/(@\w+)/g).map((part, index) => {
      if (part.startsWith('@')) {
        const emp = staff.find((item) => item.name === part.slice(1));
        return (
          <span key={`${part}-${index}`} className="font-medium" style={{ color: emp?.color || '#2f6bff' }}>
            {part}
          </span>
        );
      }
      return <span key={`${part}-${index}`} className="text-[#5f6d83]">{part}</span>;
    });
  };

  return (
    <div className="flex h-full flex-col rounded-[16px] border border-[#edf1f8] bg-[#fbfcff] p-4 shadow-sm">
      <div className="mb-3 border-b border-[#edf1f8] pb-3">
        <div className="text-[16px] font-semibold text-[#1d2740]">群聊</div>
      </div>
      <div className="flex-1 space-y-3 overflow-auto">
        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-2">
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
              style={{ background: msg.avatar || '#2f6bff' }}
            >
              {msg.sender?.slice(0, 1)}
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
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && handleSend()}
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
  const [staff, setStaff] = useState([]);
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState([]);
  const [donut, setDonut] = useState([]);
  const [taskSummary, setTaskSummary] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let alive = true;

    officeApi.getCollaboration()
      .then((res) => {
        if (!alive || !res.data) return;
        const nextStaff = res.data.staffList || [];
        setStaff(nextStaff);
        setMessages(res.data.messages || []);
        setStats(res.data.statCards || []);
        setDonut(res.data.donutItems || []);
        setTaskSummary(res.data.taskSummary || []);
        setSelected(nextStaff[1] || nextStaff[0] || null);
      })
      .catch(() => {
        if (!alive) return;
        setStaff([]);
        setMessages([]);
        setStats([]);
        setDonut([]);
        setTaskSummary([]);
        setSelected(null);
      });

    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex h-[calc(100vh-180px)] gap-4">
        <div className="w-[280px] shrink-0">
          <div className="flex h-full flex-col rounded-[16px] border border-[#edf1f8] bg-[#fbfcff] p-4 shadow-sm">
            <div className="mb-3 border-b border-[#edf1f8] pb-3">
              <div className="text-[15px] font-semibold text-[#1d2740]">员工列表</div>
            </div>
            <div className="flex-1 space-y-2 overflow-auto">
              {staff.map((emp) => (
                <EmployeeCard
                  key={emp.id}
                  employee={emp}
                  staff={staff}
                  isSelected={selected?.id === emp.id}
                  onClick={() => setSelected(emp)}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1">
          <WorkProductsPanel selectedEmployee={selected} />
        </div>
        <div className="w-[380px] shrink-0">
          <ChatPanel initialMessages={messages} staff={staff} />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        {stats.map((card) => (
          <Panel key={card.label} className="flex items-center gap-4 px-6 py-5">
            <div className={`flex h-11 w-11 items-center justify-center rounded-full text-[18px] ${card.iconClass}`}>
              {metricIcon(card.label)}
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
            <DonutChart items={donut} />
          </div>
        </Panel>

        <Panel className="p-5">
          <div className="text-[18px] font-semibold text-[#1d2740]">任务执行情况</div>
          <div className="mt-6 overflow-hidden rounded-[18px] border border-[#edf1f8]">
            <div className="h-2 w-full bg-[linear-gradient(90deg,#2f6bff_0_55%,#34d399_55%_82%,#ff7a59_82%_100%)]" />
            <div className="grid grid-cols-4 border-b border-[#edf1f8] text-center">
              {taskSummary.map(([label, value]) => (
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
