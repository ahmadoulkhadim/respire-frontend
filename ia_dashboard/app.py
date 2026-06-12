import streamlit as st
import pandas as pd
import numpy as np
from scipy.stats import spearmanr
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, VotingClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split, RandomizedSearchCV
from sklearn.metrics import classification_report, roc_auc_score, roc_curve
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.express as px
import plotly.graph_objects as go
import folium
from folium.plugins import HeatMap
from streamlit_folium import st_folium
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

# ─────────────────────────────────────────
# CONFIG PAGE
# ─────────────────────────────────────────
st.set_page_config(
    page_title="RESPIRE — Surveillance citoyenne",
    page_icon="🌬️",
    layout="wide",
    initial_sidebar_state="expanded"
)

st.markdown("""
<style>
    .main-title { font-size: 2.2rem; font-weight: 700; color: #1F4E79; margin-bottom: 0; }
    .sub-title  { font-size: 1rem; color: #666; margin-bottom: 2rem; }
    .metric-card { background: #f8f9fa; border-radius: 12px; padding: 1rem 1.5rem;
                   border-left: 4px solid #1F4E79; }
    .alert-rouge  { background:#FCEBEB; border-left:4px solid #A32D2D;
                    border-radius:8px; padding:0.8rem 1rem; color:#791F1F; }
    .alert-orange { background:#FAEEDA; border-left:4px solid #854F0B;
                    border-radius:8px; padding:0.8rem 1rem; color:#633806; }
    .alert-vert   { background:#E1F5EE; border-left:4px solid #0F6E56;
                    border-radius:8px; padding:0.8rem 1rem; color:#085041; }
</style>
""", unsafe_allow_html=True)

# ─────────────────────────────────────────
# DONNÉES SIMULÉES
# ─────────────────────────────────────────
@st.cache_data
def generate_sensor_data():
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
                "date": date, "zone": zone,
                "pm25": round(pm25, 1), "pm10": round(pm10, 1),
                "no2": round(max(5, 30 + noise * 0.8), 1),
                "co":  round(max(0.1, 1.2 + noise * 0.05), 2),
                "lat": coords[zone][0], "lon": coords[zone][1],
                "cigarettes": round(pm25 / 125, 2)
            })
    return pd.DataFrame(rows)


@st.cache_data
def generate_cohort_data(df_sensors):
    np.random.seed(42)
    n_participants = 80
    participants = []
    zones = df_sensors["zone"].unique()
    for i in range(n_participants):
        zone = np.random.choice(zones)
        zone_data = df_sensors[df_sensors["zone"] == zone]
        for _, row in zone_data.iterrows():
            pm25 = row["pm25"]
            p_toux     = min(0.9, 0.05 + (pm25 / 100) * 0.7)
            p_dyspnee  = min(0.85, 0.03 + (pm25 / 100) * 0.6)
            p_tete     = min(0.8,  0.04 + (pm25 / 100) * 0.5)
            p_fatigue  = min(0.85, 0.06 + (pm25 / 100) * 0.55)
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
    return pd.DataFrame(participants)


@st.cache_data
def train_models(df_cohort):
    features = ["pm25", "pm10", "cigarettes"]
    X = df_cohort[features]
    y = df_cohort["toux"]
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y)

    dt  = DecisionTreeClassifier(max_depth=5, random_state=42)
    rf  = RandomForestClassifier(n_estimators=100, random_state=42)
    gb  = GradientBoostingClassifier(n_estimators=100, random_state=42)
    vc  = VotingClassifier(estimators=[("dt", dt), ("rf", rf), ("gb", gb)], voting="soft")

    param_dist = {
        "n_estimators":      [50, 100, 200],
        "max_depth":         [3, 5, 10, None],
        "min_samples_split": [2, 5, 10]
    }
    rscv = RandomizedSearchCV(
        RandomForestClassifier(random_state=42), param_dist,
        n_iter=20, cv=3, scoring="f1", random_state=42)

    results = {}
    for name, model in [("Decision Tree", dt), ("Random Forest", rf),
                        ("Gradient Boosting", gb), ("Voting Classifier", vc),
                        ("RF + RandomizedSearchCV", rscv)]:
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        try:
            y_prob = model.predict_proba(X_test)[:, 1]
            auc = round(roc_auc_score(y_test, y_prob), 3)
            fpr, tpr, _ = roc_curve(y_test, y_prob)
        except Exception:
            auc, fpr, tpr = 0, None, None
        report = classification_report(y_test, y_pred, output_dict=True)
        results[name] = {
            "model": model, "auc": auc,
            "f1": round(report["weighted avg"]["f1-score"], 3),
            "fpr": fpr, "tpr": tpr,
            "X_test": X_test, "y_test": y_test
        }
    return results, X_train.columns.tolist()


