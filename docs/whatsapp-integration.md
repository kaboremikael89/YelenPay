# Étude — WhatsApp comme interface de YelenPay

> Objectif : utiliser WhatsApp pour les **invitations**, les **relances de
> cotisation**, les **confirmations de paiement** et, à terme, un **bot
> conversationnel** (consulter sa tontine, payer, recevoir des rappels) — le
> tout sur le canal le plus utilisé au Sénégal.

Ce document compare les options techniques, leurs coûts et contraintes, et
propose une feuille de route par phases. **La phase 1 est déjà implémentée**
dans l'application.

---

## 1. Pourquoi WhatsApp au Sénégal

- Canal de messagerie dominant ; quasi tous les membres d'une tontine l'ont.
- Taux d'ouverture très supérieur au SMS/e-mail.
- Permet l'envoi de liens de paiement (Wave/Orange Money via PayDunya) et de
  rappels là où les gens lisent déjà.

---

## 2. Les niveaux d'intégration

### Niveau 1 — Liens « click-to-chat » `wa.me` ✅ *(implémenté)*

Génère un lien `https://wa.me/<numéro>?text=<message pré-rempli>`. Le
responsable appuie sur le lien → WhatsApp s'ouvre avec le message prêt → il
envoie manuellement.

- **Coût** : gratuit. **Mise en place** : immédiate, aucune vérification.
- **Limite** : envoi manuel (1 par 1), pas de réception automatisée, pas de
  programmation des rappels.
- **Statut** : en place dans `src/lib/whatsapp.ts` (invitations + relances),
  visible dans l'« Espace responsable » de chaque tontine.

> 👉 Idéal pour démarrer et valider l'usage sans aucun coût ni démarche.

### Niveau 2 — WhatsApp Business App + liens

Le responsable utilise l'app **WhatsApp Business** (gratuite) avec réponses
rapides, étiquettes et catalogue. On combine avec les liens du niveau 1.

- **Coût** : gratuit. **Limite** : toujours manuel, ne passe pas à l'échelle.

### Niveau 3 — WhatsApp Business **Cloud API** (Meta) ⭐ *(cible)*

L'API officielle de Meta : envoi/réception **programmatiques**, messages
**template** approuvés, **webhooks** entrants, bot conversationnel.

- **Permet** : relances automatiques planifiées, confirmation de paiement
  envoyée automatiquement, parcours « répondez PAYER pour cotiser », etc.
- **Pré-requis** :
  - Compte **Meta Business** vérifié + **WhatsApp Business Account (WABA)**.
  - Un **numéro de téléphone** dédié (non rattaché à un compte WhatsApp
    classique).
  - **Templates** de messages soumis à approbation (pour initier une
    conversation hors fenêtre de 24 h).
  - **Opt-in** explicite des destinataires (obligation Meta).
- **Coût** (indicatif, à revérifier sur la grille Meta en vigueur) :
  facturation **par message template** selon la catégorie
  (*utility* / *marketing* / *authentication*). Les messages de **service**
  (réponses dans la fenêtre de 24 h après un message du client) sont
  généralement gratuits ou peu coûteux. Les tarifs varient par pays — vérifier
  la grille « Sénégal ».

### Niveau 3-bis — Via un **BSP** (fournisseur tiers)

Plutôt que d'intégrer Meta directement, passer par un **Business Solution
Provider** simplifie l'onboarding, la facturation et l'UI :

- **Twilio**, **360dialog**, **Vonage**, **Wati**, **Infobip**, **MessageBird**…
- **Avantage** : mise en route plus rapide, support, dashboards, parfois
  facturation locale.
- **Inconvénient** : marge ajoutée sur le prix Meta.

### ⚠️ À éviter — bibliothèques non officielles

`whatsapp-web.js`, `Baileys`, etc. automatisent WhatsApp **Web** sans API
officielle. **Contraires aux conditions d'utilisation de WhatsApp** : risque de
**bannissement du numéro** et d'instabilité. À proscrire pour un produit
commercial.

