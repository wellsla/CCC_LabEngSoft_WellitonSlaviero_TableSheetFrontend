
'use client';

import * as React from 'react';
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
import { Badge } from '@/components/ui/badge';
import {
  Gamepad2,
  PlusCircle,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  ImageOff,
  Loader2,
} from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { deleteGameAction } from './actions';
import { useRouter } from 'next/navigation';

export default function AdminGamesPage() {
  const [games, setGames] = React.useState<Game[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();
  const router = useRouter();

  React.useEffect(() => {
    document.title = 'Gerenciar Jogos - TableSheet';
    const fetchGames = async () => {
      setIsLoading(true);
      try {
        const gameList = await getGameList();
        setGames(gameList);
      } catch (error: any) {
        console.error('Failed to fetch games:', error);
        const errorDescription = `Falha ao carregar jogos: ${error.message || 'Erro desconhecido'}`;
        toast({ title: "Erro", description: errorDescription, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchGames();
  }, [toast]);

  const handleDelete = async (gameId: string, gameName: string) => {
    const result = await deleteGameAction(gameId);
    if (result.success) {
      toast({
        title: 'Jogo Excluído',
        description: `O jogo "${gameName}" foi excluído com sucesso.`,
      });
      setGames(prev => prev.filter(g => g.id !== gameId));
    } else {
      const errorDescription = result.rawMessage || 'Ocorreu um erro inesperado.';
      toast({
        title: 'Falha na Exclusão',
        description: `Não foi possível excluir "${gameName}". Detalhes: ${errorDescription}`,
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
        <h1 className="text-3xl font-bold text-primary">Gerenciar Jogos</h1>
        <Button asChild>
          <Link href="/admin/games/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Criar Novo Jogo
          </Link>
        </Button>
      </div>

      {games.length === 0 && !isLoading ? (
        <Card className="py-12 text-center">
          <CardHeader>
            <Gamepad2 className="mx-auto h-12 w-12 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-lg text-muted-foreground">Nenhum jogo encontrado.</p>
            <Button asChild className="mt-4">
              <Link href="/admin/games/new">Crie o Primeiro Jogo</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {games.map((game) => (
            <AdminGameCard key={game.id} game={game} onDelete={() => handleDelete(game.id, game.name)} />
          ))}
        </div>
      )}
    </div>
  );
}

interface AdminGameCardProps {
  game: Game;
  onDelete: () => void;
}

function AdminGameCard({ game, onDelete }: AdminGameCardProps) {
  return (
    <Card className="shadow-sm transition-shadow duration-200 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div className="flex items-start gap-3">
            {game.cover_image_url ? (
              <Image
                src={game.cover_image_url}
                alt={`Capa de ${game.name}`}
                width={80}
                height={50}
                sizes="80px"
                className="aspect-[8/5] rounded-md bg-muted object-contain"
                data-ai-hint={game.dataAiHint || 'game cover'}
              />
            ) : (
              <div className="flex h-[50px] w-[80px] items-center justify-center rounded-md bg-muted">
                <ImageOff className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <div>
              <CardTitle className="flex items-center text-xl">
                <Gamepad2 className="mr-2 h-6 w-6 text-accent" />
                {game.name}
              </CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                Versão: {game.version}
              </p>
            </div>
          </div>
          <Badge
            variant={game.is_active ? 'default' : 'outline'}
            className="mt-2 w-fit whitespace-nowrap sm:mt-0"
          >
            {game.is_active ? (
              <CheckCircle className="mr-1 h-3 w-3" />
            ) : (
              <XCircle className="mr-1 h-3 w-3" />
            )}
            {game.is_active ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-4 pt-0">
        <CardDescription className="line-clamp-3">
          {game.description}
        </CardDescription>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t pt-4">
        <Button asChild variant="link" className="h-auto p-0 text-sm">
          <Link href={`/games/${game.id}`}>Ver Página Pública</Link>
        </Button>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/games/${game.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir o jogo "{game.name}"? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Confirmar Exclusão
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  );
}
