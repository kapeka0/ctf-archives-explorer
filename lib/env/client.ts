import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const client_env = createEnv({
  client: {
    NEXT_PUBLIC_CONVEX_URL: z.string().url().optional(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
  },
});
