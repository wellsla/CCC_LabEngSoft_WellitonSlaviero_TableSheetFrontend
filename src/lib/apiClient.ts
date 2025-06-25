import axios, { type AxiosError } from 'axios';
import type { RegisterFormValuesForAction } from '@/app/auth/actions';
import type {
  UserProfile,
  ChangePasswordData,
  UpdateProfileData,
} from '@/services/userProfile';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 10000,
});

// --- API Response Wrapper Interfaces ---
interface ApiSuccessResponse<T> {
  success: boolean;
  message: string;
  message_en?: string;
  message_pt_BR?: string;
  data: T;
  meta?: Record<string, any>; // For pagination
  links?: Record<string, any>; // For pagination
}

interface UserTokenPayload {
  user: UserProfile;
  token: string;
}

// --- Authentication Endpoints ---

export async function registerApi(
  data: RegisterFormValuesForAction & { password_confirmation: string }
): Promise<UserTokenPayload> {
  const response =
    await apiClient.post<ApiSuccessResponse<UserTokenPayload>>(
      '/register',
      data
    );
  return response.data.data;
}

export async function loginApi(data: {
  email: string;
  password: string;
}): Promise<UserTokenPayload> {
  const response = await apiClient.post<ApiSuccessResponse<UserTokenPayload>>(
    '/login',
    data
  );
  return response.data.data;
}

