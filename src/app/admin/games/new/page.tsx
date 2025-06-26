'use client';

import * as React from 'react';
import { GameForm } from '../game-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewGamePage() {
  React.useEffect(() => {
    document.title = 'Criar Novo Jogo';
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="outline" size="sm" asChild className="mb-6">
        <Link href="/admin/games">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Gerenciar Jogos
        </Link>
      </Button>
      <GameForm isEditMode={false} />
    </div>
  );
}
