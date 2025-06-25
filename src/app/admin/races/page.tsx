'use client';

import * as React from 'react';
import Link from 'next/link';
import { getGameRaceList, type GameRace, getAuthTokenFromLocalStorage } from '@/services/race';
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
import { useTranslation } from '@/hooks/useTranslation';
import { useRouter } from 'next/navigation';

export default function AdminGameRacesPage() {
  const [gameRaces, setGameRaces] = React.useState<GameRace[]>([]);
  const [gamesMap, setGamesMap] = React.useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();
  const { t, currentLocale } = useTranslation();
  const router = useRouter();

  React.useEffect(() => {
    document.title = t('admin.races.page.documentTitle');
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
        const [racesList, allGames] = await Promise.all([
          getGameRaceList(undefined, token),
          getGameList()
        ]);
        
        const fetchedGamesMap = new Map<string, string>();
        allGames.forEach(game => fetchedGamesMap.set(game.id, game.name));

        setGamesMap(fetchedGamesMap);
        setGameRaces(racesList);

      } catch (error: any) {
        console.error('Failed to fetch game races or games:', error);
        toast({ title: t("general.error"), description: t("admin.races.page.toastErrorLoading", {details: error.message || 'Unknown error'}), variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [toast, t, router]);

  const handleDelete = async (raceId: string, raceName: string) => {
    const token = getAuthTokenFromLocalStorage();
    if (!token) {
      toast({ title: t("general.error"), description: t("general.authenticationFailed"), variant: "destructive" });
      router.push('/auth/login');
      return;
    }
    const result = await deleteGameRaceAction(raceId, token);
    if (result.success) {
      toast({
        title: t('admin.races.page.toastDeleteSuccessTitle'),
        description: t('admin.races.page.toastDeleteSuccess', { name: raceName }),
      });
      setGameRaces(prev => prev.filter(gr => gr.id !== raceId));
    } else {
      const errorDescription = result.messageKey
        ? t(result.messageKey, { details: result.rawMessage || '' })
        : result.rawMessage || t('general.unexpectedError');
      toast({
        title: t('general.error'),
        description: t('admin.races.page.toastDeleteError', { name: raceName, details: errorDescription }),
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
        <h1 className="text-3xl font-bold text-primary">{t('admin.races.page.title')}</h1>
        <Button asChild>
          <Link href="/admin/races/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('admin.races.page.createButton')}
          </Link>
        </Button>
      </div>

      {gameRaces.length === 0 ? (
        <Card className="py-12 text-center">
          <CardHeader>
            <Palette className="mx-auto h-12 w-12 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-lg text-muted-foreground">{t('admin.races.page.noRaces')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('admin.races.table.name')}</TableHead>
                <TableHead>{t('admin.races.table.game')}</TableHead>
                <TableHead>{t('admin.races.table.description')}</TableHead>
                <TableHead className="text-right">{t('general.actions')}</TableHead>
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
                          <AlertDialogTitle>{t('admin.races.page.deleteConfirmTitle')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('admin.races.page.deleteConfirmDescription', {name: gr.name})}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('general.cancel')}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(gr.id, gr.name)} className="bg-destructive hover:bg-destructive/90">
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
