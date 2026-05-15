import React, { useState } from 'react';
import { Dropdown } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChartOutlined,
  BellOutlined,
  BugOutlined,
  CheckSquareOutlined,
  CloudOutlined,
  CodeOutlined,
  DeploymentUnitOutlined,
  SearchOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useAppStore } from '../store';

const menuItems = [
  { key: '/office', label: '团队协作', icon: <DeploymentUnitOutlined /> },
  { key: '/employees', label: '员工管理', icon: <TeamOutlined /> },
  { key: '/tasks', label: '任务管理', icon: <CheckSquareOutlined /> },
  { key: '/dev', label: '云端开发', icon: <CodeOutlined /> },
  { key: '/test-debug', label: '测试调试', icon: <BugOutlined /> },
  { key: '/deploy', label: '运维部署', icon: <CloudOutlined /> },
  { key: '/analytics', label: '成果分析', icon: <BarChartOutlined /> },
  { key: '/notifications', label: '消息通知', icon: <BellOutlined /> },
];

function UserSvgAvatar({ user }) {
  const name = user?.nickname || user?.username || '管理员';
  const initial = name.slice(0, 1).toUpperCase();
  const isAdmin = user?.role === 'admin';

  return (
    <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#dbe7ff] bg-[#eef4ff] shadow-[0_10px_24px_rgba(47,107,255,0.16)]">
      <svg viewBox="0 0 48 48" className="h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="userAvatarBg" x1="8" x2="40" y1="5" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#76A7FF" />
            <stop offset="0.54" stopColor="#2F6BFF" />
            <stop offset="1" stopColor="#183FBC" />
          </linearGradient>
          <linearGradient id="userAvatarLight" x1="12" x2="34" y1="8" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" stopOpacity="0.96" />
            <stop offset="1" stopColor="#DDE9FF" stopOpacity="0.82" />
          </linearGradient>
        </defs>
        <rect width="48" height="48" rx="24" fill="url(#userAvatarBg)" />
        <circle cx="16" cy="13" r="10" fill="#FFFFFF" opacity="0.16" />
        <path d="M14 38.5C15.5 31 19.2 27.5 24 27.5C28.8 27.5 32.5 31 34 38.5C31.4 40.7 27.9 42 24 42C20.1 42 16.6 40.7 14 38.5Z" fill="url(#userAvatarLight)" />
        <circle cx="24" cy="19" r="7.2" fill="url(#userAvatarLight)" />
        <path d="M31.2 18.6C28.7 17.7 26.8 16.2 25.5 14.1C23.4 17.4 20.7 19.2 17.3 19.6C17.6 15.4 20.2 11.8 24.1 11.8C28.3 11.8 31 14.7 31.2 18.6Z" fill="#1D3F9B" opacity="0.66" />
      </svg>
      <span className="absolute bottom-[3px] right-[3px] flex h-[15px] min-w-[15px] items-center justify-center rounded-full border-2 border-white bg-[#21c87a] px-[3px] text-[8px] font-bold leading-none text-white">
        {isAdmin ? 'A' : initial}
      </span>
    </span>
  );
}

