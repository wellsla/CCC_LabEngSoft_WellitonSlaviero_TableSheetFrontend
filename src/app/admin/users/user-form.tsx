
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile } from '@/services/userProfile';
import { updateUserById } from '@/services/userProfile';
import { Loader2, ImageIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const userFormSchema = z.object({
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
  avatar_url: z.string().optional().or(z.literal('')),
  birth_date: z
    .string()
    .optional()
    .refine(
      (date) => date === '' || date === undefined || !isNaN(Date.parse(date)),
      {
        message: 'Por favor, insira uma data válida (YYYY-MM-DD).',
      }
    )
    .or(z.literal('')),
  is_admin: z.boolean().default(false),
  is_suspended: z.boolean().default(false),
  status: z.enum(['active', 'pending', 'suspended']).optional(),
});

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
      birth_date: user.birth_date || '',
      is_admin: user.is_admin || false,
      is_suspended: user.is_suspended || false,
      status: (user.status as 'active' | 'pending' | 'suspended') || undefined,
    },
    mode: 'onChange',
  });

  const avatarPreview = form.watch('avatar_url');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Tipo de arquivo inválido',
          description: 'Por favor, selecione um arquivo de imagem.',
          variant: 'destructive',
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        form.setValue('avatar_url', dataUrl, {
          shouldValidate: true,
          shouldDirty: true,
        });
      };
      reader.readAsDataURL(file);
    }
  };

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
        status: data.status || undefined,
      };

      const result = await updateUserById(user.id, payload);
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
          </div>

          <div className="md:col-span-1">
            <FormField
              control={form.control}
              name="avatar_url"
              render={() => (
                <FormItem>
                  <FormLabel>Avatar</FormLabel>
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
                    <FormControl>
                      <Input
                        id="avatar-upload"
                        type="file"
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleFileChange}
                      />
                    </FormControl>
                  </div>
                  <FormDescription>
                    Clique na área para enviar uma imagem.
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
                    <FormDescription>
                        Bloqueia o acesso do usuário.
                    </FormDescription>
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
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={'Selecione um status'} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="suspended">Suspenso</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Status da conta.</FormDescription>
                  <FormMessage />
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
