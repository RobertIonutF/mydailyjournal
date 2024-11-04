'use server'

import { db } from "@/db"
import { entries } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function deleteAllEntries(type: 'thoughts' | 'activity') {
  try {
    await db.delete(entries)
      .where(eq(entries.type, type))
    
    revalidatePath('/thoughts')
    revalidatePath('/activity')
    
    return { data: true, error: null }
  } catch {
    return { data: null, error: 'Failed to delete entries' }
  }
} 