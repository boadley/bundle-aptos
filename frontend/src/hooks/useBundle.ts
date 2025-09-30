// useBundle.ts - Enhanced custom hook for handling payments with Aptos wallet
// Supports both standard wallet adapter and Petra mobile deep linking
// Frontend builds, signs, and submits transaction to treasury, then calls backend with hash for confirmation (Nodit polling)
import { useState, useEffect } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Aptos, AptosConfig, Network, AccountAddress } from '@aptos-labs/ts-sdk';
import { toast } from 'react-hot-toast';
import { initiatePayment } from '../services/apiService';
import { calculateAptosAmount, MINIMUM_OCTAS } from '../utils/currency';
import { withRetry } from '../utils/retry';
import { petraDeepLinkService, type PetraConnectionState } from '../services/petraDeepLinkService';

export const useBundle = () => {
  const { account, signAndSubmitTransaction } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [deepLinkState, setDeepLinkState] = useState<PetraConnectionState>({ isConnected: false });

  // Aptos client for transaction building (queries/network config)
  const config = new AptosConfig({ network: Network.TESTNET });
  const aptos = new Aptos(config);

  // Detect mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Subscribe to deep link state changes
  useEffect(() => {
    const unsubscribe = petraDeepLinkService.onStateChange(setDeepLinkState);
    setDeepLinkState(petraDeepLinkService.getConnectionState());
    return unsubscribe;
  }, []);

  // Listen for transaction completion from deep linking
  useEffect(() => {
    const handleTransactionSigned = (event: CustomEvent) => {
      console.log('Transaction signed via deep link:', event.detail);
      // The transaction hash will be in event.detail
      // We'll handle this in the executePayment function
    };

    window.addEventListener('petraTransactionSigned', handleTransactionSigned as EventListener);
    
    return () => {
      window.removeEventListener('petraTransactionSigned', handleTransactionSigned as EventListener);
    };
  }, []);

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
    // PRIORITY: Always use standard wallet adapter if account is connected
    // Only fall back to deep linking if on mobile without standard wallet connection
    if (!account && !deepLinkState.isConnected) {
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

      // ALWAYS prefer standard wallet adapter if available
      if (account && signAndSubmitTransaction) {
        // Standard wallet adapter flow (desktop and mobile with wallet extension/in-app browser)
        console.log('Using standard wallet adapter for transaction:', {
          sender: account.address.toString(),
          recipient: treasuryAddr.toString(),
          amount: finalOctas,
          function: "0x1::aptos_account::transfer"
        });

        const pendingTxn = await signAndSubmitTransaction({ 
          sender: account.address.toString(),
          data: {
            function: "0x1::aptos_account::transfer",
            typeArguments: [],
            functionArguments: [treasuryAddr.toString(), finalOctas.toString()],
          }
        });

        const hash = pendingTxn.hash;
        console.log('Transaction submitted successfully:', { hash });

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
      } else if (isMobile && deepLinkState.isConnected && deepLinkState.walletAddress) {
        // Deep linking flow (mobile without standard wallet adapter)
        console.log('Using deep linking for transaction:', {
          sender: deepLinkState.walletAddress,
          recipient: treasuryAddr.toString(),
          amount: finalOctas,
          function: "0x1::aptos_account::transfer"
        });

        const payload = {
          arguments: [treasuryAddr.toString(), finalOctas],
          function: '0x1::aptos_account::transfer',
          type: 'entry_function_payload',
          type_arguments: [],
        };

        // Set up promise to wait for transaction completion
        const transactionPromise = new Promise<string>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Transaction signing timeout'));
          }, 300000); // 5 minute timeout

          const handleTransactionSigned = (event: CustomEvent) => {
            clearTimeout(timeout);
            window.removeEventListener('petraTransactionSigned', handleTransactionSigned as EventListener);
            
            if (event.detail && event.detail.hash) {
              resolve(event.detail.hash);
            } else {
              reject(new Error('Transaction hash not received'));
            }
          };

          window.addEventListener('petraTransactionSigned', handleTransactionSigned as EventListener);
        });

        // Trigger deep link transaction
        await petraDeepLinkService.signAndSubmitTransaction(payload);
        
        // Wait for transaction to be signed
        const hash = await transactionPromise;
        console.log('Transaction submitted successfully via deep link:', { hash });

        // Show transaction submitted toast
        toast.success('Transaction submitted! Waiting for confirmation...');

        // Wait for transaction to be confirmed client-side
        const finalTxn = await aptos.waitForTransaction({ transactionHash: hash });
        if (!finalTxn.success) {
          throw new Error(`Transaction failed on chain: ${finalTxn.vm_status || 'Unknown error'}`);
        }

        // Send hash to backend for further processing
        await withRetry(
          async () => {
            await initiatePayment({ 
              transactionHash: hash, 
              userAddress: deepLinkState.walletAddress!,
              paymentType, 
              details 
            });
          },
          (error: any) => {
            const backendError = error?.response?.data?.error || error?.message || 'Unknown error';
            return `Payment verification failed: ${backendError}`;
          }
        );

        toast.success('Payment completed successfully!');
        
        if (onSuccess) {
          onSuccess(hash);
        }
      } else {
        throw new Error('No valid wallet connection method available');
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
