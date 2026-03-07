import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUnusedBLSettings } from '@/hooks/useUnusedBLSettings';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FolderOpen, Plus, X, Building, Tag, Ruler, Anchor } from 'lucide-react';
import type { SettingType } from '@/types/unusedBL';

const SETTING_TYPES: { type: SettingType; icon: React.ReactNode; labelKey: string }[] = [
  { type: 'clearance_company', icon: <Building className="h-4 w-4" />, labelKey: 'clearanceCompanies' },
  { type: 'product_category', icon: <Tag className="h-4 w-4" />, labelKey: 'productCategories' },
  { type: 'quantity_unit', icon: <Ruler className="h-4 w-4" />, labelKey: 'quantityUnits' },
  { type: 'port_of_loading', icon: <Anchor className="h-4 w-4" />, labelKey: 'portsOfLoading' },
];

const SettingList: React.FC<{
  label: string;
  icon: React.ReactNode;
  type: SettingType;
}> = ({ label, icon, type }) => {
  const { getSettingsByType, addSetting, removeSetting } = useUnusedBLSettings();
  const { toast } = useToast();
  const [newItem, setNewItem] = useState('');

  const items = getSettingsByType(type);

  const handleAdd = async () => {
    const value = newItem.trim().toUpperCase();
    if (!value) return;
    if (items.some(i => i.value === value)) { setNewItem(''); return; }
    const ok = await addSetting(type, value);
    if (ok) { setNewItem(''); toast({ title: 'Setting added' }); }
  };

  const handleRemove = async (id: string) => {
    await removeSetting(id);
    toast({ title: 'Setting removed' });
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">{icon}{label}</Label>
      <div className="flex flex-wrap gap-1.5 min-h-[32px]">
        {items.map(item => (
          <Badge key={item.id} variant="secondary" className="gap-1 text-xs py-1 px-2">
            {item.value}
            <button type="button" onClick={() => handleRemove(item.id)} className="ml-0.5 hover:text-destructive transition-colors">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input value={newItem} onChange={e => setNewItem(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } }}
          placeholder={`Add new ${label.toLowerCase()}...`} className="h-8 text-sm uppercase" />
        <Button type="button" variant="outline" size="sm" onClick={handleAdd} className="h-8 px-2 shrink-0">
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};

const UnusedBLSettingsPanel: React.FC = () => {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FolderOpen className="h-5 w-5 text-primary" />
          {t('unusedBLSettings')}
        </CardTitle>
        <p className="text-sm text-muted-foreground">Manage dropdown options for the Unused B/L module</p>
      </CardHeader>
      <CardContent className="space-y-5">
        {SETTING_TYPES.map(({ type, icon, labelKey }) => (
          <SettingList key={type} label={t(labelKey)} icon={icon} type={type} />
        ))}
      </CardContent>
    </Card>
  );
};

export default UnusedBLSettingsPanel;
