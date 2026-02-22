"use client";

import { cn } from "@/lib/utils";
import type { SkillCategory } from "@/lib/mock-sessions";
import { CATEGORIES } from "@/lib/mock-sessions";

interface FilterChipsProps {
  selected: SkillCategory | null;
  onSelect: (category: SkillCategory | null) => void;
}

export function FilterChips({ selected, onSelect }: FilterChipsProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
      <button
        onClick={() => onSelect(null)}
        className={cn(
          "px-4 py-2 rounded-full text-sm font-medium transition-all border",
          selected === null
            ? "bg-primary text-primary-foreground border-primary shadow-sm"
            : "bg-card text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground"
        )}
        aria-pressed={selected === null}
      >
        All Sessions
      </button>
      {CATEGORIES.map((category) => (
        <button
          key={category}
          onClick={() => onSelect(selected === category ? null : category)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-all border",
            selected === category
              ? "bg-primary text-primary-foreground border-primary shadow-sm"
              : "bg-card text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground"
          )}
          aria-pressed={selected === category}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
