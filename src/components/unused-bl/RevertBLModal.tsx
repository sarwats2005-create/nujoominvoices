import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Undo2 } from 'lucide-react';

interface RevertBLModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blNo: string;
  onConfirm: (reason: string) => Promise<void>;
}

const RevertBLModal: React.FC<RevertBLModalProps> = ({ open, onOpenChange, blNo, onConfirm }) => {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!reason.trim()) return;
    setSubmitting(true);
    await onConfirm(reason.trim());
    setSubmitting(false);
    setReason('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600">
            <Undo2 className="h-5 w-5" /> Revert B/L to Unused?
          </DialogTitle>
          <DialogDescription>
            This will remove B/L <span className="font-mono font-semibold">{blNo}</span> from the Used list and restore it to Unused. The used details (invoice, beneficiary, used for) will be hidden but not deleted.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">This action can be undone by marking the B/L as used again.</p>
          </div>

          <div className="space-y-1.5">
            <Label>Reason for reverting <span className="text-destructive">*</span></Label>
            <Textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Why is this B/L being reverted to unused?"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!reason.trim() || submitting}
            className="gap-2 bg-amber-600 hover:bg-amber-700"
          >
            <Undo2 className="h-4 w-4" /> {submitting ? 'Reverting...' : 'Confirm Revert'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RevertBLModal;
