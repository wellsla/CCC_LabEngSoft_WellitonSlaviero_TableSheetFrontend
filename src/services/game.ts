
import { apiClient } from '@/lib/clientApi';
import { ApiClient, type Game } from '@/lib/apiClient';
import { handleAxiosError, type ProcessedError } from '@/lib/apiErrorHandler';

export type { Game };

interface GameServiceResponse {
  success: boolean;
  rawMessage?: string;
  game?: Game;
  errors?: Record<string, string[]>;
}

export async function getGameList(): Promise<Game[]> {
  try {
    const response = await apiClient.getGameList();
    return response.data.filter((game) => !game.deleted_at);
  } catch (error) {
    const processedError = handleAxiosError(error);
    throw new Error(
      processedError.rawMessage || 'Falha ao buscar a lista de jogos.'
    );
  }
}

export async function getGameDetails(gameId: string): Promise<Game | null> {
  try {
    const response = await apiClient.getGame(gameId);
    const game = response.data;

    if (game.books) {
      game.books = game.books.filter((book) => !book.deleted_at);
    }
    if (game.classes) {
      game.classes = game.classes.filter((cls) => !cls.deleted_at);
    }
    if (game.races) {
      game.races = game.races.filter((race) => !race.deleted_at);
    }

    return game;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    const processedError = handleAxiosError(error);
    throw new Error(
      processedError.rawMessage || `Falha ao buscar detalhes do jogo ${gameId}.`
    );
  }
}

export async function createGame(
  gameData: Omit<
    Game,
    'id' | 'dataAiHint' | 'created_at' | 'updated_at' | 'created_by'
  >
): Promise<GameServiceResponse> {
  const payload = { ...gameData };
  try {
    const result = await apiClient.createGame(payload);
    return {
      success: true,
      game: result.data,
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

export async function updateGame(
  gameId: string,
  gameData: Partial<
    Omit<Game, 'id' | 'dataAiHint' | 'created_by' | 'created_at' | 'updated_at'>
  >
): Promise<GameServiceResponse> {
  const payload = { ...gameData };
  // Transform empty string to null for the API
  if (payload.cover_image_url === '') {
    payload.cover_image_url = null;
  }
  try {
    const result = await apiClient.updateGame(gameId, payload);
    return {
      success: true,
      game: result.data,
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

export async function deleteGame(
  gameId: string,
  token: string | null
): Promise<{ success: boolean; rawMessage?: string }> {
  if (!token) {
    return { success: false, rawMessage: 'Não autenticado.' };
  }
  try {
    const serverApiClient = new ApiClient(token);
    const result = await serverApiClient.deleteGame(gameId);
    return { success: true, rawMessage: result.message };
  } catch (error) {
    const apiError = handleAxiosError(error);
    return { success: false, rawMessage: apiError.rawMessage };
  }
}

export async function uploadCoverImage(
  file: File,
  gameId: string
): Promise<{ success: boolean; rawMessage?: string; url?: string }> {
  try {
    const result = await apiClient.uploadCoverImage(file, gameId);
    return { success: true, rawMessage: result.message, url: result.data.url };
  } catch (error) {
    const apiError = handleAxiosError(error);
    return { success: false, rawMessage: apiError.rawMessage };
  }
}
