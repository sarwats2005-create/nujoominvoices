import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, LogIn, UserPlus, FileText, KeyRound, ArrowLeft } from 'lucide-react';
import { MagicButton } from '@/components/MagicButton';
import { MagicCard } from '@/components/MagicCard';
import { z } from 'zod';

const MAX_USERS = 3;

const emailSchema = z.string().email('Invalid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [userCount, setUserCount] = useState<number | null>(null);
  
  const { signIn, signUp, user, resetPassword, getUserCount } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Check user count on mount
  useEffect(() => {
    const checkUserCount = async () => {
      const count = await getUserCount();
      setUserCount(count);
    };
    checkUserCount();
  }, [getUserCount]);

  const validateForm = () => {
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'Validation Error',
          description: error.errors[0].message,
          variant: 'destructive',
        });
      }
      return false;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);

    if (error) {
      toast({
        title: t('loginFailed'),
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({ title: t('loginSuccess') });
      navigate('/dashboard');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Check if max users reached
    if (userCount !== null && userCount >= MAX_USERS) {
      toast({
        title: t('signupFailed'),
        description: t('maxUsersReached'),
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(email, password);
    setIsLoading(false);

    if (error) {
      let message = error.message;
      if (error.message.includes('already registered')) {
        message = 'This email is already registered. Please login instead.';
      }
      toast({
        title: t('signupFailed'),
        description: message,
        variant: 'destructive',
      });
    } else {
      toast({ title: t('signupSuccess'), description: 'You can now login.' });
      setActiveTab('login');
      // Refresh user count
      const newCount = await getUserCount();
      setUserCount(newCount);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(resetEmail);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'Validation Error',
          description: error.errors[0].message,
          variant: 'destructive',
        });
      }
      return;
    }

    setIsLoading(true);
    const { error } = await resetPassword(resetEmail);
    setIsLoading(false);

    if (error) {
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({ 
        title: t('passwordResetSent'),
        description: t('checkEmailForReset'),
      });
      setShowForgotPassword(false);
      setResetEmail('');
    }
  };

  const signupsDisabled = userCount !== null && userCount >= MAX_USERS;

  // Forgot Password View
  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/50 p-4">
        <MagicCard className="w-full max-w-md rounded-xl" glowColor="132, 0, 255" enableParticles={true}>
          <Card className="w-full max-w-md shadow-xl border-0">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto p-3 rounded-xl bg-primary/10 w-fit">
                <KeyRound className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">{t('forgotPassword')}</CardTitle>
                <CardDescription className="mt-2">
                  {t('forgotPasswordDescription')}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {t('email')}
                  </Label>
                  <Input
                    id="reset-email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </div>
                <MagicButton type="submit" className="w-full" disabled={isLoading} glowColor="132, 0, 255">
                  {isLoading ? t('loading') : t('sendResetLink')}
                </MagicButton>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full flex items-center gap-2"
                  onClick={() => setShowForgotPassword(false)}
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t('backToLogin')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </MagicCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/50 p-4">
      <MagicCard className="w-full max-w-md rounded-xl" glowColor="132, 0, 255" enableParticles={true}>
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto p-3 rounded-xl bg-primary/10 w-fit">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">{t('appName')}</CardTitle>
            <CardDescription className="mt-2">
              {activeTab === 'login' ? t('loginDescription') : t('signupDescription')}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                {t('login')}
              </TabsTrigger>
              <TabsTrigger value="signup" className="flex items-center gap-2" disabled={signupsDisabled}>
                <UserPlus className="h-4 w-4" />
                {t('signup')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {t('email')}
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    {t('password')}
                  </Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                </div>
                <MagicButton type="submit" className="w-full" disabled={isLoading} glowColor="132, 0, 255">
                  {isLoading ? t('loading') : t('login')}
                </MagicButton>
                <Button
                  type="button"
                  variant="link"
                  className="w-full text-sm text-muted-foreground"
                  onClick={() => setShowForgotPassword(true)}
                >
                  {t('forgotPassword')}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              {signupsDisabled ? (
                <div className="text-center py-6 space-y-3">
                  <div className="p-3 rounded-full bg-destructive/10 w-fit mx-auto">
                    <UserPlus className="h-6 w-6 text-destructive" />
                  </div>
                  <p className="text-muted-foreground">{t('maxUsersReached')}</p>
                </div>
              ) : (
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {t('email')}
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      {t('password')}
                    </Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      autoComplete="new-password"
                      minLength={6}
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('passwordRequirement')}
                    </p>
                  </div>
                  <MagicButton type="submit" className="w-full" disabled={isLoading} glowColor="132, 0, 255">
                    {isLoading ? t('loading') : t('signup')}
                  </MagicButton>
                </form>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      </MagicCard>
    </div>
  );
};

export default Auth;
