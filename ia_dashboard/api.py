from flask import Flask, jsonify, request
from flask_cors import CORS
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from scipy.stats import spearmanr
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, VotingClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split, RandomizedSearchCV
from sklearn.metrics import classification_report, roc_auc_score
import warnings
warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)

# ─── DATA GENERATION (identique à app.py) ───
np.random.seed(42)
n_days = 42
zones = {
    "A1 — Bargny/SOCOCIM": {"pm25_base": 65, "pm10_base": 120},
    "B1 — Autoroute":       {"pm25_base": 48, "pm10_base": 95},
    "C1 — Résidentiel":     {"pm25_base": 38, "pm10_base": 75},
    "C2 — Diamniadio":      {"pm25_base": 42, "pm10_base": 82},
    "E1 — Témoin":          {"pm25_base": 12, "pm10_base": 25},
}
coords = {
    "A1 — Bargny/SOCOCIM": (14.6937, -17.2229),
    "B1 — Autoroute":       (14.7200, -17.3500),
    "C1 — Résidentiel":     (14.6850, -17.2300),
    "C2 — Diamniadio":      (14.7100, -17.1800),
    "E1 — Témoin":          (14.8200, -17.0500),
}

rows = []
dates = [datetime(2025, 4, 1) + timedelta(days=i) for i in range(n_days)]
for zone, params in zones.items():
    for date in dates:
        noise = np.random.normal(0, 8)
        weekend = 1.15 if date.weekday() >= 5 else 1.0
        pm25 = max(5, params["pm25_base"] * weekend + noise)
        pm10 = max(10, params["pm10_base"] * weekend + noise * 1.5)
        rows.append({
            "date": date.strftime("%Y-%m-%d"), "zone": zone,
            "pm25": round(pm25, 1), "pm10": round(pm10, 1),
            "no2": round(max(5, 30 + noise * 0.8), 1),
            "co": round(max(0.1, 1.2 + noise * 0.05), 2),
            "lat": coords[zone][0], "lon": coords[zone][1],
            "cigarettes": round(pm25 / 125, 2)
        })

df = pd.DataFrame(rows)

# ─── Cohort / ML ───
n_participants = 80
participants = []
for i in range(n_participants):
    zone = np.random.choice(list(zones.keys()))
    zone_data = df[df["zone"] == zone]
    for _, row in zone_data.iterrows():
        pm25 = row["pm25"]
        p_toux    = min(0.9, 0.05 + (pm25 / 100) * 0.7)
        p_dyspnee = min(0.85, 0.03 + (pm25 / 100) * 0.6)
        p_tete    = min(0.8,  0.04 + (pm25 / 100) * 0.5)
        p_fatigue = min(0.85, 0.06 + (pm25 / 100) * 0.55)
        participants.append({
            "participant_id": f"P{i:03d}",
            "zone": zone, "date": row["date"],
            "pm25": pm25, "pm10": row["pm10"],
            "cigarettes": row["cigarettes"],
            "toux":    int(np.random.random() < p_toux),
            "dyspnee": int(np.random.random() < p_dyspnee),
            "maux_tete": int(np.random.random() < p_tete),
            "fatigue": int(np.random.random() < p_fatigue),
        })

df_cohort = pd.DataFrame(participants)

# ─── ML Model Training ───
features = ["pm25", "pm10", "cigarettes"]
X = df_cohort[features]
y = df_cohort["toux"]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

models = {
    "Decision Tree": DecisionTreeClassifier(max_depth=5, random_state=42),
    "Random Forest": RandomForestClassifier(n_estimators=100, random_state=42),
    "Gradient Boosting": GradientBoostingClassifier(n_estimators=100, random_state=42),
}
model_results = {}
for name, model in models.items():
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    report = classification_report(y_test, y_pred, output_dict=True)
    model_results[name] = {
        "f1": round(report["weighted avg"]["f1-score"], 3),
        "auc": round(roc_auc_score(y_test, y_prob), 3),
    }

# Feature importance du Random Forest
rf = models["Random Forest"]
feature_importance = [
    {"feature": f, "importance": round(float(i), 3)}
    for f, i in zip(features, rf.feature_importances_)
]

# Spearman correlations
symptomes = ["toux", "dyspnee", "maux_tete", "fatigue"]
correlations = []
for s in symptomes:
    rho, p = spearmanr(df_cohort["pm25"], df_cohort[s])
    correlations.append({
        "symptome": s,
        "rho": round(rho, 3),
        "p_value": round(p, 4),
        "significatif": bool(p < 0.05)
    })

def pm25_status(v):
    if v < 15: return "Bon"
    if v < 35: return "Modéré"
    if v > 55: return "Danger"
    return "Mauvais"

# Mapping des zones de l'IA vers les capteurs React
zone_to_capteur_nom = {
    "A1 — Bargny/SOCOCIM": "Bargny - SOCOCIM",
    "B1 — Autoroute":       "Diamniadio - Autoroute",
    "C1 — Résidentiel":     "Sébikotane - Centre",
    "C2 — Diamniadio":      "Diamniadio - Cité",
    "E1 — Témoin":          "Dakar - Port",
}

df["capteur_nom"] = df["zone"].map(zone_to_capteur_nom)
capteur_ids = {n: i+1 for i, n in enumerate(zone_to_capteur_nom.values())}

# ─── Routes API ───

@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})

