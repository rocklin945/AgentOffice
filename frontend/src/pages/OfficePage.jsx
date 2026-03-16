import { useState, useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Float } from '@react-three/drei'
import { Tag, Tooltip } from 'antd'
import {
  CodeOutlined,
  BugOutlined,
  CloudOutlined,
  ApartmentOutlined,
} from '@ant-design/icons'
import * as THREE from 'three'

// 模拟AI员工数据
const initialAgents = [
  {
    id: 1,
    name: 'Alex',
    role: '开发工程师',
    roleIcon: <CodeOutlined />,
    status: 'working',
    statusText: '工作中',
    task: '编写用户登录接口',
    avatar: 'A',
    color: '#007AFF',
  },
  {
    id: 2,
    name: 'Sarah',
    role: '测试工程师',
    roleIcon: <BugOutlined />,
    status: 'thinking',
    statusText: '思考中',
    task: '设计测试用例',
    avatar: 'S',
    color: '#34C759',
  },
  {
    id: 3,
    name: 'Mike',
    role: '运维工程师',
    roleIcon: <CloudOutlined />,
    status: 'deploying',
    statusText: '部署中',
    task: '部署Docker镜像',
    avatar: 'M',
    color: '#FF9500',
  },
  {
    id: 4,
    name: 'Lisa',
    role: '产品经理',
    roleIcon: <ApartmentOutlined />,
    status: 'completed',
    statusText: '已完成',
    task: '需求文档撰写',
    avatar: 'L',
    color: '#AF52DE',
  },
]

// 状态颜色映射
const statusColors = {
  working: { color: '#2196F3', emissive: '#1565C0' },
  thinking: { color: '#FF9800', emissive: '#E65100' },
  compiling: { color: '#9C27B0', emissive: '#6A1B9A' },
  deploying: { color: '#4CAF50', emissive: '#2E7D32' },
  completed: { color: '#34C759', emissive: '#1B5E20' },
  idle: { color: '#9E9E9E', emissive: '#616161' },
}

// 像素风小人组件
function PixelAgent({ agent, position }) {
  const groupRef = useRef()
  const status = statusColors[agent.status]
  const [hovered, setHovered] = useState(false)

  // 悬浮动画
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.05
    }
  })

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* 身体 - 像素方块 */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[0.4, 0.5, 0.3]} />
        <meshStandardMaterial
          color={agent.color}
          emissive={status.emissive}
          emissiveIntensity={hovered ? 0.5 : 0.2}
          roughness={0.8}
        />
      </mesh>

      {/* 头部 */}
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[0.35, 0.35, 0.35]} />
        <meshStandardMaterial
          color="#FFCC99"
          roughness={0.9}
        />
      </mesh>

      {/* 头发/帽子 */}
      <mesh position={[0, 1.32, 0]}>
        <boxGeometry args={[0.37, 0.12, 0.37]} />
        <meshStandardMaterial color={agent.color} roughness={0.8} />
      </mesh>

      {/* 眼睛 */}
      <mesh position={[-0.08, 1.1, 0.18]}>
        <boxGeometry args={[0.06, 0.06, 0.02]} />
        <meshStandardMaterial color="#1D1D1F" />
      </mesh>
      <mesh position={[0.08, 1.1, 0.18]}>
        <boxGeometry args={[0.06, 0.06, 0.02]} />
        <meshStandardMaterial color="#1D1D1F" />
      </mesh>

      {/* 腿部 */}
      <mesh position={[-0.1, 0.15, 0]}>
        <boxGeometry args={[0.12, 0.3, 0.12]} />
        <meshStandardMaterial color="#3D3D3D" roughness={0.9} />
      </mesh>
      <mesh position={[0.1, 0.15, 0]}>
        <boxGeometry args={[0.12, 0.3, 0.12]} />
        <meshStandardMaterial color="#3D3D3D" roughness={0.9} />
      </mesh>

      {/* 状态光环 */}
      <mesh position={[0, 0, 0]}>
        <ringGeometry args={[0.4, 0.6, 4]} />
        <meshBasicMaterial
          color={status.color}
          transparent
          opacity={0.3}
          rotation={[Math.PI / 2, 0, 0]}
        />
      </mesh>

      {/* 名字标签 */}
      <Float speed={2} rotationIntensity={0} floatIntensity={0}>
        <Text
          position={[0, 1.8, 0]}
          fontSize={0.2}
          color="#1D1D1F"
          anchorX="center"
          anchorY="middle"
        >
          {agent.name}
        </Text>
      </Float>

      {/* 状态指示灯 */}
      <mesh position={[0.25, 0.5, 0.15]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial
          color={status.color}
          emissive={status.color}
          emissiveIntensity={1}
        />
      </mesh>

      {/* 办公桌 */}
      <group position={[0, -0.2, 0.4]}>
        {/* 桌面 */}
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[1.2, 0.08, 0.6]} />
          <meshStandardMaterial color="#E8E8ED" roughness={0.7} />
        </mesh>
        {/* 桌腿 */}
        <mesh position={[-0.5, 0.1, 0.2]}>
          <boxGeometry args={[0.08, 0.4, 0.08]} />
          <meshStandardMaterial color="#D1D1D6" roughness={0.8} />
        </mesh>
        <mesh position={[0.5, 0.1, 0.2]}>
          <boxGeometry args={[0.08, 0.4, 0.08]} />
          <meshStandardMaterial color="#D1D1D6" roughness={0.8} />
        </mesh>
        <mesh position={[-0.5, 0.1, -0.2]}>
          <boxGeometry args={[0.08, 0.4, 0.08]} />
          <meshStandardMaterial color="#D1D1D6" roughness={0.8} />
        </mesh>
        <mesh position={[0.5, 0.1, -0.2]}>
          <boxGeometry args={[0.08, 0.4, 0.08]} />
          <meshStandardMaterial color="#D1D1D6" roughness={0.8} />
        </mesh>

        {/* 显示器 */}
        <mesh position={[0, 0.6, 0]}>
          <boxGeometry args={[0.5, 0.35, 0.05]} />
          <meshStandardMaterial color="#1D1D1F" roughness={0.5} />
        </mesh>
        {/* 显示器屏幕 */}
        <mesh position={[0, 0.6, 0.03]}>
          <boxGeometry args={[0.44, 0.29, 0.02]} />
          <meshStandardMaterial
            color={agent.status === 'working' ? '#007AFF' : '#1a1a2e'}
            emissive={agent.status === 'working' ? '#007AFF' : '#000000'}
            emissiveIntensity={0.3}
          />
        </mesh>
        {/* 显示器支架 */}
        <mesh position={[0, 0.38, 0]}>
          <boxGeometry args={[0.08, 0.15, 0.08]} />
          <meshStandardMaterial color="#86868B" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.28, 0.05]}>
          <boxGeometry args={[0.2, 0.04, 0.15]} />
          <meshStandardMaterial color="#86868B" roughness={0.6} />
        </mesh>

        {/* 键盘 */}
        <mesh position={[0, 0.35, 0.2]}>
          <boxGeometry args={[0.4, 0.03, 0.12]} />
          <meshStandardMaterial color="#3D3D3D" roughness={0.7} />
        </mesh>
      </group>
    </group>
  )
}

