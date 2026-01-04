import React from 'react';
import { Download, Smartphone, Monitor, Share, Plus, Check, Star } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Install() {
  const { canInstall, isInstalled, isIOS, promptInstall } = usePWAInstall();

  const handleInstall = async () => {
    const success = await promptInstall();
    if (success) {
      console.log('App installed successfully');
    }
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-success" />
            </div>
            <CardTitle className="text-2xl">App Installed!</CardTitle>
            <CardDescription>
              Nujoom Invoices is now installed on your device. You can access it from your home screen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              Open App
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
            <Star className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Install Nujoom Invoices
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get the full app experience. Install Nujoom Invoices on your device for faster access, offline support, and a native app feel.
          </p>
        </div>

        {/* Install Button for supported browsers */}
        {canInstall && (
          <div className="text-center mb-12">
            <Button size="lg" onClick={handleInstall} className="gap-2">
              <Download className="w-5 h-5" />
              Install Now
            </Button>
          </div>
        )}

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                <Smartphone className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Works Offline</CardTitle>
              <CardDescription>
                Access your invoices even without internet connection. Changes sync automatically when you're back online.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                <Monitor className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Native App Feel</CardTitle>
              <CardDescription>
                Full-screen experience without browser UI. Launches from your home screen like any other app.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                <Download className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Instant Load</CardTitle>
              <CardDescription>
                Assets are cached locally for lightning-fast load times, even on slow networks.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* iOS Instructions */}
        {isIOS && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Install on iPhone/iPad</CardTitle>
              <CardDescription>
                Safari doesn't show an install button, but you can still install the app:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                <li className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-semibold">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Tap the Share button</p>
                    <p className="text-muted-foreground text-sm flex items-center gap-1">
                      Look for the <Share className="w-4 h-4 inline" /> icon at the bottom of Safari
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-semibold">2</span>
                  </div>
                  <div>
                    <p className="font-medium">Tap "Add to Home Screen"</p>
                    <p className="text-muted-foreground text-sm flex items-center gap-1">
                      Look for the <Plus className="w-4 h-4 inline" /> icon in the share menu
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-semibold">3</span>
                  </div>
                  <div>
                    <p className="font-medium">Tap "Add"</p>
                    <p className="text-muted-foreground text-sm">
                      The app will be added to your home screen
                    </p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>
        )}

        {/* Desktop/Android Instructions */}
        {!isIOS && !canInstall && (
          <Card>
            <CardHeader>
              <CardTitle>Install on Desktop or Android</CardTitle>
              <CardDescription>
                Look for the install icon in your browser's address bar, or:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                <li className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-semibold">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Open browser menu</p>
                    <p className="text-muted-foreground text-sm">
                      Click the three dots (⋮) in Chrome or Edge
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-semibold">2</span>
                  </div>
                  <div>
                    <p className="font-medium">Select "Install Nujoom Invoices"</p>
                    <p className="text-muted-foreground text-sm">
                      Or "Add to Home Screen" on mobile browsers
                    </p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>
        )}

        {/* Back to App */}
        <div className="text-center mt-8">
          <Button variant="ghost" onClick={() => window.location.href = '/'}>
            Continue to App
          </Button>
        </div>
      </div>
    </div>
  );
}
