import React from 'react';
import {
  CheckCircleFilled,
  PlayCircleFilled,
  TeamOutlined,
} from '@ant-design/icons';
import { BarChart, LineChart, Panel, ProgressTrack, StatusPill } from '../components/AppPrimitives';

const overviewStats = [
  { label: '员工总数', value: '5', color: 'bg-[#edf4ff] text-[#2f6bff]', icon: <TeamOutlined /> },
  { label: '进行中任务', value: '12', color: 'bg-[#ebfbf1] text-[#2bb36b]', icon: <CheckCircleFilled /> },
  { label: '今日完成', value: '8', color: 'bg-[#fff4ea] text-[#ff9b42]', icon: <PlayCircleFilled /> },
  { label: '系统状态', value: '正常', color: 'bg-[#ebfbf1] text-[#2bb36b]', icon: <CheckCircleFilled /> },
];

const employeeRows = [
  ['Alex', '开发工程师', '编码中', '3', '85%'],
  ['TestBot', '测试工程师', '测试中', '2', '78%'],
  ['OpsMaster', '运维工程师', '部署中', '2', '90%'],
  ['ProductKing', '产品经理', '思考中', '1', '88%'],
  ['DocHelper', '文档工程师', '空闲', '0', '70%'],
];

const taskRows = [
  ['开发用户登录接口', '高', 'Alex(开发工程师)', '进行中', 75, '2024-05-20 10:30'],
  ['编写登录接口测试用例', '中', 'TestBot(测试工程师)', '进行中', 60, '2024-05-20 10:35'],
  ['部署登录服务到测试环境', '高', 'OpsMaster(运维工程师)', '部署中', 40, '2024-05-20 10:40'],
  ['用户登录功能需求分析', '中', 'ProductKing(产品经理)', '已完成', 100, '2024-05-20 09:20'],
];

const deployRows = [
  ['user-service', '运行中', 'user-service:1.2.0', '1.2.0', '2天5小时'],
  ['order-service', '运行中', 'order-service:1.1.0', '1.1.0', '1天8小时'],
  ['payment-service', '已停止', 'payment-service:1.0.0', '1.0.0', '-'],
];

function AvatarCell({ name, tone }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-semibold text-white"
        style={{ background: tone }}
      >
        {name.slice(0, 1)}
      </div>
      <span>{name}</span>
    </div>
  );
}

