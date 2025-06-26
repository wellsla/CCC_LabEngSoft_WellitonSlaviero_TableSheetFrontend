
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ProfileForm } from '@/components/profile/profile-form';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { UserCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { PasswordForm } from '@/components/profile/password-form';

function ProfilePageSkeleton() {
  return (
    <div className="container mx-auto animate-pulse px-4 py-8">
      <div className="mb-8 flex items-center gap-3">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-9 w-48" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-56" />
          <Skeleton className="mt-2 h-4 w-full max-w-lg" />
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="w-full space-y-2 sm:w-auto">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t pt-6">
          <Skeleton className="h-10 w-32" />
        </CardFooter>
      </Card>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  React.useEffect(() => {
    document.title = 'Meu Perfil - TableSheet';
  }, []);

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login?message=Please+login+to+view+your+profile');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return <ProfilePageSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center gap-3">
        <UserCircle2 className="h-10 w-10 text-primary" />
        <h1 className="text-3xl font-bold text-primary">Meu Perfil</h1>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="info">Informações do Perfil</TabsTrigger>
          <TabsTrigger value="password">Alterar Senha</TabsTrigger>
        </TabsList>
        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Perfil</CardTitle>
              <CardDescription>
                Atualize seus dados pessoais e avatar aqui. Clique em salvar
                quando terminar.
              </CardDescription>
            </CardHeader>
            <ProfileForm user={user} />
          </Card>
        </TabsContent>
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Alterar Senha</CardTitle>
              <CardDescription>
                Para sua segurança, forneça sua senha atual para definir uma
                nova.
              </CardDescription>
            </CardHeader>
            <PasswordForm />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
