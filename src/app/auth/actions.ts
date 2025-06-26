
'use server';

import { redirect } from 'next/navigation';
import * as z from 'zod';
import { revalidatePath } from 'next/cache';
import { ApiClient, type UserProfile } from '@/lib/apiClient';
import { handleAxiosError, type ProcessedError } from '@/lib/apiErrorHandler';

const serverRegisterFormSchema = z.object({
  name: z.string().min(2),
  username: z.string().trim().min(3),
  email: z.string().email(),
  password: z.string().trim().min(8),
  password_confirmation: z.string().trim(),
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
  token?: string;
  errors?: Record<string, string[]>;
}

export async function loginAction(data: {
  email: string;
  password: string;
}): Promise<AuthActionResponse> {
  const localApiClient = new ApiClient();
  try {
    const responseData = await localApiClient.login(data);
    const { user, token } = responseData.data;

    if (!user || !token) {
      return {
        success: false,
        messageKey: 'general.unexpectedError',
        rawMessage: 'Login falhou: resposta inválida do servidor.',
      };
    }

    return { success: true, user, token, rawMessage: responseData.message };
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

export async function logoutAction(token: string | null): Promise<void> {
  if (token) {
    const localApiClient = new ApiClient(token);
    try {
      await localApiClient.logout();
    } catch (error) {
      // Don't log this as an error, as it's expected if the token is already invalid.
      // The user is being logged out anyway.
    }
  }
  revalidatePath('/', 'layout');
  redirect('/auth/login');
}

export async function registerAction(
  data: RegisterFormValuesForAction
): Promise<AuthActionResponse> {
  const localApiClient = new ApiClient();
  try {
    const result = await localApiClient.register(data);

    return {
      success: true,
      user: result.data,
      rawMessage: result.message,
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
): Promise<{ success: boolean; messageKey?: string; rawMessage?: string }> {
  const localApiClient = new ApiClient();
  try {
    const response = await localApiClient.requestPasswordReset(email);
    return {
      success: true,
      rawMessage: response.message,
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

export async function resendVerificationEmailAction(): Promise<{
  success: boolean;
  rawMessage?: string;
}> {
  const localApiClient = new ApiClient();
  try {
    const response = await localApiClient.resendVerificationEmail();
    return { success: true, rawMessage: response.message };
  } catch (error: unknown) {
    const processedError = handleAxiosError(error);
    return { success: false, rawMessage: processedError.rawMessage };
  }
}

export async function resetPasswordAction(data: {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}): Promise<{
  success: boolean;
  rawMessage?: string;
  errors?: Record<string, string[]>;
}> {
  const localApiClient = new ApiClient();
  try {
    const response = await localApiClient.resetPassword(data);
    return { success: true, rawMessage: response.message };
  } catch (error: unknown) {
    const processedError = handleAxiosError(error);
    return {
      success: false,
      rawMessage: processedError.rawMessage,
      errors: processedError.errors,
    };
  }
}
