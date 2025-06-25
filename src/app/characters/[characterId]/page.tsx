
'use client';

import * as React from 'react';
import {
  getCharacterDetails,
  type Character,
  getAuthTokenFromLocalStorage, // Import getAuthTokenFromLocalStorage
} from '@/services/character';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Edit,
  Shield,
  Zap,
  BookOpen,
  FileText,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation'; 
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';

interface DetailItemProps {
  label: string;
  value?: string | number | null;
  children?: React.ReactNode;
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value, children }) => {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex justify-between py-1">
      <span className="font-medium text-muted-foreground">{label}:</span>
      <span className="text-right">{children || value}</span>
    </div>
  );
};

export default function CharacterDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const characterId = params.characterId as string;
  const { t, currentLocale } = useTranslation();

  const [character, setCharacter] = React.useState<Character | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (characterId === 'new' || characterId === 'edit') {
      router.replace('/characters');
      return;
    }

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
            title: t('characterDetail.toastNotFoundTitle'),
            description: t('characterDetail.toastNotFoundDescription', {characterId}),
            variant: 'destructive',
          });
          router.replace('/characters');
        }
      } catch (error: any) {
        console.error('Failed to fetch character details:', error);
        const errorDescription = t('characterDetail.toastErrorDescription', {details: error.message || 'Unknown error'});
        toast({
          title: t('characterDetail.toastErrorTitle'),
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
    }
  }, [characterId, router, toast, t]);

  React.useEffect(() => {
    if (character?.name) {
      document.title = t('characterDetail.documentTitle', { name: character.name });
    } else if (!isLoading) {
      document.title = t('characterDetail.documentTitle', { name: t('general.characterFallbackName') || 'Character' });
    }
  }, [character, isLoading, t, currentLocale]);


  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">{t('characterDetail.loading')}</p>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-lg text-muted-foreground">
          {t('characterDetail.notFound')}
        </p>
        <Button asChild className="mt-4">
          <Link href="/characters">{t('characterDetail.backToCharacters')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <Button variant="outline" size="sm" asChild className="mb-6">
        <Link href="/characters">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('characterDetail.backToCharacters')}
        </Link>
      </Button>

      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <User className="h-10 w-10 text-primary" />
              <div>
                <CardTitle className="text-3xl">{character.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {character.race_id} {character.class_id}
                </p>
              </div>
            </div>
            <Badge variant={character.is_active ? 'default' : 'outline'}>
              {character.is_active ? (
                <CheckCircle className="mr-1 h-3 w-3" />
              ) : (
                <XCircle className="mr-1 h-3 w-3" />
              )}
              {character.is_active ? t('characterDetail.statusActive') : t('characterDetail.statusInactive')}
              {character.is_npc ? ` (${t('characterDetail.npcSuffix')})` : ''}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <Shield className="mr-2 h-5 w-5 text-accent" /> {t('characterDetail.combatStatsTitle')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <DetailItem label={t('characterDetail.levelLabel')} value={character.level} />
                  <DetailItem
                    label={t('characterDetail.experienceLabel')}
                    value={`${character.experience_points || 0} XP`}
                  />
                  <DetailItem label={t('characterDetail.hpLabel')}>
                    {character.current_hit_points ?? 'N/A'} /{' '}
                    {character.max_hit_points ?? 'N/A'}
                  </DetailItem>
                  <DetailItem
                    label={t('characterDetail.acLabel')}
                    value={character.armor_class}
                  />
                  <DetailItem label={t('characterDetail.initiativeLabel')} value={character.initiative} />
                  <DetailItem
                    label={t('characterDetail.speedLabel')}
                    value={`${character.speed || 0} ft.`}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <BookOpen className="mr-2 h-5 w-5 text-accent" />{' '}
                    {t('characterDetail.roleplayingInfoTitle')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <DetailItem label={t('characterDetail.gameIdLabel')} value={character.game_id} />
                  <DetailItem
                    label={t('characterDetail.backgroundLabel')}
                    value={character.background_id}
                  />
                  <DetailItem
                    label={t('characterDetail.alignmentLabel')}
                    value={character.alignment_id}
                  />
                  {character.description && (
                    <>
                      <Separator className="my-2" />
                      <h4 className="font-medium text-muted-foreground">
                        {t('characterDetail.descriptionLabel')}
                      </h4>
                      <p className="whitespace-pre-wrap text-sm">
                        {character.description}
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <Zap className="mr-2 h-5 w-5 text-accent" /> {t('characterDetail.abilityScoresTitle')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <DetailItem label={t('characterForm.strength')} value={character.strength} />
                  <DetailItem label={t('characterForm.dexterity')} value={character.dexterity} />
                  <DetailItem
                    label={t('characterForm.constitution')}
                    value={character.constitution}
                  />
                  <DetailItem
                    label={t('characterForm.intelligence')}
                    value={character.intelligence}
                  />
                  <DetailItem label={t('characterForm.wisdom')} value={character.wisdom} />
                  <DetailItem label={t('characterForm.charisma')} value={character.charisma} />
                </CardContent>
              </Card>

              {character.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <FileText className="mr-2 h-5 w-5 text-accent" /> {t('characterDetail.notesTitle')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                      {character.notes}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t pt-4">
          <Button asChild>
            <Link href={`/characters/${character.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              {t('characterDetail.editButton')}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
