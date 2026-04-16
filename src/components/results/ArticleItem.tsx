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

/** Extract the real destination URL from Bing news redirect URLs. */
function decodeHtmlEntities(url: string): string {
  return url
    .replace(/&amp;/gi, "&")
    .replace(/&#38;/g, "&")
    .replace(/&#x26;/gi, "&");
}

function resolveUrl(url: string): string {
  try {
    const normalized = decodeHtmlEntities(url);
    const parsed = new URL(normalized);
    if (!parsed.hostname.endsWith("bing.com")) return normalized;

    const real = parsed.searchParams.get("url");
    if (real) return real;

    const encoded = parsed.searchParams.get("u");
    if (encoded?.startsWith("a1")) {
      const base64 = encoded
        .slice(2)
        .replace(/-/g, "+")
        .replace(/_/g, "/")
        .padEnd(Math.ceil((encoded.length - 2) / 4) * 4, "=");
      const decoded = atob(base64);
      if (decoded.startsWith("http")) return decoded;
    }
  } catch {
    // not a valid URL, return as-is
  }
  return decodeHtmlEntities(url);
}

export function ArticleItem({ article }: ArticleItemProps) {
  const href = resolveUrl(article.url);
  const showSource = article.source && article.source.toLowerCase() !== "unknown";

  return (
    <div className="group space-y-1.5 pb-4 border-b border-border/50 last:border-0 last:pb-0">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-start gap-1.5 font-semibold text-sm text-primary hover:text-primary/80 leading-snug transition-colors"
      >
        <span>{article.title}</span>
        <ExternalLink className="h-3 w-3 mt-0.5 shrink-0 opacity-0 group-hover:opacity-70 transition-opacity" />
      </a>
      {showSource && (
        <div className="flex gap-1.5 flex-wrap">
          <Badge variant="secondary" className="text-xs font-medium">
            {article.source}
          </Badge>
        </div>
      )}
      <p className="text-sm text-muted-foreground leading-relaxed">
        {article.summary}
      </p>
    </div>
  );
}
