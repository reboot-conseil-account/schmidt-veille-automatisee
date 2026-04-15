import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import type { Doc } from "@convex/dataModel";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface TopicRowProps {
  topic: Doc<"topics">;
  selected: boolean;
  launching: boolean;
  onSelect: (id: Doc<"topics">["_id"], selected: boolean) => void;
  onToggleActive: (id: Doc<"topics">["_id"], active: boolean) => void;
  onRemove: (id: Doc<"topics">["_id"]) => void;
  onLaunch: (id: Doc<"topics">["_id"]) => void;
}

export function TopicRow({ topic, selected, launching, onSelect, onToggleActive, onRemove, onLaunch }: TopicRowProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  function handleDelete() {
    onRemove(topic._id);
    setDeleteOpen(false);
    toast.success(`"${topic.name}" supprimé`);
  }

  return (
    <TableRow>
      <TableCell className="w-10">
        <Checkbox
          checked={selected}
          onCheckedChange={(checked) => onSelect(topic._id, !!checked)}
        />
      </TableCell>
      <TableCell className="font-medium">{topic.name}</TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {topic.keywords.slice(0, 3).map((kw) => (
            <Badge key={kw} variant="outline" className="text-xs">
              {kw}
            </Badge>
          ))}
          {topic.keywords.length > 3 && (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              +{topic.keywords.length - 3}
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Switch
          checked={topic.active}
          onCheckedChange={(checked) => onToggleActive(topic._id, checked)}
        />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onLaunch(topic._id)}
            disabled={launching}
          >
            {launching ? "Lancement…" : "Lancer"}
          </Button>
          <Button variant="outline" size="sm" render={<Link to={`/topics/${topic._id}`} />}>
            Modifier
          </Button>
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger render={<Button variant="destructive" size="sm" />}>
              Supprimer
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Supprimer le sujet</DialogTitle>
                <DialogDescription>
                  Êtes-vous sûr de vouloir supprimer «&nbsp;{topic.name}&nbsp;»
                  ? Cette action est irréversible.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                  Annuler
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Supprimer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </TableCell>
    </TableRow>
  );
}
