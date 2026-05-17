import React, { useEffect, useState } from 'react';
import { analyticsApi, taskApi } from '../api';
import { BarChart, LineChart, Panel } from '../components/AppPrimitives';

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('tasks');
  const [data, setData] = useState({ metrics: {}, employeeWorkload: [], taskCounts: {} });
  const [showPreview, setShowPreview] = useState(false);
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
            role: item.role || '成员',
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
  
  const generateReportHTML = () => {
    const reportDate = new Date().toLocaleString('zh-CN');
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>团队工作成果报告 - ${reportDate}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif; background: #f5f7fa; padding: 40px 20px; }
    .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { border-bottom: 2px solid #edf1f8; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { font-size: 28px; color: #1d2740; margin-bottom: 8px; }
    .header .meta { font-size: 13px; color: #8d99ae; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
    .stat-card { background: linear-gradient(135deg, #f0f7ff 0%, #fafbff 100%); border: 1px solid #e3f0ff; border-radius: 12px; padding: 20px; }
    .stat-card.green { background: linear-gradient(135deg, #f0fff4 0%, #fafffe 100%); border-color: #d4f4dd; }
    .stat-card.orange { background: linear-gradient(135deg, #fffbf0 0%, #fffefc 100%); border-color: #ffe9c2; }
    .stat-card.purple { background: linear-gradient(135deg, #faf5ff 0%, #fdfcff 100%); border-color: #ead5ff; }
    .stat-label { font-size: 12px; color: #6d7b92; margin-bottom: 8px; }
    .stat-value { font-size: 32px; font-weight: bold; color: #2f6bff; }
    .stat-card.green .stat-value { color: #2bb36b; }
    .stat-card.orange .stat-value { color: #f4b53f; }
    .stat-card.purple .stat-value { color: #9b6bff; }
    .stat-desc { font-size: 11px; color: #8d99ae; margin-top: 4px; }
    .section { background: #fafbfc; border-radius: 12px; padding: 24px; margin-bottom: 20px; }
    .section-title { font-size: 16px; font-weight: 600; color: #1d2740; margin-bottom: 16px; }
    .detail-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    .detail-item { background: white; border-radius: 8px; padding: 16px; display: flex; justify-content: space-between; align-items: center; }
    .detail-label { font-size: 13px; color: #6d7b92; }
    .detail-value { font-size: 15px; font-weight: 600; color: #1d2740; }
    .employee-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .employee-card { background: #fafbfc; border-radius: 8px; padding: 16px; }
    .employee-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .employee-avatar { width: 40px; height: 40px; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 16px; }
    .avatar-0 { background: linear-gradient(135deg, #2f6bff, #5b8aff); }
    .avatar-1 { background: linear-gradient(135deg, #39c3a5, #5dd4b4); }
    .avatar-2 { background: linear-gradient(135deg, #f4b53f, #f7c96b); }
    .avatar-3 { background: linear-gradient(135deg, #ef4444, #f87171); }
    .avatar-4 { background: linear-gradient(135deg, #9b6bff, #b794f6); }
    .avatar-5 { background: linear-gradient(135deg, #ec4899, #f472b6); }
    .employee-name { font-size: 13px; font-weight: 500; color: #1d2740; }
    .employee-rank { font-size: 11px; color: #8d99ae; }
    .employee-tasks { font-size: 22px; font-weight: bold; color: #2f6bff; }
    .summary { background: linear-gradient(90deg, #f8fafc 0%, white 100%); border: 1px solid #edf1f8; border-radius: 12px; padding: 20px; }
    .summary-text { font-size: 13px; color: #6d7b92; line-height: 1.8; }
    .summary-text strong { color: #1d2740; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #edf1f8; font-size: 12px; color: #8d99ae; }
    @media print { body { background: white; padding: 0; } .container { box-shadow: none; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>团队工作成果报告</h1>
      <div class="meta">统计周期：近7天 | 生成时间：${reportDate} | 团队规模：${data.employeeWorkload?.length || 0} 人</div>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">任务总数</div>
        <div class="stat-value">${data.metrics?.totalTasks || 0}</div>
        <div class="stat-desc">累计创建任务</div>
      </div>
      <div class="stat-card green">
        <div class="stat-label">完成任务</div>
        <div class="stat-value">${data.metrics?.completedTasks || 0}</div>
        <div class="stat-desc">完成率 ${data.metrics?.taskCompletionRate || 0}%</div>
      </div>
      <div class="stat-card orange">
        <div class="stat-label">工作产物</div>
        <div class="stat-value">${data.metrics?.productStats?.total || 0}</div>
        <div class="stat-desc">已完成 ${data.metrics?.productStats?.completed || 0} 个</div>
      </div>
      <div class="stat-card purple">
        <div class="stat-label">操作记录</div>
        <div class="stat-value">${data.metrics?.operationStats?.total || 0}</div>
        <div class="stat-desc">系统操作次数</div>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">任务执行情况</div>
      <div class="detail-grid">
        <div class="detail-item">
          <span class="detail-label">进行中任务</span>
          <span class="detail-value">${data.taskCounts?.running || 0}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">已完成任务</span>
          <span class="detail-value">${data.taskCounts?.completed || 0}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">待处理任务</span>
          <span class="detail-value">${data.taskCounts?.pending || 0}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">失败任务</span>
          <span class="detail-value">${data.taskCounts?.failed || 0}</span>
        </div>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">工作产物详情</div>
      <div class="detail-grid">
        <div class="detail-item">
          <span class="detail-label">总产物数量</span>
          <span class="detail-value">${data.metrics?.productStats?.total || 0} 个</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">已完成产物</span>
          <span class="detail-value" style="color: #2bb36b">${data.metrics?.productStats?.completed || 0} 个</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">进行中产物</span>
          <span class="detail-value" style="color: #f4b53f">${data.metrics?.productStats?.inProgress || 0} 个</span>
        </div>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">团队成员贡献排行</div>
      <div class="employee-grid">
        ${(data.employeeWorkload || []).slice(0, 6).map((item, idx) => `
          <div class="employee-card">
            <div class="employee-header">
              <div class="employee-avatar avatar-${idx % 6}">${item.label?.charAt(0) || '?'}</div>
              <div>
                <div class="employee-name">${item.label}</div>
                <div class="employee-rank">${item.role || '成员'} · 排名 #${idx + 1}</div>
              </div>
            </div>
            <div class="employee-tasks">${item.value || 0} <span style="font-size: 12px; color: #8d99ae;">个任务</span></div>
          </div>
        `).join('')}
      </div>
    </div>
    
    <div class="summary">
      <div class="summary-text">
        <strong>报告总结：</strong><br><br>
        本周期内，团队共有 <strong>${data.employeeWorkload?.length || 0}</strong> 名成员参与工作，
        累计创建任务 <strong>${data.metrics?.totalTasks || 0}</strong> 个，
        完成 <strong>${data.metrics?.completedTasks || 0}</strong> 个，
        任务完成率达到 <strong>${data.metrics?.taskCompletionRate || 0}%</strong>。
        团队产出工作产物 <strong>${data.metrics?.productStats?.total || 0}</strong> 个，
        其中已完成 <strong>${data.metrics?.productStats?.completed || 0}</strong> 个。
        系统记录操作 <strong>${data.metrics?.operationStats?.total || 0}</strong> 次，
        团队协作效率良好。
      </div>
    </div>
    
    <div class="footer">
      AgentOffice 团队协作系统 | 自动生成报告
    </div>
  </div>
</body>
</html>`;
  };
  
  const handleExportHTML = () => {
    const html = generateReportHTML();
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `团队工作成果报告_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const handlePreview = () => {
    const html = generateReportHTML();
    const newWindow = window.open('', '_blank');
    newWindow.document.write(html);
    newWindow.document.close();
  };
  
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
                            <div className="text-[11px] text-[#8d99ae]">{item.role} · {item.value || 0} 个任务</div>
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
          <div className="space-y-5">
            <div className="rounded-[14px] border border-[#edf1f8] p-6 bg-white">
              <div className="border-b border-[#edf1f8] pb-4 mb-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-[18px] font-semibold text-[#1d2740]">团队工作成果报告</h2>
                    <p className="text-[12px] text-[#8d99ae] mt-1">统计周期：近7天 | 生成时间：{new Date().toLocaleString('zh-CN')}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handlePreview}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-[#e3f0ff] text-[#2f6bff] rounded-lg hover:bg-[#f0f7ff] transition-colors text-[13px] font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      预览报告
                    </button>
                    <button
                      onClick={handleExportHTML}
                      className="flex items-center gap-2 px-4 py-2 bg-[#2f6bff] text-white rounded-lg hover:bg-[#2557d6] transition-colors text-[13px] font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      导出HTML
                    </button>
                    <div className="text-right ml-3">
                      <div className="text-[13px] text-[#8d99ae]">团队规模</div>
                      <div className="text-[20px] font-semibold text-[#2f6bff]">{data.employeeWorkload?.length || 0} 人</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-[#f0f7ff] to-[#fafbff] rounded-xl p-4 border border-[#e3f0ff]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] text-[#6d7b92]">任务总数</span>
                    <svg className="w-5 h-5 text-[#2f6bff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="text-[26px] font-bold text-[#2f6bff]">{data.metrics?.totalTasks || 0}</div>
                  <div className="text-[11px] text-[#8d99ae] mt-1">累计创建任务</div>
                </div>
                <div className="bg-gradient-to-br from-[#f0fff4] to-[#fafffe] rounded-xl p-4 border border-[#d4f4dd]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] text-[#6d7b92]">完成任务</span>
                    <svg className="w-5 h-5 text-[#2bb36b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-[26px] font-bold text-[#2bb36b]">{data.metrics?.completedTasks || 0}</div>
                  <div className="text-[11px] text-[#8d99ae] mt-1">完成率 {data.metrics?.taskCompletionRate || 0}%</div>
                </div>
                <div className="bg-gradient-to-br from-[#fffbf0] to-[#fffefc] rounded-xl p-4 border border-[#ffe9c2]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] text-[#6d7b92]">工作产物</span>
                    <svg className="w-5 h-5 text-[#f4b53f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div className="text-[26px] font-bold text-[#f4b53f]">{data.metrics?.productStats?.total || 0}</div>
                  <div className="text-[11px] text-[#8d99ae] mt-1">已完成 {data.metrics?.productStats?.completed || 0} 个</div>
                </div>
                <div className="bg-gradient-to-br from-[#faf5ff] to-[#fdfcff] rounded-xl p-4 border border-[#ead5ff]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] text-[#6d7b92]">操作记录</span>
                    <svg className="w-5 h-5 text-[#9b6bff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="text-[26px] font-bold text-[#9b6bff]">{data.metrics?.operationStats?.total || 0}</div>
                  <div className="text-[11px] text-[#8d99ae] mt-1">系统操作次数</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="bg-[#fafbfc] rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-[#2f6bff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <h3 className="text-[15px] font-semibold text-[#1d2740]">任务执行情况</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-[#2f6bff]"></div>
                        <span className="text-[13px] text-[#6d7b92]">进行中任务</span>
                      </div>
                      <span className="text-[15px] font-semibold text-[#1d2740]">{data.taskCounts?.running || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-[#2bb36b]"></div>
                        <span className="text-[13px] text-[#6d7b92]">已完成任务</span>
                      </div>
                      <span className="text-[15px] font-semibold text-[#1d2740]">{data.taskCounts?.completed || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-[#f4b53f]"></div>
                        <span className="text-[13px] text-[#6d7b92]">待处理任务</span>
                      </div>
                      <span className="text-[15px] font-semibold text-[#1d2740]">{data.taskCounts?.pending || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-[#ef4444]"></div>
                        <span className="text-[13px] text-[#6d7b92]">失败任务</span>
                      </div>
                      <span className="text-[15px] font-semibold text-[#1d2740]">{data.taskCounts?.failed || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#fafbfc] rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-[#f4b53f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    <h3 className="text-[15px] font-semibold text-[#1d2740]">工作产物详情</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <span className="text-[13px] text-[#6d7b92]">总产物数量</span>
                      <span className="text-[15px] font-semibold text-[#1d2740]">{data.metrics?.productStats?.total || 0} 个</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <span className="text-[13px] text-[#6d7b92]">已完成产物</span>
                      <span className="text-[15px] font-semibold text-[#2bb36b]">{data.metrics?.productStats?.completed || 0} 个</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <span className="text-[13px] text-[#6d7b92]">进行中产物</span>
                      <span className="text-[15px] font-semibold text-[#f4b53f]">{data.metrics?.productStats?.inProgress || 0} 个</span>
                    </div>
                    {Object.keys(data.metrics?.productStats?.byType || {}).length > 0 && (
                      <div className="p-3 bg-white rounded-lg">
                        <div className="text-[12px] text-[#8d99ae] mb-2">产物类型分布</div>
                        <div className="space-y-1">
                          {Object.entries(data.metrics?.productStats?.byType || {}).slice(0, 3).map(([type, count]) => (
                            <div key={type} className="flex justify-between text-[12px]">
                              <span className="text-[#6d7b92]">{type}</span>
                              <span className="text-[#1d2740] font-medium">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[14px] border border-[#edf1f8] p-6 bg-white">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-[#2f6bff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="text-[15px] font-semibold text-[#1d2740]">团队成员贡献排行</h3>
              </div>
              {data.employeeWorkload && data.employeeWorkload.length > 0 ? (
                <div className="grid grid-cols-3 gap-4">
                  {data.employeeWorkload.slice(0, 6).map((item, idx) => {
                    const avatarColors = [
                      'from-[#2f6bff] to-[#5b8aff]',
                      'from-[#39c3a5] to-[#5dd4b4]',
                      'from-[#f4b53f] to-[#f7c96b]',
                      'from-[#ef4444] to-[#f87171]',
                      'from-[#9b6bff] to-[#b794f6]',
                      'from-[#ec4899] to-[#f472b6]',
                    ];
                    return (
                      <div key={idx} className="bg-[#fafbfc] rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColors[idx % avatarColors.length]} flex items-center justify-center text-white font-semibold`}>
                            {item.label?.charAt(0) || '?'}
                          </div>
                          <div className="flex-1">
                            <div className="text-[13px] font-medium text-[#1d2740]">{item.label}</div>
                            <div className="text-[11px] text-[#8d99ae]">{item.role} · 排名 #{idx + 1}</div>
                          </div>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-[22px] font-bold text-[#2f6bff]">{item.value || 0}</span>
                          <span className="text-[12px] text-[#8d99ae]">个任务</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-[13px] text-[#8d99ae]">暂无员工数据</div>
              )}
            </div>

            <div className="rounded-[14px] border border-[#edf1f8] p-5 bg-gradient-to-r from-[#f8fafc] to-white">
              <div className="text-[13px] text-[#6d7b92] leading-relaxed">
                <div className="flex items-start gap-2 mb-2">
                  <svg className="w-4 h-4 text-[#2f6bff] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <strong>报告总结：</strong>
                </div>
                <p className="ml-5">本周期内，团队共有 <strong className="text-[#2f6bff]">{data.employeeWorkload?.length || 0}</strong> 名成员参与工作，
                累计创建任务 <strong className="text-[#2f6bff]">{data.metrics?.totalTasks || 0}</strong> 个，
                完成 <strong className="text-[#2bb36b]">{data.metrics?.completedTasks || 0}</strong> 个，
                任务完成率达到 <strong className="text-[#2bb36b]">{data.metrics?.taskCompletionRate || 0}%</strong>。
                团队产出工作产物 <strong className="text-[#f4b53f]">{data.metrics?.productStats?.total || 0}</strong> 个，
                其中已完成 <strong className="text-[#2bb36b]">{data.metrics?.productStats?.completed || 0}</strong> 个。
                系统记录操作 <strong className="text-[#9b6bff]">{data.metrics?.operationStats?.total || 0}</strong> 次，
                团队协作效率良好。</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
}
