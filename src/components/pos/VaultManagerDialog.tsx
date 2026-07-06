import React, { useState } from 'react';
import { Vault, useVaults } from '@/hooks/useVaults';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Trash2, KeyRound, KeySquare, Plus, Pencil, Check, X } from 'lucide-react';
import PinKeypadDialog from './PinKeypadDialog';
import { useToast } from '@/hooks/use-toast';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  warehouseId: string;
}

const PALETTE = ['#10B981','#3B82F6','#EF4444','#F59E0B','#8B5CF6','#EC4899','#14B8A6','#F97316'];

const VaultManagerDialog: React.FC<Props> = ({ open, onOpenChange, warehouseId }) => {
  const { vaults, addVault, updateVault, deleteVault, setPin, removePin } = useVaults(warehouseId);
  const { toast } = useToast();

  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(PALETTE[1]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [pinDialog, setPinDialog] = useState<{ vault: Vault; mode: 'set' | 'remove' } | null>(null);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    const v = await addVault(newName, newColor);
    if (v) { setNewName(''); setCreating(false); toast({ title: 'Vault created' }); }
  };

  const handleDelete = async (v: Vault) => {
    if (v.is_main) { toast({ title: 'Cannot delete main vault', variant: 'destructive' }); return; }
    if (!confirm(`Delete vault "${v.name}"? Transactions will be preserved.`)) return;
    const r = await deleteVault(v.id);
    if (!r.ok) toast({ title: r.error || 'Delete failed', variant: 'destructive' });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Manage Vaults</DialogTitle></DialogHeader>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {vaults.map(v => (
              <Card key={v.id} className="p-3" style={{ borderLeft: `4px solid ${v.color}` }}>
                <div className="flex items-center gap-2">
                  {editingId === v.id ? (
                    <>
                      <Input value={editName} onChange={e => setEditName(e.target.value)} className="h-8 flex-1" autoFocus />
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={async () => { await updateVault(v.id, { name: editName.trim() }); setEditingId(null); }}><Check className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingId(null)}><X className="h-4 w-4" /></Button>
                    </>
                  ) : (
                    <>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{v.name}</span>
                          {v.is_main && <Badge variant="secondary" className="text-[10px]">MAIN</Badge>}
                          {v.pin_hash && <KeyRound className="h-3 w-3 text-muted-foreground" />}
                          <Badge variant={v.is_open ? 'default' : 'outline'} className="text-[10px]">{v.is_open ? 'OPEN' : 'CLOSED'}</Badge>
                        </div>
                      </div>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditingId(v.id); setEditName(v.name); }}><Pencil className="h-3.5 w-3.5" /></Button>
                    </>
                  )}
                </div>

                <div className="flex gap-1 mt-2 flex-wrap">
                  {PALETTE.map(c => (
                    <button
                      key={c}
                      onClick={() => updateVault(v.id, { color: c })}
                      className={`h-5 w-5 rounded-md border-2 ${v.color === c ? 'border-foreground' : 'border-transparent'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>

                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="outline" className="gap-1 h-7 text-xs" onClick={() => setPinDialog({ vault: v, mode: 'set' })}>
                    <KeyRound className="h-3 w-3" /> {v.pin_hash ? 'Change PIN' : 'Set PIN'}
                  </Button>
                  {v.pin_hash && (
                    <Button size="sm" variant="outline" className="gap-1 h-7 text-xs" onClick={() => setPinDialog({ vault: v, mode: 'remove' })}>
                      <KeyOff className="h-3 w-3" /> Remove PIN
                    </Button>
                  )}
                  {!v.is_main && (
                    <Button size="sm" variant="ghost" className="gap-1 h-7 text-xs text-destructive ml-auto" onClick={() => handleDelete(v)}>
                      <Trash2 className="h-3 w-3" /> Delete
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {creating ? (
            <div className="border rounded-md p-3 space-y-2">
              <Label>Vault name</Label>
              <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Register 2" autoFocus />
              <Label>Color</Label>
              <div className="flex gap-1 flex-wrap">
                {PALETTE.map(c => (
                  <button key={c} onClick={() => setNewColor(c)} className={`h-6 w-6 rounded-md border-2 ${newColor === c ? 'border-foreground' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                ))}
              </div>
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
                <Button size="sm" onClick={handleAdd}>Create</Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" className="gap-2" onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" /> Add vault
            </Button>
          )}
        </DialogContent>
      </Dialog>

      {pinDialog && (
        <PinKeypadDialog
          open={!!pinDialog}
          onOpenChange={(v) => { if (!v) setPinDialog(null); }}
          title={pinDialog.mode === 'set' ? `Set PIN for ${pinDialog.vault.name}` : `Remove PIN`}
          description={pinDialog.mode === 'set' ? 'Choose a 4-6 digit PIN' : 'Enter current PIN to remove'}
          submitLabel={pinDialog.mode === 'set' ? 'Set' : 'Remove'}
          onSubmit={async (pin) => {
            if (pinDialog.mode === 'set') {
              const r = await setPin(pinDialog.vault.id, pin);
              if (!r.ok) return r;
              toast({ title: 'PIN set' });
            } else {
              const r = await removePin(pinDialog.vault.id, pin);
              if (!r.ok) return r;
              toast({ title: 'PIN removed' });
            }
          }}
        />
      )}
    </>
  );
};

export default VaultManagerDialog;
