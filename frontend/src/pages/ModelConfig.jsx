import React, { useEffect, useState } from 'react';
import { DeleteOutlined, EditOutlined, EyeInvisibleOutlined, EyeOutlined, PlusOutlined, StarFilled } from '@ant-design/icons';
import { modelConfigApi } from '../api';
import { Panel, StatusPill } from '../components/AppPrimitives';

const emptyForm = {
  configName: '',
  provider: 'OpenAI Compatible',
  modelName: '',
  apiBase: '',
  apiKey: '',
  isDefault: 0,
  enabled: 1,
  remark: '',
};

function ModelModal({ model, onClose, onSaved }) {
  const [form, setForm] = useState(model || emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async () => {
    if (!form.configName.trim() || !form.modelName.trim() || !form.apiKey.trim()) {
      setError('请填写配置名称、模型名称和 API Key');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        configName: form.configName.trim(),
        modelName: form.modelName.trim(),
        apiBase: form.apiBase.trim(),
        apiKey: form.apiKey.trim(),
        provider: form.provider.trim() || 'OpenAI Compatible',
        enabled: Number(form.enabled),
        isDefault: Number(form.isDefault),
      };
      if (model?.id) {
        await modelConfigApi.update(model.id, payload);
      } else {
        await modelConfigApi.create(payload);
      }
      await onSaved();
      onClose();
    } catch (err) {
      setError(err.message || '保存模型配置失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(12,18,28,0.26)] px-6">
      <div className="w-full max-w-[760px] rounded-[16px] bg-white p-6 shadow-[0_32px_80px_rgba(18,30,52,0.18)]">
        <div className="flex items-center justify-between">
          <div className="text-[18px] font-semibold text-[#1d2740]">{model?.id ? '编辑模型配置' : '新增模型配置'}</div>
          <button type="button" onClick={onClose} className="text-[22px] text-[#97a3b8]">×</button>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4">
          <label className="text-[13px] text-[#5f6d83]">配置名称<input value={form.configName} onChange={(event) => update('configName', event.target.value)} className="mt-2 h-10 w-full rounded-[8px] border border-[#dfe7f5] px-3 outline-none focus:border-[#2f6bff]" /></label>
          <label className="text-[13px] text-[#5f6d83]">供应商<input value={form.provider} onChange={(event) => update('provider', event.target.value)} className="mt-2 h-10 w-full rounded-[8px] border border-[#dfe7f5] px-3 outline-none focus:border-[#2f6bff]" /></label>
          <label className="text-[13px] text-[#5f6d83]">模型名称<input value={form.modelName} onChange={(event) => update('modelName', event.target.value)} placeholder="MiniMax-M2.7 / gpt-4o-mini" className="mt-2 h-10 w-full rounded-[8px] border border-[#dfe7f5] px-3 outline-none focus:border-[#2f6bff]" /></label>
          <label className="text-[13px] text-[#5f6d83]">API Base<input value={form.apiBase || ''} onChange={(event) => update('apiBase', event.target.value)} placeholder="https://api.openai.com/v1" className="mt-2 h-10 w-full rounded-[8px] border border-[#dfe7f5] px-3 outline-none focus:border-[#2f6bff]" /></label>
          <label className="col-span-2 text-[13px] text-[#5f6d83]">
            API Key
            <div className="mt-2 flex h-10 w-full items-center rounded-[8px] border border-[#dfe7f5] bg-white focus-within:border-[#2f6bff]">
              <input value={form.apiKey || ''} onChange={(event) => update('apiKey', event.target.value)} type={showApiKey ? 'text' : 'password'} className="h-full min-w-0 flex-1 rounded-l-[8px] px-3 outline-none" />
              <button type="button" title={showApiKey ? '隐藏 API Key' : '显示 API Key'} onClick={() => setShowApiKey((visible) => !visible)} className="flex h-full w-10 items-center justify-center rounded-r-[8px] text-[#7d8aa2] hover:bg-[#f4f7fb]">
                {showApiKey ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              </button>
            </div>
          </label>
          <label className="text-[13px] text-[#5f6d83]">状态<select value={form.enabled} onChange={(event) => update('enabled', event.target.value)} className="mt-2 h-10 w-full rounded-[8px] border border-[#dfe7f5] px-3 outline-none focus:border-[#2f6bff]"><option value={1}>启用</option><option value={0}>停用</option></select></label>
          <label className="text-[13px] text-[#5f6d83]">默认模型<select value={form.isDefault} onChange={(event) => update('isDefault', event.target.value)} className="mt-2 h-10 w-full rounded-[8px] border border-[#dfe7f5] px-3 outline-none focus:border-[#2f6bff]"><option value={0}>否</option><option value={1}>是</option></select></label>
          <label className="col-span-2 text-[13px] text-[#5f6d83]">备注<input value={form.remark || ''} onChange={(event) => update('remark', event.target.value)} className="mt-2 h-10 w-full rounded-[8px] border border-[#dfe7f5] px-3 outline-none focus:border-[#2f6bff]" /></label>
        </div>
        {error ? <div className="mt-4 text-[13px] text-[#ff5c5c]">{error}</div> : null}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="h-10 rounded-[8px] border border-[#dfe7f5] px-4 text-[14px] text-[#5d6a82]">取消</button>
          <button type="button" onClick={submit} disabled={saving} className="h-10 rounded-[8px] bg-[#2f6bff] px-5 text-[14px] font-medium text-white">{saving ? '保存中' : '保存'}</button>
        </div>
      </div>
    </div>
  );
}

export default function ModelConfig() {
  const [models, setModels] = useState([]);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState({});

  const maskApiKey = (apiKey) => {
    if (!apiKey) return '-';
    if (apiKey.length <= 8) return '••••••••';
    return `${apiKey.slice(0, 4)}••••••••${apiKey.slice(-4)}`;
  };

  const reload = () => modelConfigApi.getList().then((res) => setModels(res.data || [])).catch(() => setModels([]));
  useEffect(() => { reload(); }, []);

  const setDefault = async (model) => {
    await modelConfigApi.setDefault(model.id);
    reload();
  };

  const remove = async (model) => {
    await modelConfigApi.delete(model.id);
    reload();
  };

  return (
    <div className="space-y-5">
      <Panel className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[18px] font-semibold text-[#1d2740]">模型配置</div>
            <div className="mt-1 text-[12px] text-[#8d99ae]">配置系统默认模型，也可以在员工管理中为每个 AI 员工绑定单独模型。</div>
          </div>
          <button type="button" onClick={() => setCreating(true)} className="flex items-center gap-2 rounded-[8px] bg-[#2f6bff] px-4 py-2 text-[12px] font-medium text-white"><PlusOutlined />新增模型</button>
        </div>
        <div className="mt-5 overflow-hidden rounded-[14px] border border-[#edf1f8]">
          <div className="grid grid-cols-[1.1fr_0.9fr_1.1fr_1.2fr_1.25fr_0.7fr_0.7fr_0.9fr] bg-[#fbfcff] px-4 py-3 text-[12px] text-[#8d99ae]">
            <div>配置名称</div><div>供应商</div><div>模型</div><div>API Base</div><div>API Key</div><div>默认</div><div>状态</div><div>操作</div>
          </div>
          {models.map((model, index) => (
            <div key={model.id} className={`grid grid-cols-[1.1fr_0.9fr_1.1fr_1.2fr_1.25fr_0.7fr_0.7fr_0.9fr] items-center px-4 py-4 text-[13px] text-[#5f6d83] ${index ? 'border-t border-[#f1f4f8]' : ''}`}>
              <div className="font-medium text-[#1d2740]">{model.configName}</div>
              <div>{model.provider || '-'}</div>
              <div>{model.modelName}</div>
              <div className="truncate pr-3">{model.apiBase || '-'}</div>
              <div className="flex min-w-0 items-center gap-2 pr-3">
                <span className="truncate font-mono text-[12px]">{visibleKeys[model.id] ? (model.apiKey || '-') : maskApiKey(model.apiKey)}</span>
                {model.apiKey ? (
                  <button type="button" title={visibleKeys[model.id] ? '隐藏 API Key' : '显示 API Key'} onClick={() => setVisibleKeys((current) => ({ ...current, [model.id]: !current[model.id] }))} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] text-[#7d8aa2] hover:bg-[#eef4ff]">
                    {visibleKeys[model.id] ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  </button>
                ) : null}
              </div>
              <div>{model.isDefault ? <StatusPill color="green">默认</StatusPill> : <button type="button" onClick={() => setDefault(model)} className="text-[#2f6bff]">设为默认</button>}</div>
              <div><StatusPill color={model.enabled ? 'green' : 'gray'}>{model.enabled ? '启用' : '停用'}</StatusPill></div>
              <div className="flex gap-2">
                {model.isDefault ? <StarFilled className="mt-1 text-[#f5a544]" /> : null}
                <button type="button" title="编辑" onClick={() => setEditing(model)} className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#2f6bff] hover:bg-[#eef4ff]"><EditOutlined /></button>
                <button type="button" title="删除" onClick={() => remove(model)} className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#ff5c5c] hover:bg-[#fff1f1]"><DeleteOutlined /></button>
              </div>
            </div>
          ))}
          {!models.length ? <div className="px-4 py-10 text-center text-[13px] text-[#8d99ae]">暂无模型配置</div> : null}
        </div>
      </Panel>
      {creating ? <ModelModal onClose={() => setCreating(false)} onSaved={reload} /> : null}
      {editing ? <ModelModal model={editing} onClose={() => setEditing(null)} onSaved={reload} /> : null}
    </div>
  );
}
