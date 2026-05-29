import Link from "next/link";
import { ArrowLeft, Coins } from "lucide-react";

export function AppHeader({
  title,
  backHref,
}: {
  title: string;
  backHref?: string;
}) {
  return (
    <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-primary px-4 py-3 text-primary-foreground">
      {backHref ? (
        <Link href={backHref} aria-label="Retour">
          <ArrowLeft className="h-5 w-5" />
        </Link>
      ) : (
        <Coins className="h-5 w-5" />
      )}
      <h1 className="text-base font-semibold">{title}</h1>
    </header>
  );
}
