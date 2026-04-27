import React, { useMemo, useState } from 'react';
import { CheckCircleFilled, ClockCircleFilled, CodeOutlined, TeamOutlined } from '@ant-design/icons';
import OfficeSceneSvg from '../components/OfficeSceneSvg';
import { DonutChart, Panel, ProgressTrack, StatusPill } from '../components/AppPrimitives';

const staffList = [
  {
    id: 'alex',
    name: 'Alex',
    title: '开发工程师-Alex',
    badge: '工作中',
    badgeColor: 'green',
    employeeNo: 'EMP1001',
    joinedAt: '2024-04-12',
    duty: '负责后端接口开发、业务逻辑实现、性能优化等工作',
    skills: ['JavaScript', 'Node.js', 'Express', 'MongoDB', 'Docker'],
    task: '开发用户登录接口',
    progress: 75,
    eta: '30分钟后',
    startedAt: '10:30:12',
    workingTime: '2小时35分钟',
    commits: '126次',
    testPass: '45个',
    deployCount: '12次',
  },
  {
    id: 'xiaoyu',
    name: '小雨',
    title: '产品经理-小雨',
    badge: '思考中',
    badgeColor: 'purple',
    employeeNo: 'EMP1002',
    joinedAt: '2024-03-26',
    duty: '负责需求分析、原型设计、跨团队沟通与任务拆解',
    skills: ['PRD', 'Figma', 'Axure', 'Roadmap'],
    task: '梳理登录流程与异常场景',
    progress: 62,
    eta: '45分钟后',
    startedAt: '09:48:20',
    workingTime: '3小时10分钟',
    commits: '16次',
    testPass: '12个',
    deployCount: '2次',
  },
  {
    id: 'testbot',
    name: 'TestBot',
    title: '测试工程师-TestBot',
    badge: '编译中',
    badgeColor: 'orange',
    employeeNo: 'EMP1003',
    joinedAt: '2024-04-18',
    duty: '负责自动化测试、回归验证、用例编排和质量报告输出',
    skills: ['Playwright', 'Jest', 'CI/CD', 'API Test'],
    task: '编写登录接口测试用例',
    progress: 40,
    eta: '1小时后',
    startedAt: '10:15:02',
    workingTime: '1小时52分钟',
    commits: '34次',
    testPass: '31个',
    deployCount: '4次',
  },
  {
    id: 'ops',
    name: 'Ops',
    title: '运维工程师-Ops',
    badge: '部署中',
    badgeColor: 'purple',
    employeeNo: 'EMP1004',
    joinedAt: '2024-02-19',
    duty: '负责环境部署、容器编排、监控告警与日志巡检',
    skills: ['K8s', 'Nginx', 'Prometheus', 'Linux'],
    task: '部署通知服务 order-service',
    progress: 60,
    eta: '45分钟后',
    startedAt: '10:05:16',
    workingTime: '2小时08分钟',
    commits: '52次',
    testPass: '20个',
    deployCount: '26次',
  },
  {
    id: 'json',
    name: 'Json',
    title: '开发工程师-Json',
    badge: '工作中',
    badgeColor: 'green',
    employeeNo: 'EMP1005',
    joinedAt: '2024-04-02',
    duty: '负责数据查询优化、缓存策略和接口联调',
    skills: ['TypeScript', 'Redis', 'SQL', 'NestJS'],
    task: '优化数据库查询',
    progress: 20,
    eta: '2小时后',
    startedAt: '10:40:00',
    workingTime: '58分钟',
    commits: '18次',
    testPass: '10个',
    deployCount: '3次',
  },
];

const statCards = [
  { label: '员工总数', value: '12人', icon: <TeamOutlined />, iconClass: 'bg-[#edf4ff] text-[#2f6bff]' },
  { label: '在线员工', value: '9人', icon: <CheckCircleFilled />, iconClass: 'bg-[#ebfbf1] text-[#2bb36b]' },
  { label: '忙碌中', value: '6人', icon: <ClockCircleFilled />, iconClass: 'bg-[#fff4ea] text-[#ff8a32]' },
  { label: '空闲中', value: '3人', icon: <ClockCircleFilled />, iconClass: 'bg-[#fff8e8] text-[#f4b53f]' },
  { label: '今日完成任务', value: '8个', icon: <CheckCircleFilled />, iconClass: 'bg-[#ebfbf1] text-[#2bb36b]' },
];

