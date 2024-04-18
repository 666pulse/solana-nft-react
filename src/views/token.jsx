import React, { useState, useMemo, useEffect } from 'react';
import { styled } from 'styled-components';
import { Divider, Form, Input, InputNumber, Col, Row, Upload, Switch, Alert, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import toast from 'react-hot-toast';

import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { createGenericFileFromBrowserFile } from '@metaplex-foundation/umi';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import { nftStorageUploader } from '@metaplex-foundation/umi-uploader-nft-storage';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';

import { getBase64 } from '../utils/image';
import LoadingModal from '../components/loadingModal';

const RowGutter = { xs: 8, sm: 16, md: 24, lg: 32 };

const MAX_FILE_SIZE = 2; // M

const beforeUpload = (file) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    toast.error('You can only upload JPG/PNG file!');
  }
  const isLt2M = file.size / 1024 / 1024 <= MAX_FILE_SIZE;
  if (!isLt2M) {
    toast.error('Image must smaller than 2MB!');
  }
  return isJpgOrPng && isLt2M;
};

const LogoUpload = ({ value, onChange }) => {
  const [imageData, setImageData] = useState(value);
  const onUpload = async ({ file }) => {
    onChange(file);
  };

  useEffect(() => {
    value && getBase64(value).then((d) => setImageData(d));
  }, [value]);

  return (
    <UploadBox>
      <Upload
        accept="image/png, image/jpeg"
        listType="picture-card"
        beforeUpload={beforeUpload}
        customRequest={(option) => onUpload(option)}
        showUploadList={false}
      >
        {value ? (
          <img
            src={imageData}
            alt="avatar"
            style={{
              width: '100%',
            }}
          />
        ) : (
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
          </div>
        )}
      </Upload>
    </UploadBox>
  );
};

const SwitchItem = ({ value, onChange, name, desc }) => {
  return (
    <Card>
      <div className="el-head">
        <span>
          <strong>{name}</strong>
        </span>
        <Switch onChange={(v) => onChange(v)} />
      </div>
      <div className="el-content">{desc}</div>
    </Card>
  );
};

const TOKEN = import.meta.env.VITE_UPLOADER_TOKEN;

export default function IssueToken() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [fileData, setFileData] = useState();

  const { connection } = useConnection();
  const wallet = useWallet();

  const umi = useMemo(() => {
    return !wallet.connected
      ? null
      : createUmi(connection.rpcEndpoint)
          .use(walletAdapterIdentity(wallet))
          .use(nftStorageUploader({ token: TOKEN }));
  }, [connection.rpcEndpoint, wallet.connected]);

  const uploadLogo = async (imgFile) => {
    if (imgFile.name === fileData?.name && fileData.uri) {
      return fileData.uri;
    }
    const genericFile = await createGenericFileFromBrowserFile(imgFile);
    const uris = await umi.uploader.upload([genericFile]);
    setFileData({
      name: imgFile.name,
      uri: uris[0],
    });
    return uris[0];
  };

  const onSubmit = async (values) => {
    console.log('submit:', values);
    if (!umi) {
      toast.error('Please connect wallet first!');
      return;
    }
    setLoading(true);

    try {
      await uploadLogo(values.logo);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div>
        <h1>Issue Token</h1>
        <Divider />
      </div>

      <Form layout="vertical" onFinish={onSubmit} form={form}>
        <Row gutter={RowGutter}>
          <Col span={12}>
            <Form.Item name="name" label="Token Name" rules={[{ required: true }]}>
              <Input size="large" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="symbol" label="Token Symbol" rules={[{ required: true }]}>
              <Input size="large" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={RowGutter}>
          <Col span={12}>
            <Form.Item name="decimais" label="Decimais" rules={[{ required: true }]}>
              <InputNumber size="large" style={{ width: '100%' }} step={1} min={1} stringMode precision={0} />
            </Form.Item>
            <Form.Item name="supply" label="Supply" rules={[{ required: true }]}>
              <InputNumber size="large" style={{ width: '100%' }} step={1} min={1} stringMode precision={0} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="logo" label="Token Logo" rules={[{ required: true }]}>
              <LogoUpload />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Form.Item name="desc" label="Token Description" rules={[{ required: true }]}>
              <Input.TextArea rows={4} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={RowGutter}>
          <Col span={8}>
            <Form.Item name="immutable">
              <SwitchItem
                name="Immutable"
                desc="Renouncing ownership means you will not be able to modify the token metadata. It indeed makes investors
              feel more secure."
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="freezeAuthority">
              <SwitchItem
                name="Relinquish Freezing Right"
                desc="Creating a liquidity pool requires relinquishing freezing rights, meaning you can't freeze tokens in
              holder wallets."
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="mintAuthority">
              <SwitchItem
                name="Relinquish Minting Right"
                desc="Relinquishing minting rights is essential for investor security and token success, preventing further
              token supply."
              />
            </Form.Item>
          </Col>
        </Row>
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
      {loading && <LoadingModal text="creating token..." />}
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
