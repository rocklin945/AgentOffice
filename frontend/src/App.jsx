import React, { useState, useEffect, useRef, useCallback } from 'react'
import { create } from 'zustand'

// ============================================================
// 状态管理 - Zustand
// ============================================================
const useStore = create((set, get) => ({
  // Agent 列表
  agents: [
    { id: 'agent-1', name: '调度员', role: '任务分配与调度', color: '#ff6b6b', status: 'idle', room: 'manager' },
    { id: 'agent-2', name: '小明', role: '开发工程师', color: '#4ade80', status: 'working', room: 'workspace' },
    { id: 'agent-3', name: '小红', role: '测试工程师', color: '#60a5fa', status: 'idle', room: 'workspace' },
    { id: 'agent-4', name: '小华', role: '运维工程师', color: '#a78bfa', status: 'thinking', room: 'datacenter' },
    { id: 'agent-5', name: '小李', role: '产品经理', color: '#f97316', status: 'idle', room: 'meeting' },
  ],

  // 选中的 Agent
  selectedAgent: null,
  selectAgent: (agent) => set({ selectedAgent: agent }),

  // 更新 Agent 状态
  updateAgentStatus: (agentId, status) => set((state) => ({
    agents: state.agents.map(a => a.id === agentId ? { ...a, status } : a)
  })),

  // 聊天消息
  messages: [],
  addMessage: (msg) => set((state) => ({
    messages: [...state.messages, { id: Date.now(), ...msg }]
  })),

  // 当前聊天对象 (null = 群聊)
  chatTarget: null,
  setChatTarget: (target) => set({ chatTarget: target }),
}))

// ============================================================
// 房间定义
// ============================================================
const ROOMS = {
  manager: { name: '调度中心', x: 10, y: 10, width: 200, height: 150 },
  workspace: { name: '工位区', x: 220, y: 10, width: 280, height: 150 },
  meeting: { name: '会议室', x: 10, y: 170, width: 200, height: 150 },
  datacenter: { name: '数据中心', x: 220, y: 170, width: 280, height: 150 },
}

// Agent 初始位置
const AGENT_POSITIONS = {
  'agent-1': { room: 'manager', x: 100, y: 80 },
  'agent-2': { room: 'workspace', x: 280, y: 60 },
  'agent-3': { room: 'workspace', x: 380, y: 60 },
  'agent-4': { room: 'datacenter', x: 280, y: 230 },
  'agent-5': { room: 'meeting', x: 100, y: 230 },
}

