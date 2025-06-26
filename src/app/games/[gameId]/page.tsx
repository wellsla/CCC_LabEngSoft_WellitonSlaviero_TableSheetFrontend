
import Image from 'next/image';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  ArrowLeft,
  Gamepad2,
  BookOpen,
  FileText,
  CheckCircle,
  XCircle,
  ImageOff,
} from 'lucide-react';
import { notFound } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import type { Metadata } from 'next';
import { ApiClient, type Game } from '@/lib/apiClient';

async function getGame(gameId: string): Promise<Game | null> {
  const apiClient = new ApiClient();
  try {
    const response = await apiClient.getGame(gameId);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    // Re-throw other errors to be caught by Next.js error boundary
    throw error;
  }
}

interface GameDetailsPageProps {
  params: Promise<{ gameId: string }>;
}

export async function generateMetadata({
                                         params,
                                       }: GameDetailsPageProps): Promise<Metadata> {
  const { gameId } = await params;
  const game = await getGame(gameId);

  if (!game) {
    return {
      title: 'Jogo não encontrado',
    };
  }

  return {
    title: `${game.name} - Detalhes do Jogo`,
    description: `Detalhes do jogo: ${game.name}`,
  };
}

export default async function GameDetailsPage({ params }: GameDetailsPageProps) {
  const { gameId } = await params;
  const game = await getGame(gameId);

  if (!game) {
    notFound();
  }

  const pdfDocuments =
    game.books?.map((book) => ({
      id: String(book.id),
      name: book.name,
      url: book.document_url,
      gameId: game.id,
    })) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="outline" size="sm" asChild className="mb-6">
        <Link href="/games">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Jogos
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div className="mb-2 flex items-center gap-3">
              <Gamepad2 className="h-8 w-8 flex-shrink-0 text-accent" />
              <div>
                <CardTitle className="text-3xl">{game.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Versão: {game.version}
                </p>
              </div>
            </div>
            <Badge
              variant={game.is_active ? 'default' : 'outline'}
              className="w-fit whitespace-nowrap"
            >
              {game.is_active ? (
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="mr-2 h-4 w-4 text-red-500" />
              )}
              {game.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {game.cover_image_url ? (
            <div className="relative mx-auto mb-6 aspect-video w-full max-h-[300px] overflow-hidden rounded-lg bg-muted shadow-md sm:w-2/3 lg:w-1/2">
              <Image
                src={game.cover_image_url}
                alt={`Cover art for ${game.name}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-contain p-2"
                data-ai-hint={game.dataAiHint || 'game cover'}
              />
            </div>
          ) : (
            <div className="mx-auto mb-6 flex aspect-video w-full max-h-[300px] items-center justify-center rounded-lg bg-muted text-muted-foreground shadow-md sm:w-2/3 lg:w-1/2">
              <ImageOff className="h-16 w-16" />
            </div>
          )}
          <CardDescription className="mb-6 text-lg">
            {game.description}
          </CardDescription>

          {pdfDocuments && pdfDocuments.length > 0 && (
            <>
              <Separator className="my-6" />
              <div className="space-y-4">
                <h3 className="flex items-center text-xl font-semibold text-primary">
                  <BookOpen className="mr-2 h-5 w-5 text-accent" />
                  Manuais e Documentos
                </h3>
                <ul className="list-inside space-y-2">
                  {pdfDocuments.map((pdf) => (
                    <li key={pdf.id} className="flex items-center">
                      <FileText className="mr-2 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      <Link
                        href={`/rulebooks?pdfId=${encodeURIComponent(pdf.id)}&gameId=${encodeURIComponent(game.id)}&pdfUrl=${encodeURIComponent(pdf.url)}&pdfName=${encodeURIComponent(pdf.name)}`}
                        className="text-primary transition-colors hover:text-accent hover:underline"
                      >
                        {pdf.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
