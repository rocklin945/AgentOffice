import React, { useEffect, useMemo, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { employeeApi, officeApi } from '../api';
import { useAppStore } from '../store';
import { Panel, StatusPill } from '../components/AppPrimitives';
import HomeOfficeThreeScene from '../components/HomeOfficeThreeScene';

const avatarColors = ['#8b5cf6', '#2bb36b', '#2f6bff', '#ff8a32', '#14b8a6', '#f43f5e', '#7c3aed', '#64748b'];

function avatarColor(employee) {
  const source = `${employee?.id || ''}${employee?.name || ''}`;
  const seed = source.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return avatarColors[seed % avatarColors.length];
}

function Avatar({ employee }) {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full text-[14px] font-semibold text-white" style={{ background: avatarColor(employee) }}>
      {employee?.name?.slice(0, 1) || '?'}
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 6) return '夜深了';
  if (hour < 12) return '上午好';
  if (hour < 18) return '下午好';
  return '晚上好';
}

function getTodayText() {
  const now = new Date();
  const date = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now).replace(/\//g, '年').replace(/年(\d{2})$/, '月$1日');
  const weekday = new Intl.DateTimeFormat('zh-CN', { weekday: 'long' }).format(now);
  return `今天是 ${date} ${weekday}`;
}

function DeskAssignModal({ desk, employees, onClose, onAssign }) {
  const available = employees.filter((employee) => !employee.deskId || employee.deskId === desk.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(12,18,28,0.28)] px-6">
      <div className="w-full max-w-[560px] rounded-[18px] bg-white p-6 shadow-[0_32px_80px_rgba(18,30,52,0.18)]">
        <div className="flex items-center justify-between border-b border-[#edf1f8] pb-4">
          <div>
            <div className="text-[18px] font-semibold text-[#1d2740]">添加员工到 {desk.deskCode}</div>
            <div className="mt-1 text-[12px] text-[#8d99ae]">选择一个未分配工位的员工</div>
          </div>
          <button type="button" onClick={onClose} className="text-[22px] text-[#97a3b8]">×</button>
        </div>
        <div className="mt-4 max-h-[360px] space-y-2 overflow-auto">
          {available.map((employee) => (
            <button
              key={employee.id}
              type="button"
              onClick={() => onAssign(employee.id)}
              className="flex w-full items-center justify-between rounded-[12px] border border-[#edf1f8] bg-[#fbfcff] px-4 py-3 text-left transition hover:border-[#2f6bff] hover:bg-white"
            >
              <div className="flex items-center gap-3">
                <Avatar employee={employee} />
                <div>
                  <div className="text-[14px] font-medium text-[#1d2740]">{employee.name}</div>
                  <div className="text-[12px] text-[#8d99ae]">{employee.role} · {employee.position || '未设置职位'}</div>
                </div>
              </div>
              <StatusPill color={employee.status === '空闲' ? 'gray' : 'blue'}>{employee.status}</StatusPill>
            </button>
          ))}
          {!available.length ? <div className="rounded-[12px] bg-[#fbfcff] px-4 py-6 text-center text-[13px] text-[#8d99ae]">暂无可分配员工，请先到员工管理创建员工</div> : null}
        </div>
      </div>
    </div>
  );
}

