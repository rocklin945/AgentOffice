import { useState, useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Float } from '@react-three/drei'
import { Tag, Modal, Descriptions, Avatar, Progress } from 'antd'
import {
  ApartmentOutlined,
} from '@ant-design/icons'

// 模拟AI员工数据
const initialAgents = [
  {
    id: 1,
    name: 'Alex',
    role: '开发工程师',
    roleColor: '#007AFF',
    status: 'working',
    statusText: '工作中',
    task: '编写用户登录接口',
    progress: 65,
    avatar: 'A',
    color: '#007AFF',
    email: 'alex@agentoffice.dev',
    skills: ['React', 'Node.js', 'Python'],
    completedTasks: 23,
  },
  {
    id: 2,
    name: 'Sarah',
    role: '测试工程师',
    roleColor: '#34C759',
    status: 'thinking',
    statusText: '思考中',
    task: '设计测试用例',
    progress: 30,
    avatar: 'S',
    color: '#34C759',
    email: 'sarah@agentoffice.dev',
    skills: ['自动化测试', '性能测试', 'API测试'],
    completedTasks: 18,
  },
  {
    id: 3,
    name: 'Mike',
    role: '运维工程师',
    roleColor: '#FF9500',
    status: 'deploying',
    statusText: '部署中',
    task: '部署Docker镜像',
    progress: 80,
    avatar: 'M',
    color: '#FF9500',
    email: 'mike@agentoffice.dev',
    skills: ['Docker', 'K8s', 'CI/CD'],
    completedTasks: 31,
  },
  {
    id: 4,
    name: 'Lisa',
    role: '产品经理',
    roleColor: '#AF52DE',
    status: 'completed',
    statusText: '已完成',
    task: '需求文档撰写',
    progress: 100,
    avatar: 'L',
    color: '#AF52DE',
    email: 'lisa@agentoffice.dev',
    skills: ['需求分析', '产品设计', '项目管理'],
    completedTasks: 15,
  },
]

// 状态颜色
const statusColors = {
  working: { color: '#2196F3', emissive: '#1565C0', text: '工作中' },
  thinking: { color: '#FF9800', emissive: '#E65100', text: '思考中' },
  compiling: { color: '#9C27B0', emissive: '#6A1B9A', text: '编译中' },
  deploying: { color: '#4CAF50', emissive: '#2E7D32', text: '部署中' },
  completed: { color: '#34C759', emissive: '#1B5E20', text: '已完成' },
  idle: { color: '#9E9E9E', emissive: '#616161', text: '等待中' },
}

