// Petra Deep Link Service
// Implements proper mobile-to-mobile deep linking for Petra wallet
// Based on official Petra documentation: https://petra.app/docs/mobile-deeplinks

import nacl from 'tweetnacl';
import { toast } from 'react-hot-toast';

// Deep Link Constants
const PETRA_LINK_BASE = 'petra://api/v1';
const DAPP_LINK_BASE = `${window.location.origin}/api/v1`;

// App Info - This will be shown to users in Petra wallet
const APP_INFO = {
  domain: window.location.origin,
  name: 'Bundle - Spend Crypto on Anything',
};

// Storage keys for secure key management
const STORAGE_KEYS = {
  SECRET_KEY: 'petra_secret_key',
  PUBLIC_KEY: 'petra_public_key',
  SHARED_KEY: 'petra_shared_key',
  CONNECTION_STATE: 'petra_connection_state'
} as const;

export interface PetraConnectionState {
  isConnected: boolean;
  walletAddress?: string;
  publicKey?: Uint8Array;
  secretKey?: Uint8Array;
  sharedKey?: Uint8Array;
}

export class PetraDeepLinkService {
  private connectionState: PetraConnectionState = {
    isConnected: false
  };

  private listeners: Array<(state: PetraConnectionState) => void> = [];

  constructor() {
    this.loadConnectionState();
    this.setupDeepLinkListener();
  }

  // Generate and save cryptographic key pair
  private generateAndSaveKeyPair() {
    const keyPair = nacl.box.keyPair();
    
    this.connectionState.secretKey = keyPair.secretKey;
    this.connectionState.publicKey = keyPair.publicKey;
    
    // Store keys securely (in production, consider more secure storage)
    localStorage.setItem(STORAGE_KEYS.SECRET_KEY, this.arrayToBase64(keyPair.secretKey));
    localStorage.setItem(STORAGE_KEYS.PUBLIC_KEY, this.arrayToBase64(keyPair.publicKey));
    
    return keyPair;
  }

  // Load connection state from storage
  private loadConnectionState() {
    try {
      const storedState = localStorage.getItem(STORAGE_KEYS.CONNECTION_STATE);
      const secretKey = localStorage.getItem(STORAGE_KEYS.SECRET_KEY);
      const publicKey = localStorage.getItem(STORAGE_KEYS.PUBLIC_KEY);
      const sharedKey = localStorage.getItem(STORAGE_KEYS.SHARED_KEY);

      if (storedState) {
        this.connectionState = JSON.parse(storedState);
      }

      if (secretKey) {
        this.connectionState.secretKey = this.base64ToArray(secretKey);
      }
      if (publicKey) {
        this.connectionState.publicKey = this.base64ToArray(publicKey);
      }
      if (sharedKey) {
        this.connectionState.sharedKey = this.base64ToArray(sharedKey);
      }
    } catch (error) {
      console.error('Failed to load connection state:', error);
      this.clearConnectionState();
    }
  }

  // Save connection state to storage
  private saveConnectionState() {
    try {
      const stateToSave = {
        isConnected: this.connectionState.isConnected,
        walletAddress: this.connectionState.walletAddress
      };
      localStorage.setItem(STORAGE_KEYS.CONNECTION_STATE, JSON.stringify(stateToSave));
      
      if (this.connectionState.sharedKey) {
        localStorage.setItem(STORAGE_KEYS.SHARED_KEY, this.arrayToBase64(this.connectionState.sharedKey));
      }
    } catch (error) {
      console.error('Failed to save connection state:', error);
    }
  }

