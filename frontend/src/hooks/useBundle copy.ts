// useBundle.ts - Custom hook for handling payments with Aptos wallet
// Refactored from Aptos/wagmi to Aptos ts-sdk + wallet-adapter-react
// Frontend builds, signs, and submits transaction to treasury, then calls backend with hash for confirmation (Nodit polling)
import { useState } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Aptos, AptosConfig, Network, AccountAddress } from '@aptos-labs/ts-sdk';
import { toast } from 'react-hot-toast';
import { initiatePayment } from '../services/apiService';
import { calculateAptosAmount, MINIMUM_OCTAS } from '../utils/currency';
import { withRetry } from '../utils/retry';

export const useBundle = () => {
  const { account, signAndSubmitTransaction } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  // Aptos client for transaction building (queries/network config)
  const config = new AptosConfig({ network: Network.TESTNET });
  const aptos = new Aptos(config);

  const executePayment = async (
    paymentType: 'bank' | 'airtime', 
    details: {
      amount: number;
      bankName?: string;
      accountNumber?: string;
      accountName?: string;
      phoneNumber?: string;
      network?: string;
    },
    onSuccess?: (transactionHash: string) => void,
    onError?: (error: string) => void
  ) => {
    if (!account) {
      toast.error('Wallet not connected');
      return;
    }

    setIsLoading(true);

    try {
      // Treasury address for Aptos (set in .env as VITE_TREASURY_ADDRESS)
      const treasuryAddress = import.meta.env.VITE_TREASURY_ADDRESS as string;
      
      if (!treasuryAddress) {
        throw new Error('Treasury address not configured');
      }

      const treasuryAddr = AccountAddress.from(treasuryAddress);

      // Calculate APTOS amount in octas (1 APT = 10^8 octas)
      // Mock rate in currency.ts; replace with real exchange API in production
      const aptosAmount = calculateAptosAmount(details.amount);
      let octasAmount = Math.floor(aptosAmount * 100_000_000); // Convert to octas
      // Ensure minimum amount in octas for reliable transaction (gas/reliability)
      const minOctas = parseFloat(MINIMUM_OCTAS) * 100_000_000;
      const finalOctas = octasAmount < minOctas ? minOctas : octasAmount;

      // Build simple transfer transaction to treasury (Aptos Coin module)
      // function: 0x1::aptos_coin::transfer - transfers APT
      // const transaction = await aptos.transaction.build.simple({
      //   sender: account.address,
      //   data: {
      //     function: "0x1::aptos_coin::transfer",
      //     typeArguments: [],
      //     functionArguments: [treasuryAddr, finalOctas.toString()],
      //   },
      // });

      // Sign and submit using wallet (user signs with Petra or other Aptos wallet)
      // signAndSubmitTransaction takes InputTransactionData with sender and data payload
      const pendingTxn = await signAndSubmitTransaction({ 
        sender: account.address.toString(),
        data: {
          function: "0x1::aptos_coin::transfer",
          typeArguments: [],
          functionArguments: [treasuryAddr.toString(), finalOctas.toString()],
        }
      });

      const hash = pendingTxn.hash;

      // Show transaction submitted toast
      toast.success('Transaction submitted! Waiting for confirmation...');

      // Wait for transaction to be confirmed client-side (optional; backend will poll Nodit)
      const finalTxn = await aptos.waitForTransaction({ transactionHash: hash });
      if (!finalTxn.success) {
        throw new Error(`Transaction failed on chain: ${finalTxn.vm_status || 'Unknown error'}`);
      }

      // Send hash to backend for further processing (fiat partner call) and Nodit confirmation
      // Backend will poll Nodit API to verify on-chain success
      await withRetry(
        async () => {
          await initiatePayment({ 
            transactionHash: hash, 
            userAddress: account.address.toString(),
            paymentType, 
            details 
          });
        },
        (error: any) => {
          // Extract meaningful error message from Axios error
          const backendError = error?.response?.data?.error || error?.message || 'Unknown error';
          return `Payment verification failed: ${backendError}`;
        }
      );

      toast.success('Payment completed successfully!');
      
      // Call success callback with transaction hash (for navigation to status page)
      if (onSuccess) {
        onSuccess(hash);
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      const errorMessage = error?.reason || error?.message || 'Payment failed: Unknown error';
      
      toast.error(errorMessage);
      
      // Call error callback (for navigation to failed status)
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { executePayment, isLoading };
};
