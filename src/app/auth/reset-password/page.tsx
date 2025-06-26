
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

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
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { resetPasswordAction } from '@/app/auth/actions';

const resetPasswordFormSchema = z
  .object({
    email: z.string().email({ message: 'Por favor, insira um e-mail válido.' }),
    password: z.string().min(8, { message: 'A senha deve ter pelo menos 8 caracteres.' }),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "As senhas não coincidem.",
    path: ['password_confirmation'],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;

function ResetPasswordForm() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  React.useEffect(() => {
    document.title = 'Redefinir Senha - TableSheet';
  }, []);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: { email: '', password: '', password_confirmation: '' },
    mode: 'onChange',
  });

  if (!token) {
    return (
        <Card className="w-full max-w-md text-center">
            <CardHeader>
                <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
                <CardTitle>Token Inválido</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">O link de redefinição de senha é inválido ou expirou.</p>
            </CardContent>
            <CardFooter>
                 <Button asChild className="w-full">
                    <Link href="/auth/forgot-password">Solicitar Novo Link</Link>
                </Button>
            </CardFooter>
        </Card>
    );
  }

  async function onSubmit(data: ResetPasswordFormValues) {
    setIsSubmitting(true);
    const result = await resetPasswordAction({ token, ...data });

    if(result.success) {
        toast({
            title: 'Senha Redefinida',
            description: result.rawMessage || 'Sua senha foi alterada com sucesso.',
        });
        setIsSubmitted(true);
    } else {
        toast({
            title: 'Falha na Redefinição',
            description: result.rawMessage || 'Não foi possível redefinir sua senha.',
            variant: 'destructive',
        });
        if (result.errors) {
            Object.entries(result.errors).forEach(([key, value]) => {
                form.setError(key as keyof ResetPasswordFormValues, { message: value.join(', ')});
            });
        }
    }
    setIsSubmitting(false);
  }

  if (isSubmitted) {
     return (
        <Card className="w-full max-w-md text-center">
            <CardHeader>
                <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                <CardTitle>Senha Alterada!</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Sua senha foi redefinida. Você já pode fazer login com sua nova senha.</p>
            </CardContent>
            <CardFooter>
                 <Button asChild className="w-full">
                    <Link href="/auth/login">Ir para o Login</Link>
                </Button>
            </CardFooter>
        </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Redefinir Senha</CardTitle>
        <CardDescription>
          Crie uma nova senha para sua conta.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="voce@exemplo.com" {...field} />
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
                  <FormLabel>Nova Senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="password_confirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar Nova Senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Redefinir Senha
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

// Wrap with Suspense because it uses useSearchParams
export default function ResetPasswordPage() {
    return (
        <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-12">
            <Suspense fallback={<Loader2 className="h-12 w-12 animate-spin text-primary" />}>
                <ResetPasswordForm />
            </Suspense>
        </div>
    );
}