const activityList = [
  ['10:45', 'TestBot 编译完成了项目 “user-service”', '成功'],
  ['10:30', 'Alex 开始开发任务 “用户登录接口”', '进行中'],
  ['10:20', 'Ops 部署了服务 “order-service”', '成功'],
  ['10:15', 'Json 提交了代码到仓库', '进行中'],
  ['10:00', '小雨 完成了需求文档编写', '完成'],
];

const executionRows = [
  ['开发用户登录接口', 'Alex', 75, '剩余30分钟'],
  ['编写接口测试用例', 'TestBot', 40, '剩余1小时'],
  ['部署通知服务', 'Ops', 60, '剩余45分钟'],
  ['优化数据库查询', 'Json', 20, '剩余2小时'],
];

const donutItems = [
  { label: '工作中', value: 6, color: '#2f6bff' },
  { label: '思考中', value: 2, color: '#8b5cf6' },
  { label: '编译中', value: 1, color: '#ff8a32' },
  { label: '部署中', value: 1, color: '#f4b53f' },
  { label: '空闲中', value: 2, color: '#b8becb' },
];

function AvatarBadge({ name }) {
  return (
    <div className="flex h-[86px] w-[86px] items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#f6ddb4_0%,#d1a26c_65%,#9c7348_100%)] text-[30px] font-semibold text-white shadow-[inset_0_10px_20px_rgba(255,255,255,0.18)]">
      {name.slice(0, 1)}
    </div>
  );
}

