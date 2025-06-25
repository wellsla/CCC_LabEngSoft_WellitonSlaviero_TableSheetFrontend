
'use server';

import { cookies } from 'next/headers'; // Standardized import
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
  token?: string;
  errors?: Record<string, string[]>;
}

export async function loginAction(data: {
  email: string;
  password: string;
}): Promise<AuthActionResponse> {
  console.log('[LoginAction] Attempting API login for email:', data.email);
  try {
    const responseData = await loginApi(data);
    const { user: userFromApi, token } = responseData;

    if (!userFromApi || !token) {
      console.error(
        '[LoginAction] Invalid response structure from API login. User or token missing.'
      );
      return {
        success: false,
        messageKey: 'general.unexpectedError',
        rawMessage: 'Login failed: Invalid response from server.',
      };
    }
    console.log(
      '[LoginAction] API login successful. Returning user and token to client.'
    );

    revalidatePath('/', 'layout');
    revalidatePath('/characters', 'page');
    revalidatePath('/profile', 'page');
    revalidatePath('/admin', 'layout');

    return { success: true, user: userFromApi, token };
  } catch (error: any) {
    console.error('[LoginAction] Raw error during API login:', error);
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
  const cookieStore = cookies();
  const authToken = cookieStore.get('authToken')?.value;
  let redirectPath = '/auth/login';

  if (authToken) {
    try {
      console.log('[LogoutAction] Attempting API logout...');
      await logoutApi(authToken);
      console.log('[LogoutAction] API Logout request sent successfully.');
    } catch (error: unknown) {
      console.error(
        '[LogoutAction] Error during API logout request (proceeding with cookie deletion):',
        error
      );
    }
  } else {
    console.log(
      '[LogoutAction] No authToken (cookie) found for API logout call.'
    );
  }

  if (cookieStore.get('authToken')) cookieStore.delete('authToken');
  if (cookieStore.get('sessionUserData'))
    cookieStore.delete('sessionUserData');
  console.log('[LogoutAction] Old session cookies (if any) deleted.');

  revalidatePath('/', 'layout');
  revalidatePath('/admin', 'layout');
  revalidatePath('/characters', 'page');
  revalidatePath('/profile', 'page');
  revalidatePath('/games', 'page');
  console.log('[LogoutAction] Paths revalidated.');

  redirect(redirectPath);
}

export async function registerAction(
  data: RegisterFormValuesForAction
): Promise<AuthActionResponse> {
  console.log('[RegisterAction] Attempting API registration for:', data.email);
  try {
    const payloadForApi = {
      ...data,
      password_confirmation: data.password,
      birth_date: data.birth_date || undefined,
    };
    await registerApi(payloadForApi);
    console.log(
      '[RegisterAction] Registration successful via API for:',
      data.email
    );

    console.log(
      '[RegisterAction] Attempting auto-login for:',
      data.email,
      'after registration.'
    );
    try {
      const loginData = { email: data.email, password: data.password };
      const loginResponse = await loginApi(loginData);
      const { user: userFromLogin, token: tokenFromLogin } = loginResponse;

      if (!userFromLogin || !tokenFromLogin) {
        console.error(
          '[RegisterAction] Invalid response structure from auto-login API call.'
        );
        return {
          success: true,
          messageKey: 'auth.register.failToastDescription', // Use a key indicating registration ok, login fail
          rawMessage: 'Registration successful, but auto-login failed. Please log in manually.',
        };
      }
      console.log(
        '[RegisterAction] Auto-login API call successful. Returning user and token.'
      );
      revalidatePath('/', 'layout');
      revalidatePath('/characters', 'page');
      revalidatePath('/profile', 'page');

      return { success: true, user: userFromLogin, token: tokenFromLogin };
    } catch (loginError: any) {
      console.error(
        '[RegisterAction] Error during auto-login attempt:',
        loginError
      );
      const processedLoginError = handleAxiosError(loginError);
      return {
        success: true, // Registration was successful
        messageKey: 'auth.register.failToastDescription',
        rawMessage: `Registration successful. Auto-login failed: ${processedLoginError.rawMessage || 'Please try logging in manually.'}`,
      };
    }
  } catch (error: any) {
    console.error('[RegisterAction] Raw error during API registration:', error);
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
  console.log(
    '[RequestPasswordResetAction] Requesting password reset for:',
    email
  );
  try {
    await requestPasswordResetApi(email);
    return {
      success: true,
      messageKey: 'auth.forgotPassword.successToastDescription', // This is a specific success message
    };
  } catch (error: unknown) {
    console.error(
      '[RequestPasswordResetAction] Raw error during password reset request:',
      error
    );
    const processedError = handleAxiosError(error);
    return {
      success: false,
      messageKey: processedError.messageKey,
      rawMessage: processedError.rawMessage,
    };
  }
}
