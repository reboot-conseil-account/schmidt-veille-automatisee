import { useState, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";

interface ArrayFieldInputProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export function ArrayFieldInput({
  label,
  value,
  onChange,
  placeholder,
}: ArrayFieldInputProps) {
  const [input, setInput] = useState("");

  function addItem() {
    const trimmed = input.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput("");
  }

  function removeItem(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem();
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      {/* Tags */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-2.5 rounded-md border border-border/60 bg-muted/30 min-h-[40px]">
          {value.map((item, i) => (
            <Badge
              key={i}
              variant="secondary"
              className="gap-1 pr-1 pl-2.5 transition-all hover:bg-muted animate-fade-in"
            >
              <span className="text-xs">{item}</span>
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="rounded-full p-0.5 hover:bg-foreground/10 transition-colors ml-0.5"
                aria-label={`Supprimer ${item}`}
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input row */}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="transition-shadow focus-visible:shadow-sm"
        />
        <Button
          type="button"
          variant="outline"
          onClick={addItem}
          className="gap-1.5 shrink-0 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Ajouter
        </Button>
      </div>
    </div>
  );
}