# ── Charger les données ──
df_sensors = generate_sensor_data()
df_cohort  = generate_cohort_data(df_sensors)
model_results, feature_names = train_models(df_cohort)

# ─────────────────────────────────────────
# SIDEBAR
# ─────────────────────────────────────────
st.sidebar.image("https://img.icons8.com/color/96/wind.png", width=60)
st.sidebar.title("RESPIRE")
st.sidebar.caption("Surveillance participative · Cap-Vert")
page = st.sidebar.radio("Navigation", [
    "Tableau de bord",
    "Carte pollution",
    "Pilier A — Dose individuelle",
    "Pilier B — Corrélation santé",
    "Pilier C — Simulateur",
])
st.sidebar.divider()
zone_select = st.sidebar.selectbox("Zone active", df_sensors["zone"].unique())
st.sidebar.caption("Données simulées · UCAD ESP DIC2")

# ─────────────────────────────────────────
# HELPERS CARTE
# ─────────────────────────────────────────
def pm25_color(v):
    if v < 15:  return "#3fb950"
    if v < 35:  return "#EF9F27"
    return "#E24B4A"

def pm25_label(v):
    if v < 15:  return "Bon"
    if v < 35:  return "Modéré"
    return "Mauvais"

# ─────────────────────────────────────────
# PAGE : TABLEAU DE BORD
# ─────────────────────────────────────────
if page == "Tableau de bord":
    st.markdown('<p class="main-title">🌬️ RESPIRE</p>', unsafe_allow_html=True)
    st.markdown(
        '<p class="sub-title">Réseau de Surveillance Participative et Intelligente · '
        'Presqu\'île du Cap-Vert</p>',
        unsafe_allow_html=True
    )

    latest   = df_sensors[df_sensors["zone"] == zone_select].sort_values("date").iloc[-1]
    pm25_val = latest["pm25"]
    cig_val  = latest["cigarettes"]

    if pm25_val > 55:
        niveau, alerte_class = "Dangereux", "alert-rouge"
    elif pm25_val > 35:
        niveau, alerte_class = "Mauvais",   "alert-orange"
    elif pm25_val > 15:
        niveau, alerte_class = "Modéré",    "alert-orange"
    else:
        niveau, alerte_class = "Bon",       "alert-vert"

    col1, col2, col3, col4 = st.columns(4)
    col1.metric("PM2.5 actuel",         f"{pm25_val} µg/m³", "Seuil OMS : 15")
    col2.metric("Équivalent cigarettes", f"{cig_val} cig/jour")
    col3.metric("Participants cohorte", "80")
    col4.metric("Capteurs actifs",      "5")

    st.markdown(
        f'<div class="{alerte_class}">Niveau de qualité de l\'air : '
        f'<strong>{niveau}</strong> — Zone : {zone_select}</div>',
        unsafe_allow_html=True
    )
    st.divider()

    col_g, col_d = st.columns(2)
    with col_g:
        st.subheader("Évolution PM2.5 — 6 semaines")
        zone_data = df_sensors[df_sensors["zone"] == zone_select].sort_values("date")
        fig = px.line(zone_data, x="date", y="pm25",
                      labels={"pm25": "PM2.5 (µg/m³)", "date": "Date"},
                      color_discrete_sequence=["#185FA5"])
        fig.add_hline(y=15, line_dash="dash", line_color="#0F6E56",
                      annotation_text="Seuil OMS")
        fig.add_hline(y=35, line_dash="dash", line_color="#854F0B",
                      annotation_text="Niveau mauvais")
        fig.update_layout(margin=dict(l=0, r=0, t=10, b=0), height=280)
        st.plotly_chart(fig, use_container_width=True)

    with col_d:
        st.subheader("Comparaison des zones")
        latest_all = df_sensors.groupby("zone")["pm25"].mean().reset_index()
        fig2 = px.bar(latest_all, x="zone", y="pm25",
                      labels={"pm25": "PM2.5 moyen (µg/m³)", "zone": ""},
                      color="pm25",
                      color_continuous_scale=["#3fb950", "#EF9F27", "#E24B4A"])
        fig2.add_hline(y=15, line_dash="dash", line_color="#0F6E56")
        fig2.update_layout(margin=dict(l=0, r=0, t=10, b=0), height=280,
                           showlegend=False, coloraxis_showscale=False)
        st.plotly_chart(fig2, use_container_width=True)

