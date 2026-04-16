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
import { Loader2, Play, Pencil, Trash2 } from "lucide-react";

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
    <TableRow className="group animate-slide-up transition-colors hover:bg-muted/30">
      <TableCell className="w-10">
        <Checkbox
          checked={selected}
          onCheckedChange={(checked) => onSelect(topic._id, !!checked)}
        />
      </TableCell>
      <TableCell>
        <span className="font-semibold text-foreground">{topic.name}</span>
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {topic.keywords.slice(0, 3).map((kw) => (
            <Badge key={kw} variant="outline" className="text-xs border-border/60 bg-background">
              {kw}
            </Badge>
          ))}
          {topic.keywords.length > 3 && (
            <Badge variant="outline" className="text-xs text-muted-foreground border-border/60">
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
        <div className="flex justify-end gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity duration-150">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLaunch(topic._id)}
            disabled={launching}
            className="h-8 gap-1.5 text-xs hover:bg-primary/10 hover:text-primary transition-colors"
          >
            {launching
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <Play className="h-3.5 w-3.5" />}
            {launching ? "Lancement…" : "Lancer"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            render={<Link to={`/topics/${topic._id}`} />}
            className="h-8 gap-1.5 text-xs hover:bg-muted transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
            Modifier
          </Button>
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 text-xs hover:bg-destructive/10 hover:text-destructive transition-colors"
                />
              }
            >
              <Trash2 className="h-3.5 w-3.5" />
              Supprimer
            </DialogTrigger>
            <DialogContent className="animate-scale-in">
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
