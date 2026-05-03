import React, { useEffect, useState } from 'react';
import { uiApi } from '../api';
import { Panel } from '../components/AppPrimitives';

export default function Dev() {
  const [data, setData] = useState({ projectName: '-', fileName: '-', files: [], codeLines: [], runResult: { logs: [] } });
  useEffect(() => { uiApi.getDev().then((res) => setData(res.data)).catch(() => {}); }, []);
  const result = data.runResult || { logs: [] };
  return (
    <Panel className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#edf1f8] px-5 py-4"><div><div className="text-[18px] font-semibold text-[#1d2740]">云端开发环境</div><div className="mt-1 text-[12px] text-[#98a3b7]">项目：{data.projectName} / 文件：{data.fileName}</div></div><div className="flex gap-2"><button type="button" className="rounded-[8px] bg-[#21b56b] px-4 py-1.5 text-[12px] text-white">运行</button><button type="button" className="rounded-[8px] border border-[#dfe7f5] px-4 py-1.5 text-[12px] text-[#5d6a82]">测试</button><button type="button" className="rounded-[8px] bg-[#2f6bff] px-4 py-1.5 text-[12px] text-white">提交</button></div></div>
      <div className="grid grid-cols-[190px_minmax(0,1fr)_290px]">
        <div className="border-r border-[#edf1f8] bg-[#fbfcff] px-4 py-5 text-[13px] text-[#66758f]"><div className="mb-3 font-medium text-[#1d2740]">文件资源管理器</div>{data.files.map((file, index) => <div key={`${file.name}-${index}`} className={`mb-2 rounded-[8px] px-3 py-2 ${file.active ? 'bg-[#2f6bff] text-white' : file.directory ? 'font-medium text-[#1d2740]' : ''}`}>{file.name}</div>)}</div>
        <div className="bg-[#081426] px-5 py-5 font-mono text-[13px] leading-7 text-[#c7dcff]">{data.codeLines.map((line, index) => <div key={`${index}-${line}`} className="flex gap-4"><span className="w-5 text-right text-[#57739a]">{index + 1}</span><span>{line || ' '}</span></div>)}</div>
        <div className="bg-[#111d30] px-5 py-5 text-[13px] text-[#a9c0db]"><div className="mb-4 flex items-center justify-between"><div className="text-[16px] font-semibold text-white">运行结果</div><button type="button" className="text-[18px] text-white/70">×</button></div><div className="mb-4 text-[15px] font-medium text-[#29d08e]">{result.title}</div><div className="space-y-2"><div>耗时：{result.duration}</div><div>测试总数：{result.tests}</div><div>通过：{result.passed}</div><div>失败：{result.failed}</div><div>覆盖率：{result.coverage}</div></div><div className="mt-5 border-t border-white/10 pt-4"><div className="mb-2 text-[14px] font-medium text-white">输出日志</div>{(result.logs || []).map((log, index) => <div key={index}>{log}</div>)}</div></div>
      </div>
    </Panel>
  );
}
