import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const server_env = createEnv({
  server: {
    CAT_API_KEY: z.string().min(1).optional(),
  },
  experimental__runtimeEnv: process.env,
});
