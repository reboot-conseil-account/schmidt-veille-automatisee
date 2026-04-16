import type { Doc } from "@convex/dataModel";
import { Separator } from "@/components/ui/separator";
import { ArticleItem } from "./ArticleItem";
import { Calendar, Clock } from "lucide-react";

interface DigestCardProps {
  result: Doc<"results">;
}

const dateFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" });

export function DigestCard({ result }: DigestCardProps) {
  const weekDate = new Date(result.weekStart + "T00:00:00");
  const generatedDate = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(result.generatedAt));

  // Group articles by category (same order as email template)
  const categoryOrder = ["Stratégie", "Innovation", "Marchés", "Réglementation", "International", "Autre"];
  const byCategory: Record<string, typeof result.articles> = {};
  for (const article of result.articles) {
    const cat = article.category || "Autre";
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(article);
  }
  const orderedCategories = categoryOrder.filter((c) => byCategory[c]);
  // Add any categories not in the predefined order
  for (const cat of Object.keys(byCategory)) {
    if (!orderedCategories.includes(cat)) orderedCategories.push(cat);
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden animate-slide-up">
      {/* Card header */}
      <div className="px-6 py-4 border-b bg-muted/20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-primary rounded-full shrink-0" />
          <h3 className="font-semibold text-foreground">
            Semaine du {dateFormatter.format(weekDate)}
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Généré le {generatedDate}</span>
        </div>
      </div>

      <div className="px-6 py-5 space-y-5">
        {/* Synthesis */}
        {result.synthesis && (
          <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-line">
            {result.synthesis}
          </p>
        )}

        {/* Articles grouped by category */}
        {orderedCategories.length > 0 && (
          <>
            {result.synthesis && <Separator />}
            <div className="space-y-6">
              {orderedCategories.map((cat) => (
                <div key={cat}>
                  {/* Category header styled like the email */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-[1.5px]">
                      {cat}
                    </span>
                    <div className="flex-1 h-px bg-primary/25" />
                  </div>
                  <div className="space-y-4">
                    {byCategory[cat].map((article, i) => (
                      <ArticleItem key={i} article={article} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
