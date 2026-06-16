import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronRight, FolderPlus, FolderOpen, Home, ArchiveRestore, Trash2, FolderInput } from 'lucide-react';
import { format } from 'date-fns';
import { parseDateString } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';
import { useArchiveFolderTree, type FolderNode } from '@/hooks/useArchiveFolderTree';
import FolderCard from './FolderCard';
import FolderPicker from './FolderPicker';
import type { ArchiveFolder, UsedBL } from '@/types/usedBL';

interface Props {
  folders: ArchiveFolder[];
  archivedRecords: UsedBL[];
  loading: boolean;
  formatAmount: (amount: number, curr?: string) => string;
  onAddFolder: (name: string, color: string, parentId: string | null) => Promise<ArchiveFolder | null>;
  onUpdateFolder: (id: string, updates: { name?: string; color?: string; parent_id?: string | null }) => Promise<boolean>;
  onDeleteFolder: (id: string, mode: 'promote' | 'unfile') => Promise<boolean>;
  onMoveRecords: (ids: string[], folderId: string | null) => Promise<number>;
  onRestoreRecords: (ids: string[]) => Promise<number>;
  onDeleteRecords: (ids: string[]) => Promise<number>;
}

const FolderBrowser: React.FC<Props> = ({
  folders, archivedRecords, loading, formatAmount,
  onAddFolder, onUpdateFolder, onDeleteFolder,
  onMoveRecords, onRestoreRecords, onDeleteRecords,
}) => {
  const { roots, unfiledCount, unfiledTotals, getRecordsInFolder, getPath, flatById } = useArchiveFolderTree(folders, archivedRecords);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [movePickerOpen, setMovePickerOpen] = useState(false);
  const [reparentFolderId, setReparentFolderId] = useState<string | null>(null);
  const [createPickerOpen, setCreatePickerOpen] = useState(false);

  const path = getPath(currentFolderId);
  const currentNode: FolderNode | null = currentFolderId ? flatById.get(currentFolderId) ?? null : null;
  const childFolders = currentNode ? currentNode.children : roots;
  const recordsHere = useMemo(() => getRecordsInFolder(currentFolderId), [getRecordsInFolder, currentFolderId]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };
  const toggleAll = () => {
    if (selectedIds.size === recordsHere.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(recordsHere.map(r => r.id)));
  };

  const goTo = (id: string | null) => { setCurrentFolderId(id); setSelectedIds(new Set()); };

  const handleConfirmMove = async (folderId: string | null) => {
    if (reparentFolderId) {
      await onUpdateFolder(reparentFolderId, { parent_id: folderId });
      setReparentFolderId(null);
    } else {
      const ids = [...selectedIds];
      const n = await onMoveRecords(ids, folderId);
      if (n > 0) setSelectedIds(new Set());
    }
  };

  return (
    <div className="space-y-3">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs flex-wrap px-4 pt-3">
        <button onClick={() => goTo(null)} className={cn("flex items-center gap-1 px-2 py-1 rounded hover:bg-accent", !currentFolderId && "bg-accent font-semibold")}>
          <Home className="h-3.5 w-3.5" /> All Archives
        </button>
        {path.map((node, idx) => (
          <React.Fragment key={node.id}>
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
            <button onClick={() => goTo(node.id)} className={cn("flex items-center gap-1 px-2 py-1 rounded hover:bg-accent", idx === path.length - 1 && "bg-accent font-semibold")}>
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: node.color }} />
              {node.name}
            </button>
          </React.Fragment>
        ))}
        <div className="ml-auto">
          <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs" onClick={() => setCreatePickerOpen(true)}>
            <FolderPlus className="h-3.5 w-3.5" /> New folder
          </Button>
        </div>
      </div>

      {/* Current folder summary */}
      {currentNode && (
        <div className="px-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Totals (recursive):</span>
          {Object.entries(currentNode.totals).length === 0 ? (
            <span className="text-xs text-muted-foreground">Empty</span>
          ) : Object.entries(currentNode.totals).map(([c, t]) => (
            <Badge key={c} variant="secondary" className="text-xs">{c}: {formatAmount(t, c)}</Badge>
          ))}
        </div>
      )}

      {/* Folder cards grid */}
      {(childFolders.length > 0 || (!currentFolderId && unfiledCount > 0)) && (
        <div className="px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {childFolders.map(node => (
            <FolderCard
              key={node.id}
              node={node}
              onOpen={goTo}
              onUpdate={(id, u) => onUpdateFolder(id, u)}
              onDelete={onDeleteFolder}
              onChangeParent={(id) => { setReparentFolderId(id); setMovePickerOpen(true); }}
              formatAmount={formatAmount}
            />
          ))}
          {!currentFolderId && unfiledCount > 0 && (
            <Card
              className="group p-3 cursor-pointer hover:border-primary/40 hover:shadow-md transition-all bg-card border-dashed"
              onClick={() => goTo('__unfiled__' as any)}
            >
              <div className="flex items-start gap-2 mb-2">
                <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-muted">
                  <FolderOpen className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm">Unfiled</p>
                  <p className="text-[10px] text-muted-foreground">{unfiledCount} record{unfiledCount !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(unfiledTotals).map(([c, t]) => (
                  <span key={c} className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-muted">{formatAmount(t, c)}</span>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Records in this folder */}
      <div className="border-t border-border">
        <div className="px-4 py-2 flex items-center justify-between bg-muted/20">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Records in {currentNode ? `"${currentNode.name}"` : (currentFolderId === ('__unfiled__' as any) ? 'Unfiled' : 'All Archives')}
          </span>
          <Badge variant="outline" className="text-xs">
            {currentFolderId === ('__unfiled__' as any) ? unfiledCount : (currentNode?.directCount ?? recordsHere.length)}
          </Badge>
        </div>

        {/* Bulk bar */}
        {selectedIds.size > 0 && (
          <div className="px-4 py-2 bg-primary/5 border-b border-border flex items-center justify-between gap-2 flex-wrap">
            <span className="text-sm font-medium">{selectedIds.size} selected</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs" onClick={() => { setReparentFolderId(null); setMovePickerOpen(true); }}>
                <FolderInput className="h-3.5 w-3.5" /> Move to…
              </Button>
              <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs" onClick={async () => { const n = await onRestoreRecords([...selectedIds]); if (n) setSelectedIds(new Set()); }}>
                <ArchiveRestore className="h-3.5 w-3.5" /> Restore
              </Button>
              <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs text-destructive hover:text-destructive" onClick={async () => { const n = await onDeleteRecords([...selectedIds]); if (n) setSelectedIds(new Set()); }}>
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setSelectedIds(new Set())}>Clear</Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="py-8 text-center text-muted-foreground text-sm">Loading…</div>
        ) : (currentFolderId === ('__unfiled__' as any) ? archivedRecords.filter(r => !r.archive_folder_id) : recordsHere).length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm">No records here</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={recordsHere.length > 0 && selectedIds.size === recordsHere.length}
                      onCheckedChange={toggleAll}
                    />
                  </TableHead>
                  <TableHead className="text-xs">B/L NO</TableHead>
                  <TableHead className="text-xs">CONTAINER</TableHead>
                  <TableHead className="text-xs">AMOUNT</TableHead>
                  <TableHead className="text-xs">DATE</TableHead>
                  <TableHead className="text-xs">BANK</TableHead>
                  <TableHead className="text-xs">OWNER</TableHead>
                  <TableHead className="text-xs">CUSTOMER</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(currentFolderId === ('__unfiled__' as any) ? archivedRecords.filter(r => !r.archive_folder_id) : recordsHere).map(record => (
                  <TableRow key={record.id} className="opacity-90 hover:opacity-100">
                    <TableCell><Checkbox checked={selectedIds.has(record.id)} onCheckedChange={() => toggleSelect(record.id)} /></TableCell>
                    <TableCell className="font-mono text-xs">{record.bl_no}</TableCell>
                    <TableCell className="font-mono text-xs">{record.container_no}</TableCell>
                    <TableCell className="text-xs font-semibold">{formatAmount(record.invoice_amount, (record as any).currency)}</TableCell>
                    <TableCell className="text-xs">{format(parseDateString(record.invoice_date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{record.bank}</Badge></TableCell>
                    <TableCell className="text-xs">{record.owner}</TableCell>
                    <TableCell className="text-xs">{record.used_for}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <FolderPicker
        open={movePickerOpen}
        onOpenChange={(o) => { setMovePickerOpen(o); if (!o) setReparentFolderId(null); }}
        title={reparentFolderId ? 'Move folder to…' : 'Move records to folder'}
        confirmLabel="Move"
        roots={roots}
        allowRoot={true}
        excludeFolderId={reparentFolderId ?? undefined}
        onConfirm={handleConfirmMove}
        onCreateFolder={onAddFolder}
      />

      <FolderPicker
        open={createPickerOpen}
        onOpenChange={setCreatePickerOpen}
        title="Create a new folder"
        confirmLabel="Done"
        roots={roots}
        allowRoot={true}
        onConfirm={() => {}}
        onCreateFolder={onAddFolder}
      />
    </div>
  );
};

export default FolderBrowser;