// 坐着工作的小人
function WorkStation({ agent, position, onClick }) {
  const groupRef = useRef()
  const leftArmRef = useRef()
  const rightArmRef = useRef()
  const [hovered, setHovered] = useState(false)
  const status = agent ? statusColors[agent.status] : statusColors.idle

  // 动画
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.02

      // 敲键盘动画 - 坐着敲键盘
      if (agent && agent.status === 'working') {
        const time = state.clock.elapsedTime
        if (leftArmRef.current && rightArmRef.current) {
          // 手臂从肩膀向前伸，放在桌面上敲击
          leftArmRef.current.rotation.x = Math.sin(time * 8) * 0.15 + 0.3
          rightArmRef.current.rotation.x = Math.sin(time * 8 + Math.PI) * 0.15 + 0.3
        }
      }
    }
  })

  const handleClick = () => {
    if (agent) onClick(agent)
  }

  if (!agent) {
    // 空工位 - 显示桌椅
    return (
      <group position={[position[0], 0, position[2]]}>
        <group onClick={handleClick}>
          {/* 空桌子 */}
          <group position={[0, 0, 0.4]}>
            <mesh position={[0, 0.72, 0]}>
              <boxGeometry args={[1.4, 0.06, 0.7]} />
              <meshStandardMaterial color={hovered ? '#E3F2FD' : '#F5F5F5'} roughness={0.6} />
            </mesh>
            {/* 桌腿 */}
            {[[-0.6, 0.3], [0.6, 0.3], [-0.6, -0.3], [0.6, -0.3]].map(([x, z], i) => (
              <mesh key={i} position={[x, 0.36, z]}>
                <boxGeometry args={[0.06, 0.72, 0.06]} />
                <meshStandardMaterial color="#D1D1D6" roughness={0.7} />
              </mesh>
            ))}
          </group>
          {/* 空椅子 */}
          <group position={[0, 0, -0.25]}>
            <mesh position={[0, 0.45, -0.08]}>
              <boxGeometry args={[0.45, 0.06, 0.4]} />
              <meshStandardMaterial color="#E8E8ED" roughness={0.7} />
            </mesh>
            <mesh position={[0, 0.72, -0.25]}>
              <boxGeometry args={[0.42, 0.5, 0.06]} />
              <meshStandardMaterial color="#E8E8ED" roughness={0.7} />
            </mesh>
            <mesh position={[0, 0.18, 0]}>
              <boxGeometry args={[0.06, 0.36, 0.06]} />
              <meshStandardMaterial color="#C7C7CC" roughness={0.8} />
            </mesh>
          </group>
          {/* 加号提示 */}
          <group position={[0, 1.2, 0]}>
            <mesh>
              <boxGeometry args={[0.4, 0.06, 0.06]} />
              <meshStandardMaterial color={hovered ? '#007AFF' : '#AEAEB2'} emissive={hovered ? '#007AFF' : '#000000'} emissiveIntensity={0.1} />
            </mesh>
            <mesh>
              <boxGeometry args={[0.06, 0.4, 0.06]} />
              <meshStandardMaterial color={hovered ? '#007AFF' : '#AEAEB2'} emissive={hovered ? '#007AFF' : '#000000'} emissiveIntensity={0.1} />
            </mesh>
          </group>
        </group>
      </group>
    )
  }

  return (
    <group
      ref={groupRef}
      position={[position[0], 0, position[2]]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={handleClick}
    >
      {/* 椅子 - 后面 */}
      <group position={[0, 0, -0.3]}>
        {/* 椅垫 */}
        <mesh position={[0, 0.42, 0]}>
          <boxGeometry args={[0.45, 0.06, 0.42]} />
          <meshStandardMaterial color="#5AC8FA" roughness={0.7} />
        </mesh>
        {/* 椅背 */}
        <mesh position={[0, 0.7, -0.2]}>
          <boxGeometry args={[0.42, 0.52, 0.06]} />
          <meshStandardMaterial color="#5AC8FA" roughness={0.7} />
        </mesh>
        {/* 椅腿 */}
        <mesh position={[0, 0.18, 0]}>
          <boxGeometry args={[0.06, 0.36, 0.06]} />
          <meshStandardMaterial color="#86868B" roughness={0.7} />
        </mesh>
        {/* 椅脚 */}
        {[[-0.15, -0.15], [0.15, -0.15], [-0.15, 0.15], [0.15, 0.15]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.02, z]}>
            <cylinderGeometry args={[0.03, 0.03, 0.04, 8]} />
            <meshStandardMaterial color="#3D3D3D" roughness={0.8} />
          </mesh>
        ))}
      </group>

      {/* 小人 - 坐在椅子上 */}
      <group position={[0, 0.45, -0.1]}>
        {/* 身体 */}
        <mesh position={[0, 0.22, 0]}>
          <boxGeometry args={[0.32, 0.32, 0.22]} />
          <meshStandardMaterial
            color={agent.color}
            emissive={status.emissive}
            emissiveIntensity={hovered ? 0.4 : 0.15}
            roughness={0.8}
          />
        </mesh>

        {/* 头部 */}
        <mesh position={[0, 0.55, 0.05]}>
          <boxGeometry args={[0.26, 0.26, 0.24]} />
          <meshStandardMaterial color="#FFCC99" roughness={0.9} />
        </mesh>

        {/* 头发 */}
        <mesh position={[0, 0.7, 0.03]}>
          <boxGeometry args={[0.28, 0.1, 0.26]} />
          <meshStandardMaterial color={agent.color} roughness={0.8} />
        </mesh>

        {/* 眼睛 */}
        <mesh position={[-0.055, 0.55, 0.17]}>
          <boxGeometry args={[0.035, 0.035, 0.015]} />
          <meshStandardMaterial color="#1D1D1F" />
        </mesh>
        <mesh position={[0.055, 0.55, 0.17]}>
          <boxGeometry args={[0.035, 0.035, 0.015]} />
          <meshStandardMaterial color="#1D1D1F" />
        </mesh>

        {/* 手臂 - 向前伸敲键盘 */}
        <group ref={leftArmRef} position={[-0.2, 0.28, 0.15]}>
          <mesh rotation={[0.5, 0, 0]}>
            <boxGeometry args={[0.09, 0.22, 0.09]} />
            <meshStandardMaterial color={agent.color} roughness={0.8} />
          </mesh>
          <mesh position={[0, -0.14, 0.08]} rotation={[0.5, 0, 0]}>
            <boxGeometry args={[0.07, 0.07, 0.07]} />
            <meshStandardMaterial color="#FFCC99" roughness={0.9} />
          </mesh>
        </group>

        <group ref={rightArmRef} position={[0.2, 0.28, 0.15]}>
          <mesh rotation={[0.5, 0, 0]}>
            <boxGeometry args={[0.09, 0.22, 0.09]} />
            <meshStandardMaterial color={agent.color} roughness={0.8} />
          </mesh>
          <mesh position={[0, -0.14, 0.08]} rotation={[0.5, 0, 0]}>
            <boxGeometry args={[0.07, 0.07, 0.07]} />
            <meshStandardMaterial color="#FFCC99" roughness={0.9} />
          </mesh>
        </group>

        {/* 腿 - 弯曲放在椅子下面 */}
        <mesh position={[-0.1, 0, 0.05]} rotation={[0.3, 0, 0]}>
          <boxGeometry args={[0.11, 0.22, 0.11]} />
          <meshStandardMaterial color="#3D3D3D" roughness={0.9} />
        </mesh>
        <mesh position={[0.1, 0, 0.05]} rotation={[0.3, 0, 0]}>
          <boxGeometry args={[0.11, 0.22, 0.11]} />
          <meshStandardMaterial color="#3D3D3D" roughness={0.9} />
        </mesh>
      </group>

      {/* 桌子 - 小人前面 */}
      <group position={[0, 0, 0.45]}>
        {/* 桌面 */}
        <mesh position={[0, 0.72, 0]}>
          <boxGeometry args={[1.3, 0.05, 0.65]} />
          <meshStandardMaterial color="#F5F5F5" roughness={0.6} />
        </mesh>
        {/* 桌腿 */}
        {[[-0.55, 0.28], [0.55, 0.28], [-0.55, -0.28], [0.55, -0.28]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.36, z]}>
            <boxGeometry args={[0.05, 0.72, 0.05]} />
            <meshStandardMaterial color="#D1D1D6" roughness={0.7} />
          </mesh>
        ))}

        {/* 显示器 - 桌上 */}
        <mesh position={[0, 1.0, -0.05]}>
          <boxGeometry args={[0.5, 0.35, 0.04]} />
          <meshStandardMaterial color="#1D1D1F" roughness={0.5} />
        </mesh>
        {/* 屏幕 */}
        <mesh position={[0, 1.0, -0.03]}>
          <boxGeometry args={[0.44, 0.28, 0.02]} />
          <meshStandardMaterial
            color={agent.status === 'working' ? '#007AFF' : '#1a1a2e'}
            emissive={agent.status === 'working' ? '#007AFF' : '#000000'}
            emissiveIntensity={0.6}
          />
        </mesh>
        {/* 支架 */}
        <mesh position={[0, 0.8, -0.05]}>
          <boxGeometry args={[0.07, 0.1, 0.07]} />
          <meshStandardMaterial color="#86868B" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.72, -0.02]}>
          <boxGeometry args={[0.2, 0.03, 0.14]} />
          <meshStandardMaterial color="#86868B" roughness={0.6} />
        </mesh>

        {/* 键盘 - 在手边 */}
        <mesh position={[0, 0.73, 0.22]}>
          <boxGeometry args={[0.35, 0.02, 0.12]} />
          <meshStandardMaterial color="#3D3D3D" roughness={0.7} />
        </mesh>
      </group>

      {/* 名字标签 */}
      <Float speed={2} rotationIntensity={0} floatIntensity={0}>
        <Text position={[0, 1.55, 0]} fontSize={0.16} color="#1D1D1F" anchorX="center" anchorY="middle" outlineWidth={0.008} outlineColor="#FFFFFF">
          {agent.name}
        </Text>
      </Float>

      {/* 透明气泡 - 往上飘 */}
      <group position={[0, 1.75, 0]}>
        <Float speed={1.2} rotationIntensity={0} floatIntensity={0.25}>
          <mesh>
            <boxGeometry args={[0.75, 0.32, 0.06]} />
            <meshBasicMaterial color="#FFFFFF" transparent opacity={0.75} depthWrite={false} />
          </mesh>
          <Text position={[0, 0, 0.04]} fontSize={0.07} color="#1D1D1F" anchorX="center" anchorY="middle" maxWidth={0.65}>
            {agent.task || '空闲中'}
          </Text>
        </Float>
      </group>

      {/* 状态指示灯 */}
      <mesh position={[0.18, 0.85, 0.32]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color={status.color} emissive={status.color} emissiveIntensity={1} />
      </mesh>
    </group>
  )
}

