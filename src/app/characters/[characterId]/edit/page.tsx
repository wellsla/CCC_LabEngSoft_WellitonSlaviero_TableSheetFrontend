
'use client';

import * as React from 'react';
import { getCharacterDetails, type Character, getAuthTokenFromLocalStorage } from '@/services/character'; // Import getAuthTokenFromLocalStorage
import { CharacterForm } from '../../character-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';

export default function EditCharacterPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const characterId = params.characterId as string;
  const { t, currentLocale } = useTranslation();

  const [character, setCharacter] = React.useState<Character | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchCharacter() {
      setIsLoading(true);
      const token = getAuthTokenFromLocalStorage(); // Get token client-side
      if (!token) {
        toast({ title: t("general.error"), description: t("general.authenticationFailed"), variant: "destructive" });
        setIsLoading(false);
        router.push('/auth/login');
        return;
      }
      try {
        const fetchedCharacter = await getCharacterDetails(characterId, token); // Pass token
        if (fetchedCharacter) {
          setCharacter(fetchedCharacter);
        } else {
          toast({
            title: t('character.edit.toastNotFoundTitle'),
            description: t('character.edit.toastNotFoundDescription', {characterId}),
            variant: 'destructive',
          });
          router.replace('/characters');
        }
      } catch (error: any) {
        console.error('Failed to fetch character for editing:', error);
        const errorDescription = t('character.edit.toastErrorDescription', {details: error.message || 'Unknown error'});
        toast({
          title: t('character.edit.toastErrorTitle'),
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
  }, [characterId, router, toast, t]);

  React.useEffect(() => {
    if (character?.name) {
        document.title = t('character.edit.documentTitle', { name: character.name });
    } else if (!isLoading) {
        document.title = t('character.edit.documentTitle', { name: t('general.characterFallbackName') || 'Character' });
    }
  }, [character, isLoading, t, currentLocale]);


  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">{t('character.edit.loading')}</p>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-lg text-muted-foreground">
          {t('character.edit.notFound')}
        </p>
        <Button asChild className="mt-4">
          <Link href="/characters">{t('characterDetail.backToCharacters')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="outline" size="sm" asChild className="mb-6">
        <Link href={`/characters/${character.id}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('character.edit.backToCharacterDetails')}
        </Link>
      </Button>
      <CharacterForm character={character} isEditMode={true} />
    </div>
  );
}
