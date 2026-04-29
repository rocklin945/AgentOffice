import React, { useState } from 'react';
import { UserOutlined, CheckCircleFilled } from '@ant-design/icons';
import { Panel, ProgressTrack, StatusPill } from '../components/AppPrimitives';

const employeeColors = {
  Alex: '#4f8dff',
  TestBot: '#6c7cff',
  OpsMaster: '#f5a544',
  ProductKing: '#f08b3a',
  DocHelper: '#94a0b8',
};

const employees = [
  {
    name: 'Alex',
    role: '开发工程师',
    status: '编码中',
    tasks: '3',
    efficiency: '85%',
    color: '#4f8dff',
    employeeNo: 'EMP1001',
    joinedAt: '2024-04-12',
    duty: '负责后端接口开发、业务逻辑实现、性能优化等工作',
    skills: ['JavaScript', 'Node.js', 'Express', 'MongoDB', 'Docker'],
    task: '开发用户登录接口',
    progress: 75,
    workingTime: '2小时35分钟',
    commits: '126次',
    testPass: '45个',
    deployCount: '12次',
    permissions: ['代码提交', '代码合并', '部署服务', '查看日志', '创建分支'],
  },
  {
    name: 'TestBot',
    role: '测试工程师',
    status: '测试中',
    tasks: '2',
    efficiency: '78%',
    color: '#6c7cff',
    employeeNo: 'EMP1002',
    joinedAt: '2024-04-18',
    duty: '负责自动化测试、回归验证、用例编排和质量报告输出',
    skills: ['Playwright', 'Jest', 'CI/CD', 'API Test'],
    task: '编写登录接口测试用例',
    progress: 40,
    workingTime: '1小时52分钟',
    commits: '34次',
    testPass: '31个',
    deployCount: '4次',
    permissions: ['执行测试', '查看日志', '创建缺陷'],
  },
  {
    name: 'OpsMaster',
    role: '运维工程师',
    status: '部署中',
    tasks: '2',
    efficiency: '90%',
    color: '#f5a544',
    employeeNo: 'EMP1003',
    joinedAt: '2024-02-19',
    duty: '负责环境部署、容器编排、监控告警与日志巡检',
    skills: ['K8s', 'Nginx', 'Prometheus', 'Linux'],
    task: '部署通知服务 order-service',
    progress: 60,
    workingTime: '2小时08分钟',
    commits: '52次',
    testPass: '20个',
    deployCount: '26次',
    permissions: ['部署服务', '重启服务', '查看日志', '管理容器', '配置监控'],
  },
  {
    name: 'ProductKing',
    role: '产品经理',
    status: '思考中',
    tasks: '1',
    efficiency: '88%',
    color: '#f08b3a',
    employeeNo: 'EMP1004',
    joinedAt: '2024-03-26',
    duty: '负责产品规划、需求管理和跨团队协作',
    skills: ['产品规划', '需求管理', '数据分析'],
    task: '产品路线图制定',
    progress: 30,
    workingTime: '1小时20分钟',
    commits: '8次',
    testPass: '5个',
    deployCount: '0次',
    permissions: ['创建任务', '分配任务', '查看报表'],
  },
  {
    name: 'DocHelper',
    role: '文档工程师',
    status: '空闲',
    tasks: '0',
    efficiency: '70%',
    color: '#94a0b8',
    employeeNo: 'EMP1005',
    joinedAt: '2024-05-02',
    duty: '负责技术文档编写、知识库维护和接口文档管理',
    skills: ['Markdown', 'API Doc', 'Confluence'],
    task: '暂无进行中任务',
    progress: 0,
    workingTime: '0分钟',
    commits: '5次',
    testPass: '0个',
    deployCount: '0次',
    permissions: ['编辑文档', '查看项目'],
  },
];

const roleCards = [
  ['开发工程师', '负责代码开发、实现功能需求'],
  ['测试工程师', '负责测试用例编写、功能测试'],
  ['运维工程师', '负责系统部署、运维与监控'],
  ['产品经理', '负责需求分析、产品规划'],
];

