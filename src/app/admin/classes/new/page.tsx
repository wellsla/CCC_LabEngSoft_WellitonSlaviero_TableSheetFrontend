'use client';

import * as React from 'react';
import { GameClassForm } from '../class-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewGameClassPage() {
  React.useEffect(() => {
    document.title = 'Adicionar Nova Classe';
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="outline" size="sm" asChild className="mb-6">
        <Link href="/admin/classes">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Classes
        </Link>
      </Button>
      <GameClassForm isEditMode={false} />
    </div>
  );
}
