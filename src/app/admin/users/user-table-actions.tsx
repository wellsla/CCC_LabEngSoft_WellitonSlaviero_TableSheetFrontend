
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
import { adminDeleteUser } from '@/services/userProfile';
import { getAuthToken } from '@/lib/tokenManager';
import { useAuth } from '@/hooks/useAuth';

interface UserTableActionsProps {
  userId: string;
  userName: string;
  userEmail: string;
  onActionSuccess: () => void;
}

export function UserTableActions({ userId, userName, userEmail, onActionSuccess }: UserTableActionsProps) {
  const { toast } = useToast();
  const { user } = useAuth();

  const isCurrentUser = user?.id.toString() === userId.toString();

  const handleDelete = async () => {
    if (isCurrentUser) {
      toast({
        title: 'Ação Inválida',
        description: 'Você não pode excluir seu próprio usuário.',
        variant: 'destructive',
      });
      return;
    }

    const token = getAuthToken();
    const result = await adminDeleteUser(userId, token);
    if (result.success) {
      toast({
        title: 'Usuário Excluído',
        description: result.rawMessage || `O usuário "${userName}" foi excluído.`,
      });
      onActionSuccess();
    } else {
      const errorDescription = result.rawMessage || 'Ocorreu um erro inesperado.';
      toast({
        title: 'Falha na Exclusão',
        description: `Não foi possível excluir "${userName}". Detalhes: ${errorDescription}`,
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Button
        asChild
        variant="ghost"
        size="icon"
        className="hover:text-primary"
        aria-label={`Editar usuário ${userName}`}
      >
        <Link href={`/admin/users/${userId}/edit`}>
          <Edit className="h-4 w-4" />
        </Link>
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild disabled={isCurrentUser}>
          <Button
            variant="ghost"
            size="icon"
            className="hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={`Excluir usuário ${userName}`}
            disabled={isCurrentUser}
            title={isCurrentUser ? "Você não pode excluir seu próprio usuário" : `Excluir ${userName}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Confirmar Exclusão
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o usuário "{userName}" ({userEmail})? Esta ação não pode ser desfeita.
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
