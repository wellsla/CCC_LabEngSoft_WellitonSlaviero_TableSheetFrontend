
import { apiClient } from '@/lib/clientApi';
import { ApiClient, type GameClass } from '@/lib/apiClient';
import { handleAxiosError, type ProcessedError } from '@/lib/apiErrorHandler';

export type { GameClass };

interface GameClassServiceResponse {
  success: boolean;
  rawMessage?: string;
  gameClass?: GameClass;
  gameClasses?: GameClass[];
  errors?: Record<string, string[]>;
}

export async function getGameClassList(gameId?: string): Promise<GameClass[]> {
  try {
    const response = await apiClient.getGameClassList(gameId);
    return response.data.filter((cls) => !cls.deleted_at);
  } catch (error) {
    const processedError = handleAxiosError(error);
    throw new Error(
      processedError.rawMessage || 'Falha ao buscar as classes do jogo.'
    );
  }
}

export async function getGameClassDetails(
  classId: string
): Promise<GameClass | null> {
  try {
    const response = await apiClient.getGameClass(classId);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    const processedError = handleAxiosError(error);
    throw new Error(
      processedError.rawMessage || `Falha ao buscar a classe ${classId}.`
    );
  }
}

export async function createGameClass(
  classData: Omit<GameClass, 'id' | 'created_at' | 'updated_at'>
): Promise<GameClassServiceResponse> {
  const apiPayload = {
    ...classData,
    game_id: parseInt(classData.game_id, 10),
  };
  try {
    const result = await apiClient.createGameClass(apiPayload as any);
    return {
      success: true,
      gameClass: result.data,
      rawMessage: result.message,
    };
  } catch (error) {
    const apiError: ProcessedError = handleAxiosError(error);
    return {
      success: false,
      rawMessage: apiError.rawMessage,
      errors: apiError.errors,
    };
  }
}

export async function updateGameClass(
  classId: string,
  classData: Partial<Omit<GameClass, 'id' | 'created_at' | 'updated_at'>>
): Promise<GameClassServiceResponse> {
  const apiPayload: any = { ...classData };
  if (classData.game_id) {
    apiPayload.game_id = parseInt(classData.game_id, 10);
  }

  try {
    const result = await apiClient.updateGameClass(classId, apiPayload);
    return {
      success: true,
      gameClass: result.data,
      rawMessage: result.message,
    };
  } catch (error) {
    const apiError: ProcessedError = handleAxiosError(error);
    return {
      success: false,
      rawMessage: apiError.rawMessage,
      errors: apiError.errors,
    };
  }
}

export async function deleteGameClass(
  classId: string,
  token: string | null
): Promise<{ success: boolean; rawMessage?: string }> {
  if (!token) {
    return { success: false, rawMessage: 'Não autenticado.' };
  }
  try {
    const serverApiClient = new ApiClient(token);
    const result = await serverApiClient.deleteGameClass(classId);
    return { success: true, rawMessage: result.message };
  } catch (error) {
    const apiError = handleAxiosError(error);
    return { success: false, rawMessage: apiError.rawMessage };
  }
}
