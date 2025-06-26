'use server';

import { deleteBook } from '@/services/book';
import { revalidatePath } from 'next/cache';

export async function deleteBookAction(
  bookId: string,
  token: string | null
): Promise<{ success: boolean; rawMessage?: string }> {
  const result = await deleteBook(bookId, token);
  if (result.success) {
    revalidatePath('/admin/books');
  }
  return result;
}
