
'use server';

import { deleteGameClass as deleteGameClassService } from '@/services/class';

export async function deleteGameClassAction(
  classId: string,
  token: string // Token must be passed from client
): Promise<{ success: boolean; messageKey?: string; rawMessage?: string }> {
  if (!token) {
    return { success: false, messageKey: 'general.authenticationFailed', rawMessage: 'Auth token not provided for deleteGameClassAction.' };
  }
  try {
    // Pass the token to the service function
    const result = await deleteGameClassService(classId, token);
    return result; 
  } catch (error: any) {
    console.error('Error in deleteGameClassAction:', error);
    return {
      success: false,
      messageKey: 'general.unexpectedError',
      rawMessage: error.message || 'An unexpected error occurred while deleting the game class.',
    };
  }
}
