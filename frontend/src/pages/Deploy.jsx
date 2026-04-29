import React, { useState } from 'react';
import { Panel } from '../components/AppPrimitives';

const services = [
  { name: 'user-service', status: '运行中', image: 'user-service:1.2.0', version: '1.2.0', time: '2天5小时', containerId: 'abc2c3d4e5f6', port: '3000', cpu: '12%', memory: '256MB / 2GB' },
  { name: 'order-service', status: '运行中', image: 'order-service:1.1.0', version: '1.1.0', time: '1天8小时', containerId: 'def4c5d6e7f8', port: '3001', cpu: '8%', memory: '128MB / 2GB' },
  { name: 'payment-service', status: '已停止', image: 'payment-service:1.0.0', version: '1.0.0', time: '-', containerId: '-', port: '-', cpu: '-', memory: '-' },
];

const containers = [
  { id: 'c1', name: 'user-service-container', image: 'user-service:1.2.0', status: '运行中', cpu: '12%', memory: '256MB' },
  { id: 'c2', name: 'order-service-container', image: 'order-service:1.1.0', status: '运行中', cpu: '8%', memory: '128MB' },
  { id: 'c3', name: 'nginx-container', image: 'nginx:latest', status: '运行中', cpu: '3%', memory: '64MB' },
  { id: 'c4', name: 'redis-container', image: 'redis:alpine', status: '运行中', cpu: '2%', memory: '32MB' },
];

const images = [
  { name: 'user-service', tag: '1.2.0', size: '256MB', created: '2024-05-15' },
  { name: 'user-service', tag: '1.1.0', size: '248MB', created: '2024-05-10' },
  { name: 'order-service', tag: '1.1.0', size: '192MB', created: '2024-05-12' },
  { name: 'nginx', tag: 'latest', size: '142MB', created: '2024-04-20' },
  { name: 'redis', tag: 'alpine', size: '32MB', created: '2024-03-15' },
];

const logs = [
  { time: '12:30:15', level: 'info', message: '服务启动成功，监听端口 3000' },
  { time: '12:30:10', level: 'info', message: '加载配置文件 application.yml' },
  { time: '12:30:05', level: 'info', message: '连接数据库成功' },
  { time: '12:25:00', level: 'warn', message: 'CPU使用率超过80%' },
  { time: '12:20:30', level: 'error', message: '连接超时，已重试3次' },
  { time: '12:15:00', level: 'info', message: '健康检查通过' },
];

function ServiceManagement({ selectedService, onSelectService }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
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
        {services.map((service, index) => (
          <div
            key={service.name}
            onClick={() => onSelectService(service)}
            className={`grid grid-cols-[1.4fr_0.9fr_1.5fr_0.7fr_0.9fr_0.7fr] cursor-pointer items-center px-4 py-4 text-[13px] transition-colors ${
              index !== services.length - 1 ? 'border-t border-[#f1f4f8]' : ''
            } ${selectedService?.name === service.name ? 'bg-[#f7fbff]' : 'hover:bg-[#fafbff]'}`}
          >
            <div className="text-[#2f6bff]">{service.name}</div>
            <div className={service.status === '运行中' ? 'text-[#2bb36b]' : 'text-[#ff6a5f]'}>{service.status}</div>
            <div>{service.image}</div>
            <div>{service.version}</div>
            <div>{service.time}</div>
            <div>◔ ⤢</div>
          </div>
        ))}
      </div>

      <div className="rounded-[14px] border border-[#edf1f8] px-5 py-4">
        {selectedService ? (
          <>
            <div className="text-[15px] font-semibold text-[#1d2740]">服务详情</div>
            <div className="mt-4 text-[24px] font-semibold text-[#1d2740]">{selectedService.name}</div>
            <div className="mt-4 space-y-3 text-[13px] text-[#6d7b92]">
              <div>状态：<span className={selectedService.status === '运行中' ? 'text-[#2bb36b]' : 'text-[#ff6a5f]'}>{selectedService.status}</span></div>
              <div>容器ID：{selectedService.containerId}</div>
              <div>镜像：{selectedService.image}</div>
              <div>端口：{selectedService.port}</div>
              <div>运行时间：{selectedService.time}</div>
              <div>CPU使用率：{selectedService.cpu}</div>
              <div>内存使用率：{selectedService.memory}</div>
            </div>
            <div className="mt-6 border-t border-[#edf1f8] pt-5">
              <div className="flex gap-3">
                <button type="button" className="rounded-[8px] bg-[#2f6bff] px-4 py-2 text-[12px] text-white">重启</button>
                <button type="button" className="rounded-[8px] bg-[#ff5c5c] px-4 py-2 text-[12px] text-white">停止</button>
                <button type="button" className="rounded-[8px] border border-[#dfe7f5] px-4 py-2 text-[12px] text-[#5d6a82]">查看日志</button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-[#8d99ae]">点击服务查看详情</div>
        )}
      </div>
    </div>
  );
}

