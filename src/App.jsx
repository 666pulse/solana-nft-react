import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Layout from './layout';
import IssueNFT from './views/nft';
import IssueToken from './views/token';
import GlobalStyle from './utils/GlobalStyle';
import AppProvider from './store/appProvider';
import { Toaster } from 'react-hot-toast';
import {ConfigProvider} from 'antd';
import('@solana/wallet-adapter-react-ui/styles.css');

export default function RouterLink() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#512da8',
        },
      }}
    >
      <AppProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/issue-token" />} />
              <Route path="/issue-token" element={<IssueToken />} />
              <Route path="/issue-nft" element={<IssueNFT />} />
            </Routes>
          </Layout>
        </Router>
        <Toaster />
        <GlobalStyle />
      </AppProvider>
    </ConfigProvider>
  );
}
