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

  const ledger = [
    { value: index.stats.ctfs, label: t("ctfs") },
    { value: index.stats.events, label: t("events") },
    { value: index.stats.challenges, label: t("challenges") },
  ];

  return (
    <MaxWidthWrapper className="py-14 sm:py-20">
      <section className="max-w-2xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{t("eyebrow")}</p>
        <h1 className="mt-4 text-pretty text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
          {t("titleLead")}{" "}
          <span className="font-mono font-medium">
            <span className="text-brand">{"{"}</span>
            {t("titleFlag")}
            <span className="text-brand">{"}"}</span>
          </span>
        </h1>
        <p className="mt-5 max-w-xl text-pretty leading-relaxed text-muted-foreground">{t("subtitle")}</p>

        <dl className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-sm">
          {ledger.map((stat, i) => (
            <div className="flex items-baseline gap-2" key={stat.label}>
              {i > 0 ? <span className="mr-4 hidden h-4 w-px bg-border sm:inline-block" /> : null}
              <dt className="sr-only">{stat.label}</dt>
              <dd className="font-semibold tabular-nums text-foreground">{stat.value.toLocaleString()}</dd>
              <span className="text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </dl>
      </section>

      <hr className="my-12 border-border" />

      <CtfExplorer ctfs={index.ctfs} />
    </MaxWidthWrapper>
  );
}
