import "dotenv/config";
import { z } from "zod";

const configSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  FRONTEND_URL: z.string().url(),
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const result = configSchema.safeParse(process.env);
if (!result.success) {
  throw new Error(`Invalid environment configuration: ${result.error.message}`);
}

export const config = result.data;
