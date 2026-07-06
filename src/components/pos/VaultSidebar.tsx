import React, { useState } from 'react';
import { Vault, useVaults, useVaultTransactions } from '@/hooks/useVaults';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Unlock, Plus, Settings2, KeyRound } from 'lucide-react';
import PinKeypadDialog from './PinKeypadDialog';
import VaultManagerDialog from './VaultManagerDialog';
import { useToast } from '@/hooks/use-toast';

interface Props {
  warehouseId: string;
  selectedVaultId: string | null;
  onSelectVault: (id: string) => void;
}

const VaultSidebar: React.FC<Props> = ({ warehouseId, selectedVaultId, onSelectVault }) => {
  const { vaults, openVault, closeVault } = useVaults(warehouseId);
  const { toast } = useToast();

  const [pinDialog, setPinDialog] = useState<{ vault: Vault; mode: 'open' | 'close' } | null>(null);
  const [managerOpen, setManagerOpen] = useState(false);

  const handleToggle = async (v: Vault) => {
    const action = v.is_open ? 'close' : 'open';
    if (v.pin_hash) {
      setPinDialog({ vault: v, mode: action });
      return;
    }
    const fn = v.is_open ? closeVault : openVault;
    const res = await fn(v.id, '');
    if (!res.ok) toast({ title: res.error || 'Failed', variant: 'destructive' });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Vaults</h3>
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setManagerOpen(true)} title="Manage vaults">
          <Settings2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-2">
        {vaults.map(v => {
          const selected = v.id === selectedVaultId;
          return (
            <Card
              key={v.id}
              onClick={() => v.is_open && onSelectVault(v.id)}
              className={`p-2 cursor-pointer transition-all border-2 ${selected ? 'ring-2 ring-primary' : ''} ${!v.is_open ? 'opacity-60' : ''}`}
              style={{ borderColor: selected ? v.color : 'transparent', background: `linear-gradient(180deg, ${v.color}15, transparent)` }}
            >
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-md shrink-0" style={{ backgroundColor: v.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium truncate">{v.name}</span>
                    {v.is_main && <Badge variant="secondary" className="text-[9px] px-1 py-0">MAIN</Badge>}
                    {v.pin_hash && <KeyRound className="h-3 w-3 text-muted-foreground" />}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {v.is_open ? 'Open' : 'Closed'}
                  </div>
                </div>
                <Button
                  size="icon" variant="ghost" className="h-7 w-7"
                  onClick={(e) => { e.stopPropagation(); handleToggle(v); }}
                  title={v.is_open ? 'Close vault' : 'Open vault'}
                >
                  {v.is_open ? <Unlock className="h-4 w-4 text-emerald-500" /> : <Lock className="h-4 w-4 text-amber-500" />}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Button variant="outline" size="sm" className="mt-1 gap-1" onClick={() => setManagerOpen(true)}>
        <Plus className="h-3 w-3" /> Add vault
      </Button>

      {pinDialog && (
        <PinKeypadDialog
          open={!!pinDialog}
          onOpenChange={(v) => { if (!v) setPinDialog(null); }}
          title={pinDialog.mode === 'open' ? `Open ${pinDialog.vault.name}` : `Close ${pinDialog.vault.name}`}
          description="Enter vault PIN"
          submitLabel={pinDialog.mode === 'open' ? 'Open' : 'Close'}
          onSubmit={async (pin) => {
            const fn = pinDialog.mode === 'open' ? openVault : closeVault;
            const res = await fn(pinDialog.vault.id, pin);
            if (!res.ok) return res;
          }}
        />
      )}

      <VaultManagerDialog open={managerOpen} onOpenChange={setManagerOpen} warehouseId={warehouseId} />
    </div>
  );
};

export default VaultSidebar;
