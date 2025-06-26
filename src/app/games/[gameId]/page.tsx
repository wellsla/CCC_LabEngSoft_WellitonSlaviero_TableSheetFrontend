
import Image from 'next/image';
import { getGameDetails } from '@/services/game';
import {
  getPdfDocumentsForGame,
  type PdfDocument,
} from '@/services/pdfDocuments';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'; // CardFooter removed as not used
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

interface GameDetailsPageProps {
  params: { gameId: string };
}

export async function generateMetadata({
  params,
}: GameDetailsPageProps): Promise<Metadata> {
  const game = await getGameDetails(params.gameId);
  return {
    title: `${game?.name || 'Game'} Details - TableSheet`,
    description: `Details for the game: ${game?.name || 'Unknown Game'}`,
  };
}

export default async function GameDetailsPage({ params }: GameDetailsPageProps) {
  const game = await getGameDetails(params.gameId);

  if (!game) {
    notFound();
  }

  // Optional: Only show active games on public page
  // if (!game.is_active) {
  //   notFound();
  // }

  const pdfDocuments = await getPdfDocumentsForGame(params.gameId);

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="outline" size="sm" asChild className="mb-6">
        <Link href="/games">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Games
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
                  Version: {game.version}
                </p>
              </div>
            </div>
            <Badge
              variant={game.is_active ? 'secondary' : 'outline'}
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
                className="object-contain p-2" // p-2 to give some space if image is smaller than container
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
                  Rulebooks & Documents
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
