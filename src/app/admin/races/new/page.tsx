
'use client';

import * as React from 'react';
import { GameRaceForm } from '../race-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewGameRacePage() {
  React.useEffect(() => {
    document.title = 'Adicionar Nova Raça';
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="outline" size="sm" asChild className="mb-6">
        <Link href="/admin/races">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Raças
        </Link>
      </Button>
      <GameRaceForm isEditMode={false} />
    </div>
  );
}
