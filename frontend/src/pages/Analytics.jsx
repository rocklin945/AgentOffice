import React, { useEffect, useState } from 'react';
import { analyticsApi, taskApi } from '../api';
import { BarChart, LineChart, Panel } from '../components/AppPrimitives';

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('tasks');
  const [data, setData] = useState({ metrics: {}, employeeWorkload: [], taskCounts: {} });
  useEffect(() => {
    const load = async () => {
      try {
        const [metrics, workload, tasks] = await Promise.all([
          analyticsApi.getDashboard(),
          analyticsApi.getEmployeeWorkload(),
          taskApi.getList(),
        ]);
        const metricsData = metrics.data || {};
        console.log('Analytics metrics:', metricsData);
        console.log('Workload data:', workload.data);
        
        const taskCounts = {
          running: (tasks.data || []).filter((task) => (task.status || '').includes('进行')).length,
          completed: (tasks.data || []).filter((task) => (task.status || '').includes('完成')).length,
          failed: (tasks.data || []).filter((task) => (task.status || '').includes('失败')).length,
          pending: (tasks.data || []).filter((task) => (task.status || '').includes('待')).length,
        };
        const employeeWorkload = (workload.data || [])
          .map((item) => ({
            label: item.name || '-',
            value: item.taskCount || 0,
          }))
          .sort((a, b) => (b.value || 0) - (a.value || 0));
        console.log('Employee workload (sorted):', employeeWorkload);
        setData({ metrics: metricsData, employeeWorkload, taskCounts });
      } catch (err) {
        console.error('Failed to load analytics:', err);
        setData({ metrics: {}, employeeWorkload: [], taskCounts: {} });
      }
    };
    load();
  }, []);
  const tabs = [{ key: 'tasks', label: '任务分析' }, { key: 'employees', label: '员工分析' }, { key: 'report', label: '报告' }];
  const trend = data.metrics?.trend || [];
  const labels = trend.map((item) => item.date?.slice(5) || item.date);

  return (
    <Panel className="p-5">
      <div className="text-[18px] font-semibold text-[#1d2740]">成果与数据分析</div>
      <div className="mt-4 flex gap-8 border-b border-[#edf1f8] pb-3 text-[13px]">{tabs.map((tab) => <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)} className={activeTab === tab.key ? 'font-medium text-[#2f6bff]' : 'text-[#8d99ae] hover:text-[#5f6d83]'}>{tab.label}</button>)}</div>
      <div className="mt-5">
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              {[['任务完成率', `${data.metrics?.taskCompletionRate || 0}%`, '#7ac891'], ['总任务数', data.metrics?.totalTasks || 0, '#2f6bff'], ['完成任务数', data.metrics?.completedTasks || 0, '#2bb36b'], ['工作产物', data.metrics?.productStats?.total || 0, '#f4b53f']].map(([label, value, color]) => (
                <div key={label} className="rounded-[14px] border border-[#edf1f8] px-4 py-4">
                  <div className="text-[12px] text-[#8d99ae]">{label}</div>
                  <div className="mt-2 text-[18px] font-semibold text-[#1d2740]">{value}</div>
                  <div className="mt-1 h-1 rounded-full" style={{width: '60%', backgroundColor: color}}></div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[['进行中任务', data.taskCounts?.running || 0], ['已完成任务', data.taskCounts?.completed || 0], ['失败任务', data.taskCounts?.failed || 0], ['待分配任务', data.taskCounts?.pending || 0]].map(([label, value]) => (
                <div key={label} className="rounded-[14px] border border-[#edf1f8] px-4 py-4">
                  <div className="text-[12px] text-[#8d99ae]">{label}</div>
                  <div className="mt-2 text-[18px] font-semibold text-[#1d2740]">{value}</div>
                </div>
              ))}
            </div>
            <div className="rounded-[14px] border border-[#edf1f8] p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[14px] font-medium text-[#1d2740]">任务完成趋势（近7天）</div>
                <div className="flex gap-4 text-[12px]">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#2f6bff]"></div>
                    <span className="text-[#6d7b92]">创建任务</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#39c3a5]"></div>
                    <span className="text-[#6d7b92]">完成任务</span>
                  </div>
                </div>
              </div>
              <div className="h-[240px]">
                <LineChart 
                  labels={labels.length ? labels : ['-']} 
                  series={[
                    { name: '创建任务', values: trend.length ? trend.map((i) => Number(i.total || 0)) : [0] },
                    { name: '完成任务', values: trend.length ? trend.map((i) => Number(i.completed || 0)) : [0] }
                  ]} 
                  height={240} 
                />
              </div>
              {trend.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[#edf1f8] grid grid-cols-7 gap-2 text-[11px]">
                  {trend.map((item, idx) => (
                    <div key={idx} className="text-center">
                      <div className="text-[#8d99ae] mb-1">{item.date?.slice(5) || '-'}</div>
                      <div className="text-[#2f6bff] font-medium">{item.total || 0}</div>
                      <div className="text-[#39c3a5] font-medium">{item.completed || 0}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === 'employees' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-[14px] border border-[#edf1f8] px-4 py-4 bg-gradient-to-br from-[#f0f7ff] to-white">
                <div className="text-[12px] text-[#8d99ae]">总员工数</div>
                <div className="mt-2 text-[24px] font-semibold text-[#2f6bff]">{data.employeeWorkload?.length || 0}</div>
              </div>
              <div className="rounded-[14px] border border-[#edf1f8] px-4 py-4 bg-gradient-to-br from-[#f0fff4] to-white">
                <div className="text-[12px] text-[#8d99ae]">总任务量</div>
                <div className="mt-2 text-[24px] font-semibold text-[#2bb36b]">
                  {data.employeeWorkload?.reduce((sum, e) => sum + (e.value || 0), 0) || 0}
                </div>
              </div>
              <div className="rounded-[14px] border border-[#edf1f8] px-4 py-4 bg-gradient-to-br from-[#fffbf0] to-white">
                <div className="text-[12px] text-[#8d99ae]">平均任务量</div>
                <div className="mt-2 text-[24px] font-semibold text-[#f4b53f]">
                  {data.employeeWorkload?.length > 0 
                    ? Math.round(data.employeeWorkload.reduce((sum, e) => sum + (e.value || 0), 0) / data.employeeWorkload.length) 
                    : 0}
                </div>
              </div>
            </div>
            
            <div className="rounded-[14px] border border-[#edf1f8] p-5 bg-white shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="text-[15px] font-semibold text-[#1d2740]">员工任务量排行榜</div>
                <div className="text-[11px] text-[#8d99ae]">按任务数量降序</div>
              </div>
              {data.employeeWorkload && data.employeeWorkload.length > 0 ? (
                <div className="space-y-4">
                  {data.employeeWorkload.map((item, idx) => {
                    const maxValue = Math.max(...data.employeeWorkload.map(e => e.value || 0), 1);
                    const percentage = ((item.value || 0) / maxValue) * 100;
                    const colors = [
                      ['#2f6bff', '#5b8aff'],
                      ['#39c3a5', '#5dd4b4'],
                      ['#f4b53f', '#f7c96b'],
                      ['#8d99ae', '#a8b3c5'],
                    ];
                    const [colorStart, colorEnd] = colors[Math.min(idx, 3)];
                    
                    return (
                      <div key={idx} className="group hover:bg-[#f8fafc] p-3 rounded-lg transition-all duration-200">
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-[13px]"
                               style={{ 
                                 backgroundColor: idx < 3 ? colorStart : '#e8ecf1',
                                 color: idx < 3 ? 'white' : '#6d7b92'
                               }}>
                            {idx + 1}
                          </div>
                          <div className="flex-shrink-0 w-24">
                            <div className="text-[13px] font-medium text-[#1d2740] truncate" title={item.label}>
                              {item.label}
                            </div>
                            <div className="text-[11px] text-[#8d99ae]">{item.value || 0} 个任务</div>
                          </div>
                          <div className="flex-1 h-10 bg-[#f5f7fa] rounded-xl overflow-hidden relative shadow-inner">
                            <div 
                              className="h-full rounded-xl transition-all duration-500 ease-out"
                              style={{ 
                                width: `${percentage}%`,
                                background: `linear-gradient(90deg, ${colorStart}, ${colorEnd})`
                              }}
                            ></div>
                            <div className="absolute inset-0 flex items-center justify-between px-4">
                              <div className="text-[11px] font-medium" style={{ color: percentage > 30 ? 'white' : colorStart }}>
                                {percentage.toFixed(0)}%
                              </div>
                              <div className="text-[13px] font-semibold" style={{ color: percentage > 50 ? 'white' : '#1d2740' }}>
                                {item.value || 0}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-[13px] text-[#8d99ae]">
                  <div className="text-[32px] mb-2">📊</div>
                  <div>暂无员工数据</div>
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === 'report' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-[14px] border border-[#edf1f8] p-5">
                <div className="text-[14px] font-medium text-[#1d2740]">工作产物统计</div>
                <div className="mt-4 space-y-3 text-[13px] text-[#6d7b92]">
                  <div>• 总产物数：<span className="text-[#1d2740] font-medium">{data.metrics?.productStats?.total || 0}</span> 个</div>
                  <div>• 已完成：<span className="text-[#1d2740] font-medium">{data.metrics?.productStats?.completed || 0}</span> 个</div>
                  <div>• 进行中：<span className="text-[#1d2740] font-medium">{data.metrics?.productStats?.inProgress || 0}</span> 个</div>
                  <div className="mt-3 pt-3 border-t border-[#edf1f8]">
                    <div className="text-[12px] text-[#8d99ae] mb-2">按类型分布：</div>
                    {Object.entries(data.metrics?.productStats?.byType || {}).map(([type, count]) => (
                      <div key={type} className="flex justify-between items-center mb-1">
                        <span>{type}</span>
                        <span className="text-[#1d2740] font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="rounded-[14px] border border-[#edf1f8] p-5">
                <div className="text-[14px] font-medium text-[#1d2740]">操作统计</div>
                <div className="mt-4 space-y-3 text-[13px] text-[#6d7b92]">
                  <div>• 总操作数：<span className="text-[#1d2740] font-medium">{data.metrics?.operationStats?.total || 0}</span> 次</div>
                  <div className="mt-3 pt-3 border-t border-[#edf1f8]">
                    <div className="text-[12px] text-[#8d99ae] mb-2">操作类型分布：</div>
                    {Object.entries(data.metrics?.operationStats?.byType || {}).slice(0, 8).map(([type, count]) => (
                      <div key={type} className="flex justify-between items-center mb-1">
                        <span className="truncate" title={type}>{type}</span>
                        <span className="text-[#1d2740] font-medium ml-2">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-[14px] border border-[#edf1f8] p-4">
              <div className="mb-2 text-[14px] font-medium text-[#1d2740]">数据总览</div>
              <div className="grid grid-cols-4 gap-4 mt-4">
                <div className="text-center p-3 bg-[#f8fafc] rounded-lg">
                  <div className="text-[20px] font-semibold text-[#2f6bff]">{data.metrics?.totalTasks || 0}</div>
                  <div className="text-[12px] text-[#8d99ae] mt-1">总任务</div>
                </div>
                <div className="text-center p-3 bg-[#f8fafc] rounded-lg">
                  <div className="text-[20px] font-semibold text-[#2bb36b]">{data.metrics?.completedTasks || 0}</div>
                  <div className="text-[12px] text-[#8d99ae] mt-1">已完成</div>
                </div>
                <div className="text-center p-3 bg-[#f8fafc] rounded-lg">
                  <div className="text-[20px] font-semibold text-[#f4b53f]">{data.metrics?.productStats?.total || 0}</div>
                  <div className="text-[12px] text-[#8d99ae] mt-1">工作产物</div>
                </div>
                <div className="text-center p-3 bg-[#f8fafc] rounded-lg">
                  <div className="text-[20px] font-semibold text-[#8d99ae]">{data.metrics?.operationStats?.total || 0}</div>
                  <div className="text-[12px] text-[#8d99ae] mt-1">操作记录</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
}
