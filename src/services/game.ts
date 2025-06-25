
'use server';

import { revalidatePath } from 'next/cache';
import {
  getGameListApi,
  getGameDetailsApi,
  createGameApi,
  updateGameApi,
  deleteGameApi,
  type Game as ApiGame,
  handleAxiosError,
  type ProcessedError,
} from '@/lib/apiClient';

export type Game = ApiGame;

interface GameServiceResponse {
    success: boolean;
    messageKey?: string;
    rawMessage?: string;
    game?: Game;
}

function getAuthTokenFromLocalStorage(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
}

export async function getGameList(): Promise<Game[]> {
  try {
    const games = await getGameListApi(null);
    return games;
  } catch (error) {
    console.error('[GameService] getGameList: Failed to fetch games from API.', error);
    const processedError = handleAxiosError(error);
    
    // Specifically check for network connection errors
    if (processedError.code === 'ECONNREFUSED' || processedError.code === 'ENOTFOUND' || processedError.messageKey === 'general.networkError') {
      console.warn(`[GameService] getGameList: Network connection error. Returning empty list. Details: ${processedError.rawMessage}`);
      return []; // Return empty list for this specific case to prevent unhandled server errors
    }
    
    // For other errors, throw to let UI handle them with specific messages
    throw new Error(processedError.rawMessage || 'Failed to fetch game list.');
  }
}

export async function getGameDetails(gameId: string): Promise<Game | null> {
  try {
    const game = await getGameDetailsApi(gameId, null); 
    return game;
  } catch (error: any) {
    console.error(`[GameService] getGameDetails for ${gameId}: Failed to fetch from API.`, error);
     if (error.response && error.response.status === 404) {
      return null;
    }
    const processedError = handleAxiosError(error);
    throw new Error(processedError.rawMessage || `Failed to fetch game details for ${gameId}.`);
  }
}

export async function createGame(
  gameData: Omit<Game, 'id' | 'dataAiHint' | 'created_by' | 'created_at' | 'updated_at'>,
  token: string
): Promise<GameServiceResponse> {
  if (!token) {
    return { success: false, messageKey: 'general.authenticationFailed', rawMessage: 'Auth token not provided for createGame.' };
  }
  
  const payload = { ...gameData };

  try {
    const newGame = await createGameApi(payload, token);
    revalidatePath('/admin/games');
    revalidatePath('/games');
    return { success: true, game: newGame, messageKey: 'gameForm.toastCreateSuccessDescription' };
  } catch (error) {
    console.error('[GameService] createGame: API error.', error);
    const apiError: ProcessedError = handleAxiosError(error);
    return { 
        success: false, 
        messageKey: apiError.messageKey,
        rawMessage: apiError.rawMessage,
    };
  }
}

export async function updateGame(
  gameId: string,
  gameData: Partial<Omit<Game, 'id' | 'dataAiHint' | 'created_by' | 'created_at' | 'updated_at'>>,
  token: string
): Promise<GameServiceResponse> {
  if (!token) {
     return { success: false, messageKey: 'general.authenticationFailed', rawMessage: 'Auth token not provided for updateGame.' };
  }
  
  const payload = { ...gameData };

  try {
    const updatedGame = await updateGameApi(gameId, payload, token);
    revalidatePath('/admin/games');
    revalidatePath(`/admin/games/${gameId}/edit`);
    revalidatePath(`/games/${gameId}`);
    revalidatePath('/games');
    return { success: true, game: updatedGame, messageKey: 'gameForm.toastUpdateSuccessDescription' };
  } catch (error) {
    console.error(`[GameService] updateGame for ${gameId}: API error.`, error);
    const apiError: ProcessedError = handleAxiosError(error);
    if ((error as any).response?.status === 404) {
        return { success: false, messageKey: 'general.notFound', rawMessage: `Game ${gameId} not found.`};
    }
    return { 
        success: false, 
        messageKey: apiError.messageKey,
        rawMessage: apiError.rawMessage,
    };
  }
}

export async function deleteGame(
  gameId: string,
  token: string
): Promise<{ success: boolean; messageKey?: string; rawMessage?: string }> {
  if (!token) {
    return { success: false, messageKey: 'general.authenticationFailed', rawMessage: 'Auth token not provided for deleteGame.' };
  }

  try {
    const result = await deleteGameApi(gameId, token);
    if (result.success) {
      revalidatePath('/admin/games');
      revalidatePath('/games');
      revalidatePath(`/games/${gameId}`);
    }
    return { ...result, messageKey: result.message ? 'admin.games.page.toastDeleteSuccessDescription' : undefined, rawMessage: result.message };
  } catch (error) {
    console.error(`[GameService] deleteGame for ${gameId}: API error.`, error);
    const apiError = handleAxiosError(error);
    return { success: false, messageKey: apiError.messageKey, rawMessage: apiError.rawMessage };
  }
}

export { getAuthTokenFromLocalStorage };
