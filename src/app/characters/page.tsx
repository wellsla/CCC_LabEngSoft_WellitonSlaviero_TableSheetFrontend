
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCharacterList, type Character } from '@/services/character';
import { getGameList, type Game } from '@/services/game';
import { deleteCharacterAction } from './actions';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import {
  User,
  PlusCircle,
  Edit,
  Trash2,
  Shield,
  CheckCircle,
  XCircle,
  Loader2,
  ImageIcon,
  FileDown,
} from 'lucide-react';
import Image from 'next/image';
import { generateCharacterPdf } from '@/lib/pdfGenerator';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { getAuthToken } from '@/lib/tokenManager';

function CharacterCardSkeleton() {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-1 items-start gap-3">
            <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
            <div className="w-full flex-1 space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-grow flex-col pt-0 pb-4">
        <div className="flex-grow space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="mt-3 flex items-center justify-between border-t pt-3">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t pt-4">
        <Skeleton className="h-5 w-24" />
        <div className="flex gap-1">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </CardFooter>
    </Card>
  );
}

export default function CharactersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [characters, setCharacters] = React.useState<Character[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    document.title = 'Meus Personagens - TableSheet';
  }, []);

  const fetchCharacters = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const charList = await getCharacterList();
      setCharacters(charList);
    } catch (error: any) {
      const errorDescription = `Não foi possível carregar os personagens. Detalhes: ${
        error.message || 'Erro desconhecido'
      }`;
      toast({
        title: 'Erro',
        description: errorDescription,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    if (isAuthLoading) return;

    if (!user) {
      router.push(
        '/auth/login?message=Por+favor,+faça+login+para+ver+seus+personagens'
      );
      return;
    }

    fetchCharacters();
  }, [user, isAuthLoading, router, fetchCharacters]);

  const handleDelete = async (characterId: string, characterName: string) => {
    const token = getAuthToken();
    const result = await deleteCharacterAction(characterId, token);
    if (result.success) {
      toast({
        title: 'Personagem Excluído',
        description:
          result.rawMessage || `"${characterName}" foi excluído com sucesso.`,
      });
      fetchCharacters();
    } else {
      const errorDescription =
        result.rawMessage || 'Ocorreu um erro inesperado.';
      toast({
        title: 'Falha na Exclusão',
        description: `Não foi possível excluir "${characterName}". Detalhes: ${errorDescription}`,
        variant: 'destructive',
      });
    }
  };

  if (isLoading || isAuthLoading) {
    return (
      <div className="container mx-auto animate-pulse px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-10 w-48 rounded-md" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <CharacterCardSkeleton />
          <CharacterCardSkeleton />
          <CharacterCardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Meus Personagens</h1>
        <SelectGameDialog />
      </div>

      {!isLoading && characters.length === 0 ? (
        <Card className="py-12 text-center">
          <CardHeader>
            <User className="mx-auto h-12 w-12 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-lg text-muted-foreground">
              Você ainda não criou nenhum personagem.
            </p>
            <div className="mt-4">
              <SelectGameDialog />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {characters.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              onDelete={() => handleDelete(character.id, character.name)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SelectGameDialog() {
  const router = useRouter();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = React.useState(false);
  const [games, setGames] = React.useState<Game[]>([]);
  const [selectedGameId, setSelectedGameId] = React.useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = React.useState(false);

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setIsLoading(true);
      getGameList()
        .then((gameList) => {
          setGames(gameList.filter((g) => g.is_active));
          setIsLoading(false);
        })
        .catch(() => {
          toast({
            title: 'Erro ao Carregar Jogos',
            description: 'Não foi possível buscar a lista de jogos disponíveis.',
            variant: 'destructive',
          });
          setIsLoading(false);
        });
    }
    setIsOpen(open);
  };

  const handleContinue = () => {
    if (selectedGameId) {
      router.push(`/characters/new?gameId=${selectedGameId}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Criar Novo Personagem
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Selecione o Jogo</DialogTitle>
          <DialogDescription>
            Escolha o sistema de RPG para o qual você quer criar uma nova ficha
            de personagem.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isLoading ? (
            <div className="flex h-10 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <Select
              onValueChange={setSelectedGameId}
              value={selectedGameId || ''}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um jogo..." />
              </SelectTrigger>
              <SelectContent>
                {games.map((game) => (
                  <SelectItem key={game.id} value={String(game.id)}>
                    {game.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleContinue} disabled={!selectedGameId}>
            Continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface CharacterCardProps {
  character: Character;
  onDelete: () => void;
}

function CharacterCard({ character, onDelete }: CharacterCardProps) {
  const [isDownloading, setIsDownloading] = React.useState(false);
  const { toast } = useToast();

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      await generateCharacterPdf(character);
    } catch (error) {
      toast({
        title: 'Erro ao Gerar PDF',
        description: 'Não foi possível criar o arquivo PDF. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card className="flex h-full flex-col shadow-md transition-shadow duration-200 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-1 items-start gap-3">
            {character.portrait_url ? (
              <Image
                src={character.portrait_url}
                alt={character.name}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1">
              <CardTitle className="text-xl">{character.name}</CardTitle>
              <p className="mt-1 text-sm font-medium text-accent">
                Nível {character.level || 1}
              </p>
            </div>
          </div>
          <Badge
            variant={character.is_active ? 'secondary' : 'outline'}
            className="shrink-0"
          >
            {character.is_active ? (
              <CheckCircle className="mr-1 h-3 w-3" />
            ) : (
              <XCircle className="mr-1 h-3 w-3" />
            )}
            {character.is_active ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-grow flex-col pt-0 pb-4">
        <CardDescription className="min-h-[3rem] flex-grow line-clamp-3">
          {character.description || (
            <span className="italic text-muted-foreground/80">
              Sem descrição.
            </span>
          )}
        </CardDescription>
        <div className="mt-3 flex items-center justify-between border-t pt-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Shield className="h-4 w-4" /> CA: {character.armor_class ?? 'N/A'}
          </div>
          <div className="flex items-center gap-1">
            PV: {character.current_hit_points ?? 'N/A'}/
            {character.max_hit_points ?? 'N/A'}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t pt-4">
        <Button asChild variant="link" className="h-auto p-0 text-sm">
          <Link href={`/characters/${character.id}`}>Ver Detalhes</Link>
        </Button>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            title={`Baixar PDF de ${character.name}`}
            aria-label={`Baixar PDF de ${character.name}`}
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4" />
            )}
          </Button>

          <Button
            asChild
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label={`Editar ${character.name}`}
          >
            <Link href={`/characters/${character.id}/edit`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                title={`Excluir ${character.name}`}
                aria-label={`Excluir ${character.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir o personagem "{character.name}
                  "? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Confirmar Exclusão
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  );
}
