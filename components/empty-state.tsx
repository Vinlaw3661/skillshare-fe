import { SearchX } from "lucide-react";

export function EmptyState({ query, category }: { query: string; category: string | null }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center" role="status">
      <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-muted mb-5">
        <SearchX size={28} className="text-muted-foreground" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">No sessions found</h3>
      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
        {query && category
          ? `No results for "${query}" in ${category}. Try adjusting your search or filters.`
          : query
            ? `No results for "${query}". Try a different search term.`
            : category
              ? `No sessions in ${category} right now. Check back soon!`
              : "No sessions available at the moment."}
      </p>
    </div>
  );
}
