import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, X } from 'lucide-react';

interface BarcodeScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (code: string) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ open, onOpenChange, onScan }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;

    const scannerId = 'barcode-scanner-region';
    let scanner: Html5Qrcode;

    const startScanner = async () => {
      try {
        scanner = new Html5Qrcode(scannerId);
        scannerRef.current = scanner;
        setError('');

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 150 },
            aspectRatio: 1.5,
          },
          (decodedText) => {
            onScan(decodedText);
            scanner.stop().catch(() => {});
            onOpenChange(false);
          },
          () => {} // ignore errors during scanning
        );
      } catch (err: any) {
        setError(err?.message || 'Camera access denied. Please allow camera permissions.');
      }
    };

    // Small delay to let the DOM element render
    const timeout = setTimeout(startScanner, 300);

    return () => {
      clearTimeout(timeout);
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
      scannerRef.current = null;
    };
  }, [open, onScan, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={(v) => {
      if (!v && scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
      onOpenChange(v);
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" /> Scan Barcode
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div
            id="barcode-scanner-region"
            className="w-full min-h-[250px] rounded-lg overflow-hidden bg-muted"
          />
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
          <p className="text-xs text-muted-foreground text-center">
            Point your camera at a barcode to scan it
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BarcodeScanner;
