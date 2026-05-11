import React, { useState, useMemo } from 'react';
import { usePurchaseOrders, useSuppliers } from '@/hooks/useRetail';
import { useProducts } from '@/hooks/useProducts';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ClipboardList, Plus, Trash2, Eye, PackageCheck, X } from 'lucide-react';
import { format } from 'date-fns';
import type { PurchaseOrder, PurchaseOrderItem } from '@/types/retail';

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  ordered: 'bg-blue-500/20 text-blue-500',
  partial: 'bg-amber-500/20 text-amber-500',
  received: 'bg-success/20 text-success',
  cancelled: 'bg-destructive/20 text-destructive',
};

const PurchaseOrders: React.FC = () => {
  const { orders, loading, createPO, receivePO, deletePO, updatePOStatus } = usePurchaseOrders();
  const { suppliers } = useSuppliers();
  const { products } = useProducts();
  const { toast } = useToast();

  const [openNew, setOpenNew] = useState(false);
  const [viewing, setViewing] = useState<PurchaseOrder | null>(null);
  const [supplierId, setSupplierId] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<Array<Partial<PurchaseOrderItem>>>([]);

  const reset = () => { setSupplierId(''); setExpectedDate(''); setNotes(''); setItems([]); };

  const addItem = () => setItems(prev => [...prev, { product_name: '', quantity_ordered: 1, unit_cost: 0 }]);
  const updateItem = (i: number, field: string, value: any) => {
    setItems(prev => prev.map((it, idx) => {
      if (idx !== i) return it;
      const next = { ...it, [field]: value };
      if (field === 'product_id') {
        const p = products.find(x => x.id === value);
        if (p) {
          next.product_name = p.name;
          next.variant_id = p.variants?.[0]?.id || null;
          next.unit_cost = p.cost_price || 0;
        }
      }
      return next;
    }));
  };
  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i));

  const total = useMemo(() => items.reduce((s, i) => s + (Number(i.quantity_ordered) || 0) * (Number(i.unit_cost) || 0), 0), [items]);

  const onSave = async () => {
    if (!supplierId || items.length === 0) { toast({ title: 'Pick supplier & at least one item', variant: 'destructive' }); return; }
    await createPO({ supplier_id: supplierId, expected_date: expectedDate || null, notes: notes || null, status: 'ordered' as any }, items);
    toast({ title: 'Purchase Order created' });
    setOpenNew(false); reset();
  };

  const onReceive = async (po: PurchaseOrder) => {
    if (!confirm(`Receive PO ${po.po_number}? Stock will be updated.`)) return;
    const ok = await receivePO(po);
    toast({ title: ok ? 'PO received & stock updated' : 'Failed', variant: ok ? 'default' : 'destructive' });
    setViewing(null);
  };

  const onDelete = async (id: string) => {
    if (!confirm('Delete this PO?')) return;
    await deletePO(id); toast({ title: 'PO deleted' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10"><ClipboardList className="h-6 w-6 text-primary" /></div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Purchase Orders</h1>
            <p className="text-sm text-muted-foreground">Order stock from suppliers and receive into inventory</p>
          </div>
        </div>
        <Button onClick={() => setOpenNew(true)} className="gap-2"><Plus className="h-4 w-4" /> New PO</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO #</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              : orders.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No purchase orders</TableCell></TableRow>
              : orders.map(po => (
                <TableRow key={po.id}>
                  <TableCell className="font-mono text-xs">{po.po_number}</TableCell>
                  <TableCell>{po.supplier?.name || '—'}</TableCell>
                  <TableCell className="text-xs">{format(new Date(po.order_date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell><Badge variant="secondary" className={STATUS_COLORS[po.status]}>{po.status}</Badge></TableCell>
                  <TableCell className="text-right">{po.items?.length || 0}</TableCell>
                  <TableCell className="text-right font-semibold">${po.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewing(po)}><Eye className="h-3.5 w-3.5" /></Button>
                      {po.status !== 'received' && po.status !== 'cancelled' && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-success" onClick={() => onReceive(po)} title="Receive"><PackageCheck className="h-3.5 w-3.5" /></Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(po.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* New PO */}
      <Dialog open={openNew} onOpenChange={(v) => { if (!v) reset(); setOpenNew(v); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New Purchase Order</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Supplier *</Label>
                <Select value={supplierId} onValueChange={setSupplierId}>
                  <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                  <SelectContent className="bg-popover">{suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Expected Date</Label><Input type="date" value={expectedDate} onChange={e => setExpectedDate(e.target.value)} /></div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Items</Label>
                <Button variant="outline" size="sm" onClick={addItem} className="gap-1"><Plus className="h-3 w-3" />Add Item</Button>
              </div>
              <div className="space-y-2">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 bg-muted/30 rounded-lg p-2">
                    <Select value={(item.product_id as string) || ''} onValueChange={v => updateItem(i, 'product_id', v)}>
                      <SelectTrigger className="flex-1 h-9"><SelectValue placeholder="Select product" /></SelectTrigger>
                      <SelectContent className="bg-popover">
                        {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Input type="number" min={1} value={item.quantity_ordered || ''} onChange={e => updateItem(i, 'quantity_ordered', Number(e.target.value))} placeholder="Qty" className="w-20 h-9" />
                    <Input type="number" step="0.01" value={item.unit_cost || ''} onChange={e => updateItem(i, 'unit_cost', Number(e.target.value))} placeholder="Cost" className="w-24 h-9" />
                    <span className="w-20 text-right text-sm font-medium">${((item.quantity_ordered || 0) * (item.unit_cost || 0)).toFixed(2)}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeItem(i)}><X className="h-3.5 w-3.5" /></Button>
                  </div>
                ))}
                {items.length === 0 && <p className="text-center text-sm text-muted-foreground py-3">No items yet</p>}
              </div>
            </div>

            <div className="space-y-1.5"><Label>Notes</Label><Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes" /></div>

            <div className="flex justify-between items-center pt-2 border-t">
              <span className="font-semibold">Total</span>
              <span className="text-xl font-bold text-primary">${total.toFixed(2)}</span>
            </div>

            <Button className="w-full" onClick={onSave} disabled={!supplierId || items.length === 0}>Create Purchase Order</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View PO */}
      <Dialog open={!!viewing} onOpenChange={() => setViewing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>PO {viewing?.po_number}</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Supplier:</span> <strong>{viewing.supplier?.name || '—'}</strong></div>
                <div><span className="text-muted-foreground">Status:</span> <Badge variant="secondary" className={STATUS_COLORS[viewing.status]}>{viewing.status}</Badge></div>
                <div><span className="text-muted-foreground">Order Date:</span> {format(new Date(viewing.order_date), 'dd/MM/yyyy')}</div>
                {viewing.expected_date && <div><span className="text-muted-foreground">Expected:</span> {format(new Date(viewing.expected_date), 'dd/MM/yyyy')}</div>}
                {viewing.received_date && <div><span className="text-muted-foreground">Received:</span> {format(new Date(viewing.received_date), 'dd/MM/yyyy')}</div>}
              </div>
              <Table>
                <TableHeader><TableRow><TableHead>Product</TableHead><TableHead className="text-right">Ordered</TableHead><TableHead className="text-right">Received</TableHead><TableHead className="text-right">Cost</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
                <TableBody>
                  {viewing.items?.map(it => (
                    <TableRow key={it.id}>
                      <TableCell>{it.product_name}</TableCell>
                      <TableCell className="text-right">{it.quantity_ordered}</TableCell>
                      <TableCell className="text-right">{it.quantity_received}</TableCell>
                      <TableCell className="text-right">${it.unit_cost.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${it.total.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {viewing.notes && <p className="text-sm text-muted-foreground">{viewing.notes}</p>}
              {viewing.status !== 'received' && viewing.status !== 'cancelled' && (
                <div className="flex gap-2">
                  <Button onClick={() => onReceive(viewing)} className="flex-1 gap-2"><PackageCheck className="h-4 w-4" />Receive Stock</Button>
                  <Button variant="outline" onClick={() => { updatePOStatus(viewing.id, 'cancelled'); setViewing(null); }}>Cancel PO</Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PurchaseOrders;
