
'use server';

import { deleteCharacter as deleteCharacterService } from '@/services/character';

export async function deleteCharacterAction(
  characterId: string
): Promise<{ success: boolean; rawMessage?: string }> {
  try {
    const result = await deleteCharacterService(characterId); 
    if (result.success) {
      return { success: true, rawMessage: result.rawMessage };
    }
    return { success: false, rawMessage: result.rawMessage };
  } catch (error: any) {
    console.error('Error in deleteCharacterAction:', error);
    return {
      success: false,
      rawMessage: error.message || 'Ocorreu um erro inesperado ao excluir o personagem.',
    };
  }
}
