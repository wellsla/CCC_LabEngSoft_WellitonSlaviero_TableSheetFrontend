
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
import { useToast } from '@/hooks/useToast';
import { Loader2, ShieldAlert } from 'lucide-react';
import {
  loginAction,
  resendVerificationEmailAction,
  type AuthActionResponse,
} from '@/app/auth/actions';
import { FullPageLoader } from '@/components/layout/FullPageLoader';
import { useAuth } from '@/hooks/useAuth';

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
  const { login } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isProcessingLogin, setIsProcessingLogin] = React.useState(false);
  const [needsVerification, setNeedsVerification] = React.useState(false);
  const [isResending, setIsResending] = React.useState(false);

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

  const handleResendVerification = async () => {
    setIsResending(true);
    const result = await resendVerificationEmailAction();
    toast({
      title: result.success ? 'E-mail Enviado' : 'Falha no Envio',
      description: result.rawMessage,
      variant: result.success ? 'default' : 'destructive',
    });
    setIsResending(false);
  };

  async function onSubmit(data: LoginFormValues) {
    setIsSubmitting(true);
    setIsProcessingLogin(true);
    setNeedsVerification(false);
    try {
      const result: AuthActionResponse = await loginAction(data);

      if (result.success && result.user && result.token) {
        toast({
          title: result.rawMessage || 'Login Bem-sucedido',
          description: `Bem-vindo(a) de volta, ${result.user.name}!`,
        });

        await login(result.token);

        const redirectPath = result.user.is_admin
          ? '/admin/games'
          : '/characters';
        window.location.assign(redirectPath);
      } else {
        setIsProcessingLogin(false);
        const errorDescription = result.rawMessage || 'Não foi possível fazer login. Tente novamente.';

        if (result.messageKey === 'auth.emailNotVerified') {
          setNeedsVerification(true);
        } else {
          toast({
            title: 'Falha no Login',
            description: errorDescription,
            variant: 'destructive',
          });
          form.setError('root', { message: errorDescription });
        }
        form.resetField('password');
      }
    } catch (error: any) {
      setIsProcessingLogin(false);
      const displayMessage = `Ocorreu um erro inesperado. Detalhes: ${error.message || 'Erro inesperado'}`;
      toast({
        title: 'Falha no Login',
        description: displayMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {isProcessingLogin && <FullPageLoader />}
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
                {form.formState.errors.root && !needsVerification && (
                  <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.root.message}
                  </p>
                )}
                {needsVerification && (
                  <div className="rounded-md border border-yellow-300 bg-yellow-50 p-4 dark:border-yellow-700 dark:bg-yellow-950">
                    <div className="flex items-start gap-3">
                      <ShieldAlert className="h-5 w-5 flex-shrink-0 text-yellow-500" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-yellow-800 dark:text-yellow-300">
                          Verificação de E-mail Necessária
                        </h3>
                        <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-400">
                          Sua conta precisa ser verificada. Por favor, verifique
                          sua caixa de entrada.
                        </p>
                        <Button
                          type="button"
                          variant="link"
                          className="h-auto p-0 text-sm text-yellow-800 dark:text-yellow-300"
                          onClick={handleResendVerification}
                          disabled={isResending}
                        >
                          {isResending
                            ? 'Reenviando...'
                            : 'Reenviar e-mail de verificação'}
                        </Button>
                      </div>
                    </div>
                  </div>
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
    </>
  );
}
