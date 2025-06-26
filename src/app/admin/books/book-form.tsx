
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
import { useToast } from '@/hooks/use-toast';
import type { GameBook } from '@/services/book';
import { createBook, updateBook } from '@/services/book';
import { getGameList, type Game } from '@/services/game';
import { Loader2, ImageIcon, FileText } from 'lucide-react';

const gameBookFormSchema = z.object({
  name: z.string().min(2, { message: 'Mínimo de 2 caracteres.' }).max(100, { message: 'Máximo de 100 caracteres.' }),
  description: z.string().max(1000, { message: 'Máximo de 1000 caracteres.' }).optional(),
  game_id: z.string().min(1, { message: 'É obrigatório associar a um jogo.' }),
  cover_image_url: z.string().optional().or(z.literal('')),
  document_url: z.string().min(1, { message: 'É obrigatório selecionar um documento.' }),
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
  const [isLoadingGames, setIsLoadingGames] = React.useState(true);
  const [imagePreview, setImagePreview] = React.useState<string | null>(gameBook?.cover_image_url || null);
  const [documentName, setDocumentName] = React.useState<string | null>(null);

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
          title: 'Erro',
          description: `Não foi possível carregar os jogos: ${error.message || 'Erro desconhecido'}`,
          variant: 'destructive',
        });
      } finally {
        setIsLoadingGames(false);
      }
    }
    fetchGames();
  }, [toast]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setImagePreview(dataUrl);
        form.setValue('cover_image_url', dataUrl, { shouldValidate: true, shouldDirty: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        form.setValue('document_url', dataUrl, { shouldValidate: true, shouldDirty: true });
        setDocumentName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };


  async function onSubmit(data: GameBookFormValues) {
    setIsSubmitting(true);
    try {
      let result;
      const payload = {
        ...data,
        description: data.description || undefined,
        cover_image_url: data.cover_image_url || undefined,
      };

      if (isEditMode && gameBook) {
        result = await updateBook(gameBook.id, payload);
        if (result.success && result.gameBook) {
          toast({
            title: 'Livro Atualizado',
            description: `O livro "${result.gameBook.name}" foi atualizado.`,
          });
          router.push('/admin/books');
          router.refresh();
        } else {
          toast({
            title: 'Erro na Atualização',
            description: result.rawMessage || 'Não foi possível atualizar o livro.',
            variant: 'destructive',
          });
        }
      } else {
        result = await createBook(payload);
        if (result.success && result.gameBook) {
          toast({
            title: 'Livro Criado',
            description: `O livro "${result.gameBook.name}" foi criado.`,
          });
          router.push('/admin/books');
          router.refresh();
        } else {
          toast({
            title: 'Erro na Criação',
            description: result.rawMessage || 'Não foi possível criar o livro.',
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
        <CardTitle>{isEditMode ? 'Editar Livro' : 'Adicionar Novo Livro'}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="flex flex-col-reverse gap-8 md:flex-row">
                <div className="flex-grow space-y-6">
                     <FormField
                      control={form.control}
                      name="game_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jogo Associado</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingGames}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={isLoadingGames ? 'Carregando jogos...' : 'Selecione um jogo'} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {isLoadingGames && <SelectItem value="loading" disabled>Carregando...</SelectItem>}
                              {!isLoadingGames && games.map((game) => (
                                <SelectItem key={game.id} value={game.id}>
                                  {game.name} (v{game.version})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>O livro pertence a qual sistema de jogo?</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Livro</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Livro do Jogador" {...field} />
                          </FormControl>
                          <FormDescription>O nome oficial do livro ou documento.</FormDescription>
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
                          <FormDescription>Um resumo breve sobre o livro.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
                <div className="w-full md:w-56 flex-shrink-0 space-y-2">
                    <FormLabel>Capa do Livro (Opcional)</FormLabel>
                    <div className="relative flex aspect-[3/4] w-full items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/30">
                        {imagePreview ? (
                            <Image src={imagePreview} alt="Prévia da capa" layout="fill" className="object-contain rounded-md p-1" />
                        ) : (
                            <div className="text-center text-muted-foreground p-4">
                                <ImageIcon className="mx-auto h-12 w-12"/>
                                <p className="text-xs mt-2">Sem imagem</p>
                            </div>
                        )}
                         <Input id="cover-image-upload" type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
                    </div>
                     <FormDescription>Clique na área para enviar uma imagem.</FormDescription>
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
                                    {documentName || 'Selecione um arquivo PDF...'}
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
                        {isEditMode && form.getValues('document_url') && !documentName && (
                            <Button asChild variant="outline" size="icon" type="button">
                                <Link
                                href={form.getValues('document_url')}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Visualizar documento atual"
                                >
                                <FileText className="h-5 w-5" />
                                </Link>
                            </Button>
                        )}
                    </div>
                  <FormDescription>Selecione o arquivo PDF do livro de regras do seu computador.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
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
          </CardContent>
          <CardFooter className="flex justify-end border-t pt-6">
            <Button type="submit" disabled={isSubmitting || isLoadingGames}>
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
