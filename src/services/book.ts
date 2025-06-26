
import { apiClient } from '@/lib/clientApi';
import { ApiClient, type ApiGameBook, type GameBook } from '@/lib/apiClient';
import { handleAxiosError, type ProcessedError } from '@/lib/apiErrorHandler';

export type { GameBook };

interface GameBookServiceResponse {
  success: boolean;
  rawMessage?: string;
  gameBook?: GameBook;
  errors?: Record<string, string[]>;
}

function transformApiBook(apiBook: ApiGameBook): GameBook {
  return apiBook;
}

export async function getBookList(gameId?: string): Promise<GameBook[]> {
  try {
    const response = await apiClient.getBookList(gameId);
    return response.data
      .filter((book) => !book.deleted_at)
      .map(transformApiBook);
  } catch (error) {
    const processedError = handleAxiosError(error);
    throw new Error(processedError.rawMessage || 'Falha ao buscar livros.');
  }
}

export async function getBookDetails(bookId: string): Promise<GameBook | null> {
  try {
    const response = await apiClient.getBook(bookId);
    return transformApiBook(response.data);
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    const processedError = handleAxiosError(error);
    throw new Error(
      processedError.rawMessage || `Falha ao buscar o livro ${bookId}.`
    );
  }
}

export async function createBook(
  bookData: Partial<
    Omit<GameBook, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'game'>
  >
): Promise<GameBookServiceResponse> {
  const apiPayload: any = { ...bookData };
  if (bookData.game_id) {
    apiPayload.game_id = parseInt(bookData.game_id, 10);
  }

  try {
    const result = await apiClient.createBook(apiPayload);
    return {
      success: true,
      gameBook: transformApiBook(result.data),
      rawMessage: result.message,
    };
  } catch (error) {
    const apiError: ProcessedError = handleAxiosError(error);
    return {
      success: false,
      rawMessage: apiError.rawMessage,
      errors: apiError.errors,
    };
  }
}

export async function updateBook(
  bookId: string,
  bookData: Partial<
    Omit<GameBook, 'id' | 'created_by' | 'created_at' | 'updated_at' | 'game'>
  >
): Promise<GameBookServiceResponse> {
  const apiPayload: any = { ...bookData };
  if (bookData.game_id) {
    apiPayload.game_id = parseInt(bookData.game_id, 10);
  }

  try {
    const result = await apiClient.updateBook(bookId, apiPayload);
    return {
      success: true,
      gameBook: transformApiBook(result.data),
      rawMessage: result.message,
    };
  } catch (error) {
    const apiError: ProcessedError = handleAxiosError(error);
    return {
      success: false,
      rawMessage: apiError.rawMessage,
      errors: apiError.errors,
    };
  }
}

export async function deleteBook(
  bookId: string,
  token: string | null
): Promise<{ success: boolean; rawMessage?: string }> {
  if (!token) {
    return { success: false, rawMessage: 'Não autenticado.' };
  }
  try {
    const serverApiClient = new ApiClient(token);
    const result = await serverApiClient.deleteBook(bookId);
    return { success: true, rawMessage: result.message };
  } catch (error) {
    const apiError = handleAxiosError(error);
    return { success: false, rawMessage: apiError.rawMessage };
  }
}

export async function uploadDocument(
  file: File,
  bookId: string
): Promise<{ success: boolean; rawMessage?: string; url?: string }> {
  try {
    const result = await apiClient.uploadDocument(file, bookId);
    return { success: true, rawMessage: result.message, url: result.data.url };
  } catch (error) {
    const apiError = handleAxiosError(error);
    return { success: false, rawMessage: apiError.rawMessage };
  }
}
