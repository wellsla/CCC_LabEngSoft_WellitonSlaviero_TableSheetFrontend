
'use server';

import { deleteCharacter as deleteCharacterService } from '@/services/character';

export async function deleteCharacterAction(
  characterId: string,
  token: string // Token must be passed from client
): Promise<{ success: boolean; messageKey?: string; rawMessage?: string }> {
  if (!token) {
    return { success: false, messageKey: 'general.authenticationFailed', rawMessage: 'Auth token not provided for deleteCharacterAction.' };
  }
  try {
    // Pass the token to the service function
    const result = await deleteCharacterService(characterId, token); 
    if (result.success) {
      return {
        success: true,
        messageKey: result.messageKey || 'charactersPage.toastDeleteSuccessDescription',
        rawMessage: result.rawMessage,
      };
    }
    return {
      success: false,
      messageKey: result.messageKey || 'charactersPage.toastDeleteFailDescription',
      rawMessage: result.rawMessage,
    };
  } catch (error: any) {
    console.error('Error in deleteCharacterAction:', error);
    // Assuming handleAxiosError is not used here, but error object might have message
    // For consistency, we should ensure service layer returns ProcessedError structure
    return {
      success: false,
      messageKey: 'general.unexpectedError',
      rawMessage:
        error.message ||
        'An unexpected error occurred while deleting the character.',
    };
  }
}
