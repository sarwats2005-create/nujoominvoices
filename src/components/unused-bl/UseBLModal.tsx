import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUnusedBL } from '@/hooks/useUnusedBL';
import { currencies } from '@/contexts/SettingsContext';
import { useBLPresets } from '@/hooks/useBLPresets';
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
import { CalendarIcon, Eye, CheckCircle, AlertTriangle, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import type { UnusedBL } from '@/types/unusedBL';
import BLDetailViewer from './BLDetailViewer';

interface UseBLModalProps {
  record: UnusedBL;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UseBLModal: React.FC<UseBLModalProps> = ({ record, open, onOpenChange }) => {
  const { t } = useLanguage();
  const { useBL, getUniqueOwners } = useUnusedBL();
  const { getByType, addPreset } = useBLPresets();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [usingFor, setUsingFor] = useState('');
  const [customUsingFor, setCustomUsingFor] = useState('');
  const [showCustomUsingFor, setShowCustomUsingFor] = useState(false);
  const [bank, setBank] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [invoiceDate, setInvoiceDate] = useState<Date | undefined>();
  const [invoiceDateText, setInvoiceDateText] = useState('');
  const [usedForManufacturer, setUsedForManufacturer] = useState('');
  const [usedForBeneficiary, setUsedForBeneficiary] = useState('');
  const [customBeneficiary, setCustomBeneficiary] = useState('');
  const [showCustomBeneficiary, setShowCustomBeneficiary] = useState(false);
  const [dashboardId, setDashboardId] = useState('');
  const [dashboards, setDashboards] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [customBank, setCustomBank] = useState('');
  const [showCustomBank, setShowCustomBank] = useState(false);

  const ownerOptions = getUniqueOwners();

  // Pre-fill from original_used_data if this B/L was previously reverted
  const hasOriginalData = record.original_used_data != null;

  useEffect(() => {
    const fetchDashboards = async () => {
      if (!user) return;
      const { data } = await supabase.from('bl_dashboards').select('id, name').eq('user_id', user.id);
      if (data) {
        setDashboards(data);
        if (data.length === 1) setDashboardId(data[0].id);
      }
    };
    if (open) {
      fetchDashboards();
      // Pre-fill from previous usage data
      if (hasOriginalData && record.original_used_data) {
        const od = record.original_used_data;
        setUsingFor(od.used_for || '');
        setUsedForBeneficiary(od.used_for_beneficiary || '');
        setBank(od.bank || '');
        setCurrency(od.currency || 'USD');
        if (od.invoice_amount) setInvoiceAmount(od.invoice_amount.toString());
        if (od.dashboard_id) setDashboardId(od.dashboard_id);
        if (od.invoice_date) {
          try {
            const d = new Date(od.invoice_date);
            setInvoiceDate(d);
            setInvoiceDateText(format(d, 'dd/MM/yyyy'));
          } catch {}
        }
      }
    }
  }, [open, user, hasOriginalData]);

  const parseDateText = (text: string): Date | null => {
    const match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!match) return null;
    const d = new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
    return isNaN(d.getTime()) ? null : d;
  };

  const handleDateText = (text: string) => {
    setInvoiceDateText(text);
    const d = parseDateText(text);
    if (d) setInvoiceDate(d);
  };

  const formatAmount = (value: string) => {
    const num = value.replace(/,/g, '');
    if (!num || isNaN(Number(num))) return value;
    return Number(num).toLocaleString();
  };

  const handleAddBeneficiary = async () => {
    if (!customBeneficiary.trim()) return;
    await addPreset('beneficiary', customBeneficiary.trim().toUpperCase());
    setUsedForBeneficiary(customBeneficiary.trim().toUpperCase());
    setCustomBeneficiary('');
    setShowCustomBeneficiary(false);
  };

  const handleConfirm = async () => {
    const finalBank = showCustomBank ? customBank : bank;
    const finalUsingFor = showCustomUsingFor ? customUsingFor : usingFor;
    const finalBeneficiary = showCustomBeneficiary ? customBeneficiary : usedForBeneficiary;
    
    if (!finalUsingFor.trim()) { setError('Customer name is required'); return; }
    if (!finalBank.trim()) { setError('Bank is required'); return; }
    if (!invoiceAmount || parseFloat(invoiceAmount) <= 0) { setError('Valid invoice amount is required'); return; }
    if (!invoiceDate) { setError('Invoice date is required'); return; }
    if (!usedForManufacturer.trim()) { setError('Used for manufacturer is required'); return; }
    if (!dashboardId) { setError('Please select a target dashboard'); return; }

    setError('');
    setSubmitting(true);
    const ok = await useBL(record.id, {
      using_for: finalUsingFor.trim().toUpperCase(),
      bank: finalBank.trim().toUpperCase(),
      invoice_amount: parseFloat(invoiceAmount.replace(/,/g, '')),
      currency,
      invoice_date: format(invoiceDate, 'yyyy-MM-dd'),
      used_for_manufacturer: usedForManufacturer.trim().toUpperCase(),
      used_for_beneficiary: finalBeneficiary.trim().toUpperCase() || '',
      dashboard_id: dashboardId,
    });
    setSubmitting(false);

    if (ok) {
      toast({
        title: t('movedToUsedBL'),
        description: (
          <Button variant="outline" size="sm" onClick={() => navigate('/used-bl')} className="mt-2">
            {t('viewInUsedBL')}
          </Button>
        ),
      });
      onOpenChange(false);
    } else {
      setError('Failed to convert. Please try again.');
    }
  };

  return (
    <>
      <Dialog open={open && !showDetail} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" /> {t('useThisBL')}
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

          {/* Conversion form */}
          <div className="space-y-4">
            {/* Customer Name (Using For) - lookup from owners */}
            <div className="space-y-1.5">
              <Label>{t('usingFor')} (Customer) <span className="text-destructive">*</span></Label>
              {showCustomUsingFor ? (
                <div className="flex gap-1.5">
                  <Input value={customUsingFor} onChange={e => setCustomUsingFor(e.target.value.toUpperCase())} placeholder="Type customer name" className="uppercase" />
                  <Button variant="ghost" size="icon" onClick={() => { setShowCustomUsingFor(false); setCustomUsingFor(''); }}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-1.5">
                  <Select value={usingFor} onValueChange={setUsingFor}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Select from owners" /></SelectTrigger>
                    <SelectContent className="bg-popover">
                      {ownerOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" onClick={() => setShowCustomUsingFor(true)} title="Add new">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Beneficiary - lookup from settings with add new */}
            <div className="space-y-1.5">
              <Label>{t('beneficiary') || 'Used For Beneficiary'}</Label>
              {showCustomBeneficiary ? (
                <div className="flex gap-1.5">
                  <Input value={customBeneficiary} onChange={e => setCustomBeneficiary(e.target.value.toUpperCase())} placeholder="Type beneficiary name" className="uppercase" />
                  <Button variant="outline" size="icon" onClick={handleAddBeneficiary} title="Add & Save">
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => { setShowCustomBeneficiary(false); setCustomBeneficiary(''); }}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-1.5">
                  <Select value={usedForBeneficiary} onValueChange={setUsedForBeneficiary}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Select beneficiary" /></SelectTrigger>
                    <SelectContent className="bg-popover">
                      {getByType('beneficiary').map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" onClick={() => setShowCustomBeneficiary(true)} title="Add new">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>{t('bank')} <span className="text-destructive">*</span></Label>
              {showCustomBank ? (
                <div className="flex gap-1.5">
                  <Input value={customBank} onChange={e => setCustomBank(e.target.value.toUpperCase())} placeholder="Type bank name" className="uppercase" />
                  <Button variant="ghost" size="icon" onClick={() => { setShowCustomBank(false); setCustomBank(''); }}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-1.5">
                  <Select value={bank} onValueChange={setBank}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Select bank" /></SelectTrigger>
                    <SelectContent className="bg-popover">
                      {getByType('bank').map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" onClick={() => setShowCustomBank(true)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>{t('invoiceAmount')} <span className="text-destructive">*</span></Label>
              <div className="flex gap-2">
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="w-[90px]"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover">
                    {currencies.map(c => (
                      <SelectItem key={c.code} value={c.code}>{c.symbol} {c.code}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input value={formatAmount(invoiceAmount)} onChange={e => setInvoiceAmount(e.target.value.replace(/,/g, ''))}
                  placeholder="0" type="text" inputMode="numeric" className="flex-1" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>{t('invoiceDate')} <span className="text-destructive">*</span></Label>
              <div className="flex gap-1.5">
                <Input value={invoiceDateText} onChange={e => handleDateText(e.target.value)} placeholder="DD/MM/YYYY" className="flex-1" />
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="icon"><CalendarIcon className="h-4 w-4" /></Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={invoiceDate}
                      onSelect={d => { setInvoiceDate(d); if (d) setInvoiceDateText(format(d, 'dd/MM/yyyy')); setCalendarOpen(false); }}
                      className="pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>{t('usedForManufacturer')} <span className="text-destructive">*</span></Label>
              <Input value={usedForManufacturer} onChange={e => setUsedForManufacturer(e.target.value)} placeholder="Company name used for" />
            </div>

            <div className="space-y-1.5">
              <Label>{t('selectBLDashboardTarget')} <span className="text-destructive">*</span></Label>
              <Select value={dashboardId} onValueChange={setDashboardId}>
                <SelectTrigger><SelectValue placeholder="Select dashboard" /></SelectTrigger>
                <SelectContent className="bg-popover">
                  {dashboards.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>{t('cancel')}</Button>
            <Button onClick={handleConfirm} disabled={submitting} className="gap-2">
              <CheckCircle className="h-4 w-4" /> {t('confirmUse')}
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
