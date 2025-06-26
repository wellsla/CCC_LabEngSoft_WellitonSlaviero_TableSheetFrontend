'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter } from 'next/navigation';

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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile, UpdateProfileData } from '@/services/userProfile';
import { updateUserProfile } from '@/services/userProfile';
import { Loader2, User } from 'lucide-react';

const profileFormSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: 'Deve ter pelo menos 2 caracteres.',
    })
    .max(50, { message: 'Não pode exceder 50 caracteres.' }),
  email: z.string().email({
    message: 'Por favor, insira um endereço de e-mail válido.',
  }),
  avatar_url: z.string().optional(),
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
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  user: UserProfile;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user.name || '',
      email: user.email || '',
      avatar_url: user.avatar_url || '',
      birth_date: user.birth_date || '',
    },
    mode: 'onChange',
  });

  const currentAvatarUrl = form.watch('avatar_url');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        form.setValue('avatar_url', dataUrl, { shouldValidate: true, shouldDirty: true });
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(data: ProfileFormValues) {
    setIsSubmitting(true);
    try {
      const payload: UpdateProfileData = {
        name: data.name,
        email: data.email,
        avatar_url: data.avatar_url || undefined,
        birth_date: data.birth_date || undefined,
      };

      const result = await updateUserProfile(payload);

      if (result.success && result.user) {
        toast({
          title: 'Perfil Atualizado',
          description: 'Suas informações de perfil foram atualizadas com sucesso.',
        });
        form.reset({
            name: result.user.name || '',
            email: result.user.email || '',
            avatar_url: result.user.avatar_url || '',
            birth_date: result.user.birth_date || '',
        });
        router.refresh();
      } else {
        const errorDescription = result.rawMessage || 'Não foi possível atualizar o perfil.';
        toast({
          title: 'Falha na Atualização',
          description: errorDescription,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      const errorDescription = `Ocorreu um erro inesperado: ${error.message || 'Erro desconhecido'}`;
      toast({
        title: 'Erro ao Atualizar Perfil',
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
        <CardContent className="space-y-8">
          <FormField
            control={form.control}
            name="avatar_url"
            render={() => (
              <FormItem className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
                <div className="relative">
                  <Avatar className="h-24 w-24 rounded-full ring-2 ring-primary ring-offset-2 ring-offset-background">
                    <AvatarImage
                      src={currentAvatarUrl ?? undefined}
                      alt={user.name ?? 'User Avatar'}
                      data-ai-hint={user.dataAiHint || 'user avatar'}
                    />
                    <AvatarFallback>
                      <User className="h-12 w-12" />
                    </AvatarFallback>
                  </Avatar>
                  <FormControl>
                    <Input
                      type="file"
                      className="absolute inset-0 h-full w-full cursor-pointer rounded-full opacity-0"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleFileChange}
                    />
                  </FormControl>
                </div>
                <div className="text-center sm:text-left">
                  <FormLabel>Avatar</FormLabel>
                  <FormDescription>
                    Clique na imagem para selecionar um novo avatar.
                  </FormDescription>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Seu Nome" {...field} />
                </FormControl>
                <FormDescription>
                  Este é o seu nome de exibição público.
                </FormDescription>
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
                <FormDescription>
                  Seu endereço de e-mail de login.
                </FormDescription>
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
        </CardContent>
        <CardFooter className="flex justify-end border-t pt-6">
          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isDirty}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Alterações'
            )}
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
}
