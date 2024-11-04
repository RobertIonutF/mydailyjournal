'use server'

import { db } from "@/db";
import { entries, type NewEntry, type Entry } from "@/db/schema"

export type CreateEntryResponse = {
  data: Entry | null;
  error: string | null;
}

export async function createEntry(data: Omit<NewEntry, 'createdAt' | 'updatedAt'>): Promise<CreateEntryResponse> {
  try {
    if (!data.content?.trim()) {
      return { data: null, error: 'Content is required' }
    }

    if (!data.type || !['thoughts', 'activity'].includes(data.type)) {
      return { data: null, error: 'Invalid entry type' }
    }

    if (!data.mood || !['happy', 'neutral', 'sad'].includes(data.mood)) {
      return { data: null, error: 'Invalid mood' }
    }

    const now = new Date()
    const result = await db.insert(entries).values({
      ...data,
      createdAt: now,
      updatedAt: now,
    }).returning()

    return { data: result[0], error: null }
  } catch (error) {
    console.error('Failed to create entry:', error)
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to create entry' 
    }
  }
} 