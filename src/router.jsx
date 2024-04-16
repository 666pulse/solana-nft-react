import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Layout from 'layout';
import IssueNFT from 'views/nft';
import IssueToken from 'views/token';

export default function RouterLink() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/issue-token" />} />
          <Route path="/issue-token" element={<IssueToken />} />
          <Route path="/issue-nft" element={<IssueNFT />} />
        </Routes>
      </Layout>
      <RouterChecker />
    </Router>
  );
}
