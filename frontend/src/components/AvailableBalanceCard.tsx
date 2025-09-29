import { useState, useEffect } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Aptos, AptosConfig, Network} from '@aptos-labs/ts-sdk';
import { IoEyeOutline, IoEyeOffOutline, IoChevronForwardOutline } from 'react-icons/io5';

export default function AvailableBalanceCard() {
  const { account, connected } = useWallet();
  const [showBalance, setShowBalance] = useState(true);
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
  
  // Convert APT to NGN (mock rate: 1 APT = 1200 NGN)
  const aptToNgn = 1200;
  const balanceInNgn = (balance * aptToNgn).toFixed(2);
  
  const toggleBalanceVisibility = () => {
    setShowBalance(!showBalance);
  };

  return (
    <div className="bg-gradient-to-r from-accent/20 to-accent/10 rounded-2xl p-6 mb-6 border border-accent/20">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-white text-sm">Available Balance</span>
            <button
              onClick={toggleBalanceVisibility}
              className="text-white/70 hover:text-white transition-colors"
            >
              {showBalance ? (
                <IoEyeOutline className="w-4 h-4" />
              ) : (
                <IoEyeOffOutline className="w-4 h-4" />
              )}
            </button>
          </div>
          <div className="text-white text-3xl font-bold">
            {isLoading ? (
              <div className="flex items-center">
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Loading...
              </div>
            ) : showBalance ? (
              connected ? `₦${balanceInNgn}` : '₦0.00'
            ) : (
              '₦****'
            )}
          </div>
          {connected && balance > 0 && showBalance && (
            <div className="text-white/70 text-sm mt-1">
              {balance.toFixed(4)} APT
            </div>
          )}
        </div>
        
        <button className="flex items-center space-x-1 text-white/70 hover:text-white transition-colors">
          <span className="text-sm">Transaction History</span>
          <IoChevronForwardOutline className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
