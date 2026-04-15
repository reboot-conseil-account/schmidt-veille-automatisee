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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrayFieldInput } from "@/components/topics/ArrayFieldInput";

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
    return <div className="text-muted-foreground text-sm">Chargement...</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-semibold">
        {isEdit ? "Modifier le sujet" : "Nouveau sujet"}
      </h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informations</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Intelligence Artificielle"
                required
              />
            </div>

            <ArrayFieldInput
              label="Mots-clés"
              value={form.keywords}
              onChange={(keywords) => setForm({ ...form, keywords })}
              placeholder="Ex: machine learning"
            />

            <div className="space-y-2">
              <Label htmlFor="customQuery">Requête personnalisée Google News</Label>
              <textarea
                id="customQuery"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                value={form.customQuery}
                onChange={(e) => setForm({ ...form, customQuery: e.target.value })}
                placeholder='Ex: "intelligence artificielle" (OpenAI OR Anthropic) -jeu'
              />
              <p className="text-xs text-muted-foreground">
                Opérateurs supportés&nbsp;: guillemets pour expression exacte, OR, parenthèses, - pour exclure. Génère un seul flux en plus des mots-clés.
              </p>
            </div>

            <ArrayFieldInput
              label="Flux RSS"
              value={form.rssUrls}
              onChange={(rssUrls) => setForm({ ...form, rssUrls })}
              placeholder="https://..."
            />

            <ArrayFieldInput
              label="Destinataires"
              value={form.recipients}
              onChange={(recipients) => setForm({ ...form, recipients })}
              placeholder="email@exemple.com"
            />

            <div className="flex items-center gap-3">
              <Switch
                id="active"
                checked={form.active}
                onCheckedChange={(active) => setForm({ ...form, active })}
              />
              <Label htmlFor="active">Actif</Label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit">
                {isEdit ? "Enregistrer" : "Créer"}
              </Button>
              <Button variant="outline" render={<Link to="/topics" />}>
                Annuler
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
