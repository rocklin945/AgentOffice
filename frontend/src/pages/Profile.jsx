import React, { useState } from 'react';
import { Button, Card, Modal, Form, Input, message } from 'antd';
import { EditOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { useAppStore } from '../store';

export default function Profile() {
  const { user, setUser } = useAppStore();
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const handleEditOk = () => {
    form.validateFields().then((values) => {
      setUser?.({ ...user, nickname: values.nickname, email: values.email });
      message.success('资料已更新');
      setEditOpen(false);
    });
  };

  const handlePasswordOk = () => {
    passwordForm.validateFields().then(() => {
      message.success('密码已修改');
      setPasswordOpen(false);
      passwordForm.resetFields();
    });
  };

  const name = user?.nickname || user?.username || '管理员';
  const initial = name.slice(0, 1).toUpperCase();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="max-w-[800px]">
      <Card className="rounded-[20px] border-[#edf1f8] shadow-[0_14px_30px_rgba(31,56,88,0.05)]">
        <div className="flex items-center gap-5">
          <span className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#dbe7ff] bg-[#eef4ff] shadow-[0_10px_24px_rgba(47,107,255,0.16)]">
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
          <div className="flex-1">
            <div className="text-[20px] font-semibold text-[#1d2740]">{user?.nickname || '张三'}</div>
            <div className="mt-1 text-[14px] text-[#8d99ae]">管理员</div>
            <div className="mt-1 text-[13px] text-[#98a3b7]">{user?.email || 'zhangsan@example.com'}</div>
          </div>
          <Button icon={<EditOutlined />} onClick={() => setEditOpen(true)}>编辑资料</Button>
        </div>
      </Card>

      <Card className="mt-4 rounded-[20px] border-[#edf1f8] shadow-[0_14px_30px_rgba(31,56,88,0.05)]">
        <div className="mb-4 text-[16px] font-semibold text-[#1d2740]">基本信息</div>
        <div className="grid grid-cols-2 gap-y-4 text-[14px]">
          <div className="flex items-center gap-2 text-[#8d99ae]"><MailOutlined /> 邮箱</div>
          <div className="text-[#1d2740]">{user?.email || 'zhangsan@example.com'}</div>
        </div>
      </Card>

      <Card className="mt-4 rounded-[20px] border border-[#edf1f8] shadow-[0_14px_30px_rgba(31,56,88,0.05)]">
        <div className="mb-4 text-[16px] font-semibold text-[#1d2740]">安全设置</div>
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-[12px] bg-[#f6f8fc] px-4 py-3">
            <div className="flex items-center gap-3">
              <LockOutlined className="text-[20px] text-[#2f6bff]" />
              <div>
                <div className="text-[14px] font-medium text-[#1d2740]">登录密码</div>
                <div className="text-[12px] text-[#8d99ae]">定期修改密码可以保护账号安全</div>
              </div>
            </div>
            <Button size="small" onClick={() => setPasswordOpen(true)}>修改</Button>
          </div>
        </div>
      </Card>

      <Modal title="编辑资料" open={editOpen} onOk={handleEditOk} onCancel={() => setEditOpen(false)} okText="保存" cancelText="取消">
        <Form form={form} layout="vertical" initialValues={{ nickname: user?.nickname || '张三', email: user?.email || 'zhangsan@example.com' }}>
          <Form.Item name="nickname" label="姓名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="邮箱" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="修改密码" open={passwordOpen} onOk={handlePasswordOk} onCancel={() => setPasswordOpen(false)} okText="确认" cancelText="取消">
        <Form form={passwordForm} layout="vertical">
          <Form.Item name="oldPassword" label="原密码" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="newPassword" label="新密码" rules={[{ required: true, min: 6 }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="confirmPassword" label="确认新密码" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}