
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
import { Loader2 } from 'lucide-react';
import { requestPasswordResetAction } from '@/app/auth/actions';

const forgotPasswordFormSchema = z.object({
  email: z.string().email({
    message: 'Por favor, insira um endereço de e-mail válido.',
  }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>;

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  React.useEffect(() => {
    document.title = 'Esqueci Minha Senha - TableSheet';
  }, []);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: {
      email: '',
    },
    mode: 'onChange',
  });

  async function onSubmit(data: ForgotPasswordFormValues) {
    setIsSubmitting(true);
    try {
      const result = await requestPasswordResetAction(data.email);
      if (result.success) {
        toast({
          title: 'Solicitação de Redefinição de Senha Enviada',
          description: 'Se existir uma conta para este e-mail, um link de redefinição foi enviado.',
        });
        setIsSubmitted(true);
      } else {
        const errorDescription = result.rawMessage || 'Não foi possível enviar o link de redefinição.';
        toast({
          title: 'Falha na Solicitação',
          description: errorDescription,
          variant: 'destructive',
        });
      }
    } catch (error) {
      const displayMessage = `Ocorreu um erro inesperado: ${(error as Error).message || 'Erro desconhecido'}`;
      toast({
        title: 'Falha na Solicitação',
        description: displayMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Esqueci Minha Senha</CardTitle>
          <CardDescription>
            {isSubmitted
              ? 'Verifique seu e-mail para instruções de como redefinir sua senha.'
              : 'Digite seu endereço de e-mail e enviaremos instruções para redefinir sua senha.'}
          </CardDescription>
        </CardHeader>
        {!isSubmitted ? (
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
                      Enviando...
                    </>
                  ) : (
                    'Enviar Instruções de Redefinição'
                  )}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Lembrou sua senha?{' '}
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
        ) : (
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/auth/login">Voltar para o Login</Link>
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
