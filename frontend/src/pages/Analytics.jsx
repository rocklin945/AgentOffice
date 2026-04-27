import React from 'react';
import { BarChart, LineChart, Panel } from '../components/AppPrimitives';

export default function Analytics() {
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
    </Panel>
  );
}
