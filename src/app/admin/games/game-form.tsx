
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
} from '@/components/ui/card';
import { useToast } from '@/hooks/useToast';
import type { Game } from '@/services/game';
import { createGame, updateGame, uploadCoverImage } from '@/services/game';
import { Loader2, ImageIcon, X } from 'lucide-react';
import { getAuthToken } from '@/lib/tokenManager';
import { deleteFileByUrlAction } from '@/lib/actions';

const gameFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Deve ter no mínimo 2 caracteres.' })
    .max(100, { message: 'Deve ter no máximo 100 caracteres.' }),
  description: z
    .string()
    .min(10, { message: 'Deve ter no mínimo 10 caracteres.' })
    .max(1000, { message: 'Deve ter no máximo 1000 caracteres.' }),
  version: z
    .string()
    .min(1, { message: 'Este campo é obrigatório.' })
    .max(50, { message: 'Deve ter no máximo 50 caracteres.' }),
  cover_image_url: z.string().optional().or(z.literal('')),
  is_active: z.boolean().default(true),
});

type GameFormValues = z.infer<typeof gameFormSchema>;

interface GameFormProps {
  game?: Game | null;
  isEditMode: boolean;
}

export function GameForm({ game, isEditMode }: GameFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [imagePreview, setImagePreview] = React.useState<string | null>(
    game?.cover_image_url || null
  );
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [oldImageUrl] = React.useState(game?.cover_image_url || null);

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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Tipo de arquivo inválido',
          description: 'Por favor, selecione um arquivo de imagem.',
          variant: 'destructive',
        });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setImagePreview(dataUrl);
        form.setValue('cover_image_url', dataUrl, {
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
    form.setValue('cover_image_url', '', { shouldDirty: true });
  };

  async function onSubmit(data: GameFormValues) {
    setIsSubmitting(true);
    try {
      if (isEditMode && game) {
        let imageUrl = game.cover_image_url;
        if (imageFile) {
          const uploadResult = await uploadCoverImage(imageFile, game.id);
          if (uploadResult.success && uploadResult.url) {
            imageUrl = uploadResult.url;
          } else {
            toast({
              title: 'Erro no Upload',
              description:
                uploadResult.rawMessage || 'Falha ao enviar a imagem.',
              variant: 'destructive',
            });
            setIsSubmitting(false);
            return;
          }
        } else if (!data.cover_image_url) {
          imageUrl = '';
        }

        const result = await updateGame(game.id, {
          ...data,
          cover_image_url: imageUrl,
        });
        if (result.success) {
          toast({ title: 'Jogo Atualizado', description: result.rawMessage });
          if (!data.cover_image_url && oldImageUrl) {
            const token = getAuthToken();
            await deleteFileByUrlAction(oldImageUrl, token);
          }
          router.push('/admin/games');
          router.refresh();
        } else {
          toast({
            title: 'Erro na Atualização',
            description: result.rawMessage,
            variant: 'destructive',
          });
        }
      } else {
        // Create mode
        const result = await createGame({
          ...data,
          cover_image_url: undefined,
        });
        if (result.success && result.game) {
          toast({ title: 'Jogo Criado', description: result.rawMessage });

          if (imageFile) {
            const uploadResult = await uploadCoverImage(
              imageFile,
              result.game.id
            );
            if (!uploadResult.success) {
              toast({
                title: 'Aviso',
                description: `O jogo foi criado, mas a imagem não pôde ser enviada: ${uploadResult.rawMessage}. Você pode editá-lo para tentar novamente.`,
                variant: 'destructive',
              });
            }
          }
          router.push('/admin/games');
          router.refresh();
        } else {
          toast({
            title: 'Erro na Criação',
            description: result.rawMessage,
            variant: 'destructive',
          });
        }
      }
    } catch (error: any) {
      toast({
        title: 'Erro Inesperado',
        description: error.message || 'Ocorreu um erro.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditMode ? 'Editar Jogo' : 'Criar Novo Jogo'}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="flex flex-col-reverse gap-8 md:flex-row">
              <div className="flex-grow space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Jogo</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Dungeons & Dragons"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        O nome oficial do sistema de RPG.
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
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva o jogo, seu cenário e estilo."
                          className="min-h-[150px] resize-y"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Um resumo que ajude os jogadores a entenderem o jogo.
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
                      <FormLabel>Versão / Edição</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 5ª Edição" {...field} />
                      </FormControl>
                      <FormDescription>
                        A versão específica do sistema (ex: "5e", "2ª Edição").
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="w-full flex-shrink-0 space-y-2 md:w-64">
                <FormLabel>Imagem de Capa (Opcional)</FormLabel>
                <div className="relative flex aspect-video w-full items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/30">
                  {imagePreview ? (
                    <>
                      <Image
                        src={imagePreview}
                        alt="Prévia da capa"
                        layout="fill"
                        className="object-contain rounded-md p-1"
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
                      <ImageIcon className="mx-auto h-12 w-12" />
                      <p className="mt-2 text-xs">Sem imagem</p>
                    </div>
                  )}
                  <Input
                    id="cover-image-upload"
                    type="file"
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleFileChange}
                  />
                </div>
                <FormDescription>
                  Clique na área para enviar uma imagem.
                </FormDescription>
              </div>
            </div>

            <FormField
              control={form.control}
              name="cover_image_url"
              render={({ field }) => (
                <FormItem className="hidden">
                  <FormControl>
                    <Input {...field} />
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
                    <FormLabel>Jogo Ativo</FormLabel>
                    <FormDescription>
                      Jogos ativos são visíveis para todos os visitantes.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-label="Jogo Ativo"
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
                  Salvando...
                </>
              ) : isEditMode ? (
                'Salvar Alterações'
              ) : (
                'Criar Jogo'
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
