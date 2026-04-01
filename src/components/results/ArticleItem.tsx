import { Badge } from "@/components/ui/badge";

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
    <div className="space-y-1.5">
      <div className="flex items-start gap-2 flex-wrap">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-sm hover:underline leading-snug"
        >
          {article.title}
        </a>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        <Badge variant="secondary" className="text-xs">
          {article.source}
        </Badge>
        <Badge variant="outline" className="text-xs">
          {article.category}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {article.summary}
      </p>
    </div>
  );
}