function OverviewOfficeStage() {
  const markers = [
    { left: '20%', top: '52%', name: '调试工程师', status: '测试中', color: '#2bb36b' },
    { left: '41%', top: '25%', name: '产品经理', status: '思考中', color: '#8792a7' },
    { left: '67%', top: '29%', name: '开发工程师', status: '编码中', color: '#2bb36b' },
    { left: '49%', top: '68%', name: '运维工程师', status: '部署中', color: '#6f65ff' },
  ];

  return (
    <Panel className="overflow-hidden">
      <div className="flex items-start justify-between px-6 pt-5">
        <div>
          <div className="text-[28px] font-semibold text-[#1e2840]">我的办公室</div>
          <div className="mt-3 text-[16px] font-medium text-[#1f2940]">上午好，张三！ 👋</div>
          <div className="mt-1 text-[12px] text-[#8c97ab]">今天是 2024年05月20日 星期一</div>
        </div>
        <div className="grid min-w-[460px] grid-cols-4 gap-4">
          {overviewStats.map((item) => (
            <div key={item.label} className="rounded-[16px] bg-[#fbfcff] px-4 py-3 shadow-[inset_0_0_0_1px_#eef2f8]">
              <div className="flex items-center gap-2">
                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[13px] ${item.color}`}>
                  {item.icon}
                </span>
                <span className="text-[11px] text-[#98a3b7]">{item.label}</span>
              </div>
              <div className="mt-2 text-[26px] font-semibold leading-none text-[#1d2740]">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative m-6 h-[420px] overflow-hidden rounded-[18px] border border-[#edf1f8] bg-[linear-gradient(180deg,#f8fbff_0%,#eef4fb_100%)]">
        <svg viewBox="0 0 1120 560" className="absolute inset-0 h-full w-full">
          <defs>
            <linearGradient id="home-wall" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#ded6d4" />
              <stop offset="100%" stopColor="#b9acad" />
            </linearGradient>
            <linearGradient id="home-floor" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#7f8291" />
              <stop offset="100%" stopColor="#4e5261" />
            </linearGradient>
            <linearGradient id="home-window" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#c5e3ff" />
              <stop offset="100%" stopColor="#7eb0ea" />
            </linearGradient>
          </defs>
          <polygon points="160,70 620,38 1020,176 570,230" fill="url(#home-wall)" />
          <polygon points="160,70 46,132 46,402 168,478" fill="#d6cbca" />
          <polygon points="1020,176 1020,422 898,498 898,246" fill="#d3c8c8" />
          <polygon points="168,478 46,402 534,308 898,498" fill="#666c7d" />
          <polygon points="160,70 620,38 1020,176 534,308 46,132" fill="url(#home-floor)" />

          {[
            [200, 102, 165, 112],
            [400, 88, 180, 120],
            [646, 110, 170, 112],
          ].map(([x, y, w, h]) => (
            <g key={`${x}-${y}`}>
              <rect x={x} y={y} width={w} height={h} rx="6" fill="#30415a" />
              <rect x={x + 6} y={y + 6} width={w - 12} height={h - 12} rx="4" fill="url(#home-window)" />
            </g>
          ))}

          {[
            [224, 284],
            [470, 240],
            [650, 318],
            [432, 412],
          ].map(([x, y]) => (
            <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
              <polygon points="0,32 40,10 116,10 76,32" fill="#ebeff6" />
              <polygon points="0,32 76,32 76,88 0,88" fill="#d4dae4" />
              <polygon points="76,32 116,10 116,66 76,88" fill="#bcc5d4" />
              <polygon points="12,24 46,8 104,8 70,24" fill="#f0e0d1" />
              <polygon points="12,24 70,24 70,70 12,70" fill="#d7bea6" />
              <polygon points="70,24 104,8 104,54 70,70" fill="#b99377" />
            </g>
          ))}

          {[
            [94, 154],
            [120, 356],
            [356, 108],
            [560, 98],
            [844, 196],
            [760, 440],
          ].map(([x, y]) => (
            <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
              <rect x="0" y="12" width="18" height="14" rx="3" fill="#8f6b55" />
              <path d="M9 0 C2 6 2 12 9 16 C16 12 16 6 9 0Z" fill="#4caf74" />
            </g>
          ))}
        </svg>

        {markers.map((item) => (
          <div
            key={item.name}
            className="absolute rounded-[14px] bg-[rgba(18,22,32,0.88)] px-4 py-2 shadow-[0_14px_24px_rgba(15,23,42,0.22)]"
            style={{ left: item.left, top: item.top }}
          >
            <div className="text-[13px] font-semibold text-white">{item.name}</div>
            <div
              className="mt-1 inline-flex rounded-full px-3 py-1 text-[11px] font-medium text-white"
              style={{ backgroundColor: item.color }}
            >
              {item.status}
            </div>
          </div>
        ))}

        <div className="absolute right-[7%] top-[53%] rounded-[14px] bg-[rgba(18,22,32,0.82)] px-4 py-3 text-white">
          <div className="text-[13px] font-semibold">空闲工位</div>
          <button type="button" className="mt-2 rounded-full bg-white/10 px-3 py-2 text-[12px]">
            + 创建员工
          </button>
        </div>

        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-3">
          {['办公总览', '音乐: 开', '视角切换'].map((item) => (
            <div key={item} className="rounded-full bg-white/90 px-4 py-2 text-[12px] text-[#596780] shadow-sm">
              {item}
            </div>
          ))}
        </div>

        <div className="absolute bottom-3 right-4 h-[76px] w-[134px] rounded-[12px] border border-[#edf1f8] bg-white p-2 shadow-sm">
          <div className="mb-2 text-[11px] text-[#7c88a0]">虚拟地图</div>
          <div className="h-[44px] rounded-[8px] bg-[linear-gradient(180deg,#f3f6fb_0%,#e8edf6_100%)]" />
        </div>
      </div>
    </Panel>
  );
}

function EmployeeWidget() {
  return (
    <Panel className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[18px] font-semibold text-[#1d2740]">员工管理</div>
          <div className="mt-1 text-[12px] text-[#98a3b7]">管理您的AI数字员工，已配置他们的职责和权限</div>
        </div>
        <button type="button" className="rounded-[8px] bg-[#2f6bff] px-4 py-2 text-[12px] font-medium text-white">
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
        {employeeRows.map(([name, role, status, tasks, rate], index) => (
          <div
            key={name}
            className={`grid grid-cols-[1.5fr_1.4fr_1fr_0.7fr_0.7fr_0.7fr] items-center px-4 py-3 text-[13px] text-[#5f6d83] ${
              index !== employeeRows.length - 1 ? 'border-t border-[#f1f4f8]' : ''
            }`}
          >
            <AvatarCell name={name} tone={['#4f8dff', '#7a7fff', '#f3a64a', '#22b07d', '#8a93a5'][index]} />
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
            <div>{rate}</div>
            <div className="text-[#8d99ae]">⋯</div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function TaskWidget() {
  return (
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
          <div />
        </div>
        {taskRows.map(([task, level, owner, status, progress, time], index) => (
          <div
            key={task}
            className={`grid grid-cols-[1.6fr_0.7fr_1.4fr_0.9fr_1.1fr_1.2fr_0.4fr] items-center px-4 py-3 text-[13px] text-[#5f6d83] ${
              index !== taskRows.length - 1 ? 'border-t border-[#f1f4f8]' : ''
            }`}
          >
            <div>{task}</div>
            <div className={level === '高' ? 'text-[#ff6a5f]' : 'text-[#ff9b42]'}>{level}</div>
            <div>{owner}</div>
            <div>
              <StatusPill color={status === '已完成' ? 'green' : status === '部署中' ? 'purple' : 'blue'}>
                {status}
              </StatusPill>
            </div>
            <ProgressTrack value={progress} />
            <div>{time}</div>
            <div>⋯</div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function DevWidget() {
  const code = [
    "const express = require('express');",
    "const router = express.Router();",
    "router.post('/login', async (req, res) => {",
    '  const { username, password } = req.body;',
    '  const user = await User.findOne({ username });',
    "  if (!user) return res.status(401).json({ message: '用户不存在' });",
    '  const matched = await user.comparePassword(password);',
    "  if (!matched) return res.status(401).json({ message: '密码错误' });",
    "  return res.json({ success: true, token: 'JWT' });",
    '});',
  ];

  return (
    <Panel className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#edf1f8] px-5 py-4">
        <div>
          <div className="text-[18px] font-semibold text-[#1d2740]">云端开发环境</div>
          <div className="mt-1 text-[12px] text-[#98a3b7]">项目：user-service / 文件：controllers/auth.js</div>
        </div>
        <div className="flex gap-2">
          <button type="button" className="rounded-[8px] bg-[#21b56b] px-3 py-1.5 text-[12px] text-white">运行</button>
          <button type="button" className="rounded-[8px] border border-[#dfe7f5] px-3 py-1.5 text-[12px] text-[#5d6a82]">测试</button>
          <button type="button" className="rounded-[8px] bg-[#2f6bff] px-3 py-1.5 text-[12px] text-white">提交</button>
        </div>
      </div>

      <div className="grid grid-cols-[180px_minmax(0,1fr)_260px]">
        <div className="border-r border-[#edf1f8] bg-[#fbfcff] px-4 py-4 text-[13px] text-[#66758f]">
          <div className="mb-3 font-medium text-[#1d2740]">文件管理器</div>
          {['user-service', 'controllers', 'auth.js', 'models', 'routes', 'services', 'utils', 'app.js', 'package.json'].map((file, index) => (
            <div
              key={file}
              className={`mb-2 rounded-[8px] px-3 py-2 ${file === 'auth.js' ? 'bg-[#2f6bff] text-white' : index === 0 ? 'font-medium text-[#1d2740]' : ''}`}
            >
              {file}
            </div>
          ))}
        </div>

        <div className="bg-[#09172a] px-5 py-4 font-mono text-[13px] leading-7 text-[#c8dcff]">
          {code.map((line) => (
            <div key={line}>{line}</div>
          ))}
        </div>

        <div className="bg-[#111d30] px-5 py-4 text-[13px] text-[#a9c0db]">
          <div className="mb-4 flex items-center justify-between text-white">
            <span className="text-[16px] font-semibold">运行结果</span>
            <span className="text-[18px]">×</span>
          </div>
          <div className="mb-3 text-[#29d08e]">编译运行成功</div>
          <div className="space-y-2">
            <div>耗时：1.26s</div>
            <div>测试总数：12</div>
            <div>通过：11</div>
            <div>失败：1</div>
            <div className="text-[#3fd39e]">覆盖率：91.6%</div>
          </div>
          <div className="mt-4 border-t border-white/10 pt-4">
            <div className="mb-2 text-white">输出日志</div>
            <div>[INFO] 服务已启动成功</div>
            <div>[INFO] 端口：3000</div>
            <div>[ERROR] 测试用例失败：1</div>
          </div>
        </div>
      </div>
    </Panel>
  );
}

function DeployWidget() {
  return (
    <Panel className="p-5">
      <div className="flex items-center justify-between">
        <div className="text-[18px] font-semibold text-[#1d2740]">部署与运维</div>
        <button type="button" className="text-[#2f6bff]">×</button>
      </div>
      <div className="mt-4 flex gap-8 border-b border-[#edf1f8] pb-3 text-[13px]">
        {['服务管理', '容器管理', '镜像管理', '日志监控'].map((tab, index) => (
          <div key={tab} className={index === 0 ? 'font-medium text-[#2f6bff]' : 'text-[#8d99ae]'}>
            {tab}
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.9fr_1fr]">
        <div className="rounded-[14px] border border-[#edf1f8]">
          <div className="grid grid-cols-[1.4fr_0.9fr_1.6fr_0.7fr_0.9fr_0.7fr] bg-[#fbfcff] px-4 py-3 text-[12px] text-[#8d99ae]">
            <div>服务名称</div>
            <div>状态</div>
            <div>镜像</div>
            <div>版本</div>
            <div>运行时间</div>
            <div>操作</div>
          </div>
          {deployRows.map(([name, status, image, version, time], index) => (
            <div
              key={name}
              className={`grid grid-cols-[1.4fr_0.9fr_1.6fr_0.7fr_0.9fr_0.7fr] items-center px-4 py-4 text-[13px] text-[#5f6d83] ${
                index !== deployRows.length - 1 ? 'border-t border-[#f1f4f8]' : ''
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
          <div className="mt-4 text-[22px] font-semibold text-[#1d2740]">user-service</div>
          <div className="mt-4 space-y-3 text-[13px] text-[#6d7b92]">
            <div>状态：<span className="text-[#2bb36b]">运行中</span></div>
            <div>容器ID：abc2c3d4e5f6</div>
            <div>镜像：user-service:1.2.0</div>
            <div>端口：3000</div>
            <div>运行时间：2天5小时</div>
            <div>CPU使用率：12%</div>
            <div>内存使用率：256MB / 2GB</div>
          </div>
          <div className="mt-6 flex gap-3">
            <button type="button" className="rounded-[8px] bg-[#2f6bff] px-4 py-2 text-[12px] text-white">重启</button>
            <button type="button" className="rounded-[8px] bg-[#ff5c5c] px-4 py-2 text-[12px] text-white">停止</button>
            <button type="button" className="rounded-[8px] border border-[#dfe7f5] px-4 py-2 text-[12px] text-[#5d6a82]">查看日志</button>
          </div>
        </div>
      </div>
    </Panel>
  );
}

function AnalyticsWidget() {
  return (
    <Panel className="p-5">
      <div className="text-[18px] font-semibold text-[#1d2740]">成果与数据分析</div>
      <div className="mt-4 flex gap-8 border-b border-[#edf1f8] pb-3 text-[13px]">
        {['概览', '任务分析', '员工分析', '效率分析', '报告'].map((tab, index) => (
          <div key={tab} className={index === 0 ? 'font-medium text-[#2f6bff]' : 'text-[#8d99ae]'}>
            {tab}
          </div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-4 gap-4">
        {[
          ['任务完成率', '85.6%', '较上周 +12.5%'],
          ['总任务数', '128', '较上周 +8.2%'],
          ['完成任务数', '109', '较上周 +15.3%'],
          ['平均效率', '87.3%', '较上周 +9.7%'],
        ].map(([label, value, trend]) => (
          <div key={label} className="rounded-[14px] border border-[#edf1f8] px-4 py-4">
            <div className="text-[12px] text-[#8d99ae]">{label}</div>
            <div className="mt-2 text-[18px] font-semibold text-[#1d2740]">{value}</div>
            <div className="mt-1 text-[12px] text-[#7ac891]">{trend}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <div className="rounded-[14px] border border-[#edf1f8] p-4">
          <div className="mb-2 text-[14px] font-medium text-[#1d2740]">任务完成趋势</div>
          <div className="h-[170px]">
            <LineChart
              labels={['05-14', '05-15', '05-16', '05-17', '05-18', '05-19', '05-20']}
              series={[
                { name: '完成任务', values: [6, 4, 2, 3, 5, 4, 8] },
                { name: '创建任务', values: [4, 5, 3, 4, 4, 3, 6] },
              ]}
              height={170}
            />
          </div>
        </div>
        <div className="rounded-[14px] border border-[#edf1f8] p-4">
          <div className="mb-2 text-[14px] font-medium text-[#1d2740]">员工效率排行</div>
          <div className="h-[170px]">
            <BarChart
              items={[
                { label: 'Alex', value: 95 },
                { label: 'OpsMaster', value: 90 },
                { label: 'ProductKing', value: 86 },
                { label: 'TestBot', value: 78 },
                { label: 'DocHelper', value: 70 },
              ]}
              height={170}
            />
          </div>
        </div>
      </div>
    </Panel>
  );
}

function TaskDetailWidget() {
  return (
    <Panel className="p-5">
      <div className="mb-3 flex items-center gap-2 text-[18px] font-semibold text-[#1d2740]">
        <span>←</span>
        <span>任务详情</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-[26px] font-semibold text-[#1d2740]">开发用户登录接口</div>
        <StatusPill color="blue">进行中</StatusPill>
      </div>
      <div className="mt-3 text-[13px] text-[#8d99ae]">创建时间：2024-05-20 10:30　　优先级：高</div>

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
            {[
              ['1', '需求分析（产品经理）', '已完成'],
              ['2', '接口设计（开发工程师）', '已完成'],
              ['3', '代码开发（开发工程师）', '进行中'],
              ['4', '测试验证（测试工程师）', '待开始'],
              ['5', '部署上线（运维工程师）', '待开始'],
            ].map(([step, text, state]) => (
              <div key={step} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-[13px] text-[#5f6d83]">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#d9e5ff] text-[#2f6bff]">{step}</span>
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
          <ProgressTrack value={75} className="mt-4" />
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
  );
}

export default function Dashboard() {
  return (
    <div className="space-y-5">
      <OverviewOfficeStage />

      <div className="grid gap-5 xl:grid-cols-[1fr_1.06fr_1.35fr]">
        <EmployeeWidget />
        <TaskWidget />
        <DevWidget />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1.06fr_1.35fr]">
        <DeployWidget />
        <AnalyticsWidget />
        <TaskDetailWidget />
      </div>
    </div>
  );
}
