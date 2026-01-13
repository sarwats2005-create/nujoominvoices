import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSettings } from '@/contexts/SettingsContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, Phone, MapPin, Send, MessageSquare, AlertTriangle, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { contactFormSchema } from '@/lib/validation';

const Contact: React.FC = () => {
  const { t } = useLanguage();
  const { contactInfo, web3formsAccessKey } = useSettings();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const validation = contactFormSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }
    
    if (!web3formsAccessKey) {
      toast({ 
        title: t('error'), 
        description: t('accessKeyRequired'), 
        variant: 'destructive' 
      });
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: web3formsAccessKey,
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          from_name: 'Nujoom Contact Form',
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({ title: t('messageSent'), description: t('messageSentDesc') });
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        toast({ 
          title: t('error'), 
          description: t('messageFailed'), 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      toast({ 
        title: t('error'), 
        description: t('messageFailed'), 
        variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">{t('getInTouch')}</h1>
        <p className="text-muted-foreground">{t('getInTouchDesc')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

      {!web3formsAccessKey && (
        <Card className="border-warning bg-warning/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-warning-foreground">{t('accessKeyRequired')}</p>
                <Link to="/settings">
                  <Button variant="outline" size="sm" className="mt-3 gap-2">
                    <Settings className="h-4 w-4" />
                    {t('settings')}
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            {t('sendMessage')}
          </CardTitle>
          <CardDescription>{t('sendMessageDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('yourName')}</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder={t('enterYourName')}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('yourEmail')}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder={t('enterYourEmail')}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">{t('subject')}</Label>
              <Input
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                placeholder={t('enterSubject')}
                className={errors.subject ? 'border-destructive' : ''}
              />
              {errors.subject && <p className="text-xs text-destructive">{errors.subject}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">{t('message')}</Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                placeholder={t('enterMessage')}
                className={errors.message ? 'border-destructive' : ''}
              />
              {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting || !web3formsAccessKey}
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? t('sending') : t('sendMessage')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Contact;