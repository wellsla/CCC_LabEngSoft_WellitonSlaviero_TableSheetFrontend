
'use client';

import * as React from 'react';
import { getCharacterDetails, type Character } from '@/services/character';
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
import Image from 'next/image';
import {
  ArrowLeft,
  Edit,
  FileText,
  CheckCircle,
  XCircle,
  Heart,
  Dumbbell,
  Swords,
  BookUser,
  Image as ImageIcon,
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { useToast } from '@/hooks/useToast';
import { Skeleton } from '@/components/ui/skeleton';

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

function CharacterDetailsSkeleton() {
  return (
    <div className="container mx-auto animate-pulse space-y-6 px-4 py-8">
      <Skeleton className="h-9 w-48" />
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-3">
            <div className="md:col-span-1 space-y-4">
              <Card>
                <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-5/6" />
                  <Skeleton className="h-5 w-full" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                </CardContent>
              </Card>
            </div>
            <div className="md:col-span-2 space-y-4">
              <Card>
                <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t pt-4">
          <Skeleton className="h-10 w-44" />
        </CardFooter>
      </Card>
    </div>
  );
}

export default function CharacterDetailsPage() {
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
        }
      } catch (error: any) {
        const errorDescription = `Falha ao carregar detalhes: ${error.message || 'Erro desconhecido'}`;
        toast({
          title: 'Erro',
          description: errorDescription,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    if (characterId) {
      fetchCharacter();
    }
  }, [characterId, toast]);

  React.useEffect(() => {
    if (character?.name) {
      document.title = `${character.name} - Detalhes do Personagem`;
    } else if (!isLoading) {
      document.title = 'Detalhes do Personagem';
    }
  }, [character, isLoading]);


  if (isLoading) {
    return <CharacterDetailsSkeleton />;
  }

  if (!character) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-lg text-muted-foreground">
          Personagem não encontrado
        </p>
        <Button asChild className="mt-4">
          <Link href="/characters">Voltar para Personagens</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <Button variant="outline" size="sm" asChild className="mb-6">
        <Link href="/characters">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Personagens
        </Link>
      </Button>

      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              {character.portrait_url ? (
                <Image src={character.portrait_url} alt={character.name} width={64} height={64} className="h-16 w-16 rounded-lg object-cover" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div>
                <CardTitle className="text-3xl">{character.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Nível {character.level} {character.race?.name || '...'} {character.class?.name || '...'}
                </p>
              </div>
            </div>
            <Badge variant={character.is_active ? 'default' : 'outline'}>
              {character.is_active ? (
                <CheckCircle className="mr-1 h-3 w-3" />
              ) : (
                <XCircle className="mr-1 h-3 w-3" />
              )}
              {character.is_active ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-3">
            <div className="md:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <Swords className="mr-2 h-5 w-5 text-accent" /> Combate
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <DetailItem label="Pontos de Vida">
                     <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4 text-red-500" />
                       {character.current_hit_points ?? 'N/A'} / {character.max_hit_points ?? 'N/A'}
                     </span>
                  </DetailItem>
                  <DetailItem
                    label="Classe de Armadura"
                    value={character.armor_class}
                  />
                  <DetailItem label="Iniciativa" value={character.initiative} />
                  <DetailItem
                    label="Velocidade"
                    value={`${character.speed || 0}m`}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <Dumbbell className="mr-2 h-5 w-5 text-accent" /> Habilidades
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <DetailItem label="Força" value={character.strength} />
                  <DetailItem label="Destreza" value={character.dexterity} />
                  <DetailItem
                    label="Constituição"
                    value={character.constitution}
                  />
                  <DetailItem
                    label="Inteligência"
                    value={character.intelligence}
                  />
                  <DetailItem label="Sabedoria" value={character.wisdom} />
                  <DetailItem label="Carisma" value={character.charisma} />
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2 space-y-4">
              {character.description && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <BookUser className="mr-2 h-5 w-5 text-accent" /> Descrição
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                      {character.description}
                    </p>
                  </CardContent>
                </Card>
              )}

              {character.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <FileText className="mr-2 h-5 w-5 text-accent" /> Notas
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
              Editar Personagem
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
