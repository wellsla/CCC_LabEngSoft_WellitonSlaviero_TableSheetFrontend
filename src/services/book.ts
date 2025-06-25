
'use server';

import { revalidatePath } from 'next/cache';
import {
  getBookListApi,
  getBookDetailsApi,
  createBookApi,
  updateBookApi,
  deleteBookApi,
  type GameBook, 
  handleAxiosError,
  type ProcessedError,
} from '@/lib/apiClient';

export type { GameBook };

interface GameBookServiceResponse {
    success: boolean;
    messageKey?: string;
    rawMessage?: string;
    gameBook?: GameBook;
    gameBooks?: GameBook[];
}

export async function getBookList(gameId?: string, token?: string | null): Promise<GameBook[]> {
  try {
    const books = await getBookListApi(gameId, token);
    return books;
  } catch (error) {
    console.error('[GameBookService] getBookList: API error.', error);
    const processedError = handleAxiosError(error);
    throw new Error(processedError.rawMessage || 'Failed to fetch books.');
  }
}

export async function getBookDetails(bookId: string, token?: string | null): Promise<GameBook | null> {
  try {
    const book = await getBookDetailsApi(bookId, token);
    return book;
  } catch (error: any) {
    console.error(`[GameBookService] getBookDetails for ${bookId}: API error.`, error);
    if (error.response && error.response.status === 404) {
      return null;
    }
    const processedError = handleAxiosError(error);
    throw new Error(processedError.rawMessage || `Failed to fetch book ${bookId}.`);
  }
}

export async function createBook(
  bookData: Omit<GameBook, 'id' | 'created_by' | 'created_at' | 'updated_at'>,
  token: string
): Promise<GameBookServiceResponse> {
  if (!token) {
    return { success: false, messageKey: 'general.authenticationFailed', rawMessage: 'Auth token not provided for createBook.' };
  }
  try {
    const newBook = await createBookApi(bookData, token);
    revalidatePath('/admin/books');
    revalidatePath(`/games/${bookData.game_id}`); 
    return { success: true, gameBook: newBook, messageKey: 'admin.books.form.toastCreateSuccess' };
  } catch (error) {
    console.error('[GameBookService] createBook: API error.', error);
    const apiError: ProcessedError = handleAxiosError(error);
    return { success: false, messageKey: apiError.messageKey, rawMessage: apiError.rawMessage };
  }
}

export async function updateBook(
  bookId: string,
  bookData: Partial<Omit<GameBook, 'id' | 'created_by' | 'created_at' | 'updated_at'>>,
  token: string
): Promise<GameBookServiceResponse> {
  if (!token) {
    return { success: false, messageKey: 'general.authenticationFailed', rawMessage: 'Auth token not provided for updateBook.' };
  }
  try {
    const updatedBook = await updateBookApi(bookId, bookData, token);
    revalidatePath('/admin/books');
    revalidatePath(`/admin/books/${bookId}/edit`);
    if (bookData.game_id || updatedBook.game_id) {
       revalidatePath(`/games/${bookData.game_id || updatedBook.game_id}`);
    }
    return { success: true, gameBook: updatedBook, messageKey: 'admin.books.form.toastUpdateSuccess' };
  } catch (error) {
    console.error(`[GameBookService] updateBook for ${bookId}: API error.`, error);
    const apiError: ProcessedError = handleAxiosError(error);
    if ((error as any).response?.status === 404) {
      return { success: false, messageKey: 'general.notFound', rawMessage: `Book ${bookId} not found.` };
    }
    return { success: false, messageKey: apiError.messageKey, rawMessage: apiError.rawMessage };
  }
}

export async function deleteBook(
  bookId: string,
  token: string
): Promise<{ success: boolean; messageKey?: string; rawMessage?: string }> {
  if (!token) {
    return { success: false, messageKey: 'general.authenticationFailed', rawMessage: 'Auth token not provided for deleteBook.' };
  }
  try {
    const bookToDelete = await getBookDetailsApi(bookId, token);
    const result = await deleteBookApi(bookId, token);
    if (result.success) {
      revalidatePath('/admin/books');
      if (bookToDelete?.game_id) {
        revalidatePath(`/games/${bookToDelete.game_id}`);
      }
    }
    return { ...result, messageKey: result.message ? 'admin.books.page.toastDeleteSuccess' : undefined, rawMessage: result.message };
  } catch (error) {
    console.error(`[GameBookService] deleteBook for ${bookId}: API error.`, error);
    const apiError = handleAxiosError(error);
    return { success: false, messageKey: apiError.messageKey, rawMessage: apiError.rawMessage };
  }
}
