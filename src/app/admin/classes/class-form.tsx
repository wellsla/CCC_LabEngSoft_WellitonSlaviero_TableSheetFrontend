
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
import type { GameClass } from '@/services/class';
import { createGameClass, updateGameClass } from '@/services/class';
import { getGameList, type Game } from '@/services/game';
import { Loader2 } from 'lucide-react';

const gameClassFormSchema = z.object({
  name: z.string().min(2, { message: 'Mínimo de 2 caracteres.' }).max(100, { message: 'Máximo de 100 caracteres.' }),
  description: z.string().max(1000, { message: 'Máximo de 1000 caracteres.' }).optional(),
  game_id: z.string().min(1, { message: 'É obrigatório associar a um jogo.' }),
});

type GameClassFormValues = z.infer<typeof gameClassFormSchema>;

interface GameClassFormProps {
  gameClass?: GameClass | null;
  isEditMode: boolean;
}

export function GameClassForm({ gameClass, isEditMode }: GameClassFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [games, setGames] = React.useState<Game[]>([]);
  const [isLoadingGames, setIsLoadingGames] = React.useState(true);

  const form = useForm<GameClassFormValues>({
    resolver: zodResolver(gameClassFormSchema),
    defaultValues: {
      name: gameClass?.name || '',
      description: gameClass?.description || '',
      game_id: gameClass?.game_id || '',
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
          description: `Não foi possível carregar os jogos: ${error.message || 'Erro inesperado'}`,
          variant: 'destructive',
        });
      } finally {
        setIsLoadingGames(false);
      }
    }
    fetchGames();
  }, [toast]);

  async function onSubmit(data: GameClassFormValues) {
    setIsSubmitting(true);
    try {
      let result;
      const payload = {
        ...data,
        description: data.description || undefined,
      };

      if (isEditMode && gameClass) {
        result = await updateGameClass(gameClass.id, payload);
        if (result.success && result.gameClass) {
          toast({
            title: 'Classe Atualizada',
            description: `A classe "${result.gameClass.name}" foi atualizada com sucesso.`,
          });
          router.push('/admin/classes');
          router.refresh();
        } else {
          toast({
            title: 'Falha na Atualização',
            description: result.rawMessage || 'Ocorreu um erro ao atualizar a classe.',
            variant: 'destructive',
          });
        }
      } else {
        result = await createGameClass(payload);
        if (result.success && result.gameClass) {
          toast({
            title: 'Classe Criada',
            description: `A classe "${result.gameClass.name}" foi criada com sucesso.`,
          });
          router.push('/admin/classes');
          router.refresh();
        } else {
          toast({
            title: 'Falha na Criação',
            description: result.rawMessage || 'Ocorreu um erro ao criar a classe.',
            variant: 'destructive',
          });
        }
      }
    } catch (error: any) {
      toast({
        title: 'Erro Inesperado',
        description: `Ocorreu um erro: ${error.message || 'Tente novamente.'}`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditMode ? 'Editar Classe' : 'Adicionar Nova Classe'}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
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
                  <FormDescription>A classe pertence a qual sistema de jogo?</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Classe</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Guerreiro" {...field} />
                  </FormControl>
                  <FormDescription>O nome da classe de personagem.</FormDescription>
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
                      placeholder="Descreva a classe, suas habilidades e papel no jogo."
                      className="min-h-[100px] resize-y"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormDescription>Um resumo sobre a classe.</FormDescription>
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
                  Salvando...
                </>
              ) : isEditMode ? (
                'Salvar Alterações'
              ) : (
                'Criar Classe'
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
