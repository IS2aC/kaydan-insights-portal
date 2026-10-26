import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Search, Building2, BarChart3, Bell } from "lucide-react";
import { AuthVisual } from "@/components/AuthVisual";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Connexion — Kaydan Scrapers" },
      { name: "description", content: "Connectez-vous à Kaydan Scrapers : veille, analyse et opportunités sur les appels d'offres et AMI." },
      { property: "og:title", content: "Connexion — Kaydan Scrapers" },
      { property: "og:description", content: "Veillez. Analysez. Décidez. Remportez." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Login,
});

const features = [
  { icon: Search, label: "Détection automatique" },
  { icon: Building2, label: "Profiling entreprises" },
  { icon: BarChart3, label: "Indice de faisabilité" },
  { icon: Bell, label: "Alertes temps réel" },
];

function Login() {
  const [show, setShow] = useState(false);

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <AuthVisual />

      {/* Form panel */}
      <section className="flex flex-col items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden"><Logo /></div>

          <h1 className="text-3xl font-bold text-navy">Bon retour</h1>
          <p className="mt-2 text-muted-foreground">Connectez-vous pour accéder à vos opportunités du jour.</p>

          <form className="mt-8 space-y-5 rounded-2xl border bg-card p-8 shadow-card" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">Adresse e-mail</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input id="email" type="email" required placeholder="nom@entreprise.com"
                  className="h-12 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15 placeholder:text-muted-foreground" />
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium">Mot de passe</label>
                <a href="#" className="text-sm font-medium text-primary hover:underline">Mot de passe oublié ?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input id="password" type={show ? "text" : "password"} required placeholder="••••••••"
                  className="h-12 w-full rounded-lg border border-input bg-background pl-10 pr-11 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15 placeholder:text-muted-foreground" />
                <button type="button" onClick={() => setShow(!show)} aria-label="Afficher le mot de passe"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" className="h-4 w-4 accent-primary" /> Se souvenir de moi
            </label>
            <button type="submit"
              className="group flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-accent font-display font-semibold text-accent-foreground shadow-orange transition hover:brightness-105">
              Se connecter <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </button>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> ou <span className="h-px flex-1 bg-border" />
            </div>
            <button type="button"
              className="h-12 w-full rounded-lg border-2 border-primary/20 font-display text-sm font-semibold text-primary transition hover:bg-secondary">
              Demander une démo
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Pas encore de compte ?{" "}
            <Link to="/inscription" className="font-semibold text-primary hover:underline">Créer un compte</Link>
          </p>

          <div className="mt-10 grid grid-cols-4 gap-2 text-center">
            {features.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <Icon className="h-5 w-5 text-primary" />
                <span className="text-[11px] leading-tight text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
          <p className="mt-10 text-center text-xs text-muted-foreground">© 2026 Kaydan Scrapers. Tous droits réservés.</p>
        </div>
      </section>
    </main>
  );
}
