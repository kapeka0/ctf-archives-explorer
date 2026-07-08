import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";

import { i18nConfig } from "./i18nConfig";

export default getRequestConfig(async ({ requestLocale }) => {
  const { locales, defaultLocale } = i18nConfig;
  const requested = await requestLocale;
  const locale = locales.includes(requested as any) ? requested! : defaultLocale;
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
