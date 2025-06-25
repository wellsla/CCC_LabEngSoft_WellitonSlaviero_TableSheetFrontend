
'use client'; // Converted to client component

import * as React from 'react'; // Added React import
import { CharacterForm } from '../character-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
// Removed: import type { Metadata } from 'next'; // Metadata is for server components
import { useTranslation } from '@/hooks/useTranslation'; // Added for i18n

// Removed: export const metadata: Metadata = { ... };

export default function NewCharacterPage() {
  const { t, currentLocale } = useTranslation(); // Added for i18n

  React.useEffect(() => {
    document.title = t('character.new.documentTitle');
  }, [t, currentLocale]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="outline" size="sm" asChild className="mb-6">
        <Link href="/characters">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('character.new.backToCharacters')}
        </Link>
      </Button>
      <CharacterForm isEditMode={false} />
    </div>
  );
}

    