function ContainerManagement() {
  return (
    <div className="rounded-[14px] border border-[#edf1f8]">
      <div className="px-5 py-4 text-[14px] font-medium text-[#1d2740]">容器列表</div>
      <div className="grid grid-cols-[1.5fr_1.5fr_1.2fr_0.7fr_0.7fr_0.7fr] bg-[#fbfcff] px-4 py-3 text-[12px] text-[#8d99ae]">
        <div>容器名称</div>
        <div>镜像</div>
        <div>状态</div>
        <div>CPU</div>
        <div>内存</div>
        <div>操作</div>
      </div>
      {containers.map((container, index) => (
        <div
          key={container.id}
          className={`grid grid-cols-[1.5fr_1.5fr_1.2fr_0.7fr_0.7fr_0.7fr] items-center px-4 py-4 text-[13px] text-[#5f6d83] ${
            index !== containers.length - 1 ? 'border-t border-[#f1f4f8]' : ''
          } hover:bg-[#fafbff] cursor-pointer`}
        >
          <div>{container.name}</div>
          <div className="text-[#8d99ae]">{container.image}</div>
          <div className="text-[#2bb36b]">{container.status}</div>
          <div>{container.cpu}</div>
          <div>{container.memory}</div>
          <div className="text-[#8d99ae]">⋯</div>
        </div>
      ))}
    </div>
  );
}

function ImageManagement() {
  return (
    <div className="rounded-[14px] border border-[#edf1f8]">
      <div className="px-5 py-4 text-[14px] font-medium text-[#1d2740]">镜像列表</div>
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr_0.7fr] bg-[#fbfcff] px-4 py-3 text-[12px] text-[#8d99ae]">
        <div>镜像名称</div>
        <div>标签</div>
        <div>大小</div>
        <div>创建时间</div>
        <div>操作</div>
      </div>
      {images.map((image, index) => (
        <div
          key={`${image.name}:${image.tag}`}
          className={`grid grid-cols-[2fr_1fr_1fr_1fr_0.7fr] items-center px-4 py-4 text-[13px] text-[#5f6d83] ${
            index !== images.length - 1 ? 'border-t border-[#f1f4f8]' : ''
          } hover:bg-[#fafbff] cursor-pointer`}
        >
          <div className="text-[#2f6bff]">{image.name}</div>
          <div className="text-[#8d99ae]">{image.tag}</div>
          <div>{image.size}</div>
          <div className="text-[#8d99ae]">{image.created}</div>
          <div className="text-[#8d99ae]">⋯</div>
        </div>
      ))}
    </div>
  );
}

function LogMonitoring() {
  const levelColors = {
    info: 'text-[#2f6bff]',
    warn: 'text-[#ff9b42]',
    error: 'text-[#ff6a5f]',
  };

  return (
    <div className="rounded-[14px] border border-[#edf1f8]">
      <div className="flex items-center justify-between px-5 py-4">
        <div className="text-[14px] font-medium text-[#1d2740]">实时日志</div>
        <div className="flex gap-2">
          <button type="button" className="rounded-[6px] bg-[#2f6bff] px-3 py-1 text-[11px] text-white">刷新</button>
          <button type="button" className="rounded-[6px] border border-[#edf1f8] px-3 py-1 text-[11px] text-[#5d6a82]">清空</button>
        </div>
      </div>
      <div className="max-h-[400px] overflow-auto bg-[#1a2235] px-4 py-3 font-mono text-[12px]">
        {logs.map((log, index) => (
          <div key={index} className="flex gap-3 py-1">
            <span className="text-[#6b7a99]">{log.time}</span>
            <span className={`font-medium uppercase ${levelColors[log.level]}`}>[{log.level}]</span>
            <span className="text-[#c8d4e8]">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Deploy() {
  const [activeTab, setActiveTab] = useState('services');
  const [selectedService, setSelectedService] = useState(services[0]);

  const tabs = [
    { key: 'services', label: '服务管理' },
    { key: 'containers', label: '容器管理' },
    { key: 'images', label: '镜像管理' },
    { key: 'logs', label: '日志监控' },
  ];

  return (
    <Panel className="p-5">
      <div className="flex items-center justify-between">
        <div className="text-[18px] font-semibold text-[#1d2740]">部署与运维</div>
        <button type="button" className="text-[18px] text-[#8d99ae] hover:text-[#5f6d83]">×</button>
      </div>

      <div className="mt-4 flex gap-6 border-b border-[#edf1f8] pb-2 text-[13px]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`pb-2 font-medium transition-colors ${
              activeTab === tab.key
                ? 'border-b-2 border-[#2f6bff] text-[#2f6bff]'
                : 'text-[#8d99ae] hover:text-[#5f6d83]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {activeTab === 'services' && <ServiceManagement selectedService={selectedService} onSelectService={setSelectedService} />}
        {activeTab === 'containers' && <ContainerManagement />}
        {activeTab === 'images' && <ImageManagement />}
        {activeTab === 'logs' && <LogMonitoring />}
      </div>
    </Panel>
  );
}