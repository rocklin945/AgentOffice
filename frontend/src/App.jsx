import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Office from './pages/Office';
import Employees from './pages/Employees';
import Tasks from './pages/Tasks';
import Dev from './pages/Dev';
import Deploy from './pages/Deploy';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import { useAppStore } from './store';
import './styles/global.css';

function ProtectedRoute({ children }) {
  const { token } = useAppStore();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#2F6BFF',
          borderRadius: 8,
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="office" element={<Office />} />
            <Route path="employees" element={<Employees />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="dev" element={<Dev />} />
            <Route path="deploy" element={<Deploy />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}
