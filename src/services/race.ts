

import {
  getGameRaceListApi,
  getGameRaceDetailsApi,
  createGameRaceApi,
  updateGameRaceApi,
  deleteGameRaceApi,
  type GameRace,
  handleAxiosError,
  type ProcessedError,
} from '@/lib/apiClient';

export type { GameRace };

interface GameRaceServiceResponse {
    success: boolean;
    rawMessage?: string;
    gameRace?: GameRace;
}

export async function getGameRaceList(gameId?: string): Promise<GameRace[]> {
  try {
    const races = await getGameRaceListApi(gameId);
    return races;
  } catch (error) {
    console.error('[GameRaceService Mock] getGameRaceList: API error.', error);
    const processedError = handleAxiosError(error);
    throw new Error(processedError.rawMessage || 'Falha ao buscar as raças do jogo.');
  }
}

export async function getGameRaceDetails(raceId: string): Promise<GameRace | null> {
  try {
    const gameRace = await getGameRaceDetailsApi(raceId);
    return gameRace;
  } catch (error: any) {
    console.error(`[GameRaceService Mock] getGameRaceDetails for ${raceId}: API error.`, error);
    if (error.response && error.response.status === 404) {
      return null;
    }
    const processedError = handleAxiosError(error);
    throw new Error(processedError.rawMessage || `Falha ao buscar a raça ${raceId}.`);
  }
}

export async function createGameRace(
  raceData: Omit<GameRace, 'id' | 'created_at' | 'updated_at'>
): Promise<GameRaceServiceResponse> {
  try {
    const newGameRace = await createGameRaceApi(raceData);
    return { success: true, gameRace: newGameRace };
  } catch (error) {
    console.error('[GameRaceService Mock] createGameRace: API error.', error);
    const apiError: ProcessedError = handleAxiosError(error);
    return { success: false, rawMessage: apiError.rawMessage };
  }
}

export async function updateGameRace(
  raceId: string,
  raceData: Partial<Omit<GameRace, 'id' | 'created_at' | 'updated_at'>>
): Promise<GameRaceServiceResponse> {
  try {
    const updatedGameRace = await updateGameRaceApi(raceId, raceData);
    return { success: true, gameRace: updatedGameRace };
  } catch (error) {
    console.error(`[GameRaceService Mock] updateGameRace for ${raceId}: API error.`, error);
    const apiError: ProcessedError = handleAxiosError(error);
    return { success: false, rawMessage: apiError.rawMessage };
  }
}

export async function deleteGameRace(
  raceId: string
): Promise<{ success: boolean; rawMessage?: string }> {
  try {
    await deleteGameRaceApi(raceId);
    return { success: true };
  } catch (error) {
    console.error(`[GameRaceService Mock] deleteGameRace for ${raceId}: API error.`, error);
    const apiError = handleAxiosError(error);
    return { success: false, rawMessage: apiError.rawMessage };
  }
}
