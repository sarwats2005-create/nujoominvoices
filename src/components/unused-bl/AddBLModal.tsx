import React, { useState, useCallback, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUnusedBL } from '@/hooks/useUnusedBL';
import { useUnusedBLSettings } from '@/hooks/useUnusedBLSettings';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Upload, X, Plus, Save, FileText, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { SettingType } from '@/types/unusedBL';

interface FileEntry {
  file: File;
  pageLabel: string;
}

interface AddBLModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddBLModal: React.FC<AddBLModalProps> = ({ open, onOpenChange }) => {
  const { t } = useLanguage();
  const { createRecord, checkContainerWarning } = useUnusedBL();
  const { getByType, addSetting } = useUnusedBLSettings();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<FileEntry[]>([]);
  const [blNo, setBlNo] = useState('');
  const [containerNo, setContainerNo] = useState('');
  const [owner, setOwner] = useState('');
  const [clearanceCompany, setClearanceCompany] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [blDate, setBlDate] = useState<Date | undefined>();
  const [blDateText, setBlDateText] = useState('');
  const [clearanceDate, setClearanceDate] = useState<Date | undefined>();
  const [clearanceDateText, setClearanceDateText] = useState('');
  const [quantityValue, setQuantityValue] = useState('');
  const [quantityUnit, setQuantityUnit] = useState('');
  const [shipperName, setShipperName] = useState('');
  const [portOfLoading, setPortOfLoading] = useState('');
  const [receivedDate, setReceivedDate] = useState<Date | undefined>();
  const [receivedDateText, setReceivedDateText] = useState('');
  const [receivedDateOpen, setReceivedDateOpen] = useState(false);
  const [containerWarning, setContainerWarning] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [blDateOpen, setBlDateOpen] = useState(false);
  const [clearanceDateOpen, setClearanceDateOpen] = useState(false);
  const [addingNew, setAddingNew] = useState<{ type: SettingType; value: string } | null>(null);

  const owners = getByType('owner');
  const clearanceCompanies = getByType('clearance_company');
  const productCategories = getByType('product_category');
  const quantityUnits = getByType('quantity_unit');
  const ports = getByType('port_of_loading');

  const resetForm = () => {
    setFiles([]); setBlNo(''); setContainerNo(''); setOwner('');
    setClearanceCompany(''); setProductDescription(''); setProductCategory('');
    setBlDate(undefined); setBlDateText(''); setClearanceDate(undefined); setClearanceDateText('');
    setQuantityValue(''); setQuantityUnit(''); setShipperName(''); setPortOfLoading('');
    setReceivedDate(undefined); setReceivedDateText(''); setContainerWarning(''); setError(''); setAddingNew(null);
  };

