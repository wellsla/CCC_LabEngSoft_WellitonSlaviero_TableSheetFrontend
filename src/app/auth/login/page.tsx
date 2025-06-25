
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { loginAction, type AuthActionResponse } from '@/app/auth/actions';

const loginFormSchema = z.object({
  email: z.string().email({
    message: 'Por favor, insira um endereço de e-mail válido.',
  }),
  password: z.string().min(1, {
    message: 'A senha é obrigatória.',
  }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    document.title = 'Login - TableSheet';
  }, []);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onChange',
  });

  async function onSubmit(data: LoginFormValues) {
    setIsSubmitting(true);
    try {
      const result: AuthActionResponse = await loginAction(data);

      if (result.success && result.user && result.token) {
        toast({
          title: 'Login Bem-sucedido',
          description: `Bem-vindo(a) de volta, ${result.user.name}!`,
        });
        localStorage.setItem('authToken', result.token);
        localStorage.setItem('sessionUserData', JSON.stringify(result.user));

        const redirectPath = result.user.is_admin
          ? '/admin/games'
          : '/characters';
        window.location.assign(redirectPath); 
      } else {
        const errorDescription = result.rawMessage || `Não foi possível fazer login. Tente novamente.`;
        toast({
          title: 'Falha no Login',
          description: errorDescription,
          variant: 'destructive',
        });
        form.setError('root', { message: errorDescription });
        form.resetField('password');
        setIsSubmitting(false);
      }
    } catch (error: any) {
      console.error('Login error on client:', error);
      const displayMessage = `Ocorreu um erro inesperado. Detalhes: ${error.message || 'Erro desconhecido'}`;
      toast({
        title: 'Falha no Login',
        description: displayMessage,
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Entre com suas credenciais para acessar sua conta TableSheet.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {form.formState.errors.root && (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.root.message}
                </p>
              )}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="voce@exemplo.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="text-right text-sm">
                <Link
                  href="/auth/forgot-password"
                  className="underline hover:text-primary"
                >
                  Esqueceu a senha?
                </Link>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Não tem uma conta?{' '}
                <Link
                  href="/auth/register"
                  className="underline hover:text-primary"
                >
                  Cadastre-se
                </Link>
              </p>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
