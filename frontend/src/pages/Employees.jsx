import React, { useState } from 'react';
import { UserOutlined } from '@ant-design/icons';
import { Panel, StatusPill } from '../components/AppPrimitives';

const employees = [
  ['Alex', '开发工程师', '编码中', '3', '85%'],
  ['TestBot', '测试工程师', '测试中', '2', '78%'],
  ['OpsMaster', '运维工程师', '部署中', '2', '90%'],
  ['ProductKing', '产品经理', '思考中', '1', '88%'],
  ['DocHelper', '文档工程师', '空闲', '0', '70%'],
];

const roleCards = [
  ['开发工程师', '负责代码开发、实现功能需求'],
  ['测试工程师', '负责测试用例编写、功能测试'],
  ['运维工程师', '负责系统部署、运维与监控'],
  ['产品经理', '负责需求分析、产品规划'],
];

function AvatarToken({ name, index }) {
  const tones = ['#4f8dff', '#6c7cff', '#f5a544', '#f08b3a', '#94a0b8'];
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-semibold text-white"
        style={{ background: tones[index % tones.length] }}
      >
        {name.slice(0, 1)}
      </div>
      <span>{name}</span>
    </div>
  );
}

function CreateEmployeeModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(12,18,28,0.26)] px-6">
      <div className="w-full max-w-[1080px] rounded-[18px] bg-white px-8 py-7 shadow-[0_32px_80px_rgba(18,30,52,0.18)]">
        <div className="flex items-center justify-between">
          <div className="text-[18px] font-semibold text-[#1d2740]">创建新员工</div>
          <button type="button" onClick={onClose} className="text-[22px] text-[#97a3b8]">×</button>
        </div>

        <div className="mt-7 flex items-center">
          {['选择角色', '配置员工', '工作权限', '权限设置'].map((step, index) => (
            <React.Fragment key={step}>
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-medium ${
                    index === 0 ? 'bg-[#2f6bff] text-white' : 'bg-[#eef3fb] text-[#7e8ca4]'
                  }`}
                >
                  {index + 1}
                </span>
                <span className={`text-[13px] ${index === 0 ? 'font-medium text-[#1d2740]' : 'text-[#8d99ae]'}`}>
                  {step}
                </span>
              </div>
              {index !== 3 ? <div className="mx-4 h-px flex-1 bg-[#edf1f8]" /> : null}
            </React.Fragment>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4">
          {roleCards.slice(0, 3).map(([title, desc], index) => (
            <button
              key={title}
              type="button"
              className={`rounded-[14px] border px-5 py-6 text-left ${
                index === 0 ? 'border-[#2f6bff] bg-[#f7fbff] shadow-[inset_0_0_0_1px_#a8c8ff]' : 'border-[#edf1f8] bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef4ff] text-[#2f6bff]">
                  <UserOutlined />
                </span>
                <span className="text-[15px] font-semibold text-[#1d2740]">{title}</span>
              </div>
              <div className="mt-4 text-[13px] leading-6 text-[#8a97ad]">{desc}</div>
            </button>
          ))}

          <button type="button" className="rounded-[14px] border border-[#edf1f8] bg-white px-5 py-6 text-left">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef4ff] text-[#2f6bff]">
                <UserOutlined />
              </span>
              <span className="text-[15px] font-semibold text-[#1d2740]">{roleCards[3][0]}</span>
            </div>
            <div className="mt-4 text-[13px] leading-6 text-[#8a97ad]">{roleCards[3][1]}</div>
          </button>
        </div>

        <div className="mt-12 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="h-[40px] w-[92px] rounded-[8px] border border-[#dfe7f5] text-[14px] text-[#5d6a82]">
            取消
          </button>
          <button type="button" className="h-[40px] w-[104px] rounded-[8px] bg-[#2f6bff] text-[14px] font-medium text-white">
            下一步
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Employees() {
  const [open, setOpen] = useState(true);

  return (
    <>
      <Panel className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[18px] font-semibold text-[#1d2740]">员工管理</div>
            <div className="mt-1 text-[12px] text-[#98a3b7]">管理您的AI数字员工，已配置他们的职责和权限</div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-[8px] bg-[#2f6bff] px-4 py-2 text-[12px] font-medium text-white"
          >
            + 创建员工
          </button>
        </div>

        <div className="mt-5 overflow-hidden rounded-[14px] border border-[#edf1f8]">
          <div className="grid grid-cols-[1.5fr_1.4fr_1fr_0.7fr_0.7fr_0.7fr] bg-[#fbfcff] px-4 py-3 text-[12px] text-[#8d99ae]">
            <div>员工信息</div>
            <div>角色</div>
            <div>状态</div>
            <div>任务</div>
            <div>效率</div>
            <div>操作</div>
          </div>

          {employees.map(([name, role, status, tasks, efficiency], index) => (
            <div
              key={name}
              className={`grid grid-cols-[1.5fr_1.4fr_1fr_0.7fr_0.7fr_0.7fr] items-center px-4 py-4 text-[13px] text-[#5f6d83] ${
                index !== employees.length - 1 ? 'border-t border-[#f1f4f8]' : ''
              }`}
            >
              <AvatarToken name={name} index={index} />
              <div>{role}</div>
              <div>
                <StatusPill
                  color={
                    status === '编码中'
                      ? 'green'
                      : status === '测试中'
                      ? 'blue'
                      : status === '部署中'
                      ? 'purple'
                      : status === '思考中'
                      ? 'orange'
                      : 'gray'
                  }
                >
                  {status}
                </StatusPill>
              </div>
              <div>{tasks}</div>
              <div>{efficiency}</div>
              <div className="text-[#8d99ae]">◔ ⋯</div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-end gap-2 text-[12px] text-[#8d99ae]">
          <button type="button" className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#edf1f8]">‹</button>
          <button type="button" className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#2f6bff] text-[#2f6bff]">1</button>
          <button type="button" className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#edf1f8]">›</button>
        </div>
      </Panel>

      {open ? <CreateEmployeeModal onClose={() => setOpen(false)} /> : null}
    </>
  );
}
