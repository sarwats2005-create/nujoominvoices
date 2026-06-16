import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ChevronRight, Folder, FolderPlus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ArchiveFolder } from '@/types/usedBL';
import type { FolderNode } from '@/hooks/useArchiveFolderTree';

const FOLDER_COLORS = ['#6366f1', '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#ec4899', '#8b5cf6', '#14b8a6'];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  confirmLabel?: string;
  roots: FolderNode[];
  initialSelectedId?: string | null;
  excludeFolderId?: string; // hide this folder + descendants (used when re-parenting)
  allowRoot?: boolean; // allow "Top level / Unfiled" choice
  onConfirm: (folderId: string | null) => void | Promise<void>;
  onCreateFolder: (name: string, color: string, parentId: string | null) => Promise<ArchiveFolder | null>;
}

const FolderPicker: React.FC<Props> = ({
  open, onOpenChange, title, confirmLabel = 'Select', roots, initialSelectedId = null,
  excludeFolderId, allowRoot = false, onConfirm, onCreateFolder,
}) => {
  const [selected, setSelected] = useState<string | null>(initialSelectedId);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState<{ parentId: string | null } | null>(null);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#6366f1');
  const [busy, setBusy] = useState(false);

  React.useEffect(() => {
    if (open) {
      setSelected(initialSelectedId);
      setExpanded(new Set());
      setCreating(null);
      setNewName('');
    }
  }, [open, initialSelectedId]);

  const isExcluded = useMemo(() => {
    if (!excludeFolderId) return () => false;
    const blocked = new Set<string>();
    const walk = (nodes: FolderNode[]): boolean => {
      for (const n of nodes) {
        if (n.id === excludeFolderId || walk(n.children)) {
          blocked.add(n.id);
        }
      }
      return Array.from(blocked).length > 0;
    };
    walk(roots);
    return (id: string) => blocked.has(id);
  }, [roots, excludeFolderId]);

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setBusy(true);
    const created = await onCreateFolder(newName.trim(), newColor, creating?.parentId ?? null);
    setBusy(false);
    if (created) {
      setSelected(created.id);
      if (creating?.parentId) setExpanded(prev => new Set(prev).add(creating.parentId!));
      setCreating(null);
      setNewName('');
      setNewColor('#6366f1');
    }
  };

  const renderNode = (node: FolderNode, depth: number) => {
    const disabled = isExcluded(node.id);
    const hasChildren = node.children.length > 0;
    const isExpanded = expanded.has(node.id);
    return (
      <div key={node.id}>
        <div
          className={cn(
            "flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm cursor-pointer hover:bg-accent/50",
            selected === node.id && "bg-primary/15 ring-1 ring-primary/40",
            disabled && "opacity-40 cursor-not-allowed"
          )}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => !disabled && setSelected(node.id)}
        >
          {hasChildren ? (
            <button onClick={(e) => { e.stopPropagation(); toggleExpand(node.id); }} className="h-4 w-4 flex items-center justify-center">
              <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", isExpanded && "rotate-90")} />
            </button>
          ) : <span className="w-4" />}
          <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: node.color }} />
          <Folder className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="flex-1 truncate">{node.name}</span>
          <span className="text-xs text-muted-foreground">{node.totalCount}</span>
          {selected === node.id && <Check className="h-3.5 w-3.5 text-primary" />}
          {!disabled && (
            <button
              onClick={(e) => { e.stopPropagation(); setCreating({ parentId: node.id }); setExpanded(prev => new Set(prev).add(node.id)); }}
              className="h-5 w-5 flex items-center justify-center hover:bg-accent rounded"
              title="New sub-folder"
            >
              <FolderPlus className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        {creating && creating.parentId === node.id && renderCreateForm(depth + 1)}
        {isExpanded && node.children.map(c => renderNode(c, depth + 1))}
      </div>
    );
  };

  const renderCreateForm = (depth: number) => (
    <div className="flex items-center gap-1.5 px-2 py-1.5 bg-accent/30 rounded-md" style={{ paddingLeft: `${depth * 16 + 8}px` }}>
      <Input
        autoFocus
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setCreating(null); }}
        placeholder="Folder name..."
        className="h-7 text-xs flex-1"
      />
      <div className="flex gap-0.5">
        {FOLDER_COLORS.slice(0, 4).map(c => (
          <button key={c} onClick={() => setNewColor(c)} className={cn("h-4 w-4 rounded-full border", newColor === c ? "border-foreground scale-125" : "border-transparent")} style={{ backgroundColor: c }} />
        ))}
      </div>
      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={handleCreate} disabled={!newName.trim() || busy}>Add</Button>
      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setCreating(null)}>×</Button>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="border border-border rounded-md max-h-72 overflow-y-auto p-1 space-y-0.5 bg-background">
          {allowRoot && (
            <div
              className={cn(
                "flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm cursor-pointer hover:bg-accent/50",
                selected === null && "bg-primary/15 ring-1 ring-primary/40"
              )}
              onClick={() => setSelected(null)}
            >
              <span className="w-4" />
              <Folder className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="flex-1">Top level (unfiled)</span>
              {selected === null && <Check className="h-3.5 w-3.5 text-primary" />}
            </div>
          )}
          {creating && creating.parentId === null && renderCreateForm(0)}
          {roots.map(r => renderNode(r, 0))}
          {roots.length === 0 && !creating && (
            <div className="px-3 py-6 text-center text-xs text-muted-foreground">
              No folders yet. Create your first one below.
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setCreating({ parentId: null })}>
            <FolderPlus className="h-4 w-4" /> New top-level folder
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            disabled={selected === null && !allowRoot}
            onClick={async () => { await onConfirm(selected); onOpenChange(false); }}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FolderPicker;
