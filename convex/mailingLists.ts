import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("mailingLists").order("asc").take(200);
  },
});

export const get = query({
  args: { id: v.id("mailingLists") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    emails: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("mailingLists", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("mailingLists"),
    name: v.optional(v.string()),
    emails: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const remove = mutation({
  args: { id: v.id("mailingLists") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
