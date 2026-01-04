import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAInstallState {
  canInstall: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  promptInstall: () => Promise<boolean>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

export function usePWAInstall(): PWAInstallState {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  const isIOS = typeof navigator !== 'undefined' && 
    /iPad|iPhone|iPod/.test(navigator.userAgent) && 
    !(window as Window & { MSStream?: unknown }).MSStream;

  useEffect(() => {
    // Check if already installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as Navigator & { standalone?: boolean }).standalone === true;
      setIsInstalled(isStandalone);
    };

    checkInstalled();

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e as BeforeInstallPromptEvent;
      setCanInstall(true);
    };

    // Listen for successful installation
    const handleAppInstalled = () => {
      deferredPrompt = null;
      setCanInstall(false);
      setIsInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        deferredPrompt = null;
        setCanInstall(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Install prompt error:', error);
      return false;
    }
  }, []);

  return {
    canInstall,
    isInstalled,
    isIOS,
    promptInstall,
  };
}
