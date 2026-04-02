import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUsedBL } from '@/hooks/useUsedBL';
import { useUnusedBL } from '@/hooks/useUnusedBL';
import { useToast } from '@/hooks/use-toast';
import UsedBLCard from '@/components/UsedBLCard';
import RevertBLModal from '@/components/unused-bl/RevertBLModal';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Undo2 } from 'lucide-react';
import { format } from 'date-fns';
import { parseDateString } from '@/lib/dateUtils';
import jsPDF from 'jspdf';
import type { UsedBL } from '@/types/usedBL';

const UsedBLDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRecord, currentDashboardName, blDashboards } = useUsedBL();
  const { revertBL } = useUnusedBL();
  const { toast } = useToast();
  const [record, setRecord] = useState<UsedBL | null>(null);
  const [loading, setLoading] = useState(true);
  const [revertOpen, setRevertOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const data = await getRecord(id);
      setRecord(data);
      setLoading(false);
    };
    load();
  }, [id, getRecord]);

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

  const handlePrint = () => {
    if (!record) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const currCode = record.currency || 'USD';
    const formatAmount = (amount: number) => `${currCode} ${Math.round(amount).toLocaleString()}`;
    printWindow.document.write(`
      <!DOCTYPE html><html><head><title>BL_${record.bl_no}</title>
      <style>body{font-family:Arial,sans-serif;display:flex;justify-content:center;padding:40px}.card{max-width:500px;width:100%;border:2px solid #1e3a5f;border-radius:12px;overflow:hidden}.header{background:#1e3a5f;color:white;text-align:center;padding:16px;font-size:20px;font-weight:bold}.row{display:flex;border-bottom:1px solid #ddd}.row:last-child{border-bottom:none}.label{width:40%;background:#e8f0fe;padding:12px 16px;font-weight:600;font-size:14px;border-right:1px solid #ddd}.value{width:60%;background:#f8f9fa;padding:12px 16px;font-size:14px}@media print{body{padding:20px}}</style>
      </head><body><div class="card">
      <div class="header" dir="rtl">${recordDashboardName || 'حوالات محمد خاص'}</div>
      <div class="row"><div class="label">B/L NO.</div><div class="value">${record.bl_no}</div></div>
      <div class="row"><div class="label">CONTAINER NO.</div><div class="value">${record.container_no}</div></div>
      <div class="row"><div class="label">INVOICE AMOUNT:</div><div class="value">${formatAmount(record.invoice_amount)}</div></div>
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
    const formatAmount = (amount: number) => `${currCode2} ${Math.round(amount).toLocaleString()}`;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const startX = 30; let currentY = 30; const cardWidth = 150; const labelWidth = 60; const valueWidth = 90; const rowHeight = 12;
    doc.setFillColor(30, 58, 95); doc.rect(startX, currentY, cardWidth, 16, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(16);
    doc.text(recordDashboardName || 'B/L RECORD', startX + cardWidth / 2, currentY + 11, { align: 'center' });
    currentY += 16;
    const fields = [['B/L NO.', record.bl_no], ['CONTAINER NO.', record.container_no], ['INVOICE AMOUNT:', formatAmount(record.invoice_amount)], ['INVOICE DATE:', format(parseDateString(record.invoice_date), 'dd/MM/yyyy')], ['BANK:', record.bank], ['OWNER:', record.owner], ['USED FOR:', record.used_for]];
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

  if (loading) {
    return (<div className="min-h-[400px] flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>);
  }

  if (!record) {
    return (<div className="min-h-[400px] flex flex-col items-center justify-center gap-4"><p className="text-muted-foreground">Record not found</p><Button variant="outline" onClick={() => navigate('/used-bl')}><ArrowLeft className="h-4 w-4 mr-2" /> Back to List</Button></div>);
  }

  return (
    <div className="animate-fade-in py-4 space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/used-bl')} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to List
        </Button>
        {canRevert && (
          <Button variant="outline" onClick={() => setRevertOpen(true)} className="gap-2 border-amber-500/50 text-amber-600 hover:bg-amber-500/10">
            <Undo2 className="h-4 w-4" /> Revert to Unused
          </Button>
        )}
      </div>
      <UsedBLCard
        record={record}
        dashboardName={recordDashboardName}
        onEdit={() => navigate(`/used-bl/${record.id}/edit`)}
        onPrint={handlePrint}
        onExportPDF={handleExportPDF}
      />
      {revertOpen && (
        <RevertBLModal
          open={revertOpen}
          onOpenChange={setRevertOpen}
          blNo={record.bl_no}
          onConfirm={handleRevert}
        />
      )}
    </div>
  );
};

export default UsedBLDetails;
