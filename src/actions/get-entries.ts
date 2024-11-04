'use server'

import { db } from '@/db'
import { entries } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { type Entry } from "@/db/schema"

export async function getEntries(type: 'thoughts' | 'activity'): Promise<Entry[]> {
  try {
    const result = await db
      .select()
      .from(entries)
      .where(eq(entries.type, type));
    return result;
  } catch (error) {
    console.error('Error fetching entries:', error);
    throw new Error('Failed to fetch entries');
  }
} 