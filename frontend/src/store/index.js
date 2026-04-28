import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAppStore = create(
  persist(
    (set) => ({
      // 用户信息
      user: null,
      token: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null }),

      // 侧边栏折叠状态
      collapsed: false,
      toggleCollapsed: () => set((state) => ({ collapsed: !state.collapsed })),

      // 当前选中的菜单
      selectedMenu: '/dashboard',
      setSelectedMenu: (menu) => set({ selectedMenu: menu }),
    }),
    {
      name: 'agent-office-storage',
    }
  )
);
