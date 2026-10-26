import { Check } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { Logo } from "@/components/Logo";

const claims = ["Plus rapide", "Plus pertinent", "Plus de succès"];

export function AuthVisual() {
  return (
    <section className="sticky top-0 hidden h-screen overflow-hidden lg:block">
      <img src={hero} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-navy" />
      <div className="absolute -right-24 top-0 h-full w-48 skew-x-[-12deg] bg-brand-orange/80" />
      <div className="relative flex h-full flex-col justify-between p-12 text-navy-foreground">
        <Logo inverted />
        <div className="max-w-md">
          <span className="mb-6 block h-1 w-12 rounded-full bg-brand-orange" />
          <div className="text-5xl font-bold leading-[1.1]">
            Veillez.<br />Analysez.<br />Décidez.<br />
            <span className="text-brand-orange">Remportez.</span>
          </div>
          <p className="mt-6 text-navy-foreground/80">
            La solution tout-en-un pour détecter, analyser et suivre vos appels d'offres et AMI.
          </p>
          <ul className="mt-8 space-y-3">
            {claims.map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="grid h-6 w-6 place-items-center rounded-md bg-brand-orange">
                  <Check className="h-4 w-4" strokeWidth={3} />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-navy-foreground/80">
          Appels d'offres • Intelligence • Opportunités
        </p>
      </div>
    </section>
  );
}
