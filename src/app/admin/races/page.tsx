
'use client';

import * as React from 'react';
import Link from 'next/link';
import { getGameRaceList, type GameRace } from '@/services/race';
import { getGameList } from '@/services/game';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
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
  PlusCircle,
  Edit,
  Trash2,
  Palette, 
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
import { deleteGameRaceAction } from './actions';
import { useRouter } from 'next/navigation';

export default function AdminGameRacesPage() {
  const [gameRaces, setGameRaces] = React.useState<GameRace[]>([]);
  const [gamesMap, setGamesMap] = React.useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();
  const router = useRouter();

  React.useEffect(() => {
    document.title = 'Gerenciar Raças';
  }, []);

  React.useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [racesList, allGames] = await Promise.all([
          getGameRaceList(),
          getGameList()
        ]);
        
        const fetchedGamesMap = new Map<string, string>();
        allGames.forEach(game => fetchedGamesMap.set(game.id, game.name));

        setGamesMap(fetchedGamesMap);
        setGameRaces(racesList);

      } catch (error: any) {
        console.error('Failed to fetch game races or games:', error);
        toast({ title: "Erro", description: `Falha ao carregar dados: ${error.message || 'Erro desconhecido'}`, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [toast, router]);

  const handleDelete = async (raceId: string, raceName: string) => {
    const result = await deleteGameRaceAction(raceId);
    if (result.success) {
      toast({
        title: 'Raça Excluída',
        description: `A raça "${raceName}" foi excluída com sucesso.`,
      });
      setGameRaces(prev => prev.filter(gr => gr.id !== raceId));
    } else {
      toast({
        title: 'Erro na Exclusão',
        description: result.rawMessage || 'Ocorreu um erro inesperado.',
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
        <h1 className="text-3xl font-bold text-primary">Gerenciar Raças de Jogo</h1>
        <Button asChild>
          <Link href="/admin/races/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Raça
          </Link>
        </Button>
      </div>

      {gameRaces.length === 0 ? (
        <Card className="py-12 text-center">
          <CardHeader>
            <Palette className="mx-auto h-12 w-12 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-lg text-muted-foreground">Nenhuma raça encontrada.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Jogo Associado</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gameRaces.map((gr) => (
                <TableRow key={gr.id}>
                  <TableCell className="font-medium">{gr.name}</TableCell>
                  <TableCell>{gamesMap.get(gr.game_id) || gr.game_id}</TableCell>
                  <TableCell className="max-w-xs truncate">{gr.description || '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="icon" className="hover:text-primary">
                      <Link href={`/admin/races/${gr.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir a raça "{gr.name}"?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(gr.id, gr.name)} className="bg-destructive hover:bg-destructive/90">
                            Confirmar Exclusão
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
