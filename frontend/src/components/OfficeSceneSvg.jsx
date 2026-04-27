import React from 'react';

function DeskCluster({ x, y, scale = 1, accent = '#2f6bff', people = 2 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <polygon points="0,34 42,10 108,10 66,34" fill="#e4e7ef" />
      <polygon points="0,34 66,34 66,70 0,70" fill="#d5d9e4" />
      <polygon points="66,34 108,10 108,46 66,70" fill="#c4c9d6" />

      <polygon points="6,28 46,8 102,8 62,28" fill="#efe1d2" />
      <polygon points="6,28 62,28 62,58 6,58" fill="#d2b79d" />
      <polygon points="62,28 102,8 102,38 62,58" fill="#bc9a7f" />

      <polygon points="24,21 39,14 54,14 39,21" fill="#1f2937" />
      <polygon points="60,21 75,14 90,14 75,21" fill="#1f2937" />
      <rect x="36" y="5" width="3" height="17" rx="1.5" fill="#515b6f" transform="skewY(-26)" />
      <rect x="72" y="5" width="3" height="17" rx="1.5" fill="#515b6f" transform="skewY(-26)" />
      <polygon points="24,21 39,14 39,2 24,9" fill="#2f6bff" />
      <polygon points="60,21 75,14 75,2 60,9" fill="#2f6bff" />

      <g transform="translate(16 36)">
        <circle cx="0" cy="0" r="6" fill="#f1c39b" />
        <path d="M-9 18 Q0 6 9 18 V22 H-9Z" fill={accent} />
      </g>
      {people > 1 ? (
        <g transform="translate(80 34)">
          <circle cx="0" cy="0" r="6" fill="#f1c39b" />
          <path d="M-9 18 Q0 6 9 18 V22 H-9Z" fill="#2b3a67" />
        </g>
      ) : null}

      <ellipse cx="18" cy="63" rx="12" ry="6" fill="#111827" opacity="0.22" />
      <ellipse cx="89" cy="58" rx="12" ry="6" fill="#111827" opacity="0.18" />
    </g>
  );
}

function Plant({ x, y, scale = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <rect x="0" y="12" width="18" height="14" rx="3" fill="#8f6b55" />
      <path d="M9 0 C2 6 2 12 9 16 C16 12 16 6 9 0Z" fill="#4caf74" />
      <path d="M4 4 C0 10 2 16 8 18" stroke="#5bc28a" strokeWidth="2" fill="none" />
      <path d="M14 4 C18 10 16 16 10 18" stroke="#5bc28a" strokeWidth="2" fill="none" />
    </g>
  );
}

function Sofa({ x, y, scale = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <polygon points="0,20 40,0 98,0 58,20" fill="#e0b14a" />
      <polygon points="0,20 58,20 58,54 0,54" fill="#d29a2d" />
      <polygon points="58,20 98,0 98,34 58,54" fill="#be8826" />
      <polygon points="10,18 34,6 50,6 26,18" fill="#efc766" />
      <polygon points="42,18 66,6 82,6 58,18" fill="#efc766" />
      <rect x="46" y="18" width="16" height="8" rx="3" fill="#6f5b42" />
    </g>
  );
}

function WindowSet({ x, y, width = 150, height = 96 }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y="0" width={width} height={height} rx="6" fill="#2f3e56" />
      <rect x="6" y="6" width={width - 12} height={height - 12} rx="4" fill="url(#windowGlow)" />
      <line x1={width / 3} y1="6" x2={width / 3} y2={height - 6} stroke="#23354e" strokeWidth="4" />
      <line x1={(width / 3) * 2} y1="6" x2={(width / 3) * 2} y2={height - 6} stroke="#23354e" strokeWidth="4" />
      <line x1="6" y1={height / 2} x2={width - 6} y2={height / 2} stroke="#23354e" strokeWidth="4" />
    </g>
  );
}

