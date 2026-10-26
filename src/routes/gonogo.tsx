import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronRight, FileUp, FolderOpen, Hourglass, Play, Search, Scale, CalendarClock, AlignLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ScoreRing, VerdictBadge } from "@/components/GoNoGoBits";
import { analyses as seed, analysisIndex, formatDateTime, STEPS, verdictFor, type Analysis } from "@/lib/gonogo";
import { daysLeft, formatShort, offers } from "@/lib/offers";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/gonogo")({
  validateSearch: (s: Record<string, unknown>): { offre?: string } => (typeof s.offre === "string" ? { offre: s.offre } : {}),
  head: () => ({
    meta: [
      { title: "Go/NoGo — Kaydan Scrapers" },
      { name: "description", content: "Les dossiers d'appels d'offres retenus par l'expert BID et leur analyse Go/NoGo." },
      { property: "og:title", content: "Go/NoGo — Kaydan Scrapers" },
      { property: "og:description", content: "Arbitrez les offres sur lesquelles vous comptez soumettre." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: GoNoGo,
});

const filters = [
  { k: "", l: "Tous" },
  { k: "attente", l: "En attente" },
  { k: "en-cours", l: "En analyse" },
  { k: "termine", l: "Terminés" },
] as const;

function GoNoGo() {
  const { offre } = Route.useSearch();
  const [list, setList] = useState<Analysis[]>(seed);
  const [q, setQ] = useState("");
  const [f, setF] = useState<string>("");

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return list
      .filter((a) => !f || a.status === f)
      .filter((a) => !s || [a.title, a.ref, a.buyer].some((v) => v.toLowerCase().includes(s)));
  }, [list, q, f]);

  const done = list.filter((a) => a.report);
  const toArbitrate = done.filter((a) => verdictFor(analysisIndex(a)!) !== "nogo").length;
  const next = [...list].sort((a, b) => a.deadline.localeCompare(b.deadline))[0];

  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Go/NoGo</h1>
          <p className="mt-1 text-sm text-muted-foreground">Les dossiers sur lesquels vous envisagez de soumettre, analysés pièce par pièce par l'agent.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={FolderOpen} label="Dossiers suivis" value={String(list.length)} sub={`${done.length} rapport${done.length > 1 ? "s" : ""} disponible${done.length > 1 ? "s" : ""}`} />
        <Kpi icon={Hourglass} label="En analyse" value={String(list.filter((a) => a.status === "en-cours").length)} sub="durée moyenne 22 min" />
        <Kpi icon={Scale} label="Décisions à prendre" value={String(toArbitrate)} sub="rapport prêt, verdict à valider" tone="text-accent-strong" />
        <Kpi icon={CalendarClock} label="Prochaine clôture" value={`J-${daysLeft({ deadline: next.deadline } as never)}`} sub={next.title} tone="text-destructive" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="min-w-0 rounded-2xl border bg-card">
          <div className="flex flex-wrap items-center gap-3 border-b p-4">
            <h2 className="mr-auto text-base font-semibold">Dossiers</h2>
            <label className="flex items-center gap-2 rounded-lg border px-3 py-1.5 focus-within:ring-2 focus-within:ring-ring">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher..." className="w-36 bg-transparent text-sm outline-none" />
            </label>
            <div className="flex rounded-lg border p-1">
              {filters.map((x) => (
                <button key={x.k} onClick={() => setF(x.k)} className={cn("rounded-md px-2.5 py-1 text-sm", f === x.k ? "bg-secondary font-semibold text-primary" : "text-muted-foreground hover:text-foreground")}>
                  {x.l} <span className="tabular-nums opacity-70">{x.k ? list.filter((a) => a.status === x.k).length : list.length}</span>
                </button>
              ))}
            </div>
          </div>
          {shown.length === 0 && <p className="p-10 text-center text-sm text-muted-foreground">Aucun dossier ne correspond.</p>}
          <ul className="divide-y">
            {shown.map((a) => <Row key={a.id} a={a} />)}
          </ul>
          <p className="border-t px-4 py-3 text-xs text-muted-foreground">
            Indice théorique de faisabilité : rapprochement entre les exigences du dossier et la base de connaissances de votre entreprise. Il éclaire la décision, il ne la remplace pas.
          </p>
        </section>

        <NewAnalysis offreId={offre} onAdd={(a) => setList((l) => [a, ...l])} />
      </div>
    </AppShell>
  );
}

