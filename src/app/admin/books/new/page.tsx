
'use client';

import * as React from 'react';
import { GameBookForm } from '../book-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewGameBookPage() {
  React.useEffect(() => {
    document.title = 'Adicionar Novo Livro';
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="outline" size="sm" asChild className="mb-6">
        <Link href="/admin/books">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Livros
        </Link>
      </Button>
      <GameBookForm isEditMode={false} />
    </div>
  );
}
