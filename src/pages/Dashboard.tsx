import React, { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useInvoice, Invoice } from '@/contexts/InvoiceContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Copy, FileText, ArrowUpDown, Trash2, Printer, Edit, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import EditInvoiceDialog from '@/components/EditInvoiceDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type SortKey = 'invoiceNumber' | 'amount' | 'date' | 'beneficiary' | 'bank' | 'status';

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const { invoices, updateInvoiceStatus, deleteInvoice, deleteMultipleInvoices } = useInvoice();
  const { toast } = useToast();
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const sortedInvoices = [...invoices].sort((a, b) => {
    let comparison = 0;
    if (sortKey === 'amount') comparison = a.amount - b.amount;
    else if (sortKey === 'date') comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
    else comparison = String(a[sortKey]).localeCompare(String(b[sortKey]));
    return sortAsc ? comparison : -comparison;
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const handleStatusChange = (id: string, checked: boolean) => {
    updateInvoiceStatus(id, checked ? 'received' : 'pending');
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? sortedInvoices.map(inv => inv.id) : []);
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds(prev => checked ? [...prev, id] : prev.filter(i => i !== id));
  };

  const handleDeleteSelected = () => {
    deleteMultipleInvoices(selectedIds);
    setSelectedIds([]);
    setShowDeleteDialog(false);
    toast({ title: t('invoicesDeleted') });
  };

  const handleDeleteSingle = (id: string) => {
    deleteInvoice(id);
    toast({ title: t('invoiceDeleted') });
  };

  const copyTableToClipboard = () => {
    const headers = [t('invoiceNumber'), t('invoiceAmount'), t('invoiceDate'), t('beneficiary'), t('bank'), t('status')];
    const rows = sortedInvoices.map(inv => [
      inv.invoiceNumber,
      inv.amount.toFixed(2),
      format(new Date(inv.date), 'yyyy-MM-dd'),
      inv.beneficiary,
      inv.bank,
      inv.status === 'received' ? t('received') : t('pending'),
    ]);
    const text = [headers, ...rows].map(row => row.join('\t')).join('\n');
    navigator.clipboard.writeText(text);
    toast({ title: t('tableCopied') });
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${t('allInvoices')}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #1e3a5f; color: white; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .received { background-color: #d4edda; }
          h1 { color: #1e3a5f; }
          @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <h1>${t('allInvoices')}</h1>
        <p>${t('printDate')}: ${format(new Date(), 'PPP')}</p>
        <table>
          <thead>
            <tr>
              <th>${t('invoiceNumber')}</th>
              <th>${t('invoiceAmount')}</th>
              <th>${t('invoiceDate')}</th>
              <th>${t('beneficiary')}</th>
              <th>${t('bank')}</th>
              <th>${t('status')}</th>
            </tr>
          </thead>
          <tbody>
            ${sortedInvoices.map(inv => `
              <tr class="${inv.status === 'received' ? 'received' : ''}">
                <td>${inv.invoiceNumber}</td>
                <td>${inv.amount.toFixed(2)}</td>
                <td>${format(new Date(inv.date), 'PPP')}</td>
                <td>${inv.beneficiary}</td>
                <td>${inv.bank}</td>
                <td>${inv.status === 'received' ? t('received') : t('pending')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const SortHeader = ({ label, sortKeyName }: { label: string; sortKeyName: SortKey }) => (
    <TableHead className="cursor-pointer hover:bg-accent/50" onClick={() => handleSort(sortKeyName)}>
      <div className="flex items-center gap-1">{label}<ArrowUpDown className="h-3 w-3" /></div>
    </TableHead>
  );

  const allSelected = sortedInvoices.length > 0 && selectedIds.length === sortedInvoices.length;

  return (
    <div className="animate-fade-in">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />{t('allInvoices')}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            {selectedIds.length > 0 && (
              <Button onClick={() => setShowDeleteDialog(true)} variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />{t('deleteSelected')} ({selectedIds.length})
              </Button>
            )}
            <Button onClick={handlePrint} variant="outline" size="sm" disabled={!invoices.length}>
              <Printer className="h-4 w-4 mr-2" />{t('print')}
            </Button>
            <Button onClick={copyTableToClipboard} variant="outline" size="sm" disabled={!invoices.length}>
              <Copy className="h-4 w-4 mr-2" />{t('copyTable')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">{t('noInvoices')}</p>
          ) : (
            <div className="overflow-x-auto" ref={printRef}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox checked={allSelected} onCheckedChange={handleSelectAll} />
                    </TableHead>
                    <TableHead className="w-12">{t('status')}</TableHead>
                    <SortHeader label={t('invoiceNumber')} sortKeyName="invoiceNumber" />
                    <SortHeader label={t('invoiceAmount')} sortKeyName="amount" />
                    <SortHeader label={t('invoiceDate')} sortKeyName="date" />
                    <SortHeader label={t('beneficiary')} sortKeyName="beneficiary" />
                    <SortHeader label={t('bank')} sortKeyName="bank" />
                    <TableHead>{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedInvoices.map((inv) => (
                    <TableRow key={inv.id} className={cn(inv.status === 'received' && 'bg-success/10')}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedIds.includes(inv.id)} 
                          onCheckedChange={(c) => handleSelectOne(inv.id, !!c)} 
                        />
                      </TableCell>
                      <TableCell>
                        <Checkbox checked={inv.status === 'received'} onCheckedChange={(c) => handleStatusChange(inv.id, !!c)} />
                      </TableCell>
                      <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                      <TableCell>{inv.amount.toFixed(2)}</TableCell>
                      <TableCell>{format(new Date(inv.date), 'PPP')}</TableCell>
                      <TableCell>{inv.beneficiary}</TableCell>
                      <TableCell>{inv.bank}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => setEditingInvoice(inv)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteSingle(inv.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <EditInvoiceDialog
        invoice={editingInvoice}
        open={!!editingInvoice}
        onOpenChange={(open) => !open && setEditingInvoice(null)}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {t('confirmDelete')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmDeleteMultiple').replace('{count}', selectedIds.length.toString())}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSelected} className="bg-destructive hover:bg-destructive/90">
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
