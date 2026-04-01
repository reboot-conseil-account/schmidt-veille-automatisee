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
}

const defaultForm: FormState = {
  name: "",
  keywords: [],
  rssUrls: [],
  recipients: [],
  active: true,
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
      });
      setInitialized(true);
    }
  }, [topic, isEdit, initialized]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isEdit) {
      await update({ id: id as Id<"topics">, ...form });
      toast.success("Sujet mis à jour");
    } else {
      await create(form);
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