function OfficeDeskLayout({ layout, onDeskClick, onRemoveEmployee, onCreateDesk }) {
  const gridTemplateColumns = useMemo(() => `repeat(${layout?.cols || 4}, minmax(0, 1fr))`, [layout?.cols]);

  return (
    <Panel className="relative z-20 p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="text-[22px] font-semibold text-[#1d2740]">工位布局</div>
          <div className="mt-1 text-[12px] text-[#8d99ae]">点击空闲工位添加员工</div>
        </div>
        <div className="text-[12px] text-[#8d99ae]">{layout?.rows || 0} 行 · {layout?.cols || 0} 列</div>
      </div>
      <div className="grid gap-4" style={{ gridTemplateColumns }}>
        {(layout?.desks || []).map((desk) => (
          <button
            key={desk.id}
            type="button"
            onClick={() => !desk.employee && onDeskClick(desk)}
            className={`min-h-[118px] rounded-[16px] border p-4 text-left transition ${
              desk.employee ? 'cursor-default border-[#d9e5ff] bg-white shadow-sm' : 'border-dashed border-[#cfd9ea] bg-[#fbfcff] hover:border-[#2f6bff] hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-[#8d99ae]">{desk.deskCode}</span>
              {desk.employee ? <StatusPill color="blue">{desk.employee.status}</StatusPill> : <PlusOutlined className="text-[#2f6bff]" />}
            </div>
            {desk.employee ? (
              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar employee={desk.employee} />
                  <div className="min-w-0">
                    <div className="truncate text-[15px] font-semibold text-[#1d2740]">{desk.employee.name}</div>
                    <div className="mt-1 truncate text-[12px] text-[#8d99ae]">{desk.employee.role}</div>
                  </div>
                </div>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(event) => {
                    event.stopPropagation();
                    onRemoveEmployee(desk.id);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.stopPropagation();
                      onRemoveEmployee(desk.id);
                    }
                  }}
                  className="shrink-0 rounded-[8px] border border-[#ffd4d4] px-2 py-1 text-[11px] text-[#ff5c5c] hover:bg-[#fff5f5]"
                >
                  移除
                </span>
              </div>
            ) : (
              <div className="mt-5 text-[14px] font-medium text-[#2f6bff]">空闲工位</div>
            )}
          </button>
        ))}
        <button
          type="button"
          onClick={onCreateDesk}
          className="min-h-[118px] rounded-[16px] border border-dashed border-[#b8c8e6] bg-[#f7fbff] p-4 text-center text-[#2f6bff] transition hover:border-[#2f6bff] hover:bg-white"
        >
          <div className="flex h-full min-h-[84px] flex-col items-center justify-center gap-2">
            <PlusOutlined />
            <div className="text-[14px] font-medium">新增工位</div>
          </div>
        </button>
      </div>
    </Panel>
  );
}

export default function Dashboard() {
  const { user } = useAppStore();
  const [layout, setLayout] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [activeDesk, setActiveDesk] = useState(null);

  const reload = () => {
    officeApi.getLayout().then((res) => setLayout(res.data)).catch(() => {});
    employeeApi.getList().then((res) => setEmployees(res.data || [])).catch(() => {});
  };

  useEffect(() => {
    reload();
  }, []);

  const handleAssign = async (employeeId) => {
    await officeApi.assignDesk(activeDesk.id, employeeId);
    setActiveDesk(null);
    reload();
  };

  const handleRemoveEmployee = async (deskId) => {
    await officeApi.assignDesk(deskId, null);
    reload();
  };

  const handleCreateDesk = async () => {
    await officeApi.createDesk();
    reload();
  };

  return (
    <div className="space-y-5">
      <Panel className="relative z-0 overflow-visible">
        <div className="px-6 pt-5">
          <div className="text-[28px] font-semibold text-[#1e2840]">我的办公室</div>
          <div className="mt-3 text-[16px] font-medium text-[#1f2940]">{getGreeting()}，{user?.nickname || user?.username || '管理员'}！ 👋</div>
          <div className="mt-1 text-[12px] text-[#8c97ab]">{getTodayText()}</div>
        </div>
        <div className="m-6">
          <HomeOfficeThreeScene />
        </div>
      </Panel>

      <OfficeDeskLayout
        layout={layout}
        onDeskClick={setActiveDesk}
        onRemoveEmployee={handleRemoveEmployee}
        onCreateDesk={handleCreateDesk}
      />
      {activeDesk ? <DeskAssignModal desk={activeDesk} employees={employees} onClose={() => setActiveDesk(null)} onAssign={handleAssign} /> : null}
    </div>
  );
}
