import React, { useState, useMemo } from 'react';
import { useSuppliers } from '@/hooks/useRetail';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Truck, Plus, Search, Edit, Trash2, Phone, Mail } from 'lucide-react';
import type { Supplier } from '@/types/retail';

const Suppliers: React.FC = () => {
  const { t } = useLanguage();
  const { suppliers, loading, addSupplier, updateSupplier, deleteSupplier } = useSuppliers();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', notes: '' });

  const filtered = useMemo(() => suppliers.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.phone?.includes(search) || s.email?.includes(search)
  ), [suppliers, search]);

  const reset = () => { setForm({ name: '', phone: '', email: '', address: '', notes: '' }); setEditing(null); };

  const onEdit = (s: Supplier) => {
    setEditing(s);
    setForm({ name: s.name, phone: s.phone || '', email: s.email || '', address: s.address || '', notes: s.notes || '' });
    setOpen(true);
  };

  const onSave = async () => {
    if (!form.name.trim()) return;
    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      address: form.address.trim() || null,
      notes: form.notes.trim() || null,
    } as any;
    if (editing) { await updateSupplier(editing.id, payload); toast({ title: t('supplierUpdatedToast') }); }
    else { await addSupplier(payload); toast({ title: t('supplierAddedToast') }); }
    setOpen(false); reset();
  };

  const onDelete = async (id: string) => {
    if (!confirm(t('removeSupplierConfirm'))) return;
    await deleteSupplier(id); toast({ title: t('supplierRemovedToast') });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10"><Truck className="h-6 w-6 text-primary" /></div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('suppliers')}</h1>
            <p className="text-sm text-muted-foreground">{t('manageVendors')}</p>
          </div>
        </div>
        <Button onClick={() => { reset(); setOpen(true); }} className="gap-2"><Plus className="h-4 w-4" /> {t('addSupplier')}</Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('searchSuppliersPh')} className="pl-10" />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('nameLabel')}</TableHead>
                  <TableHead>{t('contactCol')}</TableHead>
                  <TableHead>{t('addressCol')}</TableHead>
                  <TableHead className="text-right">{t('balanceCol')}</TableHead>
                  <TableHead>{t('actionsCol')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">{t('loadingDots')}</TableCell></TableRow>
                : filtered.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">{t('noSuppliersYet')}</TableCell></TableRow>
                : filtered.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>
                      <div className="space-y-0.5 text-xs">
                        {s.phone && <div className="flex items-center gap-1 text-muted-foreground"><Phone className="h-3 w-3" />{s.phone}</div>}
                        {s.email && <div className="flex items-center gap-1 text-muted-foreground"><Mail className="h-3 w-3" />{s.email}</div>}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{s.address || '—'}</TableCell>
                    <TableCell className="text-right font-mono">${(s.balance || 0).toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(s)}><Edit className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(s.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); setOpen(v); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? t('editSupplierTitle') : t('addSupplierTitle')}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>{t('nameLabel')} *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder={t('supplierNamePh')} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>{t('phoneLabel')}</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>{t('emailLabel')}</Label><Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            </div>
            <div className="space-y-1.5"><Label>{t('addressLabel')}</Label><Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>{t('notesLabel')}</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
            <Button className="w-full" onClick={onSave} disabled={!form.name.trim()}>{editing ? t('saveChangesBtn') : t('addSupplier')}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Suppliers;
