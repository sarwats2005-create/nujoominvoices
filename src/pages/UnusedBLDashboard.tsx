import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUnusedBL } from '@/hooks/useUnusedBL';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, FolderOpen, CheckCircle, Package, Eye, ArrowRightLeft, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import AddBLModal from '@/components/unused-bl/AddBLModal';
import UseBLModal from '@/components/unused-bl/UseBLModal';
import BLDetailViewer from '@/components/unused-bl/BLDetailViewer';
import type { UnusedBL } from '@/types/unusedBL';
import { useToast } from '@/hooks/use-toast';

const UnusedBLDashboard: React.FC = () => {
  const { t } = useLanguage();
  const { records, loading, stats, deleteRecord } = useUnusedBL();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [useModalRecord, setUseModalRecord] = useState<UnusedBL | null>(null);
  const [detailRecord, setDetailRecord] = useState<UnusedBL | null>(null);
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filtered = useMemo(() => {
    let result = [...records];
    if (statusFilter !== 'all') {
      result = result.filter(r => r.status === statusFilter);
    }
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(r =>
        r.bl_no.toLowerCase().includes(s) ||
        r.container_no.toLowerCase().includes(s) ||
        r.owner.toLowerCase().includes(s) ||
        r.clearance_company.toLowerCase().includes(s) ||
        r.product_category.toLowerCase().includes(s) ||
        r.port_of_loading.toLowerCase().includes(s)
      );
    }
    result.sort((a, b) => {
      const aVal = (a as any)[sortField] || '';
      const bVal = (b as any)[sortField] || '';
      const cmp = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [records, search, statusFilter, sortField, sortDir]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    const ok = await deleteRecord(id);
    if (ok) toast({ title: t('blRecordDeleted') });
  };

  const formatDate = (d: string) => {
    try { return format(new Date(d), 'dd/MM/yyyy'); } catch { return d; }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <FolderOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('unusedBL')}</h1>
            <p className="text-sm text-muted-foreground">Track and manage unused B/L files</p>
          </div>
        </div>
        <Button onClick={() => setAddModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> {t('addBL')}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.unused}</p>
              <p className="text-sm text-muted-foreground">{t('totalUnused')}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.used}</p>
              <p className="text-sm text-muted-foreground">{t('totalUsed')}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <FolderOpen className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">{t('totalAll')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('searchUnusedBL')}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">{t('totalAll')}</SelectItem>
            <SelectItem value="UNUSED">{t('unusedStatus')}</SelectItem>
            <SelectItem value="USED">{t('usedStatus')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort('bl_no')}>
                    {t('blNo')} {sortField === 'bl_no' && (sortDir === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort('container_no')}>
                    {t('containerNumber')} {sortField === 'container_no' && (sortDir === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead>{t('owner')}</TableHead>
                  <TableHead className="hidden md:table-cell">{t('clearanceCompany')}</TableHead>
                  <TableHead className="hidden lg:table-cell">{t('productCategory')}</TableHead>
                  <TableHead className="hidden md:table-cell">{t('blDate')}</TableHead>
                  <TableHead className="hidden lg:table-cell">{t('portOfLoading')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead>{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      {t('loading')}
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No records found
                    </TableCell>
                  </TableRow>
                ) : filtered.map(record => (
                  <TableRow key={record.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setDetailRecord(record)}>
                    <TableCell className="font-mono font-medium">{record.bl_no}</TableCell>
                    <TableCell className="font-mono">{record.container_no}</TableCell>
                    <TableCell>{record.owner}</TableCell>
                    <TableCell className="hidden md:table-cell">{record.clearance_company}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant="secondary">{record.product_category}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{formatDate(record.bl_date)}</TableCell>
                    <TableCell className="hidden lg:table-cell">{record.port_of_loading}</TableCell>
                    <TableCell>
                      <Badge variant={record.status === 'UNUSED' ? 'default' : 'secondary'}
                        className={record.status === 'USED' ? 'bg-success/20 text-success border-success/30' : ''}>
                        {record.status === 'UNUSED' ? t('unusedStatus') : t('usedStatus')}
                      </Badge>
                    </TableCell>
                    <TableCell onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDetailRecord(record)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {record.status === 'UNUSED' && (
                          <>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => setUseModalRecord(record)} title={t('useThisBL')}>
                              <ArrowRightLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(record.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <AddBLModal open={addModalOpen} onOpenChange={setAddModalOpen} />
      {useModalRecord && (
        <UseBLModal record={useModalRecord} open={!!useModalRecord} onOpenChange={(open) => !open && setUseModalRecord(null)} />
      )}
      {detailRecord && (
        <BLDetailViewer record={detailRecord} open={!!detailRecord} onOpenChange={(open) => !open && setDetailRecord(null)} />
      )}
    </div>
  );
};

export default UnusedBLDashboard;
