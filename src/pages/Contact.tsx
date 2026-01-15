import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSettings } from '@/contexts/SettingsContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, Phone, MapPin, Send, MessageSquare, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Contact: React.FC = () => {
  const { t } = useLanguage();
  const { contactInfo } = useSettings();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-feedback', {
        body: {
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          recipientEmail: contactInfo.email,
        },
      });

      if (error) {
        throw error;
      }

      toast({ 
        title: t('messageSent'), 
        description: t('messageSentDesc'),
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error: any) {
      console.error('Error sending feedback:', error);
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] relative">
      {/* Contact Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-4xl mx-auto animate-fade-in">
        <div className="text-center mb-8 col-span-full">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('getInTouch')}</h1>
          <p className="text-muted-foreground">{t('getInTouchDesc')}</p>
        </div>

        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-1">{t('emailUs')}</h3>
            <p className="text-sm text-muted-foreground">{contactInfo.email}</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <Phone className="h-6 w-6 text-success" />
            </div>
            <h3 className="font-semibold mb-1">{t('callUs')}</h3>
            <p className="text-sm text-muted-foreground">{contactInfo.phone}</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-6 w-6 text-warning" />
            </div>
            <h3 className="font-semibold mb-1">{t('visitUs')}</h3>
            <p className="text-sm text-muted-foreground">{contactInfo.address}</p>
          </CardContent>
        </Card>
      </div>

      {/* Floating Message Form - Bottom Right */}
      <div className="fixed bottom-6 right-6 z-50 w-full max-w-md animate-slide-in-right">
        <Card className="shadow-xl border-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5 text-primary" />
              {t('sendMessage')}
            </CardTitle>
            <CardDescription className="text-sm">{t('sendMessageDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="name" className="text-sm">{t('yourName')}</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder={t('enterYourName')}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-sm">{t('yourEmail')}</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder={t('enterYourEmail')}
                    className="h-9"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="subject" className="text-sm">{t('subject')}</Label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder={t('enterSubject')}
                  className="h-9"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="message" className="text-sm">{t('message')}</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={3}
                  placeholder={t('enterMessage')}
                  className="resize-none"
                />
              </div>

              <Button type="submit" className="w-full h-9" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {isSubmitting ? t('sending') : t('sendMessage')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Contact;