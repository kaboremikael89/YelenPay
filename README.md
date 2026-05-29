# YelenPay 🇸🇳

**Tontines digitales du Sénégal** — créez et gérez vos tontines (rotations
d'épargne), suivez les cotisations et encaissez via mobile money (Wave, Orange
Money, Free Money) grâce à **PayDunya**.

Réécriture complète à partir du prototype *tontine-wa-connect* (Lovable), sur
une nouvelle base technique adaptée à la commercialisation.

## Stack

- **Next.js 16** (App Router, Server Actions) + **React 19** + **TypeScript**
- **Tailwind CSS v4** — thème aux couleurs du Sénégal (vert / or)
- **Supabase** — Auth + Postgres + Row Level Security
- **PayDunya** — agrégateur de paiement mobile money ouest-africain
- Devise : **XOF (FCFA)**

## Fonctionnalités

- Inscription / connexion (Supabase Auth)
- Création de tontines (montant, fréquence, membres, ordre de rotation)
- Tableau de bord des tontines
- Suivi par tour : cagnotte, bénéficiaire, état des cotisations
- Paiement d'une cotisation via PayDunya (Wave / Orange Money / Free Money)
- Confirmation automatique des paiements via webhook (IPN) PayDunya
- Passage au tour suivant / clôture (réservé au créateur)

## Démarrage

1. **Installer les dépendances**
   ```bash
   npm install
   ```

2. **Configurer l'environnement** — copiez `.env.example` vers `.env.local` et
   renseignez vos clés :
   ```bash
   cp .env.example .env.local
   ```
   - Créez un projet sur [supabase.com](https://supabase.com) → récupérez
     `URL`, `anon key` et `service_role key`.
   - Créez un compte marchand sur [paydunya.com](https://paydunya.com) →
     récupérez les clés (master / private / public / token).

3. **Créer le schéma de base de données** — dans l'éditeur SQL de Supabase,
   exécutez le contenu de [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).

4. **Lancer en développement**
   ```bash
   npm run dev
   ```
   Ouvrez http://localhost:3000

## Configuration du webhook PayDunya

L'URL de callback est `${NEXT_PUBLIC_APP_URL}/api/paydunya/webhook`.
En développement local, exposez votre serveur (ex. `ngrok http 3000`) et
renseignez l'URL publique dans `NEXT_PUBLIC_APP_URL`.

## Structure

```
src/
  app/
    page.tsx               # Landing
    login/ register/       # Authentification
    auth/actions.ts        # Server actions auth
    dashboard/             # Tableau de bord
    tontines/
      new/                 # Création
      [id]/                # Détail d'une tontine
      actions.ts           # Création / paiement / tour suivant
    api/paydunya/webhook/  # IPN PayDunya
    profile/               # Profil
  components/              # UI (button, card, nav…)
  lib/
    supabase/              # Clients (browser / server / admin / middleware)
    paydunya.ts            # Intégration PayDunya
    tontine.ts             # Logique métier (rotation, tours)
supabase/migrations/       # Schéma SQL + RLS
```

## Notes de sécurité

- Ne commitez jamais `.env.local`.
- La `service_role key` n'est utilisée que côté serveur (webhook).
- Les accès aux données sont protégés par Row Level Security (RLS).
- Le webhook revérifie chaque paiement auprès de PayDunya avant de le valider.
