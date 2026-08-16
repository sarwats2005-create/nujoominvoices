import React from 'react';
import type { TransactionType } from '@/hooks/useTransactionTypes';

interface Props {
  type?: TransactionType;
  className?: string;
  showLabel?: boolean;
}

/** Colored pill for a transaction type code (e.g. 01, 02, 03). */
const TransactionTypeBadge: React.FC<Props> = ({ type, className, showLabel = true }) => {
  if (!type) {
    return <span className={`text-muted-foreground text-xs ${className || ''}`}>—</span>;
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${className || ''}`}
      style={{
        backgroundColor: `${type.color}22`,
        color: type.color,
        border: `1px solid ${type.color}55`,
      }}
      title={type.label || type.code}
    >
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: type.color }} />
      {type.code}
      {showLabel && type.label ? <span className="font-normal opacity-80">{type.label}</span> : null}
    </span>
  );
};

export default TransactionTypeBadge;
