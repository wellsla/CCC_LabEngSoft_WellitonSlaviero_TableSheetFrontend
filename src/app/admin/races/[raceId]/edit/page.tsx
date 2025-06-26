
'use client';

import * as React from 'react';
import { getGameRaceDetails, type GameRace } from '@/services/race';
import { GameRaceForm } from '../../race-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function EditGameRacePage() {
  const params = useParams();
  const raceId = params.raceId as string;
  const router = useRouter();
  const { toast } = useToast();

  const [gameRace, setGameRace] = React.useState<GameRace | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchGameRace() {
      if (!raceId) return;
      setIsLoading(true);
      try {
        const fetchedRace = await getGameRaceDetails(raceId);
        if (fetchedRace) {
          setGameRace(fetchedRace);
        } else {
          toast({ title: 'Erro', description: 'Raça não encontrada.', variant: 'destructive' });
          router.replace('/admin/races');
        }
      } catch (error: any) {
        toast({ title: 'Erro', description: `Falha ao carregar a raça: ${error.message || 'Erro desconhecido'}`, variant: 'destructive' });
        router.replace('/admin/races');
      } finally {
        setIsLoading(false);
      }
    }
    fetchGameRace();
  }, [raceId, router, toast]);

  React.useEffect(() => {
    if (gameRace?.name) {
      document.title = `Editar Raça: ${gameRace.name}`;
    } else if(!isLoading) {
      document.title = 'Editar Raça';
    }
  }, [gameRace, isLoading]);

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!gameRace) {
    return (
        <div className="container mx-auto px-4 py-8 text-center">
            <p>Carregando...</p> 
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="outline" size="sm" asChild className="mb-6">
        <Link href="/admin/races">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Raças
        </Link>
      </Button>
      <GameRaceForm gameRace={gameRace} isEditMode={true} />
    </div>
  );
}
