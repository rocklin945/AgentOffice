import React, { useState } from 'react';
import { Button, Card, Avatar, Modal, Form, Input, message } from 'antd';
import { EditOutlined, SafetyOutlined, MailOutlined, PhoneOutlined, LockOutlined } from '@ant-design/icons';
import { useAppStore } from '../store';

export default function Profile() {
  const { user, setUser } = useAppStore();
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const handleEditOk = () => {
    form.validateFields().then((values) => {
      setUser?.({ ...user, nickname: values.nickname, email: values.email, phone: values.phone });
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

  return (
    <div className="max-w-[800px]">
      <Card className="rounded-[20px] border-[#edf1f8] shadow-[0_14px_30px_rgba(31,56,88,0.05)]">
        <div className="flex items-center gap-5">
          <Avatar
            size={80}
            src={user?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=zhangsan'}
            className="text-[28px]"
          />
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
          <div className="flex items-center gap-2 text-[#8d99ae]"><PhoneOutlined /> 手机</div>
          <div className="text-[#1d2740]">138****8888</div>
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
          <div className="flex items-center justify-between rounded-[12px] bg-[#f6f8fc] px-4 py-3">
            <div className="flex items-center gap-3">
              <SafetyOutlined className="text-[20px] text-[#2f6bff]" />
              <div>
                <div className="text-[14px] font-medium text-[#1d2740]">两步验证</div>
                <div className="text-[12px] text-[#8d99ae]">未开启</div>
              </div>
            </div>
            <Button size="small">开启</Button>
          </div>
        </div>
      </Card>

      <Modal title="编辑资料" open={editOpen} onOk={handleEditOk} onCancel={() => setEditOpen(false)} okText="保存" cancelText="取消">
        <Form form={form} layout="vertical" initialValues={{ nickname: user?.nickname || '张三', email: user?.email || 'zhangsan@example.com', phone: '138****8888' }}>
          <Form.Item name="nickname" label="姓名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="邮箱" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="手机">
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