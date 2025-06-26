
'use client';

import * as React from 'react';
import { getGameDetails, type Game } from '@/services/game';
import { GameForm } from '../../game-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/useToast';

export default function EditGamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const router = useRouter();
  const { toast } = useToast();

  const [game, setGame] = React.useState<Game | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchGame() {
      if (!gameId) return;
      setIsLoading(true);
      try {
        const fetchedGame = await getGameDetails(gameId);
        if (fetchedGame) {
          setGame(fetchedGame);
        } else {
          toast({ title: 'Erro', description: 'Jogo não encontrado.', variant: 'destructive' });
          router.replace('/admin/games');
        }
      } catch (error: any) {
        const errorDescription = `Falha ao carregar dados do jogo: ${error.message || 'Erro desconhecido'}`;
        toast({ title: 'Erro', description: errorDescription, variant: 'destructive' });
        router.replace('/admin/games');
      } finally {
        setIsLoading(false);
      }
    }
    fetchGame();
  }, [gameId, router, toast]);

  React.useEffect(() => {
    if (game?.name) {
      document.title = `Editar Jogo: ${game.name}`;
    } else if(!isLoading) {
      document.title = 'Editar Jogo';
    }
  }, [game, isLoading]);

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
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="outline" size="sm" asChild className="mb-6">
        <Link href="/admin/games">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Gerenciar Jogos
        </Link>
      </Button>
      <GameForm game={game} isEditMode={true} />
    </div>
  );
}
