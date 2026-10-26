import { useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, TrendingDown, TrendingUp, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { ScoreRing, VerdictBadge } from "@/components/GoNoGoBits";
import { computeIndex, verdictFor, verdictMeta, type Lever, type Match, type Report } from "@/lib/gonogo";
import { cn } from "@/lib/utils";

function Radar({ levers }: { levers: Lever[] }) {
  const c = 130, R = 92;
  const pts = levers.map((l, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 2;
    return { l, a, x: c + Math.cos(a) * R * l.score, y: c + Math.sin(a) * R * l.score, lx: c + Math.cos(a) * (R + 26), ly: c + Math.sin(a) * (R + 22) };
  });
  const ring = (k: number) => levers.map((_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / 2; return `${c + Math.cos(a) * R * k},${c + Math.sin(a) * R * k}`; }).join(" ");
  return (
    <svg viewBox="-40 0 340 260" className="mx-auto w-full max-w-[300px]" role="img" aria-label="Profil des quatre leviers">
      {[0.25, 0.5, 0.75, 1].map((k) => <polygon key={k} points={ring(k)} fill="none" stroke="var(--border)" strokeWidth={1} />)}
      <polygon points={pts.map((p) => `${p.x},${p.y}`).join(" ")} fill="color-mix(in oklab, var(--primary) 15%, transparent)" stroke="var(--primary)" strokeWidth={2} />
      {pts.map((p) => <circle key={p.l.code} cx={p.x} cy={p.y} r={4} fill="var(--primary)" />)}
      {pts.map((p) => (
        <text key={p.l.code + "t"} x={p.lx} y={p.ly} textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-[11px] font-semibold">
          {p.l.code} · {Math.round(p.l.score * 100)}
        </text>
      ))}
    </svg>
  );
}

function MatchRow({ m, good }: { m: Match; good: boolean }) {
  return (
    <li className="py-2">
      <div className="flex items-center gap-2 text-sm">
        <span className="font-mono text-xs text-muted-foreground">{m.ref}</span>
        <span className="min-w-0 flex-1 truncate font-medium">{m.title}</span>
        {m.elim && <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-[11px] font-semibold text-destructive">Éliminatoire</span>}
        <span className={cn("w-8 text-right font-semibold tabular-nums", good ? "text-success" : "text-destructive")}>{m.score}</span>
      </div>
      <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted"><div className={cn("h-full rounded-full", good ? "bg-success" : "bg-destructive")} style={{ width: `${m.score}%` }} /></div>
      <div className="mt-1 flex justify-between gap-3 text-xs text-muted-foreground">
        <span className="truncate">Rapproché de : {m.source}</span><span className="shrink-0 tabular-nums">similarité {m.sim.toFixed(2).replace(".", ",")}</span>
      </div>
    </li>
  );
}

function LeverCard({ l, report, open, onToggle }: { l: Lever; report: Report; open: boolean; onToggle: () => void }) {
  const pct = Math.round(l.score * 100);
  return (
    <div className="rounded-xl border bg-card">
      <button onClick={onToggle} className="flex w-full items-center gap-4 p-4 text-left" aria-expanded={open}>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary text-sm font-semibold text-primary">{l.code}</span>
        <div className="min-w-0 flex-1">
          <div className="font-semibold">{l.name}</div>
          <div className="text-xs text-muted-foreground">Poids {l.weight} · {l.reqs} exigences · {l.sheets} fiches du profil</div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} /></div>
        </div>
        <div className="text-right">
          <div className="font-display text-2xl font-semibold tabular-nums">{pct}<span className="text-xs font-normal text-muted-foreground">/100</span></div>
          <div className="text-xs text-muted-foreground tabular-nums">apport {(l.weight * l.score).toFixed(2).replace(".", ",")} pt</div>
        </div>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="space-y-4 border-t p-4">
          <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground"><span className="font-semibold text-foreground">Calcul : </span>{l.code} = {l.formula}</p>
          <dl className="space-y-1.5 text-sm">
            {l.measures.map((m) => (
              <div key={m.label} className="flex gap-3"><dt className="flex-1">{m.label}</dt><dd className="font-mono font-semibold">{m.value}</dd><dd className="w-48 text-xs text-muted-foreground">{m.note}</dd></div>
            ))}
          </dl>
          {l.code === "S3" && (
            <div className="rounded-lg border p-3 text-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Avis du modèle · {String(report.llm.score).replace(".", ",")}</div>
              <p className="mt-1.5 leading-relaxed">{report.llm.text}</p>
              <ul className="mt-2 space-y-1">
                {report.llm.pros.map((p) => <li key={p} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />{p}</li>)}
                {report.llm.cons.map((p) => <li key={p} className="flex gap-2"><XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />{p}</li>)}
              </ul>
            </div>
          )}
          {l.code === "S4" && (
            <div className="rounded-lg border p-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pièces valides à la date limite · {report.docs.filter((d) => d.ok).length}/{report.docs.length}</div>
              <ul className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
                {report.docs.map((d) => (
                  <li key={d.name} className={cn("flex gap-2", !d.ok && "font-medium text-destructive")}>
                    {d.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0" />}
                    <span>{d.name}{d.until && <span className="text-xs font-normal text-muted-foreground"> · {d.ok ? "jusqu'au" : "expirée le"} {d.until}</span>}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <div><div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-success"><TrendingUp className="h-4 w-4" />Ce qui favorise</div><ul className="divide-y">{l.favor.map((m) => <MatchRow key={m.ref} m={m} good />)}</ul></div>
            <div><div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-destructive"><TrendingDown className="h-4 w-4" />Ce qui pénalise</div><ul className="divide-y">{l.penal.map((m) => <MatchRow key={m.ref} m={m} good={false} />)}</ul></div>
          </div>
        </div>
      )}
    </div>
  );
}

export function FeasibilityDialog({ report, open, onOpenChange }: { report: Report; open: boolean; onOpenChange: (v: boolean) => void }) {
  const idx = computeIndex(report.levers);
  const v = verdictFor(idx);
  const [openLever, setOpenLever] = useState<string | null>(report.levers.slice().sort((a, b) => a.score - b.score)[0]?.code ?? null);
  const weights = report.levers.reduce((a, l) => a + l.weight, 0);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto p-0">
        <div className="border-b p-6">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Détail du calcul · méthode indice-1.0 · profil de démonstration</div>
          <DialogTitle className="mt-1 font-display text-2xl">Indice théorique de faisabilité</DialogTitle>
          <DialogDescription>Dans quelle mesure votre entreprise, telle que décrite dans son profil, répond aux exigences de ce dossier.</DialogDescription>
        </div>
        <div className="space-y-6 p-6">
          <div className="grid gap-6 md:grid-cols-[300px_1fr]">
            <div className="rounded-xl border p-3"><Radar levers={report.levers} /></div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative grid place-items-center"><ScoreRing value={idx} size={84} stroke={8} /><span className="absolute font-display text-2xl font-semibold">{idx}</span></div>
                <div>
                  <VerdictBadge index={idx} long />
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {v === "go" ? "Le profil couvre bien le dossier." : v === "arbitrer" ? "Le profil couvre partiellement le dossier : la décision dépend des points de vigilance ci-dessous." : "Le profil couvre mal le dossier."}
                  </p>
                </div>
              </div>
              <div className="rounded-xl bg-muted p-4 text-sm">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Comment le chiffre est obtenu</div>
                <p className="mt-1.5">Chaque levier est noté sur 100, puis pondéré selon son poids dans la décision.</p>
                <div className="mt-3 flex flex-wrap items-center gap-1.5 font-mono text-xs">
                  {report.levers.map((l, i) => (
                    <span key={l.code} className="flex items-center gap-1.5">
                      {i > 0 && <span>+</span>}
                      <span className="rounded bg-card px-1.5 py-1">{l.weight} × {Math.round(l.score * 100)}</span>
                    </span>
                  ))}
                  <span>÷ {weights} =</span><span className="rounded bg-primary px-1.5 py-1 font-semibold text-primary-foreground">{idx}</span>
                </div>
                <div className="mt-3 flex gap-3 text-xs text-muted-foreground">
                  <span>≥ 70 : {verdictMeta.go.label}</span>·<span>50-69 : {verdictMeta.arbitrer.label}</span>·<span>&lt; 50 : {verdictMeta.nogo.label}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-accent/40 bg-accent/5 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-accent-strong"><AlertTriangle className="h-4 w-4" />Ce qui peut faire basculer la décision ({report.vigilance.length})</div>
            <ul className="mt-2 space-y-1 text-sm">
              {report.vigilance.map((x) => <li key={x.text} className="flex gap-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />{x.ref && <span className="font-mono text-xs text-muted-foreground">{x.ref}</span>}{x.text}</li>)}
            </ul>
          </div>

          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Les quatre leviers — cliquez pour voir les exigences qui comptent</div>
            <div className="space-y-2">
              {report.levers.map((l) => <LeverCard key={l.code} l={l} report={report} open={openLever === l.code} onToggle={() => setOpenLever(openLever === l.code ? null : l.code)} />)}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
