
import { apiClient } from '@/lib/clientApi';
import { ApiClient, type Character } from '@/lib/apiClient';
import { handleAxiosError, type ProcessedError } from '@/lib/apiErrorHandler';

export type { Character };

interface CharacterServiceResponse {
  success: boolean;
  rawMessage?: string;
  character?: Character;
  characters?: Character[];
}

export async function getCharacterList(): Promise<Character[]> {
  try {
    const response = await apiClient.getCharacterList();
    return response.data.filter((char) => !char.deleted_at);
  } catch (error) {
    const processedError = handleAxiosError(error);
    throw new Error(processedError.rawMessage || 'Falha ao buscar personagens.');
  }
}

export async function getCharacterDetails(
  characterId: string
): Promise<Character | null> {
  try {
    const response = await apiClient.getCharacter(characterId);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    const processedError = handleAxiosError(error);
    throw new Error(
      processedError.rawMessage ||
      `Falha ao buscar o personagem ${characterId}.`
    );
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
  characterData: Omit<
    Character,
    'id' | 'created_at' | 'updated_at' | 'game' | 'race' | 'class' | 'user'
  >
): Promise<CharacterServiceResponse> {
  const payload = prepareCharacterPayload(characterData);
  const apiPayload = {
    ...payload,
    user_id: parseInt(payload.user_id, 10),
    game_id: parseInt(payload.game_id, 10),
    race_id: parseInt(payload.race_id, 10),
    class_id: parseInt(payload.class_id, 10),
  };

  try {
    const result = await apiClient.createCharacter(apiPayload as any);
    return {
      success: true,
      character: result.data,
      rawMessage: result.message,
    };
  } catch (error) {
    const apiError: ProcessedError = handleAxiosError(error);
    return {
      success: false,
      rawMessage: apiError.rawMessage,
    };
  }
}

export async function updateCharacter(
  characterId: string,
  characterData: Partial<
    Omit<
      Character,
      | 'id'
      | 'created_at'
      | 'updated_at'
      | 'user_id'
      | 'game'
      | 'race'
      | 'class'
      | 'user'
    >
  >
): Promise<CharacterServiceResponse> {
  const payload = prepareCharacterPayload(characterData);
  const apiPayload: any = { ...payload };

  if (payload.game_id) apiPayload.game_id = parseInt(payload.game_id, 10);
  if (payload.race_id) apiPayload.race_id = parseInt(payload.race_id, 10);
  if (payload.class_id) apiPayload.class_id = parseInt(payload.class_id, 10);

  try {
    const result = await apiClient.updateCharacter(characterId, apiPayload);
    return {
      success: true,
      character: result.data,
      rawMessage: result.message,
    };
  } catch (error) {
    const apiError: ProcessedError = handleAxiosError(error);
    return {
      success: false,
      rawMessage: apiError.rawMessage,
    };
  }
}

export async function deleteCharacter(
  characterId: string,
  token: string | null
): Promise<{ success: boolean; rawMessage?: string }> {
  if (!token) {
    return { success: false, rawMessage: 'Não autenticado.' };
  }
  try {
    const serverApiClient = new ApiClient(token);
    const result = await serverApiClient.deleteCharacter(characterId);
    return { success: true, rawMessage: result.message };
  } catch (error) {
    const apiError = handleAxiosError(error);
    return { success: false, rawMessage: apiError.rawMessage };
  }
}

export async function uploadPortrait(
  file: File,
  characterId: string
): Promise<{ success: boolean; rawMessage?: string; url?: string }> {
  try {
    const result = await apiClient.uploadPortrait(file, characterId);
    return { success: true, rawMessage: result.message, url: result.data.url };
  } catch (error) {
    const apiError = handleAxiosError(error);
    return { success: false, rawMessage: apiError.rawMessage };
  }
}
