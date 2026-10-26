import logoLight from "@/assets/logo-kaydan-light.png";
import logoDark from "@/assets/logo-kaydan-dark.png";

export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <img
      src={inverted ? logoDark : logoLight}
      alt="Kaydan Scrapers"
      className={`w-auto max-w-full self-start ${inverted ? "h-14" : "h-12"}`}
    />
  );
}
