import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    // Add other server-side environment variables here
  },
  client: {
    // Add client-side environment variables here if needed
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    // Add other environment variables here
  },
}) 