// 地板
function Floor() {
  return (
    <group position={[0, 0, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 10]} />
        <meshStandardMaterial color="#FAFAFA" roughness={0.95} />
      </mesh>
      {/* 地板格纹 */}
      {Array.from({ length: 15 }).map((_, i) => (
        <mesh key={`h-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-7 + i, 0.005, 0]}>
          <planeGeometry args={[0.015, 10]} />
          <meshBasicMaterial color="#E8E8ED" transparent opacity={0.6} />
        </mesh>
      ))}
      {Array.from({ length: 11 }).map((_, i) => (
        <mesh key={`v-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -5 + i]}>
          <planeGeometry args={[14, 0.015]} />
          <meshBasicMaterial color="#E8E8ED" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  )
}

// 3D场景
function Scene({ onAgentClick }) {
  const [agents] = useState(initialAgents)
  const positions = [[-2.5, 0, -1], [0, 0, -1], [2.5, 0, -1], [-2.5, 0, 1.8], [0, 0, 1.8], [2.5, 0, 1.8]]
  const displayAgents = [...agents]
  while (displayAgents.length < 6) displayAgents.push(null)

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[6, 10, 6]} intensity={0.7} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-4, 4, -4]} intensity={0.25} color="#007AFF" />
      <pointLight position={[4, 4, 4]} intensity={0.15} color="#34C759" />
      <Floor />
      {positions.map((pos, index) => (
        <WorkStation
          key={displayAgents[index]?.id || `empty-${index}`}
          agent={displayAgents[index]}
          position={pos}
          onClick={onAgentClick}
        />
      ))}
      <OrbitControls enablePan enableZoom enableRotate minPolarAngle={Math.PI / 5} maxPolarAngle={Math.PI / 2.3} minDistance={5} maxDistance={18} />
    </>
  )
}

