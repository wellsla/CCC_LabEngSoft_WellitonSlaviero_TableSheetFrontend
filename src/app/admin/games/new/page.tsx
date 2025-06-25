
'use client'; // Added 'use client'

import * as React from 'react'; // Added React import
import { GameForm } from '../game-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
// Removed: import type { Metadata } from 'next'; // Metadata is for server components
import { useTranslation } from '@/hooks/useTranslation'; // Added for i18n

// Removed: export const metadata: Metadata = { ... };

export default function NewGamePage() {
  const { t, currentLocale } = useTranslation(); // Added for i18n

  React.useEffect(() => {
    document.title = t('admin.games.new.documentTitle');
  }, [t, currentLocale]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="outline" size="sm" asChild className="mb-6">
        <Link href="/admin/games">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('admin.games.new.backButton')}
        </Link>
      </Button>
      <GameForm isEditMode={false} />
    </div>
  );
}

    