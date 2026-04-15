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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Sujets de veille</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleTrigger}
            disabled={triggering || launchingId !== null}
          >
            {triggering
              ? "Lancement…"
              : selectedIds.size > 0
              ? `Lancer (${selectedIds.size} sélectionné${selectedIds.size > 1 ? "s" : ""})`
              : "Lancer maintenant"}
          </Button>
          <Button render={<Link to="/topics/new" />}>
            Nouveau sujet
          </Button>
        </div>
      </div>

      {topics === undefined ? (
        <div className="text-muted-foreground text-sm">Chargement...</div>
      ) : topics.length === 0 ? (
        <div className="text-muted-foreground text-sm">
          Aucun sujet. Créez-en un pour commencer.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  data-state={someSelected ? "indeterminate" : undefined}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Mots-clés</TableHead>
              <TableHead>Actif</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
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
      )}
    </div>
  );
}
