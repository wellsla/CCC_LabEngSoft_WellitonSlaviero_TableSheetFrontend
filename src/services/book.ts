

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
    rawMessage?: string;
    gameBook?: GameBook;
    gameBooks?: GameBook[];
}

export async function getBookList(gameId?: string): Promise<GameBook[]> {
  try {
    const books = await getBookListApi(gameId);
    return books;
  } catch (error) {
    console.error('[GameBookService Mock] getBookList: API error.', error);
    const processedError = handleAxiosError(error);
    throw new Error(processedError.rawMessage || 'Falha ao buscar livros.');
  }
}

export async function getBookDetails(bookId: string): Promise<GameBook | null> {
  try {
    const book = await getBookDetailsApi(bookId);
    return book;
  } catch (error: any) {
    console.error(`[GameBookService Mock] getBookDetails for ${bookId}: API error.`, error);
    if (error.response && error.response.status === 404) {
      return null;
    }
    const processedError = handleAxiosError(error);
    throw new Error(processedError.rawMessage || `Falha ao buscar o livro ${bookId}.`);
  }
}

export async function createBook(
  bookData: Omit<GameBook, 'id' | 'created_by' | 'created_at' | 'updated_at'>
): Promise<GameBookServiceResponse> {
  try {
    const newBook = await createBookApi(bookData);
    return { success: true, gameBook: newBook };
  } catch (error) {
    console.error('[GameBookService Mock] createBook: API error.', error);
    const apiError: ProcessedError = handleAxiosError(error);
    return { success: false, rawMessage: apiError.rawMessage };
  }
}

export async function updateBook(
  bookId: string,
  bookData: Partial<Omit<GameBook, 'id' | 'created_by' | 'created_at' | 'updated_at'>>
): Promise<GameBookServiceResponse> {
  try {
    const updatedBook = await updateBookApi(bookId, bookData);
    return { success: true, gameBook: updatedBook };
  } catch (error) {
    console.error(`[GameBookService Mock] updateBook for ${bookId}: API error.`, error);
    const apiError: ProcessedError = handleAxiosError(error);
    return { success: false, rawMessage: apiError.rawMessage };
  }
}

export async function deleteBook(
  bookId: string
): Promise<{ success: boolean; rawMessage?: string }> {
  try {
    await deleteBookApi(bookId);
    return { success: true };
  } catch (error) {
    console.error(`[GameBookService Mock] deleteBook for ${bookId}: API error.`, error);
    const apiError = handleAxiosError(error);
    return { success: false, rawMessage: apiError.rawMessage };
  }
}
