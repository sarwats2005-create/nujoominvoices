import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useUnusedBLSettings } from '@/hooks/useUnusedBLSettings';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Save, Plus, X, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { formatDateToString, parseDateString } from '@/lib/dateUtils';
import type { UsedBL, UsedBLInsert } from '@/types/usedBL';

interface UsedBLFormProps {
  initialData?: UsedBL | null;
  dashboardName?: string;
  onSubmit: (data: UsedBLInsert) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
  onSaveAndNew?: (data: UsedBLInsert) => Promise<{ success: boolean; error?: string }>;
  onDelete?: () => void;
  containerWarning?: boolean;
  onContainerCheck?: (containerNo: string) => void;
  isSubmitting?: boolean;
}

const UsedBLForm: React.FC<UsedBLFormProps> = ({
  initialData,
  dashboardName,
  onSubmit,
  onCancel,
  onSaveAndNew,
  onDelete,
  containerWarning = false,
  onContainerCheck,
  isSubmitting = false,
}) => {
  const { t } = useLanguage();
  const { blPresets } = useSettings();
  const { getByType } = useUnusedBLSettings();
  const ownerOptions = getByType('owner');
  const [blNo, setBlNo] = useState(initialData?.bl_no || '');
  const [containerNo, setContainerNo] = useState(initialData?.container_no || '');
  const [invoiceAmount, setInvoiceAmount] = useState(initialData?.invoice_amount?.toString() || '');
  const [invoiceDate, setInvoiceDate] = useState<Date | undefined>(
    initialData?.invoice_date ? parseDateString(initialData.invoice_date) : undefined
  );
  const [bank, setBank] = useState(initialData?.bank || '');
  const [owner, setOwner] = useState(initialData?.owner || '');
  const [usedFor, setUsedFor] = useState(initialData?.used_for || '');
  const [beneficiary, setBeneficiary] = useState(initialData?.used_for_beneficiary || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [customBank, setCustomBank] = useState('');
  const [customOwner, setCustomOwner] = useState('');
  const [customUsedFor, setCustomUsedFor] = useState('');
  const [customBeneficiary, setCustomBeneficiary] = useState('');
  const [showCustomBank, setShowCustomBank] = useState(false);
  const [showCustomOwner, setShowCustomOwner] = useState(false);
  const [showCustomUsedFor, setShowCustomUsedFor] = useState(false);
  const [showCustomBeneficiary, setShowCustomBeneficiary] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (containerNo && onContainerCheck) {
      onContainerCheck(containerNo);
    }
  }, [containerNo, onContainerCheck]);

  const buildFormData = (): UsedBLInsert | null => {
    const finalBank = showCustomBank ? customBank : bank;
    const finalOwner = showCustomOwner ? customOwner : owner;
    const finalUsedFor = showCustomUsedFor ? customUsedFor : usedFor;
    const finalBeneficiary = showCustomBeneficiary ? customBeneficiary : beneficiary;

    if (!blNo || !containerNo || !invoiceAmount || !invoiceDate || !finalBank || !finalOwner || !finalUsedFor) {
      setError(t('requiredField'));
      return null;
    }

    const amount = parseFloat(invoiceAmount.replace(/,/g, ''));
    if (isNaN(amount) || amount <= 0) {
      setError('Invalid amount');
      return null;
    }

    setError('');
    return {
      bl_no: blNo.toUpperCase(),
      container_no: containerNo.toUpperCase(),
      invoice_amount: amount,
      invoice_date: formatDateToString(invoiceDate),
      bank: finalBank.toUpperCase(),
      owner: finalOwner.toUpperCase(),
      used_for: finalUsedFor.toUpperCase(),
      used_for_beneficiary: finalBeneficiary ? finalBeneficiary.toUpperCase() : null,
      notes: notes || null,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = buildFormData();
    if (!data) return;

    const result = await onSubmit(data);
    if (!result.success) {
      if (result.error === 'duplicate_bl') {
        setError('This B/L number already exists!');
      } else {
        setError(result.error || 'Error saving record');
      }
    }
  };

  const handleSaveAndNew = async () => {
    if (!onSaveAndNew) return;
    const data = buildFormData();
    if (!data) return;

    const result = await onSaveAndNew(data);
    if (result.success) {
      // Reset form
      setBlNo('');
      setContainerNo('');
      setInvoiceAmount('');
      setInvoiceDate(undefined);
      setBank('');
      setOwner('');
      setUsedFor('');
      setNotes('');
      setError('');
    } else {
      if (result.error === 'duplicate_bl') {
        setError('This B/L number already exists!');
      } else {
        setError(result.error || 'Error saving record');
      }
    }
  };

  const formatDisplayAmount = (value: string) => {
    const num = value.replace(/,/g, '');
    if (!num || isNaN(Number(num))) return value;
    return Number(num).toLocaleString();
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-[hsl(var(--primary))] text-primary-foreground text-center py-4 px-6 rounded-t-xl">
        <h2 className="text-xl font-bold" dir="rtl">{dashboardName || 'حوالات محمد خاص'}</h2>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="border border-t-0 border-border rounded-b-xl overflow-hidden">
        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-2 text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        )}

        {/* B/L NO */}
        <div className="flex border-b border-border">
          <div className="w-2/5 bg-primary/10 px-4 py-3 font-semibold text-sm text-foreground border-r border-border flex items-center">
            B/L NO.
          </div>
          <div className="w-3/5 px-3 py-2">
            <Input
              value={blNo}
              onChange={(e) => setBlNo(e.target.value.toUpperCase())}
              placeholder="Enter B/L number"
              className="border-0 shadow-none focus-visible:ring-0 h-8 uppercase"
              required
            />
          </div>
        </div>

        {/* CONTAINER NO */}
        <div className="flex border-b border-border">
          <div className="w-2/5 bg-primary/10 px-4 py-3 font-semibold text-sm text-foreground border-r border-border flex items-center">
            CONTAINER NO.
          </div>
          <div className="w-3/5 px-3 py-2">
            <Input
              value={containerNo}
              onChange={(e) => setContainerNo(e.target.value.toUpperCase())}
              placeholder="Enter container number"
              className="border-0 shadow-none focus-visible:ring-0 h-8 uppercase"
              required
            />
            {containerWarning && (
              <p className="text-xs text-warning flex items-center gap-1 mt-1">
                <AlertTriangle className="h-3 w-3" /> Container already used
              </p>
            )}
          </div>
        </div>

        {/* INVOICE AMOUNT */}
        <div className="flex border-b border-border">
          <div className="w-2/5 bg-primary/10 px-4 py-3 font-semibold text-sm text-foreground border-r border-border flex items-center">
            INVOICE AMOUNT:
          </div>
          <div className="w-3/5 px-3 py-2">
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground font-bold">$</span>
              <Input
                value={formatDisplayAmount(invoiceAmount)}
                onChange={(e) => setInvoiceAmount(e.target.value.replace(/,/g, ''))}
                placeholder="0"
                type="text"
                inputMode="numeric"
                className="border-0 shadow-none focus-visible:ring-0 h-8"
                required
              />
            </div>
          </div>
        </div>

        {/* INVOICE DATE */}
        <div className="flex border-b border-border">
          <div className="w-2/5 bg-primary/10 px-4 py-3 font-semibold text-sm text-foreground border-r border-border flex items-center">
            INVOICE DATE:
          </div>
          <div className="w-3/5 px-3 py-2">
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start text-left font-normal h-8 px-0',
                    !invoiceDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {invoiceDate ? format(invoiceDate, 'dd/MM/yyyy') : 'Select date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-popover" align="start">
                <Calendar
                  mode="single"
                  selected={invoiceDate}
                  onSelect={(d) => { setInvoiceDate(d); setCalendarOpen(false); }}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* BANK */}
        <div className="flex border-b border-border">
          <div className="w-2/5 bg-primary/10 px-4 py-3 font-semibold text-sm text-foreground border-r border-border flex items-center">
            BANK:
          </div>
          <div className="w-3/5 px-3 py-2">
            {showCustomBank ? (
              <div className="flex items-center gap-1">
                <Input
                  value={customBank}
                  onChange={(e) => setCustomBank(e.target.value.toUpperCase())}
                  placeholder="Type bank name"
                  className="border-0 shadow-none focus-visible:ring-0 h-8 uppercase"
                />
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setShowCustomBank(false); setCustomBank(''); }}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Select value={bank} onValueChange={setBank}>
                  <SelectTrigger className="border-0 shadow-none focus:ring-0 h-8">
                    <SelectValue placeholder="Select bank" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {blPresets.banks.map(b => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => setShowCustomBank(true)} title="Type custom">
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* OWNER */}
        <div className="flex border-b border-border">
          <div className="w-2/5 bg-primary/10 px-4 py-3 font-semibold text-sm text-foreground border-r border-border flex items-center">
            OWNER:
          </div>
          <div className="w-3/5 px-3 py-2">
            {showCustomOwner ? (
              <div className="flex items-center gap-1">
                <Input
                  value={customOwner}
                  onChange={(e) => setCustomOwner(e.target.value.toUpperCase())}
                  placeholder="Type owner name"
                  className="border-0 shadow-none focus-visible:ring-0 h-8 uppercase"
                />
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setShowCustomOwner(false); setCustomOwner(''); }}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Select value={owner} onValueChange={setOwner}>
                  <SelectTrigger className="border-0 shadow-none focus:ring-0 h-8">
                    <SelectValue placeholder="Select owner" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {ownerOptions.map(o => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => setShowCustomOwner(true)} title="Type custom">
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* USED FOR */}
        <div className="flex border-b border-border">
          <div className="w-2/5 bg-primary/10 px-4 py-3 font-semibold text-sm text-foreground border-r border-border flex items-center">
            USED FOR:
          </div>
          <div className="w-3/5 px-3 py-2">
            {showCustomUsedFor ? (
              <div className="flex items-center gap-1">
                <Input
                  value={customUsedFor}
                  onChange={(e) => setCustomUsedFor(e.target.value.toUpperCase())}
                  placeholder="Type usage"
                  className="border-0 shadow-none focus-visible:ring-0 h-8 uppercase"
                />
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setShowCustomUsedFor(false); setCustomUsedFor(''); }}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Select value={usedFor} onValueChange={setUsedFor}>
                  <SelectTrigger className="border-0 shadow-none focus:ring-0 h-8">
                    <SelectValue placeholder="Select usage" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {blPresets.usedFor.map(u => (
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => setShowCustomUsedFor(true)} title="Type custom">
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* NOTES */}
        <div className="flex border-b border-border">
          <div className="w-2/5 bg-primary/10 px-4 py-3 font-semibold text-sm text-foreground border-r border-border flex items-start pt-4">
            NOTES:
          </div>
          <div className="w-3/5 px-3 py-2">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes..."
              className="border-0 shadow-none focus-visible:ring-0 min-h-[60px] resize-none"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-2 p-4 bg-muted/20 justify-center">
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            <Save className="h-4 w-4" />
            Save
          </Button>
          {onSaveAndNew && (
            <Button type="button" variant="secondary" disabled={isSubmitting} onClick={handleSaveAndNew} className="gap-2">
              <Plus className="h-4 w-4" />
              Save & New
            </Button>
          )}
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          {onDelete && (
            <Button type="button" variant="destructive" onClick={onDelete}>
              Delete
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default UsedBLForm;
