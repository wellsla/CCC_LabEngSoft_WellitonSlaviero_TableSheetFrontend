'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/useToast';
import type { Character } from '@/services/character';
import {
  createCharacter,
  updateCharacter,
  uploadPortrait,
} from '@/services/character';
import { getGameRaceList, type GameRace } from '@/services/race';
import { getGameClassList, type GameClass } from '@/services/class';
import { Loader2, Image as ImageIcon, X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { getAuthToken } from '@/lib/tokenManager';
import { deleteFileByUrlAction } from '@/lib/actions';

const characterFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Mínimo de 2 caracteres.' })
    .max(50, { message: 'Máximo de 50 caracteres.' }),
  race_id: z.string().min(1, { message: 'Por favor, selecione uma raça.' }),
  class_id: z.string().min(1, { message: 'Por favor, selecione uma classe.' }),
  level: z.coerce
    .number()
    .int()
    .min(1, { message: 'Nível mínimo é 1.' })
    .max(100, { message: 'Nível máximo é 100.' }),
  strength: z.coerce.number().int().min(1).max(30),
  dexterity: z.coerce.number().int().min(1).max(30),
  constitution: z.coerce.number().int().min(1).max(30),
  intelligence: z.coerce.number().int().min(1).max(30),
  wisdom: z.coerce.number().int().min(1).max(30),
  charisma: z.coerce.number().int().min(1).max(30),
  current_hit_points: z.coerce.number().int(),
  max_hit_points: z.coerce
    .number()
    .int()
    .min(1, { message: 'PVs máximos devem ser pelo menos 1.' }),
  armor_class: z.coerce.number().int(),
  initiative: z.coerce.number().int(),
  speed: z.coerce.number().int(),
  description: z
    .string()
    .max(1000, { message: 'Máximo de 1000 caracteres.' })
    .optional(),
  notes: z
    .string()
    .max(2000, { message: 'Máximo de 2000 caracteres.' })
    .optional(),
  is_active: z.boolean().default(true),
  portrait_url: z.string().optional(),
});

type CharacterFormValues = z.infer<typeof characterFormSchema>;

interface CharacterFormProps {
  character?: Character | null;
  isEditMode: boolean;
  gameId?: string;
}

