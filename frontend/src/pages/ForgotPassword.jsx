import React from 'react';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

function CubeIllustration() {
  return (
    <svg viewBox="0 0 320 300" className="h-[290px] w-[300px]">
      <defs>
        <linearGradient id="cubeA2" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#4a8dff" />
          <stop offset="100%" stopColor="#1e5fff" />
        </linearGradient>
        <linearGradient id="cubeB2" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#4cc4ff" />
          <stop offset="100%" stopColor="#2a6bff" />
        </linearGradient>
      </defs>

      <g opacity="0.45">
        <polygon points="160,34 238,78 160,122 82,78" fill="none" stroke="#194fcb" />
        <polygon points="160,122 238,78 238,164 160,208" fill="none" stroke="#194fcb" />
        <polygon points="160,122 82,78 82,164 160,208" fill="none" stroke="#194fcb" />
      </g>

      <g transform="translate(78 50)">
        <polygon points="80,0 150,40 80,80 10,40" fill="url(#cubeA2)" />
        <polygon points="80,80 150,40 150,116 80,156" fill="#245cff" />
        <polygon points="80,80 10,40 10,116 80,156" fill="#1b4dcc" />

        <polygon points="80,18 126,44 80,70 34,44" fill="#63b0ff" opacity="0.94" />
        <polygon points="80,70 126,44 126,92 80,118" fill="#2f6bff" opacity="0.9" />
        <polygon points="80,70 34,44 34,92 80,118" fill="#2c56c6" opacity="0.95" />

        <rect x="70" y="32" width="20" height="24" rx="5" fill="#d9efff" opacity="0.95" />
        <path d="M76 34 V30 A4 4 0 0 1 84 30 V34" stroke="#2f6bff" strokeWidth="3" fill="none" />
      </g>

      {[
        [64, 112, 0.82],
        [248, 96, 0.9],
        [44, 190, 0.72],
      ].map(([x, y, opacity], index) => (
        <g key={index} transform={`translate(${x} ${y}) scale(0.62)`} opacity={opacity}>
          <polygon points="30,0 60,18 30,36 0,18" fill="url(#cubeB2)" />
          <polygon points="30,36 60,18 60,50 30,68" fill="#2c69ff" />
          <polygon points="30,36 0,18 0,50 30,68" fill="#214fcb" />
        </g>
      ))}

      <g opacity="0.55" stroke="#1749c6" fill="none">
        <polygon points="160,30 248,80 248,190 160,240 72,190 72,80" />
        <polygon points="160,6 276,72 276,212 160,278 44,212 44,72" />
      </g>
    </svg>
  );
}

export default function ForgotPassword() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#07111f] px-6 py-10">
      <div className="relative flex min-h-[640px] w-full max-w-[1180px] overflow-hidden rounded-[24px] border border-white/5 bg-[radial-gradient(circle_at_20%_0%,rgba(25,51,120,0.35)_0%,rgba(7,17,31,0)_32%),linear-gradient(180deg,#08111f_0%,#06111e_100%)] shadow-[0_36px_90px_rgba(2,8,18,0.52)]">
        <div className="flex w-[44%] flex-col px-12 py-16">
          <div className="text-[52px] font-semibold tracking-tight text-white">AI数字员工</div>
          <div className="mt-3 text-[28px] font-semibold text-[#69a8ff]">云端开发与运维平台</div>

          <div className="mt-12 rounded-[18px] border border-white/8 bg-[rgba(24,33,53,0.72)] px-6 py-7 shadow-[0_16px_48px_rgba(0,0,0,0.2)] backdrop-blur-sm">
            <div className="text-[34px] font-semibold text-white">找回密码</div>
            <div className="mt-2 text-[14px] text-[#8f9bb1]">输入注册邮箱，重置密码</div>

            <div className="mt-7 space-y-4">
              <div className="flex h-[48px] items-center gap-3 rounded-[10px] border border-white/10 bg-[rgba(6,16,32,0.35)] px-4">
                <MailOutlined className="text-[#71809a]" />
                <input
                  type="email"
                  placeholder="注册邮箱"
                  className="h-full flex-1 border-none bg-transparent text-[14px] text-white outline-none placeholder:text-[#71809a]"
                />
              </div>
              <div className="flex h-[48px] items-center gap-3 rounded-[10px] border border-white/10 bg-[rgba(6,16,32,0.35)] px-4">
                <LockOutlined className="text-[#71809a]" />
                <input
                  type="password"
                  placeholder="新密码"
                  className="h-full flex-1 border-none bg-transparent text-[14px] text-white outline-none placeholder:text-[#71809a]"
                />
              </div>
              <div className="flex h-[48px] items-center gap-3 rounded-[10px] border border-white/10 bg-[rgba(6,16,32,0.35)] px-4">
                <LockOutlined className="text-[#71809a]" />
                <input
                  type="password"
                  placeholder="确认新密码"
                  className="h-full flex-1 border-none bg-transparent text-[14px] text-white outline-none placeholder:text-[#71809a]"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="mt-6 h-[48px] w-full rounded-[10px] bg-[linear-gradient(180deg,#3980ff_0%,#2f6bff_100%)] text-[15px] font-medium text-white shadow-[0_14px_28px_rgba(47,107,255,0.32)]"
            >
              重置密码
            </button>

            <div className="mt-5 text-center text-[13px] text-[#8f9bb1]">
              想起密码了？
              <button type="button" onClick={() => navigate('/login')} className="ml-2 text-[#69a8ff] hover:text-[#8bbfff]">立即登录</button>
            </div>
          </div>

          <div className="mt-auto text-center text-[12px] text-[#71809a]">
            © 2024 AI DevOps Platform. All rights reserved.
          </div>
        </div>

        <div className="relative flex flex-1 items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_45%,rgba(47,107,255,0.18)_0%,rgba(47,107,255,0)_42%)]" />
          <CubeIllustration />
        </div>
      </div>
    </div>
  );
}