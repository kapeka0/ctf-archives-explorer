"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { ArrowBigDown, ArrowBigUp, Flame } from "lucide-react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";

import { api } from "@/convex/_generated/api";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const DIFFICULTY_LEVELS = [1, 2, 3, 4, 5] as const;

function CtfActions({ slug }: { slug: string }) {
  const t = useTranslations("Ctf");
  const tNav = useTranslations("Nav");
  const { isAuthenticated } = useConvexAuth();
  const stats = useQuery(api.ctfs.ctfStats, { slug });
  const vote = useMutation(api.ctfs.vote);
  const rate = useMutation(api.ctfs.rate);

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

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      <div className="flex items-center overflow-hidden rounded-lg border">
        <button
          aria-label={t("upvote")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors hover:bg-accent",
            stats?.myVote === 1 && "bg-emerald-500/10 text-emerald-500"
          )}
          onClick={() => void handleVote(1)}
          type="button"
        >
          <ArrowBigUp className={cn("size-4", stats?.myVote === 1 && "fill-current")} />
          <span className="font-mono tabular-nums">{stats?.up ?? 0}</span>
        </button>
        <div className="h-5 w-px bg-border" />
        <button
          aria-label={t("downvote")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors hover:bg-accent",
            stats?.myVote === -1 && "bg-red-500/10 text-red-500"
          )}
          onClick={() => void handleVote(-1)}
          type="button"
        >
          <ArrowBigDown className={cn("size-4", stats?.myVote === -1 && "fill-current")} />
          <span className="font-mono tabular-nums">{stats?.down ?? 0}</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{t("difficulty")}</span>
        <div className="flex items-center">
          {DIFFICULTY_LEVELS.map((level) => {
            const active =
              stats?.myDifficulty != null
                ? level <= stats.myDifficulty
                : stats?.difficulty != null && level <= Math.round(stats.difficulty);
            return (
              <button
                aria-label={`${t("difficulty")} ${level}/5`}
                className="p-0.5 transition-transform hover:scale-110"
                key={level}
                onClick={() => void handleRate(level)}
                type="button"
              >
                <Flame
                  className={cn(
                    "size-5",
                    active ? "fill-orange-500/20 text-orange-500" : "text-muted-foreground/40",
                    stats?.myDifficulty != null && level <= stats.myDifficulty && "fill-orange-500/60"
                  )}
                />
              </button>
            );
          })}
        </div>
        <span className="text-xs text-muted-foreground">
          {stats?.difficulty != null
            ? `${stats.difficulty.toFixed(1)}/5 · ${t("ratings", { count: stats.ratings })}`
            : t("noRatings")}
        </span>
      </div>

      {!isAuthenticated ? (
        <p className="text-xs text-muted-foreground">
          <Link className="text-primary hover:underline" href="/sign-in">
            {tNav("signIn")}
          </Link>{" "}
          — {t("signInToVote")}
        </p>
      ) : null}
    </div>
  );
}

export default CtfActions;
