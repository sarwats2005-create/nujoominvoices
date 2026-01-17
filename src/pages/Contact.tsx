import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSettings } from '@/contexts/SettingsContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, Phone, MapPin, Send, Loader2, Headphones, MessageCircle, Newspaper, Edit2, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface MapLocation {
  id: string;
  latitude: number;
  longitude: number;
  address: string;
  zoom_level: number;
}

const Contact: React.FC = () => {
  const { t } = useLanguage();
  const { contactInfo } = useSettings();
  const { toast } = useToast();
  const { isAdmin } = useAdmin();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Map state
  const [mapLocation, setMapLocation] = useState<MapLocation | null>(null);
  const [mapEmbedUrl, setMapEmbedUrl] = useState<string | null>(null);
  const [mapLoading, setMapLoading] = useState(true);
  
  // Admin edit state
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [editForm, setEditForm] = useState({
    latitude: '',
    longitude: '',
    address: '',
    zoom_level: '12',
  });
  const [isSavingLocation, setIsSavingLocation] = useState(false);

  // Fetch map location
  useEffect(() => {
    const fetchMapLocation = async () => {
      setMapLoading(true);
      try {
        const { data, error } = await supabase
          .from('map_location')
          .select('*')
          .limit(1)
          .maybeSingle();
        
        if (error) throw error;
        
        if (data) {
          setMapLocation(data);
          setEditForm({
            latitude: data.latitude.toString(),
            longitude: data.longitude.toString(),
            address: data.address || '',
            zoom_level: data.zoom_level.toString(),
          });
          
          // Get embed URL
          await fetchMapEmbed(data.latitude, data.longitude, data.zoom_level);
        }
      } catch (error) {
        console.error('Error fetching map location:', error);
      } finally {
        setMapLoading(false);
      }
    };
    
    fetchMapLocation();
  }, []);

  const fetchMapEmbed = async (lat: number, lng: number, zoom: number) => {
    try {
      const { data, error } = await supabase.functions.invoke('get-map-embed', {
        body: { latitude: lat, longitude: lng, zoom },
      });
      
      if (error) throw error;
      if (data?.embedUrl) {
        setMapEmbedUrl(data.embedUrl);
      }
    } catch (error) {
      console.error('Error fetching map embed:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-feedback', {
        body: {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          subject: `Contact Form - ${formData.phone || 'No phone'}`,
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
      setFormData({ firstName: '', lastName: '', email: '', phone: '', message: '' });
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

  const handleEditLocation = () => {
    setIsEditingLocation(true);
  };

  const handleCancelEdit = () => {
    if (mapLocation) {
      setEditForm({
        latitude: mapLocation.latitude.toString(),
        longitude: mapLocation.longitude.toString(),
        address: mapLocation.address || '',
        zoom_level: mapLocation.zoom_level.toString(),
      });
    }
    setIsEditingLocation(false);
  };

  const handleSaveLocation = async () => {
    if (!mapLocation) return;
    
    setIsSavingLocation(true);
    try {
      const newLat = parseFloat(editForm.latitude);
      const newLng = parseFloat(editForm.longitude);
      const newZoom = parseInt(editForm.zoom_level);

      if (isNaN(newLat) || isNaN(newLng) || isNaN(newZoom)) {
        throw new Error('Invalid coordinates or zoom level');
      }

      const { error } = await supabase
        .from('map_location')
        .update({
          latitude: newLat,
          longitude: newLng,
          address: editForm.address,
          zoom_level: newZoom,
        })
        .eq('id', mapLocation.id);

      if (error) throw error;

      setMapLocation({
        ...mapLocation,
        latitude: newLat,
        longitude: newLng,
        address: editForm.address,
        zoom_level: newZoom,
      });

      // Refresh embed URL
      await fetchMapEmbed(newLat, newLng, newZoom);

      toast({
        title: t('save'),
        description: 'Location updated successfully!',
      });
      
      setIsEditingLocation(false);
    } catch (error: any) {
      console.error('Error saving location:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save location.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingLocation(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] pb-12">
      {/* Hero Section - Split Layout */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-16 animate-fade-in">
        {/* Left Side - Contact Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{t('contactUs')}</h1>
            <p className="text-muted-foreground text-lg max-w-md">
              {t('contactUsDesc')}
            </p>
          </div>

          <div className="space-y-3">
            <a 
              href={`mailto:${contactInfo.email}`} 
              className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
            >
              <Mail className="h-4 w-4 text-muted-foreground" />
              {contactInfo.email}
            </a>
            <a 
              href={`tel:${contactInfo.phone}`} 
              className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
            >
              <Phone className="h-4 w-4 text-muted-foreground" />
              {contactInfo.phone}
            </a>
            <div className="flex items-center gap-2 text-foreground">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              {mapLocation?.address || contactInfo.address}
            </div>
          </div>
        </div>

        {/* Right Side - Contact Form Card */}
        <Card className="shadow-xl border bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">{t('getInTouch')}</CardTitle>
            <CardDescription>{t('reachUsAnytime')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm">{t('firstName')}</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    placeholder={t('firstName')}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm">{t('lastName')}</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder={t('lastName')}
                    className="h-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">{t('yourEmail')}</Label>
                <div className="relative">
                  <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder={t('enterYourEmail')}
                    className="h-10 ps-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm">{t('phoneNumber')}</Label>
                <div className="relative">
                  <Phone className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={t('phoneNumber')}
                    className="h-10 ps-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-destructive"></span>
                  {t('howCanWeHelp')}
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder={t('enterMessage')}
                  className="resize-none"
                />
                <div className="text-xs text-muted-foreground text-end">
                  {formData.message.length}/500
                </div>
              </div>

              <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 me-2 animate-spin" />
                    {t('sending')}
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 me-2" />
                    {t('submit')}
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                {t('termsAgreement')}
              </p>
            </form>
          </CardContent>
        </Card>
      </section>

      {/* Support Categories */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Headphones className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">{t('customerSupport')}</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t('customerSupportDesc')}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">{t('feedbackSuggestions')}</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t('feedbackSuggestionsDesc')}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Newspaper className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">{t('mediaInquiries')}</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t('mediaInquiriesDesc')}
          </p>
        </div>
      </section>

      {/* Location Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        {/* Map */}
        <div className="relative rounded-xl overflow-hidden bg-muted min-h-[300px] lg:min-h-[400px]">
          {mapLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : mapEmbedUrl ? (
            <iframe
              src={mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '300px' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Location Map"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-primary mx-auto mb-3" />
                <p className="text-muted-foreground">{mapLocation?.address || contactInfo.address}</p>
              </div>
            </div>
          )}
          
          {/* Admin Edit Button */}
          {isAdmin && (
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-3 end-3 shadow-lg"
              onClick={handleEditLocation}
            >
              <Edit2 className="h-4 w-4 me-1" />
              {t('edit')}
            </Button>
          )}
        </div>

        {/* Location Info */}
        <div className="flex flex-col justify-center space-y-6">
          <div>
            <p className="text-sm text-muted-foreground mb-2">{t('ourLocation')}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">{t('connectingNearFar')}</h2>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-foreground mb-1">{t('headquarters')}</h3>
              <p className="text-sm text-muted-foreground">{mapLocation?.address || contactInfo.address}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">{t('emailUs')}</p>
                <a 
                  href={`mailto:${contactInfo.email}`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {contactInfo.email}
                </a>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{t('callUs')}</p>
                <a 
                  href={`tel:${contactInfo.phone}`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {contactInfo.phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Admin Location Edit Dialog */}
      <Dialog open={isEditingLocation} onOpenChange={setIsEditingLocation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Edit Location
            </DialogTitle>
            <DialogDescription>
              Update the map pin location. Changes will be visible to all users.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={editForm.address}
                onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                placeholder="e.g., Baghdad, Iraq"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-latitude">Latitude</Label>
                <Input
                  id="edit-latitude"
                  type="number"
                  step="any"
                  value={editForm.latitude}
                  onChange={(e) => setEditForm(prev => ({ ...prev, latitude: e.target.value }))}
                  placeholder="e.g., 33.3152"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-longitude">Longitude</Label>
                <Input
                  id="edit-longitude"
                  type="number"
                  step="any"
                  value={editForm.longitude}
                  onChange={(e) => setEditForm(prev => ({ ...prev, longitude: e.target.value }))}
                  placeholder="e.g., 44.3661"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-zoom">Zoom Level (1-20)</Label>
              <Input
                id="edit-zoom"
                type="number"
                min="1"
                max="20"
                value={editForm.zoom_level}
                onChange={(e) => setEditForm(prev => ({ ...prev, zoom_level: e.target.value }))}
                placeholder="e.g., 12"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancelEdit}>
              <X className="h-4 w-4 me-1" />
              {t('cancel')}
            </Button>
            <Button onClick={handleSaveLocation} disabled={isSavingLocation}>
              {isSavingLocation ? (
                <Loader2 className="h-4 w-4 me-1 animate-spin" />
              ) : (
                <Save className="h-4 w-4 me-1" />
              )}
              {t('save')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Contact;
