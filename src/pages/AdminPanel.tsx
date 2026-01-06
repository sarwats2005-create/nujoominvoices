import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Shield, Trash2, KeyRound, ArrowLeft, Users } from 'lucide-react';
import { format } from 'date-fns';

interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  role: 'admin' | 'user';
}

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    setLoading(true);
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, created_at');

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      toast({
        title: t('error'),
        description: t('errorLoadingUsers'),
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role');

    if (rolesError) {
      console.error('Error fetching roles:', rolesError);
    }

    const usersWithRoles: UserProfile[] = (profiles || []).map((profile) => {
      const userRole = roles?.find((r) => r.user_id === profile.id);
      return {
        id: profile.id,
        email: profile.email,
        created_at: profile.created_at,
        role: (userRole?.role as 'admin' | 'user') || 'user',
      };
    });

    setUsers(usersWithRoles);
    setLoading(false);
  };

  const handleDeleteUser = async (userId: string) => {
    const { error } = await supabase.auth.admin.deleteUser(userId);
    
    if (error) {
      // If admin API not available, delete profile (cascade will handle the rest)
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        toast({
          title: t('error'),
          description: t('errorDeletingUser'),
          variant: 'destructive',
        });
        return;
      }
    }

    toast({
      title: t('success'),
      description: t('userDeleted'),
    });
    fetchUsers();
  };

  const handleResetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    });

    if (error) {
      toast({
        title: t('error'),
        description: t('errorResettingPassword'),
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: t('success'),
      description: t('passwordResetSent'),
    });
  };

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('backToDashboard')}
        </Button>

        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">{t('adminPanel')}</CardTitle>
                <CardDescription>{t('adminPanelDescription')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="text-muted-foreground">
                {t('totalUsers')}: {users.length}
              </span>
            </div>

            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('email')}</TableHead>
                    <TableHead>{t('role')}</TableHead>
                    <TableHead>{t('registeredOn')}</TableHead>
                    <TableHead className="text-right">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role === 'admin' ? t('admin') : t('user')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(user.created_at), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResetPassword(user.email)}
                          >
                            <KeyRound className="h-4 w-4 mr-1" />
                            {t('resetPassword')}
                          </Button>
                          
                          {user.role !== 'admin' && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  {t('delete')}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>{t('confirmDelete')}</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {t('deleteUserConfirmation')} {user.email}?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    {t('delete')}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;
