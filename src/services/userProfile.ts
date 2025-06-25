
'use client';

import {
  updateUserProfileApi,
  changePasswordApi,
  handleAxiosError,
  getMeApi,
  adminGetAllUsersApi,
  adminGetUserDetailsByIdApi,
  adminUpdateUserByIdApi,
  adminDeleteUserByIdApi,
  API_BASE_URL,
  type ProcessedError,
} from '@/lib/apiClient';
import type { AxiosError } from 'axios';

export interface UserProfile {
  id: string;
  username?: string | null;
  name: string;
  email: string;
  avatar_url?: string | null;
  is_admin?: boolean | null;
  birth_date?: string | null;
  is_suspended?: boolean | null;
  status?: 'active' | 'pending' | 'suspended' | string | null;
  created_at?: string;
  updated_at?: string;
  dataAiHint?: string;
}

export interface UpdateProfileData {
  name?: string;
  avatar_url?: string;
  birth_date?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

interface ServiceResponse {
  success: boolean;
  messageKey?: string;
  rawMessage?: string;
  errors?: Record<string, string[]>;
}

interface UserProfileResponse extends ServiceResponse {
  user?: UserProfile;
}

export function getAuthTokenFromLocalStorage(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem('authToken');
}

export function getUserProfile(): UserProfile | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const token = localStorage.getItem('authToken');
    const userDataString = localStorage.getItem('sessionUserData');

    if (!token || !userDataString) {
      return null;
    }
    const userData = JSON.parse(userDataString) as UserProfile;
    return userData;
  } catch (error) {
    console.error(
      '[getUserProfile Client-Side] Error reading from localStorage:',
      error
    );
    localStorage.removeItem('authToken');
    localStorage.removeItem('sessionUserData');
    return null;
  }
}

export async function verifyAndFetchUserProfile(): Promise<UserProfile | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  const token = localStorage.getItem('authToken');
  if (!token) {
    localStorage.removeItem('sessionUserData');
    return null;
  }

  try {
    const userFromApi = await getMeApi(token);

    const userProfile: UserProfile = {
      id: userFromApi.id,
      username: userFromApi.username,
      name: userFromApi.name,
      email: userFromApi.email,
      avatar_url: userFromApi.avatar_url,
      is_admin: userFromApi.is_admin,
      birth_date: userFromApi.birth_date,
      is_suspended: userFromApi.is_suspended,
      status: userFromApi.status,
      created_at: userFromApi.created_at,
      updated_at: userFromApi.updated_at,
      dataAiHint:
        userFromApi.dataAiHint ||
        `${userFromApi.name?.split(' ')[0]?.toLowerCase() || 'user'} avatar`,
    };

    localStorage.setItem('sessionUserData', JSON.stringify(userProfile));
    return userProfile;
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.isAxiosError && !axiosError.response) {
      console.error(
        `[verifyAndFetchUserProfile Client-Side] Network Error: Could not connect to the API server at ${API_BASE_URL} to verify token (endpoint: /me). Please ensure your API server is running, accessible, and CORS is configured if necessary. Also, check if the NEXT_PUBLIC_API_URL environment variable is correctly set. Original error:`,
        error
      );
    } else {
      console.error(
        '[verifyAndFetchUserProfile Client-Side] API Error verifying token or fetching from /api/me:',
        error
      );
    }
    localStorage.removeItem('authToken');
    localStorage.removeItem('sessionUserData');
    return null;
  }
}

async function updateUserProfileService(
  data: UpdateProfileData
): Promise<UserProfileResponse> {
  if (typeof window === 'undefined') {
    return {
      success: false,
      messageKey: 'general.unexpectedError',
      rawMessage: 'Cannot update profile: client-side context not available.',
    };
  }
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    return { success: false, messageKey: 'general.authenticationFailed' };
  }

  try {
    const updatedUserFromApi = await updateUserProfileApi(data, authToken);

    const userDataForStorage: UserProfile = {
      id: updatedUserFromApi.id,
      username: updatedUserFromApi.username,
      name: updatedUserFromApi.name,
      email: updatedUserFromApi.email,
      avatar_url: updatedUserFromApi.avatar_url,
      is_admin: updatedUserFromApi.is_admin,
      birth_date: updatedUserFromApi.birth_date,
      is_suspended: updatedUserFromApi.is_suspended,
      status: updatedUserFromApi.status,
      created_at: updatedUserFromApi.created_at,
      updated_at: updatedUserFromApi.updated_at,
      dataAiHint:
        updatedUserFromApi.dataAiHint ||
        `${updatedUserFromApi.name?.split(' ')[0]?.toLowerCase() || 'user'} avatar`,
    };

    localStorage.setItem('sessionUserData', JSON.stringify(userDataForStorage));
    return {
      success: true,
      user: userDataForStorage,
      messageKey: 'profileForm.toastSuccessDescription', // Using description key for success message
    };
  } catch (error: unknown) {
    console.error('[updateUserProfileService] Error updating profile:', error);
    const processedError: ProcessedError = handleAxiosError(error);
    return { 
        success: false, 
        messageKey: processedError.messageKey,
        rawMessage: processedError.rawMessage,
        errors: processedError.errors 
    };
  }
}