# ─────────────────────────────────────────
# PAGE : CARTE INTERACTIVE FOLIUM
# ─────────────────────────────────────────
elif page == "Carte pollution":
    st.header("🗺️ Carte interactive — Presqu'île du Cap-Vert")
    st.caption("Code couleur OMS · vert < 15 · orange 15–35 · rouge > 35 µg/m³  |  Cliquez sur un capteur pour le détail")

    # ── Données agrégées par zone ──
    latest_map = (
        df_sensors
        .groupby(["zone", "lat", "lon"])
        .agg(pm25=("pm25", "mean"), pm10=("pm10", "mean"), no2=("no2", "mean"))
        .reset_index()
    )

    # ── Construction carte Folium ──
    m = folium.Map(
        location=[14.72, -17.30],
        zoom_start=11,
        tiles="CartoDB positron",
    )

    # Couches de fond alternatives
    folium.TileLayer(
        tiles=(
            "https://server.arcgisonline.com/ArcGIS/rest/services/"
            "World_Imagery/MapServer/tile/{z}/{y}/{x}"
        ),
        attr="Esri",
        name="🛰️ Satellite",
    ).add_to(m)
    folium.TileLayer("CartoDB positron",      name="🗺️ Plan clair").add_to(m)
    folium.TileLayer("OpenStreetMap",         name="🗺️ OpenStreetMap").add_to(m)

    # ── HeatMap de pollution ──
    heat_data = [
        [row["lat"], row["lon"], row["pm25"]]
        for _, row in latest_map.iterrows()
    ]
    HeatMap(
        heat_data,
        radius=70, blur=50,
        gradient={"0.3": "#3fb950", "0.6": "#EF9F27", "1.0": "#E24B4A"},
        min_opacity=0.30,
        name="🌡️ HeatMap pollution",
    ).add_to(m)

    # ── Cercles + Marqueurs par zone ──
    for _, row in latest_map.iterrows():
        color  = pm25_color(row["pm25"])
        niveau = pm25_label(row["pm25"])
        cig    = round(row["pm25"] / 125 * 24, 2)

        # Barre de progression OMS (max visuel = 80 µg/m³)
        pct = min(100, int(row["pm25"] / 80 * 100))
        bar_color = color

        popup_html = f"""
        <div style="font-family:'Segoe UI',sans-serif;width:240px;padding:4px">
          <div style="font-size:15px;font-weight:700;color:#1F4E79;margin-bottom:6px">
            {row['zone']}
          </div>
          <hr style="margin:4px 0;border-color:#eee">
          <div style="margin:6px 0">
            <span style="color:{color};font-size:13px;font-weight:700">⬤ {niveau}</span>
          </div>
          <table style="width:100%;font-size:12px;border-collapse:collapse">
            <tr>
              <td style="padding:2px 0;color:#555">PM2.5</td>
              <td style="text-align:right;font-weight:700">{row['pm25']:.1f} µg/m³</td>
            </tr>
            <tr>
              <td style="padding:2px 0;color:#555">PM10</td>
              <td style="text-align:right;font-weight:700">{row['pm10']:.1f} µg/m³</td>
            </tr>
            <tr>
              <td style="padding:2px 0;color:#555">NO₂</td>
              <td style="text-align:right;font-weight:700">{row['no2']:.1f} µg/m³</td>
            </tr>
            <tr>
              <td style="padding:2px 0;color:#555">🚬 Cigarettes/jour</td>
              <td style="text-align:right;font-weight:700">{cig}</td>
            </tr>
          </table>
          <div style="margin-top:8px">
            <div style="font-size:11px;color:#888;margin-bottom:2px">
              Niveau vs seuil OMS (15 µg/m³)
            </div>
            <div style="background:#eee;border-radius:4px;height:8px;overflow:hidden">
              <div style="width:{pct}%;height:8px;background:{bar_color};border-radius:4px"></div>
            </div>
          </div>
        </div>
        """

        # Cercle de pollution (rayon proportionnel)
        folium.Circle(
            location=[row["lat"], row["lon"]],
            radius=row["pm25"] * 55,
            color=color,
            fill=True,
            fill_opacity=0.18,
            weight=2,
        ).add_to(m)

        # Marqueur cliquable
        folium.CircleMarker(
            location=[row["lat"], row["lon"]],
            radius=14,
            color="white",
            weight=2.5,
            fill=True,
            fill_color=color,
            fill_opacity=0.95,
            tooltip=folium.Tooltip(
                f"<b>{row['zone']}</b><br>PM2.5 : {row['pm25']:.1f} µg/m³ — {niveau}",
                style="font-family:sans-serif;font-size:13px"
            ),
            popup=folium.Popup(popup_html, max_width=260),
        ).add_to(m)

        # Étiquette valeur PM2.5
        folium.Marker(
            location=[row["lat"], row["lon"]],
            icon=folium.DivIcon(
                html=(
                    f'<div style="font-size:10px;font-weight:700;color:#222;'
                    f'white-space:nowrap;text-shadow:0 0 4px white,0 0 4px white">'
                    f'{row["pm25"]:.0f} µg/m³</div>'
                ),
                icon_size=(90, 20),
                icon_anchor=(45, -10),
            ),
        ).add_to(m)

    # ── Légende OMS ──
    legend_html = """
    <div style="position:fixed;bottom:30px;left:30px;z-index:9999;
         background:white;padding:14px 18px;border-radius:12px;
         box-shadow:0 2px 12px rgba(0,0,0,.18);font-family:'Segoe UI',sans-serif;
         font-size:13px;line-height:1.8">
      <b style="font-size:14px">Qualité de l'air — OMS</b><br>
      <span style="color:#3fb950">⬤</span> <b>Bon</b> &lt; 15 µg/m³<br>
      <span style="color:#EF9F27">⬤</span> <b>Modéré</b> 15–35 µg/m³<br>
      <span style="color:#E24B4A">⬤</span> <b>Mauvais</b> &gt; 35 µg/m³<br>
      <hr style="margin:6px 0;border-color:#eee">
      <span style="font-size:11px;color:#888">Taille des cercles ∝ concentration PM2.5</span>
    </div>
    """
    m.get_root().html.add_child(folium.Element(legend_html))

    # ── Contrôle des couches ──
    folium.LayerControl(collapsed=False).add_to(m)

    # ── Affichage Streamlit ──
    st_folium(m, width="100%", height=540, returned_objects=[])

    st.divider()

    # ── Tableau récapitulatif ──
    st.subheader("📊 Récapitulatif des capteurs")
    display = latest_map[["zone", "pm25", "pm10", "no2"]].copy()
    display["Niveau OMS"]   = display["pm25"].apply(pm25_label)
    display["🚬 Cig/jour"]  = (display["pm25"] / 125 * 24).round(2)
    display.columns = [
        "Zone", "PM2.5 moy (µg/m³)", "PM10 moy (µg/m³)",
        "NO₂ moy (µg/m³)", "Niveau OMS", "🚬 Équiv. cigarettes/jour"
    ]
    st.dataframe(display, use_container_width=True, hide_index=True)

    st.caption(
        "📡 Sources actuelles : données simulées. "
        "Pour des données réelles : [OpenAQ](https://openaq.org) · "
        "[GitHub senegalouvert/AIR-Dakar](https://github.com/senegalouvert/AIR-Dakar) · "
        "[AQICN ESP Dakar](https://aqicn.org/station/@84628/)"
    )

