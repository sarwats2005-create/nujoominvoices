import React, { useState, useMemo } from 'react';
import { useReturns, useSalesHistory } from '@/hooks/useRetail';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { RotateCcw, Search, X } from 'lucide-react';
import { format } from 'date-fns';

const Returns: React.FC = () => {
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
        sale_item_id: it.id,
        product_id: it.product_id,
        variant_id: it.variant_id,
        product_name: it.product_name,
        quantity: returnQtys[it.id],
        unit_price: Number(it.unit_price),
        refund_total: returnQtys[it.id] * Number(it.unit_price),
        restock: restock[it.id] !== false,
      }));
    if (items.length === 0) { toast({ title: 'Pick at least one item', variant: 'destructive' }); return; }
    const ret = await createReturn(selectedSale.id, selectedSale.customer_id, items, refundMethod, reason);
    if (ret) {
      toast({ title: 'Return processed', description: `Refund $${refundAmount.toFixed(2)}` });
      setOpenNew(false); setSelectedSale(null);
    } else { toast({ title: 'Return failed', variant: 'destructive' }); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10"><RotateCcw className="h-6 w-6 text-primary" /></div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Returns & Refunds</h1>
            <p className="text-sm text-muted-foreground">Process returns; auto-restock and refund</p>
          </div>
        </div>
        <Button onClick={() => setPickerOpen(true)} className="gap-2"><RotateCcw className="h-4 w-4" /> New Return</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Return #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-right">Items</TableHead>
                <TableHead className="text-right">Refunded</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              : returns.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No returns yet</TableCell></TableRow>
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

      {/* Sale picker */}
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Select Sale to Return</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search sale # or customer..." className="pl-10" />
            </div>
            <Table>
              <TableHeader><TableRow><TableHead>Sale #</TableHead><TableHead>Date</TableHead><TableHead>Customer</TableHead><TableHead className="text-right">Total</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>
                {salesLoading ? <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">Loading...</TableCell></TableRow>
                : filteredSales.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs">{s.sale_number}</TableCell>
                    <TableCell className="text-xs">{format(new Date(s.created_at), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{s.customer?.name || 'Walk-in'}</TableCell>
                    <TableCell className="text-right">${Number(s.total).toFixed(2)}</TableCell>
                    <TableCell><Button size="sm" variant="outline" onClick={() => startReturn(s)}>Return</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Return composer */}
      <Dialog open={openNew} onOpenChange={setOpenNew}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Process Return — {selectedSale?.sale_number}</DialogTitle></DialogHeader>
          {selectedSale && (
            <div className="space-y-4">
              <Table>
                <TableHeader><TableRow><TableHead>Item</TableHead><TableHead className="text-right">Sold</TableHead><TableHead className="text-right">Return Qty</TableHead><TableHead>Restock</TableHead></TableRow></TableHeader>
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
                  <Label>Refund Method</Label>
                  <Select value={refundMethod} onValueChange={v => setRefundMethod(v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="store_credit">Store Credit</SelectItem>
                      <SelectItem value="original">Original Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Refund Total</Label>
                  <div className="h-10 flex items-center px-3 bg-muted/30 rounded-md font-bold text-primary">${refundAmount.toFixed(2)}</div>
                </div>
              </div>

              <div className="space-y-1.5"><Label>Reason</Label><Textarea value={reason} onChange={e => setReason(e.target.value)} rows={2} placeholder="Reason for return..." /></div>

              <Button className="w-full" onClick={onSubmitReturn} disabled={refundAmount <= 0}>Process Return — Refund ${refundAmount.toFixed(2)}</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Returns;
