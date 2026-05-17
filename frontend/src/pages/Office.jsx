import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircleFilled, ClockCircleFilled, DeleteOutlined, PlusOutlined, SendOutlined, TeamOutlined } from '@ant-design/icons';
import { officeApi } from '../api';
import { DonutChart, Panel, StatusPill } from '../components/AppPrimitives';
import MarkdownMessage from '../components/MarkdownMessage';
import { getAvatarColor } from '../utils';
import { useChatContext } from '../contexts/ChatContext';

function metricIcon(label) {
  if (label?.includes('员工')) return <TeamOutlined />;
  if (label?.includes('完成')) return <CheckCircleFilled />;
  return <ClockCircleFilled />;
}

function EmployeeCard({ employee, isSelected, onClick, staff }) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-[10px] border bg-white p-2 transition-all ${
        isSelected ? 'border-[#2f6bff] shadow-sm' : 'border-[#edf1f8] hover:border-[#2f6bff]'
      }`}
    >
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: getAvatarColor(employee) }}>
          {employee.name?.slice(0, 1)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="text-[12px] font-medium text-[#1d2740]">{employee.name}</span>
            <StatusPill color={employee.badgeColor} className="text-[9px]">
              {employee.badge}
            </StatusPill>
          </div>
          <div className="text-[10px] text-[#8d99ae]">{employee.title}</div>
        </div>
      </div>

      <div className="mt-1.5 rounded-[8px] bg-[#f6f8fc] px-2 py-1.5 text-[10px] text-[#8d99ae]">
        <span className="line-clamp-2">{employee.task}</span>
      </div>

      {isSelected && (
        <div className="mt-2 border-t border-[#edf1f8] pt-2">
          <div className="mt-1.5 text-[10px] text-[#8d99ae]">
            职责：<span className="text-[#5f6d83]">{employee.duty}</span>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {(employee.skills || []).map((skill) => (
              <span key={skill} className="rounded-full bg-[#f0f4ff] px-1 py-0.5 text-[9px] text-[#2f6bff]">
                {skill}
              </span>
            ))}
          </div>
          {employee.nextEmployee && (
            <div className="mt-1.5 rounded-[4px] bg-[#fff4ea] px-1.5 py-1 text-[10px] text-[#8d99ae]">
              下一步：
              <span className="font-medium text-[#ff8a32]">
                @{staff.find((item) => item.id === employee.nextEmployee)?.name || employee.nextEmployee}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function WorkProductsPanel({ selectedEmployee }) {
  const [activeProduct, setActiveProduct] = useState(null);

  if (!selectedEmployee) {
    return (
      <div className="flex h-full flex-col rounded-[16px] border border-[#edf1f8] bg-[#fbfcff] p-4 shadow-sm">
        <div className="text-[13px] text-[#8d99ae]">等待后端员工数据...</div>
      </div>
    );
  }

  const renderContent = (content, fileUrl) => {
    if (!content) return <span className="text-[#b8becb]">该产物暂无可查看内容</span>;
    // Only render markdown for .md files, show raw content for other files
    if (fileUrl && /\.(md|markdown)$/i.test(fileUrl)) {
      return <MarkdownMessage text={content} staff={[]} highlightMentions={false} />;
    }
    return <pre className="whitespace-pre-wrap text-[13px] leading-6 text-[#40516d]">{content}</pre>;
  };

  return (
    <div className="flex h-full flex-col rounded-[16px] border border-[#edf1f8] bg-[#fbfcff] p-4 shadow-sm">
      <div className="mb-3 border-b border-[#edf1f8] pb-3">
        <div className="text-[15px] font-semibold text-[#1d2740]">工作产物</div>
      </div>
      <div className="flex-1 space-y-2 overflow-auto">
        {(selectedEmployee.workProducts || []).map((product, index) => (
          <div
            key={`${product.name}-${index}`}
            onClick={() => setActiveProduct(product)}
            className="cursor-pointer rounded-[10px] border border-[#edf1f8] bg-white p-3 hover:border-[#2f6bff]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: getAvatarColor(selectedEmployee) }}>
                  {selectedEmployee.name?.slice(0, 1)}
                </div>
                <span className="text-[13px] font-medium text-[#1d2740]">{product.name}</span>
              </div>
              <StatusPill color={product.status === '已完成' ? 'green' : 'blue'} className="text-[10px]">
                {product.status}
              </StatusPill>
            </div>
            <div className="mt-2 text-[11px] text-[#8d99ae]">更新时间：{product.time}</div>
            {product.taskName ? <div className="mt-1 text-[11px] text-[#8d99ae]">关联任务：{product.taskName}</div> : null}
            <div className="mt-2 text-[11px] font-medium text-[#2f6bff]">点击查看内容</div>
          </div>
        ))}
        {!selectedEmployee.workProducts?.length ? (
          <div className="rounded-[10px] border border-dashed border-[#d8e1ef] bg-white px-4 py-8 text-center text-[12px] text-[#8d99ae]">
            暂无工作产物
          </div>
        ) : null}
      </div>
      {activeProduct ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(12,18,28,0.26)] px-6" onClick={() => setActiveProduct(null)}>
          <div className="max-h-[82vh] w-full max-w-[880px] overflow-hidden rounded-[14px] bg-white shadow-[0_32px_80px_rgba(18,30,52,0.18)]" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#edf1f8] px-5 py-4">
              <div>
                <div className="text-[16px] font-semibold text-[#1d2740]">{activeProduct.name}</div>
                <div className="mt-1 text-[12px] text-[#8d99ae]">{activeProduct.type} · {activeProduct.fileUrl || '数据库产物'}</div>
              </div>
              <button type="button" onClick={() => setActiveProduct(null)} className="text-[22px] text-[#97a3b8]">×</button>
            </div>
            <div className="max-h-[68vh] overflow-auto bg-[#f8fafc] px-5 py-4">
              {renderContent(activeProduct.content, activeProduct.fileUrl)}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 text-[#8d99ae]">
      {[0, 1, 2].map((item) => (
        <span
          key={item}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#8d99ae]"
          style={{ animationDelay: `${item * 120}ms` }}
        />
      ))}
    </span>
  );
}

function ChatPanel({ messages, setMessages, sessions, setSessions, currentSessionId, setCurrentSessionId, staff, onWorkflowComplete }) {
  const [input, setInput] = useState('');
  const [mentionOpen, setMentionOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [mentionedIds, setMentionedIds] = useState([]);
  const [sending, setSending] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(false);
  const mentionRef = useRef(null);
  const sessionRef = useRef(null);
  const messagesEndRef = useRef(null);


  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    const closeMention = (event) => {
      if (mentionRef.current && !mentionRef.current.contains(event.target)) {
        setMentionOpen(false);
      }
      if (sessionRef.current && !sessionRef.current.contains(event.target)) {
        setSessionOpen(false);
      }
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setMentionOpen(false);
        setSessionOpen(false);
      }
    };
    document.addEventListener('mousedown', closeMention);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeMention);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: 'end' });
  }, [messages]);

  const upsertSession = (session) => {
    if (!session?.id) return;
    setSessions((current) => {
      const exists = current.some((item) => item.id === session.id);
      const next = exists ? current.map((item) => (item.id === session.id ? { ...item, ...session } : item)) : [session, ...current];
      return next.sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')));
    });
  };

  const loadMessages = async (sessionId) => {
    if (!sessionId) return;
    const res = await officeApi.getCollaborationMessages(sessionId);
    setCurrentSessionId(res.data?.session?.id || sessionId);
    upsertSession(res.data?.session);
    
    // 智能合并：保留当前正在 pending 的消息，但不重复添加
    setMessages((current) => {
      const pendingMessages = current.filter((msg) => msg.pending);
      const newMessages = res.data?.messages || [];
      
      // 只有当前有 pending 消息时才合并
      if (pendingMessages.length > 0) {
        return [...newMessages, ...pendingMessages];
      }
      return newMessages;
    });
  };

  const loadSessions = async () => {
    setSessionLoading(true);
    try {
      const res = await officeApi.getCollaborationSessions();
      const nextSessions = res.data?.sessions || [];
      setSessions(nextSessions);
      if (nextSessions.length) {
        await loadMessages(nextSessions[0].id);
      } else {
        const created = await officeApi.createCollaborationSession();
        const session = created.data?.session;
        setCurrentSessionId(session?.id || '');
        setSessions(session ? [session] : []);
        setMessages(created.data?.messages || []);
      }
    } catch (error) {
      setMessages(initialMessages);
    } finally {
      setSessionLoading(false);
    }
  };

  const createSession = async () => {
    setSessionLoading(true);
    try {
      const res = await officeApi.createCollaborationSession();
      const session = res.data?.session;
      if (session) {
        setCurrentSessionId(session.id);
        setSessions((current) => [session, ...current.filter((item) => item.id !== session.id)]);
        setMessages([]);
        setSessionOpen(false);
      }
    } finally {
      setSessionLoading(false);
    }
  };

  const switchSession = async (sessionId) => {
    await loadMessages(sessionId);
    setSessionOpen(false);
  };

  const deleteSession = async (event, sessionId) => {
    event.stopPropagation();
    if (!sessionId || sessionLoading) return;
    setSessionLoading(true);
    try {
      await officeApi.deleteCollaborationSession(sessionId);
      const nextSessions = sessions.filter((item) => item.id !== sessionId);
      setSessions(nextSessions);
      if (currentSessionId === sessionId) {
        if (nextSessions.length) {
          await loadMessages(nextSessions[0].id);
        } else {
          const created = await officeApi.createCollaborationSession();
          const session = created.data?.session;
          setCurrentSessionId(session?.id || '');
          setSessions(session ? [session] : []);
          setMessages([]);
        }
      }
    } finally {
      setSessionLoading(false);
    }
  };

  const getEmployeeId = (employee) => {
    const id = employee?.employeeId ?? employee?.realId;
    return Number.isFinite(Number(id)) ? Number(id) : null;
  };

  const parseMentionedEmployeeIds = (text) => {
    const typedIds = staff
      .filter((employee) => text.includes(`@${employee.name}`))
      .map(getEmployeeId)
      .filter((id) => id !== null);
    return [...new Set(typedIds)];
  };

  const toggleMention = (employee) => {
    const id = getEmployeeId(employee);
    if (id === null) return;
    const mention = `@${employee.name}`;
    setMentionedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
    if (input.includes(mention)) {
      setInput((current) => current.replace(mention, '').replace(/\s{2,}/g, ' ').trimStart());
    } else {
      setInput((current) => `${current}${current.trim() ? ' ' : ''}@${employee.name} `);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const targetEmployeeIds = parseMentionedEmployeeIds(input);
    if (!targetEmployeeIds.length) return;

    const now = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    const text = input.trim();
    const messageId = Date.now();
    const pendingByEmployee = new Map();
    const replyMessageById = new Map();
    const pendingReplies = targetEmployeeIds.map((employeeId) => {
      const employee = staff.find((item) => getEmployeeId(item) === employeeId);
      const pendingId = `pending-${messageId}-${employeeId}`;
      pendingByEmployee.set(employeeId, pendingId);
      return {
        id: pendingId,
        employeeId,
        sender: employee?.name || '员工',
        avatar: getAvatarColor(employee),
        text: '',
        time: now,
        pending: true,
      };
    });
    setMessages((current) => [...current, { id: messageId, sender: '我', avatar: '#2f6bff', text, time: now, fromUser: true }, ...pendingReplies]);
    setSending(true);
    setMentionOpen(false);
    setInput('');
    setMentionedIds([]);
    try {
      const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('agent-office-storage') || '{}')?.state?.token;
      const response = await fetch('/api/office/collaboration/messages/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          sessionId: currentSessionId,
          message: text,
          mentionedEmployeeIds: targetEmployeeIds,
          history: messages.slice(-8).map((message) => ({
            role: message.sender === '我' ? 'user' : 'assistant',
            content: message.text,
          })),
        }),
      });
      if (!response.ok || !response.body) throw new Error('流式回复连接失败');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';
        parts.forEach((part) => handleStreamEvent(part, pendingByEmployee, replyMessageById));
      }
    } catch (error) {
      setMessages((current) => current.map((message) => (
        message.pending && targetEmployeeIds.includes(message.employeeId)
          ? { ...message, pending: false, text: error.message || '发送失败，请稍后重试', avatar: '#ff5c5c' }
          : message
      )));
    } finally {
      setSending(false);
    }
  };

  const handleStreamEvent = (raw, pendingByEmployee, replyMessageById) => {
    const event = raw.split('\n').find((line) => line.startsWith('event:'))?.slice(6).trim();
    const dataText = raw.split('\n').filter((line) => line.startsWith('data:')).map((line) => line.slice(5).trim()).join('\n');
    if (!event || !dataText) return;
    const data = JSON.parse(dataText);
    if (event === 'session') {
      setCurrentSessionId(data.id);
      upsertSession(data);
    }
    if (event === 'reply_start') {
      const messageId = pendingByEmployee.get(Number(data.employeeId));
      const nextMessageId = messageId || `reply-${data.replyId}`;
      replyMessageById.set(data.replyId, nextMessageId);
      setMessages((current) => {
        if (current.some((message) => message.id === nextMessageId)) {
          return current.map((message) => (
            message.id === nextMessageId ? { ...message, sender: data.sender, avatar: getAvatarColor({ id: data.employeeId, name: data.sender }), pending: true } : message
          ));
        }
        return [...current, {
          id: nextMessageId,
          employeeId: Number(data.employeeId),
          sender: data.sender,
          avatar: getAvatarColor({ id: data.employeeId, name: data.sender }),
          text: '',
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          pending: true,
        }];
      });
    }
    if (event === 'reply_delta') {
      const messageId = replyMessageById.get(data.replyId);
      setMessages((current) => current.map((message) => (
        message.id === messageId ? { ...message, text: `${message.text || ''}${data.delta || ''}`, pending: false } : message
      )));
    }
    if (event === 'reply_done') {
      const messageId = replyMessageById.get(data.replyId);
      setMessages((current) => current.map((message) => (
        message.id === messageId ? { ...message, pending: false } : message
      )));
    }
    if (event === 'reply_error') {
      setMessages((current) => current.map((message) => (
        message.employeeId === Number(data.employeeId)
          ? { ...message, pending: false, text: data.message || '回复失败', avatar: '#ff5c5c' }
          : message
      )));
    }
    if (event === 'error') {
      throw new Error(data.message || '回复失败');
    }
    if (event === 'complete') {
      onWorkflowComplete?.();
      // Immediately refresh collaboration data after workflow completes
      setTimeout(() => onWorkflowComplete?.(), 500);
    }
  };

  return (
    <div className="flex h-full flex-col rounded-[16px] border border-[#edf1f8] bg-[#fbfcff] p-4 shadow-sm">
      <div className="mb-3 border-b border-[#edf1f8] pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="shrink-0 text-[16px] font-semibold text-[#1d2740]">群聊</div>
          <div className="relative" ref={sessionRef}>
            <button
              type="button"
              onClick={() => setSessionOpen((open) => !open)}
              disabled={sessionLoading}
              className="flex h-8 items-center gap-1 rounded-[8px] border border-[#dde4f0] bg-white px-3 text-[12px] font-medium text-[#5f6d83] transition-colors hover:border-[#2f6bff] hover:text-[#2f6bff] disabled:cursor-not-allowed disabled:text-[#b8c0d0]"
            >
              选择会话
            </button>
            {sessionOpen ? (
              <div className="absolute right-0 top-10 z-20 w-[260px] rounded-[12px] border border-[#edf1f8] bg-white p-2 shadow-[0_18px_48px_rgba(18,30,52,0.16)]">
                <button
                  type="button"
                  onClick={createSession}
                  disabled={sessionLoading}
                  className="mb-2 flex w-full items-center justify-center gap-1 rounded-[8px] border border-[#dbe7ff] bg-[#f4f8ff] px-3 py-2 text-[12px] font-medium text-[#2f6bff] hover:border-[#2f6bff] disabled:cursor-not-allowed disabled:text-[#b8c0d0]"
                >
                  <PlusOutlined />
                  新建会话
                </button>
                <div className="max-h-[260px] space-y-1 overflow-auto">
                  {sessions.map((session) => (
                    <button
                      key={session.id}
                      type="button"
                      onClick={() => switchSession(session.id)}
                      className={`flex w-full items-center gap-2 rounded-[8px] px-3 py-2 text-left transition-colors ${session.id === currentSessionId ? 'bg-[#eef4ff]' : 'hover:bg-[#f7f9fc]'}`}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12px] font-medium text-[#1d2740]">{session.title || '新会话'}</span>
                        <span className="mt-0.5 block text-[10px] text-[#9aa6ba]">{session.updatedAt || '刚刚创建'}</span>
                      </span>
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(event) => deleteSession(event, session.id)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') deleteSession(event, session.id);
                        }}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] text-[#ff5c5c] transition-colors hover:bg-[#fff0f0]"
                        title="删除会话"
                      >
                        <DeleteOutlined />
                      </span>
                    </button>
                  ))}
                  {!sessions.length ? (
                    <div className="px-3 py-4 text-center text-[12px] text-[#9aa6ba]">暂无会话</div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-3 overflow-auto">
        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-2">
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
              style={{ background: msg.employeeId ? getAvatarColor({ id: msg.employeeId, name: msg.sender }) : (msg.avatar || '#2f6bff') }}
            >
              {msg.sender?.slice(0, 1)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-[12px] font-medium text-[#1d2740]">{msg.sender}</span>
                <span className="text-[11px] text-[#b8c0d0]">{msg.time}</span>
              </div>
              <div className="mt-1 rounded-[10px] rounded-tl-sm border border-[#edf1f8] bg-white px-3 py-2 text-[13px] shadow-sm">
                {msg.pending && !msg.text ? <TypingDots /> : <MarkdownMessage text={msg.text} staff={staff} highlightMentions />}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="mt-3 flex gap-2">
        <div className="relative" ref={mentionRef}>
          <button
            type="button"
            onClick={() => setMentionOpen((open) => !open)}
            className={`flex h-9 w-9 items-center justify-center rounded-[10px] border text-[15px] font-semibold transition-colors ${parseMentionedEmployeeIds(input).length ? 'border-[#2f6bff] bg-[#eef4ff] text-[#2f6bff]' : 'border-[#dde4f0] bg-white text-[#66758f]'}`}
          >
            @
          </button>
          {mentionOpen ? (
            <div className="absolute bottom-11 left-0 z-20 max-h-[260px] w-[220px] overflow-auto rounded-[12px] border border-[#edf1f8] bg-white p-2 shadow-[0_18px_48px_rgba(18,30,52,0.16)]">
              {staff.map((employee) => (
                <button
                  key={getEmployeeId(employee) ?? employee.id ?? employee.name}
                  type="button"
                  onClick={() => toggleMention(employee)}
                  className={`flex w-full items-center gap-2 rounded-[8px] px-2 py-2 text-left ${parseMentionedEmployeeIds(input).includes(getEmployeeId(employee)) ? 'bg-[#eef4ff]' : 'hover:bg-[#f7f9fc]'}`}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold text-white" style={{ background: getAvatarColor(employee) }}>{employee.name?.slice(0, 1)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] font-medium text-[#1d2740]">{employee.name}</span>
                    <span className="block truncate text-[10px] text-[#8d99ae]">{employee.title}</span>
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && handleSend()}
          placeholder="点击 @ 选择员工后输入消息..."
          className="flex-1 rounded-[10px] border border-[#dde4f0] bg-white px-3 py-2 text-[13px] text-[#1d2740] placeholder-[#b8c0d0] focus:border-[#2f6bff] focus:outline-none focus:shadow-sm"
        />
        <button
          onClick={handleSend}
          disabled={sending || sessionLoading || !parseMentionedEmployeeIds(input).length}
          className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#2f6bff] bg-[#2f6bff] text-white transition-colors hover:bg-[#1d5ae8] disabled:cursor-not-allowed disabled:border-[#cbd5e1] disabled:bg-[#cbd5e1]"
        >
          <SendOutlined />
        </button>
      </div>
    </div>
  );
}

export default function Office() {
  const [staff, setStaff] = useState([]);
  const { messages, setMessages, sessions, setSessions, currentSessionId, setCurrentSessionId } = useChatContext();
  const [stats, setStats] = useState([]);
  const [donut, setDonut] = useState([]);
  const [operationLogs, setOperationLogs] = useState([]);
  const [selected, setSelected] = useState(null);

  const loadCollaboration = useCallback(() => {
    let alive = true;

    officeApi.getCollaboration()
      .then((res) => {
        if (!alive || !res.data) return;
        const nextStaff = res.data.staffList || [];
        setStaff(nextStaff);
        // 不要覆盖消息状态，消息由 ChatPanel 管理
        // setMessages(res.data.messages || []);
        setStats(res.data.statCards || []);
        setDonut(res.data.donutItems || []);
        setOperationLogs(res.data.operationLogs || []); // 
        setSelected((current) => {
          const currentId = current?.employeeId ?? current?.realId;
          return nextStaff.find((item) => (item.employeeId ?? item.realId) === currentId) || nextStaff[1] || nextStaff[0] || null;
        });
      })
      .catch(() => {
        if (!alive) return;
        setStaff([]);
        // 不要清空消息
        // setMessages([]);
        setStats([]);
        setDonut([]);
        setOperationLogs([]); // 
        setSelected(null);
      });

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    loadCollaboration();
    const interval = setInterval(loadCollaboration, 3000);
    return () => {
      clearInterval(interval);
    };
  }, [loadCollaboration]);

  return (
    <div className="space-y-5">
      <div className="flex h-[calc(100vh-128px)] min-h-[620px] gap-4">
        <div className="w-[280px] shrink-0">
          <div className="flex h-full flex-col rounded-[16px] border border-[#edf1f8] bg-[#fbfcff] p-4 shadow-sm">
            <div className="mb-3 border-b border-[#edf1f8] pb-3">
              <div className="text-[15px] font-semibold text-[#1d2740]">员工列表</div>
            </div>
            <div className="flex-1 space-y-2 overflow-auto">
              {staff.map((emp) => (
                <EmployeeCard
                  key={emp.id}
                  employee={emp}
                  staff={staff}
                  isSelected={selected?.id === emp.id}
                  onClick={() => setSelected(emp)}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1">
          <div className="h-full">
            <WorkProductsPanel selectedEmployee={selected} />
          </div>
        </div>
        <div className="w-[780px] shrink-0">
          <ChatPanel 
            messages={messages} 
            setMessages={setMessages}
            sessions={sessions}
            setSessions={setSessions}
            currentSessionId={currentSessionId}
            setCurrentSessionId={setCurrentSessionId}
            staff={staff} 
            onWorkflowComplete={loadCollaboration} 
          />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        {stats.map((card) => (
          <Panel key={card.label} className="flex items-center gap-4 px-6 py-5">
            <div className={`flex h-11 w-11 items-center justify-center rounded-full text-[18px] ${card.iconClass}`}>
              {metricIcon(card.label)}
            </div>
            <div>
              <div className="text-[13px] text-[#95a1b5]">{card.label}</div>
              <div className="mt-1 text-[18px] font-semibold text-[#1d2740]">{card.value}</div>
            </div>
          </Panel>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel className="p-5">
          <div className="text-[18px] font-semibold text-[#1d2740]">员工状态分布</div>
          <div className="mt-6">
            <DonutChart items={donut} />
          </div>
        </Panel>

        <Panel className="p-5">
          <div className="text-[18px] font-semibold text-[#1d2740]">任务执行记录</div>
          <div className="mt-4 max-h-[280px] space-y-2 overflow-y-auto">
            {operationLogs.length === 0 ? (
              <div className="py-8 text-center text-[13px] text-[#95a1b5]">暂无操作记录</div>
            ) : (
              operationLogs.map((log) => (
                <div key={log.id} className="rounded-lg border border-[#edf1f8] bg-[#fbfcff] p-3 transition-all hover:border-[#2f6bff] hover:shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-[#2f6bff] px-2 py-0.5 text-[10px] font-medium text-white">
                          {log.action || '操作'}
                        </span>
                        {log.targetType && (
                          <span className="text-[11px] text-[#8d99ae]">
                            {log.targetType}
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5 text-[12px] text-[#1d2740]">
                        {log.detail || '无详情'}
                      </div>
                    </div>
                    <div className="ml-2 shrink-0 text-[10px] text-[#95a1b5]">
                      {log.time ? log.time.substring(5, 16) : ''}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
