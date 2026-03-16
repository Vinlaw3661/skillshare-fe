"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Sparkles, Wifi, WifiOff, ShieldCheck, Ticket } from "lucide-react";
import type { SkillCategory, Session } from "@/lib/mock-sessions";
import { MOCK_SESSIONS } from "@/lib/mock-sessions";
import { mockUserInteractionVector } from "@/lib/mock-user";
import { generateSecureTicket } from "@/lib/security";
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

  // 493 Advanced Feature States
  const [recommendedSessions, setRecommendedSessions] = useState<Session[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [demoTicketHash, setDemoTicketHash] = useState<string | null>(null);

  const workerRef = useRef<Worker | null>(null);

  // --- Feature 1: Web Worker Recommendation Engine (Running Silently) ---
  useEffect(() => {
    workerRef.current = new Worker(new URL('../lib/recommendation.worker.ts', import.meta.url));

    workerRef.current.onmessage = (event) => {
      setRecommendedSessions(event.data);
    };

    workerRef.current.postMessage({
      sessions: MOCK_SESSIONS,
      userVector: mockUserInteractionVector
    });

    return () => workerRef.current?.terminate();
  }, []);

  // --- Feature 2: PWA Network Status Listener ---
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // --- Feature 3: Cryptographic Ticket Generator Demo ---
  const handleGenerateTicket = async () => {
    // Generates a hash using a sample session and user ID
    const hash = await generateSecureTicket("sess-01", "exg353");
    setDemoTicketHash(hash);
  };

  // --- Search & Filter Logic ---
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

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

  return (
    <div className="min-h-screen bg-background overflow-y-auto">
      <SiteHeader />

      {/* Network Status Banner */}
      {!isOnline && (
        <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium text-destructive">
          <WifiOff size={16} />
          <span>You are currently offline. Viewing cached sessions via Service Worker.</span>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Hero Section with 493 Demo Controls */}
        <section className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Browse Sessions
              </h1>
              {isOnline && <Wifi size={20} className="text-emerald-500 mt-1" aria-label="Online" />}
            </div>
            <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
              Discover skill-sharing sessions taught by students at your university.
            </p>
          </div>

          {/* Crypto Demo Button */}
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={handleGenerateTicket}
              className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors"
            >
              <Ticket size={16} />
              Generate Check-in Ticket
            </button>
            {demoTicketHash && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span className="font-mono">{demoTicketHash.substring(0, 16)}...</span>
              </div>
            )}
          </div>
        </section>

        {/* Recommended for You (Web Worker Powered) */}
        {recommendedSessions.length > 0 && (
          <section className="mb-10" aria-label="Recommended sessions">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles size={20} className="text-amber-500" aria-hidden="true" />
              <h2 className="text-xl font-bold tracking-tight text-foreground">Recommended for You</h2>
            </div>
            <div className="-mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
              <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin">
                {recommendedSessions.map((session) => (
                  <div key={`rec-${session.id}`} className="w-[320px] shrink-0 snap-start">
                    <SessionCard session={session} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Search & Filters */}
        <section className="mb-8 flex flex-col gap-4">
          <SearchBar value={query} onChange={handleSearchChange} />
          <FilterChips selected={selectedCategory} onSelect={handleCategoryChange} />
        </section>

        {/* Results Grid */}
        {isLoading ? (
          <SessionGridSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState query={query} category={selectedCategory} />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((session) => (
              <SessionCard key={`grid-${session.id}`} session={session} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}