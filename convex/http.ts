import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

function verifyApiKey(request: Request): boolean {
  const secret = process.env.CONVEX_API_KEY;
  if (!secret) {
    console.error("[auth] CONVEX_API_KEY environment variable is not set");
    return false;
  }
  return request.headers.get("x-api-key") === secret;
}

// GET /api/topics — returns all active topics (called by n8n at workflow start)
// If a topic has a mailingListId, its emails are merged into the recipients field.
http.route({
  path: "/api/topics",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    if (!verifyApiKey(request)) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const topics = await ctx.runQuery(api.topics.getActive);

    const resolved = await Promise.all(
      topics.map(async (topic) => {
        if (!topic.mailingListId) return topic;
        const list = await ctx.runQuery(api.mailingLists.get, {
          id: topic.mailingListId,
        });
        const merged = list
          ? [...new Set([...topic.recipients, ...list.emails])]
          : topic.recipients;
        return { ...topic, recipients: merged };
      })
    );

    return new Response(JSON.stringify(resolved), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// POST /api/results — stores a processed topic result (called by n8n after LLM step)
http.route({
  path: "/api/results",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (!verifyApiKey(request)) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const b = body as any;
    if (!b.topicId || !b.weekStart || !b.synthesis || !Array.isArray(b.articles)) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: topicId, weekStart, synthesis, articles",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const id = await ctx.runMutation(api.results.store, {
      topicId: b.topicId,
      weekStart: b.weekStart,
      synthesis: b.synthesis,
      articles: b.articles,
      generatedAt: b.generatedAt ?? Date.now(),
    });

    return new Response(JSON.stringify({ id }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
