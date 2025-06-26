
'use server';

import { deleteBook as deleteBookService } from '@/services/book';

export async function deleteBookAction(
  bookId: string
): Promise<{ success: boolean; rawMessage?: string }> {
  try {
    const result = await deleteBookService(bookId);
    return result; 
  } catch (error: any) {
    console.error('Error in deleteBookAction:', error);
    return {
      success: false,
      rawMessage: error.message || 'Ocorreu um erro inesperado ao excluir o livro.',
    };
  }
}
