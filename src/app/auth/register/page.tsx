
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
import {
  registerAction,
  type RegisterFormValuesForAction,
  type AuthActionResponse,
} from '@/app/auth/actions';

const registerFormSchema = z
  .object({
    name: z.string().min(2, {
      message: 'Deve ter pelo menos 2 caracteres.',
    }),
    username: z
      .string()
      .trim()
      .min(3, {
        message: 'Deve ter pelo menos 3 caracteres.',
      }),
    email: z.string().email({
      message: 'Por favor, insira um endereço de e-mail válido.',
    }),
    password: z
      .string()
      .trim()
      .min(8, {
        message: 'Deve ter pelo menos 8 caracteres.',
      }),
    confirmPassword: z.string().trim(),
    birth_date: z
      .string()
      .optional()
      .refine(
        (date) =>
          date === undefined || date === '' || !isNaN(Date.parse(date)),
        {
          message: 'Por favor, insira uma data válida.',
        }
      )
      .or(z.literal('')),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export default function RegisterPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    document.title = 'Criar Conta - TableSheet';
  }, []);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      birth_date: '',
    },
    mode: 'onChange',
  });

  async function onSubmit(data: RegisterFormValues) {
    setIsSubmitting(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...registrationData } = data;

      const payload: RegisterFormValuesForAction = {
        ...registrationData,
        birth_date: registrationData.birth_date || undefined,
      };
      const result: AuthActionResponse = await registerAction(payload);

      if (result.success && result.user) {
        toast({
          title: 'Cadastro Bem-sucedido',
          description: `Bem-vindo(a), ${result.user.name}! Você agora está logado(a).`,
        });
        
        // MOCK AUTH: Store user type and data
        localStorage.setItem('mockUserType', result.user.is_admin ? 'admin' : 'player');
        localStorage.setItem('sessionUserData', JSON.stringify(result.user));

        const redirectPath = result.user.is_admin
          ? '/admin/games'
          : '/characters';
        window.location.assign(redirectPath);

      } else if (result.success && result.rawMessage) { // Registration OK, auto-login failed
        toast({
          title: 'Cadastro Bem-sucedido',
          description: result.rawMessage,
        });
        window.location.assign('/auth/login');
        setIsSubmitting(false);
      } else { // Registration failed
        const errorDescription = result.rawMessage || 'Não foi possível realizar o cadastro.';
        toast({
          title: 'Falha no Cadastro',
          description: errorDescription,
          variant: 'destructive',
        });
        if (result.errors) {
          Object.entries(result.errors).forEach(([key, value]) => {
            form.setError(key as keyof RegisterFormValues, {
              message: value.join(', '),
            });
          });
        } else {
           if (result.rawMessage?.toLowerCase().includes('email')) {
            form.setError('email', { message: errorDescription });
          } else if (result.rawMessage?.toLowerCase().includes('username')) {
            form.setError('username', { message: errorDescription });
          } else {
            form.setError('root', { message: errorDescription });
          }
        }
        setIsSubmitting(false);
      }
    } catch (error: any) {
      console.error('Registration error on client:', error);
      const displayMessage = `Ocorreu um erro inesperado. Detalhes: ${error.message || 'Erro desconhecido'}`;
      toast({
        title: 'Falha no Cadastro',
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
          <CardTitle className="text-2xl">Criar Conta</CardTitle>
          <CardDescription>
            Cadastre-se no TableSheet para gerenciar suas aventuras de RPG de mesa.
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu Nome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome de Usuário</FormLabel>
                    <FormControl>
                      <Input placeholder="Escolha um nome de usuário" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                name="birth_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Nascimento (Opcional)</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={field.value ?? ''}
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
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Senha</FormLabel>
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
                    Criando Conta...
                  </>
                ) : (
                  'Cadastrar'
                )}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Já tem uma conta?{' '}
                <Link
                  href="/auth/login"
                  className="underline hover:text-primary"
                >
                  Entrar
                </Link>
              </p>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
