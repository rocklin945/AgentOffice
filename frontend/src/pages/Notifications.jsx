import React, { useEffect, useMemo, useState } from 'react';
import { BellOutlined, CheckCircleOutlined, DeleteOutlined, InboxOutlined } from '@ant-design/icons';
import { notificationApi } from '../api';
import { Panel, StatusPill } from '../components/AppPrimitives';

const categoryColor = {
  task: 'blue',
  test: 'purple',
  deploy: 'green',
};

const categoryLabel = {
  task: '任务',
  test: '测试',
  deploy: '部署',
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');

  const reload = () => {
    notificationApi.getList().then((res) => setNotifications(res.data || [])).catch(() => {});
  };

  useEffect(() => {
    reload();
  }, []);

  const stats = useMemo(() => {
    const unread = notifications.filter((item) => !item.readStatus).length;
    const important = notifications.filter((item) => item.priority === 'high').length;
    return { total: notifications.length, unread, important };
  }, [notifications]);

  const visible = notifications.filter((item) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !item.readStatus;
    return item.category === activeFilter;
  });

  const markRead = async (item, event) => {
    event.stopPropagation();
    if (item.readStatus) return;
    await notificationApi.markRead(item.id);
    reload();
  };

  const remove = async (item, event) => {
    event.stopPropagation();
    await notificationApi.delete(item.id);
    reload();
  };

  const filters = [
    { key: 'all', label: '全部', count: stats.total },
    { key: 'unread', label: '未读', count: stats.unread },
    { key: 'task', label: '任务', count: notifications.filter((item) => item.category === 'task').length },
    { key: 'test', label: '测试', count: notifications.filter((item) => item.category === 'test').length },
    { key: 'deploy', label: '部署', count: notifications.filter((item) => item.category === 'deploy').length },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-3">
        {[
          { label: '全部消息', value: stats.total, icon: <InboxOutlined />, color: '#2f6bff' },
          { label: '未读消息', value: stats.unread, icon: <BellOutlined />, color: '#ff9b42' },
          { label: '重要提醒', value: stats.important, icon: <CheckCircleOutlined />, color: '#2bb36b' },
        ].map((card) => (
          <Panel key={card.label} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[12px] text-[#8d99ae]">{card.label}</div>
                <div className="mt-2 text-[30px] font-semibold text-[#1d2740]">{card.value}</div>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-[14px] text-[20px]" style={{ color: card.color, background: `${card.color}14` }}>
                {card.icon}
              </div>
            </div>
          </Panel>
        ))}
      </div>

      <Panel className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[18px] font-semibold text-[#1d2740]">消息通知</div>
            <div className="mt-1 text-[12px] text-[#8d99ae]">展示来自任务、Code Review、部署和调度员事件的通知消息</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setActiveFilter(filter.key)}
                className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition ${
                  activeFilter === filter.key ? 'bg-[#2f6bff] text-white' : 'bg-[#f4f7fc] text-[#65738d] hover:bg-[#edf4ff] hover:text-[#2f6bff]'
                }`}
              >
                {filter.label} {filter.count}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-[14px] border border-[#edf1f8]">
          {visible.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={(event) => markRead(item, event)}
              className={`grid w-full grid-cols-[32px_minmax(0,1fr)_132px_88px] items-center gap-4 px-5 py-4 text-left transition hover:bg-[#fafbff] ${
                index ? 'border-t border-[#f1f4f8]' : ''
              } ${item.readStatus ? 'bg-white' : 'bg-[#f8fbff]'}`}
            >
              <span className={`h-2.5 w-2.5 rounded-full ${item.readStatus ? 'bg-[#c8d1df]' : 'bg-[#2f6bff] shadow-[0_0_0_5px_rgba(47,107,255,0.10)]'}`} />
              <span className="min-w-0">
                <span className="flex items-center gap-2">
                  <span className="truncate text-[14px] font-semibold text-[#1d2740]">{item.title}</span>
                  <StatusPill color={categoryColor[item.category] || 'gray'} className="text-[10px]">{categoryLabel[item.category] || item.category}</StatusPill>
                  {item.priority === 'high' ? <span className="rounded-full bg-[#fff1f1] px-2 py-0.5 text-[10px] text-[#ff5c5c]">重要</span> : null}
                </span>
                <span className="mt-1 block truncate text-[12px] text-[#7b879f]">{item.content}</span>
              </span>
              <span className="text-[12px] text-[#98a3b7]">{item.createTime || '-'}</span>
              <span className="flex justify-end gap-2">
                {!item.readStatus ? (
                  <span role="button" tabIndex={0} title="标为已读" onClick={(event) => markRead(item, event)} className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[#2f6bff] hover:bg-[#edf4ff]">
                    <CheckCircleOutlined />
                  </span>
                ) : null}
                <span role="button" tabIndex={0} title="删除" onClick={(event) => remove(item, event)} className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[#ff5c5c] hover:bg-[#fff1f1]">
                  <DeleteOutlined />
                </span>
              </span>
            </button>
          ))}
          {!visible.length ? (
            <div className="px-5 py-12 text-center text-[13px] text-[#8d99ae]">暂无消息通知</div>
          ) : null}
        </div>
      </Panel>
    </div>
  );
}
