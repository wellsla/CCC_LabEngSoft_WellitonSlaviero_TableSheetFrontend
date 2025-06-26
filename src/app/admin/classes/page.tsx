
'use client';

import * as React from 'react';
import Link from 'next/link';
import { getGameClassList, type GameClass } from '@/services/class';
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
  BookOpen, 
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
import { deleteGameClassAction } from './actions';
import { useRouter } from 'next/navigation';

export default function AdminGameClassesPage() {
  const [gameClasses, setGameClasses] = React.useState<GameClass[]>([]);
  const [gamesMap, setGamesMap] = React.useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();
  const router = useRouter();

  React.useEffect(() => {
    document.title = 'Gerenciar Classes';
  }, []);

  React.useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [classesList, allGames] = await Promise.all([
          getGameClassList(),
          getGameList()
        ]);
        
        const fetchedGamesMap = new Map<string, string>();
        allGames.forEach(game => fetchedGamesMap.set(game.id, game.name));

        setGamesMap(fetchedGamesMap);
        setGameClasses(classesList);

      } catch (error: any) {
        console.error('Failed to fetch game classes or games:', error);
        toast({ title: "Erro", description: `Falha ao carregar os dados: ${error.message || 'Erro desconhecido'}`, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [toast, router]);

  const handleDelete = async (classId: string, className: string) => {
    const result = await deleteGameClassAction(classId);
    if (result.success) {
      toast({
        title: 'Classe Excluída',
        description: `A classe "${className}" foi excluída com sucesso.`,
      });
      setGameClasses(prev => prev.filter(gc => gc.id !== classId));
    } else {
      const errorDescription = result.rawMessage || 'Ocorreu um erro inesperado.';
      toast({
        title: 'Erro',
        description: `Não foi possível excluir "${className}". Detalhes: ${errorDescription}`,
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
        <h1 className="text-3xl font-bold text-primary">Gerenciar Classes de Jogo</h1>
        <Button asChild>
          <Link href="/admin/classes/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Classe
          </Link>
        </Button>
      </div>

      {gameClasses.length === 0 ? (
        <Card className="py-12 text-center">
          <CardHeader>
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-lg text-muted-foreground">Nenhuma classe de jogo encontrada.</p>
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
              {gameClasses.map((gc) => (
                <TableRow key={gc.id}>
                  <TableCell className="font-medium">{gc.name}</TableCell>
                  <TableCell>{gamesMap.get(gc.game_id) || gc.game_id}</TableCell>
                  <TableCell className="max-w-xs truncate">{gc.description || '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="icon" className="hover:text-primary">
                      <Link href={`/admin/classes/${gc.id}/edit`}>
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
                           Tem certeza que deseja excluir a classe "{gc.name}"?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(gc.id, gc.name)} className="bg-destructive hover:bg-destructive/90">
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
