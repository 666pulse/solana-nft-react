import React, { useState } from 'react';
import { styled } from 'styled-components';
import { Divider, Form, Input, InputNumber, Col, Row, Upload, Switch, Alert, Button } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';

const RowGutter = { xs: 8, sm: 16, md: 24, lg: 32 };

export default function IssueToken() {
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <div>
      <div>
        <h1>Issue Token</h1>
        <Divider />
      </div>

      <Form layout="vertical">
        <Row gutter={RowGutter}>
          <Col span={12}>
            <Form.Item name="Token Name" label="Token Name" rules={[{ required: true }]}>
              <Input size="large" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="Token Symbol" label="Token Symbol" rules={[{ required: true }]}>
              <Input size="large" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={RowGutter}>
          <Col span={12}>
            <Form.Item name="Decimais" label="Decimais" rules={[{ required: true }]}>
              <InputNumber size="large" style={{ width: '100%' }} step={1} min={1} stringMode precision={0} />
            </Form.Item>
            <Form.Item name="Supply" label="Supply" rules={[{ required: true }]}>
              <InputNumber size="large" style={{ width: '100%' }} step={1} min={1} stringMode precision={0} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="Token Logo" label="Token Logo" rules={[{ required: true }]}>
              <UploadBox>
                {' '}
                <Upload
                  accept="image/png, image/jpeg"
                  listType="picture-card"
                  // beforeUpload={beforeUpload}
                  // customRequest={(option) => onUpload(option)}
                  showUploadList={false}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="avatar"
                      style={{
                        width: '100%',
                      }}
                    />
                  ) : (
                    <div>
                      {loading ? <LoadingOutlined /> : <PlusOutlined />}
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  )}
                </Upload>
              </UploadBox>
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Form.Item name="Token Description" label="Token Description" rules={[{ required: true }]}>
              <Input.TextArea rows={4} />
            </Form.Item>
          </Col>
        </Row>
        <CardBox>
          <Card>
            <div className="el-head">
              <span>
                <strong>Immutable</strong>
              </span>
              <Switch />
            </div>
            <div className="el-content">
              Renouncing ownership means you will not be able to modify the token metadata. It indeed makes investors
              feel more secure.
            </div>
          </Card>
          <Card>
            <div className="el-head">
              <span>
                <strong>Relinquish Freezing Right</strong>
              </span>
              <Switch />
            </div>
            <div className="el-content">
              Creating a liquidity pool requires relinquishing freezing rights, meaning you can't freeze tokens in
              holder wallets.
            </div>
          </Card>
          <Card>
            <div className="el-head">
              <span>
                <strong>Relinquish Minting Right</strong>
              </span>
              <Switch />
            </div>
            <div className="el-content">
              Relinquishing minting rights is essential for investor security and token success, preventing further
              token supply.
            </div>
          </Card>
        </CardBox>
        <Form.Item>
          <AlertStyle
            message="The process of creating tokens is significantly influenced by the local network environment. If it continues to fail, try switching to a more stable network or activate the global mode of a VPN before proceeding with the operation."
            type="warning"
            showIcon
          />
          <AlertStyle
            message="Solana Network Congestion: The Solana network is currently experiencing congestion. If the program is not functioning properly or if errors occur, please try again."
            type="warning"
            showIcon
            style={{
              marginTop: '12px',
            }}
          />
        </Form.Item>
        <Form.Item>
          <CreateOperator>
            <div>
              <Button type="primary" htmlType="submit" style={{ width: 200 }} size="large">
                Create Token
              </Button>
            </div>
            <CreateTip>The lowest service fee on the entire network is 0.1 SOL.</CreateTip>
          </CreateOperator>
        </Form.Item>
      </Form>
    </div>
  );
}

const UploadBox = styled.div`
  border-radius: 8px;
  border: 1px solid #d9d9d9;
  padding-block: 16px;
  display: flex;
  justify-content: center;
  &:hover {
    border-color: #704eb5;
  }
`;

const CardBox = styled.div`
  display: flex;
  gap: 20px;
  align-items: stretch;
  margin-bottom: 24px;
`;

const Card = styled.div`
  flex: 1;
  padding-inline: 16px;
  background: linear-gradient(14deg, rgba(255, 255, 255, 0) 0%, #a489d8 100%);
  border-radius: 5px;
  padding-bottom: 16px;
  .el-head {
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    padding-top: 18px;
    padding-bottom: 16px;
  }
  .el-content {
    font-family: PingFang SC, PingFang SC;
    font-weight: 500;
    font-size: 14px;
    color: #666;
    line-height: 26px;
  }
`;

const CreateTip = styled.div`
  text-align: center;
  color: rgba(0, 0, 0, 0.3);
  font-size: 12px;
`;

const CreateOperator = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
`;

const AlertStyle = styled(Alert)`
  color: #ff9815;
  border-color: #ff9815;
  background: rgba(255, 152, 21, 0.04);
`;
