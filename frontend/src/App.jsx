import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Office from './pages/Office';
import Employees from './pages/Employees';
import Tasks from './pages/Tasks';
import Dev from './pages/Dev';
import CodeReview from './pages/CodeReview';
import Deploy from './pages/Deploy';
import ModelConfig from './pages/ModelConfig';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import { useAppStore } from './store';
import { ChatProvider } from './contexts/ChatContext';
import './styles/global.css';

function ProtectedRoute({ children, adminOnly = false }) {
  const { token, user } = useAppStore();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/office" replace />;
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
      <ChatProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/office" replace />} />
            <Route path="office" element={<Office />} />
            <Route path="employees" element={<Employees />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="dev" element={<Dev />} />
            <Route path="code-review" element={<CodeReview />} />
            <Route path="test-debug" element={<Navigate to="/code-review" replace />} />
            <Route path="deploy" element={<Deploy />} />
            <Route path="model-config" element={<ModelConfig />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile" element={<Profile />} />
            <Route path="admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
      </ChatProvider>
    </ConfigProvider>
  );
}
