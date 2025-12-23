import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useInvoice } from '@/contexts/InvoiceContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { CalendarIcon, DollarSign, Hash, User, Plus, Landmark, LayoutDashboard, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import BankSelector from '@/components/BankSelector';
import DashboardSelector from '@/components/DashboardSelector';
import { MagicButton } from '@/components/MagicButton';
import { MagicCard } from '@/components/MagicCard';

const NewInvoice: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState<Date>();
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [beneficiary, setBeneficiary] = useState('');
  const [bank, setBank] = useState('');
  const [containerNumber, setContainerNumber] = useState('');
  const [dashboardId, setDashboardId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const { t } = useLanguage();
  const { addInvoice, dashboards, currentDashboardId } = useInvoice();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (currentDashboardId) {
      setDashboardId(currentDashboardId);
    } else if (dashboards.length > 0) {
      setDashboardId(dashboards[0].id);
    }
  }, [currentDashboardId, dashboards]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !date || !invoiceNumber || !beneficiary || !bank || !dashboardId) {
      toast({
        title: t('requiredField'),
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    addInvoice({
      amount: parseFloat(amount),
      date: date.toISOString(),
      invoiceNumber,
      beneficiary,
      bank,
      containerNumber: containerNumber || undefined,
      dashboardId,
    });

    toast({
      title: t('invoiceAdded'),
    });

    navigate('/dashboard');
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <MagicCard className="rounded-xl" glowColor="99, 102, 241">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              {t('newInvoice')}
            </CardTitle>
          </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dashboard Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                {t('selectDashboard')}
              </Label>
              <DashboardSelector value={dashboardId} onChange={setDashboardId} />
            </div>

            {/* Invoice Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                {t('invoiceAmount')}
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-10"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {/* Invoice Date */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                {t('invoiceDate')}
              </Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : <span>{t('invoiceDate')}</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => {
                      setDate(newDate);
                      setCalendarOpen(false);
                    }}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Invoice Number */}
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber" className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                {t('invoiceNumber')}
              </Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="invoiceNumber"
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="pl-10"
                  placeholder="INV-001"
                  required
                />
              </div>
            </div>

            {/* Container Number (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="containerNumber" className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                {t('containerNumber')}
                <span className="text-xs text-muted-foreground">({t('optional')})</span>
              </Label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="containerNumber"
                  type="text"
                  value={containerNumber}
                  onChange={(e) => setContainerNumber(e.target.value)}
                  className="pl-10"
                  placeholder="CONT-001"
                />
              </div>
            </div>

            {/* Beneficiary */}
            <div className="space-y-2">
              <Label htmlFor="beneficiary" className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                {t('beneficiary')}
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="beneficiary"
                  type="text"
                  value={beneficiary}
                  onChange={(e) => setBeneficiary(e.target.value)}
                  className="pl-10"
                  placeholder={t('beneficiary')}
                  required
                />
              </div>
            </div>

            {/* Bank */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Landmark className="h-4 w-4 text-muted-foreground" />
                {t('bank')}
              </Label>
              <BankSelector value={bank} onChange={setBank} />
            </div>

            <MagicButton type="submit" className="w-full" disabled={isSubmitting} glowColor="99, 102, 241">
              {t('submitInvoice')}
            </MagicButton>
          </form>
        </CardContent>
      </Card>
      </MagicCard>
    </div>
  );
};

export default NewInvoice;