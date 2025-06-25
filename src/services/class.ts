
'use server';

import { revalidatePath } from 'next/cache';
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
    messageKey?: string;
    rawMessage?: string;
    gameClass?: GameClass;
    gameClasses?: GameClass[];
}

export async function getGameClassList(gameId?: string, token?: string | null): Promise<GameClass[]> {
  try {
    const classes = await getGameClassListApi(gameId, token);
    return classes;
  } catch (error) {
    console.error('[GameClassService] getGameClassList: API error.', error);
    const processedError = handleAxiosError(error);
    throw new Error(processedError.rawMessage || 'Failed to fetch game classes.');
  }
}

export async function getGameClassDetails(classId: string, token: string): Promise<GameClass | null> {
  if (!token) {
    console.warn(`[GameClassService] getGameClassDetails for ${classId}: No auth token provided.`);
    throw new Error('Authentication token is required to fetch game class details.');
  }
  try {
    const gameClass = await getGameClassDetailsApi(classId, token);
    return gameClass;
  } catch (error: any) {
    console.error(`[GameClassService] getGameClassDetails for ${classId}: API error.`, error);
    if (error.response && error.response.status === 404) {
      return null;
    }
    const processedError = handleAxiosError(error);
    throw new Error(processedError.rawMessage || `Failed to fetch game class ${classId}.`);
  }
}

export async function createGameClass(
  classData: Omit<GameClass, 'id' | 'created_at' | 'updated_at'>,
  token: string
): Promise<GameClassServiceResponse> {
  if (!token) {
    return { success: false, messageKey: 'general.authenticationFailed', rawMessage: 'Auth token not provided for createGameClass.' };
  }
  try {
    const newGameClass = await createGameClassApi(classData, token);
    revalidatePath('/admin/classes');
    if (classData.game_id) {
      revalidatePath(`/admin/games/${classData.game_id}/edit`); 
    }
    return { success: true, gameClass: newGameClass, messageKey: 'admin.classes.form.toastCreateSuccess' };
  } catch (error) {
    console.error('[GameClassService] createGameClass: API error.', error);
    const apiError: ProcessedError = handleAxiosError(error);
    return { success: false, messageKey: apiError.messageKey, rawMessage: apiError.rawMessage };
  }
}

export async function updateGameClass(
  classId: string,
  classData: Partial<Omit<GameClass, 'id' | 'created_at' | 'updated_at'>>,
  token: string
): Promise<GameClassServiceResponse> {
  if (!token) {
    return { success: false, messageKey: 'general.authenticationFailed', rawMessage: 'Auth token not provided for updateGameClass.' };
  }
  try {
    const updatedGameClass = await updateGameClassApi(classId, classData, token);
    revalidatePath('/admin/classes');
    revalidatePath(`/admin/classes/${classId}/edit`);
    if (classData.game_id || updatedGameClass.game_id) {
      revalidatePath(`/admin/games/${classData.game_id || updatedGameClass.game_id}/edit`);
    }
    return { success: true, gameClass: updatedGameClass, messageKey: 'admin.classes.form.toastUpdateSuccess' };
  } catch (error) {
    console.error(`[GameClassService] updateGameClass for ${classId}: API error.`, error);
    const apiError: ProcessedError = handleAxiosError(error);
    if ((error as any).response?.status === 404) {
      return { success: false, messageKey: 'general.notFound', rawMessage: `Game class ${classId} not found.` };
    }
    return { success: false, messageKey: apiError.messageKey, rawMessage: apiError.rawMessage };
  }
}

export async function deleteGameClass(
  classId: string,
  token: string
): Promise<{ success: boolean; messageKey?: string; rawMessage?: string }> {
  if (!token) {
     return { success: false, messageKey: 'general.authenticationFailed', rawMessage: 'Auth token not provided for deleteGameClass.' };
  }
  try {
    const result = await deleteGameClassApi(classId, token);
    if (result.success) {
      revalidatePath('/admin/classes');
    }
    return { ...result, messageKey: result.message ? 'admin.classes.page.toastDeleteSuccess' : undefined, rawMessage: result.message };
  } catch (error) {
    console.error(`[GameClassService] deleteGameClass for ${classId}: API error.`, error);
    const apiError = handleAxiosError(error);
    return { success: false, messageKey: apiError.messageKey, rawMessage: apiError.rawMessage };
  }
}
