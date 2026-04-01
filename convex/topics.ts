import { query } from "./_generated/server";

export const getActive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("topics")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
  },
});