// 空工位
function EmptyStation({ position }) {
  const [hovered, setHovered] = useState(false)

  return (
    <group
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* 空桌子 */}
      <group position={[0, -0.2, 0.4]}>
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[1.2, 0.08, 0.6]} />
          <meshStandardMaterial
            color={hovered ? '#E3F2FD' : '#E8E8ED'}
            roughness={0.7}
          />
        </mesh>
        <mesh position={[-0.5, 0.1, 0.2]}>
          <boxGeometry args={[0.08, 0.4, 0.08]} />
          <meshStandardMaterial color="#D1D1D6" roughness={0.8} />
        </mesh>
        <mesh position={[0.5, 0.1, 0.2]}>
          <boxGeometry args={[0.08, 0.4, 0.08]} />
          <meshStandardMaterial color="#D1D1D6" roughness={0.8} />
        </mesh>
        <mesh position={[-0.5, 0.1, -0.2]}>
          <boxGeometry args={[0.08, 0.4, 0.08]} />
          <meshStandardMaterial color="#D1D1D6" roughness={0.8} />
        </mesh>
        <mesh position={[0.5, 0.1, -0.2]}>
          <boxGeometry args={[0.08, 0.4, 0.08]} />
          <meshStandardMaterial color="#D1D1D6" roughness={0.8} />
        </mesh>
      </group>

      {/* 加号图标 */}
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[0.3, 0.05, 0.05]} />
        <meshStandardMaterial
          color={hovered ? '#007AFF' : '#AEAEB2'}
          emissive={hovered ? '#007AFF' : '#000000'}
          emissiveIntensity={0.2}
        />
      </mesh>
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[0.05, 0.3, 0.05]} />
        <meshStandardMaterial
          color={hovered ? '#007AFF' : '#AEAEB2'}
          emissive={hovered ? '#007AFF' : '#000000'}
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* 虚线框 */}
      <mesh position={[0, 0.5, 0]}>
        <ringGeometry args={[0.5, 0.55, 4]} />
        <meshBasicMaterial
          color={hovered ? '#007AFF' : '#D1D1D6'}
          transparent
          opacity={0.5}
          rotation={[Math.PI / 2, 0, 0]}
        />
      </mesh>
    </group>
  )
}

