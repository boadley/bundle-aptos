// Petra Deep Link Service
// Implements proper mobile-to-mobile deep linking for Petra wallet
// Based on official Petra documentation: https://petra.app/docs/mobile-deeplinks
//
// FIXED: This implementation is updated to correctly use hex encoding for all
// cryptographic fields (public keys, nonces, payloads) as per the documentation.
// It also adds the missing `signMessage` functionality.

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
    this.notifyListeners();
  }

  // --- Encoding Utilities ---

  private arrayToBase64(array: Uint8Array): string {
    return btoa(String.fromCharCode(...array));
  }

  private base64ToArray(base64: string): Uint8Array {
    return new Uint8Array(atob(base64).split('').map(char => char.charCodeAt(0)));
  }

  // FIXED: Added a utility to convert Uint8Array to a hex string as required by Petra docs.
  private arrayToHex(array: Uint8Array): string {
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  private hexToArray(hex: string): Uint8Array {
    const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
    
    if (!/^[0-9a-fA-F]*$/.test(cleanHex) || cleanHex.length % 2 !== 0) {
      throw new Error(`Invalid hex string: ${hex}`);
    }
    
    const bytes = new Uint8Array(cleanHex.length / 2);
    for (let i = 0; i < cleanHex.length; i += 2) {
      bytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
    }
    return bytes;
  }

  // --- Deep Link Response Handling ---

  private setupDeepLinkListener() {
    window.addEventListener('popstate', this.handleUrlChange.bind(this));
    this.handleUrlChange();
  }

  private handleUrlChange() {
    const urlObject = new URL(window.location.href);
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
        console.warn('Unknown Petra response path:', urlObject.pathname);
    }
  }

  private handleConnectionResponse(params: URLSearchParams) {
    if (params.get('response') === 'approved') {
      this.handleConnectionApproval(params.get('data'));
    } else {
      this.handleConnectionRejection();
    }
  }

  private handleConnectionApproval(data: string | null) {
    try {
      if (!data) throw new Error('Missing data from Petra response');
      if (!this.connectionState.secretKey) throw new Error('Missing secret key');

      const responseData = JSON.parse(atob(data));
      const { petraPublicEncryptedKey, address } = responseData;

      if (!petraPublicEncryptedKey || !address) {
        throw new Error('Invalid data structure in Petra response');
      }

      // FIXED: The key from Petra should be in hex format. Decode it to bytes.
      const petraPublicKeyBytes = this.hexToArray(petraPublicEncryptedKey);
      
      const sharedEncryptionSecretKey = nacl.box.before(
        petraPublicKeyBytes,
        this.connectionState.secretKey
      );

      this.connectionState.sharedKey = sharedEncryptionSecretKey;
      this.connectionState.isConnected = true;
      this.connectionState.walletAddress = address;
      
      this.saveConnectionState();
      this.notifyListeners();

      toast.success('Successfully connected to Petra wallet!');
    } catch (error: any) {
      console.error('Connection approval failed:', error);
      toast.error(`Failed to connect with Petra: ${error?.message || 'Unknown error'}`);
      this.clearConnectionState();
    }
  }

  private handleConnectionRejection() {
    toast.error('Petra connection rejected by user.');
    this.clearConnectionState();
  }

  private handleTransactionResponse(params: URLSearchParams) {
    if (params.get('response') === 'approved' && params.get('data')) {
      try {
        const responseData = JSON.parse(atob(params.get('data')!));
        toast.success('Transaction signed successfully!');
        window.dispatchEvent(new CustomEvent('petraTransactionSigned', { detail: responseData }));
      } catch (error) {
        console.error('Failed to parse transaction response:', error);
        toast.error('Failed to process transaction response.');
      }
    } else {
      toast.error('Transaction rejected by user.');
    }
  }

  private handleDisconnectionResponse() {
    // State is already cleared locally when disconnect is called.
    toast.success('Disconnected from Petra wallet.');
  }

  // --- Public API Methods ---

  async connect(): Promise<void> {
    try {
      if (!/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        throw new Error('Petra deep linking is only available on mobile devices.');
      }

      const keyPair = this.generateAndSaveKeyPair();

      const data = {
        appInfo: APP_INFO,
        redirectLink: `${DAPP_LINK_BASE}/connect`,
        // FIXED: Use hex encoding for the public key as per documentation.
        dappEncryptionPublicKey: this.arrayToHex(keyPair.publicKey)
      };

      const deepLinkUrl = `${PETRA_LINK_BASE}/connect?data=${btoa(JSON.stringify(data))}`;
      
      toast('Opening Petra wallet...', { icon: '📱' });
      window.location.href = deepLinkUrl;
    } catch (error: any) {
      console.error('Connection failed:', error);
      toast.error(`Failed to connect: ${error?.message || 'Unknown error'}`);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (!this.connectionState.publicKey) {
        // Already disconnected or never connected, no action needed.
        this.clearConnectionState();
        return;
      }

      const data = {
        appInfo: APP_INFO,
        redirectLink: `${DAPP_LINK_BASE}/disconnect`,
        // FIXED: Use hex encoding for the public key.
        dappEncryptionPublicKey: this.arrayToHex(this.connectionState.publicKey)
      };

      const deepLinkUrl = `${PETRA_LINK_BASE}/disconnect?data=${btoa(JSON.stringify(data))}`;
      
      // Clear local state immediately.
      this.clearConnectionState();

      // Open Petra app to complete disconnection on the wallet side.
      window.location.href = deepLinkUrl;
    } catch (error: any) {
      console.error('Disconnection failed:', error);
      toast.error(`Failed to disconnect: ${error?.message || 'Unknown error'}`);
      throw error;
    }
  }

  async signAndSubmitTransaction(payload: object): Promise<void> {
    if (!this.connectionState.isConnected || !this.connectionState.sharedKey || !this.connectionState.publicKey) {
      throw new Error('Not connected to Petra wallet. Please connect first.');
    }

    try {
      const nonce = nacl.randomBytes(24);
      
      // The payload must be stringified before being converted to a Buffer for encryption.
      const payloadBytes = new TextEncoder().encode(JSON.stringify(payload));
      
      const encryptedPayload = nacl.box.after(
        payloadBytes,
        nonce,
        this.connectionState.sharedKey
      );

      const data = {
        appInfo: APP_INFO,
        // FIXED: Use hex encoding for payload, publicKey, and nonce.
        payload: this.arrayToHex(encryptedPayload),
        redirectLink: `${DAPP_LINK_BASE}/response`,
        dappEncryptionPublicKey: this.arrayToHex(this.connectionState.publicKey),
        nonce: this.arrayToHex(nonce)
      };

      const deepLinkUrl = `${PETRA_LINK_BASE}/signAndSubmit?data=${btoa(JSON.stringify(data))}`;
      
      toast('Opening Petra to sign transaction...', { icon: '✍️' });
      window.location.href = deepLinkUrl;
    } catch (error: any) {
      console.error('Transaction signing failed:', error);
      toast.error(`Transaction signing failed: ${error?.message || 'Unknown error'}`);
      throw error;
    }
  }

  // ADDED: Implemented the missing `signMessage` functionality.
  async signMessage(message: string): Promise<void> {
    if (!this.connectionState.isConnected || !this.connectionState.sharedKey || !this.connectionState.publicKey) {
        throw new Error('Not connected to Petra wallet. Please connect first.');
    }

    try {
        const nonce = nacl.randomBytes(24);
        const messageBytes = new TextEncoder().encode(message);

        const encryptedPayload = nacl.box.after(
            messageBytes,
            nonce,
            this.connectionState.sharedKey
        );

        const data = {
            appInfo: APP_INFO,
            // FIXED: Use hex encoding for all cryptographic fields.
            payload: this.arrayToHex(encryptedPayload),
            redirectLink: `${DAPP_LINK_BASE}/response`,
            dappEncryptionPublicKey: this.arrayToHex(this.connectionState.publicKey),
            nonce: this.arrayToHex(nonce)
        };

        const deepLinkUrl = `${PETRA_LINK_BASE}/signMessage?data=${btoa(JSON.stringify(data))}`;

        toast('Opening Petra to sign message...', { icon: '✍️' });
        window.location.href = deepLinkUrl;
    } catch (error: any) {
        console.error('Message signing failed:', error);
        toast.error(`Message signing failed: ${error?.message || 'Unknown error'}`);
        throw error;
    }
  }


  // --- State Management ---

  getConnectionState(): PetraConnectionState {
    return { ...this.connectionState };
  }

  onStateChange(listener: (state: PetraConnectionState) => void): () => void {
    this.listeners.push(listener);
    
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) this.listeners.splice(index, 1);
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

export const petraDeepLinkService = new PetraDeepLinkService();