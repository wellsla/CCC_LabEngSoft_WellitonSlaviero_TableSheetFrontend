
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { deleteBookAction } from './actions';
import { getAuthToken } from '@/lib/tokenManager';

interface BookTableActionsProps {
  bookId: string;
  bookName: string;
  onActionSuccess: () => void;
}

export function BookTableActions({
                                   bookId,
                                   bookName,
                                   onActionSuccess,
                                 }: BookTableActionsProps) {
  const { toast } = useToast();

  const handleDelete = async () => {
    const token = getAuthToken();
    const result = await deleteBookAction(bookId, token);
    if (result.success) {
      toast({
        title: 'Livro Excluído',
        description: `O livro "${bookName}" foi excluído com sucesso.`,
      });
      onActionSuccess();
    } else {
      toast({
        title: 'Erro na Exclusão',
        description: result.rawMessage || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Button asChild variant="ghost" size="icon" className="hover:text-primary">
        <Link href={`/admin/books/${bookId}/edit`}>
          <Edit className="h-4 w-4" />
        </Link>
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o livro "{bookName}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Confirmar Exclusão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
