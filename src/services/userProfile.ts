
'use client';

import { apiClient } from '@/lib/clientApi';
import { handleAxiosError, type ProcessedError } from '@/lib/apiErrorHandler';
import type {
  UserProfile,
  UpdateProfileData,
  UpdatePasswordData,
} from '@/lib/apiClient';
import { getAuthToken, removeAuthToken } from '@/lib/tokenManager';
import { ApiClient } from '@/lib/apiClient';
import { ensureValidAvatarUrl } from '@/lib/imageUtils';

export type { UserProfile, UpdateProfileData, UpdatePasswordData };

interface ServiceResponse {
  success: boolean;
  messageKey?: string;
  rawMessage?: string;
  errors?: Record<string, string[]>;
}

interface UserProfileResponse extends ServiceResponse {
  user?: UserProfile;
}

// --- USER FUNCTIONS ---
export async function getAuthenticatedUserProfile(): Promise<UserProfile | null> {
  const token = getAuthToken();
  if (!token) {
    return null;
  }

  try {
    const { data } = await apiClient.getProfile();
    return {
      ...data,
      avatar_url: ensureValidAvatarUrl(data.avatar_url)
    };
  } catch (error) {
    removeAuthToken(); // Clean up invalid token
    return null;
  }
}

// Helper to convert data URI to file for uploads
function dataURIToFile(dataURI: string, filename: string): File {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  const blob = new Blob([ab], { type: mimeString });
  return new File([blob], filename, { type: mimeString });
}

export async function updateUserProfile(
  data: UpdateProfileData
): Promise<UserProfileResponse> {
  try {
    const payload = { ...data };
    // Check if avatar_url is a new file upload (data URI)
    if (payload.avatar_url && payload.avatar_url.startsWith('data:image')) {
      const file = dataURIToFile(payload.avatar_url, 'avatar.png');
      const uploadResult = await apiClient.uploadAvatar(file);
      payload.avatar_url = uploadResult.data.url; // Update payload with the new URL
    } else if (payload.avatar_url === '') {
      payload.avatar_url = null;
    }

    const result = await apiClient.updateProfile(payload);
    return {
      success: true,
      user: {
        ...result.data,
        avatar_url: ensureValidAvatarUrl(result.data.avatar_url)
      },
      rawMessage: result.message
    };
  } catch (error) {
    return handleAxiosError(error);
  }
}

export async function updateUserPassword(
  data: UpdatePasswordData
): Promise<ServiceResponse> {
  try {
    const result = await apiClient.updatePassword(data);
    return { success: true, rawMessage: result.message };
  } catch (error) {
    return handleAxiosError(error);
  }
}


// --- ADMIN FUNCTIONS ---
export async function adminGetAllUsers(): Promise<UserProfile[]> {
  try {
    const response = await apiClient.adminGetAllUsers();
    return response.data
      .filter((user) => !user.deleted_at)
      .map(user => ({
        ...user,
        avatar_url: ensureValidAvatarUrl(user.avatar_url)
      }));
  } catch (error) {
    const processedError = handleAxiosError(error);
    throw new Error(processedError.rawMessage || 'Falha ao buscar usuários.');
  }
}

export async function adminGetUser(
  userId: string
): Promise<UserProfile | null> {
  try {
    const response = await apiClient.adminGetUser(userId);
    const user = response.data;
    return {
      ...user,
      avatar_url: ensureValidAvatarUrl(user.avatar_url)
    };
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    const processedError = handleAxiosError(error);
    throw new Error(
      processedError.rawMessage || `Falha ao buscar o usuário ${userId}.`
    );
  }
}

export async function adminUpdateUser(
  userId: string,
  data: Partial<UserProfile>
): Promise<UserProfile> {
  try {
    const { data: updatedUser } = await apiClient.adminUpdateUser(userId, data);
    return {
      ...updatedUser,
      avatar_url: ensureValidAvatarUrl(updatedUser.avatar_url)
    };
  } catch (error) {
    const apiError = handleAxiosError(error);
    throw new Error(apiError.rawMessage);
  }
}

export async function adminDeleteUser(
  userId: string,
  token: string | null
): Promise<ServiceResponse> {
  if (!token) {
    return { success: false, rawMessage: 'Não autenticado.' };
  }
  try {
    const serverApiClient = new ApiClient(token);
    const { message } = await serverApiClient.adminDeleteUser(userId);
    return { success: true, rawMessage: message };
  } catch (error) {
    return handleAxiosError(error);
  }
}

export async function adminSuspendUser(
  userId: string,
  token: string | null
): Promise<ServiceResponse> {
  if (!token) {
    return { success: false, rawMessage: 'Não autenticado.' };
  }
  try {
    const serverApiClient = new ApiClient(token);
    const { message } = await serverApiClient.adminSuspendUser(userId);
    return { success: true, rawMessage: message };
  } catch (error) {
    return handleAxiosError(error);
  }
}
