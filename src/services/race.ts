
'use server';

import { revalidatePath } from 'next/cache';
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
    messageKey?: string;
    rawMessage?: string;
    gameRace?: GameRace;
    gameRaces?: GameRace[];
}

export async function getGameRaceList(gameId?: string, token?: string | null): Promise<GameRace[]> {
  try {
    const races = await getGameRaceListApi(gameId, token);
    return races;
  } catch (error) {
    console.error('[GameRaceService] getGameRaceList: API error.', error);
    const processedError = handleAxiosError(error);
    throw new Error(processedError.rawMessage || 'Failed to fetch game races.');
  }
}

export async function getGameRaceDetails(raceId: string, token: string): Promise<GameRace | null> {
  if (!token) {
    throw new Error('Authentication token is required to fetch game race details.');
  }
  try {
    const gameRace = await getGameRaceDetailsApi(raceId, token);
    return gameRace;
  } catch (error: any) {
    console.error(`[GameRaceService] getGameRaceDetails for ${raceId}: API error.`, error);
    if (error.response && error.response.status === 404) {
      return null;
    }
    const processedError = handleAxiosError(error);
    throw new Error(processedError.rawMessage || `Failed to fetch game race ${raceId}.`);
  }
}

export async function createGameRace(
  raceData: Omit<GameRace, 'id' | 'created_at' | 'updated_at'>,
  token: string
): Promise<GameRaceServiceResponse> {
  if (!token) {
    return { success: false, messageKey: 'general.authenticationFailed', rawMessage: 'Auth token not provided for createGameRace.' };
  }
  try {
    const newGameRace = await createGameRaceApi(raceData, token);
    revalidatePath('/admin/races');
    return { success: true, gameRace: newGameRace, messageKey: 'admin.races.form.toastCreateSuccess' };
  } catch (error) {
    console.error('[GameRaceService] createGameRace: API error.', error);
    const apiError: ProcessedError = handleAxiosError(error);
    return { success: false, messageKey: apiError.messageKey, rawMessage: apiError.rawMessage };
  }
}

export async function updateGameRace(
  raceId: string,
  raceData: Partial<Omit<GameRace, 'id' | 'created_at' | 'updated_at'>>,
  token: string
): Promise<GameRaceServiceResponse> {
  if (!token) {
    return { success: false, messageKey: 'general.authenticationFailed', rawMessage: 'Auth token not provided for updateGameRace.' };
  }
  try {
    const updatedGameRace = await updateGameRaceApi(raceId, raceData, token);
    revalidatePath('/admin/races');
    revalidatePath(`/admin/races/${raceId}/edit`);
    return { success: true, gameRace: updatedGameRace, messageKey: 'admin.races.form.toastUpdateSuccess' };
  } catch (error) {
    console.error(`[GameRaceService] updateGameRace for ${raceId}: API error.`, error);
    const apiError: ProcessedError = handleAxiosError(error);
    if ((error as any).response?.status === 404) {
      return { success: false, messageKey: 'general.notFound', rawMessage: `Game race ${raceId} not found.` };
    }
    return { success: false, messageKey: apiError.messageKey, rawMessage: apiError.rawMessage };
  }
}

export async function deleteGameRace(
  raceId: string,
  token: string
): Promise<{ success: boolean; messageKey?: string; rawMessage?: string }> {
  if (!token) {
    return { success: false, messageKey: 'general.authenticationFailed', rawMessage: 'Auth token not provided for deleteGameRace.' };
  }
  try {
    const result = await deleteGameRaceApi(raceId, token);
    if (result.success) {
      revalidatePath('/admin/races');
    }
    return { ...result, messageKey: result.message ? 'admin.races.page.toastDeleteSuccess' : undefined, rawMessage: result.message };
  } catch (error) {
    console.error(`[GameRaceService] deleteGameRace for ${raceId}: API error.`, error);
    const apiError = handleAxiosError(error);
    return { success: false, messageKey: apiError.messageKey, rawMessage: apiError.rawMessage };
  }
}
