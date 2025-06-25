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
import type { GameBook } from '@/services/book';
import { createBook, updateBook, getAuthTokenFromLocalStorage } from '@/services/book';
import { getGameList, type Game } from '@/services/game';
import { Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

const createGameBookFormSchema = (t: (key: string, params?: Record<string, string | number>) => string) => z.object({
  name: z
    .string()
    .min(2, { message: t('general.minChars', { count: 2 }) })
    .max(100, { message: t('general.maxChars', { count: 100 }) }),
  description: z
    .string()
    .max(1000, { message: t('general.maxChars', { count: 1000 }) })
    .optional(),
  game_id: z.string().min(1, { message: t('admin.books.form.gameRequired')}),
  cover_image_url: z.string().url({ message: t('general.validUrl') }).optional().or(z.literal('')),
  document_url: z.string().url({ message: t('general.validUrl') }).min(1, { message: t('general.requiredField') }),
});

type GameBookFormValues = z.infer<ReturnType<typeof createGameBookFormSchema>>;

interface GameBookFormProps {
  gameBook?: GameBook | null;
  isEditMode: boolean;
}

export function GameBookForm({ gameBook, isEditMode }: GameBookFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [games, setGames] = React.useState<Game[]>([]);
  const [isLoadingGames, setIsLoadingGames] = React.useState(true);

  const gameBookFormSchema = React.useMemo(() => createGameBookFormSchema(t), [t]);

  const form = useForm<GameBookFormValues>({
    resolver: zodResolver(gameBookFormSchema),
    defaultValues: {
      name: gameBook?.name || '',
      description: gameBook?.description || '',
      game_id: gameBook?.game_id || '',
      cover_image_url: gameBook?.cover_image_url || '',
      document_url: gameBook?.document_url || '',
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
          description: t('admin.books.form.toastErrorLoadingGames', { details: error.message || t('general.unexpectedError', {details: ''}) }),
          variant: 'destructive',
        });
      } finally {
        setIsLoadingGames(false);
      }
    }
    fetchGames();
  }, [toast, t]);

  async function onSubmit(data: GameBookFormValues) {
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
        cover_image_url: data.cover_image_url || undefined,
      };

      if (isEditMode && gameBook) {
        result = await updateBook(gameBook.id, payload, token);
        if (result.success && result.gameBook) {
          toast({
            title: t('admin.books.form.toastUpdateSuccessTitle'),
            description: t(result.messageKey || 'admin.books.form.toastUpdateSuccess', { name: result.gameBook.name }),
          });
          router.push('/admin/books');
          router.refresh();
        } else {
          const errorDescription = result.messageKey
            ? t(result.messageKey, { details: result.rawMessage || '' })
            : result.rawMessage || t('general.unexpectedError');
          toast({
            title: t('general.error'),
            description: t('admin.books.form.toastUpdateError', { details: errorDescription }),
            variant: 'destructive',
          });
        }
      } else {
        result = await createBook(payload, token);
        if (result.success && result.gameBook) {
          toast({
            title: t('admin.books.form.toastCreateSuccessTitle'),
            description: t(result.messageKey || 'admin.books.form.toastCreateSuccess', { name: result.gameBook.name }),
          });
          router.push('/admin/books');
          router.refresh();
        } else {
          const errorDescription = result.messageKey
            ? t(result.messageKey, { details: result.rawMessage || '' })
            : result.rawMessage || t('general.unexpectedError');
          toast({
            title: t('general.error'),
            description: t('admin.books.form.toastCreateError', { details: errorDescription }),
            variant: 'destructive',
          });
        }
      }
    } catch (error: any) {
      console.error('Failed to save game book:', error);
      const errorDescription = t('general.unexpectedError', { details: error.message || 'Unknown error' });
      toast({
        title: t('general.error'),
        description: t('admin.books.form.toastGenericError', { action: isEditMode ? t('general.edit') : t('general.create'), details: errorDescription }),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditMode ? t('admin.books.form.titleEdit') : t('admin.books.form.titleCreate')}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="game_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('admin.books.form.gameLabel')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingGames}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingGames ? t('loading') : t('admin.books.form.gamePlaceholder')} />
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
                  <FormDescription>{t('admin.books.form.gameDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('admin.books.form.nameLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('admin.books.form.namePlaceholder')} {...field} />
                  </FormControl>
                  <FormDescription>{t('admin.books.form.nameDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('admin.books.form.descriptionLabel')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('admin.books.form.descriptionPlaceholder')}
                      className="min-h-[100px] resize-y"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormDescription>{t('admin.books.form.descriptionDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="document_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('admin.books.form.documentUrlLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('admin.books.form.documentUrlPlaceholder')} {...field} />
                  </FormControl>
                  <FormDescription>{t('admin.books.form.documentUrlDescription')}</FormDescription>
                   <FormDescription>{t('gameForm.fileUploadHint')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cover_image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('admin.books.form.coverImageUrlLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder={t('admin.books.form.coverImageUrlPlaceholder')}
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormDescription>{t('admin.books.form.coverImageUrlDescription')}</FormDescription>
                   <FormDescription>{t('gameForm.fileUploadHint')}</FormDescription>
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
