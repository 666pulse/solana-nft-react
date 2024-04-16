import React, { useState } from 'react';
import { styled } from 'styled-components';
import { Divider, Form, Input, Col, Row, Upload } from 'antd';
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
              <Input size="large" />
            </Form.Item>
            <Form.Item name="Supply" label="Supply" rules={[{ required: true }]}>
              <Input size="large" />
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
              <Input.TextArea rows={4} placeholder="Enter Token Description" />
            </Form.Item>
          </Col>
        </Row>
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
`;
