import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function AppHeader({
  title,
  backHref,
}: {
  title: string;
  backHref?: string;
}) {
  return (
    <header className="sticky top-0 z-40 flex items-center gap-3 bg-background/90 px-5 py-4 backdrop-blur">
      {backHref && (
        <Link
          href={backHref}
          aria-label="Retour"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-sm"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
      )}
      <h1 className="text-xl font-bold">{title}</h1>
    </header>
  );
}
