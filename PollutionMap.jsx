import { useState, useEffect, useRef, useCallback } from "react";

// ─── Leaflet via CDN (injecté dynamiquement) ────────────────────────────────
function useLeaflet(onReady) {
  useEffect(() => {
    if (window.L) { onReady(window.L); return; }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => onReady(window.L);
    document.head.appendChild(script);
  }, []);
}

// ─── Données des capteurs (coordonnées GPS exactes) ─────────────────────────
const CAPTEURS_INITIAL = [
  {
    id: "RESP-BRG-01",
    nom: "Bargny – Port",
    lat: 14.6977,
    lng: -17.1772,
    zone: "Bargny",
  },
  {
    id: "RESP-DMD-01",
    nom: "Diamniadio – Centre",
    lat: 14.7197,
    lng: -17.0486,
    zone: "Diamniadio",
  },
  {
    id: "RESP-SBK-01",
    nom: "Sébikotane – Nord",
    lat: 14.7433,
    lng: -17.1108,
    zone: "Sébikotane",
  },
];

// ─── Niveaux OMS ─────────────────────────────────────────────────────────────
function getNiveau(pm25) {
  if (pm25 < 12) return { label: "Bon", color: "#22c55e", bg: "#dcfce7", text: "#15803d", ring: "#86efac" };
  if (pm25 < 35) return { label: "Modéré", color: "#eab308", bg: "#fef9c3", text: "#a16207", ring: "#fde047" };
  if (pm25 < 55) return { label: "Mauvais", color: "#f97316", bg: "#ffedd5", text: "#c2410c", ring: "#fdba74" };
  return { label: "Dangereux", color: "#ef4444", bg: "#fee2e2", text: "#b91c1c", ring: "#fca5a5" };
}

// ─── Simulation données API (remplacer par vrai fetch) ───────────────────────
function simulateFetch() {
  return CAPTEURS_INITIAL.map((c) => ({
    ...c,
    pm25: parseFloat((Math.random() * 80 + 4).toFixed(1)),
    pm10: parseFloat((Math.random() * 120 + 8).toFixed(1)),
    timestamp: new Date().toISOString(),
  }));
}

async function fetchPollution() {
  try {
    const res = await fetch("/api/zones/pollution");
    if (!res.ok) throw new Error("API indisponible");
    return await res.json();
  } catch {
    // fallback simulation si l'API n'est pas disponible
    return simulateFetch();
  }
}

// ─── Icône SVG Leaflet personnalisée ─────────────────────────────────────────
function buildIcon(L, niveau, pulser = false) {
  const c = niveau.color;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="44" height="54" viewBox="0 0 44 54">
      ${pulser ? `<circle cx="22" cy="22" r="20" fill="${c}" opacity="0.18">
        <animate attributeName="r" values="16;22;16" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.25;0.05;0.25" dur="2s" repeatCount="indefinite"/>
      </circle>` : ""}
      <circle cx="22" cy="22" r="16" fill="${c}" opacity="0.22"/>
      <circle cx="22" cy="22" r="11" fill="${c}" stroke="white" stroke-width="2.5"/>
      <path d="M22 33 L16 43 L22 40 L28 43 Z" fill="${c}"/>
      <circle cx="22" cy="22" r="5" fill="white" opacity="0.9"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [44, 54],
    iconAnchor: [22, 50],
    popupAnchor: [0, -52],
  });
}

// ─── Contenu popup ────────────────────────────────────────────────────────────
function popupHTML(capteur) {
  const n = getNiveau(capteur.pm25);
  const ts = new Date(capteur.timestamp).toLocaleString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
  return `
    <div style="font-family:'DM Sans',sans-serif;min-width:220px;padding:4px 0">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
        <span style="width:10px;height:10px;border-radius:50%;background:${n.color};display:inline-block;flex-shrink:0"></span>
        <strong style="font-size:14px;color:#0f172a">${capteur.nom}</strong>
      </div>
      <div style="background:#f8fafc;border-radius:8px;padding:10px 12px;margin-bottom:8px">
        <div style="font-size:11px;color:#64748b;margin-bottom:2px;text-transform:uppercase;letter-spacing:.05em">Capteur ID</div>
        <div style="font-size:13px;color:#1e293b;font-weight:500;letter-spacing:.03em">${capteur.id}</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
        <div style="background:${n.bg};border-radius:8px;padding:10px;text-align:center">
          <div style="font-size:22px;font-weight:700;color:${n.text}">${capteur.pm25}</div>
          <div style="font-size:10px;color:${n.text};opacity:.8">PM2.5 µg/m³</div>
        </div>
        <div style="background:#f1f5f9;border-radius:8px;padding:10px;text-align:center">
          <div style="font-size:22px;font-weight:700;color:#334155">${capteur.pm10}</div>
          <div style="font-size:10px;color:#64748b">PM10 µg/m³</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;background:${n.bg};border-radius:8px;padding:8px 12px">
        <span style="font-size:12px;font-weight:600;color:${n.text}">${n.label}</span>
        <span style="font-size:10px;color:${n.text};opacity:.75">Seuil OMS</span>
      </div>
      <div style="margin-top:8px;font-size:10px;color:#94a3b8;text-align:center">
        Dernière mesure : ${ts}
      </div>
    </div>`;
}

