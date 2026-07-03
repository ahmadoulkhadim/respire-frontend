# RESPIRE — Dashboard Web

Application React pour le tableau de bord décideurs et le simulateur d'interventions (Pilier C).

## Démarrage rapide

```bash
cp .env.example .env
npm install
npm start
```

➡️ http://localhost:3000

## Structure `src/`

```
src/
├── components/     Composants réutilisables (Map, ScoreCard, StatsCards)
├── pages/          Dashboard, Sante, Simulateur
├── services/       Appels API vers le backend FastAPI
├── hooks/          useCapteurs — fetch données capteurs
├── utils/          doseCalcul — calcul dose cigarettes (Pilier A)
├── App.js
└── index.js
```

## Configuration

| Variable | Description | Défaut |
|----------|-------------|--------|
| `REACT_APP_API_URL` | URL du backend FastAPI | `http://localhost:8000` |

## Intégration API

Par défaut, le Dashboard utilise des **données mockées** (`useCapteurs({ useMock: true })`).
Pour connecter le backend, passez `useMock: false` une fois l'API disponible.

Documentation API : `../backend/API_ENDPOINTS.md`
