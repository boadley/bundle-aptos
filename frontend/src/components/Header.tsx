import { useState } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { IoPersonCircleOutline, IoHelpCircleOutline, IoNotificationsOutline } from 'react-icons/io5';
import ConnectWalletButton from './ConnectWalletButton';

export default function Header() {
  const { connected, account } = useWallet();
  const [copied, setCopied] = useState(false);
  const [copiedTimeout, setCopiedTimeout] = useState<number | null>(null);

  // Format address for display
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Handle copying address to clipboard
  const handleCopyAddress = async () => {
    if (!account?.address) return;

    try {
      await navigator.clipboard.writeText(account.address.toString());
      setCopied(true);

      // Clear any existing timeout
      if (copiedTimeout) {
        clearTimeout(copiedTimeout);
      }

      // Set new timeout to hide copied message
      const timeout = setTimeout(() => {
        setCopied(false);
      }, 2000);

      setCopiedTimeout(timeout as unknown as number);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  return (
    <header className="bg-primary p-4 flex justify-between items-center">
      {connected && account ? (
        <>
          {/* Left side - Profile and greeting */}
          <div className="flex items-center space-x-3">
            <IoPersonCircleOutline className="w-8 h-8 text-white" />
            <div>
              <p className="text-sm text-secondary">Hi,</p>
              <p
                className="text-white font-medium cursor-pointer hover:text-accent transition-colors"
                onClick={handleCopyAddress}
                title="Click to copy full address"
              >
                {formatAddress(account.address.toString())}
              </p>
              {copied && (
                <p className="text-xs text-green-400 mt-1">Copied!</p>
              )}
            </div>
          </div>

          {/* Right side - Help and notifications */}
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-1 text-secondary hover:text-white transition-colors">
              <IoHelpCircleOutline className="w-5 h-5" />
              <span className="text-sm font-medium">HELP</span>
            </button>
            <button className="text-secondary hover:text-white transition-colors">
              <IoNotificationsOutline className="w-6 h-6" />
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Not connected state */}
          <div className="text-2xl font-bold text-accent">Bundle</div>
          <ConnectWalletButton />
        </>
      )}
    </header>
  );
}
