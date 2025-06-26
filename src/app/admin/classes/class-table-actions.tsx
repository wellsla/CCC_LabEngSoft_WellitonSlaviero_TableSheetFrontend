
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
import { deleteGameClassAction } from './actions';
import { getAuthToken } from '@/lib/tokenManager';

interface ClassTableActionsProps {
  classId: string;
  className: string;
  onActionSuccess: () => void;
}

export function ClassTableActions({
                                    classId,
                                    className,
                                    onActionSuccess,
                                  }: ClassTableActionsProps) {
  const { toast } = useToast();

  const handleDelete = async () => {
    const token = getAuthToken();
    const result = await deleteGameClassAction(classId, token);
    if (result.success) {
      toast({
        title: 'Classe Excluída',
        description: `A classe "${className}" foi excluída com sucesso.`,
      });
      onActionSuccess();
    } else {
      const errorDescription =
        result.rawMessage || 'Ocorreu um erro inesperado.';
      toast({
        title: 'Erro',
        description: `Não foi possível excluir "${className}". Detalhes: ${errorDescription}`,
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Button asChild variant="ghost" size="icon" className="hover:text-primary">
        <Link href={`/admin/classes/${classId}/edit`}>
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
              Tem certeza que deseja excluir a classe "{className}"?
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
