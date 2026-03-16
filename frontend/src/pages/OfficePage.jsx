import { Card, Row, Col } from 'antd'

function OfficePage() {
  return (
    <div>
      <h1>虚拟办公室</h1>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="欢迎使用 AgentOffice">
            <p>AI数字员工云端开发与运维平台</p>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default OfficePage