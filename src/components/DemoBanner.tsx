import { DEMO } from "@/lib/demo";

/** Bandeau affiché uniquement en mode démo (vitrine sans backend). */
export function DemoBanner() {
  if (!DEMO) return null;
  return (
    <div className="bg-accent px-4 py-2 text-center text-xs font-semibold text-accent-foreground">
      🔎 Version démo — données d&apos;exemple, paiements simulés
    </div>
  );
}
