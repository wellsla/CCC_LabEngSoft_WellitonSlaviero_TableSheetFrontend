
'use server';

import { deleteGame as deleteGameService } from '@/services/game';
import { revalidatePath } from 'next/cache';

export async function deleteGameAction(
  gameId: string
): Promise<{ success: boolean; rawMessage?: string }> {
  try {
    const result = await deleteGameService(gameId); 
    if (result.success) {
      revalidatePath('/admin/games');
      revalidatePath('/games'); 
      revalidatePath(`/games/${gameId}`); 
      return { success: true, rawMessage: result.rawMessage };
    }
    return { success: false, rawMessage: result.rawMessage };
  } catch (error: any) {
    console.error('Error in deleteGameAction:', error);
    return {
      success: false,
      rawMessage:
        error.message ||
        'Ocorreu um erro inesperado ao excluir o jogo.',
    };
  }
}
