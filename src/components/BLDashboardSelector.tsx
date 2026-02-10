import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Plus, LayoutDashboard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { BLDashboard } from '@/types/usedBL';

interface BLDashboardSelectorProps {
  dashboards: BLDashboard[];
  currentDashboardId: string | null;
  onSelect: (id: string) => void;
  onAdd: (name: string) => Promise<BLDashboard | null>;
}

const BLDashboardSelector: React.FC<BLDashboardSelectorProps> = ({
  dashboards,
  currentDashboardId,
  onSelect,
  onAdd,
}) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [newName, setNewName] = useState('');
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    const result = await onAdd(newName.trim());
    if (result) {
      onSelect(result.id);
      setNewName('');
      setPopoverOpen(false);
      toast({ title: t('blDashboardAdded') });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={currentDashboardId || ''} onValueChange={onSelect}>
        <SelectTrigger className="w-full max-w-xs">
          <SelectValue placeholder={t('selectBLDashboard')}>
            {dashboards.find(d => d.id === currentDashboardId)?.name || t('selectBLDashboard')}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-popover">
          {dashboards.map((d) => (
            <SelectItem key={d.id} value={d.id}>
              <div className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                {d.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 bg-popover" align="end">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">{t('addBLDashboard')}</h4>
            <Input
              placeholder={t('blDashboardName')}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <Button onClick={handleAdd} size="sm" className="w-full">
              {t('save')}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default BLDashboardSelector;