# ─────────────────────────────────────────
# PAGE : PILIER A
# ─────────────────────────────────────────
elif page == "Pilier A — Dose individuelle":
    st.header("Pilier A — Calcul de la dose individuelle respirée")
    st.info("Combien de pollution as-tu personnellement respiré aujourd'hui ?")

    col1, col2 = st.columns(2)
    with col1:
        heures_maison  = st.slider("Heures passées à la maison", 0, 24, 8)
        heures_trajet  = st.slider("Heures en déplacement (rue/transport)", 0, 24, 2)
        heures_travail = st.slider("Heures au bureau/école", 0, 24, 8)
    with col2:
        zone_maison  = st.selectbox("Zone de résidence",    df_sensors["zone"].unique(), index=2)
        zone_trajet  = st.selectbox("Zone de trajet",       df_sensors["zone"].unique(), index=1)
        zone_travail = st.selectbox("Zone de travail/école", df_sensors["zone"].unique(), index=0)

    def get_pm25(zone):
        return df_sensors[df_sensors["zone"] == zone]["pm25"].mean()

    dose = (
        get_pm25(zone_maison)  * heures_maison  +
        get_pm25(zone_trajet)  * heures_trajet  +
        get_pm25(zone_travail) * heures_travail
    )
    cigarettes = round(dose / 125, 2)

    st.divider()
    col_a, col_b, col_c = st.columns(3)
    col_a.metric("Dose journalière",       f"{dose:.0f} µg/m³·h")
    col_b.metric("Équivalent cigarettes",  f"{cigarettes} cigarettes")
    col_c.metric("Heures exposé",          f"{heures_maison + heures_trajet + heures_travail}h")

    if cigarettes < 1:
        st.markdown(
            '<div class="alert-vert">Exposition faible — en dessous du seuil OMS journalier</div>',
            unsafe_allow_html=True
        )
    elif cigarettes < 3:
        st.markdown(
            '<div class="alert-orange">Exposition modérée — limite recommandée dépassée</div>',
            unsafe_allow_html=True
        )
    else:
        st.markdown(
            '<div class="alert-rouge">Exposition élevée — équivalent fumeur actif</div>',
            unsafe_allow_html=True
        )

    st.subheader("Détail par zone")
    detail = pd.DataFrame({
        "Zone":        [zone_maison, zone_trajet, zone_travail],
        "Heures":      [heures_maison, heures_trajet, heures_travail],
        "PM2.5 moy":   [round(get_pm25(z), 1) for z in [zone_maison, zone_trajet, zone_travail]],
        "Dose (µg·h)": [
            round(get_pm25(z) * h, 1)
            for z, h in zip(
                [zone_maison, zone_trajet, zone_travail],
                [heures_maison, heures_trajet, heures_travail]
            )
        ]
    })
    st.dataframe(detail, use_container_width=True, hide_index=True)

