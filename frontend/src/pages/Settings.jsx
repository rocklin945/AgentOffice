import React, { useState } from 'react';
import { Button, Card, Switch, Input, Select, message } from 'antd';

export default function Settings() {
  const [settings, setSettings] = useState({
    emailNotify: true,
    livePush: true,
    smsNotify: false,
    webhookNotify: false,
  });

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    message.success('推送设置已保存');
  };

  return (
    <div className="space-y-4 py-2">
      <div>
        <h1 className="text-[26px] font-semibold text-[#1d2740]">推送设置</h1>
        <p className="mt-1 text-[13px] text-[#97a2b6]">配置系统消息推送方式和规则</p>
      </div>

      <Card className="rounded-[20px] border-[#edf1f8] shadow-[0_14px_30px_rgba(31,56,88,0.05)]">
        <div className="space-y-6">
          <div>
            <div className="mb-2 text-[14px] font-medium text-[#1d2740]">通知渠道</div>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-[12px] bg-[#f6f8fc] px-4 py-3">
                <div>
                  <div className="text-[14px] font-medium text-[#1d2740]">邮件通知</div>
                  <div className="text-[12px] text-[#8d99ae]">接收任务状态变更邮件提醒</div>
                </div>
                <Switch checked={settings.emailNotify} onChange={(checked) => handleChange('emailNotify', checked)} />
              </div>
              <div className="flex items-center justify-between rounded-[12px] bg-[#f6f8fc] px-4 py-3">
                <div>
                  <div className="text-[14px] font-medium text-[#1d2740]">实时推送</div>
                  <div className="text-[12px] text-[#8d99ae]">WebSocket实时推送通知</div>
                </div>
                <Switch checked={settings.livePush} onChange={(checked) => handleChange('livePush', checked)} />
              </div>
              <div className="flex items-center justify-between rounded-[12px] bg-[#f6f8fc] px-4 py-3">
                <div>
                  <div className="text-[14px] font-medium text-[#1d2740]">短信通知</div>
                  <div className="text-[12px] text-[#8d99ae]">关键任务手机短信提醒</div>
                </div>
                <Switch checked={settings.smsNotify} onChange={(checked) => handleChange('smsNotify', checked)} />
              </div>
              <div className="flex items-center justify-between rounded-[12px] bg-[#f6f8fc] px-4 py-3">
                <div>
                  <div className="text-[14px] font-medium text-[#1d2740]">Webhook回调</div>
                  <div className="text-[12px] text-[#8d99ae]">推送事件到指定Webhook地址</div>
                </div>
                <Switch checked={settings.webhookNotify} onChange={(checked) => handleChange('webhookNotify', checked)} />
              </div>
            </div>
          </div>

          <div className="border-t border-[#edf1f8] pt-5">
            <div className="mb-2 text-[14px] font-medium text-[#1d2740]">推送规则</div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-[12px] text-[#8d99ae]">任务完成通知</label>
                <Select
                  className="w-full"
                  defaultValue="all"
                  options={[
                    { value: 'all', label: '推送给所有人' },
                    { value: 'owner', label: '仅推送给负责人' },
                    { value: 'none', label: '关闭' },
                  ]}
                />
              </div>
              <div>
                <label className="mb-1 block text-[12px] text-[#8d99ae]">部署失败通知</label>
                <Select
                  className="w-full"
                  defaultValue="all"
                  options={[
                    { value: 'all', label: '推送给所有人' },
                    { value: 'ops', label: '仅推送给运维' },
                    { value: 'none', label: '关闭' },
                  ]}
                />
              </div>
              <div>
                <label className="mb-1 block text-[12px] text-[#8d99ae]">Webhook地址</label>
                <Input placeholder="https://example.com/webhook" />
              </div>
            </div>
          </div>

          <div className="border-t border-[#edf1f8] pt-5">
            <div className="mb-2 text-[14px] font-medium text-[#1d2740]">推送时间</div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-[#5f6d83]">工作日</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-[#5f6d83]">周末</span>
                <Switch />
              </div>
            </div>
          </div>

          <Button type="primary" onClick={handleSave}>
            保存设置
          </Button>
        </div>
      </Card>
    </div>
  );
}