const labels = [
  { id: 'xiaoyu', name: '产品经理-小雨', status: '思考中', color: '#2bb36b', left: '17%', top: '25%' },
  { id: 'alex', name: '开发工程师-Alex', status: '工作中', color: '#2f6bff', left: '40%', top: '25%' },
  { id: 'testbot', name: '测试工程师-TestBot', status: '编译中', color: '#ff8a32', left: '72%', top: '33%' },
  { id: 'ops', name: '运维工程师-Ops', status: '部署中', color: '#8b5cf6', left: '16%', top: '61%' },
  { id: 'json', name: '开发工程师-Json', status: '工作中', color: '#2f6bff', left: '40%', top: '59%' },
];

export default function OfficeSceneSvg({ selectedId, onSelect, employees }) {
  return (
    <div className="relative h-full min-h-[560px] overflow-hidden rounded-[18px] bg-[radial-gradient(circle_at_top,#ffffff_0%,#f4f7fc_100%)]">
      <svg viewBox="0 0 980 620" className="h-full w-full">
        <defs>
          <linearGradient id="windowGlow" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#aed7ff" />
            <stop offset="100%" stopColor="#74a9ea" />
          </linearGradient>
          <linearGradient id="wallTop" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#e2dbd8" />
            <stop offset="100%" stopColor="#c1b5b4" />
          </linearGradient>
          <linearGradient id="floorTone" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#7a7f8d" />
            <stop offset="100%" stopColor="#4b5060" />
          </linearGradient>
        </defs>

        <polygon points="190,94 585,58 900,188 518,238" fill="url(#wallTop)" />
        <polygon points="190,94 74,165 74,432 190,514" fill="#d4c8c8" />
        <polygon points="900,188 900,436 786,520 786,260" fill="#cdc3c3" />
        <polygon points="190,514 74,432 470,328 786,520" fill="#686d7d" />
        <polygon points="190,94 585,58 900,188 470,328 74,165" fill="url(#floorTone)" />

        {Array.from({ length: 10 }).map((_, index) => (
          <line
            key={`v-${index}`}
            x1={160 + index * 70}
            y1={107}
            x2={40 + index * 70}
            y2={438}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />
        ))}
        {Array.from({ length: 9 }).map((_, index) => (
          <line
            key={`h-${index}`}
            x1={100 + index * 40}
            y1={150 + index * 33}
            x2={505 + index * 39}
            y2={85 + index * 33}
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="1"
          />
        ))}

        <WindowSet x={268} y={82} width={150} height={108} />
        <WindowSet x={454} y={68} width={162} height={118} />
        <WindowSet x={676} y={126} width={150} height={108} />
        <WindowSet x={756} y={126} width={118} height={108} />

        <rect x="110" y="230" width="72" height="78" rx="8" fill="#ececec" />
        <rect x="120" y="242" width="52" height="8" rx="4" fill="#b8c3d7" />
        <rect x="134" y="274" width="22" height="14" rx="4" fill="#f5f5f5" />
        <rect x="166" y="98" width="14" height="84" rx="5" fill="#f4f5f7" />
        <rect x="158" y="168" width="32" height="54" rx="6" fill="#6f7787" />
        <rect x="668" y="106" width="18" height="88" rx="5" fill="#f8f9fc" />
        <rect x="665" y="182" width="38" height="74" rx="8" fill="#2c3d53" />
        <rect x="672" y="191" width="24" height="52" rx="5" fill="#5fb7ff" opacity="0.65" />
        <Sofa x={726} y={224} scale={1.1} />

        <DeskCluster x={218} y={272} scale={1.28} accent="#26c281" people={2} />
        <DeskCluster x={426} y={244} scale={1.22} accent="#2f6bff" people={3} />
        <DeskCluster x={696} y={302} scale={1.18} accent="#ff8a32" people={2} />
        <DeskCluster x={214} y={452} scale={1.18} accent="#8b5cf6" people={1} />
        <DeskCluster x={438} y={430} scale={1.18} accent="#2f6bff" people={2} />

        <Plant x={118} y={162} scale={1.2} />
        <Plant x={232} y={132} scale={1.18} />
        <Plant x={398} y={102} scale={1.2} />
        <Plant x={520} y={102} scale={1.2} />
        <Plant x={852} y={238} scale={1.3} />
        <Plant x={801} y={480} scale={1.3} />
        <Plant x={612} y={476} scale={1.2} />
        <Plant x={96} y={356} scale={1.1} />

        <circle cx="612" cy="104" r="18" fill="#f3f5f8" />
        <circle cx="612" cy="104" r="15" fill="#fff" stroke="#7a8292" strokeWidth="2" />
        <line x1="612" y1="104" x2="612" y2="93" stroke="#4b5563" strokeWidth="2" />
        <line x1="612" y1="104" x2="621" y2="109" stroke="#4b5563" strokeWidth="2" />

        <g transform="translate(634 416)">
          <polygon points="0,18 44,0 110,0 66,18" fill="rgba(47,107,255,0.22)" stroke="#4d8cff" strokeDasharray="6 5" />
          <polygon points="0,18 66,18 66,62 0,62" fill="rgba(47,107,255,0.12)" stroke="#4d8cff" strokeDasharray="6 5" />
          <polygon points="66,18 110,0 110,42 66,62" fill="rgba(47,107,255,0.08)" stroke="#4d8cff" strokeDasharray="6 5" />
        </g>
      </svg>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-3">
        <div className="flex items-center gap-8 text-[14px] font-medium">
          <button type="button" className="pointer-events-auto border-b-2 border-[#2f6bff] pb-3 text-[#2f6bff]">
            办公室总览
          </button>
          <button type="button" className="pointer-events-auto pb-3 text-[#66758f]">
            办公室布局
          </button>
        </div>

        <div className="pointer-events-auto flex items-center gap-3">
          <span className="text-[14px] font-medium text-[#1d2740]">视角切换</span>
          <div className="flex items-center gap-2 rounded-[12px] border border-[#e8edf6] bg-white px-2 py-2 text-[#738097]">
            <span className="rounded-[8px] border border-[#e8edf6] px-2 py-1 text-[12px]">◧</span>
            <span className="rounded-[8px] border border-[#e8edf6] px-2 py-1 text-[12px]">▦</span>
            <span className="rounded-[8px] bg-[#2f6bff] px-3 py-1 text-[12px] text-white">⬡</span>
          </div>
          <button
            type="button"
            className="rounded-[12px] border border-[#e8edf6] bg-white px-4 py-2 text-[14px] font-medium text-[#2f6bff]"
          >
            + 添加工位
          </button>
        </div>
      </div>

      {labels.map((label) => {
        const active = selectedId === label.id;
        return (
          <button
            key={label.id}
            type="button"
            onClick={() => onSelect(employees.find((employee) => employee.id === label.id))}
            className={`absolute rounded-[16px] px-4 py-2 text-left shadow-[0_14px_28px_rgba(15,23,42,0.18)] transition ${
              active ? 'scale-[1.02]' : ''
            }`}
            style={{ left: label.left, top: label.top, backgroundColor: 'rgba(22,25,35,0.88)' }}
          >
            <div className="text-[14px] font-semibold text-white">{label.name}</div>
            <div
              className="mt-2 inline-flex rounded-full px-3 py-1 text-[12px] font-medium text-white"
              style={{ backgroundColor: label.color }}
            >
              {label.status}
            </div>
          </button>
        );
      })}

      <div className="absolute left-[63.5%] top-[61.5%] rounded-[18px] border border-[#4d8cff] bg-[rgba(23,32,57,0.78)] px-5 py-4 text-white shadow-[0_18px_34px_rgba(15,23,42,0.22)]">
        <div className="text-[15px] font-semibold text-[#9ec0ff]">空闲工位</div>
        <div className="mt-2 text-center text-[28px] leading-none">+</div>
        <button
          type="button"
          className="mt-3 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-[14px] font-medium"
        >
          + 创建员工
        </button>
      </div>
    </div>
  );
}
