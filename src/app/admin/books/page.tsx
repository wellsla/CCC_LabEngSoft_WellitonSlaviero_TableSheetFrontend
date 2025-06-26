
'use client';

import * as React from 'react';
import Link from 'next/link';
import { getBookList, type GameBook } from '@/services/book';
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
  FileText, 
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
import { deleteBookAction } from './actions';
import { useRouter } from 'next/navigation';

export default function AdminGameBooksPage() {
  const [gameBooks, setGameBooks] = React.useState<GameBook[]>([]);
  const [gamesMap, setGamesMap] = React.useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();
  const router = useRouter();

  React.useEffect(() => {
    document.title = 'Gerenciar Livros';
  }, []);

  React.useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [booksList, allGames] = await Promise.all([
          getBookList(),
          getGameList()
        ]);
        
        const fetchedGamesMap = new Map<string, string>();
        allGames.forEach(game => fetchedGamesMap.set(game.id, game.name));

        setGamesMap(fetchedGamesMap);
        setGameBooks(booksList);

      } catch (error: any) {
        console.error('Failed to fetch game books or games:', error);
        toast({ title: "Erro", description: `Falha ao carregar dados: ${error.message || 'Erro desconhecido'}`, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [toast, router]);

  const handleDelete = async (bookId: string, bookName: string) => {
    const result = await deleteBookAction(bookId);
    if (result.success) {
      toast({
        title: 'Livro Excluído',
        description: `O livro "${bookName}" foi excluído com sucesso.`,
      });
      setGameBooks(prev => prev.filter(gr => gr.id !== bookId));
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
        <h1 className="text-3xl font-bold text-primary">Gerenciar Livros</h1>
        <Button asChild>
          <Link href="/admin/books/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Livro
          </Link>
        </Button>
      </div>

      {gameBooks.length === 0 ? (
        <Card className="py-12 text-center">
          <CardHeader>
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-lg text-muted-foreground">Nenhum livro encontrado.</p>
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
              {gameBooks.map((book) => (
                <TableRow key={book.id}>
                  <TableCell className="font-medium">{book.name}</TableCell>
                  <TableCell>{gamesMap.get(book.game_id) || book.game_id}</TableCell>
                  <TableCell className="max-w-xs truncate">{book.description || '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="icon" className="hover:text-primary">
                      <Link href={`/admin/books/${book.id}/edit`}>
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
                            Tem certeza que deseja excluir o livro "{book.name}"?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(book.id, book.name)} className="bg-destructive hover:bg-destructive/90">
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
