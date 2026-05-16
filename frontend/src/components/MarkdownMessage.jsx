import React from 'react';

function getAvatarColor(employee) {
  if (!employee) return '#8d99ae';
  const colors = ['#2f6bff', '#2bb36b', '#ff9b42', '#ff5c5c', '#7b61ff', '#14b8a6', '#e040fb'];
  let hash = 0;
  for (let i = 0; i < (employee.name || '').length; i++) {
    hash = employee.name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function MarkdownMessage({ text, staff = [], highlightMentions = false }) {
  const renderInline = (value, keyPrefix) => {
    const mentionNames = staff.map((item) => item.name).filter(Boolean).sort((a, b) => b.length - a.length);
    const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\)|@[^\s@]+)/g;
    return String(value || '').split(pattern).filter(Boolean).map((part, index) => {
      const key = `${keyPrefix}-${index}`;
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={key} className="rounded bg-[#f1f5fb] px-1 py-0.5 text-[12px] text-[#d14]">{part.slice(1, -1)}</code>;
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={key} className="font-semibold text-[#1d2740]">{renderInline(part.slice(2, -2), `${key}-strong`)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={key}>{renderInline(part.slice(1, -1), `${key}-em`)}</em>;
      }
      if (part.startsWith('[')) {
        const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (match) {
          const href = match[2];
          const safeHref = /^https?:\/\//i.test(href) ? href : undefined;
          return safeHref ? <a key={key} href={safeHref} target="_blank" rel="noreferrer" className="text-[#2f6bff] underline">{match[1]}</a> : <span key={key}>{match[1]}</span>;
        }
      }
      if (highlightMentions && part.startsWith('@')) {
        const name = mentionNames.find((item) => part === `@${item}`);
        const employee = staff.find((item) => item.name === name);
        if (employee) {
          return <span key={key} className="font-medium" style={{ color: getAvatarColor(employee) }}>{part}</span>;
        }
      }
      return <span key={key}>{part}</span>;
    });
  };

  const thinkBlocks = [];
  let processedText = String(text || '').replace(/<think>[\s\S]*?<\/think>/gi, (match) => {
    const innerContent = match.replace(/<think>/gi, '').replace(/<\/think>/gi, '').trim();
    if (innerContent) {
      thinkBlocks.push(innerContent);
    }
    return '';
  });

  const blocks = [];
  const lines = processedText.split('\n');
  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    if (line.trim().startsWith('```')) {
      const codeLines = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith('```')) {
        codeLines.push(lines[index]);
        index += 1;
      }
      blocks.push(<pre key={`code-${index}`} className="my-2 overflow-auto rounded-[8px] bg-[#111827] p-3 text-[12px] leading-5 text-[#e5e7eb]"><code>{codeLines.join('\n')}</code></pre>);
      index += 1;
      continue;
    }
    if (line.trim().startsWith('|') && line.trim().endsWith('|') && line.includes('|')) {
      const tableLines = [];
      while (index < lines.length && lines[index].trim().startsWith('|') && lines[index].trim().endsWith('|') && lines[index].includes('|')) {
        tableLines.push(lines[index].trim());
        index += 1;
      }
      if (tableLines.length >= 2) {
        const headers = tableLines[0].split('|').filter((_, i) => i > 0 && i < tableLines[0].split('|').length - 1).map(h => h.trim());
        const rows = [];
        for (let i = 1; i < tableLines.length; i++) {
          if (!tableLines[i].match(/^\|\s*[-:\s]+\s*\|/)) {
            const cells = tableLines[i].split('|').filter((_, j) => j > 0 && j < tableLines[i].split('|').length - 1).map(c => c.trim());
            rows.push(cells);
          }
        }
        blocks.push(
          <div key={`table-${index}`} className="my-3 overflow-x-auto">
            <table className="min-w-full border-collapse border border-[#e5e7eb] text-[13px]">
              <thead>
                <tr className="bg-[#f6f8fc]">
                  {headers.map((header, hi) => <th key={hi} className="border border-[#e5e7eb] px-3 py-2 font-semibold text-[#1d2740]">{renderInline(header, `th-${hi}`)}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-[#fafbfc]'}>
                    {row.map((cell, ci) => <td key={ci} className="border border-[#e5e7eb] px-3 py-2 text-[#5f6d83]">{renderInline(cell, `td-${ri}-${ci}`)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }
    if (!line.trim()) {
      index += 1;
      continue;
    }
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      const Tag = level === 1 ? 'h3' : level === 2 ? 'h4' : level === 3 ? 'h5' : level >= 4 ? 'h6' : 'h6';
      blocks.push(<Tag key={`h-${index}`} className="mb-1 mt-2 font-semibold text-[#1d2740]">{renderInline(heading[2], `h-${index}`)}</Tag>);
      index += 1;
      continue;
    }
    if (/^>\s+/.test(line)) {
      blocks.push(<blockquote key={`q-${index}`} className="my-2 border-l-2 border-[#cfe0ff] pl-3 text-[#6b778c]">{renderInline(line.replace(/^>\s+/, ''), `q-${index}`)}</blockquote>);
      index += 1;
      continue;
    }
    if (/^\s*[-*]\s+/.test(line) || /^\s*\d+\.\s+/.test(line)) {
      const ordered = /^\s*\d+\.\s+/.test(line);
      const items = [];
      while (index < lines.length && (ordered ? /^\s*\d+\.\s+/.test(lines[index]) : /^\s*[-*]\s+/.test(lines[index]))) {
        items.push(lines[index].replace(/^\s*(?:[-*]|\d+\.)\s+/, ''));
        index += 1;
      }
      const ListTag = ordered ? 'ol' : 'ul';
      blocks.push(<ListTag key={`list-${index}`} className={`my-2 ${ordered ? 'list-decimal' : 'list-disc'} space-y-1 pl-5`}>{items.map((item, itemIndex) => <li key={itemIndex}>{renderInline(item, `li-${index}-${itemIndex}`)}</li>)}</ListTag>);
      continue;
    }
    const isTableRow = (l) => l.trim().startsWith('|') && l.trim().endsWith('|') && l.includes('|');
    const paragraph = [line];
    index += 1;
    while (index < lines.length && lines[index].trim() && !lines[index].trim().startsWith('```') && !/^#{1,6}\s+/.test(lines[index]) && !/^>\s+/.test(lines[index]) && !/^\s*[-*]\s+/.test(lines[index]) && !/^\s*\d+\.\s+/.test(lines[index]) && !isTableRow(lines[index])) {
      paragraph.push(lines[index]);
      index += 1;
    }
    blocks.push(<p key={`p-${index}`} className="my-1 leading-6 text-[#5f6d83]">{renderInline(paragraph.join(' '), `p-${index}`)}</p>);
  }

  const thinkBlockElements = thinkBlocks.map((content, i) => (
    <div key={`think-${i}`} className="my-3 rounded-[10px] border border-[#e8d5b5] bg-[#fffbf0] px-4 py-3">
      <div className="mb-2 text-[12px] font-medium text-[#b8860b]">思考过程</div>
      <div className="text-[13px] leading-6 text-[#7a6820]">{content}</div>
    </div>
  ));

  return <div className="max-w-none text-[#5f6d83]">{[...thinkBlockElements, ...blocks]}</div>;
}
