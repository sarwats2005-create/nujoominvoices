import React, { useRef, useState } from 'react';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { useSettings, currencies } from '@/contexts/SettingsContext';
import { useInvoice } from '@/contexts/InvoiceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Settings as SettingsIcon, Languages, Image, Building2, Trash2, LayoutDashboard, Mail, Phone, MapPin, Coins } from 'lucide-react';
import DashboardSelector from '@/components/DashboardSelector';

const Settings: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const { logo, setLogo, contactInfo, setContactInfo, currency, setCurrency } = useSettings();
  const { banks, deleteBank, currentDashboardId, setCurrentDashboardId } = useInvoice();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [editingContact, setEditingContact] = useState(false);
  const [contactForm, setContactForm] = useState(contactInfo);

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

  const handleSaveContact = () => {
    setContactInfo(contactForm);
    setEditingContact(false);
    toast({ title: t('contactInfoUpdated') });
  };

  const handleCurrencyChange = (code: string) => {
    const selected = currencies.find(c => c.code === code);
    if (selected) {
      setCurrency(selected);
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

          {/* Currency */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Coins className="h-4 w-4" />{t('currency')}</Label>
            <Select value={currency.code} onValueChange={handleCurrencyChange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover">
                {currencies.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.symbol} - {c.name} ({c.code})
                  </SelectItem>
                ))}
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

          {/* Manage Dashboards */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><LayoutDashboard className="h-4 w-4" />{t('manageDashboards')}</Label>
            <DashboardSelector 
              value={currentDashboardId || ''} 
              onChange={setCurrentDashboardId} 
              showManage 
            />
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

          {/* Contact Info */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Mail className="h-4 w-4" />{t('editContactInfo')}</Label>
            {editingContact ? (
              <div className="space-y-3 border rounded-md p-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Mail className="h-3 w-3" />{t('contactEmail')}</Label>
                  <Input
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Phone className="h-3 w-3" />{t('contactPhone')}</Label>
                  <Input
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    placeholder="+964 750 123 4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><MapPin className="h-3 w-3" />{t('contactAddress')}</Label>
                  <Input
                    value={contactForm.address}
                    onChange={(e) => setContactForm({ ...contactForm, address: e.target.value })}
                    placeholder="City, Country"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveContact}>{t('save')}</Button>
                  <Button variant="ghost" onClick={() => { setEditingContact(false); setContactForm(contactInfo); }}>{t('cancel')}</Button>
                </div>
              </div>
            ) : (
              <div className="border rounded-md p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{contactInfo.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{contactInfo.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{contactInfo.address}</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => setEditingContact(true)} className="mt-2">
                  {t('edit')}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;