import React, { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Layout, Menu, theme } from 'antd';
import { FireOutlined, SmileOutlined } from '@ant-design/icons';
import RightHeader from './header';
const { Sider, Content } = Layout;

const AppLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  return (
    <LayoutStyle>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['token']}>
          <Menu.Item key="token">
            <Link to="/issue-token">
              <FireOutlined />
              <span>Issue Token</span>
            </Link>
          </Menu.Item>
          <Menu.Item key="nft">
            <Link to="/issue-nft">
              <SmileOutlined />
              <span>Issue NFT</span>
            </Link>
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <RightHeader collapsed={collapsed} setCollapsed={setCollapsed} />
        <ContentStyle>{children}</ContentStyle>
      </Layout>
    </LayoutStyle>
  );
};
export default AppLayout;

const LayoutStyle = styled(Layout)`
  width: 100vw;
  height: 100vh;
`;

const ContentStyle = styled(Content)`
  background-color: #fff;
  border-radius: 8px;
  margin: 16px;
  padding: 24px;
  min-height: 280px;
  overflow-y: auto;
`;
