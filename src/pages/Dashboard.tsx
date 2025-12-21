import React, { useState, useRef, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useInvoice, Invoice } from '@/contexts/InvoiceContext';
import { useSettings } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Copy, FileText, ArrowUpDown, Trash2, Printer, Edit, AlertTriangle, LayoutDashboard, Search, Hash, DollarSign, CalendarIcon, User, Landmark, Package, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import EditInvoiceDialog from '@/components/EditInvoiceDialog';
import DashboardSelector from '@/components/DashboardSelector';
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

type SortKey = 'invoiceNumber' | 'amount' | 'date' | 'beneficiary' | 'bank' | 'status' | 'containerNumber';

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const { invoices, updateInvoiceStatus, deleteInvoice, deleteMultipleInvoices, dashboards, currentDashboardId, setCurrentDashboardId } = useInvoice();
  const { currency } = useSettings();
  const { toast } = useToast();
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  const currentDashboard = dashboards.find(d => d.id === currentDashboardId);

  const formatAmount = (amount: number) => `${currency.symbol}${Math.round(amount).toLocaleString()}`;

  const filteredInvoices = useMemo(() => {
    if (!searchQuery.trim()) return invoices;
    const query = searchQuery.toLowerCase();
    return invoices.filter(inv => 
      inv.invoiceNumber.toLowerCase().includes(query) ||
      inv.beneficiary.toLowerCase().includes(query) ||
      inv.bank.toLowerCase().includes(query) ||
      inv.amount.toString().includes(query) ||
      (inv.containerNumber && inv.containerNumber.toLowerCase().includes(query)) ||
      format(new Date(inv.date), 'yyyy-MM-dd').includes(query) ||
      (inv.status === 'received' ? t('received') : t('pending')).toLowerCase().includes(query)
    );
  }, [invoices, searchQuery, t]);

  const sortedInvoices = useMemo(() => {
    return [...filteredInvoices].sort((a, b) => {
      let comparison = 0;
      if (sortKey === 'amount') comparison = a.amount - b.amount;
      else if (sortKey === 'date') comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      else if (sortKey === 'containerNumber') comparison = (a.containerNumber || '').localeCompare(b.containerNumber || '');
      else comparison = String(a[sortKey]).localeCompare(String(b[sortKey]));
      return sortAsc ? comparison : -comparison;
    });
  }, [filteredInvoices, sortKey, sortAsc]);

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
    const rows = sortedInvoices.map(inv => [
      inv.invoiceNumber,
      formatAmount(inv.amount),
      format(new Date(inv.date), 'yyyy-MM-dd'),
      inv.beneficiary,
      inv.bank,
      inv.containerNumber || '',
      inv.status === 'received' ? t('received') : t('pending'),
    ]);
    const text = rows.map(row => row.join('\t')).join('\n');
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
        <title>${currentDashboard?.name || t('allInvoices')}</title>
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
        <h1>${currentDashboard?.name || t('allInvoices')}</h1>
        <p>${t('printDate')}: ${format(new Date(), 'PPP')}</p>
        <table>
          <thead>
            <tr>
              <th>${t('invoiceNumber')}</th>
              <th>${t('invoiceAmount')}</th>
              <th>${t('invoiceDate')}</th>
              <th>${t('beneficiary')}</th>
              <th>${t('bank')}</th>
              <th>${t('containerNumber')}</th>
              <th>${t('status')}</th>
            </tr>
          </thead>
          <tbody>
            ${sortedInvoices.map(inv => `
              <tr class="${inv.status === 'received' ? 'received' : ''}">
                <td>${inv.invoiceNumber}</td>
                <td>${formatAmount(inv.amount)}</td>
                <td>${format(new Date(inv.date), 'PPP')}</td>
                <td>${inv.beneficiary}</td>
                <td>${inv.bank}</td>
                <td>${inv.containerNumber || '-'}</td>
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

  const SortHeader = ({ label, sortKeyName, icon: Icon }: { label: string; sortKeyName: SortKey; icon: React.ElementType }) => (
    <TableHead className="cursor-pointer hover:bg-accent/50" onClick={() => handleSort(sortKeyName)}>
      <div className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {label}
        <ArrowUpDown className="h-3 w-3" />
      </div>
    </TableHead>
  );

  const allSelected = sortedInvoices.length > 0 && selectedIds.length === sortedInvoices.length;

  return (
    <div className="animate-fade-in space-y-4">
      {/* Dashboard Selector */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-2">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            <span className="font-medium">{t('selectDashboard')}</span>
          </div>
          <DashboardSelector 
            value={currentDashboardId || ''} 
            onChange={setCurrentDashboardId} 
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {currentDashboard?.name || t('allInvoices')}
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
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('searchInvoices')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {invoices.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">{t('noInvoices')}</p>
          ) : (
            <div className="overflow-x-auto border border-border rounded-md" ref={printRef}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox checked={allSelected} onCheckedChange={handleSelectAll} />
                    </TableHead>
                    <TableHead className="w-12">
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        {t('status')}
                      </div>
                    </TableHead>
                    <SortHeader label={t('invoiceNumber')} sortKeyName="invoiceNumber" icon={Hash} />
                    <SortHeader label={t('invoiceAmount')} sortKeyName="amount" icon={DollarSign} />
                    <SortHeader label={t('invoiceDate')} sortKeyName="date" icon={CalendarIcon} />
                    <SortHeader label={t('beneficiary')} sortKeyName="beneficiary" icon={User} />
                    <SortHeader label={t('bank')} sortKeyName="bank" icon={Landmark} />
                    <SortHeader label={t('containerNumber')} sortKeyName="containerNumber" icon={Package} />
                    <TableHead>{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedInvoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedIds.includes(inv.id)} 
                          onCheckedChange={(c) => handleSelectOne(inv.id, !!c)} 
                        />
                      </TableCell>
                      <TableCell className={cn(
                        "transition-colors",
                        inv.status === 'received' && 'bg-success/20'
                      )}>
                        <Checkbox 
                          checked={inv.status === 'received'} 
                          onCheckedChange={(c) => handleStatusChange(inv.id, !!c)} 
                        />
                      </TableCell>
                      <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                      <TableCell>{formatAmount(inv.amount)}</TableCell>
                      <TableCell>{format(new Date(inv.date), 'PPP')}</TableCell>
                      <TableCell>{inv.beneficiary}</TableCell>
                      <TableCell>{inv.bank}</TableCell>
                      <TableCell>{inv.containerNumber || '-'}</TableCell>
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