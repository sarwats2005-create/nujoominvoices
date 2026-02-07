import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useInvoice, Invoice } from '@/contexts/InvoiceContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { format, addDays, isBefore, isAfter } from 'date-fns';
import { parseDateString } from '@/lib/dateUtils';
import { Hash, DollarSign, CalendarIcon, User, Landmark, Package, Clock, AlertTriangle } from 'lucide-react';

interface EditInvoiceDialogProps {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditInvoiceDialog: React.FC<EditInvoiceDialogProps> = ({ invoice, open, onOpenChange }) => {
  const { t } = useLanguage();
  const { banks, updateInvoice } = useInvoice();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    amount: '',
    currency: 'USD',
    date: '',
    invoiceNumber: '',
    beneficiary: '',
    bank: '',
    containerNumber: '',
    swiftDate: '',
  });

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
    { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
    { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
    { code: 'IQD', symbol: 'د.ع', name: 'Iraqi Dinar', flag: '🇮🇶' },
    { code: 'TRY', symbol: '₺', name: 'Turkish Lira', flag: '🇹🇷' },
    { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', flag: '🇸🇦' },
    { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', flag: '🇦🇪' },
    { code: 'RMB', symbol: '¥', name: 'Chinese Yuan', flag: '🇨🇳' },
  ];

  useEffect(() => {
    if (invoice) {
      setFormData({
        amount: invoice.amount.toString(),
        currency: invoice.currency || 'USD',
        date: format(parseDateString(invoice.date), 'yyyy-MM-dd'),
        invoiceNumber: invoice.invoiceNumber,
        beneficiary: invoice.beneficiary,
        bank: invoice.bank,
        containerNumber: invoice.containerNumber || '',
        swiftDate: invoice.swiftDate ? format(parseDateString(invoice.swiftDate), 'yyyy-MM-dd') : '',
      });
    }
  }, [invoice]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;

    updateInvoice(invoice.id, {
      amount: parseFloat(formData.amount),
      currency: formData.currency,
      date: formData.date,
      invoiceNumber: formData.invoiceNumber,
      beneficiary: formData.beneficiary,
      bank: formData.bank,
      containerNumber: formData.containerNumber || undefined,
      swiftDate: formData.swiftDate || undefined,
    });

    toast({ title: t('invoiceUpdated') });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card">
        <DialogHeader>
          <DialogTitle>{t('editInvoice')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber" className="flex items-center gap-2">
                <Hash className="h-3 w-3" />
                {t('invoiceNumber')}
              </Label>
              <Input
                id="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount" className="flex items-center gap-2">
                <DollarSign className="h-3 w-3" />
                {t('invoiceAmount')}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  className="flex-1"
                />
                <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                  <SelectTrigger className="w-28">
                    <SelectValue>
                      {(() => {
                        const curr = currencies.find(c => c.code === formData.currency);
                        return curr ? <span className="flex items-center gap-1"><span className="emoji-flag">{curr.flag}</span> {curr.symbol}</span> : formData.currency;
                      })()}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {currencies.map((curr) => (
                      <SelectItem key={curr.code} value={curr.code}>
                        <span className="flex items-center gap-2">
                          <span className="emoji-flag">{curr.flag}</span>
                          <span>{curr.symbol}</span>
                          <span className="text-muted-foreground">{curr.code}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <CalendarIcon className="h-3 w-3" />
                {t('invoiceDate')}
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank" className="flex items-center gap-2">
                <Landmark className="h-3 w-3" />
                {t('bank')}
              </Label>
              <Select value={formData.bank} onValueChange={(value) => setFormData({ ...formData, bank: value })}>
                <SelectTrigger>
                  <SelectValue placeholder={t('selectBank')} />
                </SelectTrigger>
                <SelectContent>
                  {banks.map((bank) => (
                    <SelectItem key={bank.id} value={bank.name}>
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="beneficiary" className="flex items-center gap-2">
                <User className="h-3 w-3" />
                {t('beneficiary')}
              </Label>
              <Input
                id="beneficiary"
                value={formData.beneficiary}
                onChange={(e) => setFormData({ ...formData, beneficiary: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="containerNumber" className="flex items-center gap-2">
                <Package className="h-3 w-3" />
                {t('containerNumber')}
              </Label>
              <Input
                id="containerNumber"
                value={formData.containerNumber}
                onChange={(e) => setFormData({ ...formData, containerNumber: e.target.value })}
                placeholder={t('optional')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="swiftDate" className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              {t('swiftDate')}
            </Label>
            <Input
              id="swiftDate"
              type="date"
              value={formData.swiftDate}
              onChange={(e) => setFormData({ ...formData, swiftDate: e.target.value })}
              placeholder={t('optional')}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit">{t('save')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditInvoiceDialog;