
'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  PlusCircle,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ClassTableActions } from './class-table-actions';
import type { GameClass } from '@/lib/apiClient';
import { getGameClassList } from '@/services/class';
import { useToast } from '@/hooks/useToast';
import Loading from './loading';

export default function AdminGameClassesPage() {
  const [gameClasses, setGameClasses] = React.useState<GameClass[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();

  const [currentPage, setCurrentPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const classes = await getGameClassList();
      setGameClasses(classes);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar dados',
        description: error.message || 'Não foi possível buscar as classes e jogos.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = Math.ceil(gameClasses.length / rowsPerPage);
  const paginatedClasses = gameClasses.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Gerenciar Classes de Jogo</h1>
        <Button asChild>
          <Link href="/admin/classes/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Classe
          </Link>
        </Button>
      </div>

      {gameClasses.length === 0 ? (
        <Card className="py-12 text-center">
          <CardHeader>
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-lg text-muted-foreground">Nenhuma classe de jogo encontrada.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Jogo Associado</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedClasses.map((gc) => (
                  <TableRow key={gc.id}>
                    <TableCell className="font-medium">{gc.name}</TableCell>
                    <TableCell>{gc.game?.name || gc.game_id}</TableCell>
                    <TableCell className="max-w-xs truncate">{gc.description || '-'}</TableCell>
                    <TableCell className="text-right">
                      <ClassTableActions classId={gc.id} className={gc.name} onActionSuccess={fetchData} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Total de {gameClasses.length} classes.
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Linhas por página</p>
                <Select
                  value={`${rowsPerPage}`}
                  onValueChange={(value) => {
                    setRowsPerPage(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder={`${rowsPerPage}`} />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[5, 10, 20, 50].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                Página {currentPage} de {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <span className="sr-only">Go to previous page</span>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  <span className="sr-only">Go to next page</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
