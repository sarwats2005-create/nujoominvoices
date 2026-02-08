import React from 'react';
import { format } from 'date-fns';
import { parseDateString } from '@/lib/dateUtils';
import type { UsedBL } from '@/types/usedBL';

interface UsedBLCardProps {
  record: UsedBL;
  showActions?: boolean;
  onEdit?: () => void;
  onPrint?: () => void;
  onExportPDF?: () => void;
}

const UsedBLCard: React.FC<UsedBLCardProps> = ({ record, showActions = true, onEdit, onPrint, onExportPDF }) => {
  const formatAmount = (amount: number) => `$${Math.round(amount).toLocaleString()}`;

  const fields = [
    { label: 'B/L NO.', value: record.bl_no },
    { label: 'CONTAINER NO.', value: record.container_no },
    { label: 'INVOICE AMOUNT:', value: formatAmount(record.invoice_amount) },
    { label: 'INVOICE DATE:', value: format(parseDateString(record.invoice_date), 'dd/MM/yyyy') },
    { label: 'BANK:', value: record.bank },
    { label: 'OWNER:', value: record.owner },
    { label: 'USED FOR:', value: record.used_for },
  ];

  if (record.notes) {
    fields.push({ label: 'NOTES:', value: record.notes });
  }

  return (
    <div className="w-full max-w-lg mx-auto" id="bl-card">
      {/* Header */}
      <div className="bg-[hsl(var(--primary))] text-primary-foreground text-center py-4 px-6 rounded-t-xl">
        <h2 className="text-xl font-bold" dir="rtl">حوالات محمد خاص</h2>
      </div>

      {/* Fields */}
      <div className="border border-border rounded-b-xl overflow-hidden">
        {fields.map((field, index) => (
          <div
            key={index}
            className={`flex border-b border-border last:border-b-0 ${index % 2 === 0 ? '' : ''}`}
          >
            <div className="w-2/5 bg-primary/10 px-4 py-3 font-semibold text-sm text-foreground border-r border-border flex items-center">
              {field.label}
            </div>
            <div className="w-3/5 bg-muted/30 px-4 py-3 text-sm text-foreground font-medium">
              {field.value}
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="flex gap-2 mt-4 justify-center">
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Edit
            </button>
          )}
          {onPrint && (
            <button
              onClick={onPrint}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
            >
              Print
            </button>
          )}
          {onExportPDF && (
            <button
              onClick={onExportPDF}
              className="px-4 py-2 bg-success text-success-foreground rounded-lg text-sm font-medium hover:bg-success/90 transition-colors"
            >
              Export PDF
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default UsedBLCard;
