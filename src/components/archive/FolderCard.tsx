import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Folder, Pencil, Trash2, FolderTree } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FolderNode } from '@/hooks/useArchiveFolderTree';

const FOLDER_COLORS = ['#6366f1', '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#ec4899', '#8b5cf6', '#14b8a6'];

interface Props {
  node: FolderNode;
  onOpen: (id: string) => void;
  onUpdate: (id: string, updates: { name?: string; color?: string }) => Promise<boolean>;
  onDelete: (id: string, mode: 'promote' | 'unfile') => Promise<boolean>;
  onChangeParent: (id: string) => void;
  formatAmount: (amount: number, curr?: string) => string;
}

const FolderCard: React.FC<Props> = ({ node, onOpen, onUpdate, onDelete, onChangeParent, formatAmount }) => {
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState(node.name);
  const [color, setColor] = useState(node.color);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    const ok = await onUpdate(node.id, { name: name.trim(), color });
    if (ok) setEditOpen(false);
  };

  return (
    <>
      <Card
        className="group relative p-3 cursor-pointer hover:border-primary/40 hover:shadow-md transition-all bg-card"
        onClick={() => onOpen(node.id)}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${node.color}22`, border: `1px solid ${node.color}66` }}>
              <Folder className="h-4 w-4" style={{ color: node.color }} />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{node.name}</p>
              <p className="text-[10px] text-muted-foreground">
                {node.totalCount} record{node.totalCount !== 1 ? 's' : ''}
                {node.children.length > 0 && ` · ${node.children.length} sub-folder${node.children.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
            <Popover open={editOpen} onOpenChange={(o) => { setEditOpen(o); if (o) { setName(node.name); setColor(node.color); } }}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6" title="Rename / recolor">
                  <Pencil className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 space-y-2" align="end">
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Folder name" onKeyDown={(e) => e.key === 'Enter' && handleSave()} className="h-8 text-xs" />
                <div className="flex gap-1.5">
                  {FOLDER_COLORS.map(c => (
                    <button key={c} onClick={() => setColor(c)} className={cn("h-5 w-5 rounded-full border-2", color === c ? "border-foreground scale-110" : "border-transparent")} style={{ backgroundColor: c }} />
                  ))}
                </div>
                <Button size="sm" className="w-full h-7 text-xs" onClick={handleSave} disabled={!name.trim()}>Save</Button>
              </PopoverContent>
            </Popover>
            <Button variant="ghost" size="icon" className="h-6 w-6" title="Move to another parent" onClick={() => onChangeParent(node.id)}>
              <FolderTree className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" title="Delete folder" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(node.totals).length === 0 ? (
            <span className="text-[10px] text-muted-foreground">No amounts</span>
          ) : Object.entries(node.totals).map(([curr, total]) => (
            <span key={curr} className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-muted text-foreground">
              {formatAmount(total, curr)}
            </span>
          ))}
        </div>
      </Card>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete folder "{node.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              {node.children.length > 0
                ? `Sub-folders will be moved to ${node.parent_id ? 'this folder\'s parent' : 'the top level'}. `
                : ''}
              Archived records in this folder will become unfiled. The records themselves are not deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => { await onDelete(node.id, 'promote'); setConfirmDelete(false); }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete folder
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default FolderCard;
