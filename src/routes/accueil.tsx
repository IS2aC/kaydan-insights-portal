import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, AlarmClock, Target, Scale, FileX2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { DaoBadge, Deadline, MatchScore, OfferPanel, TypeBadge } from "@/components/OfferBits";
import { daysLeft, offers, type Offer } from "@/lib/offers";

export const Route = createFileRoute("/accueil")({
  head: () => ({
    meta: [
      { title: "Accueil — Kaydan Scrapers" },
      { name: "description", content: "Synthèse quotidienne des appels d'offres à fort potentiel pour l'expert BID." },
      { property: "og:title", content: "Accueil — Kaydan Scrapers" },
      { property: "og:description", content: "Les opportunités à traiter en priorité, en un coup d'œil." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Accueil,
});

function Accueil() {
  const [open, setOpen] = useState<Offer | null>(null);
  const it = offers.filter((o) => o.sector === "IT");
  const urgent = it.filter((o) => daysLeft(o) <= 7);
  const priority = [...it].filter((o) => o.match >= 75).sort((a, b) => b.match - a.match).slice(0, 3);
  const missing = it.filter((o) => o.dao !== "disponible" && daysLeft(o) <= 14);

  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Bonjour, voici votre veille du jour</h1>
          <p className="mt-1 text-sm text-muted-foreground">Lundi 26 octobre 2026 · mise à jour à 04:16 · secteur IT</p>
        </div>
        <Link to="/offres" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
          Explorer toutes les offres <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <Kpi icon={Target} label="Fort potentiel" value={it.filter((o) => o.match >= 80).length} hint="adéquation ≥ 80" tone="success" />
        <Kpi icon={AlarmClock} label="Clôturent sous 7 jours" value={urgent.length} hint={`dont ${urgent.filter((o) => daysLeft(o) <= 3).length} sous 3 jours`} tone="accent" />
        <Kpi icon={FileX2} label="Dossiers incomplets" value={missing.length} hint="pièces à récupérer" tone="muted" />
        <Kpi icon={Scale} label="En attente Go/NoGo" value={1} hint="aucune analyse en cours" tone="primary" />
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-xl font-semibold">À regarder en priorité</h2>
          <span className="text-sm text-muted-foreground">Meilleure adéquation à votre profil</span>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {priority.map((o) => (
            <button key={o.id} onClick={() => setOpen(o)} className="group flex flex-col rounded-2xl border bg-card p-5 text-left transition hover:border-primary/40 hover:shadow-card">
              <div className="flex items-center justify-between">
                <MatchScore value={o.match} />
                <Deadline offer={o} />
              </div>
              <h3 className="mt-4 line-clamp-2 font-display font-semibold leading-snug">{o.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{o.buyer} · {o.country}</p>
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed">{o.summary}</p>
              <div className="mt-auto flex items-center justify-between pt-5">
                <div className="flex items-center gap-2"><TypeBadge type={o.type} /><DaoBadge status={o.dao} /></div>
                <span className="text-sm font-semibold text-primary opacity-0 transition group-hover:opacity-100">Détail</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-10 overflow-hidden rounded-2xl border bg-card">
        <div className="flex items-baseline justify-between p-5">
          <div>
            <h2 className="font-display text-xl font-semibold">Échéances de la semaine</h2>
            <p className="text-sm text-muted-foreground">Ne laissez rien passer : clôture sous 7 jours</p>
          </div>
          <Link to="/offres" className="text-sm font-semibold text-primary hover:underline">Voir les {it.length} offres</Link>
        </div>
        <ul className="divide-y border-t">
          {urgent.map((o) => (
            <li key={o.id}>
              <button onClick={() => setOpen(o)} className="grid w-full grid-cols-[90px_1fr_auto] items-center gap-6 px-5 py-4 text-left hover:bg-muted/50 md:grid-cols-[90px_1fr_110px_150px]">
                <Deadline offer={o} />
                <div className="min-w-0">
                  <div className="truncate font-medium">{o.title}</div>
                  <div className="truncate text-sm text-muted-foreground">{o.buyer}</div>
                </div>
                <div className="hidden md:block"><MatchScore value={o.match} /></div>
                <DaoBadge status={o.dao} />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <OfferPanel offer={open} onClose={() => setOpen(null)} />
    </AppShell>
  );
}

const tones = {
  success: "bg-success/10 text-success",
  accent: "bg-accent/10 text-accent-strong",
  muted: "bg-muted text-muted-foreground",
  primary: "bg-secondary text-primary",
};

function Kpi({ icon: Icon, label, value, hint, tone }: { icon: typeof Target; label: string; value: number; hint: string; tone: keyof typeof tones }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-center gap-3">
        <span className={`grid h-9 w-9 place-items-center rounded-lg ${tones[tone]}`}><Icon className="h-4.5 w-4.5" /></span>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="mt-4 font-display text-3xl font-semibold tabular-nums">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}
