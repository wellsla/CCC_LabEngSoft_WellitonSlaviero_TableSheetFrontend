
'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  getAllUsers,
  deleteUserById,
  type UserProfile,
} from '@/services/userProfile';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Edit,
  Trash2,
  UserCheck,
  UserX,
  ShieldCheck,
  ShieldAlert,
  UserCog,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { revalidatePath } from 'next/cache'; // Note: revalidatePath in client components has no effect on client-side state.
import { useTranslation } from '@/hooks/useTranslation';

// Server Action for deleting a user, now moved to its own file or kept here if this page itself becomes more complex server-side
// For simplicity, if this page remains primarily client-driven for display, calling deleteUserById directly (which uses localStorage for token) is fine.
// If this page had server-side data fetching needs, then a separate Server Action file would be better.
// The service function deleteUserById handles the API call and token from localStorage.

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();
  const { t, currentLocale } = useTranslation();

  React.useEffect(() => {
    document.title = t('admin.users.page.documentTitle');
  }, [t, currentLocale]);

  React.useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const userList = await getAllUsers();
        setUsers(userList);
      } catch (error: any) {
        console.error('Failed to fetch users:', error);
        const errorDescription = t('admin.users.page.toastErrorLoading', { details: error.message || 'Unknown error' });
        toast({ title: t("general.error"), description: errorDescription, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [toast, t]);

  const handleDelete = async (userId: string, userName: string) => {
    // Directly call the service function, which gets token from localStorage
    const result = await deleteUserById(userId); 
    if (result.success) {
      toast({
        title: t('admin.users.page.toastDeleteSuccessTitle'),
        description: t('admin.users.page.toastDeleteSuccessDescription', { name: userName }),
      });
      setUsers(prev => prev.filter(u => u.id !== userId));
      revalidatePath('/admin/users'); // Revalidate if data is also used server-side elsewhere, though client state is primary here.
    } else {
      const errorDescription = result.messageKey
        ? t(result.messageKey, { details: result.rawMessage || '' })
        : result.rawMessage || t('general.unexpectedError');
      toast({
        title: t('admin.users.page.toastDeleteFailTitle'),
        description: t('admin.users.page.toastDeleteFailDescription', { name: userName, details: errorDescription }),
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="flex items-center text-3xl font-bold text-primary">
          <UserCog className="mr-3 h-8 w-8" /> {t('admin.users.page.title')}
        </h1>
      </div>

      {users.length === 0 && !isLoading ? (
        <p className="text-center text-muted-foreground">{t('admin.users.page.noUsers')}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('admin.users.table.name')}</TableHead>
                <TableHead>{t('admin.users.table.email')}</TableHead>
                <TableHead>{t('admin.users.table.role')}</TableHead>
                <TableHead>{t('admin.users.table.status')}</TableHead>
                <TableHead>{t('admin.users.table.suspended')}</TableHead>
                <TableHead className="text-right">{t('admin.users.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={user.is_admin ? 'default' : 'secondary'}
                      className="capitalize"
                    >
                      {user.is_admin ? (
                        <ShieldCheck className="mr-1 h-3 w-3" />
                      ) : (
                        <ShieldAlert className="mr-1 h-3 w-3" />
                      )}
                      {user.is_admin ? t('admin.users.table.roleAdmin') : t('admin.users.table.roleUser')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.status === 'active'
                          ? 'secondary'
                          : user.status === 'suspended'
                            ? 'destructive'
                            : 'outline'
                      }
                      className="capitalize"
                    >
                      {user.status === 'active' && (
                        <UserCheck className="mr-1 h-3 w-3" />
                      )}
                      {user.status === 'suspended' && (
                        <UserX className="mr-1 h-3 w-3" />
                      )}
                      {user.status ? t(`userForm.status${user.status.charAt(0).toUpperCase() + user.status.slice(1)}` as any, {defaultValue: user.status}) : 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.is_suspended ? 'destructive' : 'secondary'}
                      className="capitalize"
                    >
                      {user.is_suspended ? (
                        <UserX className="mr-1 h-3 w-3" />
                      ) : (
                        <UserCheck className="mr-1 h-3 w-3" />
                      )}
                      {user.is_suspended ? t('general.yes') : t('general.no')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      className="hover:text-primary"
                      aria-label={t('admin.users.table.editUserAriaLabel', {name: user.name})}
                    >
                      <Link href={`/admin/users/${user.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:text-destructive"
                          aria-label={t('admin.users.table.deleteUserAriaLabel', {name: user.name})}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {t('admin.users.page.deleteConfirmTitle')}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('admin.users.page.deleteConfirmDescription', {name: user.name, email: user.email})}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('general.cancel')}</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(user.id, user.name)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            {t('admin.users.page.deleteConfirmButton')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

