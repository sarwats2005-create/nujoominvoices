import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useInvoice } from '@/contexts/InvoiceContext';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react';

interface BankSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const BankSelector: React.FC<BankSelectorProps> = ({ value, onChange }) => {
  const { t } = useLanguage();
  const { banks, addBank, updateBank, deleteBank } = useInvoice();
  const { toast } = useToast();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newBankName, setNewBankName] = useState('');
  const [editBankId, setEditBankId] = useState<string | null>(null);
  const [editBankName, setEditBankName] = useState('');

  const handleAddBank = () => {
    if (newBankName.trim()) {
      addBank(newBankName.trim());
      setNewBankName('');
      setIsAddOpen(false);
      toast({ title: t('bankAdded') });
    }
  };

  const handleEditBank = () => {
    if (editBankId && editBankName.trim()) {
      updateBank(editBankId, editBankName.trim());
      setEditBankId(null);
      setEditBankName('');
      setIsEditOpen(false);
      toast({ title: t('bankAdded') });
    }
  };

  const handleDeleteBank = (id: string) => {
    deleteBank(id);
    if (value === banks.find(b => b.id === id)?.name) {
      onChange('');
    }
    toast({ title: t('bankDeleted') });
  };

  const openEditDialog = (bank: { id: string; name: string }) => {
    setEditBankId(bank.id);
    setEditBankName(bank.name);
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="flex-1">
            <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder={t('selectBank')} />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            {banks.map((bank) => (
              <div key={bank.id} className="flex items-center group">
                <SelectItem value={bank.name} className="flex-1">
                  {bank.name}
                </SelectItem>
                <div className="flex gap-1 pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditDialog(bank);
                    }}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteBank(bank.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </SelectContent>
        </Select>

        {/* Add Bank Dialog */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card">
            <DialogHeader>
              <DialogTitle>{t('addBank')}</DialogTitle>
              <DialogDescription>{t('bankName')}</DialogDescription>
            </DialogHeader>
            <Input
              value={newBankName}
              onChange={(e) => setNewBankName(e.target.value)}
              placeholder={t('bankName')}
              onKeyDown={(e) => e.key === 'Enter' && handleAddBank()}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                {t('cancel')}
              </Button>
              <Button onClick={handleAddBank}>{t('save')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Bank Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>{t('editBank')}</DialogTitle>
            <DialogDescription>{t('bankName')}</DialogDescription>
          </DialogHeader>
          <Input
            value={editBankName}
            onChange={(e) => setEditBankName(e.target.value)}
            placeholder={t('bankName')}
            onKeyDown={(e) => e.key === 'Enter' && handleEditBank()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleEditBank}>{t('save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BankSelector;
