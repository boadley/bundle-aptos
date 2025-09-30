// Test page for Petra deep linking functionality
// This page allows testing the deep linking implementation

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { petraDeepLinkService, type PetraConnectionState } from '../services/petraDeepLinkService';
import { useBundle } from '../hooks/useBundle';

export default function TestDeepLinkPage() {
  const [connectionState, setConnectionState] = useState<PetraConnectionState>({ isConnected: false });
  const { executePayment, isLoading } = useBundle();

  // Subscribe to connection state changes
  useEffect(() => {
    const unsubscribe = petraDeepLinkService.onStateChange(setConnectionState);
    setConnectionState(petraDeepLinkService.getConnectionState());
    return unsubscribe;
  }, []);

  const handleConnect = async () => {
    try {
      await petraDeepLinkService.connect();
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await petraDeepLinkService.disconnect();
    } catch (error) {
      console.error('Disconnection failed:', error);
    }
  };

  const handleTestTransaction = async () => {
    try {
      await executePayment(
        'airtime',
        {
          amount: 1000, // 1000 NGN
          phoneNumber: '08012345678',
          network: 'MTN'
        },
        (hash) => {
          toast.success(`Transaction successful! Hash: ${hash.slice(0, 10)}...`);
        },
        (error) => {
          toast.error(`Transaction failed: ${error}`);
        }
      );
    } catch (error) {
      console.error('Test transaction failed:', error);
    }
  };

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Petra Deep Link Test</h1>
        
        {/* Device Info */}
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-2">Device Info</h2>
          <p>Platform: {isMobile ? 'Mobile' : 'Desktop'}</p>
          <p>User Agent: {navigator.userAgent.slice(0, 50)}...</p>
        </div>

        {/* Connection Status */}
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-2">Connection Status</h2>
          <p>Connected: {connectionState.isConnected ? 'Yes' : 'No'}</p>
          {connectionState.walletAddress && (
            <p>Address: {connectionState.walletAddress.slice(0, 10)}...{connectionState.walletAddress.slice(-6)}</p>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-4">
          {!connectionState.isConnected ? (
            <button
              onClick={handleConnect}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              disabled={!isMobile}
            >
              {isMobile ? 'Connect to Petra' : 'Mobile Only'}
            </button>
          ) : (
            <>
              <button
                onClick={handleDisconnect}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                Disconnect
              </button>
              
              <button
                onClick={handleTestTransaction}
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                {isLoading ? 'Processing...' : 'Test Transaction (1000 NGN)'}
              </button>
            </>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-gray-800 p-4 rounded-lg mt-6">
          <h2 className="text-lg font-semibold mb-2">Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Open this page on a mobile device</li>
            <li>Ensure Petra wallet is installed</li>
            <li>Click "Connect to Petra"</li>
            <li>Approve the connection in Petra app</li>
            <li>Return to this page to test transactions</li>
          </ol>
        </div>

        {/* Debug Info */}
        <div className="bg-gray-800 p-4 rounded-lg mt-6">
          <h2 className="text-lg font-semibold mb-2">Debug Info</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(connectionState, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
