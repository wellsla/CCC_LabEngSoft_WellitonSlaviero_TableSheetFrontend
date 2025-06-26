
'use server';

import { deleteGame } from '@/services/game';
import { revalidatePath } from 'next/cache';

export async function deleteGameAction(
  gameId: string,
  token: string | null
): Promise<{ success: boolean; rawMessage?: string }> {
  const result = await deleteGame(gameId, token);
  if (result.success) {
    revalidatePath('/admin/games');
    revalidatePath('/games');
    revalidatePath(`/games/${gameId}`);
  }
  return result;
}
