import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUsedBL } from '@/hooks/useUsedBL';
import { useToast } from '@/hooks/use-toast';
import { useAdmin } from '@/hooks/useAdmin';
import UsedBLForm from '@/components/UsedBLForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { UsedBL, UsedBLInsert } from '@/types/usedBL';

const UsedBLEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRecord, updateRecord, softDeleteRecord, checkContainerExists } = useUsedBL();
  const { isAdmin } = useAdmin();
  const { toast } = useToast();
  const [record, setRecord] = useState<UsedBL | null>(null);
  const [loading, setLoading] = useState(true);
  const [containerWarning, setContainerWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const data = await getRecord(id);
      setRecord(data);
      setLoading(false);
    };
    load();
  }, [id, getRecord]);

  const handleContainerCheck = useCallback(async (containerNo: string) => {
    if (containerNo.length > 2 && id) {
      const exists = await checkContainerExists(containerNo, id);
      setContainerWarning(exists);
    } else {
      setContainerWarning(false);
    }
  }, [checkContainerExists, id]);

  const handleSubmit = async (data: UsedBLInsert) => {
    if (!id) return { success: false, error: 'No ID' };
    setIsSubmitting(true);
    const result = await updateRecord(id, data);
    setIsSubmitting(false);

    if (result.success) {
      toast({ title: 'Record updated successfully! ✅' });
      navigate(`/used-bl/${id}`);
    }
    return result;
  };

  const handleDelete = async () => {
    if (!id) return;
    const ok = await softDeleteRecord(id);
    if (ok) {
      toast({ title: 'Record deleted' });
      navigate('/used-bl');
    }
    setShowDeleteDialog(false);
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!record) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Record not found</p>
        <Button variant="outline" onClick={() => navigate('/used-bl')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to List
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in py-4 space-y-4">
      <Button variant="ghost" onClick={() => navigate('/used-bl')} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to List
      </Button>

      <UsedBLForm
        initialData={record}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/used-bl/${id}`)}
        onDelete={() => setShowDeleteDialog(true)}
        containerWarning={containerWarning}
        onContainerCheck={handleContainerCheck}
        isSubmitting={isSubmitting}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this B/L record ({record.bl_no})?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UsedBLEdit;
