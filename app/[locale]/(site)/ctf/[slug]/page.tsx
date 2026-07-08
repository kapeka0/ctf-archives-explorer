// eslint-disable-next-line no-restricted-imports -- notFound has no i18n wrapper
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink as ExternalLinkIcon, Files, FolderGit2 } from "lucide-react";
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
      className="group flex items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2 text-sm transition-colors hover:border-primary/60"
      href={githubTreeUrl(challenge.path)}
      rel="noopener noreferrer"
      target="_blank"
    >
      <span className="truncate group-hover:text-primary">{challenge.name}</span>
      <span className="flex shrink-0 items-center gap-1 font-mono text-[10px] text-muted-foreground">
        <Files className="size-3" />
        {challenge.files}
      </span>
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
    <section className="scroll-mt-20 space-y-5" id={`y-${year.year}`}>
      <div className="flex items-baseline gap-3 border-b pb-2">
        <h2 className="font-mono text-2xl font-semibold tabular-nums">{year.year}</h2>
        <span className="text-sm text-muted-foreground">
          {year.challenges.length} {t("challenges")}
        </span>
        {year.ctftime ? (
          <ExternalLink
            className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
            href={year.ctftime}
            rel="noopener noreferrer"
            target="_blank"
          >
            {t("ctftime")}
            <ExternalLinkIcon className="size-3" />
          </ExternalLink>
        ) : null}
      </div>
      {[...byCategory.entries()].map(([category, challenges]) => (
        <div className="space-y-2" key={category}>
          <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {category}
            <span className="ml-2 opacity-60">{challenges.length}</span>
          </h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {challenges.map((challenge) => (
              <ChallengeLink challenge={challenge} key={challenge.path} />
            ))}
          </div>
        </div>
      ))}
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
    <MaxWidthWrapper className="space-y-8 py-10">
      <div className="space-y-5">
        <Link
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          href="/"
        >
          <ArrowLeft className="size-4" />
          {t("back")}
        </Link>

        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">{detail.name}</h1>
          <p className="text-sm text-muted-foreground">
            {detail.years.length} {t("editions")} · {totalChallenges} {t("challenges")}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <ExternalLink
              className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary"
              href={githubTreeUrl(detail.name)}
              rel="noopener noreferrer"
              target="_blank"
            >
              <FolderGit2 className="size-4" />
              {t("viewOnGithub")}
            </ExternalLink>
            {detail.ctftime ? (
              <ExternalLink
                className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary"
                href={detail.ctftime}
                rel="noopener noreferrer"
                target="_blank"
              >
                <ExternalLinkIcon className="size-4" />
                {t("ctftime")}
              </ExternalLink>
            ) : null}
          </div>
        </div>

        <CtfActions slug={detail.slug} />

        {detail.years.length > 1 ? (
          <div className="flex flex-wrap gap-1.5">
            {detail.years.map((year) => (
              <ExternalLink
                className="rounded-full border px-3 py-1 font-mono text-xs text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
                href={`#y-${year.year}`}
                key={year.year}
              >
                {year.year}
              </ExternalLink>
            ))}
          </div>
        ) : null}
      </div>

      <div className="space-y-12">
        {detail.years.map((year) => (
          <YearSection key={year.year} year={year} />
        ))}
      </div>
    </MaxWidthWrapper>
  );
}
