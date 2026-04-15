import { action } from "./_generated/server";
import { v } from "convex/values";

export const trigger = action({
  args: {
    topicIds: v.optional(v.array(v.id("topics"))),
  },
  handler: async (_ctx, args): Promise<{ triggered: boolean }> => {
    const url = process.env.N8N_WEBHOOK_URL;
    if (!url) {
      throw new Error("N8N_WEBHOOK_URL n'est pas configurée dans les variables d'environnement Convex.");
    }
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicIds: args.topicIds ?? [] }),
    });
    if (!res.ok) {
      throw new Error(`Le déclenchement du workflow a échoué (HTTP ${res.status}).`);
    }
    return { triggered: true };
  },
});
