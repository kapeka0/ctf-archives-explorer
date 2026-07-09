import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

const MAX = { name: 100, year: 12, url: 300, notes: 500, categories: 12, category: 30 };

/** The most recently submitted CTFs with vote/rating aggregates. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("submissions").order("desc").take(60);
    const userId = await getAuthUserId(ctx);

    const results = [];
    for (const r of rows) {
      const votes = await ctx.db
        .query("submissionVotes")
        .withIndex("by_submission", (q) => q.eq("submissionId", r._id))
        .collect();
      const up = votes.filter((v) => v.value === 1).length;
      const down = votes.filter((v) => v.value === -1).length;

      const ratings = await ctx.db
        .query("submissionRatings")
        .withIndex("by_submission", (q) => q.eq("submissionId", r._id))
        .collect();
      const difficultySum = ratings.reduce((s, rt) => s + rt.difficulty, 0);
      const difficultyCount = ratings.length;
      const difficulty = difficultyCount > 0 ? difficultySum / difficultyCount : null;

      let myVote: 1 | -1 | undefined;
      let myRating: number | undefined;
      if (userId) {
        const uv = votes.find((v) => v.userId === userId);
        if (uv) myVote = uv.value;
        const ur = ratings.find((rt) => rt.userId === userId);
        if (ur) myRating = ur.difficulty;
      }

      results.push({
        id: r._id,
        name: r.name,
        year: r.year,
        url: r.url ?? null,
        categories: r.categories,
        notes: r.notes ?? null,
        up,
        down,
        difficulty,
        ratingsCount: difficultyCount,
        myVote,
        myRating,
      });
    }

    return results;
  },
});

/** Submit a CTF. No account required. */
export const submit = mutation({
  args: {
    name: v.string(),
    year: v.string(),
    url: v.optional(v.string()),
    categories: v.array(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = (await getAuthUserId(ctx)) ?? undefined;

    const name = args.name.trim();
    const year = args.year.trim();
    if (!name || name.length > MAX.name) throw new Error("Invalid name");
    if (!/^\d{4}$/.test(year)) throw new Error("Year must be four digits");

    const url = args.url?.trim();
    if (!url) throw new Error("URL is required");
    if (!/^https?:\/\//.test(url)) throw new Error("URL must start with http(s)://");
    if (url.length > MAX.url) throw new Error("URL too long");

    const notes = args.notes?.trim() || undefined;
    if (notes && notes.length > MAX.notes) throw new Error("Notes too long");

    const categories = [
      ...new Set(args.categories.map((c) => c.trim().toLowerCase()).filter((c) => c && c.length <= MAX.category)),
    ].slice(0, MAX.categories);

    return await ctx.db.insert("submissions", { userId, name, year, url, categories, notes });
  },
});

/** Vote on a community submission. value 0 removes the vote. */
export const vote = mutation({
  args: {
    submissionId: v.id("submissions"),
    value: v.union(v.literal(1), v.literal(-1), v.literal(0)),
  },
  handler: async (ctx, { submissionId, value }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("submissionVotes")
      .withIndex("by_user_submission", (q) => q.eq("userId", userId).eq("submissionId", submissionId))
      .unique();

    if (value === 0) {
      if (existing) await ctx.db.delete(existing._id);
    } else if (existing) {
      if (existing.value !== value) await ctx.db.patch(existing._id, { value });
    } else {
      await ctx.db.insert("submissionVotes", { userId, submissionId, value });
    }
  },
});

/** Rate difficulty on a community submission. 0 removes the rating. */
export const rate = mutation({
  args: {
    submissionId: v.id("submissions"),
    difficulty: v.number(),
  },
  handler: async (ctx, { submissionId, difficulty }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    if (!Number.isInteger(difficulty) || difficulty < 0 || difficulty > 5)
      throw new Error("Difficulty must be 0-5");

    const existing = await ctx.db
      .query("submissionRatings")
      .withIndex("by_user_submission", (q) => q.eq("userId", userId).eq("submissionId", submissionId))
      .unique();

    if (difficulty === 0) {
      if (existing) await ctx.db.delete(existing._id);
    } else if (existing) {
      if (existing.difficulty !== difficulty) await ctx.db.patch(existing._id, { difficulty });
    } else {
      await ctx.db.insert("submissionRatings", { userId, submissionId, difficulty });
    }
  },
});
