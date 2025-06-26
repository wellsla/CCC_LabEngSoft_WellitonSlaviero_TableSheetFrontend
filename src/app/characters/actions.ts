'use server';

import { deleteCharacter } from '@/services/character';
import { revalidatePath } from 'next/cache';

export async function deleteCharacterAction(
  characterId: string,
  token: string | null
): Promise<{ success: boolean; rawMessage?: string }> {
  const result = await deleteCharacter(characterId, token);
  if (result.success) {
    revalidatePath('/characters');
    revalidatePath(`/characters/${characterId}`);
  }
  return result;
}
