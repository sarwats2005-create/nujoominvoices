import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUsedBL } from '@/hooks/useUsedBL';
import { useToast } from '@/hooks/use-toast';
import UsedBLForm from '@/components/UsedBLForm';
import type { UsedBLInsert } from '@/types/usedBL';

const UsedBLNew: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addRecord, checkContainerExists } = useUsedBL();
  const { toast } = useToast();
  const [containerWarning, setContainerWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check for duplicate data passed from the dashboard
  const duplicateData = (location.state as any)?.duplicate;

  const handleContainerCheck = useCallback(async (containerNo: string) => {
    if (containerNo.length > 2) {
      const exists = await checkContainerExists(containerNo);
      setContainerWarning(exists);
    } else {
      setContainerWarning(false);
    }
  }, [checkContainerExists]);

  const handleSubmit = async (data: UsedBLInsert) => {
    setIsSubmitting(true);
    const result = await addRecord(data);
    setIsSubmitting(false);

    if (result.success) {
      toast({ title: 'B/L record saved successfully! ✅' });
      navigate('/used-bl');
    }
    return result;
  };

  const handleSaveAndNew = async (data: UsedBLInsert) => {
    setIsSubmitting(true);
    const result = await addRecord(data);
    setIsSubmitting(false);

    if (result.success) {
      toast({ title: 'Record saved! Form cleared for new entry ✅' });
    }
    return result;
  };

  return (
    <div className="animate-fade-in py-4">
      <UsedBLForm
        initialData={duplicateData ? { ...duplicateData, bl_no: '', id: '' } : undefined}
        onSubmit={handleSubmit}
        onSaveAndNew={handleSaveAndNew}
        onCancel={() => navigate('/used-bl')}
        containerWarning={containerWarning}
        onContainerCheck={handleContainerCheck}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default UsedBLNew;
