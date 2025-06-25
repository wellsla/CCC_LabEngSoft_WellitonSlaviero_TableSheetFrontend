
'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  getCharacterList,
  type Character,
  getAuthTokenFromLocalStorage,
} from '@/services/character';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, PlusCircle, Edit, Trash2, Shield, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { getUserProfile, type UserProfile as UserProfileType } from '@/services/userProfile';
import { useRouter } from 'next/navigation';
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
import { useToast } from '@/hooks/use-toast';
import { deleteCharacterAction } from './actions';

export default function CharactersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = React.useState<UserProfileType | null>(null);
  const [characters, setCharacters] = React.useState<Character[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    document.title = 'Meus Personagens - TableSheet';
  }, []);

  React.useEffect(() => {
    const currentUser = getUserProfile();
    if (!currentUser) {
      router.push('/auth/login?message=Please+login+to+view+your+characters');
    } else {
      setUser(currentUser);
      const fetchCharacters = async () => {
        setIsLoading(true);
        const token = getAuthTokenFromLocalStorage();
        if (!token) {
          toast({ title: 'Erro', description: 'Falha na autenticação. Por favor, faça login novamente.', variant: "destructive" });
          setIsLoading(false);
          router.push('/auth/login');
          return;
        }
        try {
          const charList = await getCharacterList(token);
          setCharacters(charList);
        } catch (error: any) {
          console.error("Failed to fetch characters:", error);
          const errorDescription = `Não foi possível carregar os personagens. Detalhes: ${error.message || 'Erro desconhecido'}`;
          toast({ title: 'Erro', description: errorDescription, variant: "destructive" });
        } finally {
          setIsLoading(false);
        }
      };
      fetchCharacters();
    }
  }, [router, toast]);

  const handleDelete = async (characterId: string, characterName: string) => {
    const token = getAuthTokenFromLocalStorage();
    if (!token) {
      toast({ title: 'Erro', description: 'Falha na autenticação. Por favor, faça login novamente.', variant: "destructive" });
      router.push('/auth/login');
      return;
    }
    const result = await deleteCharacterAction(characterId, token); 
    if (result.success) {
      toast({
        title: 'Personagem Excluído',
        description: `"${characterName}" foi excluído com sucesso.`,
      });
      setCharacters(prev => prev.filter(c => c.id !== characterId));
    } else {
      const errorDescription = result.rawMessage || 'Ocorreu um erro inesperado.';
      toast({
        title: 'Falha na Exclusão',
        description: `Não foi possível excluir "${characterName}". Detalhes: ${errorDescription}`,
        variant: 'destructive',
      });
    }
  };


  if (isLoading && !user) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user && !isLoading) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-8">
        <p>Redirecionando para o login...</p>
      </div>
    );
  }


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Meus Personagens</h1>
        <Button asChild>
          <Link href="/characters/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Criar Novo Personagem
          </Link>
        </Button>
      </div>

      {isLoading && characters.length === 0 ? (
         <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2 text-muted-foreground">Carregando personagens...</p>
         </div>
      ) : !isLoading && characters.length === 0 ? (
        <Card className="py-12 text-center">
          <CardHeader>
            <User className="mx-auto h-12 w-12 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-lg text-muted-foreground">
              Você ainda não criou nenhum personagem.
            </p>
            <Button asChild className="mt-4">
              <Link href="/characters/new">Crie seu primeiro personagem</Link>
            </Button>
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

interface CharacterCardProps {
  character: Character;
  onDelete: () => void;
}

function CharacterCard({ character, onDelete }: CharacterCardProps) {
  return (
    <Card className="flex h-full flex-col shadow-md transition-shadow duration-200 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
            <User className="h-6 w-6 flex-shrink-0 text-accent" />
            <CardTitle className="text-xl">{character.name}</CardTitle>
            </div>
            <Badge variant={character.is_active ? 'secondary' : 'outline'} className="whitespace-nowrap">
                {character.is_active ? <CheckCircle className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
                {character.is_active ? 'Ativo' : 'Inativo'}
            </Badge>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Nvl {character.level || 1} {character.race_id || 'Raça'} {character.class_id || 'Classe'}
        </p>
        <CardDescription className="mt-2 min-h-[3rem] flex-grow line-clamp-3">
          {character.description || (
            <span className="italic text-muted-foreground/80">
              Sem descrição.
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
                <Shield className="h-4 w-4"/> CA: {character.armor_class ?? 'N/A'}
            </div>
            <div className="flex items-center gap-1">
                PV: {character.current_hit_points ?? 'N/A'}/{character.max_hit_points ?? 'N/A'}
            </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t pt-4">
        <Button asChild variant="link" className="h-auto p-0 text-sm">
          <Link href={`/characters/${character.id}`}>Ver Detalhes</Link>
        </Button>
        <div className="flex gap-2">
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
                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Isso excluirá permanentemente "{character.name}".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Sim, excluir personagem
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  );
}
