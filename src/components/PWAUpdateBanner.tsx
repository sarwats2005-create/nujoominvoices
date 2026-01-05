import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { RefreshCw, X } from 'lucide-react';

const PWAUpdateBanner: React.FC = () => {
  const { t } = useLanguage();
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const handleUpdate = () => {
    updateServiceWorker(true);
  };

  const handleDismiss = () => {
    setNeedRefresh(false);
  };

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-16 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 animate-fade-in">
      <div className="bg-primary text-primary-foreground rounded-lg shadow-lg p-4">
        <div className="flex items-start gap-3">
          <RefreshCw className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">{t('updateAvailable')}</p>
            <p className="text-xs opacity-90 mt-1">{t('updateDescription')}</p>
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleUpdate}
                className="gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                {t('updateNow')}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="text-primary-foreground hover:text-primary-foreground/80 hover:bg-primary-foreground/10"
              >
                {t('later')}
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAUpdateBanner;
