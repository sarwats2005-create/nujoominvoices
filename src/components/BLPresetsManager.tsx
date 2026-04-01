import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBLPresets, PresetType } from '@/hooks/useBLPresets';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, Building2, User, Package, Users, Loader2 } from 'lucide-react';

interface PresetListProps {
  label: string;
  icon: React.ReactNode;
  items: string[];
  onAdd: (item: string) => Promise<boolean>;
  onRemove: (value: string) => Promise<boolean>;
  placeholder: string;
}

const PresetList: React.FC<PresetListProps> = ({ label, icon, items, onAdd, onRemove, placeholder }) => {
  const [newItem, setNewItem] = useState('');
  const { toast } = useToast();

  const handleAdd = async () => {
    const value = newItem.trim().toUpperCase();
    if (!value) return;
    if (items.some(i => i.toUpperCase() === value)) {
      toast({ title: 'This value already exists in the list.' });
      setNewItem('');
      return;
    }
    const ok = await onAdd(value);
    if (ok) setNewItem('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">{icon}{label}</Label>
      <div className="flex flex-wrap gap-1.5 min-h-[32px]">
        {items.map((item) => (
          <Badge key={item} variant="secondary" className="gap-1 text-xs py-1 px-2">
            {item}
            <button
              type="button"
              onClick={() => onRemove(item)}
              className="ml-0.5 hover:text-destructive transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-8 text-sm uppercase"
        />
        <Button type="button" variant="outline" size="sm" onClick={handleAdd} className="h-8 px-2 shrink-0">
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};

const BLPresetsManager: React.FC = () => {
  const { t } = useLanguage();
  const { getByType, addPreset, removePresetByValue, loading, migrating } = useBLPresets();

  if (loading || migrating) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-muted-foreground">
            {migrating ? 'Migrating settings...' : 'Loading presets...'}
          </span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Package className="h-5 w-5 text-primary" />
          {t('blPresets')}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{t('blPresetsDesc')}</p>
      </CardHeader>
      <CardContent className="space-y-5">
        <PresetList
          label={t('blBankPresets')}
          icon={<Building2 className="h-4 w-4" />}
          items={getByType('bank')}
          onAdd={(item) => addPreset('bank', item)}
          onRemove={(value) => removePresetByValue('bank', value)}
          placeholder={t('addNewBank')}
        />

        <PresetList
          label={t('blOwnerPresets')}
          icon={<User className="h-4 w-4" />}
          items={getByType('owner')}
          onAdd={(item) => addPreset('owner', item)}
          onRemove={(value) => removePresetByValue('owner', value)}
          placeholder={t('addNewOwner')}
        />

        <PresetList
          label={t('blUsedForPresets')}
          icon={<Package className="h-4 w-4" />}
          items={getByType('used_for')}
          onAdd={(item) => addPreset('used_for', item)}
          onRemove={(value) => removePresetByValue('used_for', value)}
          placeholder={t('addNewUsedFor')}
        />

        <PresetList
          label="Beneficiary Presets"
          icon={<Users className="h-4 w-4" />}
          items={getByType('beneficiary')}
          onAdd={(item) => addPreset('beneficiary', item)}
          onRemove={(value) => removePresetByValue('beneficiary', value)}
          placeholder="Add new beneficiary"
        />
      </CardContent>
    </Card>
  );
};

export default BLPresetsManager;