// ─── Composant principal ─────────────────────────────────────────────────────
export default function PollutionMap() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef({});
  const [capteurs, setCapteurs] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [countdown, setCountdown] = useState(60);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const lRef = useRef(null);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchPollution();
      setCapteurs(data);
      setLastUpdate(new Date());
      setCountdown(60);
      setError(null);
      setLoading(false);
      // Met à jour les marqueurs si la carte existe
      if (lRef.current && mapInstance.current) updateMarkers(lRef.current, data);
    } catch (e) {
      setError("Erreur de chargement");
      setLoading(false);
    }
  }, []);

  function updateMarkers(L, data) {
    data.forEach((c) => {
      const n = getNiveau(c.pm25);
      const icon = buildIcon(L, n, true);
      const popup = L.popup({ maxWidth: 260, className: "respire-popup" }).setContent(popupHTML(c));
      if (markersRef.current[c.id]) {
        markersRef.current[c.id].setIcon(icon);
        markersRef.current[c.id].bindPopup(popup);
      } else {
        const marker = L.marker([c.lat, c.lng], { icon }).bindPopup(popup);
        marker.addTo(mapInstance.current);
        markersRef.current[c.id] = marker;
      }
    });
  }

  useLeaflet((L) => {
    lRef.current = L;
    if (mapInstance.current) return;
    const map = L.map(mapRef.current, {
      center: [14.72, -17.09],
      zoom: 12,
      zoomControl: false,
    });
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);
    mapInstance.current = map;

    // Cercle de zone
    CAPTEURS_INITIAL.forEach((c) => {
      L.circle([c.lat, c.lng], { radius: 1800, color: "#94a3b8", weight: 1, fillColor: "#e2e8f0", fillOpacity: 0.08 }).addTo(map);
    });

    refresh();
  });

  // Polling toutes les 60 secondes
  useEffect(() => {
    const interval = setInterval(refresh, 60000);
    return () => clearInterval(interval);
  }, [refresh]);

  // Countdown visuel
  useEffect(() => {
    const t = setInterval(() => setCountdown((c) => (c <= 1 ? 60 : c - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const stats = capteurs.length
    ? { bon: capteurs.filter(c=>c.pm25<12).length, moyen: capteurs.filter(c=>c.pm25>=12&&c.pm25<35).length,
        mauvais: capteurs.filter(c=>c.pm25>=35&&c.pm25<55).length, danger: capteurs.filter(c=>c.pm25>=55).length }
    : null;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", height: "100vh", display: "flex", flexDirection: "column", background: "#0f172a" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"/>
      <style>{`
        .respire-popup .leaflet-popup-content-wrapper { border-radius: 14px; box-shadow: 0 8px 32px rgba(0,0,0,.18); padding: 4px; border: 1px solid #e2e8f0; }
        .respire-popup .leaflet-popup-tip { background: white; }
        .respire-popup .leaflet-popup-content { margin: 10px 12px; }
        .leaflet-control-zoom a { background: #1e293b !important; color: #cbd5e1 !important; border-color: #334155 !important; }
        .leaflet-control-zoom a:hover { background: #334155 !important; color: white !important; }
        .leaflet-control-attribution { background: rgba(15,23,42,.75) !important; color: #64748b !important; font-size: 10px !important; }
        .leaflet-control-attribution a { color: #94a3b8 !important; }
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.8)} }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>

      {/* ── Header ── */}
      <header style={{ background: "#0f172a", borderBottom: "1px solid #1e293b", padding: "12px 20px", display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#0ea5e9,#38bdf8)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
          <div>
            <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 16, letterSpacing: ".02em" }}>RESPIRE</div>
            <div style={{ color: "#64748b", fontSize: 11 }}>Qualité de l'air · Bargny – Diamniadio – Sébikotane</div>
          </div>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 20 }}>
          {/* Stat capsules */}
          {stats && [
            { label: "Bon", count: stats.bon, color: "#22c55e" },
            { label: "Modéré", count: stats.moyen, color: "#eab308" },
            { label: "Mauvais", count: stats.mauvais, color: "#f97316" },
            { label: "Danger", count: stats.danger, color: "#ef4444" },
          ].map(s => s.count > 0 && (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, display: "inline-block" }}/>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>{s.count} {s.label}</span>
            </div>
          ))}

          {/* Refresh countdown */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#1e293b", borderRadius: 20, padding: "5px 12px", border: "1px solid #334155" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" style={{ animation: loading ? "spin 1s linear infinite" : "none" }}>
              <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16"/>
            </svg>
            <span style={{ fontSize: 11, color: "#38bdf8", fontFamily: "'DM Mono', monospace" }}>
              {loading ? "Chargement…" : `MAJ dans ${countdown}s`}
            </span>
            <button onClick={refresh} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 14, lineHeight: 1, padding: "0 2px" }} title="Rafraîchir maintenant">↻</button>
          </div>

          {lastUpdate && (
            <span style={{ fontSize: 11, color: "#475569", fontFamily: "'DM Mono', monospace" }}>
              {lastUpdate.toLocaleTimeString("fr-FR")}
            </span>
          )}
        </div>
      </header>

      {/* ── Corps : carte + panneau ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Carte Leaflet */}
        <div ref={mapRef} style={{ flex: 1 }}/>

        {/* Panneau latéral capteurs */}
        <aside style={{ width: 280, background: "#0f172a", borderLeft: "1px solid #1e293b", overflowY: "auto", flexShrink: 0, padding: "16px 0" }}>
          <div style={{ padding: "0 16px 12px", borderBottom: "1px solid #1e293b" }}>
            <div style={{ fontSize: 11, color: "#475569", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4 }}>Capteurs actifs</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9" }}>{capteurs.length} / {CAPTEURS_INITIAL.length}</div>
          </div>

          {capteurs.map((c) => {
            const n = getNiveau(c.pm25);
            return (
              <div key={c.id} style={{ padding: "14px 16px", borderBottom: "1px solid #1e293b", cursor: "pointer", transition: "background .15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#1e293b"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                onClick={() => { const m = markersRef.current[c.id]; if (m) { mapInstance.current.setView([c.lat, c.lng], 14); m.openPopup(); } }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ width: 9, height: 9, borderRadius: "50%", background: n.color, display: "inline-block", boxShadow: `0 0 6px ${n.color}` }}/>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{c.nom}</span>
                  </div>
                  <span style={{ fontSize: 10, background: n.bg, color: n.text, padding: "2px 7px", borderRadius: 20, fontWeight: 600 }}>{n.label}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  <div style={{ background: "#1e293b", borderRadius: 8, padding: "8px 10px" }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: n.color, lineHeight: 1 }}>{c.pm25}</div>
                    <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>PM2.5 µg/m³</div>
                  </div>
                  <div style={{ background: "#1e293b", borderRadius: 8, padding: "8px 10px" }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#94a3b8", lineHeight: 1 }}>{c.pm10}</div>
                    <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>PM10 µg/m³</div>
                  </div>
                </div>
                <div style={{ marginTop: 6, fontSize: 10, color: "#475569", fontFamily: "'DM Mono', monospace" }}>
                  {new Date(c.timestamp).toLocaleTimeString("fr-FR")} · {c.id}
                </div>
              </div>
            );
          })}

          {/* Légende OMS */}
          <div style={{ margin: "16px", background: "#1e293b", borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>Seuils OMS — PM2.5</div>
            {[
              { label: "Bon", range: "< 12 µg/m³", color: "#22c55e" },
              { label: "Modéré", range: "12 – 35 µg/m³", color: "#eab308" },
              { label: "Mauvais", range: "35 – 55 µg/m³", color: "#f97316" },
              { label: "Dangereux", range: "> 55 µg/m³", color: "#ef4444" },
            ].map(l => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: l.color, display: "inline-block" }}/>
                  <span style={{ fontSize: 12, color: "#cbd5e1", fontWeight: 500 }}>{l.label}</span>
                </div>
                <span style={{ fontSize: 11, color: "#64748b", fontFamily: "'DM Mono', monospace" }}>{l.range}</span>
              </div>
            ))}
          </div>

          {error && (
            <div style={{ margin: "0 16px", background: "#450a0a", border: "1px solid #7f1d1d", borderRadius: 8, padding: "10px 12px", fontSize: 12, color: "#fca5a5" }}>
              {error} — données simulées affichées
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
