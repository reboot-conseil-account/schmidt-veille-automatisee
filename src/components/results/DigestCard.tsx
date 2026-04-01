import type { Doc } from "@convex/dataModel";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArticleItem } from "./ArticleItem";

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Semaine du {dateFormatter.format(weekDate)}
        </CardTitle>
        <CardDescription>Généré le {generatedDate}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed whitespace-pre-line">
          {result.synthesis}
        </p>
        {result.articles.length > 0 && (
          <>
            <Separator />
            <div className="space-y-4">
              {result.articles.map((article: Doc<"results">["articles"][number], i: number) => (
                <ArticleItem key={i} article={article} />
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