// 地板网格
function Floor() {
  return (
    <group position={[0, -0.5, 0]}>
      {/* 主地板 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 8]} />
        <meshStandardMaterial color="#F5F5F7" roughness={0.9} />
      </mesh>

      {/* 网格线 */}
      {Array.from({ length: 13 }).map((_, i) => (
        <mesh key={`h-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-6 + i, 0.01, 0]}>
          <planeGeometry args={[0.02, 8]} />
          <meshBasicMaterial color="#E0E0E0" transparent opacity={0.5} />
        </mesh>
      ))}
      {Array.from({ length: 9 }).map((_, i) => (
        <mesh key={`v-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -4 + i]}>
          <planeGeometry args={[12, 0.02]} />
          <meshBasicMaterial color="#E0E0E0" transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  )
}

// 3D场景
function Scene() {
  const [agents] = useState(initialAgents)

  // 6个工位位置 [x, y, z]
  const positions = [
    [-2, 0, -1],
    [0, 0, -1],
    [2, 0, -1],
    [-2, 0, 1.5],
    [0, 0, 1.5],
    [2, 0, 1.5],
  ]

  const displayAgents = [...agents]
  while (displayAgents.length < 6) {
    displayAgents.push(null)
  }

  return (
    <>
      {/* 灯光 */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-3, 3, -3]} intensity={0.3} color="#007AFF" />

      {/* 地板 */}
      <Floor />

      {/* 工位 */}
      {positions.map((pos, index) => (
        displayAgents[index] ? (
          <PixelAgent
            key={displayAgents[index].id}
            agent={displayAgents[index]}
            position={pos}
          />
        ) : (
          <EmptyStation key={`empty-${index}`} position={pos} />
        )
      ))}

      {/* 相机控制 */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.5}
        minDistance={4}
        maxDistance={15}
      />
    </>
  )
}

// 头部统计组件
function HeaderStats() {
  const stats = [
    { label: '在线员工', value: 4, color: '#007AFF' },
    { label: '进行中', value: 2, color: '#FF9500' },
    { label: '已完成', value: 1, color: '#34C759' },
    { label: '待处理', value: 3, color: '#8E8E93' },
  ]

  return (
    <div className="header-stats">
      {stats.map((stat, index) => (
        <div key={index} className="stat-item">
          <div
            className="stat-icon"
            style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
          >
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
    { key: 'compiling', text: '编译中', color: '#9C27B0' },
    { key: 'deploying', text: '部署中', color: '#4CAF50' },
    { key: 'completed', text: '已完成', color: '#34C759' },
    { key: 'idle', text: '等待中', color: '#9E9E9E' },
  ]

  return (
    <div className="status-legend">
      {legends.map((item) => (
        <div key={item.key} className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: item.color }} />
          <span>{item.text}</span>
        </div>
      ))}
    </div>
  )
}

// 主页面组件
function OfficePage() {
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
          <span>3D 像素风办公区域</span>
          <span className="subtitle-hint">拖拽旋转 · 滚轮缩放</span>
        </div>

        <div className="canvas-container">
          <Canvas
            shadows
            camera={{ position: [6, 5, 6], fov: 45 }}
            gl={{ antialias: true }}
          >
            <Suspense fallback={null}>
              <Scene />
            </Suspense>
          </Canvas>
        </div>

        <StatusLegend />
      </div>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .office-page {
          min-height: calc(100vh - 120px);
          padding: 32px;
          background: linear-gradient(180deg, #F8F9FA 0%, #FFFFFF 100%);
        }

        .office-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 24px;
        }

        .office-title h1 {
          font-size: 32px;
          font-weight: 600;
          color: #1D1D1F;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }

        .office-title p {
          font-size: 15px;
          color: #86868B;
        }

        .header-stats {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          background: #FFFFFF;
          border-radius: 14px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          transition: all 0.3s ease;
        }

        .stat-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        }

        .stat-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .stat-value {
          font-size: 22px;
          font-weight: 600;
          color: #1D1D1F;
        }

        .stat-label {
          font-size: 12px;
          color: #86868B;
        }

        .office-content {
          background: #FFFFFF;
          border-radius: 24px;
          padding: 28px;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
        }

        .office-subtitle {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 16px;
          font-weight: 500;
          color: #1D1D1F;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #F0F0F0;
        }

        .subtitle-hint {
          font-size: 12px;
          color: #AEAEB2;
          font-weight: 400;
          margin-left: auto;
        }

        .canvas-container {
          width: 100%;
          height: 500px;
          border-radius: 16px;
          overflow: hidden;
          background: linear-gradient(135deg, #F5F5F7 0%, #E8E8ED 100%);
          margin-bottom: 24px;
          box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .canvas-container canvas {
          cursor: grab;
        }

        .canvas-container canvas:active {
          cursor: grabbing;
        }

        .status-legend {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 20px;
          padding-top: 20px;
          border-top: 1px solid #F0F0F0;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #86868B;
        }

        .legend-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        @media (max-width: 768px) {
          .office-page {
            padding: 20px;
          }

          .office-header {
            flex-direction: column;
          }

          .canvas-container {
            height: 400px;
          }
        }
      `}</style>
    </div>
  )
}

export default OfficePage
