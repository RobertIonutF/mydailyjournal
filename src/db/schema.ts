import { pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const entries = pgTable('entries', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  date: varchar('date', { length: 10 }).notNull(),
  time: varchar('time', { length: 5 }).notNull(),
  mood: varchar('mood', { length: 7 }).notNull(),
  type: varchar('type', { length: 8 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Zod schema for inserting an entry
export const insertEntrySchema = createInsertSchema(entries, {
  mood: z.enum(['happy', 'neutral', 'sad']),
  type: z.enum(['thoughts', 'activity']),
});

// Zod schema for selecting an entry
export const selectEntrySchema = createSelectSchema(entries);

// TypeScript type for an entry
export type Entry = z.infer<typeof selectEntrySchema>;
export type NewEntry = z.infer<typeof insertEntrySchema>;