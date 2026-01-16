import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Printer, FileText, Settings2, Download } from 'lucide-react';

export interface PrintSettings {
  paperSize: 'a4' | 'letter' | 'legal' | 'a3';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

interface PrintSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPrint: (settings: PrintSettings) => void;
  onExportPDF: (settings: PrintSettings) => void;
}

const defaultSettings: PrintSettings = {
  paperSize: 'a4',
  orientation: 'portrait',
  margins: { top: 20, right: 15, bottom: 20, left: 15 },
};

const paperSizes = [
  { value: 'a4', label: 'A4 (210 × 297 mm)' },
  { value: 'letter', label: 'Letter (8.5 × 11 in)' },
  { value: 'legal', label: 'Legal (8.5 × 14 in)' },
  { value: 'a3', label: 'A3 (297 × 420 mm)' },
];

const PrintSettingsDialog: React.FC<PrintSettingsDialogProps> = ({
  open,
  onOpenChange,
  onPrint,
  onExportPDF,
}) => {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<PrintSettings>(defaultSettings);

  const handlePrint = () => {
    onPrint(settings);
    onOpenChange(false);
  };

  const handleExportPDF = () => {
    onExportPDF(settings);
    onOpenChange(false);
  };

  const updateMargin = (key: keyof PrintSettings['margins'], value: string) => {
    const numValue = parseInt(value) || 0;
    setSettings(prev => ({
      ...prev,
      margins: { ...prev.margins, [key]: numValue },
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            {t('printSettings') || 'Print Settings'}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {t('basic') || 'Basic'}
            </TabsTrigger>
            <TabsTrigger value="margins" className="flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              {t('margins') || 'Margins'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>{t('paperSize') || 'Paper Size'}</Label>
              <Select
                value={settings.paperSize}
                onValueChange={(value: PrintSettings['paperSize']) =>
                  setSettings(prev => ({ ...prev, paperSize: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paperSizes.map(size => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('orientation') || 'Orientation'}</Label>
              <Select
                value={settings.orientation}
                onValueChange={(value: PrintSettings['orientation']) =>
                  setSettings(prev => ({ ...prev, orientation: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portrait">{t('portrait') || 'Portrait'}</SelectItem>
                  <SelectItem value="landscape">{t('landscape') || 'Landscape'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="margins" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground mb-4">
              {t('marginsDescription') || 'Set margins in millimeters (mm)'}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('topMargin') || 'Top'}</Label>
                <Input
                  type="number"
                  value={settings.margins.top}
                  onChange={e => updateMargin('top', e.target.value)}
                  min={0}
                  max={100}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('bottomMargin') || 'Bottom'}</Label>
                <Input
                  type="number"
                  value={settings.margins.bottom}
                  onChange={e => updateMargin('bottom', e.target.value)}
                  min={0}
                  max={100}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('leftMargin') || 'Left'}</Label>
                <Input
                  type="number"
                  value={settings.margins.left}
                  onChange={e => updateMargin('left', e.target.value)}
                  min={0}
                  max={100}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('rightMargin') || 'Right'}</Label>
                <Input
                  type="number"
                  value={settings.margins.right}
                  onChange={e => updateMargin('right', e.target.value)}
                  min={0}
                  max={100}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="sm:order-1"
          >
            {t('cancel')}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleExportPDF}
            className="sm:order-2 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {t('exportPDF') || 'Export PDF'}
          </Button>
          <Button
            type="button"
            onClick={handlePrint}
            className="sm:order-3 flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            {t('print')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PrintSettingsDialog;
