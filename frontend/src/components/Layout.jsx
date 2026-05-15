import React, { useState } from 'react';
import { Avatar, Dropdown } from 'antd';
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
            <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#2f6bff] text-[18px] font-semibold text-white shadow-[0_12px_26px_rgba(47,107,255,0.22)]">A</span>
            <span className="hidden text-[18px] font-semibold tracking-tight text-[#1d2740] 2xl:inline">AgentOffice</span>
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
              className="flex shrink-0 items-center gap-3 rounded-full border border-[#e8edf6] bg-white px-3 py-1.5"
            >
              <Avatar
                size={34}
                src={user?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=zhangsan'}
              />
              <span className="hidden text-[14px] font-medium text-[#1d2740] md:inline">{user?.nickname || '张三'}</span>
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