export default function Office() {
  const [selected, setSelected] = useState(staffList[0]);

  const tabs = useMemo(() => ['概览', '任务', '记忆', '权限', '设置'], []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-semibold text-[#1d2740]">虚拟办公室</h1>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_342px]">
        <Panel className="p-4">
          <OfficeSceneSvg selectedId={selected.id} onSelect={setSelected} employees={staffList} />
        </Panel>

        <Panel className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#edf1f8] px-5 py-4">
            <div className="text-[18px] font-semibold text-[#1d2740]">员工详情</div>
            <button type="button" className="text-[20px] text-[#a0abc0]">
              ×
            </button>
          </div>

          <div className="px-5 py-6">
            <div className="flex items-center gap-4">
              <AvatarBadge name={selected.name} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-[17px] font-semibold text-[#1d2740]">{selected.title}</h2>
                  <StatusPill color={selected.badgeColor}>{selected.badge}</StatusPill>
                </div>
                <div className="mt-3 space-y-2 text-[13px] text-[#8c97ab]">
                  <div>员工编号：{selected.employeeNo}</div>
                  <div>加入时间：{selected.joinedAt}</div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex border-b border-[#edf1f8] text-[14px]">
              {tabs.map((tab, index) => (
                <button
                  key={tab}
                  type="button"
                  className={`mr-7 pb-3 font-medium ${
                    index === 0 ? 'border-b-2 border-[#2f6bff] text-[#2f6bff]' : 'text-[#7b879b]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="space-y-5 py-5">
              <div>
                <div className="mb-2 text-[15px] font-semibold text-[#1d2740]">职责</div>
                <p className="text-[13px] leading-7 text-[#7d879b]">{selected.duty}</p>
              </div>

              <div>
                <div className="mb-3 text-[15px] font-semibold text-[#1d2740]">技能</div>
                <div className="flex flex-wrap gap-2">
                  {selected.skills.map((skill) => (
                    <span key={skill} className="rounded-full bg-[#f5f8fd] px-3 py-1.5 text-[12px] text-[#5d6b82]">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-3 text-[15px] font-semibold text-[#1d2740]">当前任务</div>
                <div className="text-[20px] font-semibold text-[#1d2740]">{selected.task}</div>
                <ProgressTrack value={selected.progress} className="mt-4" />
                <div className="mt-2 text-[12px] text-[#8c97ab]">预计完成：{selected.eta}</div>
              </div>

              <div>
                <div className="mb-3 text-[15px] font-semibold text-[#1d2740]">工作状态</div>
                <div className="grid grid-cols-2 gap-y-3 text-[13px] text-[#7d879b]">
                  <span>当前状态：</span>
                  <span className="font-medium text-[#2bb36b]">{selected.badge}</span>
                  <span>开始时间：</span>
                  <span>{selected.startedAt}</span>
                  <span>工作时长：</span>
                  <span>{selected.workingTime}</span>
                </div>
              </div>

              <div>
                <div className="mb-3 text-[15px] font-semibold text-[#1d2740]">工作成果</div>
                <div className="grid grid-cols-2 gap-y-3 text-[13px] text-[#7d879b]">
                  <span>已提交代码：</span>
                  <span>{selected.commits}</span>
                  <span>通过测试：</span>
                  <span>{selected.testPass}</span>
                  <span>部署次数：</span>
                  <span>{selected.deployCount}</span>
                </div>
              </div>
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        {statCards.map((card) => (
          <Panel key={card.label} className="flex items-center gap-4 px-6 py-5">
            <div className={`flex h-11 w-11 items-center justify-center rounded-full text-[18px] ${card.iconClass}`}>
              {card.icon}
            </div>
            <div>
              <div className="text-[13px] text-[#95a1b5]">{card.label}</div>
              <div className="mt-1 text-[18px] font-semibold text-[#1d2740]">{card.value}</div>
            </div>
          </Panel>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1.15fr_1.55fr]">
        <Panel className="p-5">
          <div className="text-[18px] font-semibold text-[#1d2740]">员工状态分布</div>
          <div className="mt-6">
            <DonutChart items={donutItems} />
          </div>
        </Panel>

        <Panel className="p-5">
          <div className="text-[18px] font-semibold text-[#1d2740]">最近动态</div>
          <div className="mt-6 space-y-5">
            {activityList.map(([time, text, status]) => (
              <div key={`${time}-${text}`} className="flex items-center gap-3">
                <div className="w-11 text-[14px] font-medium text-[#738097]">{time}</div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f3f6fb] text-[#6d7891]">
                  <CodeOutlined />
                </div>
                <div className="min-w-0 flex-1 text-[14px] text-[#55657d]">{text}</div>
                <StatusPill color={status === '成功' ? 'green' : status === '进行中' ? 'blue' : 'gray'}>
                  {status}
                </StatusPill>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="p-5">
          <div className="text-[18px] font-semibold text-[#1d2740]">任务执行情况</div>
          <div className="mt-6 overflow-hidden rounded-[18px] border border-[#edf1f8]">
            <div className="h-2 w-full bg-[linear-gradient(90deg,#2f6bff_0_55%,#34d399_55%_82%,#ff7a59_82%_100%)]" />
            <div className="grid grid-cols-4 border-b border-[#edf1f8] text-center">
              {[
                ['全部任务', '15'],
                ['进行中', '5'],
                ['已完成', '8'],
                ['已失败', '2'],
              ].map(([label, value]) => (
                <div key={label} className="px-4 py-4">
                  <div className="text-[13px] text-[#95a1b5]">{label}</div>
                  <div className="mt-1 text-[24px] font-semibold text-[#1d2740]">{value}</div>
                </div>
              ))}
            </div>

            <div className="px-4 py-5">
              <div className="mb-4 grid grid-cols-[1.5fr_0.7fr_1fr_0.8fr] text-[13px] font-medium text-[#95a1b5]">
                <div>进行中任务</div>
                <div>辅助</div>
                <div />
                <div />
              </div>
              <div className="space-y-5">
                {executionRows.map(([task, owner, progress, eta]) => (
                  <div key={task} className="grid grid-cols-[1.5fr_0.7fr_1fr_0.8fr] items-center gap-4">
                    <div className="text-[14px] text-[#1d2740]">{task}</div>
                    <div className="text-[14px] text-[#738097]">{owner}</div>
                    <ProgressTrack value={progress} />
                    <div className="text-right text-[13px] text-[#95a1b5]">{eta}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
