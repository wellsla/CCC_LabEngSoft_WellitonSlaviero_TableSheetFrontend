

import {
  getGameClassListApi,
  getGameClassDetailsApi,
  createGameClassApi,
  updateGameClassApi,
  deleteGameClassApi,
  type GameClass,
  handleAxiosError,
  type ProcessedError,
} from '@/lib/apiClient';

export type { GameClass };

interface GameClassServiceResponse {
    success: boolean;
    rawMessage?: string;
    gameClass?: GameClass;
    gameClasses?: GameClass[];
}

export async function getGameClassList(gameId?: string): Promise<GameClass[]> {
  try {
    const classes = await getGameClassListApi(gameId);
    return classes;
  } catch (error) {
    console.error('[GameClassService Mock] getGameClassList: API error.', error);
    const processedError = handleAxiosError(error);
    throw new Error(processedError.rawMessage || 'Falha ao buscar as classes do jogo.');
  }
}

export async function getGameClassDetails(classId: string): Promise<GameClass | null> {
  try {
    const gameClass = await getGameClassDetailsApi(classId);
    return gameClass;
  } catch (error: any) {
    console.error(`[GameClassService Mock] getGameClassDetails for ${classId}: API error.`, error);
    if (error.response && error.response.status === 404) {
      return null;
    }
    const processedError = handleAxiosError(error);
    throw new Error(processedError.rawMessage || `Falha ao buscar a classe ${classId}.`);
  }
}

export async function createGameClass(
  classData: Omit<GameClass, 'id' | 'created_at' | 'updated_at'>
): Promise<GameClassServiceResponse> {
  try {
    const newGameClass = await createGameClassApi(classData);
    return { success: true, gameClass: newGameClass };
  } catch (error) {
    console.error('[GameClassService Mock] createGameClass: API error.', error);
    const apiError: ProcessedError = handleAxiosError(error);
    return { success: false, rawMessage: apiError.rawMessage };
  }
}

export async function updateGameClass(
  classId: string,
  classData: Partial<Omit<GameClass, 'id' | 'created_at' | 'updated_at'>>
): Promise<GameClassServiceResponse> {
  try {
    const updatedGameClass = await updateGameClassApi(classId, classData);
    return { success: true, gameClass: updatedGameClass };
  } catch (error) {
    console.error(`[GameClassService Mock] updateGameClass for ${classId}: API error.`, error);
    const apiError: ProcessedError = handleAxiosError(error);
    return { success: false, rawMessage: apiError.rawMessage };
  }
}

export async function deleteGameClass(
  classId: string
): Promise<{ success: boolean; rawMessage?: string }> {
  try {
    await deleteGameClassApi(classId);
    return { success: true };
  } catch (error) {
    console.error(`[GameClassService Mock] deleteGameClass for ${classId}: API error.`, error);
    const apiError = handleAxiosError(error);
    return { success: false, rawMessage: apiError.rawMessage };
  }
}