// ============================================================
// 样式
// ============================================================
const styles = {
  app: {
    width: '100vw',
    height: '100vh',
    background: '#0d1117',
    color: '#e6edf3',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'JetBrains Mono', monospace",
  },
  header: {
    height: 48,
    background: '#161b22',
    borderBottom: '1px solid #30363d',
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',
    gap: 24,
  },
  headerTitle: {
    color: '#4ade80',
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: 1,
  },
  headerStatus: {
    fontSize: 12,
    color: '#8b949e',
  },
  main: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
  },
  officePanel: {
    flex: 1,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    overflow: 'auto',
  },
  chatPanel: {
    width: 360,
    background: '#161b22',
    borderLeft: '1px solid #30363d',
    display: 'flex',
    flexDirection: 'column',
  },
  room: {
    background: '#1c2128',
    border: '1px solid #30363d',
    borderRadius: 6,
    padding: 8,
    position: 'relative',
  },
  roomTitle: {
    position: 'absolute',
    top: -10,
    left: 12,
    background: '#1c2128',
    padding: '0 6px',
    fontSize: 11,
    color: '#ffd700',
    fontWeight: 600,
  },
  agentCard: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 10px',
    margin: 4,
    background: '#0d1117',
    border: '2px solid',
    borderRadius: 6,
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontSize: 12,
  },
  agentDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
  },
  statusBadge: {
    padding: '2px 6px',
    borderRadius: 10,
    fontSize: 10,
    fontWeight: 600,
  },
  chatHeader: {
    padding: '12px 16px',
    borderBottom: '1px solid #30363d',
    fontSize: 14,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  chatMessages: {
    flex: 1,
    overflow: 'auto',
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  message: {
    padding: '8px 12px',
    borderRadius: 8,
    fontSize: 13,
    lineHeight: 1.5,
  },
  chatInput: {
    padding: 12,
    borderTop: '1px solid #30363d',
    display: 'flex',
    gap: 8,
  },
  input: {
    flex: 1,
    background: '#0d1117',
    border: '1px solid #30363d',
    borderRadius: 6,
    padding: '8px 12px',
    color: '#e6edf3',
    fontSize: 13,
    fontFamily: 'inherit',
    outline: 'none',
  },
  button: {
    background: '#238636',
    border: 'none',
    borderRadius: 6,
    padding: '8px 16px',
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  agentListItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 12px',
    cursor: 'pointer',
    borderRadius: 6,
    transition: 'background 0.2s',
  },
  statusBar: {
    height: 80,
    background: '#161b22',
    borderTop: '1px solid #30363d',
    padding: '8px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    overflow: 'auto',
  },
}

// ============================================================
// Agent 头像组件
// ============================================================
function AgentAvatar({ agent, size = 32, showStatus = true }) {
  const statusColors = {
    idle: '#238636',
    working: '#3b82f6',
    thinking: '#f97316',
    error: '#ef4444',
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: agent.color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.4,
        fontWeight: 700,
        color: '#fff',
        textShadow: '0 1px 2px rgba(0,0,0,0.5)',
        border: `2px solid ${agent.color}40`,
      }}>
        {agent.name[0]}
      </div>
      {showStatus && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: size * 0.35,
          height: size * 0.35,
          borderRadius: '50%',
          background: statusColors[agent.status] || '#666',
          border: '2px solid #161b22',
        }} />
      )}
    </div>
  )
}