function AvatarToken({ name, color }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-semibold text-white"
        style={{ background: color }}
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

function EmployeeDetailPanel({ employee, onClose }) {
  const [activeTab, setActiveTab] = useState('info');

  const tabs = ['基本信息', '工作权限'];

  return (
    <div className="rounded-[16px] border border-[#edf1f8] bg-[#fbfcff] p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-[#edf1f8] pb-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full text-[20px] font-bold text-white"
            style={{ background: employee.color }}
          >
            {employee.name.slice(0, 1)}
          </div>
          <div>
            <div className="text-[16px] font-semibold text-[#1d2740]">{employee.name}</div>
            <div className="text-[12px] text-[#8d99ae]">{employee.role} · {employee.employeeNo}</div>
          </div>
        </div>
        <button type="button" onClick={onClose} className="text-[20px] text-[#a0abc0]">×</button>
      </div>

      <div className="mt-4 flex border-b border-[#edf1f8] text-[14px]">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(index === 0 ? 'info' : 'permissions')}
            className={`mr-6 pb-2 font-medium ${
              (activeTab === 'info' && index === 0) || (activeTab === 'permissions' && index === 1)
                ? 'border-b-2 border-[#2f6bff] text-[#2f6bff]'
                : 'text-[#7b879b]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'info' && (
        <div className="mt-4 space-y-4">
          <div>
            <div className="mb-2 text-[13px] font-medium text-[#1d2740]">当前任务</div>
            <div className="flex items-center gap-3">
              <span className="text-[14px] text-[#5f6d83]">{employee.task}</span>
              <span className="text-[12px] text-[#8d99ae]">({employee.progress}%)</span>
            </div>
            <ProgressTrack value={employee.progress} className="mt-2" />
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="rounded-[10px] bg-white p-3">
              <div className="text-[11px] text-[#98a3b7]">工作时长</div>
              <div className="mt-1 text-[14px] font-medium text-[#1d2740]">{employee.workingTime}</div>
            </div>
            <div className="rounded-[10px] bg-white p-3">
              <div className="text-[11px] text-[#98a3b7]">提交次数</div>
              <div className="mt-1 text-[14px] font-medium text-[#1d2740]">{employee.commits}</div>
            </div>
            <div className="rounded-[10px] bg-white p-3">
              <div className="text-[11px] text-[#98a3b7]">测试通过</div>
              <div className="mt-1 text-[14px] font-medium text-[#1d2740]">{employee.testPass}</div>
            </div>
            <div className="rounded-[10px] bg-white p-3">
              <div className="text-[11px] text-[#98a3b7]">部署次数</div>
              <div className="mt-1 text-[14px] font-medium text-[#1d2740]">{employee.deployCount}</div>
            </div>
          </div>

          <div>
            <div className="mb-2 text-[13px] font-medium text-[#1d2740]">职责</div>
            <div className="text-[13px] text-[#6d7b92]">{employee.duty}</div>
          </div>

          <div>
            <div className="mb-2 text-[13px] font-medium text-[#1d2740]">技能</div>
            <div className="flex flex-wrap gap-2">
              {employee.skills.map((skill) => (
                <span key={skill} className="rounded-full bg-[#f0f4ff] px-3 py-1 text-[12px] text-[#2f6bff]">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-[13px]">
            <div className="text-[#8d99ae]">员工编号：<span className="text-[#5f6d83]">{employee.employeeNo}</span></div>
            <div className="text-[#8d99ae]">加入时间：<span className="text-[#5f6d83]">{employee.joinedAt}</span></div>
          </div>
        </div>
      )}

      {activeTab === 'permissions' && (
        <div className="mt-4">
          <div className="mb-3 text-[13px] font-medium text-[#1d2740]">工作权限</div>
          <div className="grid grid-cols-2 gap-2">
            {employee.permissions.map((permission) => (
              <div key={permission} className="flex items-center gap-2 rounded-[8px] bg-white px-3 py-2">
                <CheckCircleFilled className="text-[#2bb36b]" />
                <span className="text-[13px] text-[#5f6d83]">{permission}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Employees() {
  const [open, setOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const getStatusColor = (status) => {
    if (status === '编码中') return 'green';
    if (status === '测试中') return 'blue';
    if (status === '部署中') return 'purple';
    if (status === '思考中') return 'orange';
    return 'gray';
  };

  return (
    <>
      <div className="flex gap-5">
        <div className={selectedEmployee ? 'w-1/2' : 'w-full'}>
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

              {employees.map((emp, index) => (
                <div
                  key={emp.name}
                  className={`grid grid-cols-[1.5fr_1.4fr_1fr_0.7fr_0.7fr_0.7fr] cursor-pointer items-center px-4 py-4 text-[13px] text-[#5f6d83] transition-colors ${
                    index !== employees.length - 1 ? 'border-t border-[#f1f4f8]' : ''
                  } ${selectedEmployee?.name === emp.name ? 'bg-[#f7fbff]' : 'hover:bg-[#fafbff]'}`}
                  onClick={() => setSelectedEmployee(emp)}
                >
                  <AvatarToken name={emp.name} color={emp.color} />
                  <div>{emp.role}</div>
                  <div>
                    <StatusPill color={getStatusColor(emp.status)}>
                      {emp.status}
                    </StatusPill>
                  </div>
                  <div>{emp.tasks}</div>
                  <div>{emp.efficiency}</div>
                  <div className="text-[#8d99ae]">⋯</div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-end gap-2 text-[12px] text-[#8d99ae]">
              <button type="button" className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#edf1f8]">‹</button>
              <button type="button" className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#2f6bff] text-[#2f6bff]">1</button>
              <button type="button" className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#edf1f8]">›</button>
            </div>
          </Panel>
        </div>

        {selectedEmployee && (
          <div className="w-1/2">
            <EmployeeDetailPanel employee={selectedEmployee} onClose={() => setSelectedEmployee(null)} />
          </div>
        )}
      </div>

      {open ? <CreateEmployeeModal onClose={() => setOpen(false)} /> : null}
    </>
  );
}