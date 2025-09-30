import { Routes, Route, Navigate } from 'react-router-dom';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Toaster } from 'react-hot-toast';

import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import StatusPage from './components/StatusPage';
import TestDeepLinkPage from './pages/TestDeepLinkPage';
import { petraDeepLinkService } from './services/petraDeepLinkService';

function App() {
  const { connected, account } = useWallet();

  // Check for deep link connection state
  const deepLinkState = petraDeepLinkService.getConnectionState();
  const isConnected = connected || deepLinkState.isConnected;

  // Allow access to test page regardless of connection status
  if (window.location.pathname === '/test-deeplink') {
    return (
      <>
        <Toaster />
        <TestDeepLinkPage />
      </>
    );
  }

  // Check if wallet is connected: connected state is true and account exists (Aptos-specific)
  if (!isConnected || (!account && !deepLinkState.walletAddress)) {
    return (
      <>
        <Toaster />
        <LoginPage />
      </>
    );
  }

  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/status" element={<StatusPage />} />
        <Route path="/test-deeplink" element={<TestDeepLinkPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
