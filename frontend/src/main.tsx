// main.tsx - Entry point for the React app
// Refactored to use Aptos Wallet Adapter instead of Reown AppKit/Wagmi for Aptos support
// Aptos-only implementation: Wallet connection via Petra with autoConnect enabled on TESTNET

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Network } from '@aptos-labs/ts-sdk';

// Setup queryClient for react-query caching and data fetching
const queryClient = new QueryClient();

// Aptos network configuration
// Use TESTNET for development; switch to Network.MAINNET for production (e.g., via .env)
const aptosNetwork = Network.TESTNET;

// Wallet Provider for Aptos integration
function AptosWalletProvider({ children }: { children: React.ReactNode }) {
  return (
    // Aptos Wallet Adapter Provider: Handles wallet connection, signing, and submission
    // autoConnect: Automatically connects to previously used wallet on page load
    // dappConfig: Specifies the network; aptosApiKeys can be added for advanced features if needed
    // onError: Logs wallet adapter errors for debugging
    <AptosWalletAdapterProvider
      autoConnect={true}
      dappConfig={{ 
        network: aptosNetwork 
      }}
      onError={(error) => {
        console.error("Wallet adapter error:", error); // Error handling for connection/sign issues
      }}
    >
      {/* QueryClientProvider wraps the app for data querying (e.g., balances, tx status) */}
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </AptosWalletAdapterProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AptosWalletProvider>
        <App />
      </AptosWalletProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
