"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { ArrowBigDown, ArrowBigUp, Flame, Search } from "lucide-react";
import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { Link } from "@/i18n/routing";
import type { CtfIndexEntry } from "@/lib/ctf/types";
import { cn } from "@/lib/utils";

type SortKey = "name" | "votes" | "challenges";

type Stats = { slug: string; up: number; down: number; difficulty: number | null; ratings: number };

function yearsLabel(years: string[]) {
  if (years.length === 0) return "";
  if (years.length === 1) return years[0];
  const sorted = [...years].sort();
  return `${sorted[0]} – ${sorted[sorted.length - 1]}`;
}

function CtfCard({ ctf, stats }: { ctf: CtfIndexEntry; stats: Stats | undefined }) {
  const t = useTranslations("Home");
  const tCtf = useTranslations("Ctf");

  return (
    <Link
      className="group flex flex-col justify-between gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary/60"
      href={`/ctf/${ctf.slug}`}
    >
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight tracking-tight group-hover:text-primary">{ctf.name}</h3>
          {stats && stats.difficulty !== null ? (
            <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground" title={tCtf("difficulty")}>
              <Flame className="size-3.5 text-orange-500" />
              {stats.difficulty.toFixed(1)}
            </span>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground">
          {yearsLabel(ctf.years)} · {ctf.years.length} {tCtf("editions")}
        </p>
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {ctf.categories.slice(0, 4).map((cat) => (
            <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground" key={cat}>
              {cat}
            </span>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
          {stats && (stats.up > 0 || stats.down > 0) ? (
            <span className="flex items-center gap-0.5">
              <ArrowBigUp className="size-3.5 text-emerald-500" />
              {stats.up}
              <ArrowBigDown className="ml-1 size-3.5 text-red-500" />
              {stats.down}
            </span>
          ) : null}
          <span className="font-mono">
            {ctf.count} {t("challenges")}
          </span>
        </div>
      </div>
    </Link>
  );
}

function CtfExplorer({ ctfs }: { ctfs: CtfIndexEntry[] }) {
  const t = useTranslations("Home");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("name");
  const allStats = useQuery(api.ctfs.allStats);

  const statsBySlug = useMemo(() => {
    const map = new Map<string, Stats>();
    for (const s of allStats ?? []) map.set(s.slug, s);
    return map;
  }, [allStats]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q ? ctfs.filter((c) => c.name.toLowerCase().includes(q)) : [...ctfs];
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
  }, [ctfs, search, sort, statsBySlug]);

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "name", label: t("sortName") },
    { key: "votes", label: t("sortVotes") },
    { key: "challenges", label: t("sortChallenges") },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            value={search}
          />
        </div>
        <div className="flex items-center gap-1">
          {sortOptions.map((option) => (
            <button
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition-colors",
                sort === option.key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:border-primary/50 hover:text-foreground"
              )}
              key={option.key}
              onClick={() => setSort(option.key)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">{t("showing", { shown: visible.length, total: ctfs.length })}</p>

      {visible.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">{t("noResults")}</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((ctf) => (
            <CtfCard ctf={ctf} key={ctf.slug} stats={statsBySlug.get(ctf.slug)} />
          ))}
        </div>
      )}
    </div>
  );
}

export default CtfExplorer;
