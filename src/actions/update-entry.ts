'use server'

import { db } from "@/db";
import { entries } from "@/db/schema"
import { eq } from "drizzle-orm"
import { type Entry } from "@/db/schema"

export type UpdateEntryResponse = {
  data: Entry | null;
  error: string | null;
}

type UpdateData = Partial<Pick<Entry, 'content' | 'mood'>>

export async function updateEntry(id: number, data: UpdateData): Promise<UpdateEntryResponse> {
  try {
    if (!id) {
      return { data: null, error: 'Entry ID is required' }
    }

    if (data.mood && !['happy', 'neutral', 'sad'].includes(data.mood)) {
      return { data: null, error: 'Invalid mood' }
    }

    if (data.content && !data.content.trim()) {
      return { data: null, error: 'Content cannot be empty' }
    }

    const result = await db
      .update(entries)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(entries.id, id))
      .returning()
    
    if (!result.length) {
      return { data: null, error: 'Entry not found' }
    }

    return { data: result[0], error: null }
  } catch (error) {
    console.error('Failed to update entry:', error)
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to update entry' 
    }
  }
} 