import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  mailingLists: defineTable({
    name: v.string(),
    emails: v.array(v.string()),
  }).index("by_name", ["name"]),

  topics: defineTable({
    name: v.string(),
    keywords: v.array(v.string()),
    rssUrls: v.array(v.string()),
    recipients: v.array(v.string()),
    mailingListId: v.optional(v.id("mailingLists")),
    maxAgeDays: v.optional(v.number()),
    active: v.boolean(),
    customQuery: v.optional(v.string()),
  }).index("by_active", ["active"]),

  results: defineTable({
    topicId: v.id("topics"),
    weekStart: v.string(), // ISO date string e.g. "2026-03-23" (Monday of the week)
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
    generatedAt: v.number(), // Date.now() timestamp
  })
    .index("by_topic", ["topicId"])
    .index("by_topic_week", ["topicId", "weekStart"]),
});
