
'use client';

import * as React from 'react';
import { getGameClassDetails, type GameClass, getAuthTokenFromLocalStorage } from '@/services/class'; // Import getAuthTokenFromLocalStorage
import { GameClassForm } from '../../class-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function EditGameClassPage() {
  const params = useParams();
  const classId = params.classId as string;
  const router = useRouter();
  const { toast } = useToast();
  const { t, currentLocale } = useTranslation();

  const [gameClass, setGameClass] = React.useState<GameClass | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchGameClass() {
      if (!classId) return;
      setIsLoading(true);
      const token = getAuthTokenFromLocalStorage(); // Get token client-side
      if (!token) {
        toast({ title: t("general.error"), description: t("general.authenticationFailed"), variant: "destructive" });
        setIsLoading(false);
        router.push('/auth/login');
        return;
      }
      try {
        const fetchedClass = await getGameClassDetails(classId, token); // Pass token
        if (fetchedClass) {
          setGameClass(fetchedClass);
        } else {
          toast({ title: t('general.error'), description: t('admin.classes.edit.toastNotFound'), variant: 'destructive' });
          router.replace('/admin/classes');
        }
      } catch (error: any) {
        toast({ title: t('general.error'), description: t('admin.classes.edit.toastErrorLoading', {details: error.message || 'Unknown error'}), variant: 'destructive' });
        router.replace('/admin/classes');
      } finally {
        setIsLoading(false);
      }
    }
    fetchGameClass();
  }, [classId, router, toast, t]);

  React.useEffect(() => {
    if (gameClass?.name) {
      document.title = t('admin.classes.edit.documentTitle', { name: gameClass.name });
    } else if(!isLoading) {
      document.title = t('admin.classes.edit.documentTitle', { name: t('general.classFallbackName') || 'Class' });
    }
  }, [gameClass, isLoading, t, currentLocale]);

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!gameClass) {
    return (
        <div className="container mx-auto px-4 py-8 text-center">
            <p>{t('loading')}...</p> 
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="outline" size="sm" asChild className="mb-6">
        <Link href="/admin/classes">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('admin.classes.edit.backButton')}
        </Link>
      </Button>
      <GameClassForm gameClass={gameClass} isEditMode={true} />
    </div>
  );
}
