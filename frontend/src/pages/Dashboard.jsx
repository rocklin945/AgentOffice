import React, { useEffect, useState } from 'react';
import { CheckCircleFilled, PlayCircleFilled, TeamOutlined } from '@ant-design/icons';
import { officeApi, uiApi } from '../api';
import { BarChart, LineChart, Panel, ProgressTrack, StatusPill } from '../components/AppPrimitives';
import HomeOfficeThreeScene from '../components/HomeOfficeThreeScene';

const iconMap = {
  team: <TeamOutlined />,
  check: <CheckCircleFilled />,
  play: <PlayCircleFilled />,
};

function AvatarCell({ name, tone }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-semibold text-white" style={{ background: tone }}>
        {name.slice(0, 1)}
      </div>
      <span>{name}</span>
    </div>
  );
}

function OfficeDeskLayout({ layout }) {
  if (!layout?.desks?.length) return null;
  return (
    <div className="mx-6 mb-6 rounded-[16px] border border-[#edf1f8] bg-[#fbfcff] p-4">
      <div className="mb-3 text-[15px] font-semibold text-[#1d2740]">工位布局</div>
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${layout.cols || 4}, minmax(0, 1fr))` }}>
        {layout.desks.map((desk) => (
          <div key={desk.id} className={`min-h-[76px] rounded-[12px] border p-3 ${desk.employee ? 'border-[#d9e5ff] bg-white' : 'border-[#edf1f8] bg-[#f7f9fd]'}`}>
            <div className="text-[12px] font-medium text-[#8d99ae]">{desk.deskCode}</div>
            <div className="mt-2 text-[13px] font-semibold text-[#1d2740]">{desk.employee?.name || '空闲工位'}</div>
            {desk.employee ? <div className="mt-1 text-[11px] text-[#8d99ae]">{desk.employee.role}</div> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function OverviewOfficeStage({ stats, layout }) {
  return (
    <Panel className="overflow-visible">
      <div className="flex flex-wrap items-start justify-between gap-5 px-6 pt-5">
        <div>
          <div className="text-[28px] font-semibold text-[#1e2840]">我的办公室</div>
          <div className="mt-3 text-[16px] font-medium text-[#1f2940]">欢迎回来</div>
          <div className="mt-1 text-[12px] text-[#8c97ab]">数据由后端实时提供</div>
        </div>
        <div className="grid min-w-[460px] grid-cols-2 gap-4 xl:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="rounded-[16px] bg-[#fbfcff] px-4 py-3 shadow-[inset_0_0_0_1px_#eef2f8]">
              <div className="flex items-center gap-2">
                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[13px] ${item.color}`}>
                  {iconMap[item.icon] || <CheckCircleFilled />}
                </span>
                <span className="text-[11px] text-[#98a3b7]">{item.label}</span>
              </div>
              <div className="mt-2 text-[26px] font-semibold leading-none text-[#1d2740]">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="m-6">
        <HomeOfficeThreeScene />
      </div>
      <OfficeDeskLayout layout={layout} />
    </Panel>
  );
}

