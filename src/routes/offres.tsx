import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { DaoBadge, Deadline, MatchScore, OfferPanel, TypeBadge } from "@/components/OfferBits";
import { daysLeft, offers, type Offer } from "@/lib/offers";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/offres")({
  head: () => ({
    meta: [
      { title: "Offres — Kaydan Scrapers" },
      { name: "description", content: "Explorez, filtrez et qualifiez les appels d'offres et AMI collectés par la veille." },
      { property: "og:title", content: "Offres — Kaydan Scrapers" },
      { property: "og:description", content: "Appels d'offres et AMI collectés sur les sources surveillées." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Offres,
});

const windows = [
  { k: 0, l: "Toutes" },
  { k: 7, l: "≤ 7 j" },
  { k: 14, l: "≤ 14 j" },
  { k: 30, l: "≤ 30 j" },
];

function Offres() {
  const [q, setQ] = useState("");
  const [win, setWin] = useState(30);
  const [sector, setSector] = useState("IT");
  const [type, setType] = useState("");
  const [onlyStrong, setOnlyStrong] = useState(false);
  const [sort, setSort] = useState<"deadline" | "match">("deadline");
  const [open, setOpen] = useState<Offer | null>(null);

  const sectors = [...new Set(offers.map((o) => o.sector))];
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return offers
      .filter((o) => (win ? daysLeft(o) <= win : true))
      .filter((o) => (sector ? o.sector === sector : true))
      .filter((o) => (type ? o.type === type : true))
      .filter((o) => (onlyStrong ? o.match >= 80 : true))
      .filter((o) => !s || [o.title, o.buyer, o.ref ?? ""].some((v) => v.toLowerCase().includes(s)))
      .sort((a, b) => (sort === "match" ? b.match - a.match : daysLeft(a) - daysLeft(b)));
  }, [q, win, sector, type, onlyStrong, sort]);

  const reset = () => { setQ(""); setWin(0); setSector(""); setType(""); setOnlyStrong(false); };

  return (
    <AppShell>
      <h1 className="font-display text-3xl font-semibold">Offres</h1>
      <p className="mt-1 text-sm text-muted-foreground">Qualifiez les offres, récupérez le dossier, puis transmettez-les à l'analyse Go/NoGo.</p>

      <div className="mt-6 space-y-3">
        <label className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 focus-within:ring-2 focus-within:ring-ring">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un intitulé, un acheteur, une référence..." className="flex-1 bg-transparent text-sm outline-none" />
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-lg border bg-card p-1">
            {windows.map((w) => (
              <button key={w.k} onClick={() => setWin(w.k)} className={cn("rounded-md px-3 py-1.5 text-sm", win === w.k ? "bg-secondary font-semibold text-primary" : "text-muted-foreground hover:text-foreground")}>{w.l}</button>
            ))}
          </div>
          <Select value={sector} onChange={setSector} label="Secteur" options={sectors} />
          <Select value={type} onChange={setType} label="Type" options={["AO", "AMI", "DP"]} />
          <button onClick={() => setOnlyStrong((v) => !v)} className={cn("rounded-lg border px-3 py-2 text-sm", onlyStrong ? "border-success/40 bg-success/10 font-semibold text-success" : "bg-card text-muted-foreground hover:text-foreground")}>Fort potentiel uniquement</button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
        <div>
          <span className="font-semibold">{list.length} offres</span>
          <button onClick={reset} className="ml-4 font-semibold text-primary hover:underline">Réinitialiser</button>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          Trier par
          <button onClick={() => setSort("deadline")} className={cn(sort === "deadline" && "font-semibold text-foreground")}>échéance</button>·
          <button onClick={() => setSort("match")} className={cn(sort === "match" && "font-semibold text-foreground")}>adéquation</button>
        </div>
      </div>

      <div className="mt-3 overflow-hidden rounded-2xl border bg-card">
        <div className="hidden grid-cols-[100px_1fr_120px_150px_24px] gap-6 border-b bg-muted/60 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid">
          <span>Échéance</span><span>Offre</span><span>Adéquation</span><span>Dossier</span><span />
        </div>
        {list.length === 0 && <p className="p-10 text-center text-sm text-muted-foreground">Aucune offre ne correspond à ces filtres.</p>}
        <ul className="divide-y">
          {list.map((o) => (
            <li key={o.id}>
              <button onClick={() => setOpen(o)} className="group grid w-full grid-cols-[80px_1fr] items-center gap-x-6 gap-y-2 px-5 py-4 text-left hover:bg-muted/40 md:grid-cols-[100px_1fr_120px_150px_24px]">
                <Deadline offer={o} />
                <div className="min-w-0">
                  <div className="line-clamp-2 font-medium leading-snug">{o.title}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <TypeBadge type={o.type} />
                    <span>{o.buyer}</span>·<span>{o.country}</span>
                    {o.budget && <>·<span>{o.budget}</span></>}
                  </div>
                </div>
                <div className="col-start-2 md:col-start-auto"><MatchScore value={o.match} /></div>
                <div className="col-start-2 md:col-start-auto"><DaoBadge status={o.dao} /></div>
                <ChevronRight className="hidden h-4 w-4 text-muted-foreground group-hover:text-primary md:block" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <OfferPanel offer={open} onClose={() => setOpen(null)} />
    </AppShell>
  );
}

function Select({ value, onChange, label, options }: { value: string; onChange: (v: string) => void; label: string; options: string[] }) {
  return (
    <label className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm">
      <span className="text-muted-foreground">{label} :</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="bg-transparent font-medium text-foreground outline-none">
        <option value="">tous</option>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </label>
  );
}
