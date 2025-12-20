import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useInvoice, Dashboard } from '@/contexts/InvoiceContext';
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
import { Plus, Edit2, Trash2, LayoutDashboard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DashboardSelectorProps {
  value: string;
  onChange: (value: string) => void;
  showManage?: boolean;
}

const DashboardSelector: React.FC<DashboardSelectorProps> = ({ value, onChange, showManage = false }) => {
  const { t } = useLanguage();
  const { dashboards, addDashboard, updateDashboard, deleteDashboard } = useInvoice();
  const { toast } = useToast();
  const [newDashboardName, setNewDashboardName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [addPopoverOpen, setAddPopoverOpen] = useState(false);

  const handleAddDashboard = () => {
    if (newDashboardName.trim()) {
      addDashboard(newDashboardName.trim());
      setNewDashboardName('');
      setAddPopoverOpen(false);
      toast({ title: t('dashboardAdded') });
    }
  };

  const handleUpdateDashboard = (id: string) => {
    if (editingName.trim()) {
      updateDashboard(id, editingName.trim());
      setEditingId(null);
      setEditingName('');
      toast({ title: t('dashboardUpdated') });
    }
  };

  const handleDeleteDashboard = (id: string) => {
    deleteDashboard(id);
    toast({ title: t('dashboardDeleted') });
  };

  const startEditing = (dashboard: Dashboard) => {
    setEditingId(dashboard.id);
    setEditingName(dashboard.name);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t('selectDashboard')}>
              {dashboards.find(d => d.id === value)?.name || t('selectDashboard')}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-popover">
            {dashboards.map((dashboard) => (
              <SelectItem key={dashboard.id} value={dashboard.id}>
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  {dashboard.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover open={addPopoverOpen} onOpenChange={setAddPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 bg-popover" align="end">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">{t('addDashboard')}</h4>
              <Input
                placeholder={t('dashboardName')}
                value={newDashboardName}
                onChange={(e) => setNewDashboardName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddDashboard()}
              />
              <Button onClick={handleAddDashboard} size="sm" className="w-full">
                {t('save')}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {showManage && dashboards.length > 0 && (
        <div className="border rounded-md divide-y">
          {dashboards.map((dashboard) => (
            <div key={dashboard.id} className="flex items-center justify-between p-3">
              {editingId === dashboard.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdateDashboard(dashboard.id)}
                    className="h-8"
                  />
                  <Button size="sm" onClick={() => handleUpdateDashboard(dashboard.id)}>
                    {t('save')}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                    {t('cancel')}
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                    <span>{dashboard.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => startEditing(dashboard)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDeleteDashboard(dashboard.id)}
                      disabled={dashboards.length <= 1}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardSelector;