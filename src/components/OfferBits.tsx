import { FileCheck2, FileWarning, FileX2, Building2, MapPin, Globe, Calendar, Wallet, ExternalLink, Download, Bookmark, ArrowRight, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { daoLabel, daysLeft, formatShort, type Offer } from "@/lib/offers";
import { cn } from "@/lib/utils";

export function Deadline({ offer }: { offer: Offer }) {
  const d = daysLeft(offer);
  const tone = d <= 2 ? "text-destructive" : d <= 7 ? "text-accent-strong" : "text-foreground";
  return (
    <div className={cn("font-display text-sm font-semibold tabular-nums", tone)}>
      J-{d}
      <span className="ml-1.5 font-sans text-xs font-normal text-muted-foreground">{formatShort(offer.deadline)}</span>
    </div>
  );
}

export function MatchScore({ value, size = "sm" }: { value: number; size?: "sm" | "lg" }) {
  const tone = value >= 80 ? "bg-success" : value >= 65 ? "bg-primary" : "bg-muted-foreground/50";
  const label = value >= 80 ? "Fort" : value >= 65 ? "Moyen" : "Faible";
  return (
    <div className={cn("flex items-center gap-2", size === "lg" && "gap-3")}>
      <div className={cn("h-1.5 overflow-hidden rounded-full bg-muted", size === "lg" ? "w-28" : "w-14")}>
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${value}%` }} />
      </div>
      <span className={cn("tabular-nums font-semibold", size === "lg" ? "text-lg" : "text-sm")}>{value}</span>
      {size === "lg" && <span className="text-sm text-muted-foreground">adéquation {label.toLowerCase()}</span>}
    </div>
  );
}

export function DaoBadge({ status }: { status: Offer["dao"] }) {
  const map = {
    disponible: { icon: FileCheck2, cls: "bg-success/10 text-success" },
    partiel: { icon: FileWarning, cls: "bg-accent/10 text-accent-strong" },
    "a-recuperer": { icon: FileX2, cls: "bg-muted text-muted-foreground" },
  }[status];
  const Icon = map.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium", map.cls)}>
      <Icon className="h-3.5 w-3.5" />
      {daoLabel[status]}
    </span>
  );
}

export function TypeBadge({ type }: { type: Offer["type"] }) {
  return <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">{type}</span>;
}

export function OfferPanel({ offer, onClose }: { offer: Offer | null; onClose: () => void }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  if (!offer) return null;
  const ready = offer.dao === "disponible";
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button aria-label="Fermer" className="absolute inset-0 bg-navy/40" onClick={onClose} />
      <aside className="relative flex h-full w-full max-w-xl flex-col bg-card shadow-card" role="dialog" aria-label={offer.title}>
        <div className="flex items-start gap-4 border-b p-6">
          <div className="flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <TypeBadge type={offer.type} />
              <span className="text-xs text-muted-foreground">{offer.ref ?? "Sans référence"} · {offer.source}</span>
            </div>
            <h2 className="font-display text-lg font-semibold leading-snug">{offer.title}</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted" aria-label="Fermer le détail">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <Info icon={Building2} label="Acheteur" value={offer.buyer} />
            <Info icon={MapPin} label="Pays" value={offer.country} />
            <Info icon={Calendar} label="Clôture" value={`${formatShort(offer.deadline)} · J-${daysLeft(offer)}`} />
            <Info icon={Wallet} label="Budget indicatif" value={offer.budget ?? "Non communiqué"} />
          </div>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Adéquation au profil</h3>
            <MatchScore value={offer.match} size="lg" />
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Résumé</h3>
            <p className="text-sm leading-relaxed">{offer.summary}</p>
            {offer.lots && (
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                {offer.lots.map((l) => <li key={l}>{l}</li>)}
              </ul>
            )}
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Exigences repérées</h3>
            <ul className="space-y-2">
              {offer.requirements.map((r) => (
                <li key={r} className="flex gap-2 text-sm"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />{r}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Dossier d'appel d'offres</h3>
              <DaoBadge status={offer.dao} />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {ready
                ? "Toutes les pièces sont récupérées : le dossier peut partir en analyse Go/NoGo."
                : offer.dao === "partiel"
                  ? "Certaines pièces manquent. Complétez le dossier avant l'analyse pour un verdict fiable."
                  : "Le DAO doit être retiré auprès de l'acheteur avant toute analyse."}
            </p>
            <div className="mt-3 flex gap-2">
              <button className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-muted"><Download className="h-4 w-4" />Pièces</button>
              <button className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-muted"><Globe className="h-4 w-4" />Avis source<ExternalLink className="h-3 w-3" /></button>
            </div>
          </section>
        </div>

        <div className="flex gap-3 border-t p-4">
          <button className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-muted"><Bookmark className="h-4 w-4" />Suivre</button>
          <Link
            to="/gonogo"
            disabled={!ready}
            className={cn(
              "ml-auto inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold",
              ready ? "bg-accent text-accent-foreground shadow-orange hover:opacity-95" : "pointer-events-none bg-muted text-muted-foreground",
            )}
          >
            Transmettre au Go/NoGo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </aside>
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof Building2; label: string; value: string }) {
  return (
    <div className="flex gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-medium">{value}</div>
      </div>
    </div>
  );
}
