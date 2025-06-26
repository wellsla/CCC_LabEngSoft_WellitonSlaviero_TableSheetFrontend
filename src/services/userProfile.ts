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
  // These are now mock functions
  mockUsers as MOCK_USERS, 
  mockPasswords as MOCK_PASSWORDS,
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
  email?: string;
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

// SIMULATION: Get user based on mock session
export function getUserProfile(): UserProfile | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const userType = localStorage.getItem('mockUserType'); // 'admin' or 'player'
    if (!userType) return null;

    if (userType === 'admin') {
      return MOCK_USERS.find(u => u.is_admin) || null;
    }
    return MOCK_USERS.find(u => !u.is_admin) || null;
  } catch (error) {
    console.error('[getUserProfile Mock] Error reading from localStorage:', error);
    return null;
  }
}

// SIMULATION: "Verify" just means getting from local storage
export async function verifyAndFetchUserProfile(): Promise<UserProfile | null> {
  return getUserProfile();
}

// SIMULATION: Update the in-memory mock user
async function updateUserProfileService(
  data: UpdateProfileData
): Promise<UserProfileResponse> {
  const currentUser = getUserProfile();
  if (!currentUser) {
    return { success: false, messageKey: 'general.authenticationFailed' };
  }

  try {
    const userIndex = MOCK_USERS.findIndex(u => u.id === currentUser.id);
    if (userIndex === -1) {
      return { success: false, messageKey: 'general.notFound', rawMessage: "Usuário não encontrado no mock." };
    }
    
    // Handle email change logic
    if (data.email && data.email !== currentUser.email) {
        // Check for uniqueness
        if (MOCK_USERS.some(u => u.email === data.email && u.id !== currentUser.id)) {
            return { success: false, rawMessage: 'Este endereço de e-mail já está em uso por outra conta.' };
        }
        // Update password key
        const password = MOCK_PASSWORDS[currentUser.email];
        if (password) {
            delete MOCK_PASSWORDS[currentUser.email];
            MOCK_PASSWORDS[data.email] = password;
        }
    }

    MOCK_USERS[userIndex] = { ...MOCK_USERS[userIndex], ...data, updated_at: new Date().toISOString() };
    
    const updatedUser = MOCK_USERS[userIndex];
    localStorage.setItem('sessionUserData', JSON.stringify(updatedUser)); 

    return {
      success: true,
      user: updatedUser,
      messageKey: 'profileForm.toastSuccessDescription',
    };
  } catch (error: unknown) {
    console.error('[updateUserProfileService] Error updating mock profile:', error);
    const processedError: ProcessedError = handleAxiosError(error);
    return { 
        success: false, 
        messageKey: processedError.messageKey,
        rawMessage: processedError.rawMessage,
        errors: processedError.errors 
    };
  }
}

// SIMULATION: Change password in the mock password object
async function changePasswordService(
  data: ChangePasswordData
): Promise<ServiceResponse> {
  const currentUser = getUserProfile();
  if (!currentUser) {
    return { success: false, messageKey: 'general.authenticationFailed' };
  }

  try {
    if (MOCK_PASSWORDS[currentUser.email] !== data.currentPassword) {
      throw new Error("A senha atual está incorreta.");
    }
    MOCK_PASSWORDS[currentUser.email] = data.newPassword;
    return { success: true, messageKey: 'changePasswordForm.toastSuccessDescription' };
  } catch (error: unknown) {
    const processedError: ProcessedError = handleAxiosError(error);
    return {
      success: false,
      messageKey: processedError.messageKey,
      rawMessage: processedError.rawMessage,
      errors: processedError.errors,
    };
  }
}

// --- Admin-specific functions (all use mock data now) ---
export async function getAllUsers(): Promise<UserProfile[]> {
  const user = getUserProfile();
  if (!user || !user.is_admin) {
    throw new Error('Permissão negada.');
  }
  return adminGetAllUsersApi();
}

export async function getUserDetailsById(
  userId: string
): Promise<UserProfile | null> {
  const user = getUserProfile();
  if (!user || !user.is_admin) {
    throw new Error('Permissão negada.');
  }
  try {
    return await adminGetUserDetailsByIdApi(userId);
  } catch (error) {
    return null;
  }
}

export async function updateUserById(
  userId: string,
  data: Partial<UserProfile>
): Promise<UserProfile | null> {
   const user = getUserProfile();
  if (!user || !user.is_admin) {
    throw new Error('Permissão negada.');
  }
  try {
    return await adminUpdateUserByIdApi(userId, data);
  } catch (error) {
     const apiError = handleAxiosError(error);
    throw new Error(apiError.rawMessage);
  }
}

export async function deleteUserById(userId: string): Promise<ServiceResponse> {
  const user = getUserProfile();
  if (!user || !user.is_admin) {
     return { success: false, messageKey: 'general.permissionDenied' };
  }
  try {
    const apiResult =  await adminDeleteUserByIdApi(userId);
    return { ...apiResult, success: true, messageKey: 'admin.users.page.toastDeleteSuccessDescription' };
  } catch (error: any) {
    const apiError = handleAxiosError(error);
    return { success: false, messageKey: apiError.messageKey, rawMessage: apiError.rawMessage };
  }
}

export const updateUserProfile = updateUserProfileService;
export const changePassword = changePasswordService;

// This function is no longer needed with the mock setup, but kept for structural reference
export function getAuthTokenFromLocalStorage(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    // The "token" is now just the user type for mock auth
    const userType = localStorage.getItem('mockUserType');
    if (userType === 'admin') return 'mock-admin-token';
    if (userType === 'player') return 'mock-player-token';
    return null;
}
