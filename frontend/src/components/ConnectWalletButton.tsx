// Aptos-only wallet connection button
// Refactored from AppKit to useWallet hook for connection/disconnect
// On mobile, checks for Petra installation; if not, uses deeplink to open/install Petra app

import { useWallet, groupAndSortWallets } from '@aptos-labs/wallet-adapter-react';
import { WalletReadyState } from '@aptos-labs/wallet-adapter-react';
import { toast } from 'react-hot-toast';

export default function ConnectWalletButton() {
  const { connect, disconnect, connected, account, wallets, notDetectedWallets } = useWallet();

  // Detect mobile device (user agent or screen width for responsiveness)
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

  // Group and sort wallets to access Petra's deeplinkProvider for mobile
  const groupedWallets = groupAndSortWallets([...wallets, ...notDetectedWallets]);
  const petraWallets = [...groupedWallets.availableWallets, ...groupedWallets.installableWallets].filter(w => w.name === "Petra");
  const petraWallet = petraWallets[0];

  const handleConnect = async () => {
    try {
      if (isMobile && petraWallet && petraWallet.readyState !== WalletReadyState.Installed) {
        // Mobile deeplinking: Redirect to Petra app/explore for installation or open if not detected
        toast('Redirecting to Petra wallet...', {
          icon: '📱',
          duration: 2000,
        });
        
        const deepLinkProvider = (petraWallet as any).deeplinkProvider || 'https://petra.app/explore?link=';
        const deepLinkUrl = deepLinkProvider + encodeURIComponent(window.location.href);
        
        // Small delay to show the toast before redirect
        setTimeout(() => {
          window.location.href = deepLinkUrl;
        }, 500);
        return;
      }
      
      // Standard connect to Petra wallet on desktop or in-app browser
      toast('Connecting to Petra wallet...', {
        icon: '🔗',
        duration: 2000,
      });
      
      await connect("Petra");
      toast.success('Wallet connected successfully!');
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
      }
      
      toast.error(errorMessage);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      toast.success('Wallet disconnected');
    } catch (error) {
      console.error("Disconnect failed:", error);
      toast.error('Failed to disconnect wallet');
    }
  };

  if (connected && account) {
    // Show disconnected button with truncated Aptos account address
    return (
      <button
        onClick={handleDisconnect}
        className="text-white bg-transparent border border-disabled px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm"
      >
        {account.address.toString().slice(0, 6)}...{account.address.toString().slice(-4)}
      </button>
    );
  }

  // Connect button with conditional text for mobile Petra
  return (
    <button
      onClick={handleConnect}
      className="btn-primary"
    >
      {isMobile && petraWallet && petraWallet.readyState !== WalletReadyState.Installed ? "Open Petra App" : "Connect Wallet"}
    </button>
  );
}
