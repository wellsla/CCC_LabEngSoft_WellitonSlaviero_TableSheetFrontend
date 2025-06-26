
'use server';

import { deleteGameClass as deleteGameClassService } from '@/services/class';

export async function deleteGameClassAction(
  classId: string
): Promise<{ success: boolean; rawMessage?: string }> {
  try {
    const result = await deleteGameClassService(classId);
    return result; 
  } catch (error: any) {
    console.error('Error in deleteGameClassAction:', error);
    return {
      success: false,
      rawMessage: error.message || 'Ocorreu um erro inesperado ao excluir a classe.',
    };
  }
}
