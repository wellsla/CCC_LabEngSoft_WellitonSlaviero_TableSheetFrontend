'use client';

import * as React from 'react';
import { getGameRaceDetails, type GameRace, getAuthTokenFromLocalStorage } from '@/services/race';
import { GameRaceForm } from '../../race-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function EditGameRacePage() {
  const params = useParams();
  const raceId = params.raceId as string;
  const router = useRouter();
  const { toast } = useToast();
  const { t, currentLocale } = useTranslation();

  const [gameRace, setGameRace] = React.useState<GameRace | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchGameRace() {
      if (!raceId) return;
      setIsLoading(true);
      const token = getAuthTokenFromLocalStorage();
      if (!token) {
        toast({ title: t("general.error"), description: t("general.authenticationFailed"), variant: "destructive" });
        setIsLoading(false);
        router.push('/auth/login');
        return;
      }
      try {
        const fetchedRace = await getGameRaceDetails(raceId, token);
        if (fetchedRace) {
          setGameRace(fetchedRace);
        } else {
          toast({ title: t('general.error'), description: t('admin.races.edit.toastNotFound'), variant: 'destructive' });
          router.replace('/admin/races');
        }
      } catch (error: any) {
        toast({ title: t('general.error'), description: t('admin.races.edit.toastErrorLoading', {details: error.message || 'Unknown error'}), variant: 'destructive' });
        router.replace('/admin/races');
      } finally {
        setIsLoading(false);
      }
    }
    fetchGameRace();
  }, [raceId, router, toast, t]);

  React.useEffect(() => {
    if (gameRace?.name) {
      document.title = t('admin.races.edit.documentTitle', { name: gameRace.name });
    } else if(!isLoading) {
      document.title = t('admin.races.edit.documentTitle', { name: t('general.raceFallbackName') || 'Race' });
    }
  }, [gameRace, isLoading, t, currentLocale]);

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!gameRace) {
    return (
        <div className="container mx-auto px-4 py-8 text-center">
            <p>{t('loading')}...</p> 
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="outline" size="sm" asChild className="mb-6">
        <Link href="/admin/races">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('admin.races.edit.backButton')}
        </Link>
      </Button>
      <GameRaceForm gameRace={gameRace} isEditMode={true} />
    </div>
  );
}
