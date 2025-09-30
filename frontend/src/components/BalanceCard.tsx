import { useState, useEffect } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Aptos, AptosConfig, Network, AccountAddress } from '@aptos-labs/ts-sdk';
import { petraDeepLinkService } from '../services/petraDeepLinkService';

export default function BalanceCard() {
  const { account, connected } = useWallet();
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [deepLinkState, setDeepLinkState] = useState(petraDeepLinkService.getConnectionState());
  
  // Aptos client for balance queries
  const config = new AptosConfig({ network: Network.TESTNET });
  const aptos = new Aptos(config);
  
  // Subscribe to deep link state changes
  useEffect(() => {
    const unsubscribe = petraDeepLinkService.onStateChange(setDeepLinkState);
    return unsubscribe;
  }, []);

  // Fetch APT balance
  useEffect(() => {
    const fetchBalance = async () => {
      // Check if we have either standard wallet connection or deep link connection
      const hasStandardConnection = account && connected;
      const hasDeepLinkConnection = deepLinkState.isConnected && deepLinkState.walletAddress;

      if (!hasStandardConnection && !hasDeepLinkConnection) {
        setBalance(0);
        return;
      }

      setIsLoading(true);
      try {
        let walletAddress: string;

        if (hasStandardConnection && account) {
          walletAddress = account.address.toString();
        } else if (hasDeepLinkConnection && deepLinkState.walletAddress) {
          walletAddress = deepLinkState.walletAddress;
        } else {
          throw new Error('No valid wallet connection');
        }

        const balanceResponse = await aptos.getAccountAPTAmount({
          accountAddress: AccountAddress.from(walletAddress),
        });
        // Convert from octas to APT (1 APT = 10^8 octas)
        setBalance(balanceResponse / 100_000_000);
      } catch (error) {
        console.error('Failed to fetch balance:', error);
        setBalance(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();
  }, [account, connected, deepLinkState, aptos]);
  
  // Format address to show truncated Aptos address
  const getDisplayAddress = () => {
    if (account) {
      return `${account.address.toString().slice(0, 6)}...${account.address.toString().slice(-4)}`;
    } else if (deepLinkState.walletAddress) {
      return `${deepLinkState.walletAddress.slice(0, 6)}...${deepLinkState.walletAddress.slice(-4)}`;
    }
    return "Not connected";
  };

  // Check if we have any valid connection (standard or deep link)
  const hasValidConnection = connected || deepLinkState.isConnected;

  // Convert APT to NGN equivalent (mock rate: 1 APT = 1200 NGN)
  const aptToNgn = 1200;
  const balanceInNgn = (balance * aptToNgn).toFixed(2);

  return (
    <div className="balance-card mb-8">
      <div className="text-sm text-secondary mb-2">
        {getDisplayAddress()}
      </div>
      <div className="text-4xl font-bold text-white mb-1">
        {isLoading ? (
          <div className="flex items-center">
            <div className="w-6 h-6 border-2 border-secondary border-t-accent rounded-full animate-spin mr-2"></div>
            Loading...
          </div>
        ) : hasValidConnection ? (
          `₦${balanceInNgn}`
        ) : (
          '₦0.00'
        )}
      </div>
      <div className="text-base text-secondary flex items-center justify-center gap-2">
        <span>APT</span>
        {hasValidConnection && balance > 0 && (
          <span className="text-sm">
            ({balance.toFixed(4)} APT)
          </span>
        )}
      </div>
    </div>
  );
}
