"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { ArrowBigDown, ArrowBigUp, ArrowUpRight, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";

import DifficultyMeter from "@/components/ctf/DifficultyMeter";
import ExternalLink from "@/components/ui/external-link";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Link, useRouter } from "@/i18n/routing";
import type { CtfIndexEntry } from "@/lib/ctf/types";
import { cn } from "@/lib/utils";

type SortKey = "name" | "votes" | "challenges";
type Source = "archive" | "community";

type Stats = { slug: string; up: number; down: number; difficulty: number | null; ratings: number };

const LEVELS = [1, 2, 3, 4, 5] as const;

function yearsLabel(years: string[]) {
  if (years.length === 0) return "";
  if (years.length === 1) return years[0];
  const sorted = [...years].sort();
  return `${sorted[0]}–${sorted[sorted.length - 1].slice(2)}`;
}

function CtfCard({ ctf, stats }: { ctf: CtfIndexEntry; stats: Stats | undefined }) {
  const t = useTranslations("Home");
  const tCtf = useTranslations("Ctf");
  const net = stats ? stats.up - stats.down : 0;

  return (
    <Link
      className="group relative flex flex-col gap-3 rounded-lg border border-border bg-card p-4 transition-[border-color,transform] duration-150 hover:-translate-y-0.5 hover:border-brand/50 focus-visible:border-brand focus-visible:outline-none"
      href={`/ctf/${ctf.slug}`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-medium leading-snug tracking-tight text-foreground">{ctf.name}</h3>
        {stats?.difficulty != null ? (
          <span className="mt-0.5 flex shrink-0 items-center gap-1.5" title={tCtf("difficulty")}>
            <DifficultyMeter value={stats.difficulty} className="[&>span]:h-2.5" />
            <span className="font-mono text-xs text-muted-foreground">{stats.difficulty.toFixed(1)}</span>
          </span>
        ) : null}
      </div>

      <p className="font-mono text-xs text-muted-foreground">
        {yearsLabel(ctf.years)}
        <span className="mx-1.5 text-border">·</span>
        {ctf.years.length} {tCtf("editions")}
      </p>

      <div className="mt-auto flex flex-wrap gap-1 pt-1">
        {ctf.categories.slice(0, 4).map((cat) => (
          <span
            className="rounded border border-border/70 px-1.5 py-0.5 font-mono text-[11px] leading-none text-muted-foreground"
            key={cat}
          >
            {cat}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-border/60 pt-2.5 font-mono text-xs text-muted-foreground">
        <span>
          <span className="text-foreground">{ctf.count}</span> {t("challenges")}
        </span>
        {net !== 0 ? (
          <span className={cn(net > 0 ? "text-success" : "text-danger")}>
            {net > 0 ? "+" : ""}
            {net}
          </span>
        ) : null}
      </div>
    </Link>
  );
}

type Submission = {
  id: Id<"submissions">;
  name: string;
  year: string;
  url: string | null;
  categories: string[];
  notes: string | null;
  up: number;
  down: number;
  difficulty: number | null;
  ratingsCount: number;
  myVote?: 1 | -1;
  myRating?: number;
};

function SubmissionCard({
  s,
  onVote,
  onRate,
}: {
  s: Submission;
  onVote: (id: Id<"submissions">, value: 1 | -1) => void;
  onRate: (id: Id<"submissions">, difficulty: number) => void;
}) {
  const tCtf = useTranslations("Ctf");
  const shownDifficulty = s.myRating ?? (s.difficulty ? Math.round(s.difficulty) : 0);

  return (
    <div className="group flex flex-col gap-2 rounded-lg border border-dashed border-border bg-card p-4 transition-colors hover:border-brand/50">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {s.url ? (
            <ExternalLink
              className="flex items-center gap-1.5 text-base font-medium leading-snug tracking-tight hover:text-brand"
              href={s.url}
              rel="noopener noreferrer"
              target="_blank"
            >
              {s.name}
              <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground/50 transition-colors group-hover:text-brand" />
            </ExternalLink>
          ) : (
            <h3 className="text-base font-medium leading-snug tracking-tight">{s.name}</h3>
          )}
        </div>
      </div>
      <p className="font-mono text-xs text-muted-foreground">{s.year}</p>
      {s.notes ? <p className="line-clamp-2 text-sm text-muted-foreground">{s.notes}</p> : null}
      {s.categories.length > 0 ? (
        <div className="flex flex-wrap gap-1 pt-1">
          {s.categories.slice(0, 4).map((c) => (
            <span
              className="rounded border border-border/70 px-1.5 py-0.5 font-mono text-[11px] leading-none text-muted-foreground"
              key={c}
            >
              {c}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-auto flex items-center gap-3 border-t border-border/60 pt-2.5">
        <div className="flex shrink-0 items-center">
          {LEVELS.map((level) => (
            <button
              aria-label={`${tCtf("difficulty")} ${level}/5`}
              className="group/bar px-[1.5px] py-1.5"
              key={level}
              onClick={() => onRate(s.id, level)}
              type="button"
            >
              <span
                className={cn(
                  "block h-3.5 w-[3px] rounded-full transition-colors",
                  level <= shownDifficulty ? "bg-brand" : "bg-border group-hover/bar:bg-brand/40"
                )}
              />
            </button>
          ))}
          {s.difficulty != null ? (
            <span className="ml-1 font-mono text-[11px] text-muted-foreground">{s.difficulty.toFixed(1)}</span>
          ) : null}
        </div>

        <div className="ml-auto flex shrink-0 items-center overflow-hidden rounded-md border border-border">
          <button
            aria-label={tCtf("upvote")}
            className={cn(
              "flex items-center gap-1 px-2 py-1 text-xs transition-colors hover:bg-secondary",
              s.myVote === 1 && "text-success"
            )}
            onClick={() => onVote(s.id, 1)}
            type="button"
          >
            <ArrowBigUp className={cn("size-3.5", s.myVote === 1 && "fill-current")} />
            <span className="font-mono tabular-nums">{s.up}</span>
          </button>
          <button
            aria-label={tCtf("downvote")}
            className={cn(
              "flex items-center gap-1 border-l border-border px-2 py-1 text-xs transition-colors hover:bg-secondary",
              s.myVote === -1 && "text-danger"
            )}
            onClick={() => onVote(s.id, -1)}
            type="button"
          >
            <ArrowBigDown className={cn("size-3.5", s.myVote === -1 && "fill-current")} />
            <span className="font-mono tabular-nums">{s.down}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

const SORT_KEYS: SortKey[] = ["name", "votes", "challenges"];

function CtfExplorer({ ctfs }: { ctfs: CtfIndexEntry[] }) {
  const t = useTranslations("Home");
  const tCtf = useTranslations("Ctf");
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("name");
  const [source, setSource] = useState<Source>("archive");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);
  const allStats = useQuery(api.ctfs.allStats);
  const submissions = useQuery(api.submissions.list);
  const { isAuthenticated } = useConvexAuth();
  const voteSubmission = useMutation(api.submissions.vote);
  const rateSubmission = useMutation(api.submissions.rate);

  const requireAuth = () => {
    if (isAuthenticated) return true;
    router.push("/sign-in");
    return false;
  };

  const handleSubmissionVote = (id: Id<"submissions">, value: 1 | -1) => {
    if (!requireAuth()) return;
    const sub = submissions?.find((s) => s.id === id);
    void voteSubmission({
      submissionId: id,
      value: sub?.myVote === value ? 0 : value,
    }).catch(() => toast.error(tCtf("voteError")));
  };

  const handleSubmissionRate = (id: Id<"submissions">, difficulty: number) => {
    if (!requireAuth()) return;
    const sub = submissions?.find((s) => s.id === id);
    void rateSubmission({
      submissionId: id,
      difficulty: sub?.myRating === difficulty ? 0 : difficulty,
    }).catch(() => toast.error(tCtf("voteError")));
  };

  const statsBySlug = useMemo(() => {
    const map = new Map<string, Stats>();
    for (const s of allStats ?? []) map.set(s.slug, s);
    return map;
  }, [allStats]);

  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    for (const s of submissions ?? []) {
      for (const c of s.categories) cats.add(c);
    }
    return [...cats].sort();
  }, [submissions]);

  const visible = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    const filtered = q
      ? ctfs.filter(
          (c) => c.name.toLowerCase().includes(q) || c.categories.some((cat) => cat.toLowerCase().includes(q))
        )
      : [...ctfs];
    if (sort === "challenges") {
      filtered.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    } else if (sort === "votes") {
      const net = (c: CtfIndexEntry) => {
        const s = statsBySlug.get(c.slug);
        return s ? s.up - s.down : 0;
      };
      filtered.sort((a, b) => net(b) - net(a) || a.name.localeCompare(b.name));
    }
    return filtered;
  }, [ctfs, deferredSearch, sort, statsBySlug]);

  const visibleSubmissions = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    let list = [...(submissions ?? [])];

    if (q) {
      list = list.filter(
        (s) => s.name.toLowerCase().includes(q) || s.categories.some((cat) => cat.toLowerCase().includes(q))
      );
    }

    if (categoryFilter) {
      list = list.filter((s) => s.categories.includes(categoryFilter));
    }

    list.sort((a, b) => (b.up - b.down) - (a.up - a.down) || a.name.localeCompare(b.name));

    return list;
  }, [submissions, deferredSearch, categoryFilter]);

  const isArchive = source === "archive";

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex h-9 items-center rounded-md border border-border p-0.5">
          {(["archive", "community"] as Source[]).map((s) => (
            <button
              className={cn(
                "rounded px-3 py-1.5 font-mono text-xs transition-colors",
                source === s ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
              key={s}
              onClick={() => setSource(s)}
              type="button"
            >
              {s === "archive" ? t("filterArchive") : t("filterCommunity")}
              {s === "community" && (submissions?.length ?? 0) > 0 ? (
                <span className="ml-1.5 text-border">{submissions?.length}</span>
              ) : null}
            </button>
          ))}
        </div>
        <div className="flex flex-1 items-center gap-3 sm:justify-end">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-9 pl-9 font-mono text-sm placeholder:text-muted-foreground/60"
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchPlaceholder")}
              value={search}
            />
          </div>
          {isArchive ? (
            <div className="hidden h-9 items-center rounded-md border border-border p-0.5 sm:flex">
              {SORT_KEYS.map((key) => (
                <button
                  className={cn(
                    "rounded px-2.5 py-1.5 font-mono text-xs transition-colors",
                    sort === key ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                  key={key}
                  onClick={() => setSort(key)}
                  type="button"
                >
                  {t(key === "name" ? "sortName" : key === "votes" ? "sortVotes" : "sortChallenges")}
                </button>
              ))}
            </div>
          ) : allCategories.length > 0 ? (
            <div className="hidden h-9 items-center rounded-md border border-border p-0.5 sm:flex">
              <button
                className={cn(
                  "rounded px-2.5 py-1.5 font-mono text-xs transition-colors",
                  !categoryFilter ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setCategoryFilter(null)}
                type="button"
              >
                {t("filterCategory")}
              </button>
              {allCategories.slice(0, 5).map((cat) => (
                <button
                  className={cn(
                    "rounded px-2.5 py-1.5 font-mono text-xs transition-colors",
                    categoryFilter === cat ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                  key={cat}
                  onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)}
                  type="button"
                >
                  {cat}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {isArchive ? (
        <>
          <p className="font-mono text-xs text-muted-foreground">
            {t("showing", { shown: visible.length, total: ctfs.length })}
          </p>
          {visible.length === 0 ? (
            <p className="py-20 text-center font-mono text-sm text-muted-foreground">{t("noResults")}</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((ctf) => (
                <CtfCard ctf={ctf} key={ctf.slug} stats={statsBySlug.get(ctf.slug)} />
              ))}
            </div>
          )}
        </>
      ) : visibleSubmissions.length === 0 ? (
        <p className="py-20 text-center font-mono text-sm text-muted-foreground">{t("communityEmpty")}</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visibleSubmissions.map((s) => (
            <SubmissionCard
              key={s.id}
              onRate={handleSubmissionRate}
              onVote={handleSubmissionVote}
              s={s}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default CtfExplorer;
