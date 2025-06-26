
'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  getAllUsers,
  deleteUserById,
  type UserProfile,
} from '@/services/userProfile';
import { Badge } from '@/components/ui/badge';
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
import {
  Edit,
  Trash2,
  UserCheck,
  UserX,
  ShieldCheck,
  ShieldAlert,
  UserCog,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    document.title = 'Gerenciar Usuários';
  }, []);

  React.useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const userList = await getAllUsers();
        setUsers(userList);
      } catch (error: any) {
        console.error('Failed to fetch users:', error);
        const errorDescription = `Falha ao carregar usuários: ${error.message || 'Erro desconhecido'}`;
        toast({ title: "Erro", description: errorDescription, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [toast]);

  const handleDelete = async (userId: string, userName: string) => {
    const result = await deleteUserById(userId); 
    if (result.success) {
      toast({
        title: 'Usuário Excluído',
        description: `O usuário "${userName}" foi excluído.`,
      });
      setUsers(prev => prev.filter(u => u.id !== userId));
    } else {
      const errorDescription = result.rawMessage || 'Ocorreu um erro inesperado.';
      toast({
        title: 'Falha na Exclusão',
        description: `Não foi possível excluir "${userName}". Detalhes: ${errorDescription}`,
        variant: 'destructive',
      });
    }
  };
  
  const formatStatus = (status: string | null | undefined) => {
    if (!status) return 'N/A';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="flex items-center text-3xl font-bold text-primary">
          <UserCog className="mr-3 h-8 w-8" /> Gerenciar Usuários
        </h1>
      </div>

      {users.length === 0 && !isLoading ? (
        <p className="text-center text-muted-foreground">Nenhum usuário encontrado.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Suspenso</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={user.is_admin ? 'default' : 'secondary'}
                      className="capitalize"
                    >
                      {user.is_admin ? (
                        <ShieldCheck className="mr-1 h-3 w-3" />
                      ) : (
                        <ShieldAlert className="mr-1 h-3 w-3" />
                      )}
                      {user.is_admin ? 'Admin' : 'Usuário'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.status === 'active'
                          ? 'secondary'
                          : user.status === 'suspended'
                            ? 'destructive'
                            : 'outline'
                      }
                      className="capitalize"
                    >
                      {user.status === 'active' && (
                        <UserCheck className="mr-1 h-3 w-3" />
                      )}
                      {user.status === 'suspended' && (
                        <UserX className="mr-1 h-3 w-3" />
                      )}
                      {formatStatus(user.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.is_suspended ? 'destructive' : 'secondary'}
                      className="capitalize"
                    >
                      {user.is_suspended ? (
                        <UserX className="mr-1 h-3 w-3" />
                      ) : (
                        <UserCheck className="mr-1 h-3 w-3" />
                      )}
                      {user.is_suspended ? 'Sim' : 'Não'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      className="hover:text-primary"
                      aria-label={`Editar usuário ${user.name}`}
                    >
                      <Link href={`/admin/users/${user.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:text-destructive"
                          aria-label={`Excluir usuário ${user.name}`}
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
                            Tem certeza que deseja excluir o usuário "{user.name}" ({user.email})? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(user.id, user.name)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Confirmar Exclusão
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
