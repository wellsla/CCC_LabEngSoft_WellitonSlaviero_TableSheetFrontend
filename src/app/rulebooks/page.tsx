
'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Loader2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  FileQuestion,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function RulebookViewerPage() {
  const searchParams = useSearchParams();
  const pdfUrl = searchParams.get('pdfUrl');
  const pdfNameParam = searchParams.get('pdfName');

  const pdfName = pdfNameParam || 'Documento PDF';

  const [numPages, setNumPages] = React.useState<number | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isLoadingPdf, setIsLoadingPdf] = React.useState(true);
  const [pdfError, setPdfError] = React.useState<string | null>(null);
  const [viewerWidth, setViewerWidth] = React.useState<number>(800); 

  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
     document.title = `Livro de Regras: ${pdfNameParam || 'Documento'} - TableSheet`;
  }, [pdfNameParam]);

  React.useEffect(() => {
    function handleResize() {
      if (containerRef.current) {
        setViewerWidth(
          Math.max(0, containerRef.current.offsetWidth - 40) 
        );
      }
    }
    handleResize(); 
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []); 


  function onDocumentLoadSuccess({ numPages: nextNumPages }: { numPages: number }) {
    setNumPages(nextNumPages);
    setCurrentPage(1); 
    setIsLoadingPdf(false);
    setPdfError(null);
  }

  function onDocumentLoadError(loadError: Error) {
    console.error('Failed to load PDF:', loadError);
    setPdfError(
      `Falha ao carregar PDF: ${loadError.message}. Por favor, verifique se a URL está correta e acessível.`
    );
    setIsLoadingPdf(false);
  }

  function goToPrevPage() {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  }

  function goToNextPage() {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, numPages || prevPage));
  }

  if (!pdfUrl) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center px-4 py-8">
        <Card className="w-full max-w-lg text-center">
          <CardHeader>
            <div className="mx-auto mb-4 w-fit rounded-full bg-secondary p-3">
              <FileQuestion className="h-12 w-12 text-primary" />
            </div>
            <CardTitle>Nenhum PDF Selecionado</CardTitle>
            <CardDescription>
              Por favor, selecione um documento PDF na página de detalhes de um jogo para visualizá-lo aqui.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/games">Procurar Jogos</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" ref={containerRef}>
      <div className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <h1
          className="max-w-md truncate text-2xl font-bold text-primary sm:max-w-lg md:max-w-xl"
          title={pdfName}
        >
          <BookOpen className="align-text-bottom mr-2 inline-block h-6 w-6" />
          {pdfName}
        </h1>
        {numPages && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrevPage}
              disabled={currentPage <= 1 || isLoadingPdf}
              aria-label="Página Anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="whitespace-nowrap text-sm text-muted-foreground">
              Página {currentPage} de {numPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNextPage}
              disabled={currentPage >= (numPages || 0) || isLoadingPdf}
              aria-label="Próxima Página"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {isLoadingPdf && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">
            Carregando documento PDF...
          </p>
        </div>
      )}

      {pdfError && !isLoadingPdf && (
        <Card className="w-full border-destructive bg-destructive/10 text-center">
          <CardHeader>
            <div className="mx-auto mb-4 w-fit rounded-full bg-destructive/20 p-3">
              <AlertTriangle className="h-12 w-12 text-destructive" />
            </div>
            <CardTitle className="text-destructive">Erro ao Carregar PDF</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive-foreground">{pdfError}</p>
            <Button variant="link" asChild className="mt-4">
              <Link href="/games">Tentar outro documento</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoadingPdf && !pdfError && pdfUrl && (
        <div className="pdf-document-container overflow-x-auto rounded-lg bg-muted p-2 shadow-inner sm:p-4">
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading="" 
            error="" 
            options={{
              cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
              cMapPacked: true,
              standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
            }}
          >
            <Page
              pageNumber={currentPage}
              width={
                containerRef.current
                  ? Math.min(
                      containerRef.current.offsetWidth -
                        (containerRef.current.offsetWidth > 600 ? 40 : 10),
                      1200
                    )
                  : viewerWidth
              }
              renderAnnotationLayer={true}
              renderTextLayer={true}
              loading=""
              error=""
            />
          </Document>
        </div>
      )}

      {numPages && !isLoadingPdf && !pdfError && (
        <CardFooter className="mt-6 flex flex-col items-center justify-center gap-4 border-t pt-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrevPage}
              disabled={currentPage <= 1}
              aria-label="Página Anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {currentPage} de {numPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNextPage}
              disabled={currentPage >= numPages}
              aria-label="Próxima Página"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      )}
    </div>
  );
}
