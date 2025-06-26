
'use client';

import * as React from 'react';
import { adminGetUser, type UserProfile } from '@/services/userProfile';
import { UserForm } from '../../user-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, UserCog, Loader2 } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/useToast';

export default function EditUserPage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();
  const { toast } = useToast();

  const [user, setUser] = React.useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchUser() {
      if (!userId) return;
      setIsLoading(true);
      try {
        const fetchedUser = await adminGetUser(userId);
        if (fetchedUser) {
          setUser(fetchedUser);
        } else {
          toast({ title: 'Erro', description: 'Usuário não encontrado.', variant: 'destructive' });
          router.replace('/admin/users');
        }
      } catch (error: any) {
        const errorDescription = `Falha ao carregar o usuário: ${error.message || 'Erro inesperado'}`;
        toast({ title: 'Erro', description: errorDescription, variant: 'destructive' });
        router.replace('/admin/users');
      } finally {
        setIsLoading(false);
      }
    }
    fetchUser();
  }, [userId, router, toast]);

  React.useEffect(() => {
    if (user?.name) {
      document.title = `Editar Usuário: ${user.name}`;
    } else if (!isLoading){
      document.title = 'Editar Usuário';
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="outline" size="sm" asChild className="mb-6">
        <Link href="/admin/users">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Usuários
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <UserCog className="h-6 w-6 text-primary" />
            <CardTitle>Editar Usuário: {user.name}</CardTitle>
          </div>
          <CardDescription>
            Editando o perfil para {user.email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm user={user} />
        </CardContent>
      </Card>
    </div>
  );
}
