import React from 'react';
import { Wifi, WifiOff, CloudOff, RefreshCw, AlertCircle, Check } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function NetworkStatusIndicator() {
  const { isOnline, syncStatus, pendingActions, isSlowConnection } = useNetworkStatus();

  const getStatusIcon = () => {
    if (!isOnline) {
      return <WifiOff className="h-4 w-4" />;
    }
    
    switch (syncStatus) {
      case 'syncing':
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      case 'success':
        return <Check className="h-4 w-4" />;
      default:
        return isSlowConnection ? <CloudOff className="h-4 w-4" /> : <Wifi className="h-4 w-4" />;
    }
  };

  const getStatusColor = () => {
    if (!isOnline) return 'bg-destructive text-destructive-foreground';
    if (syncStatus === 'syncing') return 'bg-warning text-warning-foreground';
    if (syncStatus === 'error') return 'bg-destructive text-destructive-foreground';
    if (syncStatus === 'success') return 'bg-success text-success-foreground';
    if (isSlowConnection) return 'bg-warning text-warning-foreground';
    return 'bg-success text-success-foreground';
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline - Changes will sync when online';
    if (syncStatus === 'syncing') return 'Syncing changes...';
    if (syncStatus === 'error') return `Sync error - ${pendingActions} pending`;
    if (syncStatus === 'success') return 'All changes synced';
    if (pendingActions > 0) return `${pendingActions} changes pending`;
    if (isSlowConnection) return 'Slow connection';
    return 'Online';
  };

  // Don't show indicator if online with no issues
  if (isOnline && syncStatus === 'idle' && pendingActions === 0 && !isSlowConnection) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={cn(
              'fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 shadow-lg transition-all duration-300',
              getStatusColor()
            )}
          >
            {getStatusIcon()}
            <span className="text-xs font-medium">
              {!isOnline ? 'Offline' : syncStatus === 'syncing' ? 'Syncing...' : `${pendingActions} pending`}
            </span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p>{getStatusText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
