"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative w-full">
      <Search
        className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
        size={20}
        aria-hidden="true"
      />
      <Input
        type="search"
        placeholder="Search sessions by title or description..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 pl-12 pr-10 text-base rounded-xl bg-card border-border shadow-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary"
        aria-label="Search sessions"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Clear search"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}
