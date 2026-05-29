"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Coins } from "lucide-react";
import { signIn } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signIn, null);

  return (
    <div className="flex min-h-screen flex-col justify-center p-6">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Coins className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold">Connexion</h1>
        <p className="text-sm text-muted">Accédez à vos tontines</p>
      </div>

      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Mot de passe</Label>
          <Input id="password" name="password" type="password" required />
        </div>

        {state?.error && (
          <p className="text-sm text-danger">{state.error}</p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Connexion…" : "Se connecter"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Pas encore de compte ?{" "}
        <Link href="/register" className="font-semibold text-primary">
          Créer un compte
        </Link>
      </p>
    </div>
  );
}
