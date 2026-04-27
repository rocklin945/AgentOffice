import React from 'react';
import { Button, Card, Form, Input, Switch, message } from 'antd';

export default function Settings() {
  const [form] = Form.useForm();

  return (
    <div className="space-y-4 py-2">
      <div>
        <h1 className="text-[26px] font-semibold text-[#1d2740]">系统设置</h1>
        <p className="mt-1 text-[13px] text-[#97a2b6]">保留基础配置入口，方便后续把设置页继续组件化。</p>
      </div>

      <Card className="rounded-[20px] border-[#edf1f8] shadow-[0_14px_30px_rgba(31,56,88,0.05)]">
        <Form
          form={form}
          layout="vertical"
          initialValues={{ systemName: 'AI数字员工平台', emailNotify: true, livePush: true }}
          onFinish={() => message.success('设置已保存')}
        >
          <Form.Item name="systemName" label="系统名称">
            <Input />
          </Form.Item>
          <Form.Item name="description" label="系统描述">
            <Input.TextArea rows={4} placeholder="补充系统描述信息" />
          </Form.Item>
          <div className="grid gap-4 md:grid-cols-2">
            <Form.Item name="emailNotify" label="邮件通知" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="livePush" label="实时推送" valuePropName="checked">
              <Switch />
            </Form.Item>
          </div>
          <Form.Item label="更新密码">
            <Input.Password placeholder="输入新密码" />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            保存设置
          </Button>
        </Form>
      </Card>
    </div>
  );
}