  const parseDateText = (text: string): Date | null => {
    const match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!match) return null;
    const d = new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
    return isNaN(d.getTime()) ? null : d;
  };

  const handleBlDateText = (text: string) => {
    setBlDateText(text);
    const d = parseDateText(text);
    if (d) setBlDate(d);
  };

  const handleClearanceDateText = (text: string) => {
    setClearanceDateText(text);
    const d = parseDateText(text);
    if (d) setClearanceDate(d);
  };

  const handleReceivedDateText = (text: string) => {
    setReceivedDateText(text);
    const d = parseDateText(text);
    if (d) setReceivedDate(d);
  };

  const handleContainerChange = async (val: string) => {
    const upper = val.toUpperCase();
    setContainerNo(upper);
    if (upper.length >= 3) {
      const warning = await checkContainerWarning(upper);
      setContainerWarning(warning || '');
    } else {
      setContainerWarning('');
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files).filter(f =>
      f.type === 'application/pdf' || f.type.startsWith('image/')
    );
    setFiles(prev => [...prev, ...dropped.map(file => ({ file, pageLabel: '' }))]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []).filter(f =>
      f.type === 'application/pdf' || f.type.startsWith('image/')
    );
    setFiles(prev => [...prev, ...selected.map(file => ({ file, pageLabel: '' }))]);
    e.target.value = '';
  };

  const removeFile = (index: number) => setFiles(prev => prev.filter((_, i) => i !== index));

  const updatePageLabel = (index: number, label: string) => {
    setFiles(prev => prev.map((f, i) => i === index ? { ...f, pageLabel: label } : f));
  };

  const handleAddNew = async (type: SettingType) => {
    if (!addingNew?.value.trim()) return;
    const val = addingNew.value.trim().toUpperCase();
    const ok = await addSetting(type, val);
    if (ok) {
      if (type === 'owner') setOwner(val);
      if (type === 'clearance_company') setClearanceCompany(val);
      if (type === 'product_category') setProductCategory(val);
      if (type === 'quantity_unit') setQuantityUnit(val);
      if (type === 'port_of_loading') setPortOfLoading(val);
      setAddingNew(null);
    }
  };

  const validate = (): boolean => {
    if (files.length === 0) { setError('Please upload at least one file'); return false; }
    if (!blNo.trim()) { setError('B/L number is required'); return false; }
    if (!containerNo.trim()) { setError('Container number is required'); return false; }
    if (!owner.trim()) { setError('Owner is required'); return false; }
    if (!clearanceCompany) { setError('Clearance company is required'); return false; }
    if (!productDescription.trim()) { setError('Product description is required'); return false; }
    if (!productCategory) { setError('Product category is required'); return false; }
    if (!blDate) { setError('B/L date is required'); return false; }
    if (!clearanceDate) { setError('Clearance date is required'); return false; }
    if (!portOfLoading) { setError('Port of loading is required'); return false; }
    if (!receivedDate) { setError('Received date is required'); return false; }
    setError('');
    return true;
  };

  const buildData = () => ({
    bl_no: blNo.trim().toUpperCase(),
    container_no: containerNo.trim().toUpperCase(),
    owner: owner.trim().toUpperCase(),
    clearance_company: clearanceCompany,
    product_description: productDescription.trim(),
    product_category: productCategory,
    bl_date: format(blDate!, 'yyyy-MM-dd'),
    clearance_date: format(clearanceDate!, 'yyyy-MM-dd'),
    quantity_value: quantityValue ? parseFloat(quantityValue) : null,
    quantity_unit: quantityUnit || null,
    shipper_name: shipperName.trim() || null,
    port_of_loading: portOfLoading,
    received_date: format(receivedDate!, 'yyyy-MM-dd'),
  });

  const handleSave = async () => {
    if (!validate()) return;
    setSubmitting(true);
    const result = await createRecord(buildData() as any, files.map(f => ({ file: f.file, pageLabel: f.pageLabel })));
    setSubmitting(false);
    if (result.success) {
      toast({ title: t('blRecordSaved') });
      resetForm();
      onOpenChange(false);
    } else {
      setError(result.error === 'duplicate_bl' ? t('duplicateBLWarning') : (result.error || 'Error saving'));
    }
  };

  const handleSaveAndNew = async () => {
    if (!validate()) return;
    setSubmitting(true);
    const result = await createRecord(buildData() as any, files.map(f => ({ file: f.file, pageLabel: f.pageLabel })));
    setSubmitting(false);
    if (result.success) {
      toast({ title: t('blRecordSaved') });
      resetForm();
    } else {
      setError(result.error === 'duplicate_bl' ? t('duplicateBLWarning') : (result.error || 'Error saving'));
    }
  };

  const SettingDropdown: React.FC<{
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: string[];
    type: SettingType;
    required?: boolean;
  }> = ({ label, value, onChange, options, type, required }) => (
    <div className="space-y-1.5">
      <Label>{label} {required && <span className="text-destructive">*</span>}</Label>
      <div className="flex gap-1.5">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            {options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>
        {addingNew?.type === type ? (
          <div className="flex gap-1">
            <Input
              value={addingNew.value}
              onChange={e => setAddingNew({ type, value: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleAddNew(type)}
              placeholder={t('addNewOption')}
              className="w-28 h-10"
              autoFocus
            />
            <Button type="button" size="icon" variant="outline" onClick={() => handleAddNew(type)} className="h-10 w-10 shrink-0">
              <Plus className="h-4 w-4" />
            </Button>
            <Button type="button" size="icon" variant="ghost" onClick={() => setAddingNew(null)} className="h-10 w-10 shrink-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button type="button" variant="outline" size="icon" onClick={() => setAddingNew({ type, value: '' })} className="h-10 w-10 shrink-0">
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); onOpenChange(o); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" /> {t('addBL')}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        {/* Upload Section */}
        <div className="space-y-3">
          <Label>{t('uploadFiles')} <span className="text-destructive">*</span></Label>
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
          >
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{t('dragDropHint')}</p>
            <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG</p>
          </div>
          <input ref={fileInputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileSelect} className="hidden" />

          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((entry, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 border rounded-md bg-muted/20">
                  {entry.file.type === 'application/pdf' ? (
                    <FileText className="h-4 w-4 text-destructive shrink-0" />
                  ) : (
                    <ImageIcon className="h-4 w-4 text-primary shrink-0" />
                  )}
                  <span className="text-sm truncate flex-1">{entry.file.name}</span>
                  <Input
                    value={entry.pageLabel}
                    onChange={e => updatePageLabel(idx, e.target.value)}
                    placeholder={t('pageLabel')}
                    className="w-28 h-7 text-xs"
                  />
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeFile(idx)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                PDF may contain multiple pages. You can add missing pages later.
              </p>
            </div>
          )}
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>B/L Number <span className="text-destructive">*</span></Label>
            <Input value={blNo} onChange={e => setBlNo(e.target.value.toUpperCase())} placeholder="Enter B/L number" className="uppercase" />
          </div>

          <div className="space-y-1.5">
            <Label>{t('containerNumber')} <span className="text-destructive">*</span></Label>
            <Input value={containerNo} onChange={e => handleContainerChange(e.target.value)} placeholder="Enter container number" className="uppercase" />
            {containerWarning && (
              <p className="text-xs text-warning flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> {containerWarning}
              </p>
            )}
          </div>

          <SettingDropdown label={t('owner')} value={owner} onChange={setOwner}
            options={owners} type="owner" required />

          <SettingDropdown label={t('clearanceCompany')} value={clearanceCompany} onChange={setClearanceCompany}
            options={clearanceCompanies} type="clearance_company" required />

          <div className="sm:col-span-2 space-y-1.5">
            <Label>{t('productDescription')} <span className="text-destructive">*</span></Label>
            <Textarea value={productDescription} onChange={e => setProductDescription(e.target.value)}
              placeholder="Describe the product" className="min-h-[60px] resize-none" />
          </div>

          <SettingDropdown label={t('productCategory')} value={productCategory} onChange={setProductCategory}
            options={productCategories} type="product_category" required />

          <SettingDropdown label={t('portOfLoading')} value={portOfLoading} onChange={setPortOfLoading}
            options={ports} type="port_of_loading" required />

          {/* B/L Date */}
          <div className="space-y-1.5">
            <Label>{t('blDate')} <span className="text-destructive">*</span></Label>
            <div className="flex gap-1.5">
              <Input value={blDateText} onChange={e => handleBlDateText(e.target.value)}
                placeholder="DD/MM/YYYY" className="flex-1" />
              <Popover open={blDateOpen} onOpenChange={setBlDateOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="h-10 w-10 shrink-0">
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={blDate}
                    onSelect={d => { setBlDate(d); if (d) setBlDateText(format(d, 'dd/MM/yyyy')); setBlDateOpen(false); }}
                    className="pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Clearance Date */}
          <div className="space-y-1.5">
            <Label>{t('clearanceDate')} <span className="text-destructive">*</span></Label>
            <div className="flex gap-1.5">
              <Input value={clearanceDateText} onChange={e => handleClearanceDateText(e.target.value)}
                placeholder="DD/MM/YYYY" className="flex-1" />
              <Popover open={clearanceDateOpen} onOpenChange={setClearanceDateOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="h-10 w-10 shrink-0">
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={clearanceDate}
                    onSelect={d => { setClearanceDate(d); if (d) setClearanceDateText(format(d, 'dd/MM/yyyy')); setClearanceDateOpen(false); }}
                    className="pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-1.5">
            <Label>{t('quantity')}</Label>
            <div className="flex gap-1.5">
              <Input value={quantityValue} onChange={e => setQuantityValue(e.target.value)}
                placeholder="0" type="number" className="w-24" />
              <Select value={quantityUnit} onValueChange={setQuantityUnit}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {quantityUnits.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
              {addingNew?.type === 'quantity_unit' ? (
                <div className="flex gap-1">
                  <Input value={addingNew.value} onChange={e => setAddingNew({ type: 'quantity_unit', value: e.target.value })}
                    onKeyDown={e => e.key === 'Enter' && handleAddNew('quantity_unit')}
                    placeholder="New unit" className="w-20 h-10" autoFocus />
                  <Button type="button" size="icon" variant="outline" onClick={() => handleAddNew('quantity_unit')} className="h-10 w-10">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button type="button" variant="outline" size="icon" onClick={() => setAddingNew({ type: 'quantity_unit', value: '' })} className="h-10 w-10">
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{t('shipperName')}</Label>
            <Input value={shipperName} onChange={e => setShipperName(e.target.value)} placeholder="Shipper name (optional)" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => { resetForm(); onOpenChange(false); }}>{t('cancel')}</Button>
          <Button variant="secondary" onClick={handleSaveAndNew} disabled={submitting} className="gap-2">
            <Plus className="h-4 w-4" /> {t('saveAndAddAnother')}
          </Button>
          <Button onClick={handleSave} disabled={submitting} className="gap-2">
            <Save className="h-4 w-4" /> {t('save')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddBLModal;
