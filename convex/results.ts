import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const store = mutation({
  args: {
    topicId: v.id("topics"),
    weekStart: v.string(),
    synthesis: v.string(),
    articles: v.array(
      v.object({
        title: v.string(),
        url: v.string(),
        source: v.string(),
        summary: v.string(),
        category: v.string(),
      })
    ),
    generatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    // Upsert: replace any existing result for the same topic + week
    const existing = await ctx.db
      .query("results")
      .withIndex("by_topic_week", (q) =>
        q.eq("topicId", args.topicId).eq("weekStart", args.weekStart)
      )
      .first();
    if (existing) {
      await ctx.db.delete(existing._id);
    }
    return await ctx.db.insert("results", args);
  },
});
