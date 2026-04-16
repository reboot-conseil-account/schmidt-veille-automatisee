import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useAction } from "convex/react";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TopicRow } from "@/components/topics/TopicRow";
import { Plus, Play, BookOpen } from "lucide-react";

export function TopicsPage() {
  const [triggering, setTriggering] = useState(false);
  const [launchingId, setLaunchingId] = useState<Id<"topics"> | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<Id<"topics">>>(new Set());
  const topics = useQuery(api.topics.list);
  const update = useMutation(api.topics.update);
  const remove = useMutation(api.topics.remove);
  const triggerWorkflow = useAction(api.workflow.trigger);

  async function handleTrigger() {
    setTriggering(true);
    try {
      const topicIds = selectedIds.size > 0 ? [...selectedIds] : undefined;
      await triggerWorkflow({ topicIds });
      const label = selectedIds.size > 0
        ? `${selectedIds.size} sujet(s) sélectionné(s)`
        : "tous les sujets actifs";
      toast.success(`Workflow lancé pour ${label} — les emails arriveront dans quelques minutes.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échec du déclenchement.");
    } finally {
      setTriggering(false);
    }
  }

  async function handleLaunchSingle(id: Id<"topics">) {
    setLaunchingId(id);
    try {
      await triggerWorkflow({ topicIds: [id] });
      toast.success("Workflow lancé pour ce sujet — l'email arrivera dans quelques minutes.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échec du déclenchement.");
    } finally {
      setLaunchingId(null);
    }
  }

  function handleSelect(id: Id<"topics">, selected: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function handleSelectAll(checked: boolean) {
    if (checked && topics) {
      setSelectedIds(new Set(topics.map((t) => t._id)));
    } else {
      setSelectedIds(new Set());
    }
  }

  function handleToggleActive(id: Id<"topics">, active: boolean) {
    update({ id, active });
  }

  function handleRemove(id: Id<"topics">) {
    remove({ id });
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  const allSelected = topics != null && topics.length > 0 && selectedIds.size === topics.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sujets de veille</h1>
          {topics && topics.length > 0 && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {topics.filter(t => t.active).length} actif{topics.filter(t => t.active).length !== 1 ? "s" : ""} sur {topics.length}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleTrigger}
            disabled={triggering || launchingId !== null}
            className="gap-2 transition-all duration-200"
          >
            <Play className="h-3.5 w-3.5" />
            {triggering
              ? "Lancement…"
              : selectedIds.size > 0
              ? `Lancer (${selectedIds.size})`
              : "Lancer maintenant"}
          </Button>
          <Button render={<Link to="/topics/new" />} className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" />
            Nouveau sujet
          </Button>
        </div>
      </div>

      {/* Content */}
      {topics === undefined ? (
        <LoadingState />
      ) : topics.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden animate-scale-in">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-10">
                  <Checkbox
                    checked={allSelected}
                    data-state={someSelected ? "indeterminate" : undefined}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="font-semibold text-foreground">Nom</TableHead>
                <TableHead className="font-semibold text-foreground">Mots-clés</TableHead>
                <TableHead className="font-semibold text-foreground">Actif</TableHead>
                <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="stagger">
              {topics.map((topic) => (
                <TopicRow
                  key={topic._id}
                  topic={topic}
                  selected={selectedIds.has(topic._id)}
                  launching={launchingId === topic._id}
                  onSelect={handleSelect}
                  onToggleActive={handleToggleActive}
                  onRemove={handleRemove}
                  onLaunch={handleLaunchSingle}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="rounded-xl border bg-card shadow-sm p-12 flex items-center justify-center">
      <div className="flex items-center gap-3 text-muted-foreground">
        <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <span className="text-sm">Chargement…</span>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border bg-card shadow-sm p-16 flex flex-col items-center justify-center text-center gap-4 animate-scale-in">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
        <BookOpen className="h-6 w-6 text-primary" />
      </div>
      <div>
        <p className="font-semibold text-foreground">Aucun sujet configuré</p>
        <p className="text-sm text-muted-foreground mt-1">Créez votre premier sujet de veille pour commencer.</p>
      </div>
      <Button render={<Link to="/topics/new" />} className="gap-2 mt-2">
        <Plus className="h-4 w-4" />
        Nouveau sujet
      </Button>
    </div>
  );
}
