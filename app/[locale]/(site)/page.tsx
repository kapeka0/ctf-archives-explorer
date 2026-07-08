import { getTranslations, setRequestLocale } from "next-intl/server";

import CtfExplorer from "@/components/ctf/CtfExplorer";
import MaxWidthWrapper from "@/components/ui/MaxWidthWrapper";
import { getCtfIndex } from "@/lib/ctf/data";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Home");
  const index = await getCtfIndex();

  const stats = [
    { value: index.stats.ctfs, label: t("ctfs") },
    { value: index.stats.events, label: t("events") },
    { value: index.stats.challenges, label: t("challenges") },
  ];

  return (
    <MaxWidthWrapper className="space-y-10 py-12">
      <section className="space-y-4 text-center">
        <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">{t("title")}</h1>
        <p className="mx-auto max-w-2xl text-pretty text-muted-foreground">{t("subtitle")}</p>
        <div className="flex items-center justify-center gap-8 pt-2">
          {stats.map((stat) => (
            <div className="text-center" key={stat.label}>
              <p className="font-mono text-2xl font-semibold tabular-nums">{stat.value.toLocaleString()}</p>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <CtfExplorer ctfs={index.ctfs} />
    </MaxWidthWrapper>
  );
}
