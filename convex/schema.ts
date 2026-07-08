import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // One vote per user per CTF: +1 (upvote) or -1 (downvote).
  votes: defineTable({
    userId: v.id("users"),
    slug: v.string(),
    value: v.union(v.literal(1), v.literal(-1)),
  })
    .index("by_user_slug", ["userId", "slug"])
    .index("by_slug", ["slug"]),

  // One difficulty rating (1-5) per user per CTF.
  ratings: defineTable({
    userId: v.id("users"),
    slug: v.string(),
    difficulty: v.number(),
  })
    .index("by_user_slug", ["userId", "slug"])
    .index("by_slug", ["slug"]),

  // Denormalized aggregates so lists stay cheap to render.
  ctfStats: defineTable({
    slug: v.string(),
    up: v.number(),
    down: v.number(),
    difficultySum: v.number(),
    difficultyCount: v.number(),
  }).index("by_slug", ["slug"]),
});
