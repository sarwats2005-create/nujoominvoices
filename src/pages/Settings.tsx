import React, { useRef } from 'react';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useInvoice } from '@/contexts/InvoiceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Settings as SettingsIcon, Languages, Image, Building2, Trash2 } from 'lucide-react';

const Settings: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const { logo, setLogo } = useSettings();
  const { banks, deleteBank } = useInvoice();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
        toast({ title: t('logoUpdated') });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-primary" />{t('settings')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Language */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Languages className="h-4 w-4" />{t('language')}</Label>
            <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="en">{t('english')}</SelectItem>
                <SelectItem value="ar">{t('arabic')}</SelectItem>
                <SelectItem value="ku">{t('kurdish')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Logo Upload */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Image className="h-4 w-4" />{t('uploadLogo')}</Label>
            <div className="flex items-center gap-4">
              {logo && <img src={logo} alt="Logo" className="h-16 w-auto object-contain rounded border" />}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>{t('uploadLogo')}</Button>
              {logo && <Button variant="ghost" onClick={() => setLogo(null)}><Trash2 className="h-4 w-4" /></Button>}
            </div>
          </div>

          {/* Banks List */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Building2 className="h-4 w-4" />{t('manageBanks')}</Label>
            <div className="border rounded-md divide-y">
              {banks.map((bank) => (
                <div key={bank.id} className="flex items-center justify-between p-3">
                  <span>{bank.name}</span>
                  <Button variant="ghost" size="icon" onClick={() => { deleteBank(bank.id); toast({ title: t('bankDeleted') }); }}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
