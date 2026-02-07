import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useInvoice } from '@/contexts/InvoiceContext';
import { useSettings } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { parseDateString } from '@/lib/dateUtils';
import { Sheet, Cloud, Loader2, ExternalLink, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface ZapierSyncDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ZapierSyncDialog: React.FC<ZapierSyncDialogProps> = ({ open, onOpenChange }) => {
  const { t } = useLanguage();
  const { invoices, dashboards, currentDashboardId } = useInvoice();
  const { currency } = useSettings();
  const { toast } = useToast();
  const [webhookUrl, setWebhookUrl] = useState(() => {
    return localStorage.getItem('zapier_webhook_url') || '';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  const currentDashboard = dashboards.find(d => d.id === currentDashboardId);

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!webhookUrl) {
      toast({
        title: t('error'),
        description: t('zapierWebhookRequired'),
        variant: 'destructive',
      });
      return;
    }

    // Save webhook URL for future use
    localStorage.setItem('zapier_webhook_url', webhookUrl);

    setIsLoading(true);
    setSyncSuccess(false);

    try {
      // Prepare invoice data for Google Sheets
      const invoiceData = invoices.map(inv => ({
        invoice_number: inv.invoiceNumber,
        amount: inv.amount,
        amount_formatted: `${currency.symbol}${Math.round(inv.amount).toLocaleString()}`,
        date: format(parseDateString(inv.date), 'yyyy-MM-dd'),
        date_formatted: format(parseDateString(inv.date), 'dd/MM/yyyy'),
        beneficiary: inv.beneficiary,
        bank: inv.bank,
        container_number: inv.containerNumber || '',
        status: inv.status,
        dashboard_name: currentDashboard?.name || 'Default',
      }));

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors', // Handle CORS for Zapier webhooks
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          dashboard_name: currentDashboard?.name || 'Default',
          dashboard_id: currentDashboardId,
          total_invoices: invoices.length,
          total_amount: invoices.reduce((sum, inv) => sum + inv.amount, 0),
          invoices: invoiceData,
          triggered_from: window.location.origin,
        }),
      });

      // Since we're using no-cors, we won't get a proper response status
      setSyncSuccess(true);
      toast({
        title: t('syncSuccess'),
        description: t('syncSuccessDesc'),
      });
    } catch (error) {
      console.error('Error syncing to Zapier:', error);
      toast({
        title: t('error'),
        description: t('syncError'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <Sheet className="h-5 w-5 text-success" />
            </div>
            {t('syncToGoogleSheets')}
          </DialogTitle>
          <DialogDescription>
            {t('syncToGoogleSheetsDesc')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSync} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="webhookUrl" className="flex items-center gap-2">
              <Cloud className="h-4 w-4 text-muted-foreground" />
              {t('zapierWebhookUrl')}
            </Label>
            <Input
              id="webhookUrl"
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://hooks.zapier.com/hooks/catch/..."
              className="input-focus"
            />
            <p className="text-xs text-muted-foreground">
              {t('zapierWebhookHelp')}
            </p>
          </div>

          {/* How to setup guide */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              {t('howToSetupZapier')}
            </h4>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
              <li>{t('zapierStep1')}</li>
              <li>{t('zapierStep2')}</li>
              <li>{t('zapierStep3')}</li>
              <li>{t('zapierStep4')}</li>
            </ol>
          </div>

          {/* Sync info */}
          <div className="bg-primary/5 rounded-lg p-4">
            <p className="text-sm">
              <span className="font-medium">{t('willSync')}: </span>
              <span className="text-muted-foreground">
                {invoices.length} {t('invoicesFromDashboard')} "{currentDashboard?.name || 'Default'}"
              </span>
            </p>
          </div>

          {syncSuccess && (
            <div className="flex items-center gap-2 text-success bg-success/10 rounded-lg p-3">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-medium">{t('lastSyncSuccess')}</span>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !invoices.length}
              className="btn-glow"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('syncing')}
                </>
              ) : (
                <>
                  <Sheet className="h-4 w-4 mr-2" />
                  {t('syncNow')}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ZapierSyncDialog;
