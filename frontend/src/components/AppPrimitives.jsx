import React from 'react';

export function Panel({ children, className = '' }) {
  return (
    <section
      className={`rounded-[20px] border border-[#eef2f7] bg-white shadow-[0_12px_32px_rgba(31,45,76,0.06)] ${className}`}
    >
      {children}
    </section>
  );
}

export function StatusPill({ children, color = 'blue', className = '' }) {
  const palette = {
    blue: 'bg-[#edf4ff] text-[#2f6bff]',
    green: 'bg-[#ebfbf1] text-[#2bb36b]',
    orange: 'bg-[#fff3e9] text-[#ff8a32]',
    purple: 'bg-[#f3ecff] text-[#8b5cf6]',
    gray: 'bg-[#f3f5f8] text-[#8792a7]',
    red: 'bg-[#ffefef] text-[#ff5c5c]',
  };

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-[12px] font-medium ${palette[color]} ${className}`}>
      {children}
    </span>
  );
}

export function ProgressTrack({ value, color = '#2f6bff', className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="h-[6px] flex-1 rounded-full bg-[#eef2f8]">
        <div className="h-[6px] rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
      <span className="text-[12px] text-[#7c88a0]">{value}%</span>
    </div>
  );
}

export function MetricCard({ label, value, trend, icon, iconClass = '' }) {
  return (
    <Panel className="px-6 py-5">
      <div className="flex items-center gap-3">
        {icon ? (
          <span className={`flex h-10 w-10 items-center justify-center rounded-full text-[18px] ${iconClass}`}>
            {icon}
          </span>
        ) : null}
        <div className="min-w-0">
          <div className="text-[12px] text-[#98a3b7]">{label}</div>
          <div className="mt-1 text-[18px] font-semibold text-[#1d2740]">{value}</div>
          {trend ? <div className="mt-1 text-[12px] text-[#7ac891]">{trend}</div> : null}
        </div>
      </div>
    </Panel>
  );
}

export function LineChart({
  labels,
  series,
  height = 210,
  colors = ['#2f6bff', '#39c3a5'],
}) {
  const width = 420;
  const padding = { left: 26, right: 18, top: 20, bottom: 30 };
  const values = series.flatMap((item) => item.values);
  const max = Math.max(...values, 10);
  const min = Math.min(...values, 0);
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const pointX = (index) => padding.left + (innerWidth / Math.max(labels.length - 1, 1)) * index;
  const pointY = (value) => {
    const ratio = (value - min) / Math.max(max - min, 1);
    return padding.top + innerHeight - ratio * innerHeight;
  };

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
      {Array.from({ length: 5 }).map((_, index) => {
        const y = padding.top + (innerHeight / 4) * index;
        return <line key={index} x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#eef2f8" />;
      })}

      {series.map((item, seriesIndex) => {
        const points = item.values.map((value, index) => `${pointX(index)},${pointY(value)}`).join(' ');
        return (
          <g key={item.name}>
            <polyline fill="none" stroke={colors[seriesIndex] || colors[0]} strokeWidth="3" points={points} />
            {item.values.map((value, index) => (
              <circle
                key={`${item.name}-${index}`}
                cx={pointX(index)}
                cy={pointY(value)}
                r="4.5"
                fill="#fff"
                stroke={colors[seriesIndex] || colors[0]}
                strokeWidth="2.5"
              />
            ))}
          </g>
        );
      })}

      {labels.map((label, index) => (
        <text
          key={label}
          x={pointX(index)}
          y={height - 8}
          textAnchor="middle"
          fontSize="12"
          fill="#8d99ae"
        >
          {label}
        </text>
      ))}
    </svg>
  );
}

export function BarChart({ items, height = 210, color = '#2f6bff' }) {
  const width = 420;
  const padding = { left: 28, right: 18, top: 18, bottom: 34 };
  const max = Math.max(...items.map((item) => item.value), 100);
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const barWidth = innerWidth / Math.max(items.length, 1) - 24;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
      {Array.from({ length: 5 }).map((_, index) => {
        const y = padding.top + (innerHeight / 4) * index;
        return <line key={index} x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#eef2f8" />;
      })}

      {items.map((item, index) => {
        const x = padding.left + (innerWidth / items.length) * index + 12;
        const barHeight = (item.value / max) * innerHeight;
        const y = padding.top + innerHeight - barHeight;
        return (
          <g key={item.label}>
            <rect x={x} y={y} width={barWidth} height={barHeight} rx="6" fill={color} opacity={0.96} />
            <text x={x + barWidth / 2} y={y - 8} textAnchor="middle" fontSize="12" fill="#7292d9">
              {item.value}%
            </text>
            <text x={x + barWidth / 2} y={height - 8} textAnchor="middle" fontSize="12" fill="#8d99ae">
              {item.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function DonutChart({ items }) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  let start = 0;

  const segments = items.map((item) => {
    const size = (item.value / total) * 360;
    const current = { ...item, start, end: start + size };
    start += size;
    return current;
  });

  const radius = 82;
  const strokeWidth = 34;
  const center = 110;

  const polar = (angle) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x: center + radius * Math.cos(rad),
      y: center + radius * Math.sin(rad),
    };
  };

  const arcPath = (startAngle, endAngle) => {
    const startPoint = polar(endAngle);
    const endPoint = polar(startAngle);
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${startPoint.x} ${startPoint.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${endPoint.x} ${endPoint.y}`;
  };

  return (
    <div className="flex items-center gap-8">
      <svg viewBox="0 0 220 220" className="h-[220px] w-[220px]">
        {segments.map((segment) => (
          <path
            key={segment.label}
            d={arcPath(segment.start, segment.end)}
            fill="none"
            stroke={segment.color}
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
          />
        ))}
      </svg>
      <div className="space-y-4 text-[14px] text-[#6f7c92]">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="w-[68px]">{item.label}</span>
            <span className="text-[#1d2740]">
              {item.value} ({((item.value / total) * 100).toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