# ─────────────────────────────────────────
# PAGE : PILIER B
# ─────────────────────────────────────────
elif page == "Pilier B — Corrélation santé":
    st.header("Pilier B — Corrélation exposition-santé")
    st.info("Les zones les plus polluées ont-elles plus de symptômes déclarés ?")

    tab1, tab2, tab3 = st.tabs(["Corrélation Spearman", "Modèles ML", "Courbes ROC"])

    with tab1:
        st.subheader("Corrélation de Spearman — PM2.5 vs symptômes")
        symptomes = ["toux", "dyspnee", "maux_tete", "fatigue"]
        corr_data = []
        for s in symptomes:
            rho, p = spearmanr(df_cohort["pm25"], df_cohort[s])
            corr_data.append({
                "Symptôme": s,
                "rho": round(rho, 3),
                "p-value": round(p, 4),
                "Significatif": "✅ Oui" if p < 0.05 else "❌ Non"
            })
        st.dataframe(pd.DataFrame(corr_data), use_container_width=True, hide_index=True)

        fig_sc, axes = plt.subplots(2, 2, figsize=(10, 7))
        fig_sc.patch.set_facecolor("white")
        for ax, s in zip(axes.flat, symptomes):
            sample = df_cohort.sample(300, random_state=42)
            colors = ["#E24B4A" if v == 1 else "#3fb950" for v in sample[s]]
            ax.scatter(sample["pm25"], sample[s], alpha=0.4, c=colors, s=15)
            rho, _ = spearmanr(df_cohort["pm25"], df_cohort[s])
            ax.set_title(f"{s} (rho={rho:.2f})", fontsize=11)
            ax.set_xlabel("PM2.5 (µg/m³)", fontsize=9)
            ax.set_ylabel(s, fontsize=9)
        plt.tight_layout()
        st.pyplot(fig_sc)

        st.subheader("Heatmap de corrélation")
        corr_matrix = df_cohort[["pm25", "pm10", "cigarettes"] + symptomes].corr(method="spearman")
        fig_hm, ax = plt.subplots(figsize=(8, 5))
        sns.heatmap(corr_matrix, annot=True, fmt=".2f", cmap="RdYlGn",
                    center=0, ax=ax, square=True)
        plt.tight_layout()
        st.pyplot(fig_hm)

    with tab2:
        st.subheader("Comparaison des modèles ML — prédiction de toux")
        results_df = pd.DataFrame([{
            "Modèle":   name,
            "F1-score": r["f1"],
            "AUC-ROC":  r["auc"]
        } for name, r in model_results.items()])
        st.dataframe(results_df, use_container_width=True, hide_index=True)

        fig_bar, ax = plt.subplots(figsize=(9, 4))
        x = np.arange(len(results_df))
        ax.bar(x - 0.2, results_df["F1-score"], 0.35, label="F1-score", color="#185FA5")
        ax.bar(x + 0.2, results_df["AUC-ROC"],  0.35, label="AUC-ROC",  color="#0F6E56")
        ax.set_xticks(x)
        ax.set_xticklabels(results_df["Modèle"], rotation=15, ha="right", fontsize=9)
        ax.set_ylim(0, 1)
        ax.legend()
        ax.set_title("Performance des modèles", fontsize=12)
        plt.tight_layout()
        st.pyplot(fig_bar)

        best = results_df.loc[results_df["AUC-ROC"].idxmax(), "Modèle"]
        best_auc = results_df.loc[results_df["Modèle"] == best, "AUC-ROC"].values[0]
        st.success(f"Meilleur modèle : **{best}** — AUC-ROC : {best_auc}")

        if "Random Forest" in model_results:
            rf_model = model_results["Random Forest"]["model"]
            if hasattr(rf_model, "feature_importances_"):
                st.subheader("Feature importance — Random Forest")
                fi = pd.DataFrame({
                    "Feature":    feature_names,
                    "Importance": rf_model.feature_importances_
                }).sort_values("Importance", ascending=True)
                fig_fi, ax = plt.subplots(figsize=(7, 3))
                ax.barh(fi["Feature"], fi["Importance"], color="#185FA5")
                ax.set_xlabel("Importance")
                plt.tight_layout()
                st.pyplot(fig_fi)

    with tab3:
        st.subheader("Courbes ROC comparatives")
        fig_roc, ax = plt.subplots(figsize=(8, 6))
        colors_roc = ["#185FA5", "#0F6E56", "#854F0B", "#A32D2D", "#534AB7"]
        for (name, r), color in zip(model_results.items(), colors_roc):
            if r["fpr"] is not None:
                ax.plot(r["fpr"], r["tpr"], label=f"{name} (AUC={r['auc']})", color=color)
        ax.plot([0, 1], [0, 1], "--", color="gray", alpha=0.5)
        ax.set_xlabel("Taux faux positifs")
        ax.set_ylabel("Taux vrais positifs")
        ax.set_title("Courbes ROC — tous les modèles")
        ax.legend(fontsize=8)
        plt.tight_layout()
        st.pyplot(fig_roc)

