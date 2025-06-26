
'use client';

import * as React from 'react';
import { getGameClassDetails, type GameClass } from '@/services/class';
import { GameClassForm } from '../../class-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/useToast';

export default function EditGameClassPage() {
  const params = useParams();
  const classId = params.classId as string;
  const router = useRouter();
  const { toast } = useToast();

  const [gameClass, setGameClass] = React.useState<GameClass | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchGameClass() {
      if (!classId) return;
      setIsLoading(true);
      try {
        const fetchedClass = await getGameClassDetails(classId);
        if (fetchedClass) {
          setGameClass(fetchedClass);
        } else {
          toast({ title: 'Erro', description: 'Classe não encontrada.', variant: 'destructive' });
          router.replace('/admin/classes');
        }
      } catch (error: any) {
        toast({ title: 'Erro', description: `Falha ao carregar a classe: ${error.message || 'Erro desconhecido'}`, variant: 'destructive' });
        router.replace('/admin/classes');
      } finally {
        setIsLoading(false);
      }
    }
    fetchGameClass();
  }, [classId, router, toast]);

  React.useEffect(() => {
    if (gameClass?.name) {
      document.title = `Editar Classe: ${gameClass.name}`;
    } else if(!isLoading) {
      document.title = 'Editar Classe';
    }
  }, [gameClass, isLoading]);

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!gameClass) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="outline" size="sm" asChild className="mb-6">
        <Link href="/admin/classes">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Classes
        </Link>
      </Button>
      <GameClassForm gameClass={gameClass} isEditMode={true} />
    </div>
  );
}
