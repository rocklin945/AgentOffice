import React, { useEffect, useState } from 'react';
import { BugOutlined, CheckCircleOutlined, ClockCircleOutlined, CodeOutlined } from '@ant-design/icons';
import { devApi, taskApi } from '../api';
import { Panel, ProgressTrack, StatusPill } from '../components/AppPrimitives';
import { buildCodeReviewData } from '../pageData';

const statusColor = (status) => {
  if (status === '已完成') return 'green';
  if (status === '已失败') return 'red';
  if (status === '进行中' || status === '测试中' || status === '开发中') return 'blue';
  return 'gray';
};

export default function CodeReview() {
  const [data, setData] = useState({ summary: {}, reviewTasks: [], runResult: { logs: [] }, debugLogs: [] });

  useEffect(() => {
    const load = async () => {
      try {
        const [tasksRes, projectsRes] = await Promise.all([
          taskApi.getList(),
          devApi.getProjectList(),
        ]);
        setData(buildCodeReviewData(tasksRes.data || [], projectsRes.data?.[0]?.projectName || '-'));
      } catch {
        setData({ summary: {}, reviewTasks: [], runResult: { logs: [] }, debugLogs: [] });
      }
    };
    load();
  }, []);

  const summary = data.summary || {};
  const runResult = data.runResult || { logs: [] };
  const cards = [
    { label: 'Review 任务', value: summary.total || 0, icon: <CodeOutlined />, color: '#2f6bff' },
    { label: '待审/进行中', value: summary.running || 0, icon: <ClockCircleOutlined />, color: '#ff9b42' },
    { label: '已通过', value: summary.completed || 0, icon: <CheckCircleOutlined />, color: '#2bb36b' },
    { label: '问题项', value: summary.failed || 0, icon: <BugOutlined />, color: '#ff5c5c' },
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
              <div className="text-[18px] font-semibold text-[#1d2740]">Code Review 队列</div>
              <div className="mt-1 text-[12px] text-[#8d99ae]">来自任务管理和云端开发的代码评审相关任务</div>
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
            {(data.reviewTasks || []).map((task, index) => (
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
            {!data.reviewTasks?.length ? (
              <div className="px-4 py-10 text-center text-[13px] text-[#8d99ae]">暂无 Code Review 任务</div>
            ) : null}
          </div>
        </Panel>

        <Panel className="overflow-hidden">
          <div className="border-b border-[#edf1f8] px-5 py-4">
            <div className="text-[18px] font-semibold text-[#1d2740]">Review 摘要</div>
            <div className="mt-1 text-[12px] text-[#8d99ae]">当前代码产物的审查结论、风险项与处理记录</div>
          </div>
          <div className="bg-[#111d30] px-5 py-5 text-[13px] text-[#a9c0db]">
            <div className="mb-4 text-[15px] font-medium text-[#29d08e]">{runResult.title || '等待 Code Review'}</div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['审查耗时', runResult.duration || '-'],
                ['检查项', runResult.tests || '-'],
                ['通过项', runResult.passed || '-'],
                ['问题项', runResult.failed || '-'],
                ['风险等级', runResult.coverage || '-'],
                ['关联项目', data.projectName || '-'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[10px] bg-white/5 px-3 py-2">
                  <div className="text-[11px] text-[#6f829f]">{label}</div>
                  <div className="mt-1 text-[14px] font-medium text-white">{value}</div>
                </div>
              ))}
            </div>
            <div className="mt-5 border-t border-white/10 pt-4">
              <div className="mb-2 text-[14px] font-medium text-white">Review 记录</div>
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
