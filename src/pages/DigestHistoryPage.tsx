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

export function DigestHistoryPage() {
  const [selectedTopicId, setSelectedTopicId] = useState<Id<"topics"> | null>(
    null
  );

  const topics = useQuery(api.topics.list);
  const results = useQuery(
    api.results.listByTopic,
    selectedTopicId ? { topicId: selectedTopicId } : "skip"
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Historique des digests</h1>

      <div className="max-w-xs">
        <Select
          value={selectedTopicId ?? ""}
          onValueChange={(v) => setSelectedTopicId(v as Id<"topics">)}
        >
          <SelectTrigger>
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

      {selectedTopicId && (
        <>
          {results === undefined ? (
            <div className="text-muted-foreground text-sm">Chargement...</div>
          ) : results.length === 0 ? (
            <div className="text-muted-foreground text-sm">
              Aucun digest pour ce sujet.
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((result) => (
                <DigestCard key={result._id} result={result} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