  // Clear all connection data
  private clearConnectionState() {
    this.connectionState = { isConnected: false };
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  // Utility functions for base64 conversion
  private arrayToBase64(array: Uint8Array): string {
    return btoa(String.fromCharCode(...array));
  }

  private base64ToArray(base64: string): Uint8Array {
    return new Uint8Array(atob(base64).split('').map(char => char.charCodeAt(0)));
  }

  // Setup deep link listener for handling Petra responses
  private setupDeepLinkListener() {
    // Listen for URL changes (for web-based deep linking)
    window.addEventListener('popstate', this.handleUrlChange.bind(this));
    
    // Check initial URL on load
    this.handleUrlChange();
  }

  private handleUrlChange() {
    const url = window.location.href;
    const urlObject = new URL(url);
    
    // Check if this is a Petra response
    if (urlObject.pathname.startsWith('/api/v1/')) {
      this.handlePetraResponse(urlObject);
    }
  }

  private handlePetraResponse(urlObject: URL) {
    const params = new URLSearchParams(urlObject.search);
    
    switch (urlObject.pathname) {
      case '/api/v1/connect':
        this.handleConnectionResponse(params);
        break;
      case '/api/v1/response':
        this.handleTransactionResponse(params);
        break;
      case '/api/v1/disconnect':
        this.handleDisconnectionResponse();
        break;
      default:
        console.log('Unknown Petra response:', urlObject.pathname);
    }
  }

  private handleConnectionResponse(params: URLSearchParams) {
    const response = params.get('response');
    const data = params.get('data');

    if (response === 'approved') {
      this.handleConnectionApproval(data);
    } else {
      this.handleConnectionRejection();
    }
  }

  private handleConnectionApproval(data: string | null) {
    try {
      if (!data) {
        throw new Error('Missing data from Petra response');
      }

      if (!this.connectionState.secretKey) {
        throw new Error('Missing secret key');
      }

      const responseData = JSON.parse(atob(data));
      const { petraPublicEncryptedKey, address } = responseData;

      // Generate shared encryption key
      const publicKeyHex = petraPublicEncryptedKey.startsWith('0x') 
        ? petraPublicEncryptedKey.slice(2) 
        : petraPublicEncryptedKey;
      
      const sharedEncryptionSecretKey = nacl.box.before(
        this.base64ToArray(publicKeyHex),
        this.connectionState.secretKey
      );

      this.connectionState.sharedKey = sharedEncryptionSecretKey;
      this.connectionState.isConnected = true;
      this.connectionState.walletAddress = address;
      
      this.saveConnectionState();
      this.notifyListeners();

      toast.success('Successfully connected to Petra wallet!');
    } catch (error) {
      console.error('Connection approval failed:', error);
      toast.error('Failed to establish secure connection with Petra wallet');
      this.clearConnectionState();
    }
  }

  private handleConnectionRejection() {
    toast.error('Connection rejected by user');
    this.clearConnectionState();
    this.notifyListeners();
  }

  private handleTransactionResponse(params: URLSearchParams) {
    const response = params.get('response');
    const data = params.get('data');

    if (response === 'approved' && data) {
      try {
        const responseData = JSON.parse(atob(data));
        toast.success('Transaction signed successfully!');
        
        // Emit custom event for transaction completion
        window.dispatchEvent(new CustomEvent('petraTransactionSigned', {
          detail: responseData
        }));
      } catch (error) {
        console.error('Failed to parse transaction response:', error);
        toast.error('Failed to process transaction response');
      }
    } else {
      toast.error('Transaction rejected by user');
    }
  }

  private handleDisconnectionResponse() {
    this.clearConnectionState();
    this.notifyListeners();
    toast.success('Disconnected from Petra wallet');
  }

  // Public API methods

  // Connect to Petra wallet via deep link
  async connect(): Promise<void> {
    try {
      // Check if we're on mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (!isMobile) {
        throw new Error('Deep linking is only available on mobile devices');
      }

      const keyPair = this.generateAndSaveKeyPair();

      const data = {
        appInfo: APP_INFO,
        redirectLink: `${DAPP_LINK_BASE}/connect`,
        dappEncryptionPublicKey: this.arrayToBase64(keyPair.publicKey)
      };

      const deepLinkUrl = `${PETRA_LINK_BASE}/connect?data=${btoa(JSON.stringify(data))}`;
      
      toast('Opening Petra wallet...', {
        icon: '📱',
        duration: 2000,
      });

      // Open Petra app
      window.location.href = deepLinkUrl;
    } catch (error) {
      console.error('Connection failed:', error);
      toast.error('Failed to connect to Petra wallet');
      throw error;
    }
  }

  // Disconnect from Petra wallet
  async disconnect(): Promise<void> {
    try {
      if (!this.connectionState.publicKey) {
        throw new Error('No active connection to disconnect');
      }

      const data = {
        appInfo: APP_INFO,
        redirectLink: `${DAPP_LINK_BASE}/disconnect`,
        dappEncryptionPublicKey: this.arrayToBase64(this.connectionState.publicKey)
      };

      const deepLinkUrl = `${PETRA_LINK_BASE}/disconnect?data=${btoa(JSON.stringify(data))}`;
      
      // Clear local state immediately
      this.clearConnectionState();
      this.notifyListeners();

      // Open Petra app to complete disconnection
      window.location.href = deepLinkUrl;
    } catch (error) {
      console.error('Disconnection failed:', error);
      toast.error('Failed to disconnect from Petra wallet');
      throw error;
    }
  }

  // Sign and submit transaction via deep link
  async signAndSubmitTransaction(payload: any): Promise<void> {
    try {
      if (!this.connectionState.isConnected || !this.connectionState.sharedKey || !this.connectionState.publicKey) {
        throw new Error('Not connected to Petra wallet');
      }

      const nonce = nacl.randomBytes(24);
      
      // Encrypt the payload
      const encryptedPayload = nacl.box.after(
        Buffer.from(JSON.stringify(payload)),
        nonce,
        this.connectionState.sharedKey
      );

      const data = {
        appInfo: APP_INFO,
        payload: this.arrayToBase64(encryptedPayload),
        redirectLink: `${DAPP_LINK_BASE}/response`,
        dappEncryptionPublicKey: this.arrayToBase64(this.connectionState.publicKey),
        nonce: this.arrayToBase64(nonce)
      };

      const deepLinkUrl = `${PETRA_LINK_BASE}/signAndSubmit?data=${btoa(JSON.stringify(data))}`;
      
      toast('Opening Petra wallet to sign transaction...', {
        icon: '📱',
        duration: 2000,
      });

      // Open Petra app
      window.location.href = deepLinkUrl;
    } catch (error) {
      console.error('Transaction signing failed:', error);
      toast.error('Failed to sign transaction');
      throw error;
    }
  }

  // Get current connection state
  getConnectionState(): PetraConnectionState {
    return { ...this.connectionState };
  }

  // Subscribe to connection state changes
  onStateChange(listener: (state: PetraConnectionState) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener({ ...this.connectionState });
      } catch (error) {
        console.error('Error in state change listener:', error);
      }
    });
  }
}

// Export singleton instance
export const petraDeepLinkService = new PetraDeepLinkService();
