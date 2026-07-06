import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Delete } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  onSubmit: (pin: string) => Promise<{ ok: boolean; error?: string } | void>;
  submitLabel?: string;
  minLength?: number;
  maxLength?: number;
}

const PinKeypadDialog: React.FC<Props> = ({
  open, onOpenChange, title, description, onSubmit, submitLabel = 'Confirm', minLength = 4, maxLength = 6,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (open) { setPin(''); setError(null); setBusy(false); } }, [open]);

  const press = (n: string) => {
    setError(null);
    if (pin.length < maxLength) setPin(pin + n);
  };
  const back = () => { setError(null); setPin(pin.slice(0, -1)); };

  const submit = async () => {
    if (pin.length < minLength) { setError(`PIN must be ${minLength}-${maxLength} digits`); return; }
    setBusy(true);
    const res = await onSubmit(pin);
    setBusy(false);
    if (res && !res.ok) { setError(res.error || 'Invalid PIN'); setPin(''); return; }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="flex justify-center gap-2 my-3">
          {Array.from({ length: maxLength }).map((_, i) => (
            <div key={i} className={`h-3 w-3 rounded-full border ${i < pin.length ? 'bg-primary border-primary' : 'border-muted-foreground/40'}`} />
          ))}
        </div>

        {error && <div className="text-sm text-destructive text-center">{error}</div>}

        <div className="grid grid-cols-3 gap-2">
          {['1','2','3','4','5','6','7','8','9'].map(n => (
            <Button key={n} variant="outline" className="h-14 text-xl" onClick={() => press(n)} type="button">{n}</Button>
          ))}
          <Button variant="outline" className="h-14" onClick={back} type="button"><Delete className="h-5 w-5" /></Button>
          <Button variant="outline" className="h-14 text-xl" onClick={() => press('0')} type="button">0</Button>
          <Button variant="default" className="h-14" onClick={submit} disabled={busy || pin.length < minLength} type="button">{submitLabel}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PinKeypadDialog;
