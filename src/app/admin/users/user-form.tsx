
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
import { Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

// Note: Password field is not included as per specification for edit form.
// Avatar is URL input, not file upload.
const createUserFormSchema = (t: (key: string, params?: Record<string, string|number>) => string) => z.object({
  name: z
    .string()
    .min(2, { message: t('general.minChars', {count: 2}) })
    .max(50, { message: t('general.maxChars', {count: 50}) }),
  username: z.string().trim().min(3, { message: t('general.minChars', {count: 3}) }).optional().or(z.literal('')),
  email: z.string().email({ message: t('general.validEmail') }),
  avatar_url: z // Changed from avatarUrl to match API and UserProfile type
    .string()
    .url({ message: t('general.validUrl') })
    .optional()
    .or(z.literal('')),
  birth_date: z
    .string()
    .optional()
    .refine(date => date === '' || date === undefined || !isNaN(Date.parse(date)), {
        message: t('general.fieldErrorInvalidDate', {format: "YYYY-MM-DD"}),
    })
    .or(z.literal('')),
  is_admin: z.boolean().default(false),
  is_suspended: z.boolean().default(false),
  status: z.enum(['active', 'pending', 'suspended', '']).default('active'), // Added empty string for optional behavior
});

type UserFormValues = z.infer<ReturnType<typeof createUserFormSchema>>;

interface UserFormProps {
  user: UserProfile;
}

export function UserForm({ user }: UserFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { t } = useTranslation();

  const userFormSchema = React.useMemo(() => createUserFormSchema(t), [t]);

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
      status: (user.status as 'active' | 'pending' | 'suspended' | '') || 'active',
    },
    mode: 'onChange',
  });

  async function onSubmit(data: UserFormValues) {
    setIsSubmitting(true);
    try {
      // Ensure empty strings for optional fields become undefined for the API
      const payload: Partial<UserProfile> = {
        name: data.name,
        username: data.username || undefined,
        email: data.email, // Email is typically not updatable by admin this way, but following spec
        avatar_url: data.avatar_url || undefined,
        birth_date: data.birth_date || undefined,
        is_admin: data.is_admin,
        is_suspended: data.is_suspended,
        status: data.status || undefined,
      };

      const result = await updateUserById(user.id, payload);
      if (result) { // updateUserById returns UserProfile | null
        toast({
          title: t('userForm.toastUpdateSuccessTitle'),
          description: t('userForm.toastUpdateSuccessDescription', {name: result.name}),
        });
        router.push('/admin/users');
        router.refresh();
      } else {
        // This case might not be hit if updateUserById throws on major failure
        toast({
          title: t('userForm.toastUpdateFailTitle'),
          description: t('userForm.toastUpdateFailDescription', {details: 'Operation returned null or failed.'}),
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Failed to update user:', error);
      const errorDescription = t('userForm.toastErrorDescription', { details: error.message || 'Unknown error' });
      toast({
        title: t('userForm.toastErrorTitle'),
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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('userForm.nameLabel')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('userForm.namePlaceholder')} {...field} />
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
                <FormLabel>{t('userForm.usernameLabel')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('userForm.usernamePlaceholder')} {...field} value={field.value ?? ''}/>
                </FormControl>
                 <FormDescription>{t('userForm.usernameDescription')}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('userForm.emailLabel')}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t('userForm.emailPlaceholder')}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  {t('userForm.emailDescription')}
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
                <FormLabel>{t('userForm.birthDateLabel')}</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="avatar_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('userForm.avatarUrlLabel')}</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder={t('userForm.avatarUrlPlaceholder')}
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormDescription>{t('userForm.avatarUrlHint')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />


        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-3">
          <FormField
            control={form.control}
            name="is_admin"
            render={({ field }) => (
              <FormItem className="col-span-1 flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>{t('userForm.isAdminLabel')}</FormLabel>
                  <FormDescription>
                    {t('userForm.isAdminDescription')}
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-label={t('userForm.isAdminLabel')}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="is_suspended"
            render={({ field }) => (
              <FormItem className="col-span-1 flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>{t('userForm.isSuspendedLabel')}</FormLabel>
                  <FormDescription>
                    {t('userForm.isSuspendedDescription')}
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-label={t('userForm.isSuspendedLabel')}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>{t('userForm.statusLabel')}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || 'active'}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('userForm.statusPlaceholder')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">{t('userForm.statusActive')}</SelectItem>
                    <SelectItem value="pending">{t('userForm.statusPending')}</SelectItem>
                    <SelectItem value="suspended">{t('userForm.statusSuspended')}</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  {t('userForm.statusDescription')}
                </FormDescription>
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
                {t('userForm.savingButton')}
              </>
            ) : (
              t('userForm.saveButton')
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

