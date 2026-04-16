import { ExternalLink } from "lucide-react";

function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-primary hover:underline underline-offset-2 font-medium"
    >
      {children}
      <ExternalLink className="h-3 w-3 shrink-0" />
    </a>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b bg-muted/20">
        <h2 className="font-semibold text-foreground">{title}</h2>
      </div>
      <div className="px-6 py-5 space-y-3 text-sm text-muted-foreground leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-foreground text-xs font-mono border border-border/60">
      {children}
    </span>
  );
}

export function TechStackPage() {
  return (
    <div className="space-y-6 max-w-3xl animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tech Stack</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Architecture et technologies de la veille automatisée Schmidt.
        </p>
      </div>

      <Section title="Interface — React">
        <p>
          <ExtLink href="https://react.dev">React 19</ExtLink> +{" "}
          <ExtLink href="https://vitejs.dev">Vite</ExtLink>, routage via{" "}
          <ExtLink href="https://reactrouter.com">React Router v7</ExtLink>.
          Styles avec <ExtLink href="https://tailwindcss.com">Tailwind CSS v4</ExtLink>,
          composants UI via <ExtLink href="https://base-ui.com">Base UI</ExtLink>.
          Déployé sur <ExtLink href="https://vercel.com">Vercel</ExtLink>.
        </p>
      </Section>

      <Section title="Backend — Convex">
        <p>
          <ExtLink href="https://convex.dev">Convex</ExtLink> stocke les sujets, listes de
          diffusion et résultats. Les queries sont réactives : l'interface se met à jour en
          temps réel sans polling.
        </p>
        <p>Deux endpoints HTTP sécurisés (clé API) sont exposés pour n8n :</p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li><Pill>GET /api/topics</Pill> — sujets actifs avec destinataires résolus</li>
          <li><Pill>POST /api/results</Pill> — enregistrement d'une synthèse</li>
        </ul>
        <p className="pt-2 border-t border-border/40">
          Convex est open-source et auto-hébergeable :{" "}
          <ExtLink href="https://github.com/get-convex/convex-backend">convex-backend (GitHub)</ExtLink>
          {" "}— serveur Rust, déployable via Docker.{" "}
          <ExtLink href="https://docs.convex.dev/self-hosting">Documentation</ExtLink>.
        </p>
      </Section>

      <Section title="Orchestration — n8n">
        <p>
          <ExtLink href="https://n8n.io">n8n</ExtLink> orchestre le workflow de veille,
          déclenché manuellement depuis l'interface ou via un cron.
        </p>
        <ol className="list-decimal list-inside space-y-1 pl-2">
          <li>Récupération des sujets actifs (<Pill>GET /api/topics</Pill>)</li>
          <li>Collecte des articles Bing News RSS + flux RSS personnalisés</li>
          <li>Filtrage par ancienneté (<Pill>maxAgeDays</Pill>) et déduplication</li>
          <li>Synthèse et catégorisation par LLM</li>
          <li>Envoi email aux destinataires</li>
          <li>Enregistrement de la synthèse (<Pill>POST /api/results</Pill>)</li>
        </ol>
        <p className="pt-2 border-t border-border/40">
          Auto-hébergement via{" "}
          <ExtLink href="https://docs.n8n.io/hosting/installation/docker/">Docker</ExtLink> ou{" "}
          <ExtLink href="https://docs.n8n.io/hosting/installation/npm/">npm</ExtLink>.
          Cloud sur <ExtLink href="https://app.n8n.cloud">n8n.cloud</ExtLink>.
        </p>
      </Section>

      <Section title="Sources de données">
        <div className="space-y-3">
          <div className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3 space-y-1">
            <p className="font-medium text-foreground text-xs uppercase tracking-wider">Bing News RSS</p>
            <p>
              Requête <ExtLink href="https://www.bing.com/news/search?q=intelligence+artificielle&format=RSS&setlang=fr&cc=FR">Bing News RSS</ExtLink> générée
              automatiquement depuis les mots-clés et la requête avancée de chaque sujet.
              Opérateurs supportés : <Pill>"guillemets"</Pill> <Pill>OR</Pill> <Pill>(groupes)</Pill> <Pill>-exclusion</Pill>.
            </p>
          </div>
          <div className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3 space-y-1">
            <p className="font-medium text-foreground text-xs uppercase tracking-wider">Flux RSS personnalisés</p>
            <p>
              URLs RSS ajoutées manuellement par sujet (blogs, publications sectorielles…),
              parsées par n8n à chaque exécution.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Intelligence artificielle">
        <p>
          <ExtLink href="https://platform.openai.com">OpenAI</ExtLink>{" "}
          <Pill>gpt-5-mini</Pill> traite les articles collectés pour produire :
          un résumé par article, une catégorisation thématique, et une synthèse globale de la semaine.
        </p>
      </Section>
    </div>
  );
}
