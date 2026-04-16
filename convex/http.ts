import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

/**
 * Resolve a Bing redirect URL to its final destination.
 *
 * Bing News RSS links come in two main formats:
 *   1. apiclick.aspx?...&url=https%3A%2F%2F...  → real URL in `url` query param
 *   2. /ck/a?...&u=a1<base64url>...             → real URL base64-encoded in `u` param
 *
 * For any other URL (or if extraction fails) the original is returned unchanged.
 */
function decodeHtmlEntities(raw: string): string {
  return raw
    .replace(/&amp;/gi, "&")
    .replace(/&#38;/g, "&")
    .replace(/&#x26;/gi, "&");
}

function resolveBingUrl(raw: string): string {
  try {
    const normalized = decodeHtmlEntities(raw);
    const parsed = new URL(normalized);
    if (!parsed.hostname.endsWith("bing.com")) return normalized;

    // Format 1: explicit `url` query parameter
    const urlParam = parsed.searchParams.get("url");
    if (urlParam) return urlParam;

    // Format 2: base64-encoded URL in `u` parameter, prefixed with "a1"
    const uParam = parsed.searchParams.get("u");
    if (uParam?.startsWith("a1")) {
      const base64 = uParam
        .slice(2)
        .replace(/-/g, "+")
        .replace(/_/g, "/")
        .padEnd(Math.ceil((uParam.length - 2) / 4) * 4, "=");
      const decoded = atob(base64);
      if (decoded.startsWith("http")) return decoded;
    }
  } catch {
    // malformed URL — fall through
  }
  return decodeHtmlEntities(raw);
}

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
      articles: b.articles.map((article: any) => ({
        ...article,
        url: typeof article?.url === "string" ? resolveBingUrl(article.url) : article?.url,
      })),
      generatedAt: b.generatedAt ?? Date.now(),
    });

    return new Response(JSON.stringify({ id }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
