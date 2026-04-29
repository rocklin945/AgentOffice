import React from 'react';
import { Avatar, Badge } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  AppstoreOutlined,
  BarChartOutlined,
  BellOutlined,
  CheckSquareOutlined,
  CloudOutlined,
  CodeOutlined,
  HomeOutlined,
  SearchOutlined,
  SettingOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useAppStore } from '../store';

const menuItems = [
  { key: '/dashboard', label: '首页', icon: <HomeOutlined /> },
  { key: '/office', label: '团队协作', icon: <AppstoreOutlined /> },
  { key: '/employees', label: '员工管理', icon: <TeamOutlined /> },
  { key: '/tasks', label: '任务管理', icon: <CheckSquareOutlined /> },
  { key: '/dev', label: '云端开发', icon: <CodeOutlined /> },
  { key: '/deploy', label: '部署与运维', icon: <CloudOutlined /> },
  { key: '/analytics', label: '成果与分析', icon: <BarChartOutlined /> },
  { key: '/settings', label: '推送设置', icon: <SettingOutlined /> },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppStore();

  const officeShell = location.pathname === '/office';

  return (
    <div className="h-screen overflow-hidden bg-[#f6f8fc]">
      <header className="fixed inset-x-0 top-0 z-30 border-b border-[#edf1f7] bg-white/92 backdrop-blur">
        <div className="flex h-[76px] items-center gap-6 px-8">
          <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto rounded-full bg-[#f6f8fc] p-1">
          {menuItems.map((item) => {
            const active = location.pathname === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => navigate(item.key)}
                  className={`flex h-[40px] shrink-0 items-center gap-2 rounded-full px-4 text-[14px] font-medium transition ${
                  active
                      ? 'bg-[#2f6bff] text-white shadow-[0_10px_22px_rgba(47,107,255,0.18)]'
                    : 'text-[#5d6a82] hover:bg-[#f6f8fc] hover:text-[#2f6bff]'
                }`}
              >
                <span className="text-[16px]">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

          <div className="relative hidden w-[220px] shrink-0 xl:block">
            <SearchOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9aa5b8]" />
            <input
              type="text"
              placeholder="搜索员工、任务、文档..."
              className="h-[42px] w-full rounded-full border border-[#e8edf6] bg-white pl-11 pr-4 text-[13px] text-[#1d2740] outline-none transition focus:border-[#cfe0ff]"
            />
          </div>

          <Badge count={12} size="small">
            <button
              type="button"
              className="flex h-[42px] w-[42px] items-center justify-center rounded-full border border-[#e8edf6] bg-white text-[#66758f]"
            >
              <BellOutlined />
            </button>
          </Badge>

          <button
            type="button"
            className="flex items-center gap-3 rounded-full border border-[#e8edf6] bg-white px-3 py-1.5"
          >
            <Avatar
              size={34}
              src={user?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=zhangsan'}
            />
            <span className="text-[14px] font-medium text-[#1d2740]">{user?.nickname || '张三'}</span>
          </button>
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
