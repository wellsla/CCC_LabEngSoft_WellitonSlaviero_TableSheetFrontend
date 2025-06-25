'use client';

import * as React from 'react';
import Link from 'next/link';
import { getBookList, type GameBook, getAuthTokenFromLocalStorage } from '@/services/book';
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
import { useTranslation } from '@/hooks/useTranslation';
import { useRouter } from 'next/navigation';

export default function AdminGameBooksPage() {
  const [gameBooks, setGameBooks] = React.useState<GameBook[]>([]);
  const [gamesMap, setGamesMap] = React.useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();
  const { t, currentLocale } = useTranslation();
  const router = useRouter();

  React.useEffect(() => {
    document.title = t('admin.books.page.documentTitle');
  }, [t, currentLocale]);

  React.useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const token = getAuthTokenFromLocalStorage();
      if (!token) {
        toast({ title: t("general.error"), description: t("general.authenticationFailed"), variant: "destructive" });
        setIsLoading(false);
        router.push('/auth/login');
        return;
      }

      try {
        const [booksList, allGames] = await Promise.all([
          getBookList(undefined, token),
          getGameList()
        ]);
        
        const fetchedGamesMap = new Map<string, string>();
        allGames.forEach(game => fetchedGamesMap.set(game.id, game.name));

        setGamesMap(fetchedGamesMap);
        setGameBooks(booksList);

      } catch (error: any) {
        console.error('Failed to fetch game books or games:', error);
        toast({ title: t("general.error"), description: t("admin.books.page.toastErrorLoading", {details: error.message || 'Unknown error'}), variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [toast, t, router]);

  const handleDelete = async (bookId: string, bookName: string) => {
    const token = getAuthTokenFromLocalStorage();
    if (!token) {
      toast({ title: t("general.error"), description: t("general.authenticationFailed"), variant: "destructive" });
      router.push('/auth/login');
      return;
    }
    const result = await deleteBookAction(bookId, token);
    if (result.success) {
      toast({
        title: t('admin.books.page.toastDeleteSuccessTitle'),
        description: t('admin.books.page.toastDeleteSuccess', { name: bookName }),
      });
      setGameBooks(prev => prev.filter(gr => gr.id !== bookId));
    } else {
      const errorDescription = result.messageKey
        ? t(result.messageKey, { details: result.rawMessage || '' })
        : result.rawMessage || t('general.unexpectedError');
      toast({
        title: t('general.error'),
        description: t('admin.books.page.toastDeleteError', { name: bookName, details: errorDescription }),
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
        <h1 className="text-3xl font-bold text-primary">{t('admin.books.page.title')}</h1>
        <Button asChild>
          <Link href="/admin/books/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('admin.books.page.createButton')}
          </Link>
        </Button>
      </div>

      {gameBooks.length === 0 ? (
        <Card className="py-12 text-center">
          <CardHeader>
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-lg text-muted-foreground">{t('admin.books.page.noBooks')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('admin.books.table.name')}</TableHead>
                <TableHead>{t('admin.books.table.game')}</TableHead>
                <TableHead>{t('admin.books.table.description')}</TableHead>
                <TableHead className="text-right">{t('general.actions')}</TableHead>
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
                          <AlertDialogTitle>{t('admin.books.page.deleteConfirmTitle')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('admin.books.page.deleteConfirmDescription', {name: book.name})}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('general.cancel')}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(book.id, book.name)} className="bg-destructive hover:bg-destructive/90">
                            {t('general.delete')}
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
