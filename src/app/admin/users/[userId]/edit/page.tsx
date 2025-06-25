
'use client';

import * as React from 'react';
import { getUserDetailsById, type UserProfile } from '@/services/userProfile';
import { UserForm } from '../../user-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, UserCog, Loader2 } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface EditUserPageProps {
  params: { userId: string };
}

export default function EditUserPage({ params: routeParams }: EditUserPageProps) {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const { t, currentLocale } = useTranslation();

  const [user, setUser] = React.useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchUser() {
      if (!userId) return;
      setIsLoading(true);
      try {
        const fetchedUser = await getUserDetailsById(userId);
        if (fetchedUser) {
          setUser(fetchedUser);
        } else {
          toast({ title: t('general.error'), description: t('admin.users.edit.toastNotFound'), variant: 'destructive' });
          router.replace('/admin/users');
        }
      } catch (error: any) {
        const errorDescription = t('admin.users.edit.toastErrorLoading', {details: error.message || 'Unknown error'});
        toast({ title: t('general.error'), description: errorDescription, variant: 'destructive' });
        router.replace('/admin/users');
      } finally {
        setIsLoading(false);
      }
    }
    fetchUser();
  }, [userId, router, toast, t]);

  React.useEffect(() => {
    if (user?.name) {
      document.title = t('admin.users.edit.documentTitle', { name: user.name });
    } else if (!isLoading){
      document.title = t('admin.users.edit.documentTitle', { name: t('general.userFallbackName') || 'User' });
    }
  }, [user, isLoading, t, currentLocale]);

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
          <p>{t('loading')}...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="outline" size="sm" asChild className="mb-6">
        <Link href="/admin/users">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('admin.users.edit.backButton')}
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <UserCog className="h-6 w-6 text-primary" />
            <CardTitle>{t('admin.users.edit.pageTitle', { name: user.name })}</CardTitle>
          </div>
          <CardDescription>
            {t('admin.users.edit.pageDescription', { email: user.email })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm user={user} />
        </CardContent>
      </Card>
    </div>
  );
}

