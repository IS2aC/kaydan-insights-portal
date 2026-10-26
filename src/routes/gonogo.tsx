import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/gonogo")({
  head: () => ({
    meta: [
      { title: "Go/NoGo — Kaydan Scrapers" },
      { name: "description", content: "Analyses Go/NoGo des appels d'offres qualifiés." },
      { property: "og:title", content: "Go/NoGo — Kaydan Scrapers" },
      { property: "og:description", content: "Arbitrez les offres qualifiées avec l'agent d'analyse." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <AppShell>
      <h1 className="font-display text-3xl font-semibold">Go/NoGo</h1>
      <div className="mt-8 rounded-2xl border border-dashed bg-card p-12 text-center">
        <p className="font-medium">L'analyse Go/NoGo sera conçue à l'étape suivante.</p>
        <p className="mt-1 text-sm text-muted-foreground">Les offres transmises depuis la vue Offres apparaîtront ici.</p>
        <Link to="/offres" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">Retour aux offres</Link>
      </div>
    </AppShell>
  ),
});
