

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
    rawMessage?: string;
    game?: Game;
}

export async function getGameList(): Promise<Game[]> {
  try {
    const games = await getGameListApi();
    return games;
  } catch (error) {
    console.error('[GameService Mock] getGameList: Failed to fetch games from mock API.', error);
    const processedError = handleAxiosError(error);
    throw new Error(processedError.rawMessage || 'Falha ao buscar a lista de jogos mockada.');
  }
}

export async function getGameDetails(gameId: string): Promise<Game | null> {
  try {
    const game = await getGameDetailsApi(gameId); 
    return game;
  } catch (error: any) {
    console.error(`[GameService Mock] getGameDetails for ${gameId}: Failed to fetch from mock API.`, error);
     if (error.response && error.response.status === 404) {
      return null;
    }
    const processedError = handleAxiosError(error);
    throw new Error(processedError.rawMessage || `Falha ao buscar detalhes do jogo ${gameId}.`);
  }
}

export async function createGame(
  gameData: Omit<Game, 'id' | 'dataAiHint' | 'created_by' | 'created_at' | 'updated_at'>
): Promise<GameServiceResponse> {
  const payload = { ...gameData };
  try {
    const newGame = await createGameApi(payload);
    return { success: true, game: newGame };
  } catch (error) {
    console.error('[GameService Mock] createGame: API error.', error);
    const apiError: ProcessedError = handleAxiosError(error);
    return { 
        success: false, 
        rawMessage: apiError.rawMessage,
    };
  }
}

export async function updateGame(
  gameId: string,
  gameData: Partial<Omit<Game, 'id' | 'dataAiHint' | 'created_by' | 'created_at' | 'updated_at'>>
): Promise<GameServiceResponse> {
  const payload = { ...gameData };
  try {
    const updatedGame = await updateGameApi(gameId, payload);
    return { success: true, game: updatedGame };
  } catch (error) {
    console.error(`[GameService Mock] updateGame for ${gameId}: API error.`, error);
    const apiError: ProcessedError = handleAxiosError(error);
    return { 
        success: false, 
        rawMessage: apiError.rawMessage,
    };
  }
}

export async function deleteGame(
  gameId: string
): Promise<{ success: boolean; rawMessage?: string }> {
  try {
    await deleteGameApi(gameId);
    return { success: true };
  } catch (error) {
    console.error(`[GameService Mock] deleteGame for ${gameId}: API error.`, error);
    const apiError = handleAxiosError(error);
    return { success: false, rawMessage: apiError.rawMessage };
  }
}
