
'use server';
import { ApiClient } from '@/lib/apiClient';
import { handleAxiosError } from './apiErrorHandler';

function getPathFromUrl(fileUrl: string): string | null {
  try {
    const url = new URL(fileUrl);
    // Pathname will be like /storage/avatars/file.png
    const storagePrefix = '/storage/';
    if (url.pathname.startsWith(storagePrefix)) {
      return url.pathname.substring(storagePrefix.length);
    }
    return null;
  } catch (e) {
    return null;
  }
}

export async function deleteFileByUrlAction(
  fileUrl: string,
  token: string | null
): Promise<{ success: boolean; rawMessage?: string }> {
  if (!token) {
    return { success: false, rawMessage: 'Não autenticado.' };
  }
  if (!fileUrl) {
    return { success: true }; // Nothing to delete
  }

  const path = getPathFromUrl(fileUrl);
  if (!path) {
    return { success: true };
  }

  const localApiClient = new ApiClient(token);
  try {
    const result = await localApiClient.deleteFile(path);
    return { success: true, rawMessage: result.message };
  } catch (error: any) {
    const processedError = handleAxiosError(error);
    return {
      success: false,
      rawMessage:
        processedError.rawMessage ||
        'Ocorreu um erro inesperado ao excluir o arquivo.',
    };
  }
}
