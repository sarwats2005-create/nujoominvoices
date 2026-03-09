import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUnusedBL } from '@/hooks/useUnusedBL';
import { useUnusedBLSettings } from '@/hooks/useUnusedBLSettings';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Edit2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import type { UnusedBL } from '@/types/unusedBL';

interface EditBLModalProps {
  record: UnusedBL;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditBLModal: React.FC<EditBLModalProps> = ({ record, open, onOpenChange }) => {
  const { t } = useLanguage();
  const { updateRecord } = useUnusedBL();
  const { settings, loading: settingsLoading } = useUnusedBLSettings();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    bl_no: record.bl_no,
    container_no: record.container_no,
    owner: record.owner,
    clearance_company: record.clearance_company,
    product_description: record.product_description,
    product_category: record.product_category,
    bl_date: record.bl_date,
    clearance_date: record.clearance_date,
    quantity_value: record.quantity_value?.toString() || '',
    quantity_unit: record.quantity_unit || '',
    shipper_name: record.shipper_name || '',
    port_of_loading: record.port_of_loading,
  });

  const [blDateOpen, setBlDateOpen] = useState(false);
  const [clearanceDateOpen, setClearanceDateOpen] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData({
        bl_no: record.bl_no,
        container_no: record.container_no,
        owner: record.owner,
        clearance_company: record.clearance_company,
        product_description: record.product_description,
        product_category: record.product_category,
        bl_date: record.bl_date,
        clearance_date: record.clearance_date,
        quantity_value: record.quantity_value?.toString() || '',
        quantity_unit: record.quantity_unit || '',
        shipper_name: record.shipper_name || '',
        port_of_loading: record.port_of_loading,
      });
      setError('');
    }
  }, [open, record]);

  const handleSubmit = async () => {
    if (!formData.bl_no.trim() || !formData.container_no.trim() || !formData.owner.trim()) {
      setError('B/L No, Container No, and Owner are required');
      return;
    }

    setError('');
    setSubmitting(true);

    const success = await updateRecord(record.id, {
      bl_no: formData.bl_no.trim().toUpperCase(),
      container_no: formData.container_no.trim().toUpperCase(),
      owner: formData.owner.trim().toUpperCase(),
      clearance_company: formData.clearance_company.trim().toUpperCase(),
      product_description: formData.product_description.trim(),
      product_category: formData.product_category,
      bl_date: formData.bl_date,
      clearance_date: formData.clearance_date,
      quantity_value: formData.quantity_value ? parseFloat(formData.quantity_value) : null,
      quantity_unit: formData.quantity_unit || null,
      shipper_name: formData.shipper_name.trim() || null,
      port_of_loading: formData.port_of_loading,
    });

    setSubmitting(false);

    if (success) {
      toast({ title: t('blRecordUpdated') || 'B/L record updated successfully' });
      onOpenChange(false);
    } else {
      setError('Failed to update record. Please try again.');
    }
  };

  const formatDate = (dateStr: string) => {
    try { return format(new Date(dateStr), 'dd/MM/yyyy'); } catch { return dateStr; }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit2 className="h-5 w-5 text-primary" /> {t('editBL') || 'Edit B/L Record'}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{t('blNo')} <span className="text-destructive">*</span></Label>
              <Input value={formData.bl_no} onChange={e => setFormData(p => ({ ...p, bl_no: e.target.value.toUpperCase() }))} className="uppercase" />
            </div>
            <div className="space-y-1.5">
              <Label>{t('containerNumber')} <span className="text-destructive">*</span></Label>
              <Input value={formData.container_no} onChange={e => setFormData(p => ({ ...p, container_no: e.target.value.toUpperCase() }))} className="uppercase" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{t('owner')} <span className="text-destructive">*</span></Label>
            <Input value={formData.owner} onChange={e => setFormData(p => ({ ...p, owner: e.target.value.toUpperCase() }))} className="uppercase" />
          </div>

          <div className="space-y-1.5">
            <Label>{t('clearanceCompany')}</Label>
            <Select value={formData.clearance_company} onValueChange={v => setFormData(p => ({ ...p, clearance_company: v }))}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent className="bg-popover">
                {settings.clearance_company.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{t('blDate')}</Label>
              <Popover open={blDateOpen} onOpenChange={setBlDateOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDate(formData.bl_date)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={new Date(formData.bl_date)}
                    onSelect={d => { if (d) { setFormData(p => ({ ...p, bl_date: format(d, 'yyyy-MM-dd') })); setBlDateOpen(false); } }}
                    className="pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1.5">
              <Label>{t('clearanceDate')}</Label>
              <Popover open={clearanceDateOpen} onOpenChange={setClearanceDateOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDate(formData.clearance_date)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={new Date(formData.clearance_date)}
                    onSelect={d => { if (d) { setFormData(p => ({ ...p, clearance_date: format(d, 'yyyy-MM-dd') })); setClearanceDateOpen(false); } }}
                    className="pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{t('productCategory')}</Label>
            <Select value={formData.product_category} onValueChange={v => setFormData(p => ({ ...p, product_category: v }))}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent className="bg-popover">
                {settings.product_category.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>{t('productDescription')}</Label>
            <Textarea value={formData.product_description} onChange={e => setFormData(p => ({ ...p, product_description: e.target.value }))} rows={2} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{t('quantityValue')}</Label>
              <Input type="number" value={formData.quantity_value} onChange={e => setFormData(p => ({ ...p, quantity_value: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>{t('quantityUnit')}</Label>
              <Select value={formData.quantity_unit} onValueChange={v => setFormData(p => ({ ...p, quantity_unit: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent className="bg-popover">
                  {settings.quantity_unit.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{t('portOfLoading')}</Label>
            <Select value={formData.port_of_loading} onValueChange={v => setFormData(p => ({ ...p, port_of_loading: v }))}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent className="bg-popover">
                {settings.port_of_loading.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>{t('shipperName')}</Label>
            <Input value={formData.shipper_name} onChange={e => setFormData(p => ({ ...p, shipper_name: e.target.value }))} />
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('cancel')}</Button>
          <Button onClick={handleSubmit} disabled={submitting} className="gap-2">
            <Edit2 className="h-4 w-4" /> {t('saveChanges') || 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditBLModal;
