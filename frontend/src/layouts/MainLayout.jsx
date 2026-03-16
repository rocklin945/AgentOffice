import { Outlet } from 'react-router-dom'
import { Layout } from 'antd'

const { Header, Content, Footer } = Layout

function MainLayout() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#001529', padding: '0 20px' }}>
        <div style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>
          AgentOffice - AI数字员工云端开发平台
        </div>
      </Header>
      <Content style={{ padding: '20px' }}>
        <Outlet />
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        AgentOffice ©2026 - AI数字员工云端开发与运维平台
      </Footer>
    </Layout>
  )
}

export default MainLayout