export function CharacterForm({
                                character,
                                isEditMode,
                                gameId: gameIdProp,
                              }: CharacterFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [races, setRaces] = React.useState<GameRace[]>([]);
  const [classes, setClasses] = React.useState<GameClass[]>([]);
  const [isLoadingDropdowns, setIsLoadingDropdowns] = React.useState(true);

  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [oldPortraitUrl] = React.useState(character?.portrait_url || null);

  const gameId = isEditMode ? character?.game_id : gameIdProp;

  const form = useForm<CharacterFormValues>({
    resolver: zodResolver(characterFormSchema),
    defaultValues: {
      name: '',
      race_id: '',
      class_id: '',
      level: 1,
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
      current_hit_points: 10,
      max_hit_points: 10,
      armor_class: 10,
      initiative: 0,
      speed: 30,
      description: '',
      notes: '',
      is_active: true,
      portrait_url: '',
    },
    mode: 'onChange',
  });
  const { reset } = form;

  React.useEffect(() => {
    if (!gameId) {
      setIsLoadingDropdowns(false);
      return;
    }

    async function fetchDropdownData() {
      setIsLoadingDropdowns(true);
      try {
        const [raceList, classList] = await Promise.all([
          getGameRaceList(gameId),
          getGameClassList(gameId),
        ]);
        setRaces(raceList);
        setClasses(classList);
      } catch (err: any) {
        toast({
          title: 'Erro',
          description: `Falha ao carregar raças e classes: ${err.message}`,
          variant: 'destructive',
        });
        console.error(err);
      } finally {
        setIsLoadingDropdowns(false);
      }
    }

    fetchDropdownData();
  }, [gameId, toast]);

  React.useEffect(() => {
    if (isEditMode && character && races.length > 0 && classes.length > 0) {
      reset({
        name: character.name || '',
        race_id: String(character.race_id || ''),
        class_id: String(character.class_id || ''),
        level: character.level || 1,
        strength: character.strength || 10,
        dexterity: character.dexterity || 10,
        constitution: character.constitution || 10,
        intelligence: character.intelligence || 10,
        wisdom: character.wisdom || 10,
        charisma: character.charisma || 10,
        current_hit_points:
          character.current_hit_points ?? character.max_hit_points ?? 10,
        max_hit_points: character.max_hit_points || 10,
        armor_class: character.armor_class || 10,
        initiative: character.initiative || 0,
        speed: character.speed || 30,
        description: character.description || '',
        notes: character.notes || '',
        is_active:
          character.is_active !== undefined ? character.is_active : true,
        portrait_url: character.portrait_url || '',
      });
      if (character.portrait_url) {
        setImagePreview(character.portrait_url);
      }
    }
  }, [isEditMode, character, races, classes, reset]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setImagePreview(dataUrl);
        form.setValue('portrait_url', dataUrl, {
          shouldValidate: true,
          shouldDirty: true,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageFile(null);
    form.setValue('portrait_url', '', { shouldDirty: true });
  };

  async function onSubmit(data: CharacterFormValues) {
    setIsSubmitting(true);
    if (!gameId) {
      toast({
        title: 'Erro',
        description: 'ID do jogo não encontrado.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }

    try {
      if (isEditMode && character) {
        let imageUrl = character.portrait_url;
        if (imageFile) {
          const uploadResult = await uploadPortrait(imageFile, character.id);
          if (!uploadResult.success) {
            toast({
              title: 'Erro no Upload',
              description: `Falha ao enviar retrato: ${uploadResult.rawMessage}`,
              variant: 'destructive',
            });
            setIsSubmitting(false);
            return;
          }
          imageUrl = uploadResult.url;
        } else if (!data.portrait_url) {
          imageUrl = '';
        }

        const result = await updateCharacter(character.id, {
          ...data,
          portrait_url: imageUrl,
        });
        if (result.success && result.character) {
          toast({
            title: 'Personagem Atualizado',
            description: `As informações de "${result.character.name}" foram salvas.`,
          });
          if (!data.portrait_url && oldPortraitUrl) {
            const token = getAuthToken();
            await deleteFileByUrlAction(oldPortraitUrl, token);
          }
          router.push(`/characters/${result.character.id}`);
          router.refresh();
        } else {
          toast({
            title: 'Falha ao Atualizar',
            description:
              result.rawMessage || 'Não foi possível salvar as alterações.',
            variant: 'destructive',
          });
        }
      } else {
        // Create mode
        if (!user) {
          toast({
            title: 'Erro de Autenticação',
            description: 'Você precisa estar logado para criar um personagem.',
            variant: 'destructive',
          });
          setIsSubmitting(false);
          return;
        }

        const createPayload: Omit<
          Character,
          'id' | 'created_at' | 'updated_at' | 'game' | 'race' | 'class' | 'user'
        > = {
          ...data,
          game_id: gameId,
          user_id: user.id,
          portrait_url: undefined,
        };

        const result = await createCharacter(createPayload as Character);
        if (result.success && result.character) {
          toast({
            title: 'Personagem Criado',
            description: `"${result.character.name}" está pronto para a aventura!`,
          });

          if (imageFile) {
            const uploadResult = await uploadPortrait(
              imageFile,
              result.character.id
            );
            if (!uploadResult.success) {
              toast({
                title: 'Aviso',
                description: `O personagem foi criado, mas o retrato não pode ser enviado: ${uploadResult.rawMessage}`,
                variant: 'destructive',
              });
            }
          }

          router.push('/characters');
          router.refresh();
        } else {
          toast({
            title: 'Falha na Criação',
            description: `Não foi possível criar o personagem. ${
              result.rawMessage || ''
            }`,
            variant: 'destructive',
          });
        }
      }
    } catch (error: any) {
      toast({
        title: 'Erro Inesperado',
        description: `Ocorreu um erro: ${
          error.message || 'Tente novamente mais tarde.'
        }`,
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
          {isEditMode
            ? `Editando ${character?.name || ''}`
            : 'Criar Novo Personagem'}
        </CardTitle>
        <CardDescription>
          Preencha os detalhes da ficha do seu personagem abaixo.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-8">
            <section>
              <h3 className="mb-4 text-lg font-medium text-primary">
                Informações Básicas
              </h3>
              <div className="flex flex-col items-start gap-6 md:flex-row">
                <div className="w-full flex-grow space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Personagem</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Aric, o Bravo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {isLoadingDropdowns ? (
                      <>
                        <div className="space-y-2">
                          <Label>Raça</Label>
                          <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                          <Label>Classe</Label>
                          <Skeleton className="h-10 w-full" />
                        </div>
                      </>
                    ) : (
                      <>
                        <FormField
                          control={form.control}
                          name="race_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Raça</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value || ''}
                                key={`race-${races.length}`}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma raça" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {races.map((race) => (
                                    <SelectItem
                                      key={race.id}
                                      value={String(race.id)}
                                    >
                                      {race.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="class_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Classe</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value || ''}
                                key={`class-${classes.length}`}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma classe" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {classes.map((cls) => (
                                    <SelectItem
                                      key={cls.id}
                                      value={String(cls.id)}
                                    >
                                      {cls.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                  </div>
                </div>
                <div className="w-full flex-shrink-0 md:w-48">
                  <FormLabel>Retrato do Personagem</FormLabel>
                  <div className="relative mt-2 flex aspect-square w-full items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/30 md:w-48">
                    {imagePreview ? (
                      <>
                        <Image
                          src={imagePreview}
                          alt="Retrato"
                          layout="fill"
                          className="object-cover rounded-md"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 rounded-full bg-destructive/80 text-destructive-foreground opacity-80 hover:opacity-100"
                          onClick={handleRemoveImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <div className="p-4 text-center text-muted-foreground">
                        <ImageIcon className="mx-auto h-10 w-10" />
                        <p className="mt-2 text-xs">Sem imagem</p>
                      </div>
                    )}
                    <Input
                      id="portrait-upload"
                      type="file"
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="mb-4 text-lg font-medium text-primary">
                Atributos e Nível
              </h3>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nível</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="current_hit_points"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PVs Atuais</FormLabel>
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
                      <FormLabel>PVs Máximos</FormLabel>
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
                      <FormLabel>Classe de Armadura</FormLabel>
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
                      <FormLabel>Iniciativa</FormLabel>
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
                      <FormLabel>Velocidade</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="30" {...field} />
                      </FormControl>
                      <FormDescription>Em m.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="mb-4 text-lg font-medium text-primary">
                Habilidades
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-3 lg:grid-cols-6">
                {(
                  [
                    'strength',
                    'dexterity',
                    'constitution',
                    'intelligence',
                    'wisdom',
                    'charisma',
                  ] as const
                ).map((stat) => (
                  <FormField
                    key={stat}
                    control={form.control}
                    name={stat}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="capitalize">
                          {stat.charAt(0).toUpperCase() + stat.slice(1)}
                        </FormLabel>
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

            <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-4 text-lg font-medium text-primary">
                  Descrição e Personalidade
                </h3>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva a aparência, personalidade e história do seu personagem."
                          className="min-h-[150px] resize-y"
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div>
                <h3 className="mb-4 text-lg font-medium text-primary">
                  Notas Adicionais
                </h3>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Anote aqui equipamentos, magias, contatos, etc."
                          className="min-h-[150px] resize-y"
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            <Separator />

            <section>
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex max-w-sm flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Personagem Ativo</FormLabel>
                      <FormDescription>
                        Personagens inativos não aparecem nas listas.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        aria-label="Personagem Ativo"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </section>
          </CardContent>
          <CardFooter className="flex justify-end border-t pt-6">
            <Button type="submit" disabled={isSubmitting || isLoadingDropdowns}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : isEditMode ? (
                'Salvar Alterações'
              ) : (
                'Criar Personagem'
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
