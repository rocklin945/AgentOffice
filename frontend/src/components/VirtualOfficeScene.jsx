import React from 'react';
import {
  CheckCircleFilled,
  ClockCircleFilled,
  DashboardFilled,
  TeamOutlined,
} from '@ant-design/icons';

const stats = [
  {
    label: '员工总数',
    value: '5',
    icon: <TeamOutlined />,
    iconBg: 'bg-[#eaf2ff]',
    iconColor: 'text-[#2f6bff]',
  },
  {
    label: '进行中任务',
    value: '12',
    icon: <ClockCircleFilled />,
    iconBg: 'bg-[#ebfbf1]',
    iconColor: 'text-[#29b36a]',
  },
  {
    label: '今日完成',
    value: '8',
    icon: <DashboardFilled />,
    iconBg: 'bg-[#fff4e8]',
    iconColor: 'text-[#f59e0b]',
  },
  {
    label: '系统状态',
    value: '正常',
    icon: <CheckCircleFilled />,
    iconBg: 'bg-[#ebfbf1]',
    iconColor: 'text-[#22c55e]',
  },
];

export default function VirtualOfficeScene({
  title = '我的办公室',
  subtitle = '上午好，张三！',
  dateText = '今天是 2024年05月20日 星期一',
  heightClass = 'h-[330px]',
}) {
  return (
    <section className="rounded-[26px] border border-[#edf1f8] bg-white p-5 shadow-[0_18px_40px_rgba(31,56,88,0.08)]">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-[30px] font-semibold leading-none text-[#19233a]">{title}</h2>
          <p className="mt-3 text-[16px] font-medium text-[#2c3653]">{subtitle} <span className="ml-1">👋</span></p>
          <p className="mt-1 text-[12px] text-[#8c97ab]">{dateText}</p>
        </div>
        <div className="grid min-w-[360px] grid-cols-2 gap-3 xl:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.label}
              className="min-w-[110px] rounded-[18px] border border-[#eef2f8] bg-[#fbfcff] px-4 py-3"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-[13px] ${item.iconBg} ${item.iconColor}`}
                >
                  {item.icon}
                </span>
                <span className="text-[11px] text-[#98a3b7]">{item.label}</span>
              </div>
              <div className="mt-2 text-[24px] font-semibold leading-none text-[#1d2740]">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className={`overflow-hidden rounded-[24px] border border-[#edf1f7] bg-[#f8fbff] ${heightClass}`}
      >
        <img
          src="/office-room.png"
          alt="虚拟办公室"
          className="h-full w-full object-cover object-center"
        />
      </div>
    </section>
  );
}