// ============================================================
// 办公室房间组件
// ============================================================
function OfficeRoom({ roomId, agents, onAgentClick, selectedAgent }) {
  const room = ROOMS[roomId]
  const roomAgents = agents.filter(a => a.room === roomId)

  return (
    <div style={{
      ...styles.room,
      minHeight: 140,
    }}>
      <div style={styles.roomTitle}>{room.name}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
        {roomAgents.map(agent => (
          <div
            key={agent.id}
            onClick={() => onAgentClick(agent)}
            style={{
              ...styles.agentCard,
              borderColor: selectedAgent?.id === agent.id ? '#ffd700' : agent.color + '60',
              background: selectedAgent?.id === agent.id ? agent.color + '20' : '#0d1117',
            }}
          >
            <AgentAvatar agent={agent} size={28} />
            <div>
              <div style={{ color: agent.color, fontWeight: 600 }}>{agent.name}</div>
              <div style={{ color: '#8b949e', fontSize: 10 }}>{agent.role}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// 聊天消息组件
// ============================================================
function ChatMessage({ message, currentAgent }) {
  const isMe = message.role === 'user'
  const isSystem = message.role === 'system'

  if (isSystem) {
    return (
      <div style={{
        ...styles.message,
        background: '#1c2128',
        color: '#8b949e',
        textAlign: 'center',
        fontSize: 12,
      }}>
        {message.content}
      </div>
    )
  }

  const agent = currentAgent || message.agent

  return (
    <div style={{
      display: 'flex',
      gap: 8,
      justifyContent: isMe ? 'flex-end' : 'flex-start',
    }}>
      {!isMe && agent && (
        <AgentAvatar agent={agent} size={28} />
      )}
      <div>
        {!isMe && agent && (
          <div style={{ fontSize: 11, color: '#8b949e', marginBottom: 2 }}>
            {agent.name}
          </div>
        )}
        <div style={{
          ...styles.message,
          background: isMe ? '#238636' : '#1c2128',
          color: isMe ? '#fff' : '#e6edf3',
          borderBottomRightRadius: isMe ? 2 : 8,
          borderBottomLeftRadius: isMe ? 8 : 2,
          maxWidth: 240,
        }}>
          {message.content}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Agent 状态栏
// ============================================================
function AgentStatusBar({ agents, onAgentClick, selectedAgent }) {
  return (
    <div style={styles.statusBar}>
      {agents.map(agent => (
        <div
          key={agent.id}
          onClick={() => onAgentClick(agent)}
          style={{
            ...styles.agentListItem,
            background: selectedAgent?.id === agent.id ? '#1c2128' : 'transparent',
            border: `1px solid ${selectedAgent?.id === agent.id ? agent.color : 'transparent'}`,
            minWidth: 140,
          }}
        >
          <AgentAvatar agent={agent} size={32} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: agent.color, fontSize: 12, fontWeight: 600 }}>{agent.name}</div>
            <div style={{ fontSize: 10, color: '#8b949e' }}>{agent.role}</div>
          </div>
          <div style={{
            ...styles.statusBadge,
            background: {
              idle: '#23863620',
              working: '#3b82f620',
              thinking: '#f9731620',
              error: '#ef444420',
            }[agent.status] || '#666',
            color: {
              idle: '#238636',
              working: '#3b82f6',
              thinking: '#f97316',
              error: '#ef4444',
            }[agent.status] || '#666',
          }}>
            {{
              idle: '空闲',
              working: '工作中',
              thinking: '思考',
              error: '错误',
            }[agent.status] || agent.status}
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================================
// Agent 详情面板
// ============================================================
function AgentDetailPanel({ agent, onClose, onStatusChange }) {
  if (!agent) return null

  const statusOptions = [
    { key: 'idle', label: '空闲', color: '#238636' },
    { key: 'working', label: '工作中', color: '#3b82f6' },
    { key: 'thinking', label: '思考中', color: '#f97316' },
  ]

  return (
    <div style={{
      position: 'absolute',
      top: 60,
      right: 376,
      width: 280,
      background: '#161b22',
      border: '1px solid #30363d',
      borderRadius: 8,
      padding: 16,
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <AgentAvatar agent={agent} size={48} />
        <div>
          <div style={{ color: agent.color, fontSize: 16, fontWeight: 700 }}>{agent.name}</div>
          <div style={{ color: '#8b949e', fontSize: 12 }}>{agent.role}</div>
        </div>
        <button
          onClick={onClose}
          style={{
            marginLeft: 'auto',
            background: 'transparent',
            border: 'none',
            color: '#8b949e',
            cursor: 'pointer',
            fontSize: 18,
          }}
        >
          ×
        </button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: '#8b949e', marginBottom: 8 }}>当前状态</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {statusOptions.map(opt => (
            <button
              key={opt.key}
              onClick={() => onStatusChange(opt.key)}
              style={{
                flex: 1,
                padding: '6px 12px',
                background: agent.status === opt.key ? opt.color + '30' : '#0d1117',
                border: `2px solid ${agent.status === opt.key ? opt.color : '#30363d'}`,
                borderRadius: 6,
                color: agent.status === opt.key ? opt.color : '#8b949e',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ fontSize: 11, color: '#8b949e' }}>
        <div style={{ marginBottom: 4 }}>所属房间: {
          Object.entries(ROOMS).find(([k]) => k === agent.room)?.[1]?.name || agent.room
        }</div>
      </div>
    </div>
  )
}

// ============================================================
// 主应用
// ============================================================
export default function App() {
  const { agents, selectedAgent, selectAgent, updateAgentStatus, messages, addMessage, chatTarget } = useStore()
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef(null)

  // 模拟欢迎消息
  useEffect(() => {
    addMessage({
      role: 'system',
      content: '欢迎来到 AgentOffice！直接输入需求，调度员会自动分配合适的 Agent。',
      agent: null,
    })
  }, [])

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!inputValue.trim()) return

    // 添加用户消息
    addMessage({ role: 'user', content: inputValue, agent: null })

    // 模拟 Agent 回复
    setTimeout(() => {
      if (chatTarget) {
        // 私聊回复
        addMessage({
          role: 'agent',
          content: `好的，我收到你的消息「${inputValue.slice(0, 20)}...」，正在处理中...`,
          agent: chatTarget,
        })
        updateAgentStatus(chatTarget.id, 'thinking')
        setTimeout(() => {
          updateAgentStatus(chatTarget.id, 'idle')
          addMessage({
            role: 'agent',
            content: '任务处理完成！',
            agent: chatTarget,
          })
        }, 2000)
      } else {
        // 群聊 - 调度员回复
        const dispatcher = agents.find(a => a.name === '调度员')
        if (dispatcher) {
          addMessage({
            role: 'dispatcher',
            content: `收到需求，已分配给合适的 Agent 处理：「${inputValue.slice(0, 15)}...」`,
            agent: dispatcher,
          })
        }
      }
    }, 1000)

    setInputValue('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const currentChatAgent = chatTarget

  return (
    <div style={styles.app}>
      {/* 顶部栏 */}
      <header style={styles.header}>
        <div style={styles.headerTitle}>AGENT OFFICE</div>
        <div style={styles.headerStatus}>
          {agents.length} Agents 在线
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 12, color: '#8b949e' }}>
          虚拟办公室 v0.1
        </div>
      </header>

      {/* 主内容区 */}
      <main style={styles.main}>
        {/* 办公室面板 */}
        <div style={styles.officePanel}>
          <div style={{ fontSize: 14, color: '#8b949e', marginBottom: 8 }}>
            点击员工卡片查看详情，或在聊天中与其对话
          </div>

          {/* 房间网格 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {Object.keys(ROOMS).map(roomId => (
              <OfficeRoom
                key={roomId}
                roomId={roomId}
                agents={agents}
                onAgentClick={selectAgent}
                selectedAgent={selectedAgent}
              />
            ))}
          </div>
        </div>

        {/* 聊天面板 */}
        <div style={styles.chatPanel}>
          <div style={styles.chatHeader}>
            <span>💬</span>
            <span>{chatTarget ? `正在与 ${chatTarget.name} 私聊` : '全员群聊'}</span>
            {chatTarget && (
              <button
                onClick={() => useStore.getState().setChatTarget(null)}
                style={{
                  marginLeft: 'auto',
                  background: 'transparent',
                  border: '1px solid #30363d',
                  borderRadius: 4,
                  padding: '2px 8px',
                  color: '#8b949e',
                  fontSize: 11,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                切换群聊
              </button>
            )}
          </div>

          {/* 消息列表 */}
          <div style={styles.chatMessages}>
            {messages.map(msg => (
              <ChatMessage key={msg.id} message={msg} currentAgent={currentChatAgent} />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* 输入框 */}
          <div style={styles.chatInput}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={chatTarget ? `和${chatTarget.name}说点什么...` : '输入需求，调度员自动分配'}
              style={styles.input}
            />
            <button onClick={handleSend} style={styles.button}>
              发送
            </button>
          </div>
        </div>
      </main>

      {/* Agent 详情面板 */}
      <AgentDetailPanel
        agent={selectedAgent}
        onClose={() => selectAgent(null)}
        onStatusChange={(status) => {
          if (selectedAgent) {
            updateAgentStatus(selectedAgent.id, status)
          }
        }}
      />

      {/* 底部状态栏 */}
      <AgentStatusBar
        agents={agents}
        onAgentClick={(agent) => {
          selectAgent(agent)
          useStore.getState().setChatTarget(agent)
        }}
        selectedAgent={selectedAgent}
      />
    </div>
  )
}
