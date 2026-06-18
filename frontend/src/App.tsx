import { InsightsPanel } from "./components/InsightsPanel";
import { SessionsTable } from "./components/SessionsTable";
import { SyncStatusCard } from "./components/SyncStatusCard";
import { VenuesTable } from "./components/VenuesTable";
import { useSync } from "./hooks/useSync";

export default function App() {
  const {
    syncStatus,
    venues,
    sessions,
    insights,
    loading,
    syncing,
    error,
    lastSyncResult,
    runSync,
  } = useSync();

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <header className="flex h-16 items-center px-6">
        <span className="text-lg font-bold">b-connect</span>
      </header>
      <main className="mx-auto flex max-w-[1280px] flex-col gap-6 p-8">
        <SyncStatusCard
          syncStatus={syncStatus}
          syncing={syncing}
          error={error}
          lastSyncResult={lastSyncResult}
          onSync={runSync}
        />

        <section className="rounded-xl border border-border bg-surface p-6 shadow-card">
          <h2 className="mb-4 text-base font-semibold leading-6 text-text-primary">
            Insights
          </h2>
          <InsightsPanel insights={insights} loading={loading} />
        </section>

        <section className="rounded-xl border border-border bg-surface p-6 shadow-card">
          <h2 className="mb-4 text-base font-semibold leading-6 text-text-primary">
            Venues
          </h2>
          <VenuesTable venues={venues} loading={loading} />
        </section>

        <section className="rounded-xl border border-border bg-surface p-6 shadow-card">
          <h2 className="mb-4 text-base font-semibold leading-6 text-text-primary">
            Sessions
          </h2>
          <SessionsTable sessions={sessions} loading={loading} />
        </section>
      </main>
    </div>
  );
}