// 头部统计
function HeaderStats() {
  const stats = [
    { label: '在线员工', value: 4, color: '#007AFF' },
    { label: '进行中', value: 2, color: '#FF9500' },
    { label: '已完成', value: 1, color: '#34C759' },
    { label: '待处理', value: 3, color: '#8E8E93' },
  ]
  return (
    <div className="header-stats">
      {stats.map((stat, i) => (
        <div key={i} className="stat-item">
          <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
            <span className="stat-dot" style={{ backgroundColor: stat.color }} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

// 状态图例
function StatusLegend() {
  const legends = [
    { key: 'working', text: '工作中', color: '#2196F3' },
    { key: 'thinking', text: '思考中', color: '#FF9800' },
    { key: 'deploying', text: '部署中', color: '#4CAF50' },
    { key: 'completed', text: '已完成', color: '#34C759' },
  ]
  return (
    <div className="status-legend">
      {legends.map(item => (
        <div key={item.key} className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: item.color }} />
          <span>{item.text}</span>
        </div>
      ))}
    </div>
  )
}

// 员工详情弹窗
function AgentDetailModal({ agent, open, onClose }) {
  if (!agent) return null
  const status = statusColors[agent.status]

  return (
    <Modal
      title={null}
      open={open}
      onCancel={onClose}
      footer={null}
      width={480}
      centered
    >
      <div className="agent-detail">
        <div className="agent-header">
          <Avatar size={56} style={{ backgroundColor: agent.color, fontSize: '24px' }}>
            {agent.avatar}
          </Avatar>
          <div className="agent-info">
            <h2>{agent.name}</h2>
            <Tag color={agent.roleColor} style={{ borderRadius: '12px' }}>{agent.role}</Tag>
          </div>
        </div>
        <Descriptions column={1} size="small">
          <Descriptions.Item label="状态">
            <Tag color={status.color}>{status.text}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="当前任务">{agent.task || '无'}</Descriptions.Item>
          <Descriptions.Item label="进度">
            <Progress percent={agent.progress} strokeColor={agent.color} size="small" />
          </Descriptions.Item>
          <Descriptions.Item label="技能">
            <div className="skills">{agent.skills?.map(s => <Tag key={s}>{s}</Tag>)}</div>
          </Descriptions.Item>
          <Descriptions.Item label="已完成">{agent.completedTasks} 个任务</Descriptions.Item>
        </Descriptions>
      </div>
    </Modal>
  )
}

// 主页面
function OfficePage() {
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const handleAgentClick = (agent) => {
    setSelectedAgent(agent)
    setModalOpen(true)
  }

  return (
    <div className="office-page">
      <div className="office-header">
        <div className="office-title">
          <h1>虚拟办公室</h1>
          <p>AI数字员工云端开发与运维平台</p>
        </div>
        <HeaderStats />
      </div>

      <div className="office-content">
        <div className="office-subtitle">
          <ApartmentOutlined />
          <span>3D 办公区域</span>
          <span className="hint">点击员工查看详情 · 拖拽旋转 · 滚轮缩放</span>
        </div>

        <div className="canvas-container">
          <Canvas shadows camera={{ position: [7, 6, 7], fov: 42 }} gl={{ antialias: true }}>
            <Suspense fallback={null}>
              <Scene onAgentClick={handleAgentClick} />
            </Suspense>
          </Canvas>
        </div>

        <StatusLegend />
      </div>

      <AgentDetailModal agent={selectedAgent} open={modalOpen} onClose={() => setModalOpen(false)} />

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        .office-page { min-height: calc(100vh - 120px); padding: 32px; background: linear-gradient(180deg, #F8F9FA 0%, #FFFFFF 100%); }
        .office-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; flex-wrap: wrap; gap: 24px; }
        .office-title h1 { font-size: 32px; font-weight: 600; color: #1D1D1F; margin-bottom: 8px; letter-spacing: -0.5px; }
        .office-title p { font-size: 15px; color: #86868B; }
        .header-stats { display: flex; gap: 16px; flex-wrap: wrap; }
        .stat-item { display: flex; align-items: center; gap: 12px; padding: 14px 18px; background: #FFFFFF; border-radius: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .stat-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        .stat-dot { width: 10px; height: 10px; border-radius: 50%; }
        .stat-value { font-size: 22px; font-weight: 600; color: #1D1D1F; }
        .stat-label { font-size: 12px; color: #86868B; }
        .office-content { background: #FFFFFF; border-radius: 24px; padding: 28px; box-shadow: 0 4px 24px rgba(0,0,0,0.04); }
        .office-subtitle { display: flex; align-items: center; gap: 10px; font-size: 16px; font-weight: 500; color: #1D1D1F; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #F0F0F0; }
        .hint { font-size: 12px; color: #AEAEB2; font-weight: 400; margin-left: auto; }
        .canvas-container { width: 100%; height: 520px; border-radius: 16px; overflow: hidden; background: linear-gradient(135deg, #FAFAFA 0%, #F0F0F0 100%); margin-bottom: 24px; }
        .canvas-container canvas { cursor: grab; }
        .canvas-container canvas:active { cursor: grabbing; }
        .status-legend { display: flex; justify-content: center; flex-wrap: wrap; gap: 20px; padding-top: 20px; border-top: 1px solid #F0F0F0; }
        .legend-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #86868B; }
        .legend-dot { width: 10px; height: 10px; border-radius: 50%; }
        .agent-detail { padding: 8px 0; }
        .agent-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
        .agent-info h2 { font-size: 22px; font-weight: 600; margin-bottom: 6px; }
        .skills { display: flex; flex-wrap: wrap; gap: 6px; }
        @media (max-width: 768px) {
          .office-page { padding: 20px; }
          .office-header { flex-direction: column; }
          .canvas-container { height: 420px; }
        }
      `}</style>
    </div>
  )
}

export default OfficePage
