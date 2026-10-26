import { CheckCircle2, CircleDashed, Loader2 } from "lucide-react";
import { STEPS, verdictFor, verdictMeta, type ReqStatus } from "@/lib/gonogo";
import { cn } from "@/lib/utils";

export function ScoreRing({ value, size = 64, stroke = 6 }: { value: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = verdictFor(value);
  const color = v === "go" ? "var(--success)" : v === "arbitrer" ? "var(--accent-strong)" : "var(--destructive)";
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} />
    </svg>
  );
}

export function VerdictBadge({ index, long = false }: { index: number; long?: boolean }) {
  const m = verdictMeta[verdictFor(index)];
  return <span className={cn("inline-flex rounded-md px-2 py-0.5 text-xs font-semibold", m.cls)}>{long ? m.label : m.short}</span>;
}

export function StatusPill({ status }: { status: ReqStatus }) {
  const map = {
    verifiee: ["Vérifiée", "bg-success/10 text-success"],
    "a-verifier": ["À vérifier", "bg-accent/10 text-accent-strong"],
    "non-trouvee": ["Non trouvée", "bg-muted text-muted-foreground"],
  }[status];
  return <span className={cn("whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-semibold", map[1])}>{map[0]}</span>;
}

export function LotTag({ lot }: { lot?: string | undefined }) {
  if (!lot) return null;
  return <span className="whitespace-nowrap rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">{lot}</span>;
}

export function Pipeline({ step }: { step: number }) {
  return (
    <ol className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
      {STEPS.map((s, i) => {
        const done = i < step;
        const current = i === step;
        return (
          <li key={s} className={cn("flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm", done ? "bg-card" : current ? "border-primary/40 bg-secondary font-semibold text-primary" : "bg-muted/40 text-muted-foreground")}>
            {done ? <CheckCircle2 className="h-4 w-4 shrink-0 text-success" /> : current ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" /> : <CircleDashed className="h-4 w-4 shrink-0" />}
            <span className="truncate">{i + 1}. {s}</span>
          </li>
        );
      })}
    </ol>
  );
}
