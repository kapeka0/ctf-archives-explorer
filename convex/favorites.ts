import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const toggle = mutation({
  args: { ctfSlug: v.string(), key: v.string() },
  handler: async (ctx, { ctfSlug, key }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_user_key", (q) => q.eq("userId", userId).eq("key", key))
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return false;
    }
    await ctx.db.insert("favorites", { userId, ctfSlug, key });
    return true;
  },
});

export const forCtf = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const rows = await ctx.db
      .query("favorites")
      .withIndex("by_user_ctf", (q) => q.eq("userId", userId).eq("ctfSlug", slug))
      .collect();
    return rows.map((r) => r.key);
  },
});

export const all = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});
