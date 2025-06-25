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
  CardDescription,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { Character } from '@/services/character';
import { createCharacter, updateCharacter } from '@/services/character';
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from '@/hooks/useTranslation';
import { getUserProfile, getAuthTokenFromLocalStorage } from '@/services/userProfile';

const createCharacterFormSchema = (t: (key: string, params?: Record<string, string|number>) => string) => z.object({
  name: z
    .string()
    .min(2, { message: t('general.minChars', {count: 2}) })
    .max(50, { message: t('general.maxChars', {count: 50}) }),
  description: z
    .string()
    .max(1000, { message: t('general.maxChars', {count: 1000}) })
    .optional(),
  portrait_url: z
    .string()
    .url({ message: t('general.validUrl') })
    .optional()
    .or(z.literal('')),
  gameId: z.string().optional(),
  backgroundId: z.string().optional(),
  level: z.coerce.number().int().min(1, {message: t('general.minNumber', {count:1})}).max(100, {message: t('general.maxNumber', {count:100})}).optional(),
  experience_points: z.coerce.number().int().min(0, {message: t('general.minNumber', {count:0})}).optional(),
  raceId: z.string().optional(), 
  classId: z.string().optional(), 
  alignmentId: z.string().optional(),
  strength: z.coerce.number().int().min(1).max(30).optional(),
  dexterity: z.coerce.number().int().min(1).max(30).optional(),
  constitution: z.coerce.number().int().min(1).max(30).optional(),
  intelligence: z.coerce.number().int().min(1).max(30).optional(),
  wisdom: z.coerce.number().int().min(1).max(30).optional(),
  charisma: z.coerce.number().int().min(1).max(30).optional(),
  current_hit_points: z.coerce.number().int().optional(),
  max_hit_points: z.coerce.number().int().min(0).optional(), 
  armor_class: z.coerce.number().int().optional(),
  initiative: z.coerce.number().int().optional(),
  speed: z.coerce.number().int().optional(),
  notes: z
    .string()
    .max(2000, { message: t('general.maxChars', {count: 2000}) })
    .optional(),
  is_npc: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

type CharacterFormValues = z.infer<ReturnType<typeof createCharacterFormSchema>>;

interface CharacterFormProps {
  character?: Character | null;
  isEditMode: boolean;
}

export function CharacterForm({ character, isEditMode }: CharacterFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { t } = useTranslation();

  const characterFormSchema = React.useMemo(() => createCharacterFormSchema(t), [t]);

  const defaultValues: Partial<CharacterFormValues> = {
    name: character?.name || '',
    description: character?.description || '',
    portrait_url: character?.portrait_url || '',
    gameId: character?.game_id || '', 
    backgroundId: character?.background_id || '',
    level: character?.level || 1,
    experience_points: character?.experience_points || 0,
    raceId: character?.race_id || '',
    classId: character?.class_id || '',
    alignmentId: character?.alignment_id || '',
    strength: character?.strength || 10,
    dexterity: character?.dexterity || 10,
    constitution: character?.constitution || 10,
    intelligence: character?.intelligence || 10,
    wisdom: character?.wisdom || 10,
    charisma: character?.charisma || 10,
    current_hit_points: character?.current_hit_points ?? character?.max_hit_points ?? 10,
    max_hit_points: character?.max_hit_points || 10,
    armor_class: character?.armor_class || 10,
    initiative: character?.initiative || 0,
    speed: character?.speed || 30,
    notes: character?.notes || '',
    is_npc: character?.is_npc || false,
    is_active: character?.is_active !== undefined ? character.is_active : true,
  };

  const form = useForm<CharacterFormValues>({
    resolver: zodResolver(characterFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  async function onSubmit(data: CharacterFormValues) {
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
      const payload: Partial<Character> = {
        name: data.name,
        description: data.description || undefined,
        portrait_url: data.portrait_url || undefined,
        game_id: data.gameId || undefined, 
        background_id: data.backgroundId || undefined,
        level: data.level,
        experience_points: data.experience_points,
        race_id: data.raceId || undefined,
        class_id: data.classId || undefined,
        alignment_id: data.alignmentId || undefined,
        strength: data.strength,
        dexterity: data.dexterity,
        constitution: data.constitution,
        intelligence: data.intelligence,
        wisdom: data.wisdom,
        charisma: data.charisma,
        current_hit_points: data.current_hit_points,
        max_hit_points: data.max_hit_points,
        armor_class: data.armor_class,
        initiative: data.initiative,
        speed: data.speed,
        notes: data.notes || undefined,
        is_npc: data.is_npc,
        is_active: data.is_active,
      };
      
      let result;

      if (isEditMode && character) {
        result = await updateCharacter(character.id, payload, token);
        if (result.success && result.character) {
          toast({
            title: t('characterForm.toastUpdateSuccessTitle'),
            description: t(result.messageKey || 'characterForm.toastUpdateSuccessDescription', {name: result.character.name}),
          });
          router.push(`/characters/${result.character.id}`);
          router.refresh();
        } else {
          const errorDescription = result.messageKey
            ? t(result.messageKey, { details: result.rawMessage || '' })
            : result.rawMessage || t('general.unexpectedError');
          toast({
            title: t('characterForm.toastUpdateFailTitle'),
            description: errorDescription,
            variant: 'destructive',
          });
        }
      } else {
        const user = getUserProfile();
        if (!user) {
          toast({
            title: t('general.error'),
            description: t('general.authenticationFailed'),
            variant: 'destructive',
          });
          setIsSubmitting(false);
          router.push('/auth/login');
          return;
        }

        const createPayload = { ...payload, user_id: user.id } as Omit<Character, 'id' | 'created_at' | 'updated_at'>;
        
        result = await createCharacter(createPayload, token);
        if (result.success && result.character) {
          toast({
            title: t('characterForm.toastCreateSuccessTitle'),
            description: t(result.messageKey || 'characterForm.toastCreateSuccessDescription', {name: result.character.name}),
          });
          router.push('/characters');
          router.refresh();
        } else {
            const errorDescription = result.messageKey
            ? t(result.messageKey, { details: result.rawMessage || '' })
            : result.rawMessage || t('general.unexpectedError');
          toast({
            title: t('characterForm.toastErrorTitle'),
            description: t('characterForm.toastCreateFailDescription', {details: errorDescription}),
            variant: 'destructive',
          });
        }
      }
    } catch (error: any) {
      console.error('Failed to save character:', error);
      const errorDescription = t('general.unexpectedError', { details: error.message || 'Unknown error' });
      toast({
        title: t('characterForm.toastErrorTitle'),
        description: t('characterForm.toastErrorDescription', { action: isEditMode ? t('general.edit') : t('general.create'), details: errorDescription }),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditMode ? t('characterForm.titleEdit', {name: character?.name || ''}) : t('characterForm.titleCreate')}
        </CardTitle>
        <CardDescription>
          {t('characterForm.description')}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-8">
            <section>
              <h3 className="mb-4 text-lg font-medium text-primary">
                {t('characterForm.basicInfoSectionTitle')}
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('characterForm.nameLabel')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('characterForm.namePlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gameId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('characterForm.gameIdLabel')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('characterForm.gameIdPlaceholder')} {...field} value={field.value ?? ''}/>
                      </FormControl>
                      <FormDescription>
                        {t('characterForm.gameIdDescription')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="mt-6">
                    <FormLabel>{t('characterForm.descriptionLabel')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('characterForm.descriptionPlaceholder')}
                        className="min-h-[100px] resize-y"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="portrait_url"
                render={({ field }) => (
                  <FormItem className="mt-6">
                    <FormLabel>{t('characterForm.portraitUrlLabel')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('characterForm.portraitUrlPlaceholder')}
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormDescription>
                      {t('characterForm.portraitUrlDescription')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            <Separator />

            <section>
              <h3 className="mb-4 text-lg font-medium text-primary">
                {t('characterForm.coreAttributesSectionTitle')}
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('characterForm.levelLabel')}</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="experience_points"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('characterForm.xpLabel')}</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="raceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('characterForm.raceIdLabel')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('characterForm.raceIdPlaceholder')} {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormDescription>{t('characterForm.selectListHint')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="classId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('characterForm.classIdLabel')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('characterForm.classIdPlaceholder')} {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormDescription>{t('characterForm.selectListHint')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="backgroundId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('characterForm.backgroundIdLabel')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('characterForm.backgroundIdPlaceholder')} {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="alignmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('characterForm.alignmentIdLabel')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('characterForm.alignmentIdPlaceholder')} {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>
            
            <Separator />

            <section>
                <h3 className="mb-4 text-lg font-medium text-primary">{t('characterForm.abilityScoresSectionTitle')}</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-3 lg:grid-cols-6">
                    {(['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const).map((stat) => (
                        <FormField
                            key={stat}
                            control={form.control}
                            name={stat}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="capitalize">{t(`characterForm.${stat}`)}</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="10" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    ))}
                </div>
            </section>

            <Separator />

            <section>
                <h3 className="mb-4 text-lg font-medium text-primary">{t('characterForm.combatStatsSectionTitle')}</h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <FormField
                        control={form.control}
                        name="current_hit_points"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('characterForm.currentHpLabel')}</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="10" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="max_hit_points"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('characterForm.maxHpLabel')}</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="10" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="armor_class"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('characterForm.acLabel')}</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="10" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="initiative"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('characterForm.initiativeLabel')}</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="0" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="speed"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('characterForm.speedLabel')}</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="30" {...field} />
                                </FormControl>
                                <FormDescription>{t('characterForm.speedDescription')}</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </section>

            <Separator />
            
            <section>
                <h3 className="mb-4 text-lg font-medium text-primary">{t('characterForm.notesStatusSectionTitle')}</h3>
                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t('characterForm.notesLabel')}</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder={t('characterForm.notesPlaceholder')}
                            className="min-h-[150px] resize-y"
                            {...field}
                            value={field.value ?? ''}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="is_npc"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                    <FormLabel>{t('characterForm.isNpcLabel')}</FormLabel>
                                    <FormDescription>
                                    {t('characterForm.isNpcDescription')}
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    aria-label={t('characterForm.isNpcLabel')}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="is_active"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                    <FormLabel>{t('characterForm.isActiveLabel')}</FormLabel>
                                    <FormDescription>
                                    {t('characterForm.isActiveDescription')}
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    aria-label={t('characterForm.isActiveLabel')}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
            </section>

          </CardContent>
          <CardFooter className="flex justify-end border-t pt-6">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('characterForm.savingButton')}
                </>
              ) : isEditMode ? (
                t('characterForm.saveButton')
              ) : (
                t('characterForm.createButton')
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
