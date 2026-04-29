import React, { useState } from 'react';
import { BarChart, LineChart, Panel } from '../components/AppPrimitives';

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { key: 'overview', label: '概览' },
    { key: 'tasks', label: '任务分析' },
    { key: 'employees', label: '员工分析' },
    { key: 'efficiency', label: '效率分析' },
    { key: 'report', label: '报告' },
  ];

  return (
    <Panel className="p-5">
      <div className="text-[18px] font-semibold text-[#1d2740]">成果与数据分析</div>

      <div className="mt-4 flex gap-8 border-b border-[#edf1f8] pb-3 text-[13px]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={activeTab === tab.key ? 'font-medium text-[#2f6bff]' : 'text-[#8d99ae] hover:text-[#5f6d83]'}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {(activeTab === 'overview' || activeTab === 'tasks') && (
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
      )}

      <div className="mt-5">
        {activeTab === 'overview' && (
          <div className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-[14px] border border-[#edf1f8] p-4">
              <div className="mb-2 text-[14px] font-medium text-[#1d2740]">任务完成趋势</div>
              <div className="h-[220px]">
                <LineChart
                  labels={['05-14', '05-15', '05-16', '05-17', '05-18', '05-19', '05-20']}
                  series={[
                    { name: '完成任务', values: [6, 4, 2, 3, 5, 4, 8] },
                    { name: '创建任务', values: [4, 5, 3, 4, 4, 3, 6] },
                  ]}
                  height={220}
                />
              </div>
            </div>

            <div className="rounded-[14px] border border-[#edf1f8] p-4">
              <div className="mb-2 text-[14px] font-medium text-[#1d2740]">员工效率排行</div>
              <div className="h-[220px]">
                <BarChart
                  items={[
                    { label: 'Alex', value: 95 },
                    { label: 'OpsMaster', value: 90 },
                    { label: 'ProductKing', value: 86 },
                    { label: 'TestBot', value: 78 },
                    { label: 'DocHelper', value: 70 },
                  ]}
                  height={220}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="rounded-[14px] border border-[#edf1f8] px-4 py-4">
                <div className="text-[12px] text-[#8d99ae]">进行中任务</div>
                <div className="mt-2 text-[18px] font-semibold text-[#1d2740]">23</div>
              </div>
              <div className="rounded-[14px] border border-[#edf1f8] px-4 py-4">
                <div className="text-[12px] text-[#8d99ae]">已完成任务</div>
                <div className="mt-2 text-[18px] font-semibold text-[#1d2740]">109</div>
              </div>
              <div className="rounded-[14px] border border-[#edf1f8] px-4 py-4">
                <div className="text-[12px] text-[#8d99ae]">失败任务</div>
                <div className="mt-2 text-[18px] font-semibold text-[#1d2740]">3</div>
              </div>
              <div className="rounded-[14px] border border-[#edf1f8] px-4 py-4">
                <div className="text-[12px] text-[#8d99ae]">平均完成时间</div>
                <div className="mt-2 text-[18px] font-semibold text-[#1d2740]">4.2h</div>
              </div>
            </div>
            <div className="rounded-[14px] border border-[#edf1f8] p-4">
              <div className="mb-2 text-[14px] font-medium text-[#1d2740]">任务分布</div>
              <div className="h-[200px]">
                <LineChart
                  labels={['周一', '周二', '周三', '周四', '周五', '周六', '周日']}
                  series={[
                    { name: '进行中', values: [5, 8, 6, 9, 7, 4, 3] },
                    { name: '已完成', values: [12, 15, 14, 18, 16, 10, 8] },
                  ]}
                  height={200}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'employees' && (
          <div className="space-y-4">
            <div className="grid grid-cols-5 gap-4">
              {['Alex', 'OpsMaster', 'ProductKing', 'TestBot', 'DocHelper'].map((name, i) => (
                <div key={name} className="rounded-[14px] border border-[#edf1f8] px-4 py-4 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4f8dff] text-white mx-auto mb-2 text-[14px] font-medium">
                    {name.slice(0, 1)}
                  </div>
                  <div className="text-[12px] font-medium text-[#1d2740]">{name}</div>
                  <div className="text-[11px] text-[#8d99ae]">{[95, 90, 86, 78, 70][i]}%</div>
                </div>
              ))}
            </div>
            <div className="rounded-[14px] border border-[#edf1f8] p-4">
              <div className="mb-2 text-[14px] font-medium text-[#1d2740]">员工工作量对比</div>
              <div className="h-[200px]">
                <BarChart
                  items={[
                    { label: 'Alex', value: 85 },
                    { label: 'OpsMaster', value: 72 },
                    { label: 'ProductKing', value: 68 },
                    { label: 'TestBot', value: 58 },
                    { label: 'DocHelper', value: 35 },
                  ]}
                  height={200}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'efficiency' && (
          <div className="rounded-[14px] border border-[#edf1f8] p-4">
            <div className="mb-2 text-[14px] font-medium text-[#1d2740]">效率趋势</div>
            <div className="h-[200px]">
              <LineChart
                labels={['05-14', '05-15', '05-16', '05-17', '05-18', '05-19', '05-20']}
                series={[
                  { name: '开发效率', values: [82, 85, 88, 84, 90, 87, 92] },
                  { name: '测试效率', values: [75, 78, 80, 82, 79, 85, 88] },
                ]}
                height={200}
              />
            </div>
          </div>
        )}

        {activeTab === 'report' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-[14px] border border-[#edf1f8] p-5">
                <div className="text-[14px] font-medium text-[#1d2740]">本周总结</div>
                <div className="mt-4 space-y-3 text-[13px] text-[#6d7b92]">
                  <div>• 完成任务：<span className="text-[#1d2740] font-medium">45</span> 个</div>
                  <div>• 新建任务：<span className="text-[#1d2740] font-medium">38</span> 个</div>
                  <div>• 代码提交：<span className="text-[#1d2740] font-medium">126</span> 次</div>
                  <div>• 部署服务：<span className="text-[#1d2740] font-medium">12</span> 次</div>
                </div>
              </div>
              <div className="rounded-[14px] border border-[#edf1f8] p-5">
                <div className="text-[14px] font-medium text-[#1d2740]">下周计划</div>
                <div className="mt-4 space-y-3 text-[13px] text-[#6d7b92]">
                  <div>• 完成用户中心接口开发</div>
                  <div>• 优化数据库查询性能</div>
                  <div>• 完成支付模块测试</div>
                  <div>• 更新部署文档</div>
                </div>
              </div>
            </div>
            <div className="rounded-[14px] border border-[#edf1f8] p-4">
              <div className="mb-2 text-[14px] font-medium text-[#1d2740]">导出报告</div>
              <div className="flex gap-3 mt-4">
                <button type="button" className="rounded-[8px] bg-[#2f6bff] px-4 py-2 text-[12px] text-white">导出周报</button>
                <button type="button" className="rounded-[8px] border border-[#edf1f8] px-4 py-2 text-[12px] text-[#5d6a82]">导出月报</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
}