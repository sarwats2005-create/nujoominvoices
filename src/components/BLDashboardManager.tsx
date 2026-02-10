import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUsedBL } from '@/hooks/useUsedBL';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LayoutDashboard, Edit2, Trash2, Plus } from 'lucide-react';

const BLDashboardManager: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const {
    blDashboards,
    currentBLDashboardId,
    setCurrentBLDashboardId,
    addBLDashboard,
    updateBLDashboard,
    deleteBLDashboard,
  } = useUsedBL();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [newName, setNewName] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    const result = await addBLDashboard(newName.trim());
    if (result) {
      toast({ title: t('blDashboardAdded') });
      setNewName('');
      setShowAdd(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editingName.trim()) return;
    const ok = await updateBLDashboard(id, editingName.trim());
    if (ok) {
      toast({ title: t('blDashboardUpdated') });
      setEditingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await deleteBLDashboard(id);
    if (ok) toast({ title: t('blDashboardDeleted') });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <LayoutDashboard className="h-5 w-5 text-primary" />
          {t('manageBLDashboards')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Existing dashboards */}
        <div className="border rounded-md divide-y">
          {blDashboards.map((d) => (
            <div key={d.id} className="flex items-center justify-between p-3">
              {editingId === d.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdate(d.id)}
                    className="h-8"
                  />
                  <Button size="sm" onClick={() => handleUpdate(d.id)}>{t('save')}</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>{t('cancel')}</Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                    <span className={d.id === currentBLDashboardId ? 'font-semibold' : ''}>{d.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8"
                      onClick={() => { setEditingId(d.id); setEditingName(d.name); }}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8"
                      onClick={() => handleDelete(d.id)}
                      disabled={blDashboards.length <= 1}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Add new */}
        {showAdd ? (
          <div className="flex items-center gap-2">
            <Input
              placeholder={t('blDashboardName')}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              className="h-8"
            />
            <Button size="sm" onClick={handleAdd}>{t('save')}</Button>
            <Button size="sm" variant="ghost" onClick={() => { setShowAdd(false); setNewName(''); }}>{t('cancel')}</Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setShowAdd(true)} className="gap-1.5">
            <Plus className="h-4 w-4" /> {t('addBLDashboard')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default BLDashboardManager;
