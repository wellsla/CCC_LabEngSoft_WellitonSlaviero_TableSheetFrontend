
import Link from 'next/link';
import Image from 'next/image';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gamepad2 } from 'lucide-react';
import type { Metadata } from 'next';
import { ApiClient, type Game } from '@/lib/apiClient';

export const metadata: Metadata = {
  title: 'Jogos Disponíveis',
  description: 'Explore todos os jogos de RPG de mesa suportados pelo TableSheet.',
};

export default async function GamesPage() {
  const apiClient = new ApiClient();
  const response = await apiClient.getGameList();
  const games: Game[] = response.data.filter(
    (game) => game.is_active && !game.deleted_at
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">
          Jogos Disponíveis
        </h1>
      </div>

      {games.length === 0 ? (
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
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
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
