import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, Building2, CalendarClock, CheckCircle2, ChevronDown, ExternalLink, FileText, Printer, Search, ShieldAlert, Target, Wallet } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { FeasibilityDialog } from "@/components/FeasibilityDialog";
import { LotTag, Pipeline, ScoreRing, StatusPill, VerdictBadge } from "@/components/GoNoGoBits";
import { analyses, computeIndex, formatDateTime, type Analysis, type Report } from "@/lib/gonogo";
import { daysLeft } from "@/lib/offers";
import { cn } from "@/lib/utils";


export const Route = createFileRoute("/gonogo_/$id")({
  loader: ({ params }) => {
    const a = analyses.find((x) => x.id === params.id && x.report);
    if (!a) throw notFound();
    return a;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — Go/NoGo — Kaydan Scrapers` },
          { name: "description", content: `Rapport Go/NoGo : ${loaderData.title} (${loaderData.buyer}).` },
          { property: "og:title", content: `Rapport Go/NoGo — ${loaderData.title}` },
          { property: "og:description", content: "Exigences, éliminatoires, anomalies et indice de faisabilité du dossier." },
          { property: "og:type", content: "article" },
          { name: "twitter:card", content: "summary" },
        ]
      : [{ title: "Rapport indisponible — Kaydan Scrapers" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => (
    <AppShell>
      <h1 className="font-display text-2xl font-semibold">Rapport introuvable</h1>
      <Link to="/gonogo" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">Retour aux dossiers</Link>
    </AppShell>
  ),
  component: ReportPage,
});

const tabs = ["Synthèse", "Éliminatoires", "Exigences", "Anomalies", "Pièces"] as const;
type Tab = (typeof tabs)[number];

function ReportPage() {
  const a = Route.useLoaderData() as Analysis;
  const r = a.report!;
  const idx = computeIndex(r.levers);
  const [tab, setTab] = useState<Tab>("Synthèse");
  const [dialog, setDialog] = useState(false);
  const { date, time } = formatDateTime(a.createdAt);
  const left = daysLeft(a as never);
  const counts: Partial<Record<Tab, number>> = { Éliminatoires: r.counts.elim, Exigences: r.counts.reqs, Anomalies: r.counts.anomalies, Pièces: r.files.length };

  return (
    <AppShell>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Link to="/gonogo" className="inline-flex items-center gap-1.5 font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Dossiers Go/NoGo</Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-muted-foreground">Rapport #{r.id} · {date} {time} · {r.model}</span>
        <button onClick={() => window.print()} className="ml-auto inline-flex items-center gap-1.5 rounded-lg border bg-card px-3 py-1.5 font-medium hover:bg-muted"><Printer className="h-4 w-4" />Imprimer</button>
      </div>

      <section className="mt-4 rounded-2xl border bg-card p-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-md bg-secondary px-2 py-1 text-primary">{a.type === "AO" ? "Appel d'offres" : "Appel à manifestation d'intérêt"}</span>
              <span className="rounded-md bg-muted px-2 py-1 text-muted-foreground">{a.ref}</span>
              <span className="rounded-md bg-muted px-2 py-1 text-muted-foreground">{r.lots.length} lots</span>
            </div>
            <h1 className="mt-3 font-display text-2xl font-semibold leading-tight md:text-3xl">{a.title}</h1>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
              <Fact icon={Building2} label="Acheteur" value={a.buyer} />
              <Fact icon={CalendarClock} label="Dépôt" value={`${r.keyInfo[0].items[0].value} · J-${left}`} tone={left <= 7 ? "text-destructive" : undefined} />
              <Fact icon={Wallet} label="Financement" value={r.keyInfo.find((k) => k.label === "Source de financement")?.items[0].value ?? "—"} />
            </dl>
          </div>
          <button onClick={() => setDialog(true)} className="group flex items-center gap-4 rounded-xl border bg-background p-4 text-left hover:border-primary/40">
            <div className="relative grid place-items-center"><ScoreRing value={idx} size={84} stroke={8} /><span className="absolute font-display text-2xl font-semibold">{idx}</span></div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Indice de faisabilité</div>
              <div className="mt-1"><VerdictBadge index={idx} long /></div>
              <div className="mt-2 text-sm font-semibold text-primary group-hover:underline">Comprendre l'indice</div>
            </div>
          </button>
        </div>
        <div className="mt-6"><Pipeline step={a.step} /></div>
      </section>

      <div className="sticky top-16 z-20 -mx-6 mt-6 border-b bg-background/95 px-6 backdrop-blur">
        <nav className="flex gap-1 overflow-x-auto">
          {tabs.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={cn("whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium", tab === t ? "border-accent text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>
              {t}{counts[t] !== undefined && <span className="ml-1.5 rounded bg-muted px-1.5 py-0.5 text-xs tabular-nums">{counts[t]}</span>}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6">
        {tab === "Synthèse" && <Synthesis a={a} r={r} goTo={setTab} />}
        {tab === "Éliminatoires" && <Elim r={r} />}
        {tab === "Exigences" && <Reqs r={r} />}
        {tab === "Anomalies" && <Anomalies r={r} />}
        {tab === "Pièces" && <Files r={r} />}
      </div>

      <FeasibilityDialog report={r} open={dialog} onOpenChange={setDialog} />
    </AppShell>
  );
}

function Fact({ icon: Icon, label, value, tone }: { icon: typeof Building2; label: string; value: string; tone?: string }) {
  return (
    <div className="flex gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div><dt className="text-xs text-muted-foreground">{label}</dt><dd className={cn("font-medium", tone)}>{value}</dd></div>
    </div>
  );
}

function Card({ title, sub, children, right }: { title: string; sub?: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <section className="rounded-2xl border bg-card p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div><h2 className="text-base font-semibold">{title}</h2>{sub && <p className="mt-0.5 text-sm text-muted-foreground">{sub}</p>}</div>
        {right}
      </div>
      {children}
    </section>
  );
}

function Synthesis({ a, r, goTo }: { a: Analysis; r: Report; goTo: (t: Tab) => void }) {
  const [decision, setDecision] = useState<"" | "go" | "nogo" | "revoir">("");
  const expired = r.docs.filter((d) => !d.ok);
  const visit = r.keyInfo.find((k) => k.label.startsWith("Visite"));
  const actions = [
    ...r.critical.map((c) => ({ tone: "destructive", text: `Demander une clarification à l'acheteur : ${c.text}`, meta: `p. ${c.page}` })),
    ...expired.map((d) => ({ tone: "destructive", text: `Renouveler la pièce : ${d.name} (expirée le ${d.until})`, meta: "administratif" })),
    { tone: "accent", text: `Confirmer ${r.counts.toCheck} exigences marquées « à vérifier », dont ${r.elim.filter((e) => e.status === "a-verifier").length} éliminatoires`, meta: "relecture" },
    ...(visit?.items[0] ? [{ tone: "accent", text: `Participer à la réunion préparatoire du ${visit.items[0].value}`, meta: visit.items[0].ref }] : []),
  ];
  const decisions = [
    { k: "go", l: "Go — on soumet", cls: "border-success bg-success/10 text-success" },
    { k: "revoir", l: "À revoir", cls: "border-accent bg-accent/10 text-accent-strong" },
    { k: "nogo", l: "NoGo", cls: "border-destructive bg-destructive/10 text-destructive" },
  ] as const;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <Card title="Avant de soumettre" sub="Ce que l'équipe BID doit traiter, du plus urgent au moins urgent.">
          <ol className="space-y-2">
            {actions.map((x, i) => (
              <li key={x.text} className="flex items-start gap-3 rounded-lg border p-3 text-sm">
                <span className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-semibold", x.tone === "destructive" ? "bg-destructive/10 text-destructive" : "bg-accent/10 text-accent-strong")}>{i + 1}</span>
                <span className="flex-1">{x.text}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{x.meta}</span>
              </li>
            ))}
          </ol>
        </Card>

        <Card title="Informations clés du marché" sub="Chaque valeur renvoie à la page du dossier où elle figure." right={<span className="text-xs text-muted-foreground">{r.keyInfo.filter((k) => k.items.length).length}/{r.keyInfo.length} renseignées</span>}>
          <dl className="grid gap-x-6 sm:grid-cols-2">
            {r.keyInfo.map((k) => (
              <div key={k.label} className="border-b py-3 last:border-b-0">
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{k.label}</dt>
                {k.items.length === 0 ? <dd className="mt-1 text-sm text-muted-foreground">Non mentionné dans le dossier</dd> : k.items.map((it) => (
                  <dd key={it.ref + it.value} className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                    <LotTag lot={it.lot} />
                    <span className="font-semibold">{it.value}</span>
                    {it.check && <span className="rounded bg-accent/10 px-1.5 text-[11px] font-semibold text-accent-strong">à vérifier</span>}
                    <span className="text-xs text-muted-foreground">{it.ref} · p. {it.page}</span>
                  </dd>
                ))}
                {k.more ? <dd className="mt-1 text-xs text-muted-foreground">+ {k.more} autre mention dans les exigences</dd> : null}
              </div>
            ))}
          </dl>
        </Card>

        <Card title="Pièges éliminatoires à neutraliser" sub="Tout manquement entraîne le rejet de l'offre." right={<button onClick={() => goTo("Éliminatoires")} className="text-sm font-semibold text-primary hover:underline">Voir les {r.counts.elim}</button>}>
          <ul className="divide-y">
            {r.elim.slice(2, 8).map((e) => (
              <li key={e.ref} className="flex items-center gap-3 py-2.5 text-sm">
                <ShieldAlert className="h-4 w-4 shrink-0 text-destructive" />
                <span className="flex-1">{e.title} : <span className="font-semibold">{e.value}</span></span>
                <LotTag lot={e.lot} /><StatusPill status={e.status} />
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <aside className="space-y-6">
        <section className="rounded-2xl border bg-card p-5">
          <h2 className="text-base font-semibold">Votre décision</h2>
          <p className="mt-1 text-sm text-muted-foreground">L'indice éclaire, l'équipe BID tranche.</p>
          <div className="mt-4 grid gap-2">
            {decisions.map((d) => (
              <button key={d.k} onClick={() => setDecision(d.k)} className={cn("rounded-lg border px-3 py-2.5 text-left text-sm font-semibold", decision === d.k ? d.cls : "hover:bg-muted")}>{d.l}</button>
            ))}
          </div>
          {decision && <p className="mt-3 text-xs text-muted-foreground">Choix affiché pour cette session seulement : il n'est pas encore enregistré.</p>}
        </section>

        <section className="rounded-2xl border bg-card p-5">
          <h2 className="text-base font-semibold">Le dossier en chiffres</h2>
          <dl className="mt-3 grid grid-cols-2 gap-3">
            <Stat label="Exigences" value={r.counts.reqs} sub={`${r.counts.verified} vérifiées`} onClick={() => goTo("Exigences")} />
            <Stat label="Éliminatoires" value={r.counts.elim} tone="text-destructive" sub="rejet direct" onClick={() => goTo("Éliminatoires")} />
            <Stat label="Obligatoires" value={r.counts.mandatory} tone="text-primary" sub="impératives" />
            <Stat label="Anomalies" value={r.counts.anomalies} tone="text-accent-strong" sub={`${r.counts.attention} critiques`} onClick={() => goTo("Anomalies")} />
          </dl>
          <p className="mt-3 text-xs text-muted-foreground">Citations vérifiées : {r.counts.citations[0]} / {r.counts.citations[1]} · {r.pages} pages lues</p>
        </section>

        <section className="rounded-2xl border bg-card p-5">
          <h2 className="text-base font-semibold">Périmètre du dossier</h2>
          <ul className="mt-3 space-y-2">
            {r.scope.map((s) => (
              <li key={s.label} className="text-sm">
                <div className="flex justify-between"><span>{s.label}</span><span className="tabular-nums text-muted-foreground">{s.count}</span></div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted"><div className={cn("h-full rounded-full", a.scope.includes(s.label) ? "bg-primary" : "bg-muted-foreground/40")} style={{ width: `${(s.count / r.scope[0].count) * 100}%` }} /></div>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">En bleu : vos domaines de spécialité.</p>
        </section>

        <section className="rounded-2xl border bg-secondary p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary"><Target className="h-4 w-4" />À valoriser dans l'offre technique</div>
          <p className="mt-2 text-sm leading-relaxed text-secondary-foreground">{r.strengths}</p>
        </section>
      </aside>
    </div>
  );
}

function Stat({ label, value, sub, tone, onClick }: { label: string; value: number; sub: string; tone?: string; onClick?: () => void }) {
  const C = onClick ? "button" : "div";
  return (
    <C onClick={onClick} className={cn("rounded-lg bg-muted/60 p-3 text-left", onClick && "hover:bg-muted")}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn("font-display text-xl font-semibold tabular-nums", tone)}>{value}</div>
      <div className="text-xs text-muted-foreground">{sub}</div>
    </C>
  );
}

function Seg<T extends string>({ value, onChange, items }: { value: T; onChange: (v: T) => void; items: { k: T; l: string }[] }) {
  return (
    <div className="flex flex-wrap rounded-lg border p-1">
      {items.map((i) => <button key={i.k} onClick={() => onChange(i.k)} className={cn("rounded-md px-2.5 py-1 text-sm", value === i.k ? "bg-secondary font-semibold text-primary" : "text-muted-foreground hover:text-foreground")}>{i.l}</button>)}
    </div>
  );
}

function Elim({ r }: { r: Report }) {
  const [lot, setLot] = useState("all");
  const lots = ["Tous", "Lot 1", "Lot 2"];
  const list = r.elim.filter((e) => lot === "all" || e.lot === lot);
  return (
    <Card title="Critères éliminatoires" sub="Tout manquement entraîne l'élimination de l'offre, sans évaluation financière."
      right={<Seg value={lot} onChange={setLot} items={[{ k: "all", l: `Tous (${r.elim.length})` }, ...lots.map((l) => ({ k: l, l: `${l === "Tous" ? "Communs" : l} (${r.elim.filter((e) => e.lot === l).length})` }))]} />}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr className="border-b"><th className="py-2 pr-4">Réf.</th><th className="py-2 pr-4">Exigence</th><th className="py-2 pr-4">Lot</th><th className="py-2 pr-4">Seuil exigé</th><th className="py-2 pr-4">Source</th><th className="py-2">Statut</th></tr>
          </thead>
          <tbody className="divide-y">
            {list.map((e) => (
              <tr key={e.ref} className="align-top">
                <td className="py-3 pr-4 font-mono text-xs text-destructive">{e.ref}</td>
                <td className="py-3 pr-4"><div className="font-medium">{e.title}</div><div className="text-muted-foreground">{e.desc}</div></td>
                <td className="py-3 pr-4"><LotTag lot={e.lot} /></td>
                <td className="whitespace-nowrap py-3 pr-4 font-semibold">{e.value}</td>
                <td className="whitespace-nowrap py-3 pr-4 text-muted-foreground"><span className="inline-flex items-center gap-1"><FileText className="h-3.5 w-3.5" />p. {e.page}</span></td>
                <td className="py-3"><StatusPill status={e.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Extrait de démonstration : {r.elim.length} critères affichés sur {r.counts.elim}.</p>
    </Card>
  );
}

function Reqs({ r }: { r: Report }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [st, setSt] = useState("all");
  const [open, setOpen] = useState<string | null>(null);
  const cats = [...new Set(r.reqs.map((x) => x.cat))];
  const list = useMemo(() => r.reqs.filter((x) =>
    (cat === "all" || x.cat === cat) &&
    (st === "all" || (st === "elim" ? x.elim : x.status === st)) &&
    (!q || (x.title + x.value + x.ref).toLowerCase().includes(q.toLowerCase()))), [r.reqs, q, cat, st]);
  return (
    <Card title="Toutes les exigences extraites" sub="Énoncé, valeur, preuve citée et page du dossier."
      right={<label className="flex items-center gap-2 rounded-lg border px-3 py-1.5"><Search className="h-4 w-4 text-muted-foreground" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher une exigence" className="w-44 bg-transparent text-sm outline-none" /></label>}>
      <div className="mb-4 flex flex-wrap gap-3">
        <label className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm"><span className="text-muted-foreground">Catégorie :</span>
          <select value={cat} onChange={(e) => setCat(e.target.value)} className="bg-transparent font-medium outline-none"><option value="all">toutes</option>{cats.map((c) => <option key={c}>{c}</option>)}</select>
        </label>
        <Seg value={st} onChange={setSt} items={[{ k: "all", l: "Tous statuts" }, { k: "a-verifier", l: "À vérifier" }, { k: "elim", l: "Éliminatoires" }, { k: "non-trouvee", l: "Non trouvées" }]} />
      </div>
      <ul className="divide-y rounded-xl border">
        {list.map((x) => (
          <li key={x.ref}>
            <button onClick={() => setOpen(open === x.ref ? null : x.ref)} className="grid w-full grid-cols-[64px_1fr_auto] items-center gap-4 px-4 py-3 text-left hover:bg-muted/40 md:grid-cols-[64px_1fr_60px_220px_100px_16px]">
              <span className="font-mono text-xs text-primary">{x.ref}</span>
              <span className="min-w-0"><span className="block font-medium">{x.title}</span><span className="text-xs text-muted-foreground">{x.cat} · {x.sub}{x.elim && <span className="font-semibold text-destructive"> · éliminatoire</span>}</span></span>
              <span className="hidden md:block"><LotTag lot={x.lot} /></span>
              <span className="hidden truncate text-sm font-semibold md:block">{x.value}</span>
              <StatusPill status={x.status} />
              <ChevronDown className={cn("hidden h-4 w-4 text-muted-foreground md:block", open === x.ref && "rotate-180")} />
            </button>
            {open === x.ref && (
              <div className="border-t bg-muted/30 px-4 py-3 text-sm md:pl-[96px]">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Extrait cité · p. {x.page}</div>
                <blockquote className="mt-1 border-l-2 border-primary pl-3 italic">{x.excerpt}</blockquote>
              </div>
            )}
          </li>
        ))}
        {list.length === 0 && <li className="p-8 text-center text-sm text-muted-foreground">Aucune exigence ne correspond.</li>}
      </ul>
      <p className="mt-3 text-xs text-muted-foreground">Extrait de démonstration : {r.reqs.length} exigences affichées sur {r.counts.reqs}.</p>
    </Card>
  );
}

function Anomalies({ r }: { r: Report }) {
  const types = [...new Set(r.anomalies.map((x) => x.type))];
  const [t, setT] = useState("all");
  const list = r.anomalies.filter((x) => t === "all" || x.type === t);
  const severe = (type: string) => type.startsWith("Incohérence");
  return (
    <Card title="Incohérences et anomalies relevées" sub="Signalées par le vérificateur automatique, sans revue humaine : à relire avant de s'appuyer sur ces valeurs.">
      <div className="mb-4"><Seg value={t} onChange={setT} items={[{ k: "all", l: `Toutes (${r.anomalies.length})` }, ...types.map((x) => ({ k: x, l: `${x} (${r.anomalies.filter((a) => a.type === x).length})` }))]} /></div>
      <ul className="space-y-3">
        {list.map((x, i) => (
          <li key={i} className={cn("rounded-xl border p-4", severe(x.type) && "border-destructive/30 bg-destructive/5")}>
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn("inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold", severe(x.type) ? "bg-destructive/10 text-destructive" : "bg-accent/10 text-accent-strong")}>
                {severe(x.type) ? <AlertTriangle className="h-3.5 w-3.5" /> : null}{x.type}
              </span>
              <span className="text-sm text-muted-foreground">{x.ref && <span className="font-mono text-xs">{x.ref} · </span>}{x.reqTitle}</span>
              <span className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-primary">Page {x.page}<ExternalLink className="h-3.5 w-3.5" /></span>
            </div>
            <p className="mt-2 text-sm font-medium">{x.constat}</p>
            {x.excerpt && <blockquote className="mt-1.5 border-l-2 pl-3 text-sm italic text-muted-foreground">{x.excerpt}</blockquote>}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted-foreground">Extrait de démonstration : {r.anomalies.length} anomalies affichées sur {r.counts.anomalies}.</p>
    </Card>
  );
}

function Files({ r }: { r: Report }) {
  return (
    <Card title="Pièces analysées et intégrité" sub="Fichiers du dossier, empreinte SHA-256 et qualité de lecture." right={<span className="rounded-md bg-success/10 px-2 py-1 text-xs font-semibold text-success">Lecture 100 % lisible</span>}>
      <ul className="space-y-3">
        {r.files.map((f) => (
          <li key={f.name} className="flex flex-wrap items-center gap-4 rounded-xl border p-4">
            <FileText className="h-8 w-8 text-primary" />
            <div className="min-w-0 flex-1">
              <div className="font-medium">{f.name}</div>
              <div className="text-xs text-muted-foreground">{f.size} · {f.pages} pages · texte natif · SHA-256 {f.sha}</div>
            </div>
            <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-semibold">{f.kind}</span>
            <span className="inline-flex items-center gap-1 text-sm text-success"><CheckCircle2 className="h-4 w-4" />{f.errors} erreur</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