---

## 3. Cas d'usage YelenPay (priorisés)

| Cas d'usage | Niveau requis | Priorité |
|---|---|---|
| Inviter un membre à rejoindre une tontine | 1 (✅) | Haute |
| Relancer un retardataire de cotisation | 1 (✅) → 3 (auto) | Haute |
| Confirmer automatiquement un paiement reçu | 3 | Moyenne |
| Rappel automatique J-2 avant échéance | 3 | Moyenne |
| Bot : « solde », « payer », « mes tontines » | 3 | Basse (V2) |

---

## 4. Architecture cible (Cloud API) pour YelenPay

```
Membre WhatsApp  ⇄  Meta Cloud API  ⇄  YelenPay (Next.js)
                                         ├─ POST /api/whatsapp/webhook  (réception)
                                         ├─ lib/whatsapp-cloud.ts        (envoi via Graph API)
                                         └─ table notifications          (journal des envois)
```

**Variables d'environnement à prévoir** :

```
WHATSAPP_PHONE_NUMBER_ID=""     # ID du numéro WABA
WHATSAPP_BUSINESS_ACCOUNT_ID="" # WABA ID
WHATSAPP_ACCESS_TOKEN=""        # token permanent (System User)
WHATSAPP_VERIFY_TOKEN=""        # vérification du webhook
WHATSAPP_APP_SECRET=""          # signature des webhooks entrants
```

**Envoi (esquisse)** — `POST https://graph.facebook.com/v21.0/{PHONE_NUMBER_ID}/messages` :

```jsonc
{
  "messaging_product": "whatsapp",
  "to": "2217XXXXXXXX",
  "type": "template",
  "template": {
    "name": "relance_cotisation",
    "language": { "code": "fr" },
    "components": [{ "type": "body", "parameters": [
      { "type": "text", "text": "Awa" },
      { "type": "text", "text": "25 000 FCFA" },
      { "type": "text", "text": "Tontine Sandaga" }
    ]}]
  }
}
```

**Réception** — route `app/api/whatsapp/webhook/route.ts` :
- `GET` : échange `hub.challenge` (vérification du webhook).
- `POST` : vérifier la **signature** (`X-Hub-Signature-256` via `WHATSAPP_APP_SECRET`),
  router les messages entrants (ex. « PAYER » → générer un lien PayDunya).

**Modèle de données** : ajouter une table `notifications` (member_id, canal,
type, statut, message_id, envoyé_le) pour journaliser et éviter les doublons.

---

## 5. Conformité (à respecter dès la production)

- **Opt-in obligatoire** : recueillir le consentement du membre avant tout
  message (case à cocher à l'ajout du membre / à l'inscription).
- **Templates approuvés** uniquement pour initier une conversation.
- **Fenêtre de service 24 h** : hors de cette fenêtre, seul un template peut
  être envoyé.
- **Désinscription** : permettre « STOP ».
- **Données personnelles** : numéros de téléphone = données à protéger
  (cohérent avec la loi sénégalaise sur les données personnelles / CDP).

---

## 6. Feuille de route recommandée

1. **Phase 1 (faite)** — Liens `wa.me` pour invitations et relances. Coût nul,
   valide l'usage réel.
2. **Phase 2** — Recueillir l'**opt-in** des membres (champ consentement) et
   structurer les modèles de messages.
3. **Phase 3** — Intégrer la **Cloud API via un BSP** (ex. 360dialog ou Twilio) :
   relances et confirmations **automatiques**. Créer la table `notifications`
   et la route webhook.
4. **Phase 4** — **Bot conversationnel** (consulter, payer, recevoir des
   rappels) directement dans WhatsApp.

**Recommandation** : rester en phase 1 (déjà en place) jusqu'à avoir un volume
de tontines qui justifie l'automatisation, puis passer en phase 3 via un BSP
pour limiter la complexité d'onboarding Meta.
