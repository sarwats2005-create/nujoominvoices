import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUnusedBL } from '@/hooks/useUnusedBL';
import { currencies } from '@/contexts/SettingsContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import SettingsBackedSelect from '@/components/SettingsBackedSelect';
import { CalendarIcon, Eye, CheckCircle, AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import type { UnusedBL, UseBLFormData } from '@/types/unusedBL';
import BLDetailViewer from './BLDetailViewer';

interface UseBLModalProps {
  record: UnusedBL;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface InvoiceEntry {
  id: string;
  usingFor: string;
  usedForBeneficiary: string;
  bank: string;
  invoiceAmount: string;
  currency: string;
  invoiceDate: Date | undefined;
  invoiceDateText: string;
  usedForManufacturer: string;
  dashboardId: string;
}

const createEmptyEntry = (): InvoiceEntry => ({
  id: crypto.randomUUID(),
  usingFor: '',
  usedForBeneficiary: '',
  bank: '',
  invoiceAmount: '',
  currency: 'USD',
  invoiceDate: undefined,
  invoiceDateText: '',
  usedForManufacturer: '',
  dashboardId: '',
});

const UseBLModal: React.FC<UseBLModalProps> = ({ record, open, onOpenChange }) => {
  const { t } = useLanguage();
  const { useBL, getUniqueOwners } = useUnusedBL();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [entries, setEntries] = useState<InvoiceEntry[]>([createEmptyEntry()]);
  const [dashboards, setDashboards] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const ownerOptions = getUniqueOwners();
  const hasOriginalData = record.original_used_data != null;

  useEffect(() => {
    const fetchDashboards = async () => {
      if (!user) return;
      const { data } = await supabase.from('bl_dashboards').select('id, name').eq('user_id', user.id);
      if (data) {
        setDashboards(data);
        if (data.length === 1) {
          setEntries(prev => prev.map(e => ({ ...e, dashboardId: e.dashboardId || data[0].id })));
        }
      }
    };
    if (open) {
      fetchDashboards();
      if (hasOriginalData && record.original_used_data) {
        const od = record.original_used_data;
        setEntries([{
          ...createEmptyEntry(),
          usingFor: od.used_for || '',
          usedForBeneficiary: od.used_for_beneficiary || '',
          bank: od.bank || '',
          currency: od.currency || 'USD',
          invoiceAmount: od.invoice_amount ? od.invoice_amount.toString() : '',
          dashboardId: od.dashboard_id || '',
          invoiceDate: od.invoice_date ? new Date(od.invoice_date) : undefined,
          invoiceDateText: od.invoice_date ? format(new Date(od.invoice_date), 'dd/MM/yyyy') : '',
          usedForManufacturer: '',
        }]);
      } else {
        setEntries([createEmptyEntry()]);
      }
    }
  }, [open, user, hasOriginalData]);

  const parseDateText = (text: string): Date | null => {
    const match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!match) return null;
    const d = new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
    return isNaN(d.getTime()) ? null : d;
  };

  const updateEntry = (id: string, field: keyof InvoiceEntry, value: any) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const handleDateText = (entryId: string, text: string) => {
    updateEntry(entryId, 'invoiceDateText', text);
    const d = parseDateText(text);
    if (d) updateEntry(entryId, 'invoiceDate', d);
  };

  const formatAmount = (value: string) => {
    const num = value.replace(/,/g, '');
    if (!num || isNaN(Number(num))) return value;
    return Number(num).toLocaleString();
  };

  const addEntry = () => {
    const last = entries[entries.length - 1];
    setEntries(prev => [...prev, {
      ...createEmptyEntry(),
      dashboardId: last?.dashboardId || '',
      bank: last?.bank || '',
      currency: last?.currency || 'USD',
    }]);
  };

  const removeEntry = (id: string) => {
    if (entries.length <= 1) return;
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const handleConfirm = async () => {
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      const num = i + 1;
      if (!e.usingFor.trim()) { setError(`Invoice #${num}: Customer name is required`); return; }
      if (!e.bank.trim()) { setError(`Invoice #${num}: Bank is required`); return; }
      if (!e.invoiceAmount || parseFloat(e.invoiceAmount.replace(/,/g, '')) <= 0) { setError(`Invoice #${num}: Valid amount required`); return; }
      if (!e.invoiceDate) { setError(`Invoice #${num}: Invoice date is required`); return; }
      if (!e.usedForManufacturer.trim()) { setError(`Invoice #${num}: Manufacturer is required`); return; }
      if (!e.dashboardId) { setError(`Invoice #${num}: Select a target dashboard`); return; }
    }

    setError('');
    setSubmitting(true);

    let allOk = true;
    for (const e of entries) {
      const ok = await useBL(record.id, {
        using_for: e.usingFor.trim().toUpperCase(),
        bank: e.bank.trim().toUpperCase(),
        invoice_amount: parseFloat(e.invoiceAmount.replace(/,/g, '')),
        currency: e.currency,
        invoice_date: format(e.invoiceDate!, 'yyyy-MM-dd'),
        used_for_manufacturer: e.usedForManufacturer.trim().toUpperCase(),
        used_for_beneficiary: e.usedForBeneficiary.trim().toUpperCase() || '',
        dashboard_id: e.dashboardId,
      });
      if (!ok) { allOk = false; break; }
    }

    setSubmitting(false);

    if (allOk) {
      toast({
        title: entries.length > 1 ? `${entries.length} invoices created for this B/L` : t('movedToUsedBL'),
        description: (
          <Button variant="outline" size="sm" onClick={() => navigate('/used-bl')} className="mt-2">
            {t('viewInUsedBL')}
          </Button>
        ),
      });
      onOpenChange(false);
    } else {
      setError('Failed to convert one or more invoices. Please try again.');
    }
  };

  return (
    <>
      <Dialog open={open && !showDetail} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" /> {t('useThisBL')}
              {record.status === 'USED' && (
                <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-xs ml-2">Adding Invoice</Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {/* Read-only summary */}
          <div className="bg-muted/30 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">B/L Summary</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowDetail(true)} className="gap-1.5 h-7">
                <Eye className="h-3.5 w-3.5" /> View Details
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-muted-foreground">B/L:</span> <span className="font-mono font-medium">{record.bl_no}</span></div>
              <div><span className="text-muted-foreground">Container:</span> <span className="font-mono">{record.container_no}</span></div>
              <div><span className="text-muted-foreground">Owner:</span> {record.owner}</div>
              <div><span className="text-muted-foreground">Category:</span> <Badge variant="secondary" className="text-xs">{record.product_category}</Badge></div>
              {record.received_date && (
                <div className="col-span-2"><span className="text-muted-foreground">Received:</span> {format(new Date(record.received_date), 'dd/MM/yyyy')}</div>
              )}
            </div>
          </div>

          {hasOriginalData && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-2 text-sm text-muted-foreground">
              ℹ️ Pre-filled from previous usage. Modify as needed.
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}

          {/* Invoice entries */}
          <div className="space-y-4">
            {entries.map((entry, idx) => (
              <div key={entry.id} className={`space-y-3 ${entries.length > 1 ? 'border-l-2 border-primary pl-4 pb-2' : ''}`}>
                {entries.length > 1 && (
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">Invoice #{idx + 1}</Badge>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeEntry(entry.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label>{t('usingFor')} (Customer) <span className="text-destructive">*</span></Label>
                  <SettingsBackedSelect presetType="used_for" value={entry.usingFor} onChange={v => updateEntry(entry.id, 'usingFor', v)} placeholder="Select customer" extraOptions={ownerOptions} />
                </div>

                <div className="space-y-1.5">
                  <Label>{t('beneficiary') || 'Used For Beneficiary'}</Label>
                  <SettingsBackedSelect presetType="beneficiary" value={entry.usedForBeneficiary} onChange={v => updateEntry(entry.id, 'usedForBeneficiary', v)} placeholder="Select beneficiary" />
                </div>

                <div className="space-y-1.5">
                  <Label>{t('bank')} <span className="text-destructive">*</span></Label>
                  <SettingsBackedSelect presetType="bank" value={entry.bank} onChange={v => updateEntry(entry.id, 'bank', v)} placeholder="Select bank" />
                </div>

                <div className="space-y-1.5">
                  <Label>{t('invoiceAmount')} <span className="text-destructive">*</span></Label>
                  <div className="flex gap-2">
                    <Select value={entry.currency} onValueChange={v => updateEntry(entry.id, 'currency', v)}>
                      <SelectTrigger className="w-[90px]"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-popover">
                        {currencies.map(c => <SelectItem key={c.code} value={c.code}>{c.symbol} {c.code}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Input value={formatAmount(entry.invoiceAmount)} onChange={e => updateEntry(entry.id, 'invoiceAmount', e.target.value.replace(/,/g, ''))} placeholder="0" type="text" inputMode="numeric" className="flex-1" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>{t('invoiceDate')} <span className="text-destructive">*</span></Label>
                  <div className="flex gap-1.5">
                    <Input value={entry.invoiceDateText} onChange={e => handleDateText(entry.id, e.target.value)} placeholder="DD/MM/YYYY" className="flex-1" />
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="icon"><CalendarIcon className="h-4 w-4" /></Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={entry.invoiceDate}
                          onSelect={d => { updateEntry(entry.id, 'invoiceDate', d); if (d) updateEntry(entry.id, 'invoiceDateText', format(d, 'dd/MM/yyyy')); }}
                          className="pointer-events-auto" />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>{t('usedForManufacturer')} <span className="text-destructive">*</span></Label>
                  <Input value={entry.usedForManufacturer} onChange={e => updateEntry(entry.id, 'usedForManufacturer', e.target.value)} placeholder="Company name used for" />
                </div>

                <div className="space-y-1.5">
                  <Label>{t('selectBLDashboardTarget')} <span className="text-destructive">*</span></Label>
                  <Select value={entry.dashboardId} onValueChange={v => updateEntry(entry.id, 'dashboardId', v)}>
                    <SelectTrigger><SelectValue placeholder="Select dashboard" /></SelectTrigger>
                    <SelectContent className="bg-popover">
                      {dashboards.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>

          {/* Add another invoice */}
          <Button variant="outline" onClick={addEntry} className="gap-2 w-full border-dashed">
            <Plus className="h-4 w-4" /> Add Another Invoice for this B/L
          </Button>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>{t('cancel')}</Button>
            <Button onClick={handleConfirm} disabled={submitting} className="gap-2">
              <CheckCircle className="h-4 w-4" /> {entries.length > 1 ? `Create ${entries.length} Invoices` : t('confirmUse')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {showDetail && (
        <BLDetailViewer record={record} open={showDetail} onOpenChange={setShowDetail} />
      )}
    </>
  );
};

export default UseBLModal;
