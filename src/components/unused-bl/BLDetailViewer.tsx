import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUnusedBL } from '@/hooks/useUnusedBL';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Download, Eye, Upload, FileText, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import type { UnusedBL, UnusedBLFile } from '@/types/unusedBL';

interface BLDetailViewerProps {
  record: UnusedBL;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BLDetailViewer: React.FC<BLDetailViewerProps> = ({ record, open, onOpenChange }) => {
  const { t } = useLanguage();
  const { getFiles, getSignedUrl, uploadFiles } = useUnusedBL();
  const { toast } = useToast();
  const [files, setFiles] = useState<UnusedBLFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && record.id) {
      setLoadingFiles(true);
      getFiles(record.id).then(f => { setFiles(f); setLoadingFiles(false); });
    }
  }, [open, record.id]);

  const handleView = async (file: UnusedBLFile) => {
    const url = await getSignedUrl(file.file_url);
    if (url) window.open(url, '_blank');
  };

  const handleDownload = async (file: UnusedBLFile) => {
    const url = await getSignedUrl(file.file_url);
    if (url) {
      const a = document.createElement('a');
      a.href = url;
      a.download = file.original_filename;
      a.click();
    }
  };

  const handleAddPages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []).filter(f =>
      f.type === 'application/pdf' || f.type.startsWith('image/')
    );
    if (selected.length === 0) return;
    await uploadFiles(record.id, selected.map(file => ({ file })));
    const updatedFiles = await getFiles(record.id);
    setFiles(updatedFiles);
    toast({ title: 'Pages added successfully' });
    e.target.value = '';
  };

  const formatDate = (d: string) => {
    try { return format(new Date(d), 'dd/MM/yyyy'); } catch { return d; }
  };

  const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="flex justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground text-right max-w-[60%]">{value}</span>
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" /> {t('blDetails')}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Status */}
          <div className="flex justify-center gap-2">
            <Badge variant={record.status === 'UNUSED' ? 'default' : 'secondary'}
              className={`text-sm px-4 py-1 ${record.status === 'USED' ? 'bg-success/20 text-success border-success/30' : ''}`}>
              {record.status}
            </Badge>
            {record.reverted_at && (
              <Badge variant="outline" className="text-sm px-4 py-1 bg-amber-500/10 text-amber-600 border-amber-500/30">
                Reverted
              </Badge>
            )}
          </div>

          {/* Details */}
          <div className="bg-muted/20 rounded-lg p-4">
            <DetailRow label="B/L No" value={<span className="font-mono">{record.bl_no}</span>} />
            <DetailRow label={t('containerNumber')} value={<span className="font-mono">{record.container_no}</span>} />
            <DetailRow label="Owner" value={record.owner} />
            <DetailRow label={t('clearanceCompany')} value={record.clearance_company} />
            <DetailRow label={t('productDescription')} value={record.product_description} />
            <DetailRow label={t('productCategory')} value={<Badge variant="secondary">{record.product_category}</Badge>} />
            <DetailRow label={t('blDate')} value={formatDate(record.bl_date)} />
            <DetailRow label={t('clearanceDate')} value={formatDate(record.clearance_date)} />
            {(record.quantity_value != null) && (
              <DetailRow label={t('quantity')} value={`${record.quantity_value} ${record.quantity_unit || ''}`} />
            )}
            {record.shipper_name && <DetailRow label={t('shipperName')} value={record.shipper_name} />}
            <DetailRow label={t('portOfLoading')} value={record.port_of_loading} />
            {record.received_date && <DetailRow label="Received Date" value={formatDate(record.received_date)} />}
            {record.used_at && <DetailRow label="Used At" value={formatDate(record.used_at)} />}
          </div>

          {/* Previous Usage Data (if reverted) */}
          {record.original_used_data && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs">Reverted</Badge>
                Previous Usage
              </h3>
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4">
                <DetailRow label="Used For" value={record.original_used_data.used_for} />
                {record.original_used_data.used_for_beneficiary && (
                  <DetailRow label="Beneficiary" value={record.original_used_data.used_for_beneficiary} />
                )}
                <DetailRow label="Invoice Amount" value={`${record.original_used_data.currency || 'USD'} ${record.original_used_data.invoice_amount?.toLocaleString()}`} />
                <DetailRow label="Invoice Date" value={formatDate(record.original_used_data.invoice_date)} />
                <DetailRow label="Bank" value={record.original_used_data.bank} />
                {record.revert_reason && <DetailRow label="Revert Reason" value={record.revert_reason} />}
                {record.reverted_at && <DetailRow label="Reverted At" value={formatDate(record.reverted_at)} />}
              </div>
              <p className="text-xs text-muted-foreground italic">Pre-filled from previous usage when marking as used again.</p>
            </div>
          )}

          {/* Files */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">{t('files')}</h3>
              {record.status === 'UNUSED' && (
                <>
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="gap-1.5">
                    <Upload className="h-3.5 w-3.5" /> {t('addPages')}
                  </Button>
                  <input ref={fileInputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleAddPages} className="hidden" />
                </>
              )}
            </div>

            {loadingFiles ? (
              <p className="text-sm text-muted-foreground">{t('loading')}</p>
            ) : files.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('noFilesUploaded')}</p>
            ) : (
              <div className="space-y-2">
                {files.map(file => (
                  <div key={file.id} className="flex items-center gap-2 p-3 border rounded-lg bg-card">
                    {file.file_type === 'PDF' ? (
                      <FileText className="h-5 w-5 text-destructive shrink-0" />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-primary shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.original_filename}</p>
                      {file.page_label && <p className="text-xs text-muted-foreground">{file.page_label}</p>}
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleView(file)} title={t('view')}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownload(file)} title={t('download')}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default BLDetailViewer;
