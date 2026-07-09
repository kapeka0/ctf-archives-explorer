"use client";

import { useQuery } from "convex/react";
import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";

import ExternalLink from "@/components/ui/external-link";
import { api } from "@/convex/_generated/api";

function CommunitySubmissions() {
  const t = useTranslations("Home");
  const submissions = useQuery(api.submissions.list);

  if (!submissions || submissions.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="mb-4 flex items-baseline gap-2">
        <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{t("community")}</h2>
        <span className="font-mono text-[11px] text-border">{submissions.length}</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {submissions.map((s) => {
          const Card = (
            <>
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-[15px] font-medium leading-snug tracking-tight">{s.name}</h3>
                {s.url ? (
                  <ArrowUpRight className="size-4 shrink-0 text-muted-foreground/50 transition-colors group-hover:text-brand" />
                ) : null}
              </div>
              <p className="font-mono text-[11px] text-muted-foreground">{s.year}</p>
              {s.notes ? <p className="line-clamp-2 text-xs text-muted-foreground">{s.notes}</p> : null}
              {s.categories.length > 0 ? (
                <div className="mt-auto flex flex-wrap gap-1 pt-1">
                  {s.categories.slice(0, 4).map((c) => (
                    <span
                      className="rounded border border-border/70 px-1.5 py-0.5 font-mono text-[10px] leading-none text-muted-foreground"
                      key={c}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              ) : null}
            </>
          );
          const className =
            "group flex min-h-28 flex-col gap-2 rounded-lg border border-dashed border-border bg-card p-4 transition-colors hover:border-brand/50";
          return s.url ? (
            <ExternalLink className={className} href={s.url} key={s.id} rel="noopener noreferrer" target="_blank">
              {Card}
            </ExternalLink>
          ) : (
            <div className={className} key={s.id}>
              {Card}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default CommunitySubmissions;
