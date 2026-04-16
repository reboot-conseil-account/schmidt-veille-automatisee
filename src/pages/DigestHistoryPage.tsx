import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DigestCard } from "@/components/results/DigestCard";
import { History, ChevronDown } from "lucide-react";

export function DigestHistoryPage() {
  const [selectedTopicId, setSelectedTopicId] = useState<Id<"topics"> | null>(null);

  const topics = useQuery(api.topics.list);
  const results = useQuery(
    api.results.listByTopic,
    selectedTopicId ? { topicId: selectedTopicId } : "skip"
  );

  const selectedTopic = topics?.find((t) => t._id === selectedTopicId);

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Historique des digests</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Consultez les synthèses générées par sujet.
          </p>
        </div>

        {/* Topic selector */}
        <div className="w-64">
          <Select
            value={selectedTopicId ?? ""}
            onValueChange={(v) => setSelectedTopicId(v as Id<"topics">)}
          >
            <SelectTrigger className="bg-card shadow-sm">
              <SelectValue placeholder="Choisir un sujet…">
                {selectedTopicId
                  ? topics?.find((t) => t._id === selectedTopicId)?.name
                  : undefined}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {topics?.map((topic) => (
                <SelectItem key={topic._id} value={topic._id}>
                  {topic.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      {!selectedTopicId ? (
        <EmptyPrompt />
      ) : results === undefined ? (
        <LoadingState />
      ) : results.length === 0 ? (
        <NoResultsState topicName={selectedTopic?.name} />
      ) : (
        <div className="space-y-4 stagger">
          {results.map((result) => (
            <DigestCard key={result._id} result={result} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyPrompt() {
  return (
    <div className="rounded-xl border bg-card shadow-sm p-16 flex flex-col items-center justify-center text-center gap-4 animate-scale-in">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
        <History className="h-6 w-6 text-primary" />
      </div>
      <div>
        <p className="font-semibold text-foreground">Sélectionnez un sujet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Choisissez un sujet dans la liste pour afficher son historique de digests.
        </p>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground animate-bounce">
        <ChevronDown className="h-3.5 w-3.5" />
      </div>
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

function NoResultsState({ topicName }: { topicName?: string }) {
  return (
    <div className="rounded-xl border bg-card shadow-sm p-12 flex flex-col items-center justify-center text-center gap-2 animate-scale-in">
      <p className="font-medium text-foreground">Aucun digest pour ce sujet</p>
      <p className="text-sm text-muted-foreground">
        {topicName
          ? `Aucune synthèse n'a encore été générée pour « ${topicName} ».`
          : "Lancez un workflow pour générer le premier digest."}
      </p>
    </div>
  );
}
