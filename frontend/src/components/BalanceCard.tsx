import { useState, useEffect } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

export default function BalanceCard() {
  const { account, connected } = useWallet();
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Aptos client for balance queries
  const config = new AptosConfig({ network: Network.TESTNET });
  const aptos = new Aptos(config);
  
  // Fetch APT balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (!account || !connected) {
        setBalance(0);
        return;
      }
      
      setIsLoading(true);
      try {
        const balanceResponse = await aptos.getAccountAPTAmount({
          accountAddress: account.address,
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
  }, [account, connected, aptos]);
  
  // Format address to show truncated Aptos address
  const displayAddress = account ? 
    `${account.address.toString().slice(0, 6)}...${account.address.toString().slice(-4)}` : 
    "Not connected";
  
  // Convert APT to NGN equivalent (mock rate: 1 APT = 1200 NGN)
  const aptToNgn = 1200;
  const balanceInNgn = (balance * aptToNgn).toFixed(2);
  
  return (
    <div className="balance-card mb-8">
      <div className="text-sm text-secondary mb-2">
        {displayAddress}
      </div>
      <div className="text-4xl font-bold text-white mb-1">
        {isLoading ? (
          <div className="flex items-center">
            <div className="w-6 h-6 border-2 border-secondary border-t-accent rounded-full animate-spin mr-2"></div>
            Loading...
          </div>
        ) : connected ? (
          `₦${balanceInNgn}`
        ) : (
          '₦0.00'
        )}
      </div>
      <div className="text-base text-secondary flex items-center justify-center gap-2">
        <span>APT</span>
        {connected && balance > 0 && (
          <span className="text-sm">
            ({balance.toFixed(4)} APT)
          </span>
        )}
      </div>
    </div>
  );
}
