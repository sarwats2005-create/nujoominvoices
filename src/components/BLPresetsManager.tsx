import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSettings, BLPresets } from '@/contexts/SettingsContext';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, Building2, User, Package } from 'lucide-react';

interface PresetListProps {
  label: string;
  icon: React.ReactNode;
  items: string[];
  onAdd: (item: string) => void;
  onRemove: (index: number) => void;
  placeholder: string;
}

const PresetList: React.FC<PresetListProps> = ({ label, icon, items, onAdd, onRemove, placeholder }) => {
  const [newItem, setNewItem] = useState('');

  const handleAdd = () => {
    const value = newItem.trim().toUpperCase();
    if (!value) return;
    if (items.includes(value)) {
      setNewItem('');
      return;
    }
    onAdd(value);
    setNewItem('');
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
        {items.map((item, index) => (
          <Badge key={item} variant="secondary" className="gap-1 text-xs py-1 px-2">
            {item}
            <button
              type="button"
              onClick={() => onRemove(index)}
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
  const { blPresets, setBLPresets } = useSettings();
  const { toast } = useToast();

  const updatePresets = (key: keyof BLPresets, items: string[]) => {
    const updated = { ...blPresets, [key]: items };
    setBLPresets(updated);
    toast({ title: t('presetsUpdated') });
  };

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
          items={blPresets.banks}
          onAdd={(item) => updatePresets('banks', [...blPresets.banks, item])}
          onRemove={(i) => updatePresets('banks', blPresets.banks.filter((_, idx) => idx !== i))}
          placeholder={t('addNewBank')}
        />

        <PresetList
          label={t('blOwnerPresets')}
          icon={<User className="h-4 w-4" />}
          items={blPresets.owners}
          onAdd={(item) => updatePresets('owners', [...blPresets.owners, item])}
          onRemove={(i) => updatePresets('owners', blPresets.owners.filter((_, idx) => idx !== i))}
          placeholder={t('addNewOwner')}
        />

        <PresetList
          label={t('blUsedForPresets')}
          icon={<Package className="h-4 w-4" />}
          items={blPresets.usedFor}
          onAdd={(item) => updatePresets('usedFor', [...blPresets.usedFor, item])}
          onRemove={(i) => updatePresets('usedFor', blPresets.usedFor.filter((_, idx) => idx !== i))}
          placeholder={t('addNewUsedFor')}
        />
      </CardContent>
    </Card>
  );
};

export default BLPresetsManager;
