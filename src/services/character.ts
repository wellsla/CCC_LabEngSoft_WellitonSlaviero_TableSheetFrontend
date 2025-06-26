

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
    rawMessage?: string;
    character?: Character;
    characters?: Character[];
}

export async function getCharacterList(userId: string): Promise<Character[]> {
  try {
    const apiCharacters = await getCharacterListApi(userId);
    return apiCharacters;
  } catch (error) {
    console.error('[CharacterService Mock] getCharacterList: Failed to fetch characters from mock API.', error);
    const processedError = handleAxiosError(error);
    throw new Error(processedError.rawMessage || 'Falha ao buscar personagens.');
  }
}

export async function getCharacterDetails(
  characterId: string
): Promise<Character | null> {
  try {
    const apiCharacter = await getCharacterDetailsApi(characterId);
    return apiCharacter;
  } catch (error: any) {
    console.error(`[CharacterService Mock] getCharacterDetails for ${characterId}: Failed to fetch from mock API.`, error);
    if (error.response && error.response.status === 404) {
      return null;
    }
    const processedError = handleAxiosError(error);
    throw new Error(processedError.rawMessage || `Falha ao buscar o personagem ${characterId}.`);
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
  characterData: Omit<Character, 'id' | 'created_at' | 'updated_at'>
): Promise<CharacterServiceResponse> {
  if (!characterData.user_id) {
     return { success: false, rawMessage: 'ID do usuário está faltando.' };
  }

  const payload = prepareCharacterPayload(characterData);
  
  try {
    const newApiCharacter = await createCharacterApi(payload as Character);
    return { success: true, character: newApiCharacter };
  } catch (error) {
    console.error('[CharacterService Mock] createCharacter: API error.', error);
    const apiError: ProcessedError = handleAxiosError(error);
    return { 
        success: false, 
        rawMessage: apiError.rawMessage,
    };
  }
}

export async function updateCharacter(
  characterId: string,
  characterData: Partial<Omit<Character, 'id' | 'created_at' | 'updated_at' | 'user_id'>>
): Promise<CharacterServiceResponse> {
  const payload = prepareCharacterPayload(characterData);
  try {
    const updatedApiCharacter = await updateCharacterApi(characterId, payload);
    return { success: true, character: updatedApiCharacter };
  } catch (error) {
     console.error(`[CharacterService Mock] updateCharacter for ${characterId}: API error.`, error);
    const apiError: ProcessedError = handleAxiosError(error);
    return { 
        success: false, 
        rawMessage: apiError.rawMessage,
    };
  }
}

export async function deleteCharacter(
  characterId: string
): Promise<{ success: boolean; rawMessage?: string }> {
  try {
    await deleteCharacterApi(characterId);
    return { success: true };
  } catch (error) {
    console.error(`[CharacterService Mock] deleteCharacter for ${characterId}: API error.`, error);
    const apiError = handleAxiosError(error);
    return { success: false, rawMessage: apiError.rawMessage };
  }
}