function BrandMark() {
  return (
    <span className="flex h-[54px] shrink-0 items-center rounded-[18px] border border-[#e5ebf5] bg-white px-5 shadow-[0_12px_30px_rgba(31,45,76,0.07)] transition hover:border-[#cfe0ff] hover:shadow-[0_16px_36px_rgba(47,107,255,0.13)]">
      <span className="leading-none">
        <span className="block text-[20px] font-bold tracking-normal text-[#18233d]">AgentOffice</span>
        <span className="mt-1 block text-[11px] font-medium tracking-[0.18em] text-[#8a98b2]">AI WORKSPACE</span>
      </span>
    </span>
  );
}

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppStore();
  const [userOpen, setUserOpen] = useState(false);

  const officeShell = location.pathname === '/office';

  const userItems = {
    items: [
      { key: 'profile', label: '个人中心', icon: <UserOutlined />, onClick: () => navigate('/profile') },
      ...(user?.role === 'admin'
        ? [{ key: 'admin', label: '后台管理', icon: <SettingOutlined />, onClick: () => navigate('/admin') }]
        : []),
      { type: 'divider' },
      {
        key: 'logout',
        label: '退出登录',
        icon: <LogoutOutlined />,
        danger: true,
        onClick: () => {
          useAppStore.getState().logout?.();
          navigate('/login');
        },
      },
    ],
  };

  return (
    <div className="h-screen overflow-hidden bg-[#f6f8fc]">
      <header className="fixed inset-x-0 top-0 z-30 border-b border-[#edf1f7] bg-white/94 backdrop-blur">
        <div className="flex h-[76px] items-center gap-4 px-7">
          <button type="button" onClick={() => navigate('/office')} className="flex shrink-0 items-center gap-3">
            <BrandMark />
          </button>

          <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto rounded-[16px] border border-[#edf1f8] bg-[#f8fbff] p-1.5">
            {menuItems.map((item) => {
              const active = location.pathname === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => navigate(item.key)}
                  className={`flex h-[42px] shrink-0 items-center gap-2 rounded-[12px] px-3.5 text-[14px] font-medium transition ${
                    active
                      ? 'bg-white text-[#2f6bff] shadow-[0_10px_24px_rgba(42,64,101,0.10)]'
                      : 'text-[#65738d] hover:bg-white/70 hover:text-[#2f6bff]'
                  }`}
                >
                  <span className="text-[16px]">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="relative hidden w-[210px] shrink-0 xl:block">
            <SearchOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9aa5b8]" />
            <input
              type="text"
              placeholder="搜索员工、任务、消息..."
              className="h-[42px] w-full rounded-full border border-[#e8edf6] bg-white pl-11 pr-4 text-[13px] text-[#1d2740] outline-none transition focus:border-[#cfe0ff]"
            />
          </div>

          <Dropdown menu={userItems} trigger={['click']} open={userOpen} onOpenChange={setUserOpen}>
            <button
              type="button"
              className="flex shrink-0 items-center gap-3 rounded-full border border-[#e5ebf5] bg-white py-1 pl-1.5 pr-3 shadow-[0_10px_28px_rgba(31,45,76,0.07)] transition hover:border-[#cfe0ff] hover:shadow-[0_14px_32px_rgba(47,107,255,0.12)]"
            >
              <UserSvgAvatar user={user} />
              <span className="hidden min-w-0 text-left md:block">
                <span className="block max-w-[108px] truncate text-[14px] font-semibold leading-4 text-[#1d2740]">{user?.nickname || user?.username || '管理员'}</span>
                <span className="mt-0.5 block text-[11px] leading-3 text-[#8d99ae]">{user?.role === 'admin' ? '系统管理员' : '普通用户'}</span>
              </span>
            </button>
          </Dropdown>
        </div>
      </header>

      <main className="flex h-screen flex-col overflow-hidden pt-[76px]">
        {officeShell ? (
          <div className="mx-8 mt-5 flex shrink-0 items-center gap-4 rounded-[18px] border border-[#edf1f7] bg-white/82 px-5 py-3 text-[13px] text-[#708099] shadow-[0_8px_28px_rgba(31,45,76,0.04)]">
            <span className="font-semibold text-[#1d2740]">系统状态</span>
            <span className="flex items-center gap-2 font-medium text-[#2bb36b]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#2bb36b]" />
              全部正常
            </span>
            {[
              ['在线员工', '12'],
              ['运行服务', '8'],
              ['进行中任务', '5'],
              ['系统负载', '32%'],
            ].map(([label, value]) => (
              <span key={label} className="hidden xl:inline">
                {label} <span className="font-medium text-[#1d2740]">{value}</span>
              </span>
            ))}
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto px-8 pb-8 pt-5">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
