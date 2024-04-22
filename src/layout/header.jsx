import styled from 'styled-components';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Layout, Button, Select } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { useAppContext } from '../store/appProvider';
const { Header } = Layout;

export default function RightHeader({ collapsed, setCollapsed }) {
  const { network, changeNetwork } = useAppContext();
  return (
    <WalletModalProvider>
      <HeaderStyle>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          style={{
            fontSize: '16px',
            width: 64,
            height: 64,
          }}
        />
        <HeaderRightStyle>
          <Select
            defaultValue={network}
            value={network}
            style={{ width: 120, height: 50, marginRight: 20 }}
            onChange={changeNetwork}
            options={[
              { value: WalletAdapterNetwork.Mainnet, label: 'Mainnet' },
              { value: WalletAdapterNetwork.Devnet, label: 'Devnet' },
              { value: WalletAdapterNetwork.Testnet, label: 'Testnet' },
            ]}
          />
          <WalletMultiButton />
        </HeaderRightStyle>
      </HeaderStyle>
    </WalletModalProvider>
  );
}

const HeaderStyle = styled(Header)`
  background-color: #fff;
  padding-inline: 16px;
  display: flex;
  justify-content: space-between;
`;

const HeaderRightStyle = styled.div`
  display: flex;
  align-items: center;
`;
