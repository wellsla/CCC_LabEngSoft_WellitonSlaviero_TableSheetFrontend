'use client';

import * as React from 'react';
import { GameRaceForm } from '../race-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function NewGameRacePage() {
  const { t, currentLocale } = useTranslation();

  React.useEffect(() => {
    document.title = t('admin.races.new.documentTitle');
  }, [t, currentLocale]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="outline" size="sm" asChild className="mb-6">
        <Link href="/admin/races">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('admin.races.new.backButton')}
        </Link>
      </Button>
      <GameRaceForm isEditMode={false} />
    </div>
  );
}
