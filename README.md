# 🌬️ RESPIRE

**Réseau de Surveillance Participative et Intelligente pour la Résilience Environnementale et Sanitaire**
Presqu'île du Cap-Vert — Dakar, Sénégal

> Projet Transversal DIC 2 — École Supérieure Polytechnique (ESP), UCAD
> Groupe 5 · Sprint 1 · Mai 2026

---

## 📋 Table des matières

- [Présentation du projet](#présentation-du-projet)
- [Architecture générale](#architecture-générale)
- [Environnement Frontend](#environnement-frontend)
- [Installation](#installation)
- [Lancer les projets](#lancer-les-projets)
- [Structure des dossiers](#structure-des-dossiers)
- [Versions utilisées](#versions-utilisées)
- [Membres de l'équipe](#membres-de-léquipe)
- [Organisation du projet](#organisation-du-projet)

---

## 🎯 Présentation du projet

RESPIRE est une plateforme intelligente de surveillance citoyenne de la pollution atmosphérique. Elle combine capteurs IoT, intelligence artificielle et science participative pour :

- **Pilier A** — Calculer la dose de pollution réellement respirée par chaque citoyen (en équivalent cigarettes)
- **Pilier B** — Constituer une cohorte citoyenne pour corréler exposition et symptômes déclarés
- **Pilier C** — Simuler l'impact d'interventions environnementales (végétalisation, régulation trafic)

**Zone couverte :** Bargny · Diamniadio · Sébikotane · Hann (Dakar)

---

## 🏗️ Architecture générale

```
┌─────────────────────────────────────────────────────────────┐
│                     RESPIRE — Stack complet                 │
├───────────────┬─────────────────┬───────────────────────────┤
│  Couche IoT   │  Backend        │  Frontend                 │
│               │                 │                           │
│  ESP32        │  FastAPI        │  React (web)              │
│  PMS5003      │  Python         │  React Native (mobile)    │
│  BME280       │  MySQL          │  Leaflet (carte)          │
│  MQ-7 / MQ135 │  InfluxDB       │  Recharts (graphiques)    │
│  MQTT         │  JWT + TLS      │  Expo Go (test mobile)    │
└───────────────┴─────────────────┴───────────────────────────┘
```

---

## 💻 Environnement Frontend

Ce dépôt contient les deux projets frontend de RESPIRE :

| Projet | Technologie | Rôle |
|--------|-------------|------|
| `respire-web` | React 18 + Leaflet | Dashboard décideurs + Simulateur |
| `respire-mobile` | React Native + Expo | App citoyenne (score, symptômes, profil) |

---

## ⚙️ Installation

### Prérequis

Avant de commencer, assure-toi d'avoir installé :

```bash
node --version    # v20.x.x minimum
npm --version     # 10.x.x minimum
git --version     # 2.x.x minimum
expo --version    # 50.x minimum
```

Si Node.js n'est pas installé → [nodejs.org](https://nodejs.org) (version LTS)
Si Expo n'est pas installé :
```bash
npm install -g expo-cli
```

### Cloner le dépôt

```bash
git clone https://github.com/[nom-organisation]/respire-frontend.git
cd respire-frontend
```

---

## 🚀 Lancer les projets

### Projet Web (React)

```bash
cd respire-web
npm install
npm start
```

➡️ Ouvre automatiquement sur **http://localhost:3000**

### Projet Mobile (React Native + Expo)

```bash
cd respire-mobile
npm install
npx expo start
```

➡️ Scanne le QR code avec **Expo Go** (App Store / Play Store)
➡️ Ou appuie sur `w` pour ouvrir dans le navigateur

---

## 📁 Structure des dossiers

### `respire-web/src/`

```
src/
├── components/           ← Composants réutilisables
│   ├── Map/              ← Carte Leaflet interactive
│   │   └── MapView.jsx
│   ├── ScoreCard/        ← Carte score cigarettes (Pilier A)
│   │   └── ScoreCard.jsx
│   ├── AlertBanner/      ← Bandeau alerte qualité air
│   │   └── AlertBanner.jsx
│   └── Navbar/           ← Barre de navigation
│       └── Navbar.jsx
├── pages/                ← Écrans principaux
│   ├── Dashboard/        ← Vue globale décideurs
│   │   └── Dashboard.jsx
│   ├── Simulateur/       ← Simulateur d'interventions (Pilier C)
│   │   └── Simulateur.jsx
│   └── Sante/            ← Cohorte et santé citoyenne (Pilier B)
│       └── Sante.jsx
├── services/             ← Appels API vers le backend FastAPI
│   ├── api.js            ← Configuration axios (base URL)
│   ├── capteurs.js       ← GET /capteurs, GET /mesures
│   └── cohorte.js        ← POST /symptomes, GET /correlation
├── hooks/                ← Custom React hooks
│   └── useCapteurs.js    ← Hook fetch données capteurs
├── utils/                ← Fonctions utilitaires
│   └── doseCalcul.js     ← Calcul dose individuelle (Pilier A)
├── assets/               ← Images, icônes
├── App.js
└── index.js
```

### `respire-mobile/src/`

```
src/
├── screens/              ← Les 3 écrans principaux
│   ├── AccueilScreen.js  ← Carte + score cigarettes
│   ├── SymptomsScreen.js ← Déclaration quotidienne (Pilier B)
│   └── ProfilScreen.js   ← Historique dose + stats semaine
├── components/           ← Composants UI mobile
│   ├── ScoreCard.js
│   ├── AlertBanner.js
│   └── QuestionCard.js   ← Carte question oui/non
├── services/             ← Appels API
│   └── api.js
├── utils/                ← Calcul GPS + dose
│   └── doseCalcul.js
└── assets/
```

---

## 📦 Versions utilisées

### Projet Web — `respire-web`

| Package | Version | Rôle |
|---------|---------|------|
| react | 18.x | Framework UI |
| react-dom | 18.x | Rendu DOM |
| react-router-dom | 6.x | Navigation entre pages |
| leaflet | 1.9.x | Carte interactive |
| react-leaflet | 4.x | Composant Leaflet pour React |
| axios | 1.x | Requêtes HTTP vers l'API |
| recharts | 2.x | Graphiques PM2.5 / historique |
| @mui/material | 5.x | Composants UI (boutons, cards) |
| @emotion/react | 11.x | Styling MUI |
| @emotion/styled | 11.x | Styling MUI |

### Projet Mobile — `respire-mobile`

| Package | Version | Rôle |
|---------|---------|------|
| react-native | 0.73.x | Framework mobile |
| expo | 50.x | Environnement de développement |
| expo-location | 16.x | GPS utilisateur (calcul dose) |
| react-native-maps | 1.x | Carte mobile |
| @react-navigation/native | 6.x | Navigation entre écrans |
| @react-navigation/bottom-tabs | 6.x | Barre de navigation bas |
| axios | 1.x | Requêtes HTTP |

### Environnement de développement

| Outil | Version |
|-------|---------|
| Node.js | v20.x.x (LTS) |
| npm | 10.x.x |
| Expo CLI | 50.x |
| Git | 2.x.x |
| VS Code | 1.89+ |
| Expo Go (iPhone) | dernière version App Store |

---

## 👥 Membres de l'équipe

| Membre | Filière | Responsabilités |
|--------|---------|-----------------|
| **Fatoumata Dial** *(Chef)* | IA / Big Data | Coordination, Pilier B, modèles IA |
| **Souleymane Kone** | Informatique | Backend FastAPI, BDD MySQL + InfluxDB |
| **Marie Daba Diouf** | SSI | Gouvernance données, UML, digital twin |
| **Mouhamed Drame** | Télécoms | Infrastructure IoT, MQTT, 4G |
| **Ahmadoul Khadim Touré** | Informatique | **Frontend React + React Native, UX/UI** |
| **Ndeye Sokhna Ndao** | SSI | Privacy by design, JWT, sécurité |

---

## 📅 Organisation du projet

### Sprints

| Sprint | Période | Objectif |
|--------|---------|----------|
| Sprint 1 | Sem. 1-2 | Setup environnements + composants de base |
| Sprint 2 | Sem. 3-4 | Intégration API + carte interactive |
| Sprint 3 | Sem. 5-6 | Pilier A (score) + Pilier B (symptômes) |
| Sprint 4 | Sem. 7-8 | Simulateur (Pilier C) + dashboard |
| Sprint 5 | Sem. 9-10 | Tests, polish, soutenance |

### Outils de collaboration

- **Gestion de tâches :** Trello (tableau Kanban)
- **Versioning :** GitHub (ce dépôt)
- **Communication :** WhatsApp Groupe 5
- **Design :** Figma / Maquettes HTML

---

## 🔗 Liens utiles

- Backend API : `http://localhost:8000` (FastAPI — Souleymane)
- Documentation API : `http://localhost:8000/docs` (Swagger auto-généré)
- Maquettes UI : `/docs/maquettes/RESPIRE_Maquettes.html`
- Tableau Trello : [lien à ajouter]

---

## 📝 Notes importantes

- Les données de santé (symptômes) sont **strictement anonymisées** — aucun nom stocké
- Conformité **CDP Sénégal** (protection des données personnelles)
- Toutes les contributions passent par des **Pull Requests** sur GitHub
- Chaque PR doit être validée par au moins **1 autre membre**

---

*Dernière mise à jour : Mai 2026 · Ahmadoul Khadim Touré*
