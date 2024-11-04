'use server'

import { db } from "@/db";
import { entries } from "@/db/schema"
import { eq } from "drizzle-orm"
import { type Entry } from "@/db/schema"

export type DeleteEntryResponse = {
  data: Entry | null;
  error: string | null;
}

export async function deleteEntry(id: number): Promise<DeleteEntryResponse> {
  try {
    if (!id) {
      return { data: null, error: 'Entry ID is required' }
    }

    const result = await db
      .delete(entries)
      .where(eq(entries.id, id))
      .returning()
    
    if (!result.length) {
      return { data: null, error: 'Entry not found' }
    }

    return { data: result[0], error: null }
  } catch (error) {
    console.error('Failed to delete entry:', error)
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to delete entry' 
    }
  }
} 