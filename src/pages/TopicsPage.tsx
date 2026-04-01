import { Link } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TopicRow } from "@/components/topics/TopicRow";

export function TopicsPage() {
  const topics = useQuery(api.topics.list);
  const update = useMutation(api.topics.update);
  const remove = useMutation(api.topics.remove);

  function handleToggleActive(id: Id<"topics">, active: boolean) {
    update({ id, active });
  }

  function handleRemove(id: Id<"topics">) {
    remove({ id });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Sujets de veille</h1>
        <Button render={<Link to="/topics/new" />}>
          Nouveau sujet
        </Button>
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
                onToggleActive={handleToggleActive}
                onRemove={handleRemove}
              />
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
