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
import { Mail, Lock, LogIn, UserPlus, FileText, KeyRound, ArrowLeft, ShieldCheck, AlertTriangle } from 'lucide-react';
import { MagicButton } from '@/components/MagicButton';
import { MagicCard } from '@/components/MagicCard';
import { supabase } from '@/integrations/supabase/client';
import { strongPasswordSchema, emailSchema, safeValidate } from '@/lib/validation';

const MAX_USERS = 3;
const ADMIN_EMAIL = 'sarwats2005@gmail.com';

interface RateLimitResponse {
  allowed: boolean;
  blocked: boolean;
  blockedUntil?: string;
  remainingSeconds?: number;
  attemptsRemaining?: number;
}

const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [userCount, setUserCount] = useState<number | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitResponse | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<{ valid: boolean; errors: string[] }>({ valid: false, errors: [] });
  
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

  // Validate password strength on change
  useEffect(() => {
    if (activeTab === 'signup' && password) {
      const result = safeValidate(strongPasswordSchema, password);
      if (result.success) {
        setPasswordStrength({ valid: true, errors: [] });
      } else {
        setPasswordStrength({ valid: false, errors: ['error' in result ? result.error : 'Invalid'] });
      }
    }
  }, [password, activeTab]);

  const checkRateLimit = async (attemptType: 'login' | 'signup' | 'password_reset'): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('auth-rate-limit', {
        body: { identifier: email.toLowerCase(), attemptType, action: 'check' },
      });

      if (error) {
        console.error('Rate limit check error:', error);
        return true; // Fail open
      }

      const response = data as RateLimitResponse;
      setRateLimitInfo(response);

      if (response.blocked) {
        const minutes = Math.ceil((response.remainingSeconds || 0) / 60);
        toast({
          title: t('tooManyAttempts'),
          description: t('tryAgainIn').replace('{minutes}', String(minutes)),
          variant: 'destructive',
        });
        return false;
      }

      return response.allowed;
    } catch (error) {
      console.error('Rate limit error:', error);
      return true; // Fail open
    }
  };

  const clearRateLimit = async (attemptType: 'login' | 'signup' | 'password_reset') => {
    try {
      await supabase.functions.invoke('auth-rate-limit', {
        body: { identifier: email.toLowerCase(), attemptType, action: 'clear' },
      });
      setRateLimitInfo(null);
    } catch (error) {
      console.error('Clear rate limit error:', error);
    }
  };

  const validateEmail = (emailToValidate: string): boolean => {
    const result = safeValidate(emailSchema, emailToValidate);
    if (!result.success) {
      toast({
        title: t('validationError'),
        description: 'error' in result ? result.error : 'Invalid email',
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const validateLoginForm = (): boolean => {
    if (!validateEmail(email)) return false;
    if (password.length < 6) {
      toast({
        title: t('validationError'),
        description: t('passwordMinLength'),
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const validateSignupForm = (): boolean => {
    if (!validateEmail(email)) return false;
    
    const passwordResult = safeValidate(strongPasswordSchema, password);
    if (!passwordResult.success) {
      toast({
        title: t('validationError'),
        description: 'error' in passwordResult ? passwordResult.error : 'Invalid password',
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLoginForm()) return;

    // Check rate limit
    const allowed = await checkRateLimit('login');
    if (!allowed) return;

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
      // Clear rate limit on success
      await clearRateLimit('login');
      toast({ title: t('loginSuccess') });
      navigate('/dashboard');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignupForm()) return;

    // Check if max users reached (allow admin email always)
    if (userCount !== null && userCount >= MAX_USERS && email.toLowerCase() !== ADMIN_EMAIL) {
      toast({
        title: t('signupFailed'),
        description: t('maxUsersReached'),
        variant: 'destructive',
      });
      return;
    }

    // Check rate limit
    const allowed = await checkRateLimit('signup');
    if (!allowed) return;

    setIsLoading(true);
    const { error } = await signUp(email, password);
    setIsLoading(false);

    if (error) {
      let message = error.message;
      if (error.message.includes('already registered')) {
        message = t('emailExists');
      }
      toast({
        title: t('signupFailed'),
        description: message,
        variant: 'destructive',
      });
    } else {
      // Clear rate limit on success
      await clearRateLimit('signup');
      toast({ title: t('signupSuccess'), description: t('youCanNowLogin') });
      setActiveTab('login');
      // Refresh user count
      const newCount = await getUserCount();
      setUserCount(newCount);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(resetEmail)) return;

    // Check rate limit
    const emailToCheck = resetEmail.toLowerCase();
    try {
      const { data, error } = await supabase.functions.invoke('auth-rate-limit', {
        body: { identifier: emailToCheck, attemptType: 'password_reset', action: 'check' },
      });

      if (!error && data && !data.allowed) {
        const minutes = Math.ceil((data.remainingSeconds || 0) / 60);
        toast({
          title: t('tooManyAttempts'),
          description: t('tryAgainIn').replace('{minutes}', String(minutes)),
          variant: 'destructive',
        });
        return;
      }
    } catch (err) {
      // Continue if rate limit check fails
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

  // Password strength indicator
  const getPasswordStrengthColor = () => {
    if (!password) return 'bg-muted';
    if (passwordStrength.valid) return 'bg-success';
    if (password.length >= 8) return 'bg-warning';
    return 'bg-destructive';
  };

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
          {/* Rate limit warning */}
          {rateLimitInfo && rateLimitInfo.attemptsRemaining !== undefined && rateLimitInfo.attemptsRemaining <= 2 && (
            <div className="mb-4 p-3 rounded-lg bg-warning/10 border border-warning/20 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="text-sm text-warning">
                {t('attemptsRemaining').replace('{count}', String(rateLimitInfo.attemptsRemaining))}
              </span>
            </div>
          )}

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
                    />
                    {/* Password strength indicator */}
                    <div className="space-y-1">
                      <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all ${getPasswordStrengthColor()}`}
                          style={{ width: password.length === 0 ? '0%' : passwordStrength.valid ? '100%' : `${Math.min(password.length * 10, 70)}%` }}
                        />
                      </div>
                      {passwordStrength.valid ? (
                        <p className="text-xs text-success flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3" />
                          {t('strongPassword')}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          {t('passwordRequirementStrong')}
                        </p>
                      )}
                    </div>
                  </div>
                  <MagicButton 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading || !passwordStrength.valid} 
                    glowColor="132, 0, 255"
                  >
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
