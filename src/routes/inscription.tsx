import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, Building2, Gauge, ChevronDown,
  FileText, ShieldCheck, Check,
} from "lucide-react";
import { AuthVisual } from "@/components/AuthVisual";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/inscription")({
  head: () => ({
    meta: [
      { title: "Créer un compte — Kaydan Scrapers" },
      { name: "description", content: "Créez votre compte Kaydan Scrapers : informations de votre entreprise et pièces de l'indice opérationnel." },
      { property: "og:title", content: "Créer un compte — Kaydan Scrapers" },
      { property: "og:description", content: "Veillez. Analysez. Décidez. Remportez." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Signup,
});

const SECTORS = [
  "BTP & Construction",
  "Énergie & Mines",
  "Informatique & Télécoms",
  "Transport & Logistique",
  "Santé",
  "Agroalimentaire",
  "Industrie & Manufacture",
  "Conseil & Services",
  "Éducation & Formation",
  "Autre",
];

const SIZES = [
  "1 à 9 personnes",
  "10 à 49 personnes",
  "50 à 249 personnes",
  "250 à 499 personnes",
  "500 personnes et plus",
];

const DOCUMENTS = [
  { key: "experts", label: "CV des experts", hint: "Profils des experts mobilisables" },
  { key: "abe", label: "Attestation de bonne exécution", hint: "Références de marchés réalisés" },
  { key: "partners", label: "ABE / CV partenaires", hint: "Sous-traitants et partenaires" },
] as const;

const field = "h-12 w-full rounded-lg border bg-background text-sm outline-none transition focus:ring-4 focus:ring-primary/15 focus:border-primary";
const fieldOk = "border-input";
const fieldBad = "border-destructive";

function Err({ msg }: { msg?: string }) {
  return msg ? <p className="mt-1.5 text-xs font-medium text-destructive">{msg}</p> : null;
}

function SectionHead({ icon: Icon, title, note }: { icon: typeof Building2; title: string; note: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <h2 className="text-base font-semibold text-navy">{title}</h2>
        <p className="text-xs text-muted-foreground">{note}</p>
      </div>
    </div>
  );
}

function Signup() {
  const [show, setShow] = useState(false);
  const [files, setFiles] = useState<Record<string, string | null>>({ experts: null, abe: null, partners: null });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  function validate(form: FormData) {
    const e: Record<string, string> = {};
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");
    const phone = String(form.get("phone") ?? "").replace(/[\s.\-()]/g, "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) e.email = "Adresse e-mail invalide.";
    if (password.length < 8) e.password = "8 caractères minimum.";
    if (confirm !== password || !confirm) e.confirm = "Les mots de passe ne correspondent pas.";
    if (String(form.get("company") ?? "").trim().length < 2) e.company = "Nom de l'entreprise requis.";
    if (!String(form.get("sector") ?? "")) e.sector = "Sélectionnez un secteur.";
    if (!String(form.get("size") ?? "")) e.size = "Sélectionnez une fourchette.";
    if (String(form.get("city") ?? "").trim().length < 2) e.city = "Ville et pays requis.";
    if (!/^\+?\d{7,15}$/.test(phone)) e.phone = "Numéro de téléphone invalide.";
    return e;
  }

  function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const e = validate(new FormData(ev.currentTarget));
    setErrors(e);
    if (Object.keys(e).length === 0) {
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setDone(false);
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <AuthVisual />

      {/* Form panel */}
      <section className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-lg">
          <div className="mb-10 lg:hidden"><Logo /></div>

          <h1 className="text-3xl font-bold text-navy">Créer un compte</h1>
          <p className="mt-2 text-muted-foreground">
            Renseignez votre entreprise. Les pièces de l'indice opérationnel peuvent être ajoutées plus tard.
          </p>

          {done && (
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-primary/20 bg-secondary p-4">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-brand-orange">
                <Check className="h-4 w-4 text-accent-foreground" strokeWidth={3} />
              </span>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-navy">Formulaire complété.</span>{" "}
                Aucune donnée n'a encore été enregistrée : la création de compte sera activée
                dès que le service d'inscription sera branché.
              </p>
            </div>
          )}

          <form className="mt-8 space-y-8" onSubmit={onSubmit} noValidate>
            {/* Account */}
            <div className="rounded-2xl border bg-card p-6 shadow-card sm:p-8">
              <SectionHead icon={Mail} title="Votre compte" note="Accès à la plateforme" />
              <div className="space-y-5">
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium">Adresse e-mail <span className="text-brand-orange">*</span></label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input id="email" name="email" type="email" required placeholder="nom@entreprise.com"
                      aria-invalid={!!errors.email}
                      className={`${field} pl-10 pr-4 ${errors.email ? fieldBad : fieldOk}`} />
                  </div>
                  <Err msg={errors.email} />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="password" className="mb-2 block text-sm font-medium">Mot de passe <span className="text-brand-orange">*</span></label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input id="password" name="password" type={show ? "text" : "password"} required placeholder="8 caractères minimum"
                        aria-invalid={!!errors.password}
                        className={`${field} pl-10 pr-11 ${errors.password ? fieldBad : fieldOk}`} />
                      <button type="button" onClick={() => setShow(!show)} aria-label="Afficher le mot de passe"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <Err msg={errors.password} />
                  </div>
                  <div>
                    <label htmlFor="confirm" className="mb-2 block text-sm font-medium">Confirmer <span className="text-brand-orange">*</span></label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input id="confirm" name="confirm" type={show ? "text" : "password"} required placeholder="Retapez le mot de passe"
                        aria-invalid={!!errors.confirm}
                        className={`${field} pl-10 pr-4 ${errors.confirm ? fieldBad : fieldOk}`} />
                    </div>
                    <Err msg={errors.confirm} />
                  </div>
                </div>
              </div>
            </div>

            {/* Company attributes */}
            <div className="rounded-2xl border bg-card p-6 shadow-card sm:p-8">
              <SectionHead icon={Building2} title="Informations sur l'entreprise" note="Attributs obligatoires" />
              <div className="space-y-5">
                <div>
                  <label htmlFor="company" className="mb-2 block text-sm font-medium">Nom de l'entreprise <span className="text-brand-orange">*</span></label>
                  <input id="company" name="company" required placeholder="Ex. Bâtiments du Golfe SARL"
                    aria-invalid={!!errors.company}
                    className={`${field} px-4 ${errors.company ? fieldBad : fieldOk}`} />
                  <Err msg={errors.company} />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="sector" className="mb-2 block text-sm font-medium">Secteur <span className="text-brand-orange">*</span></label>
                    <div className="relative">
                      <select id="sector" name="sector" required defaultValue="" aria-invalid={!!errors.sector}
                        className={`${field} appearance-none px-4 pr-10 ${errors.sector ? fieldBad : fieldOk}`}>
                        <option value="" disabled>Sélectionnez…</option>
                        {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                    <Err msg={errors.sector} />
                  </div>
                  <div>
                    <label htmlFor="size" className="mb-2 block text-sm font-medium">Taille (fourchette) <span className="text-brand-orange">*</span></label>
                    <div className="relative">
                      <select id="size" name="size" required defaultValue="" aria-invalid={!!errors.size}
                        className={`${field} appearance-none px-4 pr-10 ${errors.size ? fieldBad : fieldOk}`}>
                        <option value="" disabled>Sélectionnez…</option>
                        {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                    <Err msg={errors.size} />
                  </div>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="city" className="mb-2 block text-sm font-medium">Ville / pays <span className="text-brand-orange">*</span></label>
                    <input id="city" name="city" required placeholder="Abidjan, Côte d'Ivoire"
                      aria-invalid={!!errors.city}
                      className={`${field} px-4 ${errors.city ? fieldBad : fieldOk}`} />
                    <Err msg={errors.city} />
                  </div>
                  <div>
                    <label htmlFor="phone" className="mb-2 block text-sm font-medium">Téléphone <span className="text-brand-orange">*</span></label>
                    <input id="phone" name="phone" type="tel" required placeholder="+225 07 00 00 00"
                      aria-invalid={!!errors.phone}
                      className={`${field} px-4 ${errors.phone ? fieldBad : fieldOk}`} />
                    <Err msg={errors.phone} />
                  </div>
                </div>
              </div>
            </div>

            {/* Operational index attributes */}
            <div className="rounded-2xl border bg-card p-6 shadow-card sm:p-8">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <SectionHead icon={Gauge} title="Indice opérationnel" note="Attributs de l'indice opérationnel" />
                <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-orange/40 bg-brand-orange/10 px-3 py-1 text-xs font-medium text-brand-orange">
                  <ShieldCheck className="h-3.5 w-3.5" /> Ajustable au fur et à mesure
                </span>
              </div>
              <div className="space-y-4">
                {DOCUMENTS.map((d) => (
                  <div key={d.key}>
                    <div className="mb-2 flex items-baseline justify-between gap-3">
                      <span className="text-sm font-medium">{d.label}</span>
                      <span className="text-xs text-muted-foreground">Facultatif</span>
                    </div>
                    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-input bg-background px-4 py-3 transition hover:border-primary/40">
                      <span className="flex min-w-0 items-center gap-3">
                        <FileText className="h-4 w-4 shrink-0 text-primary" />
                        <span className="truncate text-sm text-muted-foreground">
                          {files[d.key] ?? d.hint}
                        </span>
                      </span>
                      <span className="shrink-0 rounded-md border border-primary/20 px-3 py-1 text-xs font-semibold text-primary">
                        Parcourir
                      </span>
                      <input type="file" className="sr-only" accept=".pdf,.doc,.docx,.jpg,.png"
                        onChange={(ev) => setFiles((f) => ({ ...f, [d.key]: ev.currentTarget.files?.[0]?.name ?? null }))} />
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit"
              className="group flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-accent font-display font-semibold text-accent-foreground shadow-orange transition hover:brightness-105">
              Créer mon compte <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Déjà inscrit ?{" "}
            <Link to="/" className="font-semibold text-primary hover:underline">Se connecter</Link>
          </p>
          <p className="mt-10 text-center text-xs text-muted-foreground">© 2026 Kaydan Scrapers. Tous droits réservés.</p>
        </div>
      </section>
    </main>
  );
}
