# 🌬️ RESPIRE

**Réseau de Surveillance Participative et Intelligente pour la Résilience Environnementale et Sanitaire**
Presqu'île du Cap-Vert — Dakar, Sénégal

> Projet Transversal DIC 2 — École Supérieure Polytechnique (ESP), UCAD
> Groupe 5 · Sprint 1 · Mai 2026

---

## 📋 Table des matières

- [Présentation](#présentation)
- [Architecture](#architecture)
- [Structure du dépôt](#structure-du-dépôt)
- [Installation](#installation)
- [Lancer le projet](#lancer-le-projet)
- [Versions](#versions)
- [Équipe](#équipe)

---

## 🎯 Présentation

RESPIRE est une plateforme intelligente de surveillance citoyenne de la pollution atmosphérique. Elle combine capteurs IoT, intelligence artificielle et science participative pour :

- **Pilier A** — Calculer la dose de pollution réellement respirée (équivalent cigarettes)
- **Pilier B** — Constituer une cohorte citoyenne (exposition ↔ symptômes)
- **Pilier C** — Simuler l'impact d'interventions environnementales

**Zone couverte :** Bargny · Diamniadio · Sébikotane · Hann (Dakar)

---

## 🏗️ Architecture

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

## 📁 Structure du dépôt

Ce dépôt est un **monorepo** contenant les trois parties applicatives :

```
respire-frontend/          ← dépôt principal (ce README)
├── backend/               ← API FastAPI (MySQL + InfluxDB)
│   ├── app/
│   │   ├── main.py        ← Point d'entrée FastAPI
│   │   ├── routes/        ← Endpoints REST
│   │   └── models/        ← Modèles SQLAlchemy
│   ├── docker-compose.yml ← MySQL + InfluxDB + API
│   ├── schema.sql         ← Schéma MySQL
│   └── API_ENDPOINTS.md   ← Documentation endpoints
│
├── respire-web/           ← Dashboard décideurs (React)
│   └── src/
│       ├── components/    ← Map, ScoreCard, StatsCards
│       ├── pages/         ← Dashboard, Sante, Simulateur
│       ├── services/      ← Appels API (axios)
│       ├── hooks/         ← useCapteurs
│       └── utils/         ← doseCalcul (Pilier A)
│
└── respire-mobile/        ← App citoyenne (Expo / React Native)
    └── src/
        ├── screens/       ← Accueil, Symptômes, Profil
        └── components/    ← UI mobile
```

---

## ⚙️ Installation

### Prérequis

| Outil | Version minimale |
|-------|-----------------|
| Node.js | v20 LTS |
| npm | 10.x |
| Python | 3.11+ |
| Docker | 24+ (optionnel, pour BDD) |
| Git | 2.x |

```bash
git clone https://github.com/ahmadoulkhadim/respire-frontend.git
cd respire-frontend
make install          # installe web + mobile + backend
```

Ou manuellement :

```bash
# Frontend web
cd respire-web && npm install

# Mobile
cd respire-mobile && npm install

# Backend
cd backend && bash setup.sh
cp .env.example .env    # puis configurer les credentials
```

---

## 🚀 Lancer le projet

### Option rapide (Makefile)

```bash
make dev-db        # MySQL + InfluxDB via Docker
make dev-backend   # API sur http://localhost:8000
make dev-web       # Dashboard sur http://localhost:3000
make dev-mobile    # Expo Go (QR code)
```

### Manuellement

**1. Bases de données (Docker)**
```bash
cd backend
docker compose up -d mysql influxdb
```

**2. Backend FastAPI**
```bash
cd backend
source venv/bin/activate
python -m uvicorn app.main:app --reload
# → http://localhost:8000/docs (Swagger)
```

**3. Dashboard Web**
```bash
cd respire-web
cp .env.example .env
npm start
# → http://localhost:3000
```

**4. App Mobile**
```bash
cd respire-mobile
npx expo start
# → Scanner le QR code avec Expo Go
```

---

## 📦 Versions

### Backend (`backend/requirements.txt`)
FastAPI · SQLAlchemy · PyMySQL · InfluxDB Client · python-jose · passlib

### Frontend Web (`respire-web/package.json`)
React 19 · react-router-dom 7 · Leaflet · axios · recharts · Tailwind CSS · MUI

### Mobile (`respire-mobile/package.json`)
Expo 56 · React Native 0.85 · expo-location · react-native-maps

---

## 👥 Équipe

| Membre | Filière | Responsabilités |
|--------|---------|-----------------|
| **Fatoumata Dial** *(Chef)* | IA / Big Data | Coordination, Pilier B, modèles IA |
| **Souleymane Kone** | Informatique | Backend FastAPI, BDD MySQL + InfluxDB |
| **Marie Daba Diouf** | SSI | Gouvernance données, UML, digital twin |
| **Mouhamed Drame** | Télécoms | Infrastructure IoT, MQTT, 4G |
| **Ahmadoul Khadim Touré** | Informatique | Frontend React + React Native, UX/UI |
| **Ndeye Sokhna Ndao** | SSI | Privacy by design, JWT, sécurité |

---

## 🔗 Liens utiles

| Ressource | URL |
|-----------|-----|
| API Backend | http://localhost:8000 |
| Swagger / Docs | http://localhost:8000/docs |
| Endpoints détaillés | [backend/API_ENDPOINTS.md](backend/API_ENDPOINTS.md) |
| Backend README | [backend/README.md](backend/README.md) |
| Web README | [respire-web/README.md](respire-web/README.md) |

---

## 📝 Notes

- Les données de santé sont **strictement anonymisées** (conformité CDP Sénégal)
- Ne jamais committer `.env`, `venv/` ou `node_modules/` (voir `.gitignore`)
- Contributions via **Pull Requests** validées par au moins 1 membre

---

*Dernière mise à jour : Juin 2026 · Ahmadoul Khadim Touré*
