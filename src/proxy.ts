import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Toutes les routes sauf les fichiers statiques et l'API webhook.
     */
    "/((?!_next/static|_next/image|favicon.ico|api/paydunya|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
