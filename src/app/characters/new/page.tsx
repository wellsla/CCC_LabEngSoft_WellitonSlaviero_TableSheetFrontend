
'use client'; 

import * as React from 'react'; 
import { CharacterForm } from '../character-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Suspense } from 'react';


function NewCharacterPageContent() {
  const searchParams = useSearchParams();
  const gameId = searchParams.get('gameId');

  React.useEffect(() => {
    document.title = 'Criar Novo Personagem';
  }, []);

  if (!gameId) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <Card className="w-full max-w-lg text-center">
            <CardHeader>
                <AlertTriangle className="mx-auto h-12 w-12 text-destructive"/>
                <CardTitle>Jogo não selecionado</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="mb-4 text-muted-foreground">
                    Você precisa selecionar um jogo antes de criar um personagem.
                </p>
                <Button asChild>
                    <Link href="/characters">Voltar e selecionar um jogo</Link>
                </Button>
            </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="outline" size="sm" asChild className="mb-6">
        <Link href="/characters">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Personagens
        </Link>
      </Button>
      <CharacterForm isEditMode={false} gameId={gameId} />
    </div>
  );
}

export default function NewCharacterPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <NewCharacterPageContent />
        </Suspense>
    )
}