function Row({ a }: { a: Analysis }) {
  const idx = analysisIndex(a);
  const { date, time } = formatDateTime(a.createdAt);
  const body = (
    <div className="grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-3 px-4 py-4 md:grid-cols-[86px_1fr_170px_150px_16px]">
      <div className="hidden text-sm md:block">
        <div className="tabular-nums">{date}</div>
        <div className="text-xs text-muted-foreground">{time}</div>
      </div>
      <div className="min-w-0">
        <div className="line-clamp-2 font-medium leading-snug">{a.title}</div>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span className="rounded bg-secondary px-1.5 py-0.5 font-semibold text-secondary-foreground">{a.type}</span>
          <span>{a.ref}</span>·<span>{a.buyer}</span>·
          <span className={cn("font-medium", daysLeft(a as never) <= 7 && "text-destructive")}>clôture {formatShort(a.deadline)} (J-{daysLeft(a as never)})</span>
        </div>
      </div>
      <div className="col-start-1 md:col-start-auto">
        {a.status === "termine" && <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success"><span className="h-1.5 w-1.5 rounded-full bg-success" />Rapport prêt <span className="font-normal text-muted-foreground">· {a.duration}</span></span>}
        {a.status === "en-cours" && (
          <div className="text-sm">
            <span className="font-medium text-primary">Étape {a.step + 1}/6</span> <span className="text-muted-foreground">{STEPS[a.step]}</span>
            <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${(a.step / 6) * 100}%` }} /></div>
          </div>
        )}
        {a.status === "attente" && <span className="text-sm text-muted-foreground">En attente des pièces du dossier</span>}
      </div>
      <div className="row-start-1 col-start-2 md:row-start-auto md:col-start-auto">
        {idx !== undefined ? (
          <div className="flex items-center gap-3">
            <div className="relative grid place-items-center">
              <ScoreRing value={idx} size={40} stroke={4} />
              <span className="absolute text-xs font-semibold tabular-nums">{idx}</span>
            </div>
            <VerdictBadge index={idx} />
          </div>
        ) : <span className="text-sm text-muted-foreground">—</span>}
      </div>
      <ChevronRight className={cn("hidden h-4 w-4 md:block", a.report ? "text-muted-foreground" : "opacity-0")} />
    </div>
  );
  return (
    <li>
      {a.report ? <Link to="/gonogo/$id" params={{ id: a.id }} className="block hover:bg-muted/40">{body}</Link> : body}
    </li>
  );
}

function NewAnalysis({ offreId, onAdd }: { offreId?: string; onAdd: (a: Analysis) => void }) {
  const from = offers.find((o) => o.id === offreId);
  const [type, setType] = useState<"AO" | "AMI">(from?.type === "AMI" ? "AMI" : "AO");
  const [title, setTitle] = useState(from?.title ?? "");
  const [ref, setRef] = useState(from?.ref ?? "");
  const [buyer, setBuyer] = useState(from?.buyer ?? "");
  const [mode, setMode] = useState<"docs" | "texte">("docs");
  const [files, setFiles] = useState<File[]>([]);
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const ready = title.trim() && (mode === "docs" ? files.length > 0 : text.trim().length > 40);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready) return;
    onAdd({
      id: `local-${Date.now()}`, title, ref: ref || "Sans référence", buyer: buyer || "Acheteur non précisé", type,
      createdAt: new Date().toISOString(), deadline: from?.deadline ?? new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      status: "attente", step: 0, scope: [],
    });
    setSent(true);
    setTitle(""); setRef(""); setBuyer(""); setFiles([]); setText("");
  };

  const field = "w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";
  return (
    <form onSubmit={submit} className="h-fit rounded-2xl border bg-card p-5 lg:sticky lg:top-24">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Nouveau dossier</div>
      <h2 className="mt-1 text-lg font-semibold">Lancer une analyse</h2>
      {from && <p className="mt-2 rounded-lg bg-secondary px-3 py-2 text-xs text-secondary-foreground">Pré-rempli depuis la veille : {from.source}. Ajoutez les pièces récupérées.</p>}

      <div className="mt-4 grid grid-cols-2 rounded-lg bg-muted p-1 text-sm">
        {(["AO", "AMI"] as const).map((t) => (
          <button type="button" key={t} onClick={() => setType(t)} className={cn("rounded-md py-1.5", type === t ? "bg-card font-semibold shadow-sm" : "text-muted-foreground")}>{t === "AO" ? "Appel d'offres" : "AMI"}</button>
        ))}
      </div>

      <label className="mt-4 block text-xs font-semibold text-muted-foreground">Intitulé de l'offre
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={cn(field, "mt-1.5")} placeholder="Ex. Acquisition de matériel informatique" />
      </label>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <label className="block text-xs font-semibold text-muted-foreground">Référence<input value={ref} onChange={(e) => setRef(e.target.value)} className={cn(field, "mt-1.5")} /></label>
        <label className="block text-xs font-semibold text-muted-foreground">Organisme<input value={buyer} onChange={(e) => setBuyer(e.target.value)} className={cn(field, "mt-1.5")} placeholder="Acheteur" /></label>
      </div>

      <div className="mt-4 grid grid-cols-2 rounded-lg bg-muted p-1 text-sm">
        <button type="button" onClick={() => setMode("docs")} className={cn("inline-flex items-center justify-center gap-1.5 rounded-md py-1.5", mode === "docs" ? "bg-card font-semibold shadow-sm" : "text-muted-foreground")}><FileUp className="h-4 w-4" />Documents</button>
        <button type="button" onClick={() => setMode("texte")} className={cn("inline-flex items-center justify-center gap-1.5 rounded-md py-1.5", mode === "texte" ? "bg-card font-semibold shadow-sm" : "text-muted-foreground")}><AlignLeft className="h-4 w-4" />Texte de l'offre</button>
      </div>
      {mode === "docs" ? (
        <label className="mt-3 flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed p-5 text-center hover:bg-muted/40">
          <FileUp className="h-5 w-5 text-primary" />
          <span className="mt-2 text-sm font-semibold">{files.length ? `${files.length} fichier${files.length > 1 ? "s" : ""} sélectionné${files.length > 1 ? "s" : ""}` : "Déposez les pièces du dossier"}</span>
          <span className="mt-1 text-xs text-muted-foreground">{files.length ? files.map((f) => f.name).join(", ") : "DAO, additifs, annexes — PDF, DOCX, XLSX"}</span>
          <input type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx" className="sr-only" onChange={(e) => setFiles([...(e.target.files ?? [])])} />
        </label>
      ) : (
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} className={cn(field, "mt-3 resize-none")} placeholder="Collez le texte de l'avis ou du DAO..." />
      )}

      <button disabled={!ready} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-95 disabled:opacity-40">
        <Play className="h-4 w-4" />Lancer l'analyse
      </button>
      {sent && <p className="mt-3 text-xs text-muted-foreground">Dossier ajouté à la liste en attente. Démonstration : l'agent n'est pas encore branché, aucune analyse n'est réellement lancée et rien n'est enregistré.</p>}
    </form>
  );
}

function Kpi({ icon: Icon, label, value, sub, tone }: { icon: typeof FolderOpen; label: string; value: string; sub: string; tone?: string }) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"><Icon className="h-4 w-4" />{label}</div>
      <div className={cn("mt-2 font-display text-2xl font-semibold tabular-nums", tone)}>{value}</div>
      <div className="mt-0.5 truncate text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}
