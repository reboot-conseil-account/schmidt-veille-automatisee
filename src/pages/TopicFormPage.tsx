import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrayFieldInput } from "@/components/topics/ArrayFieldInput";
import { ArrowLeft, Save } from "lucide-react";

interface FormState {
  name: string;
  keywords: string[];
  rssUrls: string[];
  recipients: string[];
  active: boolean;
  customQuery: string;
}

const defaultForm: FormState = {
  name: "",
  keywords: [],
  rssUrls: [],
  recipients: [],
  active: true,
  customQuery: "",
};

export function TopicFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const topic = useQuery(
    api.topics.get,
    isEdit ? { id: id as Id<"topics"> } : "skip"
  );

  const create = useMutation(api.topics.create);
  const update = useMutation(api.topics.update);

  const [form, setForm] = useState<FormState>(defaultForm);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (isEdit && topic && !initialized) {
      setForm({
        name: topic.name,
        keywords: topic.keywords,
        rssUrls: topic.rssUrls,
        recipients: topic.recipients,
        active: topic.active,
        customQuery: topic.customQuery ?? "",
      });
      setInitialized(true);
    }
  }, [topic, isEdit, initialized]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...form,
      customQuery: form.customQuery.trim() || undefined,
    };
    if (isEdit) {
      await update({ id: id as Id<"topics">, ...payload });
      toast.success("Sujet mis à jour");
    } else {
      await create(payload);
      toast.success("Sujet créé");
    }
    navigate("/topics");
  }

  if (isEdit && topic === undefined) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-sm">Chargement…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl animate-slide-up">
      {/* Back link + title */}
      <div>
        <Link
          to="/topics"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Retour aux sujets
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">
          {isEdit ? "Modifier le sujet" : "Nouveau sujet"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Section: Informations générales */}
        <section className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-muted/20">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Informations générales
            </h2>
          </div>
          <div className="px-6 py-5 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du sujet</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex : Intelligence Artificielle"
                required
                className="transition-shadow focus-visible:shadow-sm"
              />
            </div>

            <ArrayFieldInput
              label="Mots-clés"
              value={form.keywords}
              onChange={(keywords) => setForm({ ...form, keywords })}
              placeholder="Ex : machine learning"
            />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="customQuery">Requête Bing avancée</Label>
                {form.customQuery.trim() && (
                  <a
                    href={`https://www.bing.com/news/search?q=${encodeURIComponent(form.customQuery.trim())}&format=RSS&setlang=fr&cc=FR`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    Tester →
                  </a>
                )}
              </div>
              <textarea
                id="customQuery"
                className="flex min-h-[88px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 transition-shadow focus-visible:shadow-sm resize-none"
                value={form.customQuery}
                onChange={(e) => setForm({ ...form, customQuery: e.target.value })}
                placeholder='"intelligence artificielle" (OpenAI OR Anthropic) -jeu'
              />
              <p className="text-xs text-muted-foreground">
                Recherche Bing combinée, en plus des mots-clés. Opérateurs : <code className="font-mono">"expression exacte"</code>, <code className="font-mono">OR</code>, <code className="font-mono">(groupes)</code>, <code className="font-mono">-exclusion</code>.
              </p>
            </div>
          </div>
        </section>

        {/* Section: Distribution */}
        <section className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-muted/20">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Sources & Distribution
            </h2>
          </div>
          <div className="px-6 py-5 space-y-5">
            <ArrayFieldInput
              label="Flux RSS"
              value={form.rssUrls}
              onChange={(rssUrls) => setForm({ ...form, rssUrls })}
              placeholder="https://…"
            />

            <ArrayFieldInput
              label="Destinataires"
              value={form.recipients}
              onChange={(recipients) => setForm({ ...form, recipients })}
              placeholder="email@exemple.com"
            />

            <div className="flex items-center gap-3 pt-1">
              <Switch
                id="active"
                checked={form.active}
                onCheckedChange={(active) => setForm({ ...form, active })}
              />
              <Label htmlFor="active" className="cursor-pointer">
                Sujet actif
              </Label>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <Button type="submit" className="gap-2 shadow-sm">
            <Save className="h-4 w-4" />
            {isEdit ? "Enregistrer les modifications" : "Créer le sujet"}
          </Button>
          <Button variant="outline" render={<Link to="/topics" />}>
            Annuler
          </Button>
        </div>
      </form>
    </div>
  );
}
