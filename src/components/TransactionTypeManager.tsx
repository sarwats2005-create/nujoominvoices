import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tag, Plus, Trash2, Pencil, Check, X, ArrowUp, ArrowDown } from 'lucide-react';
import { useTransactionTypes, TYPE_COLOR_PRESETS, TransactionType } from '@/hooks/useTransactionTypes';
import { useLanguage } from '@/contexts/LanguageContext';

const ColorPicker: React.FC<{ value: string; onChange: (c: string) => void }> = ({ value, onChange }) => (
  <div className="flex flex-wrap gap-1.5">
    {TYPE_COLOR_PRESETS.map(c => (
      <button
        key={c}
        type="button"
        onClick={() => onChange(c)}
        className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${
          value === c ? 'border-foreground scale-110' : 'border-transparent'
        }`}
        style={{ backgroundColor: c }}
        aria-label={c}
      />
    ))}
  </div>
);

const TransactionTypeManager: React.FC = () => {
  const { types, addType, updateType, deleteType } = useTransactionTypes();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [code, setCode] = useState('');
  const [label, setLabel] = useState('');
  const [color, setColor] = useState(TYPE_COLOR_PRESETS[0]);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{ code: string; label: string; color: string }>({
    code: '',
    label: '',
    color: TYPE_COLOR_PRESETS[0],
  });

  const handleAdd = async () => {
    if (!code.trim()) {
      toast({ title: t('transactionTypeCodeRequired') || 'Code is required', variant: 'destructive' });
      return;
    }
    if (types.some(ty => ty.code.toLowerCase() === code.trim().toLowerCase())) {
      toast({ title: t('transactionTypeDuplicate') || 'This code already exists', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const ok = await addType(code, label, color);
    setSaving(false);
    if (ok) {
      setCode('');
      setLabel('');
      setColor(TYPE_COLOR_PRESETS[(types.length + 1) % TYPE_COLOR_PRESETS.length]);
      toast({ title: t('transactionTypeAdded') || 'Transaction type added' });
    } else {
      toast({ title: t('somethingWentWrong') || 'Something went wrong', variant: 'destructive' });
    }
  };

  const startEdit = (ty: TransactionType) => {
    setEditingId(ty.id);
    setEditDraft({ code: ty.code, label: ty.label, color: ty.color });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    if (!editDraft.code.trim()) {
      toast({ title: t('transactionTypeCodeRequired') || 'Code is required', variant: 'destructive' });
      return;
    }
    const ok = await updateType(editingId, editDraft);
    if (ok) {
      setEditingId(null);
      toast({ title: t('transactionTypeUpdated') || 'Transaction type updated' });
    } else {
      toast({ title: t('somethingWentWrong') || 'Something went wrong', variant: 'destructive' });
    }
  };

  const handleDelete = async (ty: TransactionType) => {
    const ok = await deleteType(ty.id);
    toast({
      title: ok
        ? t('transactionTypeDeleted') || 'Transaction type deleted'
        : t('somethingWentWrong') || 'Something went wrong',
      variant: ok ? undefined : 'destructive',
    });
  };

  const move = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= types.length) return;
    const a = types[index];
    const b = types[target];
    await updateType(a.id, { sortOrder: target });
    await updateType(b.id, { sortOrder: index });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          {t('transactionTypes') || 'Transaction Types'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add form */}
        <div className="grid gap-3 md:grid-cols-[120px_1fr_auto] md:items-end">
          <div className="space-y-1.5">
            <Label>{t('transactionTypeCode') || 'Code'}</Label>
            <Input value={code} onChange={e => setCode(e.target.value)} placeholder="01" maxLength={12} />
          </div>
          <div className="space-y-1.5">
            <Label>{t('transactionTypeLabel') || 'Label'}</Label>
            <Input
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder={t('transactionTypeLabelPlaceholder') || 'Description (optional)'}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
          </div>
          <Button onClick={handleAdd} disabled={saving} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {t('add') || 'Add'}
          </Button>
          <div className="md:col-span-3">
            <ColorPicker value={color} onChange={setColor} />
          </div>
        </div>

        {/* List */}
        <div className="space-y-2">
          {types.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {t('noTransactionTypes') || 'No transaction types yet. Add your first one above.'}
            </p>
          )}
          {types.map((ty, i) => (
            <div key={ty.id} className="rounded-lg border border-border p-3">
              {editingId === ty.id ? (
                <div className="space-y-3">
                  <div className="grid gap-2 sm:grid-cols-[120px_1fr]">
                    <Input
                      value={editDraft.code}
                      onChange={e => setEditDraft(d => ({ ...d, code: e.target.value }))}
                      maxLength={12}
                    />
                    <Input
                      value={editDraft.label}
                      onChange={e => setEditDraft(d => ({ ...d, label: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && saveEdit()}
                    />
                  </div>
                  <ColorPicker value={editDraft.color} onChange={c => setEditDraft(d => ({ ...d, color: c }))} />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveEdit} className="flex items-center gap-1">
                      <Check className="h-4 w-4" />
                      {t('save') || 'Save'}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="flex items-center gap-1">
                      <X className="h-4 w-4" />
                      {t('cancel') || 'Cancel'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span
                    className="inline-flex min-w-[3rem] justify-center rounded-md px-2 py-1 text-xs font-semibold text-primary-foreground"
                    style={{ backgroundColor: ty.color }}
                  >
                    {ty.code}
                  </span>
                  <span className="flex-1 truncate text-sm">{ty.label}</span>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" onClick={() => move(i, -1)} disabled={i === 0}>
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => move(i, 1)} disabled={i === types.length - 1}>
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => startEdit(ty)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(ty)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionTypeManager;
