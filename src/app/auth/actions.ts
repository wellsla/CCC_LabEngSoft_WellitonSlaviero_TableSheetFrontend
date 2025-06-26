
'use server';

import { redirect } from 'next/navigation';
import * as z from 'zod';
import { revalidatePath } from 'next/cache';
import type { UserProfile } from '@/services/userProfile';
import {
  registerApi,
  loginApi,
  logoutApi,
  requestPasswordResetApi,
  handleAxiosError,
  type ProcessedError,
} from '@/lib/apiClient';

const serverRegisterFormSchema = z.object({
  name: z.string().min(2),
  username: z.string().trim().min(3),
  email: z.string().email(),
  password: z.string().trim().min(8),
  birth_date: z.string().trim().optional().or(z.literal('')),
});

export type RegisterFormValuesForAction = z.infer<
  typeof serverRegisterFormSchema
>;

// This type is for what the client-side form expects to receive
export interface AuthActionResponse {
  success: boolean;
  messageKey?: string;
  rawMessage?: string;
  user?: UserProfile;
  // Token is no longer sent to the client in the mock setup
}

export async function loginAction(data: {
  email: string;
  password: string;
}): Promise<AuthActionResponse> {
  console.log('[LoginAction Mock] Attempting mock login for:', data.email);
  try {
    // This now calls the mockApiClient's loginApi
    const responseData = await loginApi(data);
    const { user: userFromApi } = responseData;

    if (!userFromApi) {
      return {
        success: false,
        messageKey: 'general.unexpectedError',
        rawMessage: 'Login falhou: resposta inválida do servidor mock.',
      };
    }
    
    // The "token" from the mock API just tells us the user type.
    // We pass the full user object to the client to store.
    return { success: true, user: userFromApi };
  } catch (error: any) {
    console.error('[LoginAction Mock] Raw error during mock login:', error);
    const processedError: ProcessedError = handleAxiosError(error);
    return {
      success: false,
      messageKey: processedError.messageKey,
      rawMessage: processedError.rawMessage,
      errors: processedError.errors,
    };
  }
}

export async function logoutAction(): Promise<void> {
  // With mock, we don't need to call an API. The client will clear localStorage.
  // This server action's main job is now just to handle the redirect.
  console.log('[LogoutAction Mock] Logging out and redirecting.');
  revalidatePath('/', 'layout');
  redirect('/auth/login');
}

export async function registerAction(
  data: RegisterFormValuesForAction
): Promise<AuthActionResponse> {
  console.log('[RegisterAction Mock] Attempting mock registration for:', data.email);
  try {
    await registerApi({ ...data, password_confirmation: data.password });
    
    // Auto-login after registration
    const loginResponse = await loginApi({ email: data.email, password: data.password });

    if (loginResponse.user) {
        return { success: true, user: loginResponse.user };
    }
    
    return {
      success: true, // Registration was ok
      messageKey: 'auth.register.failToastDescription',
      rawMessage: 'Cadastro bem-sucedido, mas o login automático falhou. Por favor, entre manualmente.',
    };

  } catch (error: any) {
    const processedError: ProcessedError = handleAxiosError(error);
    return {
      success: false,
      messageKey: processedError.messageKey,
      rawMessage: processedError.rawMessage,
      errors: processedError.errors,
    };
  }
}

export async function requestPasswordResetAction(
  email: string
): Promise<{ success: boolean; messageKey?: string, rawMessage?: string }> {
  try {
    await requestPasswordResetApi(email);
    return {
      success: true,
      messageKey: 'auth.forgotPassword.successToastDescription',
    };
  } catch (error: unknown) {
    const processedError = handleAxiosError(error);
    return {
      success: false,
      messageKey: processedError.messageKey,
      rawMessage: processedError.rawMessage,
    };
  }
}
