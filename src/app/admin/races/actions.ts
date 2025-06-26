'use server';

import { deleteGameRace } from '@/services/race';
import { revalidatePath } from 'next/cache';

export async function deleteGameRaceAction(
  raceId: string,
  token: string | null
): Promise<{ success: boolean; rawMessage?: string }> {
  const result = await deleteGameRace(raceId, token);
  if (result.success) {
    revalidatePath('/admin/races');
  }
  return result;
}
