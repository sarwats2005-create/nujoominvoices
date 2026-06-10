import React, { useState, useMemo } from 'react';
import { useReturns, useSalesHistory } from '@/hooks/useRetail';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { RotateCcw, Search } from 'lucide-react';
import { format } from 'date-fns';

const Returns: React.FC = () => {
  const { t } = useLanguage();
  const { returns, loading, createReturn } = useReturns();
  const { sales, loading: salesLoading } = useSalesHistory(200);
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [openNew, setOpenNew] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [returnQtys, setReturnQtys] = useState<Record<string, number>>({});
  const [restock, setRestock] = useState<Record<string, boolean>>({});
  const [refundMethod, setRefundMethod] = useState<'cash' | 'store_credit' | 'original'>('cash');
  const [reason, setReason] = useState('');

  const filteredSales = useMemo(() => sales.filter(s =>
    !search || s.sale_number?.toLowerCase().includes(search.toLowerCase()) || s.customer?.name?.toLowerCase().includes(search.toLowerCase())
  ).filter(s => s.status !== 'refunded'), [sales, search]);

  const startReturn = (sale: any) => {
    setSelectedSale(sale);
    const qtys: Record<string, number> = {};
    const rs: Record<string, boolean> = {};
    sale.items.forEach((i: any) => { qtys[i.id] = 0; rs[i.id] = true; });
    setReturnQtys(qtys); setRestock(rs); setReason('');
    setPickerOpen(false); setOpenNew(true);
  };

  const refundAmount = useMemo(() => {
    if (!selectedSale) return 0;
    return selectedSale.items.reduce((s: number, it: any) => s + (returnQtys[it.id] || 0) * Number(it.unit_price), 0);
  }, [selectedSale, returnQtys]);

  const onSubmitReturn = async () => {
    if (!selectedSale) return;
    const items = selectedSale.items
      .filter((it: any) => (returnQtys[it.id] || 0) > 0)
      .map((it: any) => ({
        sale_item_id: it.id, product_id: it.product_id, variant_id: it.variant_id,
        product_name: it.product_name, quantity: returnQtys[it.id],
        unit_price: Number(it.unit_price),
        refund_total: returnQtys[it.id] * Number(it.unit_price),
        restock: restock[it.id] !== false,
      }));
    if (items.length === 0) { toast({ title: t('pickAtLeastOneItem'), variant: 'destructive' }); return; }
    const ret = await createReturn(selectedSale.id, selectedSale.customer_id, items, refundMethod, reason);
    if (ret) {
      toast({ title: t('returnProcessedToast'), description: `${t('refund')} $${refundAmount.toFixed(2)}` });
      setOpenNew(false); setSelectedSale(null);
    } else { toast({ title: t('returnFailedToast'), variant: 'destructive' }); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10"><RotateCcw className="h-6 w-6 text-primary" /></div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('returnsRefunds')}</h1>
            <p className="text-sm text-muted-foreground">{t('processReturnsDesc')}</p>
          </div>
        </div>
        <Button onClick={() => setPickerOpen(true)} className="gap-2"><RotateCcw className="h-4 w-4" /> {t('newReturn')}</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('returnNumber')}</TableHead>
                <TableHead>{t('dateCol')}</TableHead>
                <TableHead>{t('methodCol')}</TableHead>
                <TableHead>{t('reasonCol')}</TableHead>
                <TableHead className="text-right">{t('itemsCol')}</TableHead>
                <TableHead className="text-right">{t('refundedCol')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{t('loadingDots')}</TableCell></TableRow>
              : returns.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{t('noReturnsYet')}</TableCell></TableRow>
              : returns.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{r.return_number}</TableCell>
                  <TableCell className="text-xs">{format(new Date(r.created_at), 'dd/MM/yyyy HH:mm')}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-xs">{r.refund_method}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{r.reason || '—'}</TableCell>
                  <TableCell className="text-right">{r.items?.length || 0}</TableCell>
                  <TableCell className="text-right font-semibold text-destructive">-${r.refund_amount.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{t('selectSaleToReturn')}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('searchSaleOrCustomer')} className="pl-10" />
            </div>
            <Table>
              <TableHeader><TableRow><TableHead>{t('saleNumCol')}</TableHead><TableHead>{t('dateCol')}</TableHead><TableHead>{t('customerCol')}</TableHead><TableHead className="text-right">{t('totalCol')}</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>
                {salesLoading ? <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">{t('loadingDots')}</TableCell></TableRow>
                : filteredSales.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs">{s.sale_number}</TableCell>
                    <TableCell className="text-xs">{format(new Date(s.created_at), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{s.customer?.name || t('walkIn')}</TableCell>
                    <TableCell className="text-right">${Number(s.total).toFixed(2)}</TableCell>
                    <TableCell><Button size="sm" variant="outline" onClick={() => startReturn(s)}>{t('returnBtn')}</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openNew} onOpenChange={setOpenNew}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{t('processReturnTitle')} — {selectedSale?.sale_number}</DialogTitle></DialogHeader>
          {selectedSale && (
            <div className="space-y-4">
              <Table>
                <TableHeader><TableRow><TableHead>{t('itemCol')}</TableHead><TableHead className="text-right">{t('soldCol')}</TableHead><TableHead className="text-right">{t('returnQtyCol')}</TableHead><TableHead>{t('restockCol')}</TableHead></TableRow></TableHeader>
                <TableBody>
                  {selectedSale.items.map((it: any) => (
                    <TableRow key={it.id}>
                      <TableCell>
                        <p className="font-medium text-sm">{it.product_name}</p>
                        <p className="text-xs text-muted-foreground">${Number(it.unit_price).toFixed(2)}</p>
                      </TableCell>
                      <TableCell className="text-right">{it.quantity}</TableCell>
                      <TableCell className="text-right">
                        <Input type="number" min={0} max={it.quantity} value={returnQtys[it.id] || 0}
                          onChange={e => setReturnQtys(q => ({ ...q, [it.id]: Math.max(0, Math.min(Number(it.quantity), Number(e.target.value))) }))}
                          className="w-20 h-8 text-right ml-auto" />
                      </TableCell>
                      <TableCell>
                        <input type="checkbox" checked={restock[it.id] !== false}
                          onChange={e => setRestock(r => ({ ...r, [it.id]: e.target.checked }))} className="h-4 w-4" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>{t('refundMethodLabel')}</Label>
                  <Select value={refundMethod} onValueChange={v => setRefundMethod(v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="cash">{t('cash')}</SelectItem>
                      <SelectItem value="store_credit">{t('storeCreditMethod')}</SelectItem>
                      <SelectItem value="original">{t('originalPaymentMethod')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>{t('refundTotalLabel')}</Label>
                  <div className="h-10 flex items-center px-3 bg-muted/30 rounded-md font-bold text-primary">${refundAmount.toFixed(2)}</div>
                </div>
              </div>

              <div className="space-y-1.5"><Label>{t('reasonCol')}</Label><Textarea value={reason} onChange={e => setReason(e.target.value)} rows={2} placeholder={t('reasonForReturnPh')} /></div>

              <Button className="w-full" onClick={onSubmitReturn} disabled={refundAmount <= 0}>{t('processReturnRefund')} ${refundAmount.toFixed(2)}</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Returns;
