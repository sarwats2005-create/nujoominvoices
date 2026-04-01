import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUsedBL } from '@/hooks/useUsedBL';
import { useAdmin } from '@/hooks/useAdmin';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { parseDateString } from '@/lib/dateUtils';
import { Plus, Search, ArrowUpDown, Trash2, Edit, Eye, Copy, Download, Upload, FileText, Archive, ArchiveRestore } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import BLDashboardSelector from '@/components/BLDashboardSelector';
import type { UsedBL } from '@/types/usedBL';

type SortKey = 'bl_no' | 'container_no' | 'invoice_amount' | 'invoice_date' | 'bank' | 'owner' | 'used_for' | 'used_for_beneficiary';

const UsedBLDashboard: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const {
    records, loading, softDeleteRecord, addMultipleRecords,
    archivedRecords, loadingArchived, archiveRecord, unarchiveRecord,
    blDashboards, currentBLDashboardId, currentDashboardName,
    setCurrentBLDashboardId, addBLDashboard,
  } = useUsedBL();
  const { isAdmin } = useAdmin();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('invoice_date');
  const [sortAsc, setSortAsc] = useState(false);
  const [bankFilter, setBankFilter] = useState<string | null>(null);
  const [ownerFilter, setOwnerFilter] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [archiveId, setArchiveId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkArchiveDialog, setShowBulkArchiveDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatAmount = (amount: number, curr?: string) => {
    const symbol = curr === 'EUR' ? '€' : curr === 'GBP' ? '£' : curr === 'IQD' ? 'د.ع' : curr === 'TRY' ? '₺' : curr === 'SAR' ? '﷼' : curr === 'AED' ? 'د.إ' : '$';
    return `${symbol}${Math.round(amount).toLocaleString()}`;
  };

  const uniqueBanks = useMemo(() => [...new Set(records.map(r => r.bank))].sort(), [records]);
  const uniqueOwners = useMemo(() => [...new Set(records.map(r => r.owner))].sort(), [records]);

  const filteredRecords = useMemo(() => {
    let result = records;
    if (bankFilter) result = result.filter(r => r.bank === bankFilter);
    if (ownerFilter) result = result.filter(r => r.owner === ownerFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r =>
        r.bl_no.toLowerCase().includes(q) ||
        r.container_no.toLowerCase().includes(q) ||
        r.bank.toLowerCase().includes(q) ||
        r.owner.toLowerCase().includes(q) ||
        r.used_for.toLowerCase().includes(q) ||
        (r.used_for_beneficiary || '').toLowerCase().includes(q) ||
        r.invoice_amount.toString().includes(q)
      );
    }
    return result;
  }, [records, searchQuery, bankFilter, ownerFilter]);

  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort((a, b) => {
      let comparison = 0;
      if (sortKey === 'invoice_amount') comparison = a.invoice_amount - b.invoice_amount;
      else if (sortKey === 'invoice_date') comparison = parseDateString(a.invoice_date).getTime() - parseDateString(b.invoice_date).getTime();
      else comparison = String(a[sortKey]).localeCompare(String(b[sortKey]));
      return sortAsc ? comparison : -comparison;
    });
  }, [filteredRecords, sortKey, sortAsc]);

  const totalAmount = useMemo(() => filteredRecords.reduce((sum, r) => sum + r.invoice_amount, 0), [filteredRecords]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const ok = await softDeleteRecord(deleteId);
    if (ok) toast({ title: 'Record deleted successfully' });
    setDeleteId(null);
  };

  const handleArchive = async () => {
    if (!archiveId) return;
    const ok = await archiveRecord(archiveId);
    if (ok) toast({ title: 'Record archived successfully' });
    setArchiveId(null);
  };

  const handleUnarchive = async (id: string) => {
    const ok = await unarchiveRecord(id);
    if (ok) toast({ title: 'Record restored from archive' });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === sortedRecords.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedRecords.map(r => r.id)));
    }
  };

  const handleBulkArchive = async () => {
    let archived = 0;
    for (const id of selectedIds) {
      const ok = await archiveRecord(id);
      if (ok) archived++;
    }
    toast({ title: `${archived} record${archived !== 1 ? 's' : ''} archived` });
    setSelectedIds(new Set());
    setShowBulkArchiveDialog(false);
  };

  // CSV parsing helper that handles quoted fields
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  };

  const handleCSVExport = () => {
    const headers = ['B/L NO', 'CONTAINER NO', 'INVOICE AMOUNT', 'INVOICE DATE', 'BANK', 'OWNER', 'USED FOR', 'NOTES'];
    const rows = sortedRecords.map(r => [
      r.bl_no, r.container_no, r.invoice_amount.toString(),
      format(parseDateString(r.invoice_date), 'dd/MM/yyyy'),
      r.bank, r.owner, r.used_for, r.notes || '',
    ]);
    const csv = [headers.join(','), ...rows.map(row => row.map(c => `"${c.replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentDashboardName || 'used-bl'}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'CSV exported' });
  };

  const handleCSVImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large (max 5MB)', variant: 'destructive' });
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(l => l.trim());
        const startIndex = lines[0]?.toLowerCase().includes('b/l') || lines[0]?.toLowerCase().includes('bl') ? 1 : 0;

        const newRecords = [];
        for (let i = startIndex; i < lines.length; i++) {
          const cells = parseCSVLine(lines[i]);
          if (cells.length >= 7) {
            const amount = parseFloat(cells[2]?.replace(/[^0-9.-]/g, '') || '0');
            if (isNaN(amount) || amount <= 0) continue;
            if (!cells[0] || !cells[1]) continue;

            // Parse date - try dd/MM/yyyy first, then ISO
            let dateStr = cells[3] || new Date().toISOString().split('T')[0];
            const ddmmMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
            if (ddmmMatch) {
              dateStr = `${ddmmMatch[3]}-${ddmmMatch[2].padStart(2, '0')}-${ddmmMatch[1].padStart(2, '0')}`;
            }

            newRecords.push({
              bl_no: cells[0].toUpperCase(),
              container_no: cells[1].toUpperCase(),
              invoice_amount: amount,
              invoice_date: dateStr,
              bank: (cells[4] || '').toUpperCase(),
              owner: (cells[5] || '').toUpperCase(),
              used_for: (cells[6] || '').toUpperCase(),
              notes: cells[7] || null,
            });
          }
        }

        if (newRecords.length > 0) {
          const result = await addMultipleRecords(newRecords);
          toast({ title: `Imported ${result.added} records (${result.skipped} skipped)` });
        } else {
          toast({ title: 'No valid data found', variant: 'destructive' });
        }
      } catch {
        toast({ title: 'Error importing CSV', variant: 'destructive' });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    doc.setFontSize(18);
    doc.setTextColor(30, 58, 95);
    doc.text(currentDashboardName || 'USED B/L COUNTING', 14, 15);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Total: ${sortedRecords.length} records | Sum: ${formatAmount(totalAmount)} | Date: ${format(new Date(), 'PPP')}`, 14, 22);

    autoTable(doc, {
      head: [['B/L NO', 'CONTAINER NO', 'AMOUNT', 'DATE', 'BANK', 'OWNER', 'USED FOR']],
      body: sortedRecords.map(r => [
        r.bl_no, r.container_no, formatAmount(r.invoice_amount),
        format(parseDateString(r.invoice_date), 'dd/MM/yyyy'),
        r.bank, r.owner, r.used_for,
      ]),
      startY: 28,
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [30, 58, 95], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [249, 249, 249] },
    });
    doc.save(`${currentDashboardName || 'used-bl'}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    toast({ title: 'PDF exported' });
  };

  const SortHeader = ({ label, sortKeyName }: { label: string; sortKeyName: SortKey }) => (
    <TableHead className="cursor-pointer hover:bg-accent/50 transition-colors select-none" onClick={() => handleSort(sortKeyName)}>
      <div className="flex items-center gap-1 font-semibold text-xs sm:text-sm">
        <span>{label}</span>
        <ArrowUpDown className={cn("h-3 w-3", sortKey === sortKeyName ? "text-primary" : "text-muted-foreground")} />
      </div>
    </TableHead>
  );

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-4 sm:space-y-6 px-1 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">{currentDashboardName || 'USED B/L COUNTING'}</h1>
          <Badge variant="secondary" className="text-sm font-bold">{records.length}</Badge>
        </div>
        <Button onClick={() => navigate('/used-bl/new')} className="gap-2">
          <Plus className="h-4 w-4" /> New Entry
        </Button>
      </div>

      {/* Dashboard Selector */}
      <BLDashboardSelector
        dashboards={blDashboards}
        currentDashboardId={currentBLDashboardId}
        onSelect={setCurrentBLDashboardId}
        onAdd={addBLDashboard}
      />

      {/* Search + Filters */}
      <Card>
        <CardContent className="p-3 sm:p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search B/L, container, owner, bank..."
              className="pl-10"
            />
          </div>

          {uniqueBanks.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs text-muted-foreground self-center mr-1">Bank:</span>
              <Badge variant={bankFilter === null ? "default" : "outline"} className="cursor-pointer text-xs" onClick={() => setBankFilter(null)}>All</Badge>
              {uniqueBanks.map(b => (
                <Badge key={b} variant={bankFilter === b ? "default" : "outline"} className="cursor-pointer text-xs" onClick={() => setBankFilter(bankFilter === b ? null : b)}>{b}</Badge>
              ))}
            </div>
          )}

          {uniqueOwners.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs text-muted-foreground self-center mr-1">Owner:</span>
              <Badge variant={ownerFilter === null ? "default" : "outline"} className="cursor-pointer text-xs" onClick={() => setOwnerFilter(null)}>All</Badge>
              {uniqueOwners.map(o => (
                <Badge key={o} variant={ownerFilter === o ? "default" : "outline"} className="cursor-pointer text-xs" onClick={() => setOwnerFilter(ownerFilter === o ? null : o)}>{o}</Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleCSVImport} />
        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="gap-1.5">
          <Upload className="h-4 w-4" /> Import CSV
        </Button>
        <Button variant="outline" size="sm" onClick={handleCSVExport} className="gap-1.5">
          <Download className="h-4 w-4" /> Export CSV
        </Button>
        <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-1.5">
          <FileText className="h-4 w-4" /> Export PDF
        </Button>
      </div>

      {/* Bulk Archive Bar */}
      {selectedIds.size > 0 && (
        <Card>
          <CardContent className="p-3 flex items-center justify-between">
            <span className="text-sm font-medium">{selectedIds.size} record{selectedIds.size !== 1 ? 's' : ''} selected</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedIds(new Set())}>Clear</Button>
              <Button size="sm" className="gap-1.5" onClick={() => setShowBulkArchiveDialog(true)}>
                <Archive className="h-4 w-4" /> Archive Selected
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={sortedRecords.length > 0 && selectedIds.size === sortedRecords.length}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <SortHeader label="B/L NO" sortKeyName="bl_no" />
                  <SortHeader label="CONTAINER NO" sortKeyName="container_no" />
                  <SortHeader label="AMOUNT" sortKeyName="invoice_amount" />
                  <SortHeader label="DATE" sortKeyName="invoice_date" />
                  <SortHeader label="BANK" sortKeyName="bank" />
                  <SortHeader label="OWNER" sortKeyName="owner" />
                  <SortHeader label="CUSTOMER" sortKeyName="used_for" />
                  <SortHeader label="BENEFICIARY" sortKeyName="used_for_beneficiary" />
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                      {searchQuery ? 'No matching records' : 'No records yet. Click "New Entry" to add your first B/L record.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedRecords.map((record) => (
                    <TableRow key={record.id} className="cursor-pointer hover:bg-accent/30 transition-colors" onClick={() => navigate(`/used-bl/${record.id}`)}>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.has(record.id)}
                          onCheckedChange={() => toggleSelect(record.id)}
                        />
                      </TableCell>
                      <TableCell className="font-mono font-medium text-xs sm:text-sm">{record.bl_no}</TableCell>
                      <TableCell className="font-mono text-xs sm:text-sm">{record.container_no}</TableCell>
                      <TableCell className="font-semibold text-xs sm:text-sm">{formatAmount(record.invoice_amount)}</TableCell>
                      <TableCell className="text-xs sm:text-sm">{format(parseDateString(record.invoice_date), 'dd/MM/yyyy')}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{record.bank}</Badge></TableCell>
                      <TableCell className="text-xs sm:text-sm">{record.owner}</TableCell>
                      <TableCell className="text-xs sm:text-sm">{record.used_for}</TableCell>
                      <TableCell className="text-xs sm:text-sm">{(record as any).used_for_beneficiary || '—'}</TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate(`/used-bl/${record.id}`)}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate(`/used-bl/${record.id}/edit`)}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={() => setArchiveId(record.id)} title="Archive">
                            <Archive className="h-3.5 w-3.5" /> Archive
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteId(record.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate('/used-bl/new', { state: { duplicate: record } })}>
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {sortedRecords.length > 0 && (
            <div className="border-t border-border px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-muted/30">
              <span className="text-sm text-muted-foreground">
                Showing {sortedRecords.length} of {records.length} records
              </span>
              <span className="text-sm font-bold text-foreground">
                Total: {formatAmount(totalAmount)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Archived Section */}
      <Card>
        <CardContent className="p-0">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Archive className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold text-sm text-foreground">Archived Records</span>
              <Badge variant="secondary" className="text-xs">{archivedRecords.length}</Badge>
            </div>
            <span className="text-xs text-muted-foreground">{showArchived ? 'Hide' : 'Show'}</span>
          </button>

          {showArchived && (
            <div className="border-t border-border">
              {loadingArchived ? (
                <div className="py-8 text-center text-muted-foreground text-sm">Loading archived records...</div>
              ) : archivedRecords.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-sm">No archived records</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">B/L NO</TableHead>
                        <TableHead className="text-xs">CONTAINER NO</TableHead>
                        <TableHead className="text-xs">AMOUNT</TableHead>
                        <TableHead className="text-xs">DATE</TableHead>
                        <TableHead className="text-xs">BANK</TableHead>
                        <TableHead className="text-xs">OWNER</TableHead>
                        <TableHead className="text-xs">CUSTOMER</TableHead>
                        <TableHead className="text-right text-xs">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {archivedRecords.map((record) => (
                        <TableRow key={record.id} className="opacity-70 hover:opacity-100 transition-opacity">
                          <TableCell className="font-mono text-xs">{record.bl_no}</TableCell>
                          <TableCell className="font-mono text-xs">{record.container_no}</TableCell>
                          <TableCell className="text-xs font-semibold">{formatAmount(record.invoice_amount)}</TableCell>
                          <TableCell className="text-xs">{format(parseDateString(record.invoice_date), 'dd/MM/yyyy')}</TableCell>
                          <TableCell><Badge variant="outline" className="text-xs">{record.bank}</Badge></TableCell>
                          <TableCell className="text-xs">{record.owner}</TableCell>
                          <TableCell className="text-xs">{record.used_for}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={() => handleUnarchive(record.id)}>
                                <ArchiveRestore className="h-3.5 w-3.5" /> Restore
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteId(record.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Archive Dialog */}
      <AlertDialog open={!!archiveId} onOpenChange={() => setArchiveId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Record</AlertDialogTitle>
            <AlertDialogDescription>
              This record will be moved to the archive. It won't be counted in account statements or totals. You can restore it anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive}>Archive</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this B/L record? This action can be reversed by an admin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Archive Dialog */}
      <AlertDialog open={showBulkArchiveDialog} onOpenChange={setShowBulkArchiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive {selectedIds.size} Record{selectedIds.size !== 1 ? 's' : ''}</AlertDialogTitle>
            <AlertDialogDescription>
              These records will be moved to the archive. They won't be counted in account statements or totals. You can restore them anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkArchive}>Archive All</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UsedBLDashboard;
