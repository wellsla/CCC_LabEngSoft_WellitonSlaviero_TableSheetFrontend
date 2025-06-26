
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

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
import { useToast } from '@/hooks/useToast';
import type { GameBook } from '@/services/book';
import { createBook, updateBook, uploadDocument } from '@/services/book';
import { getGameList, type Game } from '@/services/game';
import { Loader2, ImageIcon, FileText, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { getAuthToken } from '@/lib/tokenManager';
import { deleteFileByUrlAction } from '@/lib/actions';

const gameBookFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Mínimo de 2 caracteres.' })
    .max(100, { message: 'Máximo de 100 caracteres.' }),
  description: z
    .string()
    .max(1000, { message: 'Máximo de 1000 caracteres.' })
    .optional(),
  game_id: z.string().min(1, { message: 'É obrigatório associar a um jogo.' }),
  cover_image_url: z
    .string()
    .url({ message: 'Por favor, insira uma URL válida.' })
    .optional()
    .or(z.literal('')),
  document_url: z.string().optional().or(z.literal('')),
});

type GameBookFormValues = z.infer<typeof gameBookFormSchema>;

interface GameBookFormProps {
  gameBook?: GameBook | null;
  isEditMode: boolean;
}

export function GameBookForm({ gameBook, isEditMode }: GameBookFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [games, setGames] = React.useState<Game[]>([]);
  const [isLoadingDropdowns, setIsLoadingDropdowns] = React.useState(true);

  const [documentName, setDocumentName] = React.useState<string | null>(null);
  const [documentFile, setDocumentFile] = React.useState<File | null>(null);
  const [isDocumentRemoved, setIsDocumentRemoved] = React.useState(false);
  const [oldDocumentUrl] = React.useState(gameBook?.document_url || null);

  const form = useForm<GameBookFormValues>({
    resolver: zodResolver(gameBookFormSchema),
    defaultValues: {
      name: '',
      description: '',
      game_id: '',
      cover_image_url: '',
      document_url: '',
    },
    mode: 'onChange',
  });
  const { reset, setValue } = form;

  React.useEffect(() => {
    async function fetchDropdownData() {
      setIsLoadingDropdowns(true);
      try {
        const gameList = await getGameList();
        setGames(gameList);
      } catch (error: any) {
        toast({
          title: 'Erro de Carregamento',
          description: `Não foi possível carregar os jogos: ${
            error.message || 'Erro inesperado'
          }`,
          variant: 'destructive',
        });
      } finally {
        setIsLoadingDropdowns(false);
      }
    }
    fetchDropdownData();
  }, [toast]);

  React.useEffect(() => {
    if (isEditMode && gameBook?.document_url) {
      setDocumentName(
        gameBook.document_url.split('/').pop() || 'Documento existente'
      );
    }
  }, [isEditMode, gameBook]);

  React.useEffect(() => {
    if (!isLoadingDropdowns && isEditMode && gameBook) {
      reset({
        name: gameBook.name || '',
        description: gameBook.description || '',
        game_id: String(gameBook.game_id || ''),
        cover_image_url: gameBook.cover_image_url || '',
        document_url: gameBook.document_url || '',
      });
    }
  }, [isEditMode, gameBook, isLoadingDropdowns, reset]);

  const imagePreview = form.watch('cover_image_url');

  const handleDocumentChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: 'Tipo de arquivo inválido',
          description: 'Por favor, selecione um arquivo PDF.',
          variant: 'destructive',
        });
        return;
      }
      setDocumentFile(file);
      setDocumentName(file.name);
      setIsDocumentRemoved(false);
      setValue('document_url', 'file-selected', {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  const handleRemoveDocument = () => {
    setDocumentFile(null);
    setDocumentName(null);
    setValue('document_url', '', { shouldDirty: true });
    setIsDocumentRemoved(true); // Mark for deletion on submit
  };

  async function onSubmit(data: GameBookFormValues) {
    if (!isEditMode && !documentFile) {
      toast({
        title: 'Erro de Validação',
        description: 'É obrigatório selecionar um documento PDF.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode && gameBook) {
        let docUrl = gameBook.document_url;

        if (documentFile) {
          const uploadResult = await uploadDocument(documentFile, gameBook.id);
          if (!uploadResult.success) {
            toast({
              title: 'Erro no Upload',
              description: `Falha ao enviar documento: ${uploadResult.rawMessage}`,
              variant: 'destructive',
            });
            setIsSubmitting(false);
            return;
          }
          docUrl = uploadResult.url!;
        } else if (isDocumentRemoved) {
          docUrl = '';
        }

        const updatePayload = { ...data, document_url: docUrl };
        const result = await updateBook(gameBook.id, updatePayload);
        if (result.success) {
          toast({
            title: 'Livro Atualizado',
            description: result.rawMessage,
          });
          if (isDocumentRemoved && oldDocumentUrl) {
            const token = getAuthToken();
            await deleteFileByUrlAction(oldDocumentUrl, token);
          }
          router.push('/admin/books');
          router.refresh();
        } else {
          toast({
            title: 'Erro na Atualização',
            description: result.rawMessage,
            variant: 'destructive',
          });
        }
      } else {
        // Create Mode
        const createPayload = {
          ...data,
          document_url: '',
          cover_image_url: data.cover_image_url || undefined,
        };
        const result = await createBook(createPayload);

        if (result.success && result.gameBook) {
          const bookId = result.gameBook.id;
          let docUploadSuccess = true;
          let uploadError = '';

          if (documentFile) {
            const docUploadResult = await uploadDocument(documentFile, bookId);
            if (!docUploadResult.success) {
              docUploadSuccess = false;
              uploadError = `Documento: ${docUploadResult.rawMessage}`;
            }
          }

          if (docUploadSuccess) {
            toast({ title: 'Livro Criado', description: result.rawMessage });
          } else {
            toast({
              title: 'Criado com Erro no Upload',
              description: `O livro foi criado, mas o documento não pôde ser enviado: ${uploadError}`,
              variant: 'destructive',
            });
          }
          router.push('/admin/books');
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
        description: error.message || 'Ocorreu um erro ao salvar o livro.',
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
          {isEditMode ? 'Editar Livro' : 'Adicionar Novo Livro'}
        </CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="flex flex-col-reverse gap-8 md:flex-row">
              <div className="flex-grow space-y-6">
                {isLoadingDropdowns ? (
                  <div className="space-y-2">
                    <Label>Jogo Associado</Label>
                    <Skeleton className="h-10 w-full" />
                    <FormDescription>
                      O livro pertence a qual sistema de jogo?
                    </FormDescription>
                  </div>
                ) : (
                  <FormField
                    control={form.control}
                    name="game_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jogo Associado</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ''}
                          key={`game-${games.length}`}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um jogo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {games.map((game) => (
                              <SelectItem
                                key={game.id}
                                value={String(game.id)}
                              >
                                {game.name} (v{game.version})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          O livro pertence a qual sistema de jogo?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Livro</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Livro do Jogador" {...field} />
                      </FormControl>
                      <FormDescription>
                        O nome oficial do livro ou documento.
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
                          placeholder="Descreva o conteúdo do livro..."
                          className="min-h-[100px] resize-y"
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Um resumo breve sobre o livro.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="w-full flex-shrink-0 space-y-2 md:w-56">
                <FormLabel>Capa do Livro (URL)</FormLabel>
                <div className="relative flex aspect-[3/4] w-full items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/30">
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt="Prévia da capa"
                      layout="fill"
                      className="object-contain rounded-md p-1"
                    />
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      <ImageIcon className="mx-auto h-12 w-12" />
                      <p className="mt-2 text-xs">Sem imagem</p>
                    </div>
                  )}
                </div>
                <FormField
                  control={form.control}
                  name="cover_image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/cover.png"
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormDescription>URL da imagem de capa.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="document_url"
              render={() => (
                <FormItem>
                  <FormLabel>Documento (PDF)</FormLabel>
                  <div className="flex items-center gap-2">
                    <div className="relative w-full">
                      <label
                        htmlFor="document-upload"
                        className="flex h-10 w-full cursor-pointer items-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                      >
                        <FileText className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="truncate text-muted-foreground">
                          {documentName ||
                            (isDocumentRemoved
                              ? 'Documento removido'
                              : 'Selecione um arquivo PDF...')}
                        </span>
                      </label>
                      <FormControl>
                        <Input
                          id="document-upload"
                          type="file"
                          className="sr-only"
                          accept=".pdf"
                          onChange={handleDocumentChange}
                        />
                      </FormControl>
                    </div>
                    {(oldDocumentUrl || documentName) && !isDocumentRemoved && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={handleRemoveDocument}
                        title="Remover documento"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    {oldDocumentUrl && !isDocumentRemoved && (
                      <Button
                        asChild
                        variant="outline"
                        size="icon"
                        type="button"
                      >
                        <Link
                          href={oldDocumentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Visualizar documento atual"
                        >
                          <FileText className="h-5 w-5" />
                        </Link>
                      </Button>
                    )}
                  </div>
                  <FormDescription>
                    {isDocumentRemoved
                      ? 'O documento existente será removido ao salvar.'
                      : 'Selecione o arquivo PDF do livro do seu computador.'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                'Criar Livro'
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
