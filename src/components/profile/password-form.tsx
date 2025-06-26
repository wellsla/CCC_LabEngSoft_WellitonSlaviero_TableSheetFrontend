
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/useToast';
import { updateUserPassword } from '@/services/userProfile';
import { Loader2 } from 'lucide-react';

const passwordFormSchema = z
  .object({
    current_password: z
      .string()
      .min(1, { message: 'A senha atual é obrigatória.' }),
    password: z
      .string()
      .min(8, { message: 'A nova senha deve ter pelo menos 8 caracteres.' }),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'As senhas não coincidem.',
    path: ['password_confirmation'],
  });

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export function PasswordForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      current_password: '',
      password: '',
      password_confirmation: '',
    },
    mode: 'onChange',
  });

  async function onSubmit(data: PasswordFormValues) {
    setIsSubmitting(true);
    try {
      const result = await updateUserPassword(data);
      if (result.success) {
        toast({
          title: 'Senha Alterada',
          description:
            result.rawMessage || 'Sua senha foi atualizada com sucesso.',
        });
        form.reset();
      } else {
        if (result.errors) {
          Object.entries(result.errors).forEach(([key, value]) => {
            form.setError(key as keyof PasswordFormValues, {
              message: value.join(', '),
            });
          });
          toast({
            title: 'Falha na Validação',
            description:
              result.rawMessage || 'Por favor, corrija os erros indicados.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Falha ao Alterar Senha',
            description:
              result.rawMessage ||
              'Verifique sua senha atual e tente novamente.',
            variant: 'destructive',
          });
        }
      }
    } catch (error: any) {
      const errorDescription = `Ocorreu um erro inesperado: ${
        error.message || 'Erro desconhecido'
      }`;
      toast({
        title: 'Erro ao Alterar Senha',
        description: errorDescription,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <FormField
            control={form.control}
            name="current_password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha Atual</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Sua senha atual"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Você precisa fornecer sua senha atual para definir uma nova.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t pt-6">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Alterando Senha...
              </>
            ) : (
              'Alterar Senha'
            )}
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
}
