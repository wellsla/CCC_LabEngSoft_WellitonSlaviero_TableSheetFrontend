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
import { useToast } from '@/hooks/useToast';
import type { GameRace } from '@/services/race';
import { createGameRace, updateGameRace } from '@/services/race';
import { getGameList, type Game } from '@/services/game';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';

const gameRaceFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Mínimo de 2 caracteres.' })
    .max(100, { message: 'Máximo de 100 caracteres.' }),
  description: z
    .string()
    .max(1000, { message: 'Máximo de 1000 caracteres.' })
    .optional(),
  game_id: z.string().min(1, { message: 'É obrigatório associar a um jogo.' }),
});

type GameRaceFormValues = z.infer<typeof gameRaceFormSchema>;

interface GameRaceFormProps {
  gameRace?: GameRace | null;
  isEditMode: boolean;
}

export function GameRaceForm({ gameRace, isEditMode }: GameRaceFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [games, setGames] = React.useState<Game[]>([]);
  const [isLoadingDropdowns, setIsLoadingDropdowns] = React.useState(true);

  const form = useForm<GameRaceFormValues>({
    resolver: zodResolver(gameRaceFormSchema),
    defaultValues: {
      name: '',
      description: '',
      game_id: '',
    },
    mode: 'onChange',
  });
  const { reset } = form;

  React.useEffect(() => {
    async function fetchDropdownData() {
      setIsLoadingDropdowns(true);
      try {
        const gameList = await getGameList();
        setGames(gameList);
      } catch (error: any) {
        toast({
          title: 'Erro',
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
    if (isEditMode && gameRace && games.length > 0) {
      reset({
        name: gameRace.name || '',
        description: gameRace.description || '',
        game_id: String(gameRace.game_id || ''),
      });
    }
  }, [isEditMode, gameRace, games, reset]);

  async function onSubmit(data: GameRaceFormValues) {
    setIsSubmitting(true);
    try {
      let result;
      const payload = {
        ...data,
        description: data.description || undefined,
      };

      if (isEditMode && gameRace) {
        result = await updateGameRace(gameRace.id, payload);
        if (result.success && result.gameRace) {
          toast({
            title: 'Raça Atualizada',
            description: `A raça "${result.gameRace.name}" foi atualizada com sucesso.`,
          });
          router.push('/admin/races');
          router.refresh();
        } else {
          toast({
            title: 'Falha na Atualização',
            description:
              result.rawMessage || 'Ocorreu um erro ao atualizar a raça.',
            variant: 'destructive',
          });
        }
      } else {
        result = await createGameRace(payload);
        if (result.success && result.gameRace) {
          toast({
            title: 'Raça Criada',
            description: `A raça "${result.gameRace.name}" foi criada com sucesso.`,
          });
          router.push('/admin/races');
          router.refresh();
        } else {
          toast({
            title: 'Falha na Criação',
            description:
              result.rawMessage || 'Ocorreu um erro ao criar a raça.',
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
        <CardTitle>
          {isEditMode ? 'Editar Raça' : 'Adicionar Nova Raça'}
        </CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {isLoadingDropdowns ? (
              <div className="space-y-2">
                <Label>Jogo Associado</Label>
                <Skeleton className="h-10 w-full" />
                <FormDescription>
                  A raça pertence a qual sistema de jogo?
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
                          <SelectItem key={game.id} value={String(game.id)}>
                            {game.name} (v{game.version})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      A raça pertence a qual sistema de jogo?
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
                  <FormLabel>Nome da Raça</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Elfo" {...field} />
                  </FormControl>
                  <FormDescription>
                    O nome da raça de personagem.
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
                      placeholder="Descreva a raça, suas características e cultura."
                      className="min-h-[100px] resize-y"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormDescription>Um resumo sobre a raça.</FormDescription>
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
                'Criar Raça'
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
