import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUsedBL } from '@/hooks/useUsedBL';
import { useUnusedBL } from '@/hooks/useUnusedBL';
import { useToast } from '@/hooks/use-toast';
import UsedBLCard from '@/components/UsedBLCard';
import RevertBLModal from '@/components/unused-bl/RevertBLModal';
import UseBLModal from '@/components/unused-bl/UseBLModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Undo2, Plus, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { parseDateString } from '@/lib/dateUtils';
import jsPDF from 'jspdf';
import type { UsedBL } from '@/types/usedBL';
import type { UnusedBL } from '@/types/unusedBL';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const UsedBLDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRecord, currentDashboardName, blDashboards } = useUsedBL();
  const { revertBL, records: unusedRecords } = useUnusedBL();
  const { user } = useAuth();
  const { toast } = useToast();
  const [record, setRecord] = useState<UsedBL | null>(null);
  const [sourceRecord, setSourceRecord] = useState<UnusedBL | null>(null);
  const [siblingRecords, setSiblingRecords] = useState<UsedBL[]>([]);
  const [loading, setLoading] = useState(true);
  const [revertOpen, setRevertOpen] = useState(false);
  const [addInvoiceOpen, setAddInvoiceOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id || !user) return;
      const data = await getRecord(id);
      setRecord(data);
      if (data?.source_unused_bl_id) {
        // Fetch source unused_bl details
        const { data: src } = await (supabase as any).from('unused_bl')
          .select('*')
          .eq('id', data.source_unused_bl_id)
          .single();
        if (src) setSourceRecord(src as UnusedBL);

        // Fetch sibling records (same source_unused_bl_id, different id)
        const { data: siblings } = await (supabase as any).from('used_bl_counting')
          .select('*')
          .eq('source_unused_bl_id', data.source_unused_bl_id)
          .eq('user_id', user.id)
          .eq('is_active', true)
          .neq('id', id)
          .order('created_at', { ascending: false });
        if (siblings) setSiblingRecords(siblings as UsedBL[]);
      }
      setLoading(false);
    };
    load();
  }, [id, getRecord, user]);

  const recordDashboardName = record?.dashboard_id
    ? blDashboards.find(d => d.id === record.dashboard_id)?.name || currentDashboardName
    : currentDashboardName;

  const canRevert = record?.source_unused_bl_id != null;

  const handleRevert = async (reason: string) => {
    if (!record) return;
    const ok = await revertBL(record.id, reason);
    if (ok) {
      toast({ title: 'B/L reverted to Unused', description: `${record.bl_no} has been restored to the Unused B/L list.` });
      navigate('/unused-bl');
    } else {
      toast({ title: 'Revert failed', description: 'No changes were saved. Please try again.', variant: 'destructive' });
    }
  };

  const formatAmount = (amount: number, curr?: string) => {
    const symbol = curr === 'EUR' ? '€' : curr === 'GBP' ? '£' : curr === 'IQD' ? 'د.ع' : curr === 'TRY' ? '₺' : curr === 'SAR' ? '﷼' : curr === 'AED' ? 'د.إ' : '$';
    return `${symbol}${Math.round(amount).toLocaleString()}`;
  };

  const handlePrint = () => {
    if (!record) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const currCode = record.currency || 'USD';
    const fmtAmt = (amount: number) => `${currCode} ${Math.round(amount).toLocaleString()}`;
    printWindow.document.write(`
      <!DOCTYPE html><html><head><title>BL_${record.bl_no}</title>
      <style>body{font-family:Arial,sans-serif;display:flex;justify-content:center;padding:40px}.card{max-width:500px;width:100%;border:2px solid #1e3a5f;border-radius:12px;overflow:hidden}.header{background:#1e3a5f;color:white;text-align:center;padding:16px;font-size:20px;font-weight:bold}.row{display:flex;border-bottom:1px solid #ddd}.row:last-child{border-bottom:none}.label{width:40%;background:#e8f0fe;padding:12px 16px;font-weight:600;font-size:14px;border-right:1px solid #ddd}.value{width:60%;background:#f8f9fa;padding:12px 16px;font-size:14px}@media print{body{padding:20px}}</style>
      </head><body><div class="card">
      <div class="header" dir="rtl">${recordDashboardName || 'حوالات محمد خاص'}</div>
      <div class="row"><div class="label">B/L NO.</div><div class="value">${record.bl_no}</div></div>
      <div class="row"><div class="label">CONTAINER NO.</div><div class="value">${record.container_no}</div></div>
      <div class="row"><div class="label">INVOICE AMOUNT:</div><div class="value">${fmtAmt(record.invoice_amount)}</div></div>
      <div class="row"><div class="label">INVOICE DATE:</div><div class="value">${format(parseDateString(record.invoice_date), 'dd/MM/yyyy')}</div></div>
      <div class="row"><div class="label">BANK:</div><div class="value">${record.bank}</div></div>
      <div class="row"><div class="label">OWNER:</div><div class="value">${record.owner}</div></div>
      <div class="row"><div class="label">USED FOR:</div><div class="value">${record.used_for}</div></div>
      ${record.used_for_beneficiary ? `<div class="row"><div class="label">BENEFICIARY:</div><div class="value">${record.used_for_beneficiary}</div></div>` : ''}
      ${record.notes ? `<div class="row"><div class="label">NOTES:</div><div class="value">${record.notes}</div></div>` : ''}
      </div></body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  const handleExportPDF = () => {
    if (!record) return;
    const currCode2 = record.currency || 'USD';
    const fmtAmt = (amount: number) => `${currCode2} ${Math.round(amount).toLocaleString()}`;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const startX = 30; let currentY = 30; const cardWidth = 150; const labelWidth = 60; const valueWidth = 90; const rowHeight = 12;
    doc.setFillColor(30, 58, 95); doc.rect(startX, currentY, cardWidth, 16, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(16);
    doc.text(recordDashboardName || 'B/L RECORD', startX + cardWidth / 2, currentY + 11, { align: 'center' });
    currentY += 16;
    const fields = [['B/L NO.', record.bl_no], ['CONTAINER NO.', record.container_no], ['INVOICE AMOUNT:', fmtAmt(record.invoice_amount)], ['INVOICE DATE:', format(parseDateString(record.invoice_date), 'dd/MM/yyyy')], ['BANK:', record.bank], ['OWNER:', record.owner], ['USED FOR:', record.used_for]];
    if (record.used_for_beneficiary) fields.push(['BENEFICIARY:', record.used_for_beneficiary]);
    if (record.notes) fields.push(['NOTES:', record.notes]);
    fields.forEach(([label, value]) => {
      doc.setFillColor(232, 240, 254); doc.rect(startX, currentY, labelWidth, rowHeight, 'F');
      doc.setTextColor(30, 58, 95); doc.setFontSize(10); doc.text(label, startX + 4, currentY + 8);
      doc.setFillColor(248, 249, 250); doc.rect(startX + labelWidth, currentY, valueWidth, rowHeight, 'F');
      doc.setTextColor(33, 33, 33); doc.text(value, startX + labelWidth + 4, currentY + 8);
      doc.setDrawColor(200, 200, 200); doc.rect(startX, currentY, cardWidth, rowHeight);
      currentY += rowHeight;
    });
    doc.save(`BL_${record.bl_no}_${record.invoice_date}.pdf`);
    toast({ title: 'PDF exported' });
  };

  const formatDate = (d: string) => {
    try { return format(new Date(d), 'dd/MM/yyyy'); } catch { return d; }
  };

  if (loading) {
    return (<div className="min-h-[400px] flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>);
  }

  if (!record) {
    return (<div className="min-h-[400px] flex flex-col items-center justify-center gap-4"><p className="text-muted-foreground">Record not found</p><Button variant="outline" onClick={() => navigate('/used-bl')}><ArrowLeft className="h-4 w-4 mr-2" /> Back to List</Button></div>);
  }

  const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="flex justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground text-right max-w-[60%]">{value}</span>
    </div>
  );

  return (
    <div className="animate-fade-in py-4 space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/used-bl')} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to List
        </Button>
        <div className="flex gap-2">
          {sourceRecord && (
            <Button variant="outline" size="sm" onClick={() => setAddInvoiceOpen(true)} className="gap-1.5">
              <Plus className="h-4 w-4" /> Add Invoice
            </Button>
          )}
          {canRevert && (
            <Button variant="outline" onClick={() => setRevertOpen(true)} className="gap-2 border-amber-500/50 text-amber-600 hover:bg-amber-500/10">
              <Undo2 className="h-4 w-4" /> Revert to Unused
            </Button>
          )}
        </div>
      </div>
      <UsedBLCard
        record={record}
        dashboardName={recordDashboardName}
        onEdit={() => navigate(`/used-bl/${record.id}/edit`)}
        onPrint={handlePrint}
        onExportPDF={handleExportPDF}
      />

      {/* Sibling invoices for the same B/L */}
      {siblingRecords.length > 0 && (
        <Card className="border-primary/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Other Invoices for this B/L
              <Badge variant="secondary" className="text-xs">{siblingRecords.length + 1} total</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {siblingRecords.map(sib => (
              <div
                key={sib.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border-l-2 border-l-primary cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => navigate(`/used-bl/${sib.id}`)}
              >
                <div className="space-y-0.5">
                  <div className="text-sm font-medium text-foreground">{sib.used_for} {sib.used_for_beneficiary && `→ ${sib.used_for_beneficiary}`}</div>
                  <div className="text-xs text-muted-foreground">{sib.bank} • {formatDate(sib.invoice_date)}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-foreground">{formatAmount(sib.invoice_amount, sib.currency)}</div>
                  <Badge variant="outline" className="text-[10px]">{sib.currency || 'USD'}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Source B/L Details */}
      {sourceRecord && (
        <div className="w-full max-w-lg mx-auto space-y-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Source B/L</Badge>
            Original B/L Details
          </h3>
          <div className="bg-muted/20 rounded-lg p-4">
            <DetailRow label="Clearance Company" value={sourceRecord.clearance_company} />
            <DetailRow label="Product Description" value={sourceRecord.product_description} />
            <DetailRow label="Product Category" value={<Badge variant="secondary">{sourceRecord.product_category}</Badge>} />
            <DetailRow label="B/L Date" value={formatDate(sourceRecord.bl_date)} />
            <DetailRow label="Clearance Date" value={formatDate(sourceRecord.clearance_date)} />
            {sourceRecord.quantity_value != null && (
              <DetailRow label="Quantity" value={`${sourceRecord.quantity_value} ${sourceRecord.quantity_unit || ''}`} />
            )}
            {sourceRecord.shipper_name && <DetailRow label="Shipper" value={sourceRecord.shipper_name} />}
            <DetailRow label="Port of Loading" value={sourceRecord.port_of_loading} />
            {sourceRecord.received_date && <DetailRow label="Received Date" value={formatDate(sourceRecord.received_date)} />}
          </div>
        </div>
      )}

      {revertOpen && (
        <RevertBLModal
          open={revertOpen}
          onOpenChange={setRevertOpen}
          blNo={record.bl_no}
          onConfirm={handleRevert}
        />
      )}

      {addInvoiceOpen && sourceRecord && (
        <UseBLModal
          record={sourceRecord}
          open={addInvoiceOpen}
          onOpenChange={(open) => {
            setAddInvoiceOpen(open);
            if (!open) {
              // Reload to show updated siblings
              window.location.reload();
            }
          }}
        />
      )}
    </div>
  );
};

export default UsedBLDetails;
