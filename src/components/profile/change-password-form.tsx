
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

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
import { CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  changePassword,
  type ChangePasswordData,
} from '@/services/userProfile';
import { Loader2 } from 'lucide-react';

const changePasswordFormSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: 'Este campo é obrigatório.' }),
    newPassword: z.string().min(8, {
      message: 'Deve ter pelo menos 8 caracteres.',
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>;

export function ChangePasswordForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  async function onSubmit(data: ChangePasswordFormValues) {
    setIsSubmitting(true);
    try {
      const payload: ChangePasswordData = {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      };
      const result = await changePassword(payload);

      if (result.success) {
        toast({
          title: 'Senha Alterada',
          description: 'Sua senha foi atualizada com sucesso.',
        });
        form.reset(); 
      } else {
        const errorDescription = result.rawMessage || 'Não foi possível atualizar a senha.';
        toast({
          title: 'Falha ao Alterar Senha',
          description: errorDescription,
          variant: 'destructive',
        });
        if (result.rawMessage?.toLowerCase().includes('current password') || result.rawMessage?.toLowerCase().includes('senha atual')) {
          form.setError('currentPassword', { message: errorDescription });
        } else {
          form.setError('root', { message: errorDescription });
        }
        form.resetField('currentPassword');
        form.resetField('newPassword');
        form.resetField('confirmPassword');
      }
    } catch (error) {
      console.error('Failed to change password:', error);
      const errorDescription = `Ocorreu um erro inesperado: ${(error as Error).message || 'Erro desconhecido'}`;
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
          {form.formState.errors.root && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.root.message}
            </p>
          )}
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha Atual</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="newPassword"
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
            name="confirmPassword"
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
        <CardFooter className="flex justify-end border-t pt-6">
          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isDirty}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Atualizando...
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