export async function logoutApi(token: string): Promise<{ success: boolean, message?: string }> {
  const response = await apiClient.post<{success: boolean, message: string}>(
    '/logout',
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
}

export async function requestPasswordResetApi(email: string): Promise<{ success: boolean, messageKey?: string, rawMessage?: string }> {
  const response = await apiClient.post<ApiSuccessResponse<null>>('/forgot-password', { email });
  return { success: response.data.success, messageKey: response.data.message_en ? 'auth.forgotPassword.successToastDescription' : undefined, rawMessage: response.data.message_en || response.data.message };
}

// --- User Profile Endpoints ---
export async function getMeApi(token: string): Promise<UserProfile> {
  const response = await apiClient.get<ApiSuccessResponse<UserProfile>>('/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.data;
}

export async function updateUserProfileApi(
  data: UpdateProfileData,
  token: string
): Promise<UserProfile> {
  const response = await apiClient.put<ApiSuccessResponse<UserProfile>>(
    '/user/profile',
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data.data;
}

export async function changePasswordApi(
  data: ChangePasswordData,
  token: string
): Promise<{ success: boolean; message?: string }> {
  const response = await apiClient.put<ApiSuccessResponse<null>>(
    '/user/password',
    {
      current_password: data.currentPassword,
      password: data.newPassword,
      password_confirmation: data.newPassword,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return { success: response.data.success, message: response.data.message_en || response.data.message };
}

// --- Admin User Management API Calls ---
export async function adminGetAllUsersApi(
  token: string
): Promise<UserProfile[]> {
  const response = await apiClient.get<ApiSuccessResponse<UserProfile[]>>(
    '/users',
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data.data;
}

export async function adminGetUserDetailsByIdApi(
  userId: string,
  token: string
): Promise<UserProfile> {
  const response = await apiClient.get<ApiSuccessResponse<UserProfile>>(
    `/users/${userId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data.data;
}

export async function adminUpdateUserByIdApi(
  userId: string,
  data: Partial<UserProfile>,
  token: string
): Promise<UserProfile> {
  const response = await apiClient.put<ApiSuccessResponse<UserProfile>>(
    `/users/${userId}`,
    data,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data.data;
}

export async function adminDeleteUserByIdApi(
  userId: string,
  token: string
): Promise<{ success: boolean; message?: string }> {
  await apiClient.delete(`/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return { success: true, message: 'User deleted successfully via API.' };
}

// --- Game Management API Calls ---
export interface Game {
  id: string;
  name: string;
  description: string;
  version: string;
  cover_image_url?: string;
  is_active: boolean;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  dataAiHint?: string;
}

export async function getGameListApi(token?: string | null): Promise<Game[]> {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await apiClient.get<ApiSuccessResponse<Game[]>>('/games', {
    headers,
  });
  return response.data.data;
}

export async function getGameDetailsApi(
  gameId: string,
  token?: string | null
): Promise<Game> {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await apiClient.get<ApiSuccessResponse<Game>>(
    `/games/${gameId}`,
    { headers }
  );
  return response.data.data;
}

export async function createGameApi(
  gameData: Omit<
    Game,
    'id' | 'created_by' | 'created_at' | 'updated_at' | 'dataAiHint'
  > & { dataAiHint?: string },
  token: string
): Promise<Game> {
  const response = await apiClient.post<ApiSuccessResponse<Game>>(
    '/games',
    gameData,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data.data;
}

export async function updateGameApi(
  gameId: string,
  gameData: Partial<
    Omit<Game, 'id' | 'created_by' | 'created_at' | 'updated_at'>
  >,
  token: string
): Promise<Game> {
  const response = await apiClient.put<ApiSuccessResponse<Game>>(
    `/games/${gameId}`,
    gameData,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data.data;
}

export async function deleteGameApi(
  gameId: string,
  token: string
): Promise<{ success: boolean; message?: string }> {
  await apiClient.delete(`/games/${gameId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return { success: true, message: 'Game deleted successfully via API.' };
}

// --- Character Sheet Management API Calls ---
export interface CharacterSheetFromAPI {
  id: string;
  user_id: string;
  game_id?: string;
  name: string;
  race_id?: string;
  class_id?: string;
  background_id?: string;
  alignment_id?: string;
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
  level?: number;
  experience_points?: number;
  current_hit_points?: number;
  max_hit_points?: number;
  armor_class?: number;
  initiative?: number;
  speed?: number;
  description?: string;
  notes?: string;
  portrait_url?: string;
  is_npc?: boolean;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export async function getCharacterListApi(
  token: string
): Promise<CharacterSheetFromAPI[]> {
  const response = await apiClient.get<
    ApiSuccessResponse<CharacterSheetFromAPI[]>
  >('/character-sheets', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
}

export async function getCharacterDetailsApi(
  characterId: string,
  token: string
): Promise<CharacterSheetFromAPI> {
  const response = await apiClient.get<
    ApiSuccessResponse<CharacterSheetFromAPI>
  >(`/character-sheets/${characterId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
}

export async function createCharacterApi(
  characterData: Omit<
    CharacterSheetFromAPI,
    'id' | 'created_at' | 'updated_at' | 'user_id'
  > & { user_id?: string },
  token: string
): Promise<CharacterSheetFromAPI> {
  const response = await apiClient.post<
    ApiSuccessResponse<CharacterSheetFromAPI>
  >('/character-sheets', characterData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
}

export async function updateCharacterApi(
  characterId: string,
  characterData: Partial<
    Omit<CharacterSheetFromAPI, 'id' | 'created_at' | 'updated_at' | 'user_id'>
  >,
  token: string
): Promise<CharacterSheetFromAPI> {
  const response = await apiClient.put<
    ApiSuccessResponse<CharacterSheetFromAPI>
  >(`/character-sheets/${characterId}`, characterData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
}

export async function deleteCharacterApi(
  characterId: string,
  token: string
): Promise<{ success: boolean; message?: string }> {
  await apiClient.delete(`/character-sheets/${characterId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return { success: true, message: 'Character deleted successfully via API.' };
}

// --- Game Class Management API Calls ---
export interface GameClass {
  id: string;
  game_id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export async function getGameClassListApi(
  gameId?: string,
  token?: string | null
): Promise<GameClass[]> {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const params = gameId ? { game_id: gameId } : {};
  const response = await apiClient.get<ApiSuccessResponse<GameClass[]>>(
    '/classes',
    { headers, params }
  );
  return response.data.data;
}

export async function getGameClassDetailsApi(
  classId: string,
  token: string
): Promise<GameClass> {
  const response = await apiClient.get<ApiSuccessResponse<GameClass>>(
    `/classes/${classId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data.data;
}

export async function createGameClassApi(
  classData: Omit<GameClass, 'id' | 'created_at' | 'updated_at'>,
  token: string
): Promise<GameClass> {
  const response = await apiClient.post<ApiSuccessResponse<GameClass>>(
    '/classes',
    classData,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data.data;
}

export async function updateGameClassApi(
  classId: string,
  classData: Partial<Omit<GameClass, 'id' | 'created_at' | 'updated_at'>>,
  token: string
): Promise<GameClass> {
  const response = await apiClient.put<ApiSuccessResponse<GameClass>>(
    `/classes/${classId}`,
    classData,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data.data;
}

export async function deleteGameClassApi(
  classId: string,
  token: string
): Promise<{ success: boolean; message?: string }> {
  await apiClient.delete(`/classes/${classId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return { success: true, message: 'Game class deleted successfully via API.' };
}

// --- Game Race Management API Calls ---
export interface GameRace {
  id: string;
  game_id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export async function getGameRaceListApi(
  gameId?: string,
  token?: string | null
): Promise<GameRace[]> {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const params = gameId ? { game_id: gameId } : {};
  const response = await apiClient.get<ApiSuccessResponse<GameRace[]>>(
    '/races',
    { headers, params }
  );
  return response.data.data;
}

export async function getGameRaceDetailsApi(
  raceId: string,
  token: string
): Promise<GameRace> {
  const response = await apiClient.get<ApiSuccessResponse<GameRace>>(
    `/races/${raceId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data.data;
}

export async function createGameRaceApi(
  raceData: Omit<GameRace, 'id' | 'created_at' | 'updated_at'>,
  token: string
): Promise<GameRace> {
  const response = await apiClient.post<ApiSuccessResponse<GameRace>>(
    '/races',
    raceData,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data.data;
}

export async function updateGameRaceApi(
  raceId: string,
  raceData: Partial<Omit<GameRace, 'id' | 'created_at' | 'updated_at'>>,
  token: string
): Promise<GameRace> {
  const response = await apiClient.put<ApiSuccessResponse<GameRace>>(
    `/races/${raceId}`,
    raceData,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data.data;
}

export async function deleteGameRaceApi(
  raceId: string,
  token: string
): Promise<{ success: boolean; message?: string }> {
  await apiClient.delete(`/races/${raceId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return { success: true, message: 'Game race deleted successfully via API.' };
}

// --- Game Book/PDF Management API Calls ---
export interface GameBook {
  id: string;
  game_id: string;
  name: string;
  description?: string;
  cover_image_url?: string;
  document_url: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export async function getBookListApi(
  gameId?: string,
  token?: string | null
): Promise<GameBook[]> {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const params = gameId ? { game_id: gameId } : {};
  const response = await apiClient.get<ApiSuccessResponse<GameBook[]>>(
    '/books',
    { headers, params }
  );
  return response.data.data;
}

export async function getBookDetailsApi(
  bookId: string,
  token: string
): Promise<GameBook> {
  const response = await apiClient.get<ApiSuccessResponse<GameBook>>(
    `/books/${bookId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data.data;
}

export async function createBookApi(
  bookData: Omit<GameBook, 'id' | 'created_by' | 'created_at' | 'updated_at'>,
  token: string
): Promise<GameBook> {
  const response = await apiClient.post<ApiSuccessResponse<GameBook>>(
    '/books',
    bookData,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data.data;
}

export async function updateBookApi(
  bookId: string,
  bookData: Partial<
    Omit<GameBook, 'id' | 'created_by' | 'created_at' | 'updated_at'>
  >,
  token: string
): Promise<GameBook> {
  const response = await apiClient.put<ApiSuccessResponse<GameBook>>(
    `/books/${bookId}`,
    bookData,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data.data;
}

export async function deleteBookApi(
  bookId: string,
  token: string
): Promise<{ success: boolean; message?: string }> {
  await apiClient.delete(`/books/${bookId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return { success: true, message: 'Book deleted successfully via API.' };
}

// --- Error Handling ---
interface ApiErrorDetail {
  message: string;
  message_en?: string;
  message_pt_BR?: string;
  errors?: Record<string, string[]>;
  success?: boolean;
}

export interface ProcessedError {
  success: false;
  messageKey: string;
  rawMessage?: string;
  errors?: Record<string, string[]>;
  code?: string; // To store codes like 'ECONNREFUSED', 'ENOTFOUND'
}

export function handleAxiosError(error: unknown): ProcessedError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorDetail | any>;
    const responseData = axiosError.response?.data;
    const responseStatus = axiosError.response?.status;
    const errorCode = axiosError.code; // Capture ECONNREFUSED, ENOTFOUND etc.

    let messageKey = 'general.unexpectedError';
    // Prioritize backend's English message, then generic message, then Axios's message
    let rawMessage = responseData?.message_en || responseData?.message || axiosError.message;

    if (
      (axiosError.message.toLowerCase().includes('network error') || errorCode === 'ECONNREFUSED' || errorCode === 'ENOTFOUND') &&
      !axiosError.response // No response means it's likely a true network issue, not an API error response
    ) {
      messageKey = 'general.networkError';
      rawMessage = `Network Error: Unable to connect to the API server at ${API_BASE_URL}. Please check your network connection and ensure the server is running. (Code: ${errorCode})`;
      console.error('[handleAxiosError] Network connection error:', rawMessage, error);
    } else if (responseData && typeof responseData === 'object') {
      // If there is responseData, use its messages if available
      rawMessage = responseData.message_en || responseData.message || rawMessage;

      if (responseStatus === 401) {
        messageKey = 'general.authenticationFailed';
      } else if (responseStatus === 403) {
        messageKey = 'general.permissionDenied';
        if (responseData?.message?.toLowerCase().includes('suspended')) {
           messageKey = 'auth.login.failToastSuspended';
        }
      } else if (responseStatus === 404) {
        messageKey = 'general.notFound';
      } else if (responseStatus === 422) {
        messageKey = 'general.validationError';
        if (responseData?.errors && typeof responseData.errors === 'object') {
          const validationErrors = Object.values(responseData.errors)
            .flat()
            .join(' ');
          if (validationErrors) rawMessage = validationErrors;
        } else if (!rawMessage && responseData?.message) {
          rawMessage = responseData.message;
        } else if (!rawMessage) {
          rawMessage = 'Validation failed. Please check your input.';
        }
      } else if (responseStatus && responseStatus >= 500) {
        messageKey = 'general.serverError';
      } else if (responseStatus && !responseData?.message_en && !responseData?.message) {
        // For other statuses where API might not provide a nice message_en/message
        messageKey = 'general.requestFailed';
        rawMessage = `Request failed with status ${responseStatus}. ${rawMessage}`;
      }
    }

    return {
      success: false,
      messageKey,
      rawMessage,
      errors:
        responseData?.errors && typeof responseData.errors === 'object'
          ? responseData.errors
          : undefined,
      code: errorCode,
    };
  }

  let nonAxiosMessage = 'An unexpected error occurred.';
  if (error instanceof Error && error.message) {
    nonAxiosMessage = error.message;
  }
  return {
    success: false,
    messageKey: 'general.unexpectedError',
    rawMessage: nonAxiosMessage,
    code: undefined,
  };
}
