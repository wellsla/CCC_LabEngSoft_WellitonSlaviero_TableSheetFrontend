'use client';

import * as React from 'react';
import { GameBookForm } from '../book-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function NewGameBookPage() {
  const { t, currentLocale } = useTranslation();

  React.useEffect(() => {
    document.title = t('admin.books.new.documentTitle');
  }, [t, currentLocale]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="outline" size="sm" asChild className="mb-6">
        <Link href="/admin/books">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('admin.books.new.backButton')}
        </Link>
      </Button>
      <GameBookForm isEditMode={false} />
    </div>
  );
}
