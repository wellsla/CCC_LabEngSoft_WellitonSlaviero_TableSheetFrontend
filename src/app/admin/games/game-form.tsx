
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
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { Game } from '@/services/game';
import { createGame, updateGame, getAuthTokenFromLocalStorage } from '@/services/game'; // Import getAuthTokenFromLocalStorage
import { Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

const createGameFormSchema = (t: (key: string, params?: Record<string, string|number>) => string) => z.object({
  name: z
    .string()
    .min(2, {
      message: t('general.minChars', {count: 2}),
    })
    .max(100, { message: t('general.maxChars', {count: 100}) }),
  description: z
    .string()
    .min(10, {
      message: t('general.minChars', {count: 10}),
    })
    .max(1000, { message: t('general.maxChars', {count: 1000}) }),
  version: z
    .string()
    .min(1, {
      message: t('general.requiredField'),
    })
    .max(50, { message: t('general.maxChars', {count: 50}) }),
  cover_image_url: z 
    .string()
    .url({
      message: t('general.validUrl'),
    })
    .optional()
    .or(z.literal('')), 
  is_active: z.boolean().default(true),
});

type GameFormValues = z.infer<ReturnType<typeof createGameFormSchema>>;

interface GameFormProps {
  game?: Game | null;
  isEditMode: boolean;
}

export function GameForm({ game, isEditMode }: GameFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { t } = useTranslation();

  const gameFormSchema = React.useMemo(() => createGameFormSchema(t), [t]);

  const form = useForm<GameFormValues>({
    resolver: zodResolver(gameFormSchema),
    defaultValues: {
      name: game?.name || '',
      description: game?.description || '',
      version: game?.version || '',
      cover_image_url: game?.cover_image_url || '',
      is_active: game?.is_active !== undefined ? game.is_active : true,
    },
    mode: 'onChange',
  });

  async function onSubmit(data: GameFormValues) {
    setIsSubmitting(true);
    const token = getAuthTokenFromLocalStorage(); // Get token client-side
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
        cover_image_url: data.cover_image_url || undefined, 
      };

      if (isEditMode && game) {
        result = await updateGame(game.id, payload, token); // Pass token
        if (result.success && result.game) {
          toast({
            title: t('gameForm.toastUpdateSuccessTitle'),
            description: t(result.messageKey || 'gameForm.toastUpdateSuccessDescription', { name: result.game.name }),
          });
          router.push('/admin/games');
          router.refresh();
        } else {
          const errorDescription = result.messageKey
            ? t(result.messageKey, { details: result.rawMessage || '' })
            : result.rawMessage || t('general.unexpectedError');
          toast({
            title: t('gameForm.toastErrorTitle'),
            description: t('gameForm.toastErrorDescription', {action: t('general.edit'), details: errorDescription}),
            variant: 'destructive',
          });
        }
      } else {
        result = await createGame(payload, token); // Pass token
        if (result.success && result.game) {
          toast({
            title: t('gameForm.toastCreateSuccessTitle'),
            description: t(result.messageKey || 'gameForm.toastCreateSuccessDescription', { name: result.game.name }),
          });
          router.push('/admin/games');
          router.refresh();
        } else {
          const errorDescription = result.messageKey
            ? t(result.messageKey, { details: result.rawMessage || '' })
            : result.rawMessage || t('general.unexpectedError');
          toast({
            title: t('gameForm.toastErrorTitle'),
            description: t('gameForm.toastErrorDescription', {action: t('general.create'), details: errorDescription}),
            variant: 'destructive',
          });
        }
      }
    } catch (error: any) {
      console.error('Failed to save game:', error);
      const errorDescription = t('general.unexpectedError', { details: error.message || 'Unknown error' });
      toast({
        title: t('gameForm.toastErrorTitle'),
        description: t('gameForm.toastErrorDescription', {action: isEditMode ? t('general.edit') : t('general.create'), details: errorDescription}),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditMode ? t('gameForm.titleEdit') : t('gameForm.titleCreate')}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('gameForm.nameLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('gameForm.namePlaceholder')} {...field} />
                  </FormControl>
                  <FormDescription>
                    {t('gameForm.nameDescription')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('gameForm.descriptionLabel')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('gameForm.descriptionPlaceholder')}
                      className="min-h-[150px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t('gameForm.descriptionDescription')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="version"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('gameForm.versionLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('gameForm.versionPlaceholder')} {...field} />
                  </FormControl>
                  <FormDescription>
                    {t('gameForm.versionDescription')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cover_image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('gameForm.coverImageUrlLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder={t('gameForm.coverImageUrlPlaceholder')}
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormDescription>
                    {t('gameForm.coverImageUrlDescription')}
                  </FormDescription>
                   <FormDescription>{t('gameForm.fileUploadHint')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>{t('gameForm.isActiveLabel')}</FormLabel>
                    <FormDescription>
                      {t('gameForm.isActiveDescription')}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-label={t('gameForm.isActiveLabel')}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end border-t pt-6">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('gameForm.savingButton')}
                </>
              ) : isEditMode ? (
                t('gameForm.saveButton')
              ) : (
                t('gameForm.createButton')
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
