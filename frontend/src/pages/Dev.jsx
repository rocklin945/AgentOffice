import React from 'react';
import { Panel } from '../components/AppPrimitives';

const codeLines = [
  "const express = require('express');",
  'const router = express.Router();',
  "const User = require('../models/user');",
  '',
  "router.post('/login', async (req, res) => {",
  '  try {',
  '    const { username, password } = req.body;',
  '    const user = await User.findOne({ username });',
  "    if (!user) return res.status(401).json({ message: '用户不存在' });",
  '    const matched = await user.comparePassword(password);',
  "    if (!matched) return res.status(401).json({ message: '密码错误' });",
  "    return res.json({ success: true, token: 'JWT' });",
  '  } catch (error) {',
  "    return res.status(500).json({ message: '服务端错误' });",
  '  }',
  '});',
];

export default function Dev() {
  return (
    <Panel className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#edf1f8] px-5 py-4">
        <div>
          <div className="text-[18px] font-semibold text-[#1d2740]">云端开发环境</div>
          <div className="mt-1 text-[12px] text-[#98a3b7]">项目：user-service / 文件：controllers/auth.js</div>
        </div>
        <div className="flex gap-2">
          <button type="button" className="rounded-[8px] bg-[#21b56b] px-4 py-1.5 text-[12px] text-white">运行</button>
          <button type="button" className="rounded-[8px] border border-[#dfe7f5] px-4 py-1.5 text-[12px] text-[#5d6a82]">测试</button>
          <button type="button" className="rounded-[8px] bg-[#2f6bff] px-4 py-1.5 text-[12px] text-white">提交</button>
        </div>
      </div>

      <div className="grid grid-cols-[190px_minmax(0,1fr)_290px]">
        <div className="border-r border-[#edf1f8] bg-[#fbfcff] px-4 py-5 text-[13px] text-[#66758f]">
          <div className="mb-3 font-medium text-[#1d2740]">文件资源管理器</div>
          {[
            'user-service',
            'controllers',
            'auth.js',
            'models',
            'routes',
            'services',
            'utils',
            'app.js',
            'package.json',
            'Dockerfile',
          ].map((file, index) => (
            <div
              key={file}
              className={`mb-2 rounded-[8px] px-3 py-2 ${
                file === 'auth.js'
                  ? 'bg-[#2f6bff] text-white'
                  : index === 0 || index === 1
                  ? 'font-medium text-[#1d2740]'
                  : ''
              }`}
            >
              {file}
            </div>
          ))}
        </div>

        <div className="bg-[#081426] px-5 py-5 font-mono text-[13px] leading-7 text-[#c7dcff]">
          {codeLines.map((line, index) => (
            <div key={`${index}-${line}`} className="flex gap-4">
              <span className="w-5 text-right text-[#57739a]">{index + 1}</span>
              <span>{line || ' '}</span>
            </div>
          ))}
        </div>

        <div className="bg-[#111d30] px-5 py-5 text-[13px] text-[#a9c0db]">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-[16px] font-semibold text-white">运行结果</div>
            <button type="button" className="text-[18px] text-white/70">×</button>
          </div>

          <div className="mb-4 text-[15px] font-medium text-[#29d08e]">编译运行成功</div>
          <div className="space-y-2">
            <div>耗时：1.26s</div>
            <div>测试总数：12</div>
            <div>通过：11</div>
            <div>失败：1</div>
            <div>覆盖率：91.6%</div>
          </div>

          <div className="mt-5 border-t border-white/10 pt-4">
            <div className="mb-2 text-[14px] font-medium text-white">输出日志</div>
            <div>[INFO] 服务已启动成功</div>
            <div>[INFO] 端口：3000</div>
            <div>[INFO] 路由已注册成功</div>
            <div className="text-[#ff6a5f]">[ERROR] 测试用例失败：1</div>
          </div>
        </div>
      </div>
    </Panel>
  );
}