function EmployeeWidget({ rows }) {
  const colors = ['#4f8dff', '#7a7fff', '#f3a64a', '#22b07d', '#8a93a5'];
  return (
    <Panel className="p-5">
      <div className="text-[18px] font-semibold text-[#1d2740]">员工管理</div>
      <div className="mt-5 overflow-hidden rounded-[14px] border border-[#edf1f8]">
        <div className="grid grid-cols-[1.5fr_1.4fr_1fr_0.7fr_0.7fr_0.7fr] bg-[#fbfcff] px-4 py-3 text-[12px] text-[#8d99ae]">
          <div>员工信息</div><div>角色</div><div>状态</div><div>任务</div><div>效率</div><div>操作</div>
        </div>
        {rows.map(([name, role, status, tasks, rate], index) => (
          <div key={name} className={`grid grid-cols-[1.5fr_1.4fr_1fr_0.7fr_0.7fr_0.7fr] items-center px-4 py-3 text-[13px] text-[#5f6d83] ${index !== rows.length - 1 ? 'border-t border-[#f1f4f8]' : ''}`}>
            <AvatarCell name={name} tone={colors[index % colors.length]} />
            <div>{role}</div>
            <div><StatusPill color={status === '部署中' ? 'purple' : status === '思考中' ? 'orange' : status === '空闲' ? 'gray' : 'blue'}>{status}</StatusPill></div>
            <div>{tasks}</div><div>{rate}</div><div className="text-[#8d99ae]">⋯</div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function TaskWidget({ rows }) {
  return (
    <Panel className="p-5">
      <div className="text-[18px] font-semibold text-[#1d2740]">任务管理</div>
      <div className="mt-4 overflow-hidden rounded-[14px] border border-[#edf1f8]">
        <div className="grid grid-cols-[1.6fr_0.7fr_1.4fr_0.9fr_1.1fr_1.2fr_0.4fr] bg-[#fbfcff] px-4 py-3 text-[12px] text-[#8d99ae]">
          <div>任务名称</div><div>优先级</div><div>分配给</div><div>状态</div><div>进度</div><div>创建时间</div><div />
        </div>
        {rows.map(([task, level, owner, status, progress, time], index) => (
          <div key={task} className={`grid grid-cols-[1.6fr_0.7fr_1.4fr_0.9fr_1.1fr_1.2fr_0.4fr] items-center px-4 py-3 text-[13px] text-[#5f6d83] ${index !== rows.length - 1 ? 'border-t border-[#f1f4f8]' : ''}`}>
            <div>{task}</div><div className={level === '高' ? 'text-[#ff6a5f]' : 'text-[#ff9b42]'}>{level}</div><div>{owner}</div>
            <div><StatusPill color={status === '已完成' ? 'green' : status === '部署中' ? 'purple' : 'blue'}>{status}</StatusPill></div>
            <ProgressTrack value={Number(progress || 0)} /><div>{time}</div><div>⋯</div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function DeployWidget({ rows }) {
  return (
    <Panel className="p-5">
      <div className="text-[18px] font-semibold text-[#1d2740]">部署与运维</div>
      <div className="mt-5 rounded-[14px] border border-[#edf1f8]">
        <div className="grid grid-cols-[1.4fr_0.9fr_1.6fr_0.7fr_0.9fr_0.7fr] bg-[#fbfcff] px-4 py-3 text-[12px] text-[#8d99ae]">
          <div>服务名称</div><div>状态</div><div>镜像</div><div>版本</div><div>运行时间</div><div>操作</div>
        </div>
        {rows.map(([name, status, image, version, time], index) => (
          <div key={name} className={`grid grid-cols-[1.4fr_0.9fr_1.6fr_0.7fr_0.9fr_0.7fr] items-center px-4 py-4 text-[13px] text-[#5f6d83] ${index !== rows.length - 1 ? 'border-t border-[#f1f4f8]' : ''}`}>
            <div className="text-[#2f6bff]">{name}</div><div className={status === '运行中' ? 'text-[#2bb36b]' : 'text-[#ff6a5f]'}>{status}</div><div>{image}</div><div>{version}</div><div>{time}</div><div>◔ ⤢</div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function AnalyticsWidget({ stats, trend }) {
  const labels = trend.map((item) => item.date?.slice(5) || item.date);
  return (
    <Panel className="p-5">
      <div className="text-[18px] font-semibold text-[#1d2740]">成果与数据分析</div>
      <div className="mt-5 grid grid-cols-4 gap-4">
        {stats.map(([label, value, desc]) => (
          <div key={label} className="rounded-[14px] border border-[#edf1f8] px-4 py-4">
            <div className="text-[12px] text-[#8d99ae]">{label}</div><div className="mt-2 text-[18px] font-semibold text-[#1d2740]">{value}</div><div className="mt-1 text-[12px] text-[#7ac891]">{desc}</div>
          </div>
        ))}
      </div>
      <div className="mt-5 h-[170px]">
        <LineChart labels={labels.length ? labels : ['-']} series={[
          { name: '完成任务', values: trend.length ? trend.map((i) => Number(i.completed || 0)) : [0] },
          { name: '创建任务', values: trend.length ? trend.map((i) => Number(i.total || 0)) : [0] },
        ]} height={170} />
      </div>
      <div className="mt-5 h-[170px]"><BarChart items={[]} height={170} /></div>
    </Panel>
  );
}

export default function Dashboard() {
  const [data, setData] = useState({ overviewStats: [], employeeRows: [], taskRows: [], deployRows: [], analyticsStats: [], trend: [] });
  const [layout, setLayout] = useState(null);

  useEffect(() => {
    uiApi.getDashboard().then((res) => setData((prev) => ({ ...prev, ...res.data }))).catch(() => {});
    officeApi.getLayout().then((res) => setLayout(res.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-5">
      <OverviewOfficeStage stats={data.overviewStats} layout={layout} />
      <div className="relative z-20 grid gap-5 xl:grid-cols-[1fr_1.06fr_1.35fr]">
        <EmployeeWidget rows={data.employeeRows} />
        <TaskWidget rows={data.taskRows} />
        <DeployWidget rows={data.deployRows} />
      </div>
      <AnalyticsWidget stats={data.analyticsStats} trend={data.trend} />
    </div>
  );
}
