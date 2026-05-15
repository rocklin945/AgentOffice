import React, { useEffect, useState } from 'react';
import { BugOutlined, CheckCircleOutlined, ClockCircleOutlined, ExperimentOutlined } from '@ant-design/icons';
import { uiApi } from '../api';
import { Panel, ProgressTrack, StatusPill } from '../components/AppPrimitives';

const statusColor = (status) => {
  if (status === '已完成') return 'green';
  if (status === '已失败') return 'red';
  if (status === '进行中' || status === '测试中' || status === '开发中') return 'blue';
  return 'gray';
};

export default function TestDebug() {
  const [data, setData] = useState({ summary: {}, testTasks: [], runResult: { logs: [] }, debugLogs: [] });

  useEffect(() => {
    uiApi.getTestDebug().then((res) => setData(res.data || {})).catch(() => {});
  }, []);

  const summary = data.summary || {};
  const runResult = data.runResult || { logs: [] };
  const cards = [
    { label: '测试任务', value: summary.total || 0, icon: <ExperimentOutlined />, color: '#2f6bff' },
    { label: '进行中', value: summary.running || 0, icon: <ClockCircleOutlined />, color: '#ff9b42' },
    { label: '已完成', value: summary.completed || 0, icon: <CheckCircleOutlined />, color: '#2bb36b' },
    { label: '失败项', value: summary.failed || 0, icon: <BugOutlined />, color: '#ff5c5c' },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <Panel key={card.label} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[12px] text-[#8d99ae]">{card.label}</div>
                <div className="mt-2 text-[28px] font-semibold text-[#1d2740]">{card.value}</div>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-[14px] text-[20px]" style={{ color: card.color, background: `${card.color}14` }}>
                {card.icon}
              </div>
            </div>
          </Panel>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
        <Panel className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[18px] font-semibold text-[#1d2740]">测试任务队列</div>
              <div className="mt-1 text-[12px] text-[#8d99ae]">来自任务管理中的测试类任务</div>
            </div>
          </div>
          <div className="mt-4 overflow-hidden rounded-[14px] border border-[#edf1f8]">
            <div className="grid grid-cols-[1.6fr_0.8fr_1fr_1.2fr_1fr] bg-[#fbfcff] px-4 py-3 text-[12px] text-[#8d99ae]">
              <div>任务名称</div>
              <div>优先级</div>
              <div>状态</div>
              <div>执行员工</div>
              <div>进度</div>
            </div>
            {(data.testTasks || []).map((task, index) => (
              <div key={task.id} className={`grid grid-cols-[1.6fr_0.8fr_1fr_1.2fr_1fr] items-center px-4 py-4 text-[13px] text-[#5f6d83] ${index ? 'border-t border-[#f1f4f8]' : ''}`}>
                <div>
                  <div className="font-medium text-[#1d2740]">{task.name}</div>
                  <div className="mt-1 line-clamp-1 text-[12px] text-[#98a3b7]">{task.description}</div>
                </div>
                <div className={task.priority === '高' ? 'text-[#ff5c5c]' : task.priority === '中' ? 'text-[#ff9b42]' : 'text-[#2bb36b]'}>{task.priority}</div>
                <div><StatusPill color={statusColor(task.status)}>{task.status}</StatusPill></div>
                <div>{task.owner || '-'}</div>
                <ProgressTrack value={task.progress || 0} />
              </div>
            ))}
            {!data.testTasks?.length ? (
              <div className="px-4 py-10 text-center text-[13px] text-[#8d99ae]">暂无测试类任务</div>
            ) : null}
          </div>
        </Panel>

        <Panel className="overflow-hidden">
          <div className="border-b border-[#edf1f8] px-5 py-4">
            <div className="text-[18px] font-semibold text-[#1d2740]">调试输出</div>
            <div className="mt-1 text-[12px] text-[#8d99ae]">当前云端开发环境的运行与测试摘要</div>
          </div>
          <div className="bg-[#111d30] px-5 py-5 text-[13px] text-[#a9c0db]">
            <div className="mb-4 text-[15px] font-medium text-[#29d08e]">{runResult.title || '等待运行'}</div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['耗时', runResult.duration || '-'],
                ['测试总数', runResult.tests || '-'],
                ['通过', runResult.passed || '-'],
                ['失败', runResult.failed || '-'],
                ['覆盖率', runResult.coverage || '-'],
                ['关联项目', data.projectName || '-'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[10px] bg-white/5 px-3 py-2">
                  <div className="text-[11px] text-[#6f829f]">{label}</div>
                  <div className="mt-1 text-[14px] font-medium text-white">{value}</div>
                </div>
              ))}
            </div>
            <div className="mt-5 border-t border-white/10 pt-4">
              <div className="mb-2 text-[14px] font-medium text-white">输出日志</div>
              <div className="max-h-[260px] space-y-1 overflow-auto font-mono text-[12px]">
                {((runResult.logs || []).length ? runResult.logs : data.debugLogs || []).map((log, index) => (
                  <div key={`${index}-${log}`}>{log}</div>
                ))}
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
