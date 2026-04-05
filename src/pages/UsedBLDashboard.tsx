import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUsedBL } from '@/hooks/useUsedBL';
import { useArchiveFolders } from '@/hooks/useArchiveFolders';
import { useAdmin } from '@/hooks/useAdmin';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { parseDateString } from '@/lib/dateUtils';
import { Plus, Search, ArrowUpDown, Trash2, Edit, Eye, Copy, Download, Upload, FileText, Archive, ArchiveRestore, Folder } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import BLDashboardSelector from '@/components/BLDashboardSelector';
import ArchiveFolderManager from '@/components/ArchiveFolderManager';
import type { UsedBL } from '@/types/usedBL';

type SortKey = 'bl_no' | 'container_no' | 'invoice_amount' | 'invoice_date' | 'bank' | 'owner' | 'used_for' | 'used_for_beneficiary';

const UsedBLDashboard: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const {
    records, loading, softDeleteRecord, addMultipleRecords,
    archivedRecords, loadingArchived, archiveRecord, unarchiveRecord, archiveToFolder,
    blDashboards, currentBLDashboardId, currentDashboardName,
    setCurrentBLDashboardId, addBLDashboard,
  } = useUsedBL();
  const { folders, addFolder, updateFolder, deleteFolder } = useArchiveFolders(currentBLDashboardId);
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
  const [archiveFolderId, setArchiveFolderId] = useState<string>('none');
  const [archiveFolderFilter, setArchiveFolderFilter] = useState<string>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatAmount = (amount: number, curr?: string) => {
    const symbol = curr === 'EUR' ? '€' : curr === 'GBP' ? '£' : curr === 'IQD' ? 'د.ع' : curr === 'TRY' ? '₺' : curr === 'SAR' ? '﷼' : curr === 'AED' ? 'د.إ' : '$';
    return `${symbol}${Math.round(amount).toLocaleString()}`;
  };

  const uniqueBanks = useMemo(() => [...new Set(records.map(r => r.bank))].sort(), [records]);
  const uniqueOwners = useMemo(() => [...new Set(records.map(r => r.owner))].sort(), [records]);

  const filteredRecords = useMemo(() => {
    let result = records;
    if (bankFilter) result = result.filter(r => r.bank.toLowerCase() === bankFilter.toLowerCase());
    if (ownerFilter) result = result.filter(r => r.owner.toLowerCase() === ownerFilter.toLowerCase());
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
    const sorted = [...filteredRecords].sort((a, b) => {
      let comparison = 0;
      if (sortKey === 'invoice_amount') comparison = a.invoice_amount - b.invoice_amount;
      else if (sortKey === 'invoice_date') comparison = parseDateString(a.invoice_date).getTime() - parseDateString(b.invoice_date).getTime();
      else comparison = String(a[sortKey]).localeCompare(String(b[sortKey]));
      return sortAsc ? comparison : -comparison;
    });
    return sorted;
  }, [filteredRecords, sortKey, sortAsc]);

  // Group records by source_unused_bl_id for visual grouping
  const siblingMap = useMemo(() => {
    const map = new Map<string, string[]>();
    sortedRecords.forEach(r => {
      const srcId = (r as any).source_unused_bl_id;
      if (srcId) {
        const existing = map.get(srcId) || [];
        existing.push(r.id);
        map.set(srcId, existing);
      }
    });
    return map;
  }, [sortedRecords]);

  const getSiblingInfo = (record: UsedBL): { count: number; index: number } | null => {
    const srcId = (record as any).source_unused_bl_id;
    if (!srcId) return null;
    const siblings = siblingMap.get(srcId);
    if (!siblings || siblings.length <= 1) return null;
    return { count: siblings.length, index: siblings.indexOf(record.id) + 1 };
  };

  const totalsByCurrency = useMemo(() => {
    const totals: Record<string, number> = {};
    filteredRecords.forEach(r => {
      const curr = (r as any).currency || 'USD';
      totals[curr] = (totals[curr] || 0) + r.invoice_amount;
    });
    return totals;
  }, [filteredRecords]);

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
    const fId = archiveFolderId === 'none' ? null : archiveFolderId;
    const count = await archiveToFolder([archiveId], fId);
    if (count > 0) toast({ title: 'Record archived successfully' });
    setArchiveId(null);
    setArchiveFolderId('none');
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
    const fId = archiveFolderId === 'none' ? null : archiveFolderId;
    const archived = await archiveToFolder([...selectedIds], fId);
    toast({ title: `${archived} record${archived !== 1 ? 's' : ''} archived` });
    setSelectedIds(new Set());
    setShowBulkArchiveDialog(false);
    setArchiveFolderId('none');
  };

  const archivedCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    archivedRecords.forEach(r => {
      const fId = (r as any).archive_folder_id || 'unfiled';
      counts[fId] = (counts[fId] || 0) + 1;
    });
    return counts;
  }, [archivedRecords]);

  const filteredArchivedRecords = useMemo(() => {
    if (archiveFolderFilter === 'all') return archivedRecords;
    if (archiveFolderFilter === 'unfiled') return archivedRecords.filter(r => !(r as any).archive_folder_id);
    return archivedRecords.filter(r => (r as any).archive_folder_id === archiveFolderFilter);
  }, [archivedRecords, archiveFolderFilter]);

  const getFolderName = (folderId: string | null) => {
    if (!folderId) return null;
    return folders.find(f => f.id === folderId)?.name || null;
  };

  const getFolderColor = (folderId: string | null) => {
    if (!folderId) return undefined;
    return folders.find(f => f.id === folderId)?.color;
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
    const headers = ['B/L NO', 'CONTAINER NO', 'INVOICE AMOUNT', 'CURRENCY', 'INVOICE DATE', 'BANK', 'OWNER', 'USED FOR', 'BENEFICIARY', 'NOTES'];
    const rows = sortedRecords.map(r => [
      r.bl_no, r.container_no, r.invoice_amount.toString(),
      (r as any).currency || 'USD',
      format(parseDateString(r.invoice_date), 'dd/MM/yyyy'),
      r.bank, r.owner, r.used_for, r.used_for_beneficiary || '', r.notes || '',
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
      head: [['B/L NO', 'CONTAINER NO', 'AMOUNT', 'CURRENCY', 'DATE', 'BANK', 'OWNER', 'USED FOR', 'BENEFICIARY']],
      body: sortedRecords.map(r => [
        r.bl_no, r.container_no, formatAmount(r.invoice_amount, (r as any).currency),
        (r as any).currency || 'USD',
        format(parseDateString(r.invoice_date), 'dd/MM/yyyy'),
        r.bank, r.owner, r.used_for, r.used_for_beneficiary || '—',
      ]),
      startY: 28,
      styles: { fontSize: 8, cellPadding: 2 },
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
                  sortedRecords.map((record) => {
                    const sibInfo = getSiblingInfo(record);
                    return (
                    <TableRow key={record.id} className={cn(
                      "cursor-pointer hover:bg-accent/30 transition-colors",
                      sibInfo && "border-l-2 border-l-primary"
                    )} onClick={() => navigate(`/used-bl/${record.id}`)}>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.has(record.id)}
                          onCheckedChange={() => toggleSelect(record.id)}
                        />
                      </TableCell>
                      <TableCell className="font-mono font-medium text-xs sm:text-sm">
                        <div className="flex items-center gap-1.5">
                          {record.bl_no}
                          {sibInfo && (
                            <Badge variant="outline" className="text-[10px] px-1 py-0 border-primary/40 text-primary">
                              {sibInfo.index}/{sibInfo.count}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs sm:text-sm">{record.container_no}</TableCell>
                      <TableCell className="font-semibold text-xs sm:text-sm">{formatAmount(record.invoice_amount, (record as any).currency)}</TableCell>
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
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {sortedRecords.length > 0 && (
            <div className="border-t border-border px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-muted/30">
              <span className="text-sm text-muted-foreground">
                Showing {sortedRecords.length} of {records.length} records
              </span>
              <div className="flex flex-wrap gap-2 text-sm font-bold text-foreground">
                {Object.entries(totalsByCurrency).map(([curr, total]) => (
                  <span key={curr}>Total ({curr}): {formatAmount(total, curr)}</span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Archive Folders + Archived Section */}
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
              {/* Folder Manager */}
              <div className="px-4 py-3 border-b border-border bg-muted/10">
                <ArchiveFolderManager
                  folders={folders}
                  onAdd={addFolder}
                  onUpdate={updateFolder}
                  onDelete={deleteFolder}
                  archivedCounts={archivedCounts}
                />
              </div>

              {/* Folder Filter Tabs */}
              {folders.length > 0 && (
                <div className="px-4 py-2 border-b border-border flex flex-wrap gap-1.5">
                  <Badge variant={archiveFolderFilter === 'all' ? 'default' : 'outline'} className="cursor-pointer text-xs" onClick={() => setArchiveFolderFilter('all')}>
                    All ({archivedRecords.length})
                  </Badge>
                  <Badge variant={archiveFolderFilter === 'unfiled' ? 'default' : 'outline'} className="cursor-pointer text-xs" onClick={() => setArchiveFolderFilter('unfiled')}>
                    Unfiled ({archivedCounts['unfiled'] || 0})
                  </Badge>
                  {folders.map(f => (
                    <Badge key={f.id} variant={archiveFolderFilter === f.id ? 'default' : 'outline'} className="cursor-pointer text-xs gap-1" onClick={() => setArchiveFolderFilter(f.id)}>
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: f.color }} />
                      {f.name} ({archivedCounts[f.id] || 0})
                    </Badge>
                  ))}
                </div>
              )}

              {loadingArchived ? (
                <div className="py-8 text-center text-muted-foreground text-sm">Loading archived records...</div>
              ) : filteredArchivedRecords.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-sm">No archived records{archiveFolderFilter !== 'all' ? ' in this folder' : ''}</div>
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
                        {folders.length > 0 && <TableHead className="text-xs">FOLDER</TableHead>}
                        <TableHead className="text-right text-xs">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredArchivedRecords.map((record) => {
                        const folderName = getFolderName((record as any).archive_folder_id);
                        const folderColor = getFolderColor((record as any).archive_folder_id);
                        return (
                          <TableRow key={record.id} className="opacity-70 hover:opacity-100 transition-opacity">
                            <TableCell className="font-mono text-xs">{record.bl_no}</TableCell>
                            <TableCell className="font-mono text-xs">{record.container_no}</TableCell>
                            <TableCell className="text-xs font-semibold">{formatAmount(record.invoice_amount, (record as any).currency)}</TableCell>
                            <TableCell className="text-xs">{format(parseDateString(record.invoice_date), 'dd/MM/yyyy')}</TableCell>
                            <TableCell><Badge variant="outline" className="text-xs">{record.bank}</Badge></TableCell>
                            <TableCell className="text-xs">{record.owner}</TableCell>
                            <TableCell className="text-xs">{record.used_for}</TableCell>
                            {folders.length > 0 && (
                              <TableCell>
                                {folderName ? (
                                  <Badge variant="outline" className="text-[10px] gap-1">
                                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: folderColor }} />
                                    {folderName}
                                  </Badge>
                                ) : <span className="text-xs text-muted-foreground">—</span>}
                              </TableCell>
                            )}
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
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Archive Dialog with folder picker */}
      <Dialog open={!!archiveId} onOpenChange={() => { setArchiveId(null); setArchiveFolderId('none'); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Archive Record</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This record will be moved to the archive. You can restore it anytime.
          </p>
          {folders.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Folder (optional)</label>
              <Select value={archiveFolderId} onValueChange={setArchiveFolderId}>
                <SelectTrigger><SelectValue placeholder="No folder" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No folder</SelectItem>
                  {folders.map(f => (
                    <SelectItem key={f.id} value={f.id}>
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: f.color }} />
                        {f.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setArchiveId(null); setArchiveFolderId('none'); }}>Cancel</Button>
            <Button onClick={handleArchive}>Archive</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      {/* Bulk Archive Dialog with folder picker */}
      <Dialog open={showBulkArchiveDialog} onOpenChange={setShowBulkArchiveDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Archive {selectedIds.size} Record{selectedIds.size !== 1 ? 's' : ''}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            These records will be moved to the archive. You can restore them anytime.
          </p>
          {folders.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Folder (optional)</label>
              <Select value={archiveFolderId} onValueChange={setArchiveFolderId}>
                <SelectTrigger><SelectValue placeholder="No folder" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No folder</SelectItem>
                  {folders.map(f => (
                    <SelectItem key={f.id} value={f.id}>
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: f.color }} />
                        {f.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkArchiveDialog(false)}>Cancel</Button>
            <Button onClick={handleBulkArchive}>Archive All</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsedBLDashboard;
