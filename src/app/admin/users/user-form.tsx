
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/useToast';
import type { UserProfile } from '@/services/userProfile';
import { adminUpdateUser } from '@/services/userProfile';
import { Loader2, ImageIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const userFormSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: 'Mínimo de 2 caracteres.' })
      .max(50, { message: 'Máximo de 50 caracteres.' }),
    username: z
      .string()
      .trim()
      .min(3, { message: 'Mínimo de 3 caracteres.' })
      .optional()
      .or(z.literal('')),
    email: z.string().email({ message: 'Por favor, insira um email válido.' }),
    avatar_url: z
      .string()
      .url({ message: 'Por favor, insira uma URL válida.' })
      .optional()
      .or(z.literal('')),
    birth_date: z
      .string()
      .optional()
      .refine(
        (date) =>
          date === '' || date === undefined || !isNaN(Date.parse(date)),
        {
          message: 'Por favor, insira uma data válida (YYYY-MM-DD).',
        }
      )
      .or(z.literal('')),
    is_admin: z.boolean().default(false),
    is_suspended: z.boolean().default(false),
    password: z
      .string()
      .min(8, { message: 'A senha deve ter pelo menos 8 caracteres.' })
      .optional()
      .or(z.literal('')),
    password_confirmation: z.string().optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      if (data.password && data.password !== data.password_confirmation) {
        return false;
      }
      return true;
    },
    {
      message: 'As senhas não coincidem.',
      path: ['password_confirmation'],
    }
  );

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  user: UserProfile;
}

export function UserForm({ user }: UserFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: user.name || '',
      username: user.username || '',
      email: user.email || '',
      avatar_url: user.avatar_url || '',
      birth_date: user.birth_date ? user.birth_date.split(' ')[0] : '',
      is_admin: user.is_admin || false,
      is_suspended: user.is_suspended || false,
      password: '',
      password_confirmation: '',
    },
    mode: 'onChange',
  });

  const avatarPreview = form.watch('avatar_url');

  async function onSubmit(data: UserFormValues) {
    setIsSubmitting(true);
    try {
      const payload: Partial<UserProfile> = {
        name: data.name,
        username: data.username || undefined,
        email: data.email,
        avatar_url: data.avatar_url || undefined,
        birth_date: data.birth_date || undefined,
        is_admin: data.is_admin,
        is_suspended: data.is_suspended,
      };

      if (data.password) {
        payload.password = data.password;
        payload.password_confirmation = data.password_confirmation;
      }

      const result = await adminUpdateUser(user.id, payload);
      if (result) {
        toast({
          title: 'Usuário Atualizado',
          description: `O perfil de "${result.name}" foi atualizado.`,
        });
        router.push('/admin/users');
        router.refresh();
      } else {
        toast({
          title: 'Falha na Atualização',
          description: 'A operação falhou ou retornou nulo.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Failed to update user:', error);
      const errorDescription = `Ocorreu um erro: ${
        error.message || 'Erro desconhecido'
      }`;
      toast({
        title: 'Erro ao Atualizar',
        description: errorDescription,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="space-y-6 md:col-span-2">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do usuário" {...field} />
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
                      <Input
                        placeholder="username"
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="usuario@exemplo.com"
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
                    <FormLabel>Data de Nascimento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Separator />
            <div>
              <h3 className="text-lg font-medium">Credenciais</h3>
              <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nova Senha</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Deixe em branco para não alterar a senha.
                      </FormDescription>
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
              </div>
            </div>
          </div>

          <div className="md:col-span-1">
            <FormField
              control={form.control}
              name="avatar_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do Avatar</FormLabel>
                  <div className="relative mt-2 flex h-32 w-32 items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/30">
                    {avatarPreview ? (
                      <Image
                        src={avatarPreview}
                        alt="Prévia do avatar"
                        layout="fill"
                        className="object-contain rounded-md p-1"
                      />
                    ) : (
                      <div className="text-center text-muted-foreground p-4">
                        <ImageIcon className="mx-auto h-8 w-8" />
                        <p className="text-xs mt-1">Sem imagem</p>
                      </div>
                    )}
                  </div>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/avatar.png"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Cole a URL de uma imagem para o avatar.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-medium">Permissões e Status</h3>
          <FormDescription className="mt-1">
            Gerencie o acesso e o estado da conta do usuário.
          </FormDescription>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FormField
            control={form.control}
            name="is_admin"
            render={({ field }) => (
              <FormItem className="flex h-full flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Admin</FormLabel>
                  <FormDescription>
                    Concede acesso administrativo.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-label={'Admin'}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="is_suspended"
            render={({ field }) => (
              <FormItem className="flex h-full flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Suspenso</FormLabel>
                  <FormDescription>Bloqueia o acesso do usuário.</FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-label={'Suspenso'}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end border-t pt-6">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Alterações'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
