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
import { Copy, FileText, ArrowUpDown, Trash2, Printer, Edit, AlertTriangle, LayoutDashboard, Search, Hash, DollarSign, CalendarIcon, User, Landmark, Package, CheckCircle, Upload, Download } from 'lucide-react';
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
  const { invoices, updateInvoiceStatus, deleteInvoice, deleteMultipleInvoices, dashboards, currentDashboardId, setCurrentDashboardId, addMultipleInvoices } = useInvoice();
  const { currency } = useSettings();
  const { toast } = useToast();
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const printRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      format(new Date(inv.date), 'dd/MM/yyyy').includes(query) ||
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
      format(new Date(inv.date), 'dd/MM/yyyy'),
      inv.beneficiary,
      inv.bank,
      inv.containerNumber || '',
      inv.status === 'received' ? t('received') : t('pending'),
    ]);
    const text = rows.map(row => row.join('\t')).join('\n');
    navigator.clipboard.writeText(text);
    toast({ title: t('tableCopied') });
  };

  const handleCSVImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentDashboardId) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        // Skip header row if it exists (check if first cell looks like a header)
        const startIndex = lines[0]?.toLowerCase().includes('invoice') ? 1 : 0;
        
        const newInvoices: Omit<Invoice, 'id' | 'userId' | 'status' | 'createdAt'>[] = [];
        
        for (let i = startIndex; i < lines.length; i++) {
          const cells = lines[i].split(',').map(cell => cell.trim().replace(/^"|"$/g, ''));
          if (cells.length >= 5) {
            newInvoices.push({
              invoiceNumber: cells[0] || '',
              amount: parseFloat(cells[1]?.replace(/[^0-9.-]/g, '')) || 0,
              date: cells[2] || new Date().toISOString(),
              beneficiary: cells[3] || '',
              bank: cells[4] || '',
              containerNumber: cells[5] || '',
              dashboardId: currentDashboardId,
            });
          }
        }
        
        if (newInvoices.length > 0) {
          addMultipleInvoices(newInvoices);
          toast({ title: t('csvImported'), description: `${newInvoices.length} invoices imported` });
        } else {
          toast({ title: t('csvImportError'), variant: 'destructive' });
        }
      } catch {
        toast({ title: t('csvImportError'), variant: 'destructive' });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleCSVExport = () => {
    const headers = ['Invoice Number', 'Amount', 'Date', 'Beneficiary', 'Bank', 'Container Number', 'Status'];
    const rows = sortedInvoices.map(inv => [
      inv.invoiceNumber,
      inv.amount.toString(),
      format(new Date(inv.date), 'dd/MM/yyyy'),
      inv.beneficiary,
      inv.bank,
      inv.containerNumber || '',
      inv.status,
    ]);
    
    const csv = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentDashboard?.name || 'invoices'}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: t('csvExported') });
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
                <td>${format(new Date(inv.date), 'dd/MM/yyyy')}</td>
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
    <TableHead 
      className="cursor-pointer hover:bg-accent/50 transition-colors duration-200 select-none" 
      onClick={() => handleSort(sortKeyName)}
    >
      <div className="flex items-center gap-2 font-semibold">
        <Icon className="h-4 w-4 text-primary" />
        <span>{label}</span>
        <ArrowUpDown className={cn(
          "h-3 w-3 transition-colors",
          sortKey === sortKeyName ? "text-primary" : "text-muted-foreground"
        )} />
      </div>
    </TableHead>
  );

  const allSelected = sortedInvoices.length > 0 && selectedIds.length === sortedInvoices.length;

  const totalAmount = sortedInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const receivedCount = sortedInvoices.filter(inv => inv.status === 'received').length;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-hover gradient-subtle border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">{t('totalInvoices')}</p>
                <p className="text-2xl font-bold">{sortedInvoices.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover gradient-subtle border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/10">
                <DollarSign className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">{t('totalAmount')}</p>
                <p className="text-2xl font-bold">{formatAmount(totalAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover gradient-subtle border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-warning/10">
                <CheckCircle className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">{t('received')}</p>
                <p className="text-2xl font-bold">{receivedCount} / {sortedInvoices.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard Selector */}
      <Card className="shadow-lg border-0 overflow-hidden">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <LayoutDashboard className="h-5 w-5 text-primary" />
            </div>
            <span className="font-semibold text-lg">{t('selectDashboard')}</span>
          </div>
          <DashboardSelector 
            value={currentDashboardId || ''} 
            onChange={setCurrentDashboardId} 
          />
        </CardContent>
      </Card>

      <Card className="shadow-lg border-0 overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-card to-muted/20 border-b">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl">{currentDashboard?.name || t('allInvoices')}</span>
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            {selectedIds.length > 0 && (
              <Button onClick={() => setShowDeleteDialog(true)} variant="destructive" size="sm" className="btn-glow">
                <Trash2 className="h-4 w-4 mr-2" />{t('deleteSelected')} ({selectedIds.length})
              </Button>
            )}
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              onChange={handleCSVImport}
              className="hidden"
            />
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              variant="outline" 
              size="sm"
              className="border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all"
            >
              <Upload className="h-4 w-4 mr-2" />{t('importCSV')}
            </Button>
            <Button 
              onClick={handleCSVExport} 
              variant="outline" 
              size="sm" 
              disabled={!invoices.length}
              className="border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all"
            >
              <Download className="h-4 w-4 mr-2" />{t('exportCSV')}
            </Button>
            <Button 
              onClick={handlePrint} 
              variant="outline" 
              size="sm" 
              disabled={!invoices.length}
              className="border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all"
            >
              <Printer className="h-4 w-4 mr-2" />{t('print')}
            </Button>
            <Button 
              onClick={copyTableToClipboard} 
              variant="outline" 
              size="sm" 
              disabled={!invoices.length}
              className="border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all"
            >
              <Copy className="h-4 w-4 mr-2" />{t('copyTable')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('searchInvoices')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-11 border-muted bg-muted/30 focus:bg-card input-focus rounded-xl"
              />
            </div>
          </div>

          {invoices.length === 0 ? (
            <div className="text-center py-16">
              <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-4">
                <FileText className="h-10 w-10 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-lg">{t('noInvoices')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border shadow-sm" ref={printRef}>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="w-12">
                      <Checkbox checked={allSelected} onCheckedChange={handleSelectAll} />
                    </TableHead>
                    <TableHead className="w-16">
                      <div className="flex items-center gap-2 font-semibold">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        {t('status')}
                      </div>
                    </TableHead>
                    <SortHeader label={t('invoiceNumber')} sortKeyName="invoiceNumber" icon={Hash} />
                    <SortHeader label={t('invoiceAmount')} sortKeyName="amount" icon={DollarSign} />
                    <SortHeader label={t('invoiceDate')} sortKeyName="date" icon={CalendarIcon} />
                    <SortHeader label={t('beneficiary')} sortKeyName="beneficiary" icon={User} />
                    <SortHeader label={t('bank')} sortKeyName="bank" icon={Landmark} />
                    <SortHeader label={t('containerNumber')} sortKeyName="containerNumber" icon={Package} />
                    <TableHead className="font-semibold">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedInvoices.map((inv, index) => (
                    <TableRow 
                      key={inv.id} 
                      className={cn(
                        "transition-all duration-200 hover:bg-muted/50",
                        index % 2 === 0 ? "bg-card" : "bg-muted/10"
                      )}
                    >
                      <TableCell>
                        <Checkbox 
                          checked={selectedIds.includes(inv.id)} 
                          onCheckedChange={(c) => handleSelectOne(inv.id, !!c)} 
                        />
                      </TableCell>
                      <TableCell className={cn(
                        "transition-all duration-300",
                        inv.status === 'received' && 'bg-success/15'
                      )}>
                        <Checkbox 
                          checked={inv.status === 'received'} 
                          onCheckedChange={(c) => handleStatusChange(inv.id, !!c)} 
                          className={cn(
                            inv.status === 'received' && "border-success data-[state=checked]:bg-success"
                          )}
                        />
                      </TableCell>
                      <TableCell className="font-semibold text-primary">{inv.invoiceNumber}</TableCell>
                      <TableCell className="font-medium">{formatAmount(inv.amount)}</TableCell>
                      <TableCell className="text-muted-foreground">{format(new Date(inv.date), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{inv.beneficiary}</TableCell>
                      <TableCell>{inv.bank}</TableCell>
                      <TableCell className="text-muted-foreground">{inv.containerNumber || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 hover:bg-primary/10 hover:text-primary transition-colors"
                            onClick={() => setEditingInvoice(inv)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 hover:bg-destructive/10 text-destructive transition-colors"
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
        <AlertDialogContent className="border-0 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              {t('confirmDelete')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              {t('confirmDeleteMultiple').replace('{count}', selectedIds.length.toString())}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-muted">{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSelected} className="bg-destructive hover:bg-destructive/90 btn-glow">
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;