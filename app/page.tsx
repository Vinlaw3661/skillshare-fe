"use client";

import { useState, useMemo, useEffect } from "react";
import type { SkillCategory } from "@/lib/mock-sessions";
import { MOCK_SESSIONS } from "@/lib/mock-sessions";
import { SiteHeader } from "@/components/site-header";
import { SearchBar } from "@/components/search-bar";
import { FilterChips } from "@/components/filter-chips";
import { SessionCard } from "@/components/session-card";
import { SessionGridSkeleton } from "@/components/session-skeleton";
import { EmptyState } from "@/components/empty-state";

export default function BrowseSessions() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate an initial API fetch
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Simulate loading when filters change
  const handleSearchChange = (value: string) => {
    setQuery(value);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
  };

  const handleCategoryChange = (category: SkillCategory | null) => {
    setSelectedCategory(category);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 400);
  };

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return MOCK_SESSIONS.filter((s) => {
      const matchesCategory = selectedCategory ? s.skill_category === selectedCategory : true;
      const matchesSearch = q
        ? s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
        : true;
      return matchesCategory && matchesSearch;
    });
  }, [query, selectedCategory]);

  const resultCount = filtered.length;

  return (
    <div className="min-h-screen bg-background overflow-y-auto">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Browse Sessions
          </h1>
          <p className="mt-2 text-base text-muted-foreground max-w-2xl leading-relaxed">
            Discover skill-sharing sessions taught by students at your university.
            Search by topic or filter by category to find your next learning adventure.
          </p>
        </section>

        {/* Search & Filters */}
        <section className="mb-8 flex flex-col gap-4" aria-label="Search and filters">
          <SearchBar value={query} onChange={handleSearchChange} />
          <FilterChips selected={selectedCategory} onSelect={handleCategoryChange} />
        </section>

        {/* Result Count */}
        {!isLoading && (
          <div className="mb-5 flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              {resultCount} {resultCount === 1 ? "session" : "sessions"} found
            </span>
            {(query || selectedCategory) && (
              <button
                onClick={() => {
                  setQuery("");
                  setSelectedCategory(null);
                }}
                className="text-sm font-medium text-primary hover:underline transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
        )}

        {/* Results Grid */}
        {isLoading ? (
          <SessionGridSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState query={query} category={selectedCategory} />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