# ─────────────────────────────────────────
# PAGE : PILIER C
# ─────────────────────────────────────────
elif page == "Pilier C — Simulateur":
    st.header("Pilier C — Simulateur d'interventions")
    st.info("Quelle intervention aura le plus d'impact sur la qualité de l'air ?")

    zone_sim  = st.selectbox("Zone d'intervention", df_sensors["zone"].unique())
    pm25_base = round(df_sensors[df_sensors["zone"] == zone_sim]["pm25"].mean(), 1)

    st.subheader("Choisissez une intervention")
    col1, col2, col3 = st.columns(3)
    

    with col1:
        st.markdown("**🌳 Végétalisation**")
        nb_arbres      = st.slider("Nombre d'arbres", 0, 500, 200)
        reduction_veg  = round(min(0.30, nb_arbres / 500 * 0.30), 3)

    with col2:
        st.markdown("**🚗 Régulation trafic**")
        taux_reduction_trafic = st.slider("Réduction trafic (%)", 0, 100, 30)
        reduction_traf        = round(taux_reduction_trafic / 100 * 0.25, 3)

    with col3:
        st.markdown("**🚧 Fermeture de rue**")
        heures_fermeture = st.slider("Heures de fermeture/jour", 0, 12, 4)
        reduction_rue    = round(heures_fermeture / 24 * 0.15, 3)

    reduction_totale = min(0.60, reduction_veg + reduction_traf + reduction_rue)
    pm25_apres  = round(pm25_base * (1 - reduction_totale), 1)
    dose_avant  = round(pm25_base * 24 / 125, 2)
    dose_apres  = round(pm25_apres * 24 / 125, 2)
    cig_evitees = round(dose_avant - dose_apres, 2)

    st.divider()
    col_a, col_b, col_c, col_d = st.columns(4)
    col_a.metric("PM2.5 avant",             f"{pm25_base} µg/m³")
    col_b.metric("PM2.5 après",             f"{pm25_apres} µg/m³",
                 delta=f"-{round(pm25_base - pm25_apres, 1)} µg/m³")
    col_c.metric("Réduction totale",        f"{round(reduction_totale * 100, 1)}%")
    col_d.metric("Cigarettes évitées/jour", f"{cig_evitees} cig")

    fig_sim = go.Figure(go.Bar(
        x=["Avant intervention", "Après intervention"],
        y=[pm25_base, pm25_apres],
        marker_color=["#E24B4A", "#3fb950"],
        text=[f"{pm25_base} µg/m³", f"{pm25_apres} µg/m³"],
        textposition="outside"
    ))
    fig_sim.add_hline(y=15, line_dash="dash", line_color="#0F6E56",
                      annotation_text="Seuil OMS (15 µg/m³)")
    fig_sim.update_layout(
        title=f"Impact sur la qualité de l'air — {zone_sim}",
        yaxis_title="PM2.5 (µg/m³)",
        height=380,
        margin=dict(l=0, r=0, t=50, b=0)
    )
    st.plotly_chart(fig_sim, use_container_width=True)

    st.markdown(f"""
    **Interprétation :** En combinant ces interventions dans la zone **{zone_sim}**,
    le niveau de PM2.5 passerait de **{pm25_base} µg/m³** à **{pm25_apres} µg/m³**,
    soit une réduction de **{round(reduction_totale * 100, 1)}%**.
    Chaque habitant éviterait l'équivalent de **{cig_evitees} cigarettes par jour**.
    """)

    st.caption(
        "Sources : Nowak et al. (2014) pour la végétalisation · "
        "WHO Air Quality Guidelines 2021"
    )