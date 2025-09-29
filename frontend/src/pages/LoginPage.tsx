// LoginPage.tsx - App login page with wallet connection and PWA install prompt for mobile
// Refactored for Aptos-only; PWA button shown only on mobile at login (before wallet connect)
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import ConnectWalletButton from '../components/ConnectWalletButton';

// Simple abstract "B" logo component
function BundleLogo() {
  return (
    <div className="w-20 h-20 mb-12 flex items-center justify-center">
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Abstract "B" made of two overlapping shapes suggesting bundling/connection */}
        <path 
          d="M20 15 C20 10, 25 5, 35 5 L50 5 C60 5, 65 10, 65 20 C65 25, 62 28, 58 30 C62 32, 65 35, 65 40 C65 50, 60 55, 50 55 L35 55 C25 55, 20 50, 20 40 Z" 
          fill="#00F5D4" 
          opacity="0.9"
        />
        <path 
          d="M15 25 C15 20, 20 15, 30 15 L45 15 C55 15, 60 20, 60 30 C60 35, 57 38, 53 40 C57 42, 60 45, 60 50 C60 60, 55 65, 45 65 L30 65 C20 65, 15 60, 15 50 Z" 
          fill="#00F5D4" 
          opacity="0.6"
        />
      </svg>
    </div>
  );
}

// PWA Install Button Component
function PWAInstallButton({ onInstall }: { onInstall: () => void }) {
  return (
    <button
      onClick={onInstall}
      className="w-full mb-4 bg-accent text-black font-semibold py-3 px-6 rounded-lg hover:bg-accent/90 transition-colors"
    >
      📱 Install App
    </button>
  );
}

export default function LoginPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  // Detect mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

  useEffect(() => {
    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Show install button only on mobile devices
      if (isMobile) {
        setShowInstallButton(true);
      }
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setShowInstallButton(false);
      setDeferredPrompt(null);
      toast.success('App installed successfully!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if app is already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallButton(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isMobile]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      toast.error('Installation not available');
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      toast.success('Installing app...');
    } else {
      console.log('User dismissed the install prompt');
      toast('Installation cancelled');
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-4 text-white">
      <BundleLogo />
      <h2 className="text-2xl font-bold text-white mb-12 text-center max-w-md">
        Spend Crypto on <span className="text-accent">Anything</span> in <span className="text-accent">Nigeria</span>
      </h2>
      <div className="w-full max-w-sm">
        {/* Show PWA install button on mobile before wallet connection */}
        {showInstallButton && isMobile && (
          <PWAInstallButton onInstall={handleInstallClick} />
        )}
        <ConnectWalletButton />
      </div>
    </div>
  );
}
