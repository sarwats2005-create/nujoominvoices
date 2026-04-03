import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { FolderPlus, Pencil, Trash2, Folder } from 'lucide-react';
import type { ArchiveFolder } from '@/types/usedBL';

const FOLDER_COLORS = ['#6366f1', '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#ec4899', '#8b5cf6', '#14b8a6'];

interface Props {
  folders: ArchiveFolder[];
  onAdd: (name: string, color: string) => Promise<ArchiveFolder | null>;
  onUpdate: (id: string, name: string, color: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  archivedCounts: Record<string, number>;
}

const ArchiveFolderManager: React.FC<Props> = ({ folders, onAdd, onUpdate, onDelete, archivedCounts }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [editFolder, setEditFolder] = useState<ArchiveFolder | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6366f1');

  const handleAdd = async () => {
    if (!name.trim()) return;
    await onAdd(name.trim(), color);
    setName(''); setColor('#6366f1'); setShowAdd(false);
  };

  const handleEdit = async () => {
    if (!editFolder || !name.trim()) return;
    await onUpdate(editFolder.id, name.trim(), color);
    setEditFolder(null); setName(''); setColor('#6366f1');
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await onDelete(deleteId);
    setDeleteId(null);
  };

  const openEdit = (f: ArchiveFolder) => {
    setEditFolder(f); setName(f.name); setColor(f.color);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <Folder className="h-4 w-4" /> Archive Folders
        </h3>
        <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => { setName(''); setColor('#6366f1'); setShowAdd(true); }}>
          <FolderPlus className="h-3.5 w-3.5" /> New Folder
        </Button>
      </div>

      {folders.length === 0 && (
        <p className="text-xs text-muted-foreground">No folders yet. Create one to organize archived records.</p>
      )}

      <div className="flex flex-wrap gap-2">
        {folders.map(f => (
          <div key={f.id} className="flex items-center gap-1.5 border border-border rounded-md px-2 py-1 bg-card">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: f.color }} />
            <span className="text-xs font-medium">{f.name}</span>
            <Badge variant="secondary" className="text-[10px] h-4 px-1">{archivedCounts[f.id] || 0}</Badge>
            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => openEdit(f)}>
              <Pencil className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive" onClick={() => setDeleteId(f.id)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showAdd || !!editFolder} onOpenChange={() => { setShowAdd(false); setEditFolder(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editFolder ? 'Edit Folder' : 'New Archive Folder'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Folder name..." />
            <div className="flex gap-2">
              {FOLDER_COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)} className={`h-6 w-6 rounded-full border-2 transition-all ${color === c ? 'border-foreground scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAdd(false); setEditFolder(null); }}>Cancel</Button>
            <Button onClick={editFolder ? handleEdit : handleAdd} disabled={!name.trim()}>
              {editFolder ? 'Save' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Folder</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the folder. Archived records in this folder will remain archived but become unfiled.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ArchiveFolderManager;