async function changePasswordService(
  data: ChangePasswordData
): Promise<ServiceResponse> {
  if (typeof window === 'undefined') {
    return {
      success: false,
      messageKey: 'general.unexpectedError',
      rawMessage: 'Cannot change password: client-side context not available.',
    };
  }
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    return { success: false, messageKey: 'general.authenticationFailed' };
  }

  try {
    await changePasswordApi(data, authToken);
    return { success: true, messageKey: 'changePasswordForm.toastSuccessDescription' };
  } catch (error: unknown) {
    console.error('[changePasswordService] Error changing password:', error);
    const processedError: ProcessedError = handleAxiosError(error);
    // Specific handling for 422 to provide better UX for password validation
    if ((error as AxiosError).response?.status === 422) {
      return {
        success: false,
        messageKey: 'changePasswordForm.toastFailValidationDescription',
        rawMessage: processedError.rawMessage, // Keep raw for details if needed
        errors: processedError.errors,
      };
    }
    return {
      success: false,
      messageKey: processedError.messageKey,
      rawMessage: processedError.rawMessage,
      errors: processedError.errors,
    };
  }
}

// Admin-specific functions
export async function getAllUsers(): Promise<UserProfile[]> {
  const token = localStorage.getItem('authToken');
  const user = getUserProfile();

  if (!token || !user || !user.is_admin) {
    console.error(
      '[AdminService/getAllUsers] Unauthorized attempt: Admin access required and token must be present.'
    );
    throw new Error('general.permissionDenied'); // Throw key for client to translate
  }

  try {
    return await adminGetAllUsersApi(token);
  } catch (error) {
    console.error(
      '[AdminService/getAllUsers] Error fetching users from API:',
      error
    );
    const apiError = handleAxiosError(error);
    throw new Error(apiError.rawMessage || 'Failed to fetch users'); // Throw raw message or a fallback
  }
}

export async function getUserDetailsById(
  userId: string
): Promise<UserProfile | null> {
  const token = localStorage.getItem('authToken');
  const currentUser = getUserProfile();

  if (!token || !currentUser || !currentUser.is_admin) {
    console.error(
      `[AdminService/getUserDetailsById for ${userId}] Unauthorized attempt: Admin access required and token must be present.`
    );
    throw new Error('general.permissionDenied');
  }
  try {
    return await adminGetUserDetailsByIdApi(userId, token);
  } catch (error) {
    console.error(
      `[AdminService/getUserDetailsById] Error fetching user ${userId} from API:`,
      error
    );
    if ((error as AxiosError).response?.status === 404) {
      return null;
    }
    const apiError = handleAxiosError(error);
    throw new Error(apiError.rawMessage || `Failed to fetch user ${userId}`);
  }
}

export async function updateUserById(
  userId: string,
  data: Partial<UserProfile>
): Promise<UserProfile | null> {
  const token = localStorage.getItem('authToken');
  const currentUser = getUserProfile();

  if (!token || !currentUser || !currentUser.is_admin) {
    console.error(
      `[AdminService/updateUserById for ${userId}] Unauthorized attempt: Admin access required and token must be present.`
    );
    throw new Error('general.permissionDenied');
  }

  try {
    return await adminUpdateUserByIdApi(userId, data, token);
  } catch (error) {
    console.error(
      `[AdminService/updateUserById] Error updating user ${userId} via API:`,
      error
    );
    const apiError = handleAxiosError(error);
    throw new Error(apiError.rawMessage || `Failed to update user ${userId}`);
  }
}

export async function deleteUserById(userId: string): Promise<ServiceResponse> {
  const token = localStorage.getItem('authToken');
  const currentUser = getUserProfile();

  if (!token || !currentUser || !currentUser.is_admin) {
    console.error(
      `[AdminService/deleteUserById for ${userId}] Unauthorized attempt: Admin access required and token must be present.`
    );
    return {
      success: false,
      messageKey: 'general.permissionDenied',
    };
  }

  try {
    const apiResult =  await adminDeleteUserByIdApi(userId, token);
    return { ...apiResult, messageKey: apiResult.message ? 'admin.users.page.toastDeleteSuccessDescription' : undefined, rawMessage: apiResult.message }; // Adapt if API returns message
  } catch (error: any) {
    console.error(
      `[AdminService/deleteUserById] Error deleting user ${userId} via API:`,
      error
    );
    const apiError = handleAxiosError(error);
    return { success: false, messageKey: apiError.messageKey, rawMessage: apiError.rawMessage };
  }
}

export const updateUserProfile = updateUserProfileService;
export const changePassword = changePasswordService;
