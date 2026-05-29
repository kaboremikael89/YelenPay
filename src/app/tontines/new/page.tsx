"use client";

import { useActionState } from "react";
import { createTontine } from "@/app/tontines/actions";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NewTontinePage() {
  const [state, formAction, pending] = useActionState(createTontine, null);

  return (
    <div className="min-h-screen pb-24">
      <AppHeader title="Nouvelle tontine" backHref="/dashboard" />

      <div className="p-4">
        <Card>
          <CardContent className="p-5">
            <form action={formAction} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nom de la tontine *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Ex : Tontine du marché Sandaga"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="amount">Montant par cotisation (FCFA) *</Label>
                <Input
                  id="amount"
                  name="amount"
                  inputMode="numeric"
                  placeholder="25000"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="frequency">Fréquence *</Label>
                <Select id="frequency" name="frequency" defaultValue="monthly">
                  <option value="weekly">Hebdomadaire</option>
                  <option value="biweekly">Bi-mensuel</option>
                  <option value="monthly">Mensuel</option>
                  <option value="quarterly">Trimestriel</option>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="members">Autres membres (un par ligne)</Label>
                <Textarea
                  id="members"
                  name="members"
                  rows={5}
                  placeholder={"Awa Diop\nMoussa Fall\nFatou Ndiaye"}
                />
                <p className="text-xs text-muted">
                  Vous êtes automatiquement ajouté en position 1. L&apos;ordre
                  des lignes définit l&apos;ordre de rotation.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">Description (optionnel)</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={2}
                  placeholder="But de la tontine…"
                />
              </div>

              {state?.error && (
                <p className="text-sm text-danger">{state.error}</p>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={pending}
              >
                {pending ? "Création…" : "Créer la tontine"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
