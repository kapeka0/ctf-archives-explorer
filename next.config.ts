import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

import "./lib/env/client";
import "./lib/env/server";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // Next.js 16 explicit caching: `"use cache"` + cacheLife in data readers.
  experimental: {
    useCache: true,
  },
};

export default withNextIntl(nextConfig);
