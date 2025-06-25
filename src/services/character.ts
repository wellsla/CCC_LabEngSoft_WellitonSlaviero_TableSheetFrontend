'use server';

import { revalidatePath } from 'next/cache';
import {
  getCharacterListApi,
  getCharacterDetailsApi,
  createCharacterApi,
  updateCharacterApi,
  deleteCharacterApi,
  type CharacterSheetFromAPI,
  handleAxiosError,
  type ProcessedError,
} from '@/lib/apiClient';

export interface Character extends CharacterSheetFromAPI {}

interface CharacterServiceResponse {
    success: boolean;
    messageKey?: string;
    rawMessage?: string;
    character?: Character;
    characters?: Character[];
}

export async function getCharacterList(token: string): Promise<Character[]> {
  if (!token) {
    console.warn(
      '[CharacterService] getCharacterList: No auth token provided. Returning empty list.'
    );
    return [];
  }

  try {
    const apiCharacters = await getCharacterListApi(token);
    return apiCharacters;
  } catch (error) {
    console.error(
      '[CharacterService] getCharacterList: Failed to fetch characters from API.',
      error
    );
    const processedError = handleAxiosError(error);
    throw new Error(processedError.rawMessage || 'Failed to fetch characters.');
  }
}

export async function getCharacterDetails(
  characterId: string,
  token: string
): Promise<Character | null> {
  if (!token) {
    console.warn(
      `[CharacterService] getCharacterDetails for ${characterId}: No auth token provided.`
    );
    return null; 
  }

  try {
    const apiCharacter = await getCharacterDetailsApi(characterId, token);
    return apiCharacter;
  } catch (error: any) {
    console.error(
      `[CharacterService] getCharacterDetails for ${characterId}: Failed to fetch details from API.`,
      error
    );
    if (error.response && error.response.status === 404) {
      return null;
    }
    const processedError = handleAxiosError(error);
    throw new Error(processedError.rawMessage || `Failed to fetch character ${characterId}.`);
  }
}

function prepareCharacterPayload<T extends object>(data: T): T {
  const payload = { ...data };
  (Object.keys(payload) as Array<keyof T>).forEach((key) => {
    const value = payload[key];
    if (value === '' || value === null) { 
      (payload as any)[key] = undefined;
    }
  });
  return payload;
}


export async function createCharacter(
  characterData: Omit<Character, 'id' | 'created_at' | 'updated_at'>,
  token: string
): Promise<CharacterServiceResponse> {
  if (!token) {
    return { success: false, messageKey: 'general.authenticationFailed', rawMessage: 'Auth token not provided for createCharacter.' };
  }
  
  if (!characterData.user_id) {
     return { success: false, messageKey: 'general.unexpectedError', rawMessage: 'User ID is missing from character payload.' };
  }

  const payload = prepareCharacterPayload(characterData);
  
  try {
    const newApiCharacter = await createCharacterApi(payload, token);
    revalidatePath('/characters');
    return { success: true, character: newApiCharacter, messageKey: 'characterForm.toastCreateSuccessDescription' };
  } catch (error) {
    console.error('[CharacterService] createCharacter: API error.', error);
    const apiError: ProcessedError = handleAxiosError(error);
    return { 
        success: false, 
        messageKey: apiError.messageKey,
        rawMessage: apiError.rawMessage,
    };
  }
}

export async function updateCharacter(
  characterId: string,
  characterData: Partial<Omit<Character, 'id' | 'created_at' | 'updated_at' | 'user_id'>>,
  token: string
): Promise<CharacterServiceResponse> {
  if (!token) {
    return { success: false, messageKey: 'general.authenticationFailed', rawMessage: 'Auth token not provided for updateCharacter.' };
  }

  const payload = prepareCharacterPayload(characterData);

  try {
    const updatedApiCharacter = await updateCharacterApi(
      characterId,
      payload,
      token
    );
    revalidatePath('/characters');
    revalidatePath(`/characters/${characterId}`);
    revalidatePath(`/characters/${characterId}/edit`);
    return { success: true, character: updatedApiCharacter, messageKey: 'characterForm.toastUpdateSuccessDescription' };
  } catch (error) {
     console.error(`[CharacterService] updateCharacter for ${characterId}: API error.`, error);
    const apiError: ProcessedError = handleAxiosError(error);
    if ((error as any).response?.status === 404) {
        return { success: false, messageKey: 'general.notFound', rawMessage: `Character ${characterId} not found.`};
    }
    return { 
        success: false, 
        messageKey: apiError.messageKey,
        rawMessage: apiError.rawMessage,
    };
  }
}

export async function deleteCharacter(
  characterId: string,
  token: string
): Promise<{ success: boolean; messageKey?: string; rawMessage?: string }> {
  if (!token) {
    return { success: false, messageKey: 'general.authenticationFailed', rawMessage: 'Auth token not provided for deleteCharacter.' };
  }

  try {
    const result = await deleteCharacterApi(characterId, token);
    if (result.success) {
      revalidatePath('/characters');
      revalidatePath(`/characters/${characterId}`);
      revalidatePath(`/characters/${characterId}/edit`);
    }
    return { ...result, messageKey: result.message ? 'charactersPage.toastDeleteSuccessDescription' : undefined, rawMessage: result.message };
  } catch (error) {
    console.error(`[CharacterService] deleteCharacter for ${characterId}: API error.`, error);
    const apiError = handleAxiosError(error);
    return { success: false, messageKey: apiError.messageKey, rawMessage: apiError.rawMessage };
  }
}
