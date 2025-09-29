import { Routes, Route, Navigate } from 'react-router-dom';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Toaster } from 'react-hot-toast';

import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import StatusPage from './components/StatusPage';

function App() {
  const { connected, account } = useWallet();

  // Check if wallet is connected: connected state is true and account exists (Aptos-specific)
  if (!connected || !account) {
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
