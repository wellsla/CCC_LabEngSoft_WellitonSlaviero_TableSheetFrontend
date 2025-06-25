'use server';

import { deleteGameRace as deleteGameRaceService } from '@/services/race';

export async function deleteGameRaceAction(
  raceId: string,
  token: string
): Promise<{ success: boolean; messageKey?: string; rawMessage?: string }> {
  if (!token) {
    return { success: false, messageKey: 'general.authenticationFailed', rawMessage: 'Auth token not provided for deleteGameRaceAction.' };
  }
  try {
    const result = await deleteGameRaceService(raceId, token);
    return result; 
  } catch (error: any) {
    console.error('Error in deleteGameRaceAction:', error);
    return {
      success: false,
      messageKey: 'general.unexpectedError',
      rawMessage: error.message || 'An unexpected error occurred while deleting the game race.',
    };
  }
}
