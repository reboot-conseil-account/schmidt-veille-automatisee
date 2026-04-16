import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

interface Article {
  title: string;
  url: string;
  source: string;
  summary: string;
  category: string;
}

interface ArticleItemProps {
  article: Article;
}

export function ArticleItem({ article }: ArticleItemProps) {
  return (
    <div className="group space-y-1.5 pb-4 border-b border-border/50 last:border-0 last:pb-0">
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-start gap-1.5 font-semibold text-sm text-primary hover:text-primary/80 leading-snug transition-colors"
      >
        <span>{article.title}</span>
        <ExternalLink className="h-3 w-3 mt-0.5 shrink-0 opacity-0 group-hover:opacity-70 transition-opacity" />
      </a>
      <div className="flex gap-1.5 flex-wrap">
        <Badge variant="secondary" className="text-xs font-medium">
          {article.source}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {article.summary}
      </p>
    </div>
  );
}
