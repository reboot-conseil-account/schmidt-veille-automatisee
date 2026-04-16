import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Plus,
  Trash2,
  Upload,
  Mail,
  Users,
  FileText,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

function parseEmailsFromCsv(text: string): string[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  // Detect if first line is a header row (contains no @)
  const firstLine = lines[0].toLowerCase();
  const hasHeader =
    !firstLine.includes("@") &&
    (firstLine === "email" ||
      firstLine === "e-mail" ||
      firstLine === "mail" ||
      firstLine.split(",").some((col) => col.trim() === "email" || col.trim() === "mail"));

  const dataLines = hasHeader ? lines.slice(1) : lines;

  // Find "email" column index in CSV headers
  let emailColIndex = 0;
  if (hasHeader) {
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const idx = headers.findIndex((h) => h === "email" || h === "mail" || h === "e-mail");
    if (idx !== -1) emailColIndex = idx;
  }

  const emails: string[] = [];
  for (const line of dataLines) {
    const cols = line.split(",");
    const candidate = (cols[emailColIndex] ?? cols[0] ?? "").trim().replace(/^["']|["']$/g, "");
    if (candidate.includes("@")) {
      emails.push(candidate.toLowerCase());
    }
  }

  return [...new Set(emails)];
}

interface CreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function CreateDialog({ open, onOpenChange }: CreateDialogProps) {
  const create = useMutation(api.mailingLists.create);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [manualInput, setManualInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  function reset() {
    setName("");
    setEmails([]);
    setManualInput("");
    setFileName(null);
    setSaving(false);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseEmailsFromCsv(text);
      setEmails((prev) => [...new Set([...prev, ...parsed])]);
      if (parsed.length > 0) {
        toast.success(`${parsed.length} adresse(s) importée(s) depuis le CSV`);
      } else {
        toast.error("Aucune adresse email trouvée dans le fichier");
      }
    };
    reader.readAsText(file);
    // Reset the input so the same file can be re-selected
    e.target.value = "";
  }

  function addManualEmail() {
    const trimmed = manualInput.trim().toLowerCase();
    if (!trimmed.includes("@")) return;
    if (!emails.includes(trimmed)) {
      setEmails((prev) => [...prev, trimmed]);
    }
    setManualInput("");
  }

  function removeEmail(email: string) {
    setEmails((prev) => prev.filter((e) => e !== email));
  }

  async function handleSave() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Veuillez donner un nom à la liste");
      return;
    }
    if (emails.length === 0) {
      toast.error("La liste doit contenir au moins une adresse email");
      return;
    }
    setSaving(true);
    try {
      await create({ name: trimmedName, emails });
      toast.success(`Liste "${trimmedName}" créée avec ${emails.length} destinataire(s)`);
      reset();
      onOpenChange(false);
    } catch {
      toast.error("Erreur lors de la création de la liste");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nouvelle liste de diffusion</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="list-name">Nom de la liste</Label>
            <Input
              id="list-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex : Équipe Schmidt, Partenaires…"
            />
          </div>

          {/* CSV import */}
          <div className="space-y-1.5">
            <Label>Importer depuis un CSV</Label>
            <div
              className="flex items-center gap-3 rounded-lg border border-dashed border-border/70 bg-muted/30 px-4 py-3 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm text-muted-foreground">
                {fileName ? (
                  <span className="text-foreground font-medium">{fileName}</span>
                ) : (
                  "Cliquer pour sélectionner un fichier CSV"
                )}
              </span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv,text/plain"
              className="hidden"
              onChange={handleFileChange}
            />
            <p className="text-xs text-muted-foreground">
              Format accepté : une colonne <code className="font-mono">email</code> ou une adresse par ligne.
            </p>
          </div>

          {/* Manual entry */}
          <div className="space-y-1.5">
            <Label>Ajouter manuellement</Label>
            <div className="flex gap-2">
              <Input
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addManualEmail(); } }}
                placeholder="email@exemple.com"
              />
              <Button type="button" variant="outline" onClick={addManualEmail} className="shrink-0 gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                Ajouter
              </Button>
            </div>
          </div>

          {/* Email list preview */}
          {emails.length > 0 && (
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                {emails.length} destinataire{emails.length !== 1 ? "s" : ""}
              </Label>
              <div className="max-h-36 overflow-y-auto rounded-lg border bg-muted/20 p-2 space-y-1">
                {emails.map((email) => (
                  <div
                    key={email}
                    className="flex items-center justify-between px-2 py-1 rounded-md hover:bg-muted/50 group"
                  >
                    <span className="text-xs font-mono text-foreground/80">{email}</span>
                    <button
                      type="button"
                      onClick={() => removeEmail(email)}
                      className="opacity-0 group-hover:opacity-100 rounded p-0.5 hover:bg-destructive/10 hover:text-destructive transition-all"
                      aria-label={`Supprimer ${email}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Annuler</DialogClose>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? "Création…" : "Créer la liste"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface MailingListCardProps {
  list: { _id: Id<"mailingLists">; name: string; emails: string[] };
}

function MailingListCard({ list }: MailingListCardProps) {
  const remove = useMutation(api.mailingLists.remove);
  const [expanded, setExpanded] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    await remove({ id: list._id });
    toast.success(`Liste "${list.name}" supprimée`);
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden animate-fade-in">
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Mail className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{list.name}</p>
            <p className="text-xs text-muted-foreground">
              {list.emails.length} destinataire{list.emails.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-4">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? "Réduire" : "Voir les adresses"}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleDelete}
            onBlur={() => setConfirming(false)}
            className={confirming ? "text-destructive hover:text-destructive hover:bg-destructive/10" : "text-muted-foreground hover:text-destructive hover:bg-destructive/10"}
            aria-label="Supprimer la liste"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          {confirming && (
            <span className="text-xs text-destructive font-medium">Cliquer à nouveau pour confirmer</span>
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t bg-muted/20 px-5 py-3">
          <div className="flex flex-wrap gap-1.5">
            {list.emails.map((email) => (
              <Badge key={email} variant="secondary" className="font-mono text-xs font-normal">
                {email}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function MailingListsPage() {
  const lists = useQuery(api.mailingLists.list);
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Listes de diffusion</h1>
          {lists && lists.length > 0 && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {lists.length} liste{lists.length !== 1 ? "s" : ""} configurée{lists.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2 shadow-sm">
          <Plus className="h-4 w-4" />
          Nouvelle liste
        </Button>
      </div>

      {/* Content */}
      {lists === undefined ? (
        <div className="rounded-xl border bg-card shadow-sm p-12 flex items-center justify-center">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <span className="text-sm">Chargement…</span>
          </div>
        </div>
      ) : lists.length === 0 ? (
        <div className="rounded-xl border bg-card shadow-sm p-16 flex flex-col items-center justify-center text-center gap-4 animate-scale-in">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Aucune liste de diffusion</p>
            <p className="text-sm text-muted-foreground mt-1">
              Créez une liste pour l'assigner à un sujet de veille.
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="gap-2 mt-2">
            <Plus className="h-4 w-4" />
            Nouvelle liste
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {lists.map((list) => (
            <MailingListCard key={list._id} list={list} />
          ))}
        </div>
      )}

      <CreateDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
