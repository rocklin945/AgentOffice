import { Outlet } from 'react-router-dom'
import { Layout } from 'antd'

const { Header, Content, Footer } = Layout

function MainLayout() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{
        background: '#FFFFFF',
        padding: '0 32px',
        borderBottom: '1px solid #F0F0F0',
        display: 'flex',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{
          color: '#1D1D1F',
          fontSize: '20px',
          fontWeight: 600,
          letterSpacing: '-0.5px',
        }}>
          AgentOffice
        </div>
        <div style={{
          color: '#86868B',
          fontSize: '14px',
          marginLeft: '12px',
          paddingLeft: '12px',
          borderLeft: '1px solid #E5E5E5',
        }}>
          AI数字员工云端开发平台
        </div>
      </Header>
      <Content style={{ background: '#F8F9FA' }}>
        <Outlet />
      </Content>
      <Footer style={{
        textAlign: 'center',
        background: '#F8F9FA',
        color: '#86868B',
        fontSize: '13px',
        padding: '20px',
        borderTop: '1px solid #F0F0F0',
      }}>
        AgentOffice — AI数字员工云端开发与运维平台
      </Footer>
    </Layout>
  )
}

export default MainLayout
