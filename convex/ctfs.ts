import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { mutation, query, type MutationCtx } from "./_generated/server";

const MAX_SLUG_LENGTH = 120;

async function getStatsDoc(ctx: MutationCtx, slug: string) {
  const existing = await ctx.db
    .query("ctfStats")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique();
  if (existing) return existing;
  const id = await ctx.db.insert("ctfStats", {
    slug,
    up: 0,
    down: 0,
    difficultySum: 0,
    difficultyCount: 0,
  });
  return (await ctx.db.get(id))!;
}

/** Aggregated stats for every CTF that has at least one vote or rating. */
export const allStats = query({
  args: {},
  handler: async (ctx) => {
    const stats = await ctx.db.query("ctfStats").collect();
    return stats.map((s) => ({
      slug: s.slug,
      up: s.up,
      down: s.down,
      difficulty: s.difficultyCount > 0 ? s.difficultySum / s.difficultyCount : null,
      ratings: s.difficultyCount,
    }));
  },
});

/** Stats for a single CTF plus the current user's own vote/rating. */
export const ctfStats = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const stats = await ctx.db
      .query("ctfStats")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();

    const userId = await getAuthUserId(ctx);
    let myVote: 1 | -1 | null = null;
    let myDifficulty: number | null = null;
    if (userId) {
      const vote = await ctx.db
        .query("votes")
        .withIndex("by_user_slug", (q) => q.eq("userId", userId).eq("slug", slug))
        .unique();
      myVote = vote?.value ?? null;
      const rating = await ctx.db
        .query("ratings")
        .withIndex("by_user_slug", (q) => q.eq("userId", userId).eq("slug", slug))
        .unique();
      myDifficulty = rating?.difficulty ?? null;
    }

    return {
      up: stats?.up ?? 0,
      down: stats?.down ?? 0,
      difficulty: stats && stats.difficultyCount > 0 ? stats.difficultySum / stats.difficultyCount : null,
      ratings: stats?.difficultyCount ?? 0,
      myVote,
      myDifficulty,
    };
  },
});

/**
 * Cast, change or remove a vote on a CTF.
 * value: 1 = upvote, -1 = downvote, 0 = remove vote.
 */
export const vote = mutation({
  args: {
    slug: v.string(),
    value: v.union(v.literal(1), v.literal(-1), v.literal(0)),
  },
  handler: async (ctx, { slug, value }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    if (slug.length === 0 || slug.length > MAX_SLUG_LENGTH) throw new Error("Invalid slug");

    const existing = await ctx.db
      .query("votes")
      .withIndex("by_user_slug", (q) => q.eq("userId", userId).eq("slug", slug))
      .unique();
    if ((existing?.value ?? 0) === value) return;

    const stats = await getStatsDoc(ctx, slug);
    let { up, down } = stats;
    if (existing) {
      if (existing.value === 1) up--;
      else down--;
    }
    if (value === 0) {
      if (existing) await ctx.db.delete(existing._id);
    } else {
      if (value === 1) up++;
      else down++;
      if (existing) await ctx.db.patch(existing._id, { value });
      else await ctx.db.insert("votes", { userId, slug, value });
    }
    await ctx.db.patch(stats._id, { up, down });
  },
});

/**
 * Set or remove the difficulty rating for a CTF.
 * difficulty: 1-5, or 0 to remove the rating.
 */
export const rate = mutation({
  args: { slug: v.string(), difficulty: v.number() },
  handler: async (ctx, { slug, difficulty }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    if (slug.length === 0 || slug.length > MAX_SLUG_LENGTH) throw new Error("Invalid slug");
    if (!Number.isInteger(difficulty) || difficulty < 0 || difficulty > 5)
      throw new Error("Difficulty must be an integer between 0 and 5");

    const existing = await ctx.db
      .query("ratings")
      .withIndex("by_user_slug", (q) => q.eq("userId", userId).eq("slug", slug))
      .unique();
    if ((existing?.difficulty ?? 0) === difficulty) return;

    const stats = await getStatsDoc(ctx, slug);
    let { difficultySum, difficultyCount } = stats;
    if (existing) {
      difficultySum -= existing.difficulty;
      difficultyCount--;
    }
    if (difficulty === 0) {
      if (existing) await ctx.db.delete(existing._id);
    } else {
      difficultySum += difficulty;
      difficultyCount++;
      if (existing) await ctx.db.patch(existing._id, { difficulty });
      else await ctx.db.insert("ratings", { userId, slug, difficulty });
    }
    await ctx.db.patch(stats._id, { difficultySum, difficultyCount });
  },
});
