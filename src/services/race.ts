
import { apiClient } from '@/lib/clientApi';
import { ApiClient, type GameRace } from '@/lib/apiClient';
import { handleAxiosError, type ProcessedError } from '@/lib/apiErrorHandler';

export type { GameRace };

interface GameRaceServiceResponse {
  success: boolean;
  rawMessage?: string;
  gameRace?: GameRace;
  errors?: Record<string, string[]>;
}

export async function getGameRaceList(gameId?: string): Promise<GameRace[]> {
  try {
    const response = await apiClient.getGameRaceList(gameId);
    return response.data.filter((race) => !race.deleted_at);
  } catch (error) {
    const processedError = handleAxiosError(error);
    throw new Error(
      processedError.rawMessage || 'Falha ao buscar as raças do jogo.'
    );
  }
}

export async function getGameRaceDetails(
  raceId: string
): Promise<GameRace | null> {
  try {
    const response = await apiClient.getGameRace(raceId);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    const processedError = handleAxiosError(error);
    throw new Error(
      processedError.rawMessage || `Falha ao buscar a raça ${raceId}.`
    );
  }
}

export async function createGameRace(
  raceData: Omit<GameRace, 'id' | 'created_at' | 'updated_at'>
): Promise<GameRaceServiceResponse> {
  const apiPayload = {
    ...raceData,
    game_id: parseInt(raceData.game_id, 10),
  };
  try {
    const result = await apiClient.createGameRace(apiPayload as any);
    return {
      success: true,
      gameRace: result.data,
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

export async function updateGameRace(
  raceId: string,
  raceData: Partial<Omit<GameRace, 'id' | 'created_at' | 'updated_at'>>
): Promise<GameRaceServiceResponse> {
  const apiPayload: any = { ...raceData };
  if (raceData.game_id) {
    apiPayload.game_id = parseInt(raceData.game_id, 10);
  }
  try {
    const result = await apiClient.updateGameRace(raceId, apiPayload);
    return {
      success: true,
      gameRace: result.data,
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

export async function deleteGameRace(
  raceId: string,
  token: string | null
): Promise<{ success: boolean; rawMessage?: string }> {
  if (!token) {
    return { success: false, rawMessage: 'Não autenticado.' };
  }
  try {
    const serverApiClient = new ApiClient(token);
    const result = await serverApiClient.deleteGameRace(raceId);
    return { success: true, rawMessage: result.message };
  } catch (error) {
    const apiError = handleAxiosError(error);
    return { success: false, rawMessage: apiError.rawMessage };
  }
}
