
'use client'; 

import * as React from 'react';
import { getUserProfile, type UserProfile } from '@/services/userProfile'; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileForm } from '@/components/profile/profile-form';
import { ChangePasswordForm } from '@/components/profile/change-password-form';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { UserCircle2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = React.useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    document.title = 'Meu Perfil - TableSheet';
  }, []);

  React.useEffect(() => {
    const currentUser = getUserProfile(); 
    if (!currentUser) {
      router.push('/auth/login?message=Please+login+to+view+your+profile');
    } else {
      setUser(currentUser);
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-8">
        <p>Redirecionando para o login...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center gap-3">
        <UserCircle2 className="h-10 w-10 text-primary" />
        <h1 className="text-3xl font-bold text-primary">Meu Perfil</h1>
      </div>

      <Tabs defaultValue="edit-profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="edit-profile">Editar Perfil</TabsTrigger>
          <TabsTrigger value="change-password">Alterar Senha</TabsTrigger>
        </TabsList>
        <TabsContent value="edit-profile">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Perfil</CardTitle>
              <CardDescription>
                Atualize seus dados pessoais aqui.
              </CardDescription>
            </CardHeader>
            <ProfileForm user={user} /> 
          </Card>
        </TabsContent>
        <TabsContent value="change-password">
          <Card>
            <CardHeader>
              <CardTitle>Alterar Senha</CardTitle>
              <CardDescription>Atualize a senha da sua conta.</CardDescription>
            </CardHeader>
            <ChangePasswordForm />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
