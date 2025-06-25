'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { GameRace } from '@/services/race';
import { createGameRace, updateGameRace, getAuthTokenFromLocalStorage } from '@/services/race';
import { getGameList, type Game } from '@/services/game';
import { Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

const createGameRaceFormSchema = (t: (key: string, params?: Record<string, string | number>) => string) => z.object({
  name: z
    .string()
    .min(2, { message: t('general.minChars', { count: 2 }) })
    .max(100, { message: t('general.maxChars', { count: 100 }) }),
  description: z
    .string()
    .max(1000, { message: t('general.maxChars', { count: 1000 }) })
    .optional(),
  game_id: z.string().min(1, { message: t('admin.races.form.gameRequired')}),
});

type GameRaceFormValues = z.infer<ReturnType<typeof createGameRaceFormSchema>>;

interface GameRaceFormProps {
  gameRace?: GameRace | null;
  isEditMode: boolean;
}

export function GameRaceForm({ gameRace, isEditMode }: GameRaceFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [games, setGames] = React.useState<Game[]>([]);
  const [isLoadingGames, setIsLoadingGames] = React.useState(true);

  const gameRaceFormSchema = React.useMemo(() => createGameRaceFormSchema(t), [t]);

  const form = useForm<GameRaceFormValues>({
    resolver: zodResolver(gameRaceFormSchema),
    defaultValues: {
      name: gameRace?.name || '',
      description: gameRace?.description || '',
      game_id: gameRace?.game_id || '',
    },
    mode: 'onChange',
  });

  React.useEffect(() => {
    async function fetchGames() {
      setIsLoadingGames(true);
      try {
        const gameList = await getGameList();
        setGames(gameList);
      } catch (error: any) {
        console.error("Failed to fetch games for dropdown:", error);
        toast({
          title: t('general.error'),
          description: t('admin.races.form.toastErrorLoadingGames', { details: error.message || t('general.unexpectedError', {details: ''}) }),
          variant: 'destructive',
        });
      } finally {
        setIsLoadingGames(false);
      }
    }
    fetchGames();
  }, [toast, t]);

  async function onSubmit(data: GameRaceFormValues) {
    setIsSubmitting(true);
    const token = getAuthTokenFromLocalStorage();
    if (!token) {
      toast({
        title: t('general.error'),
        description: t('general.authenticationFailed'),
        variant: 'destructive',
      });
      setIsSubmitting(false);
      router.push('/auth/login');
      return;
    }

    try {
      let result;
      const payload = {
        ...data,
        description: data.description || undefined,
      };

      if (isEditMode && gameRace) {
        result = await updateGameRace(gameRace.id, payload, token);
        if (result.success && result.gameRace) {
          toast({
            title: t('admin.races.form.toastUpdateSuccessTitle'),
            description: t(result.messageKey || 'admin.races.form.toastUpdateSuccess', { name: result.gameRace.name }),
          });
          router.push('/admin/races');
          router.refresh();
        } else {
          const errorDescription = result.messageKey
            ? t(result.messageKey, { details: result.rawMessage || '' })
            : result.rawMessage || t('general.unexpectedError');
          toast({
            title: t('general.error'),
            description: t('admin.races.form.toastUpdateError', { details: errorDescription }),
            variant: 'destructive',
          });
        }
      } else {
        result = await createGameRace(payload, token);
        if (result.success && result.gameRace) {
          toast({
            title: t('admin.races.form.toastCreateSuccessTitle'),
            description: t(result.messageKey || 'admin.races.form.toastCreateSuccess', { name: result.gameRace.name }),
          });
          router.push('/admin/races');
          router.refresh();
        } else {
          const errorDescription = result.messageKey
            ? t(result.messageKey, { details: result.rawMessage || '' })
            : result.rawMessage || t('general.unexpectedError');
          toast({
            title: t('general.error'),
            description: t('admin.races.form.toastCreateError', { details: errorDescription }),
            variant: 'destructive',
          });
        }
      }
    } catch (error: any) {
      console.error('Failed to save game race:', error);
      const errorDescription = t('general.unexpectedError', { details: error.message || 'Unknown error' });
      toast({
        title: t('general.error'),
        description: t('admin.races.form.toastGenericError', { action: isEditMode ? t('general.edit') : t('general.create'), details: errorDescription }),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditMode ? t('admin.races.form.titleEdit') : t('admin.races.form.titleCreate')}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="game_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('admin.races.form.gameLabel')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingGames}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingGames ? t('loading') : t('admin.races.form.gamePlaceholder')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingGames && <SelectItem value="loading" disabled>{t('loading')}</SelectItem>}
                      {!isLoadingGames && games.map((game) => (
                        <SelectItem key={game.id} value={game.id}>
                          {game.name} (v{game.version})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>{t('admin.races.form.gameDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('admin.races.form.nameLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('admin.races.form.namePlaceholder')} {...field} />
                  </FormControl>
                  <FormDescription>{t('admin.races.form.nameDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('admin.races.form.descriptionLabel')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('admin.races.form.descriptionPlaceholder')}
                      className="min-h-[100px] resize-y"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormDescription>{t('admin.races.form.descriptionDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end border-t pt-6">
            <Button type="submit" disabled={isSubmitting || isLoadingGames}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('general.savingButton')}
                </>
              ) : isEditMode ? (
                t('general.saveButton')
              ) : (
                t('general.createButton')
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
