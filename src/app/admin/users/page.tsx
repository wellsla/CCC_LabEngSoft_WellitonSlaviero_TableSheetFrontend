
'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  UserCheck,
  UserX,
  ShieldCheck,
  ShieldAlert,
  UserCog,
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
import { Button } from '@/components/ui/button';
import { UserTableActions } from './user-table-actions';
import type { UserProfile } from '@/lib/apiClient';
import { adminGetAllUsers } from '@/services/userProfile';
import { useToast } from '@/hooks/useToast';
import Loading from './loading';

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();

  const [currentPage, setCurrentPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const fetchUsers = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const userList = await adminGetAllUsers();
      setUsers(userList);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar usuários',
        description: error.message || 'Não foi possível buscar a lista de usuários.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const formatStatus = (user: UserProfile) => {
    if (user.is_suspended) return 'Suspenso';
    if (user.email_verified_at) return 'Ativo';
    return 'Pendente';
  };

  const getStatusVariant = (user: UserProfile): "secondary" | "destructive" | "outline" => {
    if (user.is_suspended) return 'destructive';
    if (user.email_verified_at) return 'secondary';
    return 'outline';
  }

  const totalPages = Math.ceil(users.length / rowsPerPage);
  const paginatedUsers = users.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );


  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="flex items-center text-3xl font-bold text-primary">
          <UserCog className="mr-3 h-8 w-8" /> Gerenciar Usuários
        </h1>
      </div>

      {users.length === 0 ? (
        <p className="text-center text-muted-foreground">Nenhum usuário encontrado.</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((user) => (
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
                        variant={getStatusVariant(user)}
                        className="capitalize"
                      >
                        {user.is_suspended || !user.email_verified_at ? (
                          <UserX className="mr-1 h-3 w-3" />
                        ) : (
                          <UserCheck className="mr-1 h-3 w-3" />
                        )}
                        {formatStatus(user)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <UserTableActions userId={user.id} userName={user.name} userEmail={user.email} onActionSuccess={fetchUsers} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Total de {users.length} usuários.
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
