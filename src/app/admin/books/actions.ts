'use server';

import { deleteBook as deleteBookService } from '@/services/book';

export async function deleteBookAction(
  bookId: string,
  token: string
): Promise<{ success: boolean; messageKey?: string; rawMessage?: string }> {
  if (!token) {
    return { success: false, messageKey: 'general.authenticationFailed', rawMessage: 'Auth token not provided for deleteBookAction.' };
  }
  try {
    const result = await deleteBookService(bookId, token);
    return result; 
  } catch (error: any) {
    console.error('Error in deleteBookAction:', error);
    return {
      success: false,
      messageKey: 'general.unexpectedError',
      rawMessage: error.message || 'An unexpected error occurred while deleting the book.',
    };
  }
}
