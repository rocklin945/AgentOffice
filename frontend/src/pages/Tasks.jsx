import React, { useState } from 'react';
import { Panel, ProgressTrack, StatusPill } from '../components/AppPrimitives';

const tasks = [
  {
    id: 'login-api',
    name: '开发用户登录接口',
    level: '高',
    owner: 'Alex(开发工程师)',
    status: '进行中',
    progress: 75,
    createdAt: '2024-05-20 10:30',
  },
  {
    id: 'login-test',
    name: '编写登录接口测试用例',
    level: '中',
    owner: 'TestBot(测试工程师)',
    status: '进行中',
    progress: 60,
    createdAt: '2024-05-20 10:35',
  },
  {
    id: 'deploy-env',
    name: '部署登录服务到测试环境',
    level: '高',
    owner: 'OpsMaster(运维工程师)',
    status: '部署中',
    progress: 40,
    createdAt: '2024-05-20 10:40',
  },
  {
    id: 'analysis',
    name: '用户登录功能需求分析',
    level: '中',
    owner: 'ProductKing(产品经理)',
    status: '已完成',
    progress: 100,
    createdAt: '2024-05-20 09:20',
  },
  {
    id: 'doc',
    name: '编写接口文档',
    level: '低',
    owner: 'DocHelper(文档工程师)',
    status: '已完成',
    progress: 100,
    createdAt: '2024-05-20 09:30',
  },
];

const detailSteps = [
  ['需求分析（产品经理）', '已完成'],
  ['接口设计（开发工程师）', '已完成'],
  ['代码开发（开发工程师）', '进行中'],
  ['测试验证（测试工程师）', '待开始'],
  ['部署上线（运维工程师）', '待开始'],
];

export default function Tasks() {
  const [selected, setSelected] = useState(tasks[0]);

  return (
    <div className="space-y-5">
      <Panel className="p-5">
        <div className="flex items-center justify-between">
          <div className="text-[18px] font-semibold text-[#1d2740]">任务管理</div>
          <button type="button" className="rounded-[8px] bg-[#2f6bff] px-4 py-2 text-[12px] font-medium text-white">
            + 创建任务
          </button>
        </div>

        <div className="mt-4 flex gap-8 border-b border-[#edf1f8] pb-3 text-[13px]">
          {['全部任务', '我的任务', '进行中', '已完成', '已失败'].map((tab, index) => (
            <div key={tab} className={index === 0 ? 'font-medium text-[#2f6bff]' : 'text-[#8d99ae]'}>
              {tab}
            </div>
          ))}
        </div>

        <div className="mt-4 overflow-hidden rounded-[14px] border border-[#edf1f8]">
          <div className="grid grid-cols-[1.6fr_0.7fr_1.4fr_0.9fr_1.1fr_1.2fr_0.4fr] bg-[#fbfcff] px-4 py-3 text-[12px] text-[#8d99ae]">
            <div>任务名称</div>
            <div>优先级</div>
            <div>分配给</div>
            <div>状态</div>
            <div>进度</div>
            <div>创建时间</div>
            <div>操作</div>
          </div>
          {tasks.map((task, index) => (
            <button
              key={task.id}
              type="button"
              onClick={() => setSelected(task)}
              className={`grid w-full grid-cols-[1.6fr_0.7fr_1.4fr_0.9fr_1.1fr_1.2fr_0.4fr] items-center px-4 py-4 text-left text-[13px] text-[#5f6d83] transition hover:bg-[#fbfcff] ${
                index !== tasks.length - 1 ? 'border-t border-[#f1f4f8]' : ''
              }`}
            >
              <div>{task.name}</div>
              <div
                className={
                  task.level === '高'
                    ? 'text-[#ff6a5f]'
                    : task.level === '中'
                    ? 'text-[#ff9b42]'
                    : 'text-[#2bb36b]'
                }
              >
                {task.level}
              </div>
              <div>{task.owner}</div>
              <div>
                <StatusPill color={task.status === '已完成' ? 'green' : task.status === '部署中' ? 'purple' : 'blue'}>
                  {task.status}
                </StatusPill>
              </div>
              <ProgressTrack value={task.progress} />
              <div>{task.createdAt}</div>
              <div>⋯</div>
            </button>
          ))}
        </div>
      </Panel>

      <Panel className="p-5">
        <div className="mb-3 flex items-center gap-2 text-[18px] font-semibold text-[#1d2740]">
          <span>←</span>
          <span>任务详情</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-[26px] font-semibold text-[#1d2740]">{selected.name}</div>
          <StatusPill color={selected.status === '已完成' ? 'green' : selected.status === '部署中' ? 'purple' : 'blue'}>
            {selected.status}
          </StatusPill>
        </div>
        <div className="mt-3 text-[13px] text-[#8d99ae]">创建时间：{selected.createdAt}　　优先级：{selected.level}</div>

        <div className="mt-5 flex gap-8 border-b border-[#edf1f8] pb-3 text-[13px]">
          {['任务概览', '执行过程', '成果展示', '相关文件'].map((tab, index) => (
            <div key={tab} className={index === 1 ? 'font-medium text-[#2f6bff]' : 'text-[#8d99ae]'}>
              {tab}
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          <div className="rounded-[14px] border border-[#edf1f8] px-4 py-5">
            <div className="mb-5 text-[15px] font-semibold text-[#1d2740]">执行步骤</div>
            <div className="space-y-4">
              {detailSteps.map(([text, state], index) => (
                <div key={text} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-[13px] text-[#5f6d83]">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#d9e5ff] text-[#2f6bff]">
                      {index + 1}
                    </span>
                    <span>{text}</span>
                  </div>
                  <StatusPill color={state === '已完成' ? 'green' : state === '进行中' ? 'blue' : 'gray'}>
                    {state}
                  </StatusPill>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[14px] border border-[#edf1f8] px-4 py-5">
            <div className="text-[15px] font-semibold text-[#1d2740]">当前执行：代码开发</div>
            <div className="mt-4 text-[13px] text-[#6d7b92]">执行员工：Alex（开发工程师）</div>
            <ProgressTrack value={selected.progress} className="mt-4" />
            <div className="mt-5 text-[15px] font-semibold text-[#1d2740]">执行日志</div>
            <div className="mt-4 space-y-3 text-[13px] text-[#6d7b92]">
              <div>10:30　任务开始</div>
              <div>10:35　需求分析完成</div>
              <div>10:40　接口设计完成</div>
              <div>10:45　开始编写代码</div>
              <div>11:20　完成登录接口代码编写</div>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}
