// Enhanced wallet connection button with proper Petra mobile deep linking
// Supports both standard wallet adapter and mobile deep linking
// Uses Petra deep link service for secure mobile-to-mobile communication

import { useWallet, groupAndSortWallets } from '@aptos-labs/wallet-adapter-react';
import { WalletReadyState } from '@aptos-labs/wallet-adapter-react';
import { toast } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { petraDeepLinkService, type PetraConnectionState } from '../services/petraDeepLinkService';

export default function ConnectWalletButton() {
  const { connect, disconnect, connected, account, wallets, notDetectedWallets } = useWallet();
  const [deepLinkState, setDeepLinkState] = useState<PetraConnectionState>({ isConnected: false });

  // Detect mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

  // Group and sort wallets to access Petra's deeplinkProvider for mobile
  const groupedWallets = groupAndSortWallets([...wallets, ...notDetectedWallets]);
  const petraWallets = [...groupedWallets.availableWallets, ...groupedWallets.installableWallets].filter(w => w.name === "Petra");
  const petraWallet = petraWallets[0];

  // Subscribe to deep link state changes
  useEffect(() => {
    const unsubscribe = petraDeepLinkService.onStateChange(setDeepLinkState);
    
    // Get initial state
    setDeepLinkState(petraDeepLinkService.getConnectionState());
    
    return unsubscribe;
  }, []);

  // Clear deep link state when standard wallet connects to prevent conflicts
  useEffect(() => {
    if (connected && account && deepLinkState.isConnected) {
      console.log('Standard wallet connected - clearing deep link state to prevent conflicts');
      // Silently clear deep link state without triggering disconnect flow
      petraDeepLinkService.disconnect().catch(err => {
        console.log('Error clearing deep link state:', err);
      });
    }
  }, [connected, account, deepLinkState.isConnected]);

  const handleConnect = async () => {
    try {
      // PRIORITY: Always try standard wallet adapter first (works on desktop and mobile in-app browser)
      
      if (petraWallet && petraWallet.readyState === WalletReadyState.Installed) {
        // Petra wallet is detected - use standard connection (best for both desktop and mobile)
        toast('Connecting to Petra wallet...', {
          icon: '🔗',
          duration: 2000,
        });
        
        await connect("Petra");
        toast.success('Wallet connected successfully!');
        return;
      }
      
      // Wallet not detected
      if (isMobile) {
        // On mobile without wallet extension detected, use deep linking for secure connection
        toast('Opening Petra app to connect...', {
          icon: '📱',
          duration: 2000,
        });
        
        // Use proper Petra deep linking protocol for connection
        await petraDeepLinkService.connect();
        return;
      }
      
      // Desktop without wallet - show error
      toast.error('Petra wallet not found. Please install Petra wallet extension.');
    } catch (error: any) {
      console.error("Connection failed:", error);
      
      // Enhanced error handling with specific messages
      let errorMessage = 'Failed to connect wallet';
      
      if (error?.message?.includes('User rejected')) {
        errorMessage = 'Connection cancelled by user';
      } else if (error?.message?.includes('No wallet')) {
        errorMessage = 'Petra wallet not found. Please install Petra wallet.';
      } else if (error?.message?.includes('network')) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error?.message?.includes('Deep linking is only available on mobile')) {
        // If deep linking fails, provide instructions
        errorMessage = 'Please open this app in Petra wallet\'s browser or install Petra app.';
      }
      
      toast.error(errorMessage);
    }
  };

  const handleDisconnect = async () => {
    try {
      // Disconnect from both standard wallet and deep link service
      if (connected) {
        await disconnect();
      }
      
      if (deepLinkState.isConnected) {
        await petraDeepLinkService.disconnect();
      }
      
      toast.success('Wallet disconnected');
    } catch (error) {
      console.error("Disconnect failed:", error);
      toast.error('Failed to disconnect wallet');
    }
  };

  // Check if we're connected via either method
  const isConnected = connected || deepLinkState.isConnected;
  const displayAddress = account?.address?.toString() || deepLinkState.walletAddress;

  if (isConnected && displayAddress) {
    // Show disconnect button with truncated address
    return (
      <button
        onClick={handleDisconnect}
        className="text-white bg-transparent border border-disabled px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm"
      >
        {displayAddress.slice(0, 6)}...{displayAddress.slice(-4)}
      </button>
    );
  }

  // Connect button with conditional text for mobile
  const getButtonText = () => {
    if (isMobile) {
      if (petraWallet && petraWallet.readyState === WalletReadyState.Installed) {
        return "Connect Petra";
      }
      return "Open Petra App";
    }
    return "Connect Wallet";
  };

  return (
    <button
      onClick={handleConnect}
      className="btn-primary"
    >
      {getButtonText()}
    </button>
  );
}
