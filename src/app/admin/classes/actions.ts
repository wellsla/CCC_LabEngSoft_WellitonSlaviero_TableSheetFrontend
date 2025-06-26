'use server';

import { deleteGameClass } from '@/services/class';
import { revalidatePath } from 'next/cache';

export async function deleteGameClassAction(
  classId: string,
  token: string | null
): Promise<{ success: boolean; rawMessage?: string }> {
  const result = await deleteGameClass(classId, token);
  if (result.success) {
    revalidatePath('/admin/classes');
  }
  return result;
}
