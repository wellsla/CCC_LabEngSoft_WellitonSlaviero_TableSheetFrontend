
'use server';

import { deleteGameRace as deleteGameRaceService } from '@/services/race';

export async function deleteGameRaceAction(
  raceId: string
): Promise<{ success: boolean; rawMessage?: string }> {
  try {
    const result = await deleteGameRaceService(raceId);
    return result; 
  } catch (error: any) {
    console.error('Error in deleteGameRaceAction:', error);
    return {
      success: false,
      rawMessage: error.message || 'Ocorreu um erro inesperado ao excluir a raça.',
    };
  }
}
