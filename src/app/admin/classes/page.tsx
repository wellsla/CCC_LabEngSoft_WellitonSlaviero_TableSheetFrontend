
'use client';

import * as React from 'react';
import Link from 'next/link';
import { getGameClassList, type GameClass, getAuthTokenFromLocalStorage } from '@/services/class'; // Import getAuthTokenFromLocalStorage
import { getGameDetails, type Game, getGameList } from '@/services/game'; // To display game name and fetch all games for mapping
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
import { useTranslation } from '@/hooks/useTranslation';
import { useRouter } from 'next/navigation'; // For redirecting if no token

export default function AdminGameClassesPage() {
  const [gameClasses, setGameClasses] = React.useState<GameClass[]>([]);
  const [gamesMap, setGamesMap] = React.useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();
  const { t, currentLocale } = useTranslation();
  const router = useRouter();

  React.useEffect(() => {
    document.title = t('admin.classes.page.documentTitle');
  }, [t, currentLocale]);

  React.useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const token = getAuthTokenFromLocalStorage(); // Get token client-side
      if (!token) {
        toast({ title: t("general.error"), description: t("general.authenticationFailed"), variant: "destructive" });
        setIsLoading(false);
        router.push('/auth/login');
        return;
      }

      try {
        // Pass token if getGameClassList or getGameList require it for admin context
        const [classesList, allGames] = await Promise.all([
          getGameClassList(undefined, token), // Pass token
          getGameList() // Public game list might not need token
        ]);
        
        const fetchedGamesMap = new Map<string, string>();
        allGames.forEach(game => fetchedGamesMap.set(game.id, game.name));

        setGamesMap(fetchedGamesMap);
        setGameClasses(classesList);

      } catch (error: any) {
        console.error('Failed to fetch game classes or games:', error);
        toast({ title: t("general.error"), description: t("admin.classes.page.toastErrorLoading", {details: error.message || 'Unknown error'}), variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [toast, t, router]);

  const handleDelete = async (classId: string, className: string) => {
    const token = getAuthTokenFromLocalStorage(); // Get token for delete action
    if (!token) {
      toast({ title: t("general.error"), description: t("general.authenticationFailed"), variant: "destructive" });
      router.push('/auth/login');
      return;
    }
    const result = await deleteGameClassAction(classId, token); // Pass token
    if (result.success) {
      toast({
        title: t('admin.classes.page.toastDeleteSuccessTitle'),
        description: t('admin.classes.page.toastDeleteSuccess', { name: className }),
      });
      setGameClasses(prev => prev.filter(gc => gc.id !== classId));
    } else {
      const errorDescription = result.messageKey
        ? t(result.messageKey, { details: result.rawMessage || '' })
        : result.rawMessage || t('general.unexpectedError');
      toast({
        title: t('general.error'),
        description: t('admin.classes.page.toastDeleteError', { name: className, details: errorDescription }),
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
        <h1 className="text-3xl font-bold text-primary">{t('admin.classes.page.title')}</h1>
        <Button asChild>
          <Link href="/admin/classes/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('admin.classes.page.createButton')}
          </Link>
        </Button>
      </div>

      {gameClasses.length === 0 ? (
        <Card className="py-12 text-center">
          <CardHeader>
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-lg text-muted-foreground">{t('admin.classes.page.noClasses')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('admin.classes.table.name')}</TableHead>
                <TableHead>{t('admin.classes.table.game')}</TableHead>
                <TableHead>{t('admin.classes.table.description')}</TableHead>
                <TableHead className="text-right">{t('general.actions')}</TableHead>
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
                          <AlertDialogTitle>{t('admin.classes.page.deleteConfirmTitle')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('admin.classes.page.deleteConfirmDescription', {name: gc.name})}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('general.cancel')}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(gc.id, gc.name)} className="bg-destructive hover:bg-destructive/90">
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
