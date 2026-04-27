import React from 'react';
import { Panel } from '../components/AppPrimitives';

const services = [
  ['user-service', '运行中', 'user-service:1.2.0', '1.2.0', '2天5小时'],
  ['order-service', '运行中', 'order-service:1.1.0', '1.1.0', '1天8小时'],
  ['payment-service', '已停止', 'payment-service:1.0.0', '1.0.0', '-'],
];

export default function Deploy() {
  return (
    <Panel className="p-5">
      <div className="flex items-center justify-between">
        <div className="text-[18px] font-semibold text-[#1d2740]">部署与运维</div>
        <button type="button" className="text-[18px] text-[#2f6bff]">×</button>
      </div>

      <div className="mt-4 flex gap-8 border-b border-[#edf1f8] pb-3 text-[13px]">
        {['服务管理', '容器管理', '镜像管理', '日志监控'].map((tab, index) => (
          <div key={tab} className={index === 0 ? 'font-medium text-[#2f6bff]' : 'text-[#8d99ae]'}>
            {tab}
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-[14px] border border-[#edf1f8]">
          <div className="px-5 py-4 text-[14px] font-medium text-[#1d2740]">服务列表</div>
          <div className="grid grid-cols-[1.4fr_0.9fr_1.5fr_0.7fr_0.9fr_0.7fr] bg-[#fbfcff] px-4 py-3 text-[12px] text-[#8d99ae]">
            <div>服务名称</div>
            <div>状态</div>
            <div>镜像</div>
            <div>版本</div>
            <div>运行时间</div>
            <div>操作</div>
          </div>
          {services.map(([name, status, image, version, time], index) => (
            <div
              key={name}
              className={`grid grid-cols-[1.4fr_0.9fr_1.5fr_0.7fr_0.9fr_0.7fr] items-center px-4 py-4 text-[13px] text-[#5f6d83] ${
                index !== services.length - 1 ? 'border-t border-[#f1f4f8]' : ''
              }`}
            >
              <div className="text-[#2f6bff]">{name}</div>
              <div className={status === '运行中' ? 'text-[#2bb36b]' : 'text-[#ff6a5f]'}>{status}</div>
              <div>{image}</div>
              <div>{version}</div>
              <div>{time}</div>
              <div>◔ ⤢</div>
            </div>
          ))}
        </div>

        <div className="rounded-[14px] border border-[#edf1f8] px-5 py-4">
          <div className="text-[15px] font-semibold text-[#1d2740]">服务详情</div>
          <div className="mt-4 text-[24px] font-semibold text-[#1d2740]">user-service</div>
          <div className="mt-4 space-y-3 text-[13px] text-[#6d7b92]">
            <div>状态：<span className="text-[#2bb36b]">运行中</span></div>
            <div>容器ID：abc2c3d4e5f6</div>
            <div>镜像：user-service:1.2.0</div>
            <div>端口：3000</div>
            <div>运行时间：2天5小时</div>
            <div>CPU使用率：12%</div>
            <div>内存使用率：256MB / 2GB</div>
          </div>

          <div className="mt-6 border-t border-[#edf1f8] pt-5">
            <div className="flex gap-3">
              <button type="button" className="rounded-[8px] bg-[#2f6bff] px-4 py-2 text-[12px] text-white">重启</button>
              <button type="button" className="rounded-[8px] bg-[#ff5c5c] px-4 py-2 text-[12px] text-white">停止</button>
              <button type="button" className="rounded-[8px] border border-[#dfe7f5] px-4 py-2 text-[12px] text-[#5d6a82]">查看日志</button>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}
