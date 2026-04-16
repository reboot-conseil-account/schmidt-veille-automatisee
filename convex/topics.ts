import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getActive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("topics")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("topics").order("asc").take(100);
  },
});

export const get = query({
  args: { id: v.id("topics") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    keywords: v.array(v.string()),
    rssUrls: v.array(v.string()),
    recipients: v.array(v.string()),
    mailingListId: v.optional(v.id("mailingLists")),
    maxAgeDays: v.optional(v.number()),
    active: v.boolean(),
    customQuery: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("topics", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("topics"),
    name: v.optional(v.string()),
    keywords: v.optional(v.array(v.string())),
    rssUrls: v.optional(v.array(v.string())),
    recipients: v.optional(v.array(v.string())),
    mailingListId: v.optional(v.id("mailingLists")),
    maxAgeDays: v.optional(v.number()),
    active: v.optional(v.boolean()),
    customQuery: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const remove = mutation({
  args: { id: v.id("topics") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
