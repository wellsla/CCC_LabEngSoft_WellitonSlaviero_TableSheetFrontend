
'use server';

import { deleteGame as deleteGameService } from '@/services/game';
import { revalidatePath } from 'next/cache';

export async function deleteGameAction(
  gameId: string,
  token: string // Token must be passed from client
): Promise<{ success: boolean; messageKey?: string; rawMessage?: string }> {
  if (!token) {
    return { success: false, messageKey: 'general.authenticationFailed', rawMessage: 'Auth token not provided for deleteGameAction.' };
  }
  try {
    // Pass the token to the service function
    const result = await deleteGameService(gameId, token); 
    if (result.success) {
      revalidatePath('/admin/games');
      revalidatePath('/games'); 
      revalidatePath(`/games/${gameId}`); 
      return { success: true, messageKey: result.messageKey || 'admin.games.page.toastDeleteSuccessDescription', rawMessage: result.rawMessage };
    }
    return { success: false, messageKey: result.messageKey || 'admin.games.page.toastDeleteFailDescription', rawMessage: result.rawMessage };
  } catch (error: any) {
    console.error('Error in deleteGameAction:', error);
    return {
      success: false,
      messageKey: 'general.unexpectedError',
      rawMessage:
        error.message ||
        'An unexpected error occurred while deleting the game.',
    };
  }
}
