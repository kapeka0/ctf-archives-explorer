"use client";

import { useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";

import { api } from "@/convex/_generated/api";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const LEVELS = [1, 2, 3, 4, 5] as const;

function CtfActions({ slug }: { slug: string }) {
  const t = useTranslations("Ctf");
  const { isAuthenticated } = useConvexAuth();
  const stats = useQuery(api.ctfs.ctfStats, { slug });
  const vote = useMutation(api.ctfs.vote);
  const rate = useMutation(api.ctfs.rate);
  const [hover, setHover] = useState(0);

  const requireAuth = () => {
    if (isAuthenticated) return true;
    toast(t("signInToVote"));
    return false;
  };

  const handleVote = async (value: 1 | -1) => {
    if (!requireAuth() || !stats) return;
    try {
      await vote({ slug, value: stats.myVote === value ? 0 : value });
    } catch {
      toast.error(t("voteError"));
    }
  };

  const handleRate = async (difficulty: number) => {
    if (!requireAuth() || !stats) return;
    try {
      await rate({ slug, difficulty: stats.myDifficulty === difficulty ? 0 : difficulty });
    } catch {
      toast.error(t("voteError"));
    }
  };

  const shown = hover || stats?.myDifficulty || (stats?.difficulty ? Math.round(stats.difficulty) : 0);

  return (
    <div className="flex flex-wrap items-stretch gap-3">
      {/* Vote */}
      <div className="inline-flex items-center divide-x divide-border overflow-hidden rounded-lg border border-border">
        <button
          aria-label={t("upvote")}
          aria-pressed={stats?.myVote === 1}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 text-sm transition-colors hover:bg-secondary",
            stats?.myVote === 1 && "text-success"
          )}
          onClick={() => void handleVote(1)}
          type="button"
        >
          <ArrowBigUp className={cn("size-4", stats?.myVote === 1 && "fill-current")} />
          <span className="font-mono tabular-nums">{stats?.up ?? 0}</span>
        </button>
        <button
          aria-label={t("downvote")}
          aria-pressed={stats?.myVote === -1}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 text-sm transition-colors hover:bg-secondary",
            stats?.myVote === -1 && "text-danger"
          )}
          onClick={() => void handleVote(-1)}
          type="button"
        >
          <ArrowBigDown className={cn("size-4", stats?.myVote === -1 && "fill-current")} />
          <span className="font-mono tabular-nums">{stats?.down ?? 0}</span>
        </button>
      </div>

      {/* Difficulty */}
      <div className="inline-flex items-center gap-3 rounded-lg border border-border px-3 py-2">
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{t("difficulty")}</span>
        <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
          {LEVELS.map((level) => (
            <button
              aria-label={`${t("difficulty")} ${level}/5`}
              aria-pressed={stats?.myDifficulty === level}
              className="group py-1"
              key={level}
              onClick={() => void handleRate(level)}
              onMouseEnter={() => setHover(level)}
              type="button"
            >
              <span
                className={cn(
                  "block h-4 w-[5px] rounded-full transition-colors",
                  level <= shown ? "bg-brand" : "bg-border group-hover:bg-brand/40"
                )}
              />
            </button>
          ))}
        </div>
        <span className="font-mono text-xs text-muted-foreground">
          {stats?.difficulty != null
            ? `${stats.difficulty.toFixed(1)} · ${t("ratings", { count: stats.ratings })}`
            : t("noRatings")}
        </span>
      </div>

      {!isAuthenticated ? (
        <p className="flex items-center font-mono text-[11px] text-muted-foreground">
          <Link className="text-brand hover:underline" href="/sign-in">
            {t("signInToVote")}
          </Link>
        </p>
      ) : null}
    </div>
  );
}

export default CtfActions;
