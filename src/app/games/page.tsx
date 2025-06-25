
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { getGameList, type Game } from '@/services/game';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Gamepad2, Loader2 } from 'lucide-react';
import * as React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function GamesPage() {
  const [games, setGames] = React.useState<Game[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [fetchError, setFetchError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchGames() {
      setIsLoading(true);
      setFetchError(null);
      try {
        const allGames = await getGameList();
        setGames(allGames ? allGames.filter((game) => game.is_active) : []);
      } catch (error: any) {
        console.error('Failed to fetch games:', error);
        setGames([]);
        setFetchError(
          error.message ||
            'Ocorreu um erro inesperado. Detalhes: Erro desconhecido'
        );
      } finally {
        setIsLoading(false);
      }
    }
    fetchGames();
  }, []);

  React.useEffect(() => {
    document.title = 'Jogos - TableSheet';
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary">
            Jogos Disponíveis
          </h1>
        </div>
        <div className="flex min-h-[200px] items-center justify-center">
          <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
          <span>Carregando jogos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">
          Jogos Disponíveis
        </h1>
      </div>

      {fetchError && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro ao Carregar Jogos</AlertTitle>
          <AlertDescription>
            {`Não foi possível buscar a lista de jogos. Por favor, tente novamente mais tarde. Detalhes: ${fetchError}`}
          </AlertDescription>
        </Alert>
      )}

      {!fetchError && games.length === 0 ? (
        <Card className="py-12 text-center">
          <CardHeader>
            <Gamepad2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <CardTitle>Nenhum Jogo Ativo Encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Volte mais tarde para novos e emocionantes jogos de mesa!
            </CardDescription>
          </CardContent>
        </Card>
      ) : !fetchError && games.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function GameCard({ game }: { game: Game }) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden shadow-md transition-shadow duration-300 hover:shadow-lg">
      {game.cover_image_url ? (
        <div className="relative aspect-[16/9] w-full bg-muted">
          <Image
            src={game.cover_image_url}
            alt={`Cover for ${game.name}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={game.dataAiHint || 'game cover'}
          />
        </div>
      ) : (
        <div className="flex aspect-[16/9] w-full items-center justify-center bg-muted text-muted-foreground">
          <Gamepad2 className="h-16 w-16 opacity-50" />
        </div>
      )}
      <CardHeader className="pb-2">
        <CardTitle className="mb-1 text-xl">{game.name}</CardTitle>
        <p className="text-xs text-muted-foreground">
          Versão: {game.version}
        </p>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription className="line-clamp-3">
          {game.description}
        </CardDescription>
      </CardContent>
      <CardFooter className="border-t pt-3">
        <Button
          asChild
          variant="link"
          className="h-auto p-0 text-primary hover:text-accent"
        >
          <Link href={`/games/${game.id}`}>
            Ver Detalhes
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
