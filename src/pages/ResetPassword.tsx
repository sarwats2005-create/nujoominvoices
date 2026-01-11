import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Lock, KeyRound, ArrowLeft, ShieldCheck, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { MagicButton } from '@/components/MagicButton';
import { MagicCard } from '@/components/MagicCard';
import { supabase } from '@/integrations/supabase/client';
import { strongPasswordSchema, safeValidate } from '@/lib/validation';

const ResetPassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<{ valid: boolean; errors: string[] }>({ valid: false, errors: [] });

  const { t } = useLanguage();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Validate token on mount by checking auth state
  useEffect(() => {
    const validateToken = async () => {
      setIsValidating(true);
      
      try {
        // Supabase handles the token from URL hash automatically
        // We need to check if there's an active recovery session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          setTokenError(t('invalidResetToken'));
          setIsValidToken(false);
        } else if (session) {
          // Check if this is a recovery session (user came from password reset email)
          // The session will be valid if token was correct
          setIsValidToken(true);
          setTokenError(null);
        } else {
          // No session means invalid or expired token
          setTokenError(t('expiredResetToken'));
          setIsValidToken(false);
        }
      } catch (err) {
        setTokenError(t('invalidResetToken'));
        setIsValidToken(false);
      } finally {
        setIsValidating(false);
      }
    };

    // Listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsValidToken(true);
        setTokenError(null);
        setIsValidating(false);
      }
    });

    // Small delay to allow Supabase to process the URL tokens
    const timer = setTimeout(validateToken, 500);

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [t]);

  // Validate password strength on change
  useEffect(() => {
    if (newPassword) {
      const result = safeValidate(strongPasswordSchema, newPassword);
      if (result.success) {
        setPasswordStrength({ valid: true, errors: [] });
      } else {
        setPasswordStrength({ valid: false, errors: ['error' in result ? result.error : 'Invalid'] });
      }
    } else {
      setPasswordStrength({ valid: false, errors: [] });
    }
  }, [newPassword]);

  const validateForm = (): boolean => {
    // Validate password strength
    const passwordResult = safeValidate(strongPasswordSchema, newPassword);
    if (!passwordResult.success) {
      toast({
        title: t('validationError'),
        description: 'error' in passwordResult ? passwordResult.error : 'Invalid password',
        variant: 'destructive',
      });
      return false;
    }

    // Check password match
    if (newPassword !== confirmPassword) {
      toast({
        title: t('validationError'),
        description: t('passwordsDoNotMatch'),
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // Update the password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      } else {
        setIsSuccess(true);
        
        // Sign out to invalidate all sessions (security best practice)
        await signOut();
        
        toast({
          title: t('passwordResetSuccess'),
          description: t('passwordResetSuccessDescription'),
        });
      }
    } catch (err) {
      toast({
        title: t('error'),
        description: t('somethingWentWrong'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (!newPassword) return 'bg-muted';
    if (passwordStrength.valid) return 'bg-success';
    if (newPassword.length >= 8) return 'bg-warning';
    return 'bg-destructive';
  };

  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;
  const passwordsMismatch = confirmPassword && newPassword !== confirmPassword;

  // Loading state
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/50 p-4">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">{t('validatingResetToken')}</p>
        </div>
      </div>
    );
  }

  // Invalid/expired token state
  if (!isValidToken && !isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/50 p-4">
        <MagicCard className="w-full max-w-md rounded-xl" glowColor="255, 100, 100" enableParticles={false}>
          <Card className="w-full max-w-md shadow-xl border-0">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto p-3 rounded-xl bg-destructive/10 w-fit">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-destructive">{t('invalidLink')}</CardTitle>
                <CardDescription className="mt-2">
                  {tokenError || t('invalidResetToken')}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                {t('resetLinkExpiredDescription')}
              </p>
              <Button
                className="w-full flex items-center gap-2"
                onClick={() => navigate('/auth')}
              >
                <ArrowLeft className="h-4 w-4" />
                {t('backToLogin')}
              </Button>
            </CardContent>
          </Card>
        </MagicCard>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/50 p-4">
        <MagicCard className="w-full max-w-md rounded-xl" glowColor="100, 200, 100" enableParticles={true}>
          <Card className="w-full max-w-md shadow-xl border-0">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto p-3 rounded-xl bg-success/10 w-fit">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-success">{t('passwordResetSuccess')}</CardTitle>
                <CardDescription className="mt-2">
                  {t('passwordResetSuccessDescription')}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                onClick={() => navigate('/auth')}
              >
                {t('goToLogin')}
              </Button>
            </CardContent>
          </Card>
        </MagicCard>
      </div>
    );
  }

  // Reset password form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/50 p-4">
      <MagicCard className="w-full max-w-md rounded-xl" glowColor="132, 0, 255" enableParticles={true}>
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto p-3 rounded-xl bg-primary/10 w-fit">
              <KeyRound className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">{t('resetPassword')}</CardTitle>
              <CardDescription className="mt-2">
                {t('resetPasswordDescription')}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {/* Security notice */}
            <div className="mb-4 p-3 rounded-lg bg-muted/50 border flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                {t('resetPasswordSecurityNotice')}
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="new-password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  {t('newPassword')}
                </Label>
                <PasswordInput
                  id="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••"
                  required
                  autoComplete="new-password"
                />
                {/* Password strength indicator */}
                <div className="space-y-1">
                  <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${getPasswordStrengthColor()}`}
                      style={{ width: newPassword.length === 0 ? '0%' : passwordStrength.valid ? '100%' : `${Math.min(newPassword.length * 10, 70)}%` }}
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

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  {t('confirmPassword')}
                </Label>
                <PasswordInput
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••"
                  required
                  autoComplete="new-password"
                />
                {/* Match indicator */}
                {confirmPassword && (
                  <p className={`text-xs flex items-center gap-1 ${passwordsMatch ? 'text-success' : 'text-destructive'}`}>
                    {passwordsMatch ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        {t('passwordsMatch')}
                      </>
                    ) : passwordsMismatch ? (
                      <>
                        <XCircle className="h-3 w-3" />
                        {t('passwordsDoNotMatch')}
                      </>
                    ) : null}
                  </p>
                )}
              </div>

              <MagicButton
                type="submit"
                className="w-full"
                disabled={isLoading || !passwordStrength.valid || !passwordsMatch}
                glowColor="132, 0, 255"
              >
                {isLoading ? t('loading') : t('resetPassword')}
              </MagicButton>

              <Button
                type="button"
                variant="ghost"
                className="w-full flex items-center gap-2"
                onClick={() => navigate('/auth')}
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
};

export default ResetPassword;
