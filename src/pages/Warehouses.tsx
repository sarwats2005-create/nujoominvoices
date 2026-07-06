import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWarehouse } from '@/contexts/WarehouseContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Warehouse, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Warehouses: React.FC = () => {
  const navigate = useNavigate();
  const { warehouses, addWarehouse, deleteWarehouse, setActiveWarehouseId, loading } = useWarehouse();
  const { toast } = useToast();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');

  const enter = (id: string) => {
    setActiveWarehouseId(id);
    navigate('/pos');
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    const w = await addWarehouse(name);
    if (w) { toast({ title: 'Warehouse created' }); setName(''); setCreating(false); }
  };

  const handleDelete = async (id: string, isMain: boolean, name: string) => {
    if (isMain) { toast({ title: 'Cannot delete the main warehouse', variant: 'destructive' }); return; }
    if (!confirm(`Delete "${name}"? All linked POS data will be unassigned.`)) return;
    await deleteWarehouse(id);
  };

  return (
    <div className="max-w-5xl mx-auto py-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Warehouses</h1>
          <p className="text-sm text-muted-foreground">Choose a warehouse to enter its POS, inventory, suppliers and vaults.</p>
        </div>
        <Button onClick={() => setCreating(true)} className="gap-2">
          <Plus className="h-4 w-4" /> New warehouse
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {warehouses.map(w => (
            <Card key={w.id} className="group hover:border-primary/60 transition-all cursor-pointer" onClick={() => enter(w.id)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Warehouse className="h-6 w-6 text-primary" />
                  </div>
                  {w.is_main ? (
                    <Badge variant="secondary">MAIN</Badge>
                  ) : (
                    <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100 text-destructive"
                      onClick={(e) => { e.stopPropagation(); handleDelete(w.id, w.is_main, w.name); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <h3 className="font-semibold text-lg">{w.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">Tap to enter</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>New warehouse</DialogTitle></DialogHeader>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Branch 2" autoFocus onKeyDown={e => e.key === 'Enter' && handleCreate()} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Warehouses;
