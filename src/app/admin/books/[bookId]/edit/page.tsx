'use client';

import * as React from 'react';
import { getBookDetails, type GameBook, getAuthTokenFromLocalStorage } from '@/services/book';
import { GameBookForm } from '../../book-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function EditGameBookPage() {
  const params = useParams();
  const bookId = params.bookId as string;
  const router = useRouter();
  const { toast } = useToast();
  const { t, currentLocale } = useTranslation();

  const [gameBook, setGameBook] = React.useState<GameBook | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchGameBook() {
      if (!bookId) return;
      setIsLoading(true);
      const token = getAuthTokenFromLocalStorage();
      if (!token) {
        toast({ title: t("general.error"), description: t("general.authenticationFailed"), variant: "destructive" });
        setIsLoading(false);
        router.push('/auth/login');
        return;
      }
      try {
        const fetchedBook = await getBookDetails(bookId, token);
        if (fetchedBook) {
          setGameBook(fetchedBook);
        } else {
          toast({ title: t('general.error'), description: t('admin.books.edit.toastNotFound'), variant: 'destructive' });
          router.replace('/admin/books');
        }
      } catch (error: any) {
        toast({ title: t('general.error'), description: t('admin.books.edit.toastErrorLoading', {details: error.message || 'Unknown error'}), variant: 'destructive' });
        router.replace('/admin/books');
      } finally {
        setIsLoading(false);
      }
    }
    fetchGameBook();
  }, [bookId, router, toast, t]);

  React.useEffect(() => {
    if (gameBook?.name) {
      document.title = t('admin.books.edit.documentTitle', { name: gameBook.name });
    } else if(!isLoading) {
      document.title = t('admin.books.edit.documentTitle', { name: t('general.bookFallbackName') || 'Book' });
    }
  }, [gameBook, isLoading, t, currentLocale]);

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!gameBook) {
    return (
        <div className="container mx-auto px-4 py-8 text-center">
            <p>{t('loading')}...</p> 
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="outline" size="sm" asChild className="mb-6">
        <Link href="/admin/books">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('admin.books.edit.backButton')}
        </Link>
      </Button>
      <GameBookForm gameBook={gameBook} isEditMode={true} />
    </div>
  );
}
