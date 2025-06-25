
'use client';

import * as React from 'react';
import { getGameDetails } from '@/services/game'; // getAuthTokenFromLocalStorage not needed here directly if getGameDetails is public
import { GameForm } from '../../game-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface EditGamePageProps {
  params: { gameId: string };
}

export default function EditGamePage({ params: routeParams }: EditGamePageProps) {
  const { gameId } = useParams<{ gameId: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const { t, currentLocale } = useTranslation();

  const [game, setGame] = React.useState<Awaited<ReturnType<typeof getGameDetails>>>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchGame() {
      if (!gameId) return;
      setIsLoading(true);
      try {
        // getGameDetails can be public, token not directly passed here
        // Form submission inside GameForm will handle token for update
        const fetchedGame = await getGameDetails(gameId); 
        if (fetchedGame) {
          setGame(fetchedGame);
        } else {
          toast({ title: t('general.error'), description: t('admin.games.edit.toastNotFound'), variant: 'destructive' });
          router.replace('/admin/games');
        }
      } catch (error: any) {
        const errorDescription = t('admin.games.edit.toastErrorLoading', {details: error.message || 'Unknown error'});
        toast({ title: t('general.error'), description: errorDescription, variant: 'destructive' });
        router.replace('/admin/games');
      } finally {
        setIsLoading(false);
      }
    }
    fetchGame();
  }, [gameId, router, toast, t]);

  React.useEffect(() => {
    if (game?.name) {
      document.title = t('admin.games.edit.documentTitle', { name: game.name });
    } else if(!isLoading) {
      document.title = t('admin.games.edit.documentTitle', { name: t('general.gameFallbackName') || 'Game' });
    }
  }, [game, isLoading, t, currentLocale]);

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!game) {
    return (
        <div className="container mx-auto px-4 py-8 text-center">
            <p>{t('loading')}...</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="outline" size="sm" asChild className="mb-6">
        <Link href="/admin/games">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('admin.games.edit.backButton')}
        </Link>
      </Button>
      <GameForm game={game} isEditMode={true} />
    </div>
  );
}
