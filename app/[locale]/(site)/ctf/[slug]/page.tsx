// eslint-disable-next-line no-restricted-imports -- notFound has no i18n wrapper
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import CtfActions from "@/components/ctf/CtfActions";
import ExternalLink from "@/components/ui/external-link";
import MaxWidthWrapper from "@/components/ui/MaxWidthWrapper";
import { Link } from "@/i18n/routing";
import { getCtfDetail, getCtfIndex } from "@/lib/ctf/data";
import { githubTreeUrl, type CtfChallenge, type CtfYear } from "@/lib/ctf/types";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  const index = await getCtfIndex();
  return index.ctfs.map((ctf) => ({ slug: ctf.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const detail = await getCtfDetail(slug);
  return { title: detail ? `${detail.name} · CTF Archives` : "CTF Archives" };
}

function ChallengeLink({ challenge }: { challenge: CtfChallenge }) {
  return (
    <ExternalLink
      className="group flex items-center justify-between gap-2 rounded-md border border-border bg-card px-2.5 py-1.5 text-sm transition-colors hover:border-brand/50"
      href={githubTreeUrl(challenge.path)}
      rel="noopener noreferrer"
      target="_blank"
    >
      <span className="truncate font-mono text-[13px] text-foreground/90 group-hover:text-brand">{challenge.name}</span>
      <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground/50 transition-colors group-hover:text-brand" />
    </ExternalLink>
  );
}

async function YearSection({ year }: { year: CtfYear }) {
  const t = await getTranslations("Ctf");
  const byCategory = new Map<string, CtfChallenge[]>();
  for (const challenge of year.challenges) {
    const list = byCategory.get(challenge.category);
    if (list) list.push(challenge);
    else byCategory.set(challenge.category, [challenge]);
  }

  return (
    <section className="scroll-mt-20" id={`y-${year.year}`}>
      <div className="mb-5 flex items-baseline gap-3">
        <h2 className="font-mono text-xl font-semibold tabular-nums tracking-tight">{year.year}</h2>
        <span className="font-mono text-[11px] text-muted-foreground">
          {year.challenges.length} {t("challenges")}
        </span>
        {year.ctftime ? (
          <ExternalLink
            className="ml-auto flex items-center gap-1 font-mono text-[11px] text-muted-foreground transition-colors hover:text-brand"
            href={year.ctftime}
            rel="noopener noreferrer"
            target="_blank"
          >
            {t("ctftime")}
            <ArrowUpRight className="size-3" />
          </ExternalLink>
        ) : null}
      </div>
      <div className="space-y-6">
        {[...byCategory.entries()].map(([category, challenges]) => (
          <div className="grid gap-3 sm:grid-cols-[9rem_1fr]" key={category}>
            <h3 className="pt-0.5 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {category}
              <span className="ml-1.5 text-border">{challenges.length}</span>
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {challenges.map((challenge) => (
                <ChallengeLink challenge={challenge} key={challenge.path} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function CtfPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const detail = await getCtfDetail(slug);
  if (!detail) notFound();

  const t = await getTranslations("Ctf");
  const totalChallenges = detail.years.reduce((n, y) => n + y.challenges.length, 0);

  return (
    <MaxWidthWrapper className="py-10">
      <Link
        className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
        href="/"
      >
        <ArrowLeft className="size-3.5" />
        {t("back")}
      </Link>

      <header className="mt-6 border-b border-border pb-8">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{detail.name}</h1>
        <p className="mt-2 font-mono text-[13px] text-muted-foreground">
          {detail.years.length} {t("editions")}
          <span className="mx-2 text-border">·</span>
          {totalChallenges} {t("challenges")}
          <span className="mx-2 text-border">·</span>
          {detail.years[detail.years.length - 1].year}–{detail.years[0].year}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[13px]">
          <ExternalLink
            className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-brand"
            href={githubTreeUrl(detail.name)}
            rel="noopener noreferrer"
            target="_blank"
          >
            {t("viewOnGithub")}
            <ArrowUpRight className="size-3.5" />
          </ExternalLink>
          {detail.ctftime ? (
            <ExternalLink
              className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-brand"
              href={detail.ctftime}
              rel="noopener noreferrer"
              target="_blank"
            >
              {t("ctftime")}
              <ArrowUpRight className="size-3.5" />
            </ExternalLink>
          ) : null}
        </div>

        <div className="mt-6">
          <CtfActions slug={detail.slug} />
        </div>

        {detail.years.length > 1 ? (
          <nav className="mt-6 flex flex-wrap gap-1.5" aria-label={t("yearJump")}>
            {detail.years.map((year) => (
              <ExternalLink
                className="rounded border border-border px-2 py-1 font-mono text-[11px] text-muted-foreground transition-colors hover:border-brand/50 hover:text-foreground"
                href={`#y-${year.year}`}
                key={year.year}
              >
                {year.year}
              </ExternalLink>
            ))}
          </nav>
        ) : null}
      </header>

      <div className="mt-10 space-y-12">
        {detail.years.map((year) => (
          <YearSection key={year.year} year={year} />
        ))}
      </div>
    </MaxWidthWrapper>
  );
}
