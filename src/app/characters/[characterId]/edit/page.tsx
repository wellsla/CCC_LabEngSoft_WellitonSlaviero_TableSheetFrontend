
'use client';

import * as React from 'react';
import { getCharacterDetails, type Character } from '@/services/character';
import { CharacterForm } from '../../character-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/useToast';

export default function EditCharacterPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const characterId = params.characterId as string;

  const [character, setCharacter] = React.useState<Character | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchCharacter() {
      setIsLoading(true);
      try {
        const fetchedCharacter = await getCharacterDetails(characterId);
        if (fetchedCharacter) {
          setCharacter(fetchedCharacter);
        } else {
          toast({
            title: 'Personagem não encontrado',
            description: `Não foi possível encontrar um personagem com o ID: ${characterId}`,
            variant: 'destructive',
          });
          router.replace('/characters');
        }
      } catch (error: any) {
        const errorDescription = `Falha ao carregar dados do personagem: ${error.message || 'Erro desconhecido'}`;
        toast({
          title: 'Erro',
          description: errorDescription,
          variant: 'destructive',
        });
        router.replace('/characters');
      } finally {
        setIsLoading(false);
      }
    }

    if (characterId) {
      fetchCharacter();
    } else {
      router.replace('/characters');
      setIsLoading(false);
    }
  }, [characterId, router, toast]);

  React.useEffect(() => {
    if (character?.name) {
      document.title = `Editar: ${character.name}`;
    } else if (!isLoading) {
      document.title = 'Editar Personagem';
    }
  }, [character, isLoading]);


  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Carregando personagem...</p>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-lg text-muted-foreground">
          Personagem não encontrado.
        </p>
        <Button asChild className="mt-4">
          <Link href="/characters">Voltar para Personagens</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="outline" size="sm" asChild className="mb-6">
        <Link href={`/characters/${character.id}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Detalhes do Personagem
        </Link>
      </Button>
      <CharacterForm character={character} isEditMode={true} />
    </div>
  );
}