@app.route("/api/sensors")
def get_sensors():
    """Liste des capteurs avec dernières mesures"""
    latest = df.groupby("capteur_nom").apply(lambda x: x.sort_values("date").iloc[-1]).reset_index(drop=True)
    prev = df.groupby("capteur_nom").apply(lambda x: x.sort_values("date").iloc[-2]).reset_index(drop=True)

    sensors = []
    for _, row in latest.iterrows():
        prev_row = prev[prev["capteur_nom"] == row["capteur_nom"]]
        evo = prev_row["pm25"].values[0] if len(prev_row) > 0 else row["pm25"]
        diff = ((row["pm25"] - evo) / evo) * 100
        evolution = f"{'+' if diff >= 0 else ''}{diff:.0f}%"
        sensors.append({
            "id": capteur_ids[row["capteur_nom"]],
            "nom": row["capteur_nom"],
            "pm25": int(row["pm25"]),
            "statut": pm25_status(row["pm25"]),
            "lat": row["lat"],
            "lon": row["lon"],
            "evolution": evolution,
            "pm10": row["pm10"],
            "no2": row["no2"],
            "cigarettes": row["cigarettes"],
        })

    return jsonify(sensors)

@app.route("/api/dashboard/stats")
def get_dashboard_stats():
    """Stats pour les cartes du tableau de bord"""
    latest = df[df["date"] == df["date"].max()]
    participants_count = df_cohort["participant_id"].nunique()

    stats = {
        "capteurs_actifs": {"value": "5", "subtext": "/ 5", "label": "Capteurs actifs"},
        "population": {"value": "250k", "subtext": None, "label": "Population couverte"},
        "alertes": {"value": str(int((latest["pm25"] > 35).sum())), "subtext": None, "label": "Alertes aujourd'hui"},
        "participants": {"value": str(participants_count), "subtext": None, "label": "Participants"},
    }
    return jsonify(stats)

@app.route("/api/dashboard/score")
def get_score():
    """Score RESPIRE Index"""
    latest = df[df["date"] == df["date"].max()]
    mean_pm25 = latest["pm25"].mean()
    cig = mean_pm25 / 125
    prev = df[df["date"] == df["date"].sort_values().unique()[-2]]
    prev_mean = prev["pm25"].mean()
    evolution = round(((mean_pm25 - prev_mean) / prev_mean) * 100, 1)

    return jsonify({
        "score": f"{cig:.1f}".replace(".", ","),
        "polluant": "PM2.5 moyen",
        "unite": f"{mean_pm25:.0f} µg/m³",
        "evolution": evolution,
        "cigarettes": round(cig, 2),
    })

@app.route("/api/sante/stats")
def get_sante_stats():
    """Stats de l'observatoire citoyen"""
    participants_count = df_cohort["participant_id"].nunique()
    declarations = len(df_cohort)
    latest_pm25 = df[df["date"] == df["date"].max()]["pm25"].mean()
    cig = round(latest_pm25 / 125, 1)

    return jsonify({
        "participants": participants_count,
        "declarations": declarations,
        "exposition": f"{cig:.1f}",
        "date": datetime.now().strftime("%Y-%m-%d"),
    })

@app.route("/api/sante/correlations")
def get_correlations():
    """Corrélations Spearman + ML"""
    return jsonify({
        "correlations": correlations,
        "model_results": model_results,
        "feature_importance": feature_importance,
    })

@app.route("/api/simulateur/scenarios")
def get_scenarios():
    """Scénarios du simulateur avec données IA"""
    data = {}
    zone_map = {
        "vegetalisation": "C1 — Résidentiel",
        "trafic": "B1 — Autoroute",
        "fermeture": "A1 — Bargny/SOCOCIM",
    }

    scenarios = []
    colors = {"vegetalisation": "green", "trafic": "amber", "fermeture": "blue"}
    impacts = {"vegetalisation": "-10% PM2.5", "trafic": "-15 à 25%", "fermeture": "Impact local"}
    titles = {"vegetalisation": "Végétalisation", "trafic": "Régulation du trafic", "fermeture": "Fermeture de rue"}
    descs = {"vegetalisation": "Planter 200 arbres", "trafic": "Interdire camions cimenterie 7h–9h", "fermeture": "Bloquer la rue aux heures de pointe"}
    reductions = {"vegetalisation": min(0.30, 200 / 500 * 0.30), "trafic": 0.30 / 100 * 0.25, "fermeture": 4 / 24 * 0.15}

    for key, zone_name in zone_map.items():
        zone_data = df[df["zone"] == zone_name]
        pm25_base = zone_data["pm25"].mean()
        reduction = reductions[key]

        pm25_after = round(pm25_base * (1 - reduction), 1)
        dose_before = round(pm25_base * 24 / 125, 2)
        dose_after = round(pm25_after * 24 / 125, 2)

        scenarios.append({
            "id": len(scenarios),
            "color": colors[key],
            "title": titles[key],
            "description": descs[key],
            "impact": impacts[key],
            "details": {
                "pm25": f"{pm25_base:.0f} → {pm25_after} µg/m³",
                "dose": f"{dose_before} → {dose_after} /jour",
                "rayon": f"{zone_name}",
                "evites": f"~{int((dose_before - dose_after) * 4)} déclarations/semaine",
                "before": str(int(pm25_base)),
                "after": str(int(pm25_after)),
            }
        })

    return jsonify(scenarios)

if __name__ == "__main__":
    app.run(port=5000, debug=True)
