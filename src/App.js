import React, { useState, useEffect, useCallback, useRef } from "react";
import { subscribeToData, saveData } from "./firebase";

/* ═══════════════════════════════════════════════════════
   BABY TRACKER & DEVELOPMENT DASHBOARD
   — Sync temps réel Firebase pour maman & papa —
   ═══════════════════════════════════════════════════════ */

// ─── Default milestones par mois (repères OMS / pédiatriques) ───
const DEFAULT_MILESTONES = {
  1: [
    "Suit du regard un objet en mouvement",
    "Réagit aux sons forts",
    "Lève brièvement la tête sur le ventre",
    "Serre un doigt placé dans sa main",
    "Reconnaît la voix de maman/papa",
    "Émet des petits sons (gazouillis)"
  ],
  2: [
    "Sourire social (sourire en réponse)",
    "Tient la tête plus longtemps sur le ventre",
    "Suit des yeux un visage",
    "Commence à gazouiller",
    "Bouge les bras et jambes de façon symétrique",
    "S'apaise quand on le prend dans les bras"
  ],
  3: [
    "Tient sa tête droite quand il est tenu assis",
    "Ouvre et ferme les mains",
    "Attrape et secoue des jouets",
    "Rit aux éclats",
    "Reconnaît les visages familiers à distance",
    "S'appuie sur les avant-bras sur le ventre"
  ],
  4: [
    "Se retourne du ventre au dos",
    "Tient un jouet et le porte à la bouche",
    "Babille (ba-ba, ma-ma sans sens)",
    "Pousse sur ses jambes quand pieds sur surface dure",
    "Suit un objet des yeux à 180°",
    "Exprime la joie et le mécontentement clairement"
  ],
  5: [
    "Se retourne du dos au ventre",
    "Transfère un objet d'une main à l'autre",
    "Porte ses pieds à la bouche",
    "Distingue les visages familiers des inconnus",
    "Répond à son prénom",
    "Aime jouer à «coucou-caché»"
  ],
  6: [
    "Se tient assis avec un léger appui",
    "Commence la diversification alimentaire",
    "Fait rebondir en position debout (tenu)",
    "Babille avec des syllabes variées",
    "Montre de la curiosité pour les objets",
    "Tend les bras pour être pris"
  ],
  7: [
    "Se tient assis sans soutien quelques secondes",
    "Rampe ou se déplace sur le ventre",
    "Utilise la pince grossière (râteau)",
    "Cherche un objet caché partiellement",
    "Réagit à son prénom systématiquement",
    "Mange des purées texturées"
  ],
  8: [
    "Se tient assis sans soutien de façon stable",
    "Passe de la position assise au ventre",
    "Commence le 4 pattes (ou se déplace)",
    "Dit «mama» ou «papa» sans signification",
    "Tape des mains (bravo)",
    "Attrape de petits objets avec la pince fine"
  ],
  9: [
    "Se met debout en s'agrippant",
    "Fait les marionnettes, au revoir",
    "Comprend le «non»",
    "Pointe du doigt",
    "Mange des morceaux mous",
    "Peut avoir peur des inconnus"
  ],
  10: [
    "Se déplace le long des meubles (cabotage)",
    "Utilise la pince pouce-index fine",
    "Met et enlève des objets d'un contenant",
    "Imite les gestes des adultes",
    "Dit 1-2 mots avec signification",
    "Boit au gobelet avec aide"
  ],
  11: [
    "Se tient debout seul quelques secondes",
    "Empile 2 cubes",
    "Comprend des consignes simples",
    "Montre du doigt ce qu'il veut",
    "Marche tenu par une ou deux mains",
    "Mange avec les doigts de manière autonome"
  ],
  12: [
    "Fait ses premiers pas seul",
    "Dit 3-5 mots avec signification",
    "Comprend ≈50 mots",
    "Boit au gobelet seul",
    "Montre de l'affection (câlins, bisous)",
    "Joue à faire semblant (téléphone, poupée)"
  ],
  13: ["Marche de mieux en mieux", "Vocabulaire en expansion (5-10 mots)", "Empile 3 cubes", "Utilise une cuillère (maladroitement)", "Montre des parties du corps", "Imite les tâches ménagères"],
  14: ["Monte les escaliers à 4 pattes", "Dit «non» avec la tête", "Gribouille avec un crayon", "Enlève ses chaussettes", "Suit des instructions simples", "Joue seul quelques minutes"],
  15: ["Court maladroitement", "Dit 10-15 mots", "Boit au verre seul", "Lance une balle", "Pointe les images dans un livre", "Montre de la frustration clairement"],
  16: ["Monte les marches debout (tenu)", "Commence à combiner 2 mots", "Mange seul à la cuillère", "Aide à s'habiller (lève les bras)", "Reconnaît son reflet", "Joue à côté d'autres enfants"],
  17: ["Marche à reculons", "Vocabulaire de 15-20 mots", "Empile 4-5 cubes", "Trie les formes simples", "Danse sur la musique", "Exprime ses émotions variées"],
  18: ["Court avec assurance", "Combine 2 mots (phrases)", "Connaît ≈50 mots", "Monte/descend les escaliers (tenu)", "Commence le jeu symbolique", "Mange seul proprement"],
  24: ["Saute sur place", "Phrases de 2-3 mots courantes", "Connaît ≈200 mots", "S'habille partiellement seul", "Joue avec d'autres enfants", "Propreté diurne en approche"]
};

const TEETH_MAP = [
  { id: "LCI", name: "Incisive centrale inf. G", pos: "bottom", avg: "6-10m" },
  { id: "RCI", name: "Incisive centrale inf. D", pos: "bottom", avg: "6-10m" },
  { id: "LCS", name: "Incisive centrale sup. G", pos: "top", avg: "8-12m" },
  { id: "RCS", name: "Incisive centrale sup. D", pos: "top", avg: "8-12m" },
  { id: "LLS", name: "Incisive latérale sup. G", pos: "top", avg: "9-13m" },
  { id: "RLS", name: "Incisive latérale sup. D", pos: "top", avg: "9-13m" },
  { id: "LLI", name: "Incisive latérale inf. G", pos: "bottom", avg: "10-16m" },
  { id: "RLI", name: "Incisive latérale inf. D", pos: "bottom", avg: "10-16m" },
  { id: "LM1S", name: "1ère molaire sup. G", pos: "top", avg: "13-19m" },
  { id: "RM1S", name: "1ère molaire sup. D", pos: "top", avg: "13-19m" },
  { id: "LM1I", name: "1ère molaire inf. G", pos: "bottom", avg: "14-18m" },
  { id: "RM1I", name: "1ère molaire inf. D", pos: "bottom", avg: "14-18m" },
  { id: "LCanS", name: "Canine sup. G", pos: "top", avg: "16-22m" },
  { id: "RCanS", name: "Canine sup. D", pos: "top", avg: "16-22m" },
  { id: "LCanI", name: "Canine inf. G", pos: "bottom", avg: "17-23m" },
  { id: "RCanI", name: "Canine inf. D", pos: "bottom", avg: "17-23m" },
  { id: "LM2S", name: "2ème molaire sup. G", pos: "top", avg: "25-33m" },
  { id: "RM2S", name: "2ème molaire sup. D", pos: "top", avg: "25-33m" },
  { id: "LM2I", name: "2ème molaire inf. G", pos: "bottom", avg: "23-31m" },
  { id: "RM2I", name: "2ème molaire inf. D", pos: "bottom", avg: "23-31m" },
];

const FOOD_CATEGORIES = {
  "Légumes": ["Carotte","Courgette","Haricot vert","Patate douce","Potiron","Petit pois","Brocoli","Épinard","Panais","Poireau","Navet","Betterave","Artichaut","Aubergine","Fenouil","Chou-fleur","Tomate","Avocat","Maïs","Concombre","Céleri","Poivron"],
  "Fruits": ["Pomme","Poire","Banane","Pêche","Abricot","Prune","Mangue","Fraise","Myrtille","Framboise","Melon","Pastèque","Kiwi","Orange","Clémentine","Raisin","Cerise","Ananas","Litchi","Papaye","Figue","Datte"],
  "Féculents": ["Riz","Pâtes","Semoule","Pomme de terre","Quinoa","Polenta","Pain","Lentilles","Pois chiches","Boulgour","Flocons d'avoine","Épeautre"],
  "Protéines": ["Poulet","Dinde","Bœuf","Veau","Agneau","Porc","Jambon blanc","Poisson blanc","Saumon","Cabillaud","Sardine","Crevette","Œuf","Tofu"],
  "Laitiers": ["Yaourt nature","Fromage blanc","Petit suisse","Gruyère","Comté","Emmental","Chèvre frais","Kiri","Vache qui rit","Ricotta"],
  "Allergènes": ["Arachides","Fruits à coque","Lait de vache","Œuf","Gluten (blé)","Soja","Poisson","Crustacés","Sésame","Céleri","Moutarde","Lupin","Mollusques"]
};

const CAT_COLORS = {
  "Légumes": "#22C55E", "Fruits": "#F43F5E", "Féculents": "#EAB308",
  "Protéines": "#A855F7", "Laitiers": "#3B82F6", "Allergènes": "#EF4444"
};

const VACCINE_SCHEDULE = [
  { age: "2 mois", vaccines: ["DTCaP-Hib-HepB (1ère dose)", "Pneumocoque (1ère dose)"] },
  { age: "4 mois", vaccines: ["DTCaP-Hib-HepB (2ème dose)", "Pneumocoque (2ème dose)"] },
  { age: "5 mois", vaccines: ["Méningocoque C (1ère dose)"] },
  { age: "11 mois", vaccines: ["DTCaP-Hib-HepB (rappel)", "Pneumocoque (rappel)"] },
  { age: "12 mois", vaccines: ["ROR (1ère dose)", "Méningocoque C (2ème dose)"] },
  { age: "16-18 mois", vaccines: ["ROR (2ème dose)"] },
];

// ─── Default state ───
const defaultState = () => ({
  baby: { name: "", birthDate: "", gender: "boy" },
  bottles: [],
  diapers: [],
  sleep: [],
  foods: {},
  growth: [],
  milestones: JSON.parse(JSON.stringify(DEFAULT_MILESTONES)),
  milestonesChecked: {},
  teeth: {},
  appointments: [],
  notes: [],
  medicines: [],
  baths: [],
  vaccines: {},
  temperature: [],
  setup: false,
  _lastUpdated: null,
  _updatedBy: null
});

// ─── Helpers ───
const fmt = (d) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
const fmtTime = (d) => new Date(d).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
const fmtFull = (d) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
const todayStr = () => { const d = new Date(), pad = n => String(n).padStart(2, "0"); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; };
const nowStr = () => { const d = new Date(), pad = n => String(n).padStart(2, "0"); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

const babyAgeMonths = (bd) => {
  if (!bd) return 0;
  const b = new Date(bd), n = new Date();
  return Math.max(0, (n.getFullYear() - b.getFullYear()) * 12 + n.getMonth() - b.getMonth());
};

const babyAgeText = (bd) => {
  if (!bd) return "";
  const days = Math.floor((new Date() - new Date(bd)) / 86400000);
  if (days < 0) return "Pas encore né";
  if (days < 31) return `${days} jour${days > 1 ? "s" : ""}`;
  const m = Math.floor(days / 30.44);
  const d = Math.round(days - m * 30.44);
  if (m < 24) return `${m} mois${d > 0 ? ` et ${d}j` : ""}`;
  const y = Math.floor(m / 12);
  const rm = m % 12;
  return `${y} an${y > 1 ? "s" : ""}${rm > 0 ? ` et ${rm} mois` : ""}`;
};

const todayItems = (arr) => (arr || []).filter(i => (i.date || i.time || i.start || "").startsWith(todayStr()));

// ─── Shared CSS ───
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
* { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
body { font-family: 'Nunito', sans-serif; background: #FAFAF9; -webkit-font-smoothing: antialiased; overscroll-behavior: none; }
input, textarea, select { font-family: 'Nunito', sans-serif; }
@keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
@keyframes syncPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
::-webkit-scrollbar { width: 3px; height: 3px; }
::-webkit-scrollbar-thumb { background: #ddd; border-radius: 3px; }
`;

// ─── Reusable Components ───
const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(6px)", display: "flex", alignItems: "flex-end", justifyContent: "center", animation: "fadeIn .2s ease" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 500, maxHeight: "88vh", overflow: "auto", padding: "20px 20px 36px", boxShadow: "0 -10px 50px rgba(0,0,0,0.15)", animation: "slideUp .3s cubic-bezier(.16,1,.3,1)" }}>
        <div style={{ width: 36, height: 4, background: "#E5E7EB", borderRadius: 4, margin: "0 auto 18px" }} />
        {title && <h3 style={{ margin: "0 0 18px", fontSize: 19, fontWeight: 800 }}>{title}</h3>}
        {children}
      </div>
    </div>
  );
};

const Input = ({ label, ...props }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#6B7280", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</label>}
    <input {...props} style={{ width: "100%", padding: "11px 14px", borderRadius: 14, border: "2px solid #E5E7EB", fontSize: 15, outline: "none", boxSizing: "border-box", transition: "border-color .2s, box-shadow .2s", ...props.style }}
      onFocus={e => { e.target.style.borderColor = "#A78BFA"; e.target.style.boxShadow = "0 0 0 3px rgba(167,139,250,0.15)"; }}
      onBlur={e => { e.target.style.borderColor = "#E5E7EB"; e.target.style.boxShadow = "none"; }} />
  </div>
);

const Btn = ({ children, variant = "primary", small, full, ...props }) => {
  const styles = {
    primary: { background: "linear-gradient(135deg, #A78BFA 0%, #818CF8 100%)", color: "#fff", boxShadow: "0 4px 14px rgba(129,140,248,0.35)" },
    secondary: { background: "#F5F3FF", color: "#7C3AED", boxShadow: "none" },
    danger: { background: "#FEF2F2", color: "#DC2626", boxShadow: "none" },
    success: { background: "#ECFDF5", color: "#059669", boxShadow: "none" },
    ghost: { background: "transparent", color: "#7C3AED", boxShadow: "none" },
  };
  return (
    <button {...props} style={{
      ...styles[variant], border: "none", borderRadius: 14,
      padding: small ? "8px 14px" : "12px 20px",
      fontSize: small ? 13 : 15, fontWeight: 700, cursor: "pointer",
      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
      transition: "transform .1s, opacity .15s",
      width: full ? "100%" : "auto",
      ...props.style
    }}
      onMouseDown={e => e.currentTarget.style.transform = "scale(0.97)"}
      onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
    >{children}</button>
  );
};

const Chip = ({ children, active, onClick, color = "#A78BFA" }) => (
  <span onClick={onClick} style={{
    display: "inline-flex", alignItems: "center", padding: "7px 14px", borderRadius: 20,
    fontSize: 13, fontWeight: 700, cursor: onClick ? "pointer" : "default",
    background: active ? color : "#F9FAFB", color: active ? "#fff" : "#6B7280",
    border: active ? "none" : "1.5px solid #E5E7EB", transition: "all .2s", whiteSpace: "nowrap"
  }}>{children}</span>
);

const Card = ({ children, onClick, highlighted, style: s }) => (
  <div onClick={onClick} style={{
    background: "#fff", borderRadius: 18, padding: "14px 16px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)", border: highlighted ? "2px solid #C4B5FD" : "1.5px solid #F3F4F6",
    transition: "transform .15s, box-shadow .15s", cursor: onClick ? "pointer" : "default",
    ...(s || {})
  }}
    onMouseEnter={e => onClick && (e.currentTarget.style.transform = "translateY(-1px)")}
    onMouseLeave={e => onClick && (e.currentTarget.style.transform = "")}
  >{children}</div>
);

const IconBtn = ({ onClick, children }) => (
  <span onClick={onClick} style={{ cursor: "pointer", color: "#D1D5DB", display: "inline-flex", padding: 4, borderRadius: 8, transition: "color .15s" }}
    onMouseEnter={e => e.currentTarget.style.color = "#EF4444"}
    onMouseLeave={e => e.currentTarget.style.color = "#D1D5DB"}
  >{children}</span>
);

const SyncBadge = ({ syncing }) => (
  <div style={{ position: "fixed", top: 12, right: 12, zIndex: 999, display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, background: syncing ? "#FEF3C7" : "#ECFDF5", fontSize: 11, fontWeight: 700, color: syncing ? "#D97706" : "#059669", animation: syncing ? "syncPulse 1s infinite" : "none" }}>
    <span style={{ width: 6, height: 6, borderRadius: "50%", background: syncing ? "#F59E0B" : "#10B981" }} />
    {syncing ? "Sync..." : "Connecté"}
  </div>
);

const EmptyState = ({ emoji, text }) => (
  <div style={{ textAlign: "center", padding: "40px 20px", color: "#9CA3AF" }}>
    <div style={{ fontSize: 40, marginBottom: 8 }}>{emoji}</div>
    <div style={{ fontSize: 14, fontWeight: 600 }}>{text}</div>
  </div>
);

// ─── SECTION: Dashboard Home ───
const DashboardHome = ({ data, goTo }) => {
  const age = babyAgeText(data.baby.birthDate);
  const todayB = todayItems(data.bottles);
  const todayD = todayItems(data.diapers);
  const todayS = todayItems(data.sleep);
  const totalMl = todayB.reduce((s, b) => s + (b.amount || 0), 0);
  const teethCount = Object.keys(data.teeth || {}).length;
  const foodCount = Object.keys(data.foods || {}).filter(k => data.foods[k]).length;
  const nextAppt = (data.appointments || []).filter(a => a.date >= todayStr()).sort((a, b) => a.date.localeCompare(b.date))[0];
  const lastGrowth = (data.growth || []).sort((a, b) => b.date.localeCompare(a.date))[0];

  const [alertDismissed, setAlertDismissed] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setAlertDismissed(false), 120000);
    return () => clearInterval(id);
  }, []);
  const now = Date.now();
  const hrsAgo = (ts) => ts ? (now - new Date(ts)) / 3600000 : null;
  const lastB = [...(data.bottles||[])].sort((a,b) => (b.time||"").localeCompare(a.time||""))[0];
  const lastD = [...(data.diapers||[])].sort((a,b) => (b.time||"").localeCompare(a.time||""))[0];
  const ongoingSleep = (data.sleep||[]).find(s => !s.end);
  const hB = hrsAgo(lastB?.time), hD = hrsAgo(lastD?.time), hS = hrsAgo(ongoingSleep?.start);
  const alertMsg = hB > 3 ? `🍼 Dernier biberon il y a ${Math.floor(hB)}h — pensez à noter ?`
    : hD > 3 ? `🧷 Dernier change il y a ${Math.floor(hD)}h`
    : hS > 3 ? `😴 Sieste en cours depuis ${Math.floor(hS)}h`
    : "Tout est à jour ✓";
  const alertWarn = hB > 3 || hD > 3 || hS > 3;

  const cards = [
    { key: "bottles", emoji: "🍼", label: "Biberons", value: `${todayB.length} — ${totalMl} ml`, color: "#818CF8" },
    { key: "diapers", emoji: "🧷", label: "Couches", value: `${todayD.length} changées`, color: "#F59E0B" },
    { key: "sleep", emoji: "😴", label: "Sommeil", value: `${todayS.length} siestes`, color: "#6366F1" },
    { key: "food", emoji: "🥕", label: "Diversification", value: `${foodCount} aliments`, color: "#10B981" },
    { key: "growth", emoji: "📏", label: "Croissance", value: lastGrowth ? `${lastGrowth.weight || "?"}kg · ${lastGrowth.height || "?"}cm` : "—", color: "#EC4899" },
    { key: "teeth", emoji: "🦷", label: "Dents", value: `${teethCount}/20`, color: "#F97316" },
    { key: "milestones", emoji: "🏆", label: "Étapes", value: "Voir progrès", color: "#8B5CF6" },
    { key: "appointments", emoji: "📅", label: "RDV", value: nextAppt ? `${fmt(nextAppt.date)}` : "Aucun prévu", color: "#0EA5E9" },
    { key: "vaccines", emoji: "💉", label: "Vaccins", value: "Calendrier", color: "#14B8A6" },
    { key: "medicines", emoji: "💊", label: "Médicaments", value: `${(data.medicines||[]).length}`, color: "#EF4444" },
    { key: "temperature", emoji: "🌡️", label: "Température", value: (data.temperature||[]).length ? `${data.temperature[data.temperature.length-1].value}°C` : "—", color: "#F97316" },
    { key: "baths", emoji: "🛁", label: "Bains", value: `${todayItems(data.baths).length} aujourd'hui`, color: "#06B6D4" },
    { key: "notes", emoji: "📝", label: "Journal", value: `${(data.notes||[]).length} notes`, color: "#8B5CF6" },
    { key: "pdf", emoji: "📄", label: "Rapport PDF", value: "Exporter le jour", color: "#6366F1" },
  ];

  return (
    <div>
      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #C4B5FD 0%, #A78BFA 35%, #818CF8 70%, #6366F1 100%)", borderRadius: 28, padding: "28px 24px 24px", marginBottom: 20, color: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
        <div style={{ position: "absolute", bottom: -25, left: 20, width: 70, height: 70, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
        <div style={{ fontSize: 12, opacity: 0.85, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>
          {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
        </div>
        <div style={{ fontSize: 30, fontWeight: 900, marginTop: 6 }}>{data.baby.name || "Bébé"} 👶</div>
        {age && <div style={{ fontSize: 15, marginTop: 4, opacity: 0.9, fontWeight: 600 }}>{age}</div>}
      </div>

      {/* Alert banner */}
      {!alertDismissed && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: alertWarn ? "#FFFBEB" : "#F0FDF4", border: `1.5px solid ${alertWarn ? "#FDE68A" : "#86EFAC"}`, borderRadius: 14, padding: "10px 14px", marginBottom: 14 }}>
          <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: alertWarn ? "#92400E" : "#166534" }}>{alertMsg}</span>
          <button onClick={() => setAlertDismissed(true)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#9CA3AF", padding: "0 2px", lineHeight: 1 }}>✕</button>
        </div>
      )}

      {/* Quick stats */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 2 }}>
        {[{ e: "🍼", v: `${totalMl}ml`, k: "bottles" }, { e: "🧷", v: todayD.length, k: "diapers" }, { e: "😴", v: todayS.length, k: "sleep" }, { e: "🦷", v: teethCount, k: "teeth" }].map((s, i) => (
          <div key={i} onClick={() => goTo(s.k)} style={{ flex: "0 0 auto", background: "#fff", borderRadius: 14, padding: "9px 16px", display: "flex", alignItems: "center", gap: 7, boxShadow: "0 1px 4px rgba(0,0,0,0.04)", border: "1.5px solid #F3F4F6", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
            <span style={{ fontSize: 18 }}>{s.e}</span> {s.v}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {cards.map(c => (
          <Card key={c.key} onClick={() => goTo(c.key)}>
            <div style={{ fontSize: 26, marginBottom: 6 }}>{c.emoji}</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#1F2937" }}>{c.label}</div>
            <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, marginTop: 2 }}>{c.value}</div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ─── HOOK: useSwipeDay ───
const useSwipeDay = () => {
  const [dayOffset, setDayOffset] = useState(0);
  const containerRef = useRef(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onStart = (e) => { touchStartX.current = e.touches[0].clientX; touchStartY.current = e.touches[0].clientY; };
    const onEnd = (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      const dy = e.changedTouches[0].clientY - touchStartY.current;
      if (Math.abs(dy) > Math.abs(dx)) return;
      if (Math.abs(dx) < 50) return;
      if (dx < 0) setDayOffset(o => o - 1);
      else setDayOffset(o => Math.min(0, o + 1));
    };
    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchend", onEnd, { passive: true });
    return () => { el.removeEventListener("touchstart", onStart); el.removeEventListener("touchend", onEnd); };
  }, []);

  const pad = n => String(n).padStart(2, "0");
  const offsetDate = (offset) => { const d = new Date(); d.setDate(d.getDate() + offset); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; };
  const dateStr = offsetDate(dayOffset);
  const dateLabel = dayOffset === 0 ? "Aujourd'hui" : new Date(dateStr + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
  const goToday = () => setDayOffset(0);
  const prev = () => setDayOffset(o => o - 1);
  const next = () => setDayOffset(o => Math.min(0, o + 1));
  return { dayOffset, dateStr, dateLabel, containerRef, goToday, prev, next };
};

const DayNav = ({ dateLabel, dayOffset, goToday, prev, next }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#F3F4F6", borderRadius: 12, padding: "8px 14px", marginBottom: 14 }}>
    <button onClick={prev} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, padding: "0 4px", color: "#6B7280" }}>◀</button>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontWeight: 700, fontSize: 14, color: "#374151" }}>{dateLabel}</span>
      {dayOffset !== 0 && <button onClick={goToday} style={{ background: "#6366F1", color: "#fff", border: "none", borderRadius: 8, padding: "3px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Aujourd'hui ↩</button>}
    </div>
    <button onClick={next} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, padding: "0 4px", color: dayOffset === 0 ? "#D1D5DB" : "#6B7280" }} disabled={dayOffset === 0}>▶</button>
  </div>
);

// ─── SECTION: Bottles ───
const BottlesSection = ({ data, update }) => {
  const [modal, setModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [time, setTime] = useState(nowStr());
  const [note, setNote] = useState("");
  const [sleepWarn, setSleepWarn] = useState(false);
  const { dayOffset, dateStr, dateLabel, containerRef, goToday, prev, next } = useSwipeDay();
  const triggerSleepWarn = () => {
    if ((data.sleep||[]).find(s => !s.end)) { setSleepWarn(true); setTimeout(() => setSleepWarn(false), 10000); }
  };
  const quickAdd = (ml) => { update(d => { d.bottles.push({ id: uid(), amount: ml, time: nowStr(), note: "" }); }); triggerSleepWarn(); };
  const add = () => { if (!(Number(amount) > 0)) return; update(d => { d.bottles.push({ id: uid(), amount: Number(amount), time, note }); }); setModal(false); setAmount(""); setNote(""); triggerSleepWarn(); };
  const remove = (id) => update(d => { d.bottles = d.bottles.filter(b => b.id !== id); });
  const dayB = (data.bottles||[]).filter(b => b.time?.startsWith(dateStr)).sort((a, b) => b.time.localeCompare(a.time));
  const olderB = (data.bottles||[]).filter(b => !b.time?.startsWith(todayStr())).sort((a, b) => b.time.localeCompare(a.time));
  const totalMl = dayB.reduce((s, b) => s + (b.amount || 0), 0);

  return (
    <div ref={containerRef}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900 }}>🍼 Biberons</div>
          <div style={{ fontSize: 13, color: "#9CA3AF", fontWeight: 600 }}>{dayB.length} biberon{dayB.length > 1 ? "s" : ""} — {totalMl} ml</div>
        </div>
        <Btn onClick={() => { setTime(nowStr()); setModal(true); }} small>+ Détail</Btn>
      </div>

      <DayNav dateLabel={dateLabel} dayOffset={dayOffset} goToday={goToday} prev={prev} next={next} />

      {dayOffset === 0 && (
        <div style={{ display: "flex", gap: 7, marginBottom: 18, flexWrap: "wrap" }}>
          {[60, 90, 120, 150, 180, 210, 240, 270].map(ml => (
            <Btn key={ml} variant="secondary" small onClick={() => quickAdd(ml)}>{ml}ml</Btn>
          ))}
        </div>
      )}

      {sleepWarn && (
        <div style={{ background: "#FFFBEB", border: "1.5px solid #FDE68A", borderRadius: 14, padding: "12px 14px", marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#92400E", marginBottom: 8 }}>⚠️ Un sommeil est en cours et n'a pas été terminé.</div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn small onClick={() => { update(d => { const s = d.sleep.find(x => !x.end); if (s) s.end = nowStr(); }); setSleepWarn(false); }}>Terminer le sommeil</Btn>
            <Btn small variant="secondary" onClick={() => setSleepWarn(false)}>Ignorer</Btn>
          </div>
        </div>
      )}
      {dayB.length === 0 && <EmptyState emoji="🍼" text={`Aucun biberon — ${dateLabel}`} />}
      {dayB.map(b => (
        <Card key={b.id} style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 24, marginRight: 14 }}>🍼</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 15 }}>{b.amount} ml</div>
            <div style={{ fontSize: 12, color: "#9CA3AF" }}>{fmtTime(b.time)}{b.note ? ` · ${b.note}` : ""}</div>
          </div>
          <IconBtn onClick={() => remove(b.id)}>🗑</IconBtn>
        </Card>
      ))}

      {dayOffset === 0 && olderB.length > 0 && (
        <details style={{ marginTop: 14 }}>
          <summary style={{ fontSize: 13, fontWeight: 700, color: "#9CA3AF", cursor: "pointer", padding: "8px 0" }}>Historique ({olderB.length})</summary>
          {olderB.slice(0, 50).map(b => (
            <div key={b.id} style={{ display: "flex", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #F3F4F6", fontSize: 13 }}>
              <span style={{ flex: 1, fontWeight: 700 }}>{b.amount} ml</span>
              <span style={{ color: "#9CA3AF" }}>{fmt(b.time)} {fmtTime(b.time)}</span>
              <IconBtn onClick={() => remove(b.id)}>🗑</IconBtn>
            </div>
          ))}
        </details>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Ajouter un biberon">
        <Input label="Quantité (ml)" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="120" />
        <Input label="Heure" type="datetime-local" value={time} onChange={e => setTime(e.target.value)} />
        <Input label="Note (optionnel)" value={note} onChange={e => setNote(e.target.value)} placeholder="Refusé après 60ml..." />
        <Btn onClick={add} full style={{ marginTop: 4 }}>Enregistrer</Btn>
      </Modal>
    </div>
  );
};

// ─── SECTION: Diapers ───
const DiapersSection = ({ data, update }) => {
  const [modal, setModal] = useState(false);
  const [modalType, setModalType] = useState("pipi");
  const [time, setTime] = useState(nowStr());
  const [note, setNote] = useState("");
  const [selectedType, setSelectedType] = useState(null);
  const [quantity, setQuantity] = useState(null);
  const [consistency, setConsistency] = useState(null);
  const [color, setColor] = useState(null);
  const [sleepWarn, setSleepWarn] = useState(false);
  const { dayOffset, dateStr, dateLabel, containerRef, goToday, prev, next } = useSwipeDay();
  const triggerSleepWarn = () => {
    if ((data.sleep||[]).find(s => !s.end)) { setSleepWarn(true); setTimeout(() => setSleepWarn(false), 10000); }
  };

  const TYPE_EMOJIS = { pipi: "💦", caca: "💩", mixte: "🧷" };
  const TYPE_LABELS = { pipi: "Pipi", caca: "Caca", mixte: "Mixte" };

  const resetFunnel = () => { setSelectedType(null); setQuantity(null); setConsistency(null); setColor(null); };

  const saveEntry = (t, q, cons, col) => {
    const entry = { id: uid(), type: t, time: nowStr(), note: "" };
    if (q) entry.quantity = q;
    if (cons) entry.consistency = cons;
    if (col) entry.color = col;
    update(d => { d.diapers.push(entry); });
    resetFunnel();
    triggerSleepWarn();
  };

  const handleTypeSelect = (t) => { setSelectedType(t); setQuantity(null); setConsistency(null); setColor(null); };

  const handleQuantity = (q) => {
    if (selectedType === "pipi") { saveEntry("pipi", q, null, null); return; }
    const newQ = q;
    if (selectedType === "mixte" && consistency && color) { saveEntry("mixte", newQ, consistency, color); return; }
    setQuantity(newQ);
  };

  const handleConsistency = (cons) => {
    if (selectedType === "caca" && color) { saveEntry("caca", null, cons, color); return; }
    if (selectedType === "mixte" && quantity && color) { saveEntry("mixte", quantity, cons, color); return; }
    setConsistency(cons);
  };

  const handleColor = (col) => {
    if (selectedType === "caca" && consistency) { saveEntry("caca", null, consistency, col); return; }
    if (selectedType === "mixte" && quantity && consistency) { saveEntry("mixte", quantity, consistency, col); return; }
    setColor(col);
  };

  const add = () => { update(d => { d.diapers.push({ id: uid(), type: modalType, time, note }); }); setModal(false); setNote(""); triggerSleepWarn(); };
  const remove = (id) => update(d => { d.diapers = d.diapers.filter(x => x.id !== id); });
  const todayD = (data.diapers||[]).filter(d => d.time?.startsWith(dateStr)).sort((a, b) => b.time.localeCompare(a.time));

  const diapersLabel = (d) => {
    const parts = [TYPE_LABELS[d.type] || d.type];
    if (d.quantity) parts.push(d.quantity);
    if (d.consistency) parts.push(d.consistency);
    if (d.color) parts.push(d.color);
    return parts.join(" · ");
  };

  const needPipi = selectedType === "pipi" || selectedType === "mixte";
  const needCaca = selectedType === "caca" || selectedType === "mixte";

  return (
    <div ref={containerRef}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900 }}>🧷 Couches</div>
          <div style={{ fontSize: 13, color: "#9CA3AF", fontWeight: 600 }}>{todayD.length} couche{todayD.length > 1 ? "s" : ""}</div>
        </div>
        <Btn onClick={() => { setTime(nowStr()); setModal(true); }} small>+ Détail</Btn>
      </div>

      <DayNav dateLabel={dateLabel} dayOffset={dayOffset} goToday={goToday} prev={prev} next={next} />

      {/* Étapes 1 & 2 : saisie rapide (uniquement pour aujourd'hui) */}
      {dayOffset === 0 && (
        <>
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            {["pipi", "caca", "mixte"].map(t => (
              <button key={t} onClick={() => handleTypeSelect(t)} style={{
                flex: 1, padding: "14px 8px", borderRadius: 14,
                border: `2px solid ${selectedType === t ? "#F59E0B" : "#E5E7EB"}`,
                background: selectedType === t ? "#FEF3C7" : "#F9FAFB",
                cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center",
                gap: 4, fontWeight: 700, fontSize: 13, transition: "all 0.15s"
              }}>
                <span style={{ fontSize: 28 }}>{TYPE_EMOJIS[t]}</span>
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>
          <div style={{
            overflow: "hidden", maxHeight: selectedType ? 320 : 0,
            transition: "max-height 0.3s ease, opacity 0.3s ease",
            opacity: selectedType ? 1 : 0, marginBottom: selectedType ? 16 : 0
          }}>
            <div style={{ background: "#F9FAFB", borderRadius: 14, padding: 14, border: "1.5px solid #E5E7EB" }}>
              {needPipi && (
                <div style={{ marginBottom: needCaca ? 14 : 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", marginBottom: 7, textTransform: "uppercase", letterSpacing: 0.5 }}>Quantité 💦</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["+", "++", "+++"].map(q => (
                      <button key={q} onClick={() => handleQuantity(q)} style={{
                        flex: 1, padding: "10px 0", borderRadius: 10,
                        border: `2px solid ${quantity === q ? "#6366F1" : "#E5E7EB"}`,
                        background: quantity === q ? "#EEF2FF" : "#fff",
                        cursor: "pointer", fontWeight: 800, fontSize: 14, transition: "all 0.15s"
                      }}>{q}</button>
                    ))}
                  </div>
                </div>
              )}
              {needCaca && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", marginBottom: 7, textTransform: "uppercase", letterSpacing: 0.5 }}>Consistance 💩</div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                    {["Dur", "Normal", "Liquide"].map(c => (
                      <button key={c} onClick={() => handleConsistency(c)} style={{
                        flex: 1, padding: "10px 0", borderRadius: 10,
                        border: `2px solid ${consistency === c ? "#F59E0B" : "#E5E7EB"}`,
                        background: consistency === c ? "#FEF3C7" : "#fff",
                        cursor: "pointer", fontWeight: 700, fontSize: 13, transition: "all 0.15s"
                      }}>{c}</button>
                    ))}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", marginBottom: 7, textTransform: "uppercase", letterSpacing: 0.5 }}>Couleur</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["Normal", "Vert", "Jaune", "Noir"].map(c => (
                      <button key={c} onClick={() => handleColor(c)} style={{
                        flex: 1, padding: "10px 0", borderRadius: 10,
                        border: `2px solid ${color === c ? "#6B7280" : "#E5E7EB"}`,
                        background: color === c ? "#F3F4F6" : "#fff",
                        cursor: "pointer", fontWeight: 700, fontSize: 11, transition: "all 0.15s"
                      }}>{c}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {sleepWarn && (
        <div style={{ background: "#FFFBEB", border: "1.5px solid #FDE68A", borderRadius: 14, padding: "12px 14px", marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#92400E", marginBottom: 8 }}>⚠️ Un sommeil est en cours et n'a pas été terminé.</div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn small onClick={() => { update(d => { const s = d.sleep.find(x => !x.end); if (s) s.end = nowStr(); }); setSleepWarn(false); }}>Terminer le sommeil</Btn>
            <Btn small variant="secondary" onClick={() => setSleepWarn(false)}>Ignorer</Btn>
          </div>
        </div>
      )}
      {todayD.length === 0 && <EmptyState emoji="🧷" text={`Aucune couche — ${dateLabel}`} />}
      {todayD.map(d => (
        <Card key={d.id} style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 22, marginRight: 14 }}>{TYPE_EMOJIS[d.type] || "🧷"}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{diapersLabel(d)}</div>
            <div style={{ fontSize: 12, color: "#9CA3AF" }}>{fmtTime(d.time)}{d.note ? ` · ${d.note}` : ""}</div>
          </div>
          <IconBtn onClick={() => remove(d.id)}>🗑</IconBtn>
        </Card>
      ))}

      <Modal open={modal} onClose={() => setModal(false)} title="Couche">
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {["pipi", "caca", "mixte"].map(t => <Chip key={t} active={modalType === t} onClick={() => setModalType(t)} color="#F59E0B">{TYPE_EMOJIS[t]} {TYPE_LABELS[t]}</Chip>)}
        </div>
        <Input label="Heure" type="datetime-local" value={time} onChange={e => setTime(e.target.value)} />
        <Input label="Note" value={note} onChange={e => setNote(e.target.value)} placeholder="Couleur, consistance..." />
        <Btn onClick={add} full>Enregistrer</Btn>
      </Modal>
    </div>
  );
};

// ─── SECTION: Sleep ───
const SleepSection = ({ data, update }) => {
  const [modal, setModal] = useState(false);
  const [start, setStart] = useState(nowStr());
  const [end, setEnd] = useState("");
  const [type, setType] = useState("sieste");
  const { dayOffset, dateStr, dateLabel, containerRef, goToday, prev, next } = useSwipeDay();
  const add = () => { update(d => { d.sleep.push({ id: uid(), start, end: end || null, type }); }); setModal(false); };
  const remove = (id) => update(d => { d.sleep = d.sleep.filter(x => x.id !== id); });
  const ongoing = (data.sleep||[]).find(s => !s.end);
  const dayItems = [...(data.sleep||[])].filter(s => s.start?.startsWith(dateStr)).sort((a, b) => b.start.localeCompare(a.start));
  const dur = (s) => { if (!s.end) return "En cours 💤"; const m = Math.round((new Date(s.end) - new Date(s.start)) / 60000); return m >= 60 ? `${Math.floor(m/60)}h${String(m%60).padStart(2,"0")}` : `${m} min`; };

  return (
    <div ref={containerRef}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 22, fontWeight: 900 }}>😴 Sommeil</div>
        <Btn onClick={() => { setStart(nowStr()); setEnd(""); setModal(true); }} small>+ Manuel</Btn>
      </div>

      <DayNav dateLabel={dateLabel} dayOffset={dayOffset} goToday={goToday} prev={prev} next={next} />

      {dayOffset === 0 && (
        <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
          {!ongoing ? (
            <Btn variant="secondary" full onClick={() => update(d => { d.sleep.push({ id: uid(), start: nowStr(), end: null, type: "sieste" }); })}>💤 Début sieste</Btn>
          ) : (
            <Btn variant="success" full onClick={() => update(d => { const s = d.sleep.find(x => x.id === ongoing.id); if (s) s.end = nowStr(); })}>⏰ Fin sieste ({dur(ongoing)})</Btn>
          )}
        </div>
      )}

      {dayItems.length === 0 && <EmptyState emoji="😴" text={`Aucune sieste — ${dateLabel}`} />}
      {dayItems.map(s => (
        <Card key={s.id} highlighted={!s.end} style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 22, marginRight: 14 }}>{!s.end ? "💤" : s.type === "nuit" ? "🌙" : "😴"}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 14 }}>{dur(s)}</div>
            <div style={{ fontSize: 12, color: "#9CA3AF" }}>{fmt(s.start)} {fmtTime(s.start)}{s.end ? ` → ${fmtTime(s.end)}` : ""}</div>
          </div>
          <IconBtn onClick={() => remove(s.id)}>🗑</IconBtn>
        </Card>
      ))}

      <Modal open={modal} onClose={() => setModal(false)} title="Ajouter sommeil">
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {["sieste", "nuit"].map(t => <Chip key={t} active={type === t} onClick={() => setType(t)} color="#6366F1">{t === "nuit" ? "🌙" : "💤"} {t}</Chip>)}
        </div>
        <Input label="Début" type="datetime-local" value={start} onChange={e => setStart(e.target.value)} />
        <Input label="Fin (vide = en cours)" type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} />
        <Btn onClick={add} full>Enregistrer</Btn>
      </Modal>
    </div>
  );
};

// ─── SECTION: Food ───
const FoodSection = ({ data, update }) => {
  const [cat, setCat] = useState("Légumes");
  const [customModal, setCustomModal] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customCat, setCustomCat] = useState("Légumes");
  const toggle = (name) => update(d => { d.foods[name] ? delete d.foods[name] : d.foods[name] = { date: todayStr(), reaction: "ok" }; });
  const setReaction = (name, r) => update(d => { if (d.foods[name]) d.foods[name].reaction = r; });
  const tried = Object.keys(data.foods||{}).filter(k => data.foods[k]).length;
  const total = Object.values(FOOD_CATEGORIES).flat().length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <div style={{ fontSize: 22, fontWeight: 900 }}>🥕 Diversification</div>
        <Btn onClick={() => setCustomModal(true)} small>+ Perso</Btn>
      </div>
      <div style={{ fontSize: 13, color: "#9CA3AF", fontWeight: 600, marginBottom: 14 }}>{tried}/{total} aliments goûtés</div>

      <div style={{ background: "#F3F4F6", borderRadius: 10, height: 8, marginBottom: 18, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(tried / total) * 100}%`, background: "linear-gradient(90deg, #22C55E, #10B981)", borderRadius: 10, transition: "width .4s" }} />
      </div>

      <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 14, paddingBottom: 2 }}>
        {Object.keys(FOOD_CATEGORIES).map(c => <Chip key={c} active={cat === c} onClick={() => setCat(c)} color={CAT_COLORS[c]}>{c}</Chip>)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {FOOD_CATEGORIES[cat].map(food => {
          const t = !!data.foods?.[food];
          const r = data.foods?.[food]?.reaction;
          const bg = t ? (r === "allergie" ? "#FEF2F2" : r === "refusé" ? "#FFFBEB" : "#F0FDF4") : "#fff";
          const bd = t ? (r === "allergie" ? "#FECACA" : r === "refusé" ? "#FDE68A" : "#86EFAC") : "#F3F4F6";
          return (
            <div key={food} onClick={() => toggle(food)} style={{ padding: "11px 13px", borderRadius: 14, cursor: "pointer", background: bg, border: `2px solid ${bd}`, transition: "all .2s" }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{t ? "✓ " : ""}{food}</div>
              {t && (
                <div style={{ display: "flex", gap: 3, marginTop: 6 }} onClick={e => e.stopPropagation()}>
                  {[["ok","👍"],["refusé","🚫"],["allergie","⚠️"]].map(([rv, em]) => (
                    <span key={rv} onClick={() => setReaction(food, rv)} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 8, fontWeight: 700, cursor: "pointer", background: r === rv ? (rv === "allergie" ? "#EF4444" : rv === "refusé" ? "#F59E0B" : "#10B981") : "#F3F4F6", color: r === rv ? "#fff" : "#6B7280" }}>{em}</span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Modal open={customModal} onClose={() => setCustomModal(false)} title="Ajouter un aliment perso">
        <Input label="Nom" value={customName} onChange={e => setCustomName(e.target.value)} placeholder="Ex: Patisson" />
        <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
          {Object.keys(FOOD_CATEGORIES).map(c => <Chip key={c} active={customCat === c} onClick={() => setCustomCat(c)} color={CAT_COLORS[c]}>{c}</Chip>)}
        </div>
        <Btn onClick={() => { if (customName.trim()) { update(d => { d.foods[customName.trim()] = { date: todayStr(), reaction: "ok", custom: true }; }); setCustomModal(false); setCustomName(""); } }} full>Ajouter</Btn>
      </Modal>
    </div>
  );
};

// ─── SECTION: Growth ───
const GrowthSection = ({ data, update }) => {
  const [modal, setModal] = useState(false);
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [head, setHead] = useState("");
  const [date, setDate] = useState(todayStr());
  const add = () => { update(d => { d.growth.push({ id: uid(), date, weight: Number(weight) || null, height: Number(height) || null, head: Number(head) || null }); }); setModal(false); setWeight(""); setHeight(""); setHead(""); };
  const remove = (id) => update(d => { d.growth = d.growth.filter(x => x.id !== id); });
  const sorted = [...(data.growth||[])].sort((a, b) => b.date.localeCompare(a.date));
  const chartData = [...(data.growth||[])].sort((a, b) => a.date.localeCompare(b.date));
  const maxW = Math.max(...chartData.map(g => g.weight || 0), 1);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 22, fontWeight: 900 }}>📏 Croissance</div>
        <Btn onClick={() => { setDate(todayStr()); setModal(true); }} small>+ Mesure</Btn>
      </div>

      {chartData.length >= 2 && (
        <Card style={{ marginBottom: 16, padding: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#6B7280", marginBottom: 8 }}>📈 Courbe de poids</div>
          <svg viewBox={`0 0 ${Math.max(chartData.length * 60, 200)} 110`} style={{ width: "100%", height: 90 }}>
            <defs><linearGradient id="wg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#A78BFA" stopOpacity="0.3"/><stop offset="100%" stopColor="#A78BFA" stopOpacity="0"/></linearGradient></defs>
            <polygon points={`${25},100 ${chartData.map((g, i) => `${i * 60 + 25},${95 - ((g.weight || 0) / maxW) * 75}`).join(" ")} ${(chartData.length - 1) * 60 + 25},100`} fill="url(#wg)" />
            <polyline points={chartData.map((g, i) => `${i * 60 + 25},${95 - ((g.weight || 0) / maxW) * 75}`).join(" ")} fill="none" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {chartData.map((g, i) => (<g key={i}><circle cx={i * 60 + 25} cy={95 - ((g.weight || 0) / maxW) * 75} r="4" fill="#fff" stroke="#A78BFA" strokeWidth="2.5" /><text x={i * 60 + 25} y={95 - ((g.weight || 0) / maxW) * 75 - 10} textAnchor="middle" fontSize="9" fill="#7C3AED" fontWeight="700">{g.weight}kg</text><text x={i * 60 + 25} y={108} textAnchor="middle" fontSize="7" fill="#9CA3AF">{fmt(g.date)}</text></g>))}
          </svg>
        </Card>
      )}

      {sorted.map(g => (
        <Card key={g.id} style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 14 }}>{fmtFull(g.date)}</div>
            <div style={{ fontSize: 12, color: "#6B7280", display: "flex", gap: 12, marginTop: 4 }}>
              {g.weight && <span>⚖️ {g.weight} kg</span>}
              {g.height && <span>📏 {g.height} cm</span>}
              {g.head && <span>🧠 {g.head} cm</span>}
            </div>
          </div>
          <IconBtn onClick={() => remove(g.id)}>🗑</IconBtn>
        </Card>
      ))}

      <Modal open={modal} onClose={() => setModal(false)} title="Nouvelle mesure">
        <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} />
        <Input label="Poids (kg)" type="number" step="0.01" value={weight} onChange={e => setWeight(e.target.value)} placeholder="6.5" />
        <Input label="Taille (cm)" type="number" step="0.1" value={height} onChange={e => setHeight(e.target.value)} placeholder="67" />
        <Input label="Tour de tête (cm)" type="number" step="0.1" value={head} onChange={e => setHead(e.target.value)} placeholder="43" />
        <Btn onClick={add} full style={{ marginTop: 4 }}>Enregistrer</Btn>
      </Modal>
    </div>
  );
};

// ─── SECTION: Milestones ───
const MilestonesSection = ({ data, update }) => {
  const ageM = babyAgeMonths(data.baby.birthDate);
  const availableMonths = Object.keys(data.milestones || DEFAULT_MILESTONES).map(Number).sort((a, b) => a - b);
  const [month, setMonth] = useState(availableMonths.includes(ageM) ? ageM : availableMonths.find(m => m >= ageM) || availableMonths[0] || 1);
  const toggle = (m, idx) => { const key = `${m}-${idx}`; update(d => { d.milestonesChecked[key] = !d.milestonesChecked[key]; }); };
  const items = (data.milestones || DEFAULT_MILESTONES)[month] || [];
  const checkedN = items.filter((_, i) => data.milestonesChecked?.[`${month}-${i}`]).length;

  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>🏆 Étapes de développement</div>
      <div style={{ fontSize: 13, color: "#9CA3AF", fontWeight: 600, marginBottom: 14 }}>Mois {month} — {checkedN}/{items.length} acquises</div>

      <div style={{ display: "flex", gap: 5, overflowX: "auto", marginBottom: 14, paddingBottom: 4 }}>
        {availableMonths.map(m => {
          const total = ((data.milestones || DEFAULT_MILESTONES)[m] || []).length;
          const done = ((data.milestones || DEFAULT_MILESTONES)[m] || []).filter((_, i) => data.milestonesChecked?.[`${m}-${i}`]).length;
          return (
            <span key={m} onClick={() => setMonth(m)} style={{
              flex: "0 0 auto", minWidth: 38, height: 38, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, fontSize: 13, cursor: "pointer",
              background: month === m ? "#7C3AED" : (total > 0 && done === total) ? "#D1FAE5" : "#F9FAFB",
              color: month === m ? "#fff" : (total > 0 && done === total) ? "#059669" : "#6B7280",
              border: m === ageM && month !== m ? "2px solid #C4B5FD" : "1.5px solid transparent"
            }}>{m}</span>
          );
        })}
      </div>

      <div style={{ background: "#F3F4F6", borderRadius: 10, height: 8, marginBottom: 18, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${items.length ? (checkedN / items.length) * 100 : 0}%`, background: "linear-gradient(90deg, #A78BFA, #7C3AED)", borderRadius: 10, transition: "width .4s" }} />
      </div>

      {items.map((item, i) => {
        const checked = !!data.milestonesChecked?.[`${month}-${i}`];
        return (
          <Card key={i} onClick={() => toggle(month, i)} highlighted={checked} style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 10, marginRight: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, background: checked ? "#7C3AED" : "#F3F4F6", color: checked ? "#fff" : "#D1D5DB", transition: "all .2s", flexShrink: 0 }}>
              {checked ? "✓" : ""}
            </div>
            <div style={{ fontWeight: 600, fontSize: 14, color: checked ? "#7C3AED" : "#374151", textDecoration: checked ? "line-through" : "none", transition: "all .2s" }}>{item}</div>
          </Card>
        );
      })}
    </div>
  );
};

// ─── SECTION: Teeth ───
const TeethSection = ({ data, update }) => {
  const toggle = (id) => update(d => { if (!d.teeth) d.teeth = {}; d.teeth[id] ? delete d.teeth[id] : d.teeth[id] = { date: todayStr() }; });
  const count = Object.keys(data.teeth || {}).length;

  // Ordre anatomique gauche → droite (vue de face)
  // Supérieure : molaire gauche → centrale gauche | centrale droite → molaire droite
  const topOrder = ["LM2S","LM1S","LCanS","LLS","LCS","RCS","RLS","RCanS","RM1S","RM2S"];
  const botOrder = ["LM2I","LM1I","LCanI","LLI","LCI","RCI","RLI","RCanI","RM1I","RM2I"];

  const toothInfo = (id) => TEETH_MAP.find(t => t.id === id) || {};

  // Largeur selon le type de dent
  const tw = (id) => id.includes("M2") ? 38 : id.includes("M1") ? 36 : id.includes("Can") ? 32 : 30;

  const ToothBtn = ({ id, isTop }) => {
    const present = !!data.teeth?.[id];
    const info = toothInfo(id);
    return (
      <div onClick={() => toggle(id)} title={`${info.name} (${info.avg})`} style={{
        width: tw(id), height: 42, cursor: "pointer", flexShrink: 0,
        background: present ? "#FEF3C7" : "#F9FAFB",
        border: `2px solid ${present ? "#FBBF24" : "#E5E7EB"}`,
        borderRadius: isTop ? "6px 6px 14px 14px" : "14px 14px 6px 6px",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: present ? 16 : 13, color: present ? "inherit" : "#D1D5DB",
        transition: "all .2s",
      }}>
        {present ? "🦷" : "·"}
      </div>
    );
  };

  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>🦷 Dents de lait</div>
      <div style={{ fontSize: 13, color: "#9CA3AF", fontWeight: 600, marginBottom: 18 }}>{count}/20 sorties</div>

      <Card style={{ padding: "16px 10px", marginBottom: 16 }}>
        {/* Mâchoire supérieure */}
        <div style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textAlign: "center", marginBottom: 6, letterSpacing: 0.5, textTransform: "uppercase" }}>Mâchoire supérieure</div>
        <div style={{
          display: "flex", justifyContent: "center", gap: 3,
          background: "#FFFBEB", borderRadius: "50px 50px 0 0",
          padding: "12px 8px 14px", borderBottom: "3px solid #FDE68A",
        }}>
          {topOrder.map(id => <ToothBtn key={id} id={id} isTop={true} />)}
        </div>

        {/* Séparation (lèvres/bouche) */}
        <div style={{ height: 16, background: "linear-gradient(to bottom, #FDE68A55, #FCA5A555)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 50, height: 2, background: "#D1D5DB", borderRadius: 2 }} />
        </div>

        {/* Mâchoire inférieure */}
        <div style={{
          display: "flex", justifyContent: "center", gap: 3,
          background: "#FFFBEB", borderRadius: "0 0 50px 50px",
          padding: "14px 8px 12px", borderTop: "3px solid #FDE68A",
        }}>
          {botOrder.map(id => <ToothBtn key={id} id={id} isTop={false} />)}
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textAlign: "center", marginTop: 6, letterSpacing: 0.5, textTransform: "uppercase" }}>Mâchoire inférieure</div>
      </Card>

      <div style={{ fontSize: 12, fontWeight: 700, color: "#6B7280", marginBottom: 8 }}>Liste détaillée</div>
      {TEETH_MAP.map(t => (
        <div key={t.id} onClick={() => toggle(t.id)} style={{ display: "flex", alignItems: "center", padding: "10px 14px", marginBottom: 5, borderRadius: 12, cursor: "pointer", background: data.teeth?.[t.id] ? "#FFFBEB" : "#fff", border: "1.5px solid #F3F4F6", fontSize: 13 }}>
          <span style={{ marginRight: 10, fontSize: 16 }}>{data.teeth?.[t.id] ? "🦷" : "○"}</span>
          <span style={{ flex: 1, fontWeight: 600 }}>{t.name}</span>
          <span style={{ color: "#9CA3AF", fontSize: 11 }}>{t.avg}</span>
          {data.teeth?.[t.id] && <span style={{ fontSize: 10, marginLeft: 8, color: "#10B981", fontWeight: 700 }}>{fmt(data.teeth[t.id].date)}</span>}
        </div>
      ))}
    </div>
  );
};

// ─── SECTION: Appointments ───
const AppointmentsSection = ({ data, update }) => {
  const [modal, setModal] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(todayStr());
  const [time, setTime] = useState("09:00");
  const [doctor, setDoctor] = useState("");
  const [note, setNote] = useState("");
  const [type, setType] = useState("pédiatre");
  const add = () => { update(d => { d.appointments.push({ id: uid(), title, date, time, doctor, note, type }); }); setModal(false); setTitle(""); setDoctor(""); setNote(""); };
  const remove = (id) => update(d => { d.appointments = d.appointments.filter(x => x.id !== id); });
  const upcoming = (data.appointments||[]).filter(a => a.date >= todayStr()).sort((a, b) => a.date.localeCompare(b.date));
  const past = (data.appointments||[]).filter(a => a.date < todayStr()).sort((a, b) => b.date.localeCompare(a.date));
  const emojis = { "pédiatre": "👨‍⚕️", vaccin: "💉", urgence: "🚑", spécialiste: "🏥", autre: "📋" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 22, fontWeight: 900 }}>📅 Rendez-vous</div>
        <Btn onClick={() => setModal(true)} small>+ Nouveau</Btn>
      </div>

      {upcoming.length === 0 && past.length === 0 && <EmptyState emoji="📅" text="Aucun rendez-vous" />}
      {upcoming.map(a => (
        <Card key={a.id} highlighted style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ fontWeight: 800, fontSize: 15 }}>{emojis[a.type] || "📋"} {a.title || a.type}</div>
            <IconBtn onClick={() => remove(a.id)}>🗑</IconBtn>
          </div>
          <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>{fmtFull(a.date)} à {a.time}{a.doctor ? ` · Dr. ${a.doctor}` : ""}</div>
          {a.note && <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>{a.note}</div>}
        </Card>
      ))}

      {past.length > 0 && (
        <details style={{ marginTop: 12 }}>
          <summary style={{ fontSize: 13, fontWeight: 700, color: "#9CA3AF", cursor: "pointer" }}>Passés ({past.length})</summary>
          {past.map(a => (
            <div key={a.id} style={{ padding: "8px 0", borderBottom: "1px solid #F3F4F6", fontSize: 13, display: "flex", justifyContent: "space-between" }}>
              <span><b>{emojis[a.type]} {a.title || a.type}</b> — {fmt(a.date)}</span>
              <IconBtn onClick={() => remove(a.id)}>🗑</IconBtn>
            </div>
          ))}
        </details>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Nouveau RDV">
        <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
          {Object.entries(emojis).map(([t, e]) => <Chip key={t} active={type === t} onClick={() => setType(t)} color="#0EA5E9">{e} {t}</Chip>)}
        </div>
        <Input label="Titre" value={title} onChange={e => setTitle(e.target.value)} placeholder="Visite des 6 mois" />
        <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} />
        <Input label="Heure" type="time" value={time} onChange={e => setTime(e.target.value)} />
        <Input label="Médecin" value={doctor} onChange={e => setDoctor(e.target.value)} placeholder="Dr. Martin" />
        <Input label="Notes" value={note} onChange={e => setNote(e.target.value)} placeholder="Carnet de santé..." />
        <Btn onClick={add} full>Enregistrer</Btn>
      </Modal>
    </div>
  );
};

// ─── SECTION: Vaccines ───
const VaccinesSection = ({ data, update }) => {
  const toggle = (key) => update(d => { if (!d.vaccines) d.vaccines = {}; d.vaccines[key] = d.vaccines[key] ? null : todayStr(); });
  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 16 }}>💉 Calendrier vaccinal</div>
      {VACCINE_SCHEDULE.map((period, pi) => (
        <div key={pi} style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#7C3AED", marginBottom: 8 }}>{period.age}</div>
          {period.vaccines.map((v, vi) => {
            const key = `${pi}-${vi}`;
            const done = !!data.vaccines?.[key];
            return (
              <Card key={key} onClick={() => toggle(key)} highlighted={done} style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
                <div style={{ width: 26, height: 26, borderRadius: 8, marginRight: 12, display: "flex", alignItems: "center", justifyContent: "center", background: done ? "#10B981" : "#F3F4F6", color: "#fff", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{done ? "✓" : ""}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: done ? "#059669" : "#374151" }}>{v}</div>
                  {done && <div style={{ fontSize: 11, color: "#9CA3AF" }}>Fait le {fmt(data.vaccines[key])}</div>}
                </div>
              </Card>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// ─── SECTION: Medicines ───
const MedicinesSection = ({ data, update }) => {
  const [modal, setModal] = useState(false);
  const [name, setName] = useState("");
  const [dose, setDose] = useState("");
  const [time, setTime] = useState(nowStr());
  const [note, setNote] = useState("");
  const add = () => { update(d => { d.medicines.push({ id: uid(), name, dose, time, note }); }); setModal(false); setName(""); setDose(""); setNote(""); };
  const quick = (n) => update(d => { d.medicines.push({ id: uid(), name: n, dose: "", time: nowStr(), note: "" }); });
  const remove = (id) => update(d => { d.medicines = d.medicines.filter(x => x.id !== id); });
  const sorted = [...(data.medicines||[])].sort((a, b) => b.time.localeCompare(a.time));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 22, fontWeight: 900 }}>💊 Médicaments</div>
        <Btn onClick={() => { setTime(nowStr()); setModal(true); }} small>+ Ajouter</Btn>
      </div>
      <div style={{ display: "flex", gap: 7, marginBottom: 18, flexWrap: "wrap" }}>
        {["Doliprane", "Vitamine D", "Fer", "Sérum phy"].map(m => <Btn key={m} variant="secondary" small onClick={() => quick(m)}>{m}</Btn>)}
      </div>
      {sorted.length === 0 && <EmptyState emoji="💊" text="Aucun médicament enregistré" />}
      {sorted.map(m => (
        <Card key={m.id} style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 22, marginRight: 14 }}>💊</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 14 }}>{m.name}{m.dose ? ` — ${m.dose}` : ""}</div>
            <div style={{ fontSize: 12, color: "#9CA3AF" }}>{fmt(m.time)} {fmtTime(m.time)}{m.note ? ` · ${m.note}` : ""}</div>
          </div>
          <IconBtn onClick={() => remove(m.id)}>🗑</IconBtn>
        </Card>
      ))}
      <Modal open={modal} onClose={() => setModal(false)} title="Médicament">
        <Input label="Nom" value={name} onChange={e => setName(e.target.value)} placeholder="Doliprane..." />
        <Input label="Dosage" value={dose} onChange={e => setDose(e.target.value)} placeholder="2.5ml, 1 goutte..." />
        <Input label="Heure" type="datetime-local" value={time} onChange={e => setTime(e.target.value)} />
        <Input label="Note" value={note} onChange={e => setNote(e.target.value)} />
        <Btn onClick={add} full>Enregistrer</Btn>
      </Modal>
    </div>
  );
};

// ─── SECTION: Temperature ───
const TemperatureSection = ({ data, update }) => {
  const [modal, setModal] = useState(false);
  const [value, setValue] = useState("37.0");
  const [time, setTime] = useState(nowStr());
  const [note, setNote] = useState("");
  const add = () => { update(d => { if (!d.temperature) d.temperature = []; d.temperature.push({ id: uid(), value: Number(value), time, note }); }); setModal(false); setNote(""); };
  const remove = (id) => update(d => { d.temperature = (d.temperature||[]).filter(x => x.id !== id); });
  const sorted = [...(data.temperature||[])].sort((a, b) => b.time.localeCompare(a.time));
  const getColor = (v) => v >= 38.5 ? "#EF4444" : v >= 37.5 ? "#F59E0B" : "#10B981";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 22, fontWeight: 900 }}>🌡️ Température</div>
        <Btn onClick={() => { setTime(nowStr()); setModal(true); }} small>+ Mesure</Btn>
      </div>
      {sorted.length === 0 && <EmptyState emoji="🌡️" text="Aucune mesure" />}
      {sorted.map(t => (
        <Card key={t.id} style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
          <div style={{ width: 50, height: 50, borderRadius: 14, background: `${getColor(t.value)}15`, display: "flex", alignItems: "center", justifyContent: "center", marginRight: 14, fontWeight: 900, fontSize: 16, color: getColor(t.value), flexShrink: 0 }}>{t.value}°</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{t.value >= 38.5 ? "🔴 Fièvre" : t.value >= 37.5 ? "🟡 Subfébrile" : "🟢 Normal"}</div>
            <div style={{ fontSize: 12, color: "#9CA3AF" }}>{fmt(t.time)} {fmtTime(t.time)}{t.note ? ` · ${t.note}` : ""}</div>
          </div>
          <IconBtn onClick={() => remove(t.id)}>🗑</IconBtn>
        </Card>
      ))}
      <Modal open={modal} onClose={() => setModal(false)} title="Température">
        <Input label="Température (°C)" type="number" step="0.1" value={value} onChange={e => setValue(e.target.value)} />
        <Input label="Heure" type="datetime-local" value={time} onChange={e => setTime(e.target.value)} />
        <Input label="Note" value={note} onChange={e => setNote(e.target.value)} placeholder="Après Doliprane..." />
        <Btn onClick={add} full>Enregistrer</Btn>
      </Modal>
    </div>
  );
};

// ─── SECTION: Baths ───
const BathsSection = ({ data, update }) => {
  const [modal, setModal] = useState(false);
  const [time, setTime] = useState(nowStr());
  const [temp, setTemp] = useState("37");
  const [note, setNote] = useState("");
  const { dayOffset, dateStr, dateLabel, containerRef, goToday, prev, next } = useSwipeDay();
  const add = () => { update(d => { d.baths.push({ id: uid(), time, temp: Number(temp), note }); }); setModal(false); setNote(""); };
  const remove = (id) => update(d => { d.baths = d.baths.filter(x => x.id !== id); });
  const dayBaths = [...(data.baths||[])].filter(b => b.time?.startsWith(dateStr)).sort((a, b) => b.time.localeCompare(a.time));

  return (
    <div ref={containerRef}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 22, fontWeight: 900 }}>🛁 Bains</div>
        <Btn onClick={() => { setTime(nowStr()); setModal(true); }} small>+ Ajouter</Btn>
      </div>
      <DayNav dateLabel={dateLabel} dayOffset={dayOffset} goToday={goToday} prev={prev} next={next} />
      {dayOffset === 0 && (
        <Btn variant="secondary" full onClick={() => update(d => { d.baths.push({ id: uid(), time: nowStr(), temp: 37, note: "" }); })} style={{ marginBottom: 16 }}>🛁 Bain maintenant (37°C)</Btn>
      )}
      {dayBaths.length === 0 && <EmptyState emoji="🛁" text={`Aucun bain — ${dateLabel}`} />}
      {dayBaths.map(b => (
        <Card key={b.id} style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 22, marginRight: 14 }}>🛁</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 14 }}>{b.temp}°C</div>
            <div style={{ fontSize: 12, color: "#9CA3AF" }}>{fmt(b.time)} {fmtTime(b.time)}{b.note ? ` · ${b.note}` : ""}</div>
          </div>
          <IconBtn onClick={() => remove(b.id)}>🗑</IconBtn>
        </Card>
      ))}
      <Modal open={modal} onClose={() => setModal(false)} title="Bain">
        <Input label="Heure" type="datetime-local" value={time} onChange={e => setTime(e.target.value)} />
        <Input label="Température eau (°C)" type="number" step="0.5" value={temp} onChange={e => setTemp(e.target.value)} />
        <Input label="Note" value={note} onChange={e => setNote(e.target.value)} placeholder="Produit, durée..." />
        <Btn onClick={add} full>Enregistrer</Btn>
      </Modal>
    </div>
  );
};

// ─── SECTION: Notes ───
const NotesSection = ({ data, update }) => {
  const [modal, setModal] = useState(false);
  const [text, setText] = useState("");
  const [mood, setMood] = useState("😊");
  const add = () => { if (!text.trim()) return; update(d => { d.notes.push({ id: uid(), text, mood, date: new Date().toISOString() }); }); setModal(false); setText(""); };
  const remove = (id) => update(d => { d.notes = d.notes.filter(x => x.id !== id); });
  const sorted = [...(data.notes||[])].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 22, fontWeight: 900 }}>📝 Journal</div>
        <Btn onClick={() => setModal(true)} small>+ Écrire</Btn>
      </div>
      {sorted.length === 0 && <EmptyState emoji="📝" text="Écrivez vos premiers souvenirs" />}
      {sorted.map(n => (
        <Card key={n.id} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 700 }}>{n.mood} {fmtFull(n.date)}</span>
            <IconBtn onClick={() => remove(n.id)}>🗑</IconBtn>
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.7, color: "#374151" }}>{n.text}</div>
        </Card>
      ))}
      <Modal open={modal} onClose={() => setModal(false)} title="Nouveau souvenir">
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {["😊","😢","😴","🤒","🎉","❤️","😂","🥰","😤"].map(m => (
            <span key={m} onClick={() => setMood(m)} style={{ fontSize: 24, cursor: "pointer", padding: 4, borderRadius: 8, background: mood === m ? "#F3E8FF" : "transparent" }}>{m}</span>
          ))}
        </div>
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Aujourd'hui, bébé a..."
          style={{ width: "100%", minHeight: 120, padding: "12px 14px", borderRadius: 14, border: "2px solid #E5E7EB", fontSize: 15, fontFamily: "'Nunito', sans-serif", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
        <Btn onClick={add} full style={{ marginTop: 8 }}>Enregistrer</Btn>
      </Modal>
    </div>
  );
};

// ─── SECTION: PDF / Rapport du jour ───
const PdfSection = ({ data }) => {
  const today = todayStr();
  const todayFmt = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const todayBottles = (data.bottles || []).filter(b => b.time?.startsWith(today)).sort((a,b) => a.time.localeCompare(b.time));
  const todayDiapers = (data.diapers || []).filter(d => d.time?.startsWith(today)).sort((a,b) => a.time.localeCompare(b.time));
  const todaySleep   = (data.sleep || []).filter(s => (s.start || "").startsWith(today)).sort((a,b) => a.start.localeCompare(b.start));
  const todayMeds    = (data.medicines || []).filter(m => m.time?.startsWith(today)).sort((a,b) => a.time.localeCompare(b.time));
  const todayTemp    = (data.temperature || []).filter(t => t.time?.startsWith(today)).sort((a,b) => a.time.localeCompare(b.time));
  const todayBaths   = (data.baths || []).filter(b => b.time?.startsWith(today)).sort((a,b) => a.time.localeCompare(b.time));
  const todayNotes   = (data.notes || []).filter(n => n.date?.startsWith(today));
  const todayVax     = VACCINE_SCHEDULE.flatMap((p, pi) => p.vaccines.map((v, vi) => ({ name: v, age: p.age, key: `${pi}-${vi}` }))).filter(v => data.vaccines?.[v.key] === today);
  const todayFoods   = Object.entries(data.foods || {}).filter(([, v]) => v?.date === today);

  const durStr = (s) => { if (!s.end) return "En cours"; const m = Math.round((new Date(s.end) - new Date(s.start)) / 60000); return m >= 60 ? `${Math.floor(m/60)}h${String(m%60).padStart(2,"0")}` : `${m} min`; };

  const hasData = todayBottles.length + todayDiapers.length + todaySleep.length + todayMeds.length + todayTemp.length + todayBaths.length + todayNotes.length + todayVax.length + todayFoods.length > 0;

  const exportPDF = () => {
    let sections = "";

    if (todayBottles.length > 0) {
      const total = todayBottles.reduce((s, b) => s + (b.amount || 0), 0);
      sections += `<h3>🍼 Biberons — ${todayBottles.length} repas · ${total} ml au total</h3>
      <table><tr><th>Heure</th><th>Quantité</th><th>Note</th></tr>
      ${todayBottles.map(b => `<tr><td>${fmtTime(b.time)}</td><td><b>${b.amount} ml</b></td><td>${b.note || "—"}</td></tr>`).join("")}
      </table>`;
    }
    if (todayDiapers.length > 0) {
      sections += `<h3>🧷 Couches — ${todayDiapers.length} au total</h3>
      <table><tr><th>Heure</th><th>Type</th><th>Note</th></tr>
      ${todayDiapers.map(d => { const details = [d.quantity, d.consistency, d.color].filter(Boolean).join(" · "); return `<tr><td>${fmtTime(d.time)}</td><td>${d.type}${details ? ` · ${details}` : ""}</td><td>${d.note || "—"}</td></tr>`; }).join("")}
      </table>`;
    }
    if (todaySleep.length > 0) {
      sections += `<h3>😴 Sommeil</h3>
      <table><tr><th>Début</th><th>Fin</th><th>Durée</th><th>Type</th></tr>
      ${todaySleep.map(s => `<tr><td>${fmtTime(s.start)}</td><td>${s.end ? fmtTime(s.end) : "En cours"}</td><td>${durStr(s)}</td><td>${s.type || "sieste"}</td></tr>`).join("")}
      </table>`;
    }
    if (todayTemp.length > 0) {
      sections += `<h3>🌡️ Températures</h3>
      <table><tr><th>Heure</th><th>Valeur</th><th>Note</th></tr>
      ${todayTemp.map(t => `<tr><td>${fmtTime(t.time)}</td><td><b>${t.value}°C</b></td><td>${t.note || "—"}</td></tr>`).join("")}
      </table>`;
    }
    if (todayMeds.length > 0) {
      sections += `<h3>💊 Médicaments</h3>
      <table><tr><th>Heure</th><th>Médicament</th><th>Dosage</th><th>Note</th></tr>
      ${todayMeds.map(m => `<tr><td>${fmtTime(m.time)}</td><td><b>${m.name}</b></td><td>${m.dose || "—"}</td><td>${m.note || "—"}</td></tr>`).join("")}
      </table>`;
    }
    if (todayBaths.length > 0) {
      sections += `<h3>🛁 Bains</h3>
      <table><tr><th>Heure</th><th>Température eau</th><th>Note</th></tr>
      ${todayBaths.map(b => `<tr><td>${fmtTime(b.time)}</td><td>${b.temp}°C</td><td>${b.note || "—"}</td></tr>`).join("")}
      </table>`;
    }
    if (todayVax.length > 0) {
      sections += `<h3>💉 Vaccins réalisés aujourd'hui</h3>
      <table><tr><th>Vaccin</th><th>Âge prévu</th></tr>
      ${todayVax.map(v => `<tr><td><b>${v.name}</b></td><td>${v.age}</td></tr>`).join("")}
      </table>`;
    }
    if (todayFoods.length > 0) {
      sections += `<h3>🥕 Aliments introduits aujourd'hui</h3>
      <table><tr><th>Aliment</th><th>Réaction</th></tr>
      ${todayFoods.map(([name, v]) => `<tr><td><b>${name}</b></td><td>${v.reaction || "ok"}</td></tr>`).join("")}
      </table>`;
    }
    if (todayNotes.length > 0) {
      sections += `<h3>📝 Notes du jour</h3>
      ${todayNotes.map(n => `<blockquote>${n.mood} ${n.text}</blockquote>`).join("")}`;
    }
    if (!sections) sections = `<p class="empty">Aucune donnée enregistrée aujourd'hui.</p>`;

    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
<title>Rapport ${todayFmt} — ${data.baby.name}</title>
<style>body{font-family:Arial,sans-serif;padding:24px;color:#333;max-width:750px;margin:0 auto;font-size:14px}h1{color:#7C3AED;border-bottom:2px solid #C4B5FD;padding-bottom:10px;margin-bottom:4px;font-size:22px}.subtitle{color:#6B7280;margin-bottom:24px;font-size:13px}h3{color:#374151;margin:20px 0 8px;font-size:15px}table{width:100%;border-collapse:collapse;margin-bottom:4px}th,td{padding:7px 10px;text-align:left;border-bottom:1px solid #F3F4F6;font-size:13px}th{background:#F9FAFB;font-weight:700;color:#6B7280;font-size:11px;text-transform:uppercase;letter-spacing:.5px}blockquote{margin:6px 0;padding:8px 12px;border-left:3px solid #C4B5FD;background:#F5F3FF;border-radius:0 8px 8px 0}.empty{color:#9CA3AF;font-style:italic}footer{margin-top:40px;font-size:11px;color:#9CA3AF;border-top:1px solid #F3F4F6;padding-top:12px;text-align:center}@media print{body{padding:0}}</style>
</head><body>
<h1>Rapport journalier — ${data.baby.name} 👶</h1>
<p class="subtitle">${todayFmt}</p>
${sections}
<footer>Généré par Baby Tracker</footer>
</body></html>`;

    const win = window.open("", "_blank");
    if (win) { win.document.write(html); win.document.close(); setTimeout(() => win.print(), 400); }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ fontSize: 22, fontWeight: 900 }}>📄 Rapport du jour</div>
        {hasData && <Btn onClick={exportPDF} small>🖨️ Imprimer</Btn>}
      </div>
      <div style={{ fontSize: 13, color: "#9CA3AF", fontWeight: 600, marginBottom: 16 }}>
        {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
      </div>

      {!hasData && <EmptyState emoji="📋" text="Aucune donnée enregistrée aujourd'hui" />}

      {todayBottles.length > 0 && (
        <Card style={{ marginBottom: 10 }}>
          <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 6 }}>🍼 Biberons — {todayBottles.reduce((s,b) => s+(b.amount||0), 0)} ml en {todayBottles.length} repas</div>
          {todayBottles.map(b => <div key={b.id} style={{ fontSize: 12, color: "#6B7280" }}>• {fmtTime(b.time)} — {b.amount} ml{b.note ? ` (${b.note})` : ""}</div>)}
        </Card>
      )}
      {todayDiapers.length > 0 && (
        <Card style={{ marginBottom: 10 }}>
          <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 6 }}>🧷 Couches — {todayDiapers.length}</div>
          {todayDiapers.map(d => { const details = [d.quantity, d.consistency, d.color].filter(Boolean).join(" · "); return <div key={d.id} style={{ fontSize: 12, color: "#6B7280" }}>• {fmtTime(d.time)} — {d.type}{details ? ` · ${details}` : ""}{d.note ? ` (${d.note})` : ""}</div>; })}
        </Card>
      )}
      {todaySleep.length > 0 && (
        <Card style={{ marginBottom: 10 }}>
          <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 6 }}>😴 Sommeil</div>
          {todaySleep.map(s => <div key={s.id} style={{ fontSize: 12, color: "#6B7280" }}>• {fmtTime(s.start)}{s.end ? ` → ${fmtTime(s.end)} (${durStr(s)})` : " (en cours)"}</div>)}
        </Card>
      )}
      {todayTemp.length > 0 && (
        <Card style={{ marginBottom: 10 }}>
          <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 6 }}>🌡️ Températures</div>
          {todayTemp.map(t => <div key={t.id} style={{ fontSize: 12, color: "#6B7280" }}>• {fmtTime(t.time)} — {t.value}°C{t.note ? ` (${t.note})` : ""}</div>)}
        </Card>
      )}
      {todayMeds.length > 0 && (
        <Card style={{ marginBottom: 10 }}>
          <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 6 }}>💊 Médicaments</div>
          {todayMeds.map(m => <div key={m.id} style={{ fontSize: 12, color: "#6B7280" }}>• {fmtTime(m.time)} — {m.name}{m.dose ? ` (${m.dose})` : ""}</div>)}
        </Card>
      )}
      {todayBaths.length > 0 && (
        <Card style={{ marginBottom: 10 }}>
          <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 6 }}>🛁 Bains</div>
          {todayBaths.map(b => <div key={b.id} style={{ fontSize: 12, color: "#6B7280" }}>• {fmtTime(b.time)} — {b.temp}°C{b.note ? ` (${b.note})` : ""}</div>)}
        </Card>
      )}
      {todayVax.length > 0 && (
        <Card style={{ marginBottom: 10 }}>
          <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 6 }}>💉 Vaccins</div>
          {todayVax.map(v => <div key={v.key} style={{ fontSize: 12, color: "#6B7280" }}>• {v.name} ({v.age})</div>)}
        </Card>
      )}
      {todayFoods.length > 0 && (
        <Card style={{ marginBottom: 10 }}>
          <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 6 }}>🥕 Aliments introduits</div>
          {todayFoods.map(([name, v]) => <div key={name} style={{ fontSize: 12, color: "#6B7280" }}>• {name} — {v.reaction || "ok"}</div>)}
        </Card>
      )}
      {todayNotes.length > 0 && (
        <Card style={{ marginBottom: 10 }}>
          <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 6 }}>📝 Notes</div>
          {todayNotes.map(n => <div key={n.id} style={{ fontSize: 12, color: "#6B7280" }}>• {n.mood} {n.text.length > 120 ? n.text.slice(0, 120) + "…" : n.text}</div>)}
        </Card>
      )}

      {hasData && <Btn onClick={exportPDF} full style={{ marginTop: 8 }}>🖨️ Imprimer / Exporter en PDF</Btn>}
    </div>
  );
};

// ─── SETUP SCREEN ───
const SetupScreen = ({ onComplete }) => {
  const [name, setName] = useState("");
  const [bd, setBd] = useState("");
  const [gender, setGender] = useState("boy");
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, background: "linear-gradient(180deg, #F5F3FF, #EDE9FE)" }}>
      <div style={{ fontSize: 64, marginBottom: 12, animation: "pulse 2s infinite" }}>👶</div>
      <h1 style={{ fontSize: 28, fontWeight: 900, color: "#4C1D95", marginBottom: 4 }}>Bienvenue !</h1>
      <p style={{ fontSize: 15, color: "#7C3AED", marginBottom: 36, textAlign: "center" }}>Configurons le suivi de votre petit trésor</p>
      <div style={{ width: "100%", maxWidth: 340 }}>
        <Input label="Prénom de bébé" value={name} onChange={e => setName(e.target.value)} placeholder="Lucas" />
        <Input label="Date de naissance" type="date" value={bd} onChange={e => setBd(e.target.value)} />
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#6B7280", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Genre</label>
          <div style={{ display: "flex", gap: 10 }}>
            {[["boy","👦 Garçon"],["girl","👧 Fille"]].map(([v, l]) => (
              <Btn key={v} variant={gender === v ? "primary" : "secondary"} onClick={() => setGender(v)} style={{ flex: 1 }}>{l}</Btn>
            ))}
          </div>
        </div>
        <Btn onClick={() => { if (name && bd) onComplete({ name, birthDate: bd, gender }); }} full style={{ padding: "14px 24px", fontSize: 17 }}>Commencer le suivi ✨</Btn>
      </div>
    </div>
  );
};

// Assure que toutes les clés attendues existent (Firebase peut omettre les tableaux vides)
const sanitize = (val) => {
  const def = defaultState();
  const merged = { ...def, ...(val || {}) };
  ["bottles","diapers","sleep","growth","appointments","notes","medicines","baths","temperature"].forEach(k => {
    if (!Array.isArray(merged[k])) merged[k] = [];
  });
  ["foods","teeth","vaccines","milestonesChecked"].forEach(k => {
    if (!merged[k] || typeof merged[k] !== "object" || Array.isArray(merged[k])) merged[k] = {};
  });
  return merged;
};

// ═══════════════════════════════════════
//  MAIN APP
// ═══════════════════════════════════════
export default function App() {
  const [data, setData] = useState(null);
  const [section, setSection] = useState("home");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(true);
  const saveTimer = useRef(null);
  const ignoreNext = useRef(false);

  // Subscribe to Firebase real-time updates
  useEffect(() => {
    const unsub = subscribeToData((val) => {
      if (ignoreNext.current) { ignoreNext.current = false; return; }
      setData(sanitize(val));
      setLoading(false);
      setSyncing(false);
    });
    return unsub;
  }, []);

  // Update helper with debounced save
  const update = useCallback((fn) => {
    setData(prev => {
      const next = sanitize(JSON.parse(JSON.stringify(prev || {})));
      fn(next);
      next._lastUpdated = new Date().toISOString();
      // Debounced save to Firebase
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        setSyncing(true);
        ignoreNext.current = true;
        saveData(next).then(() => setSyncing(false));
      }, 600);
      return next;
    });
  }, []);

  if (loading) return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F5F3FF" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 52, marginBottom: 12, animation: "pulse 1.5s infinite" }}>👶</div>
          <div style={{ color: "#7C3AED", fontWeight: 800, fontSize: 15 }}>Connexion...</div>
        </div>
      </div>
    </>
  );

  if (!data) return null;

  if (!data.setup) return (
    <>
      <style>{CSS}</style>
      <SetupScreen onComplete={(baby) => {
        const initial = defaultState();
        initial.baby = baby;
        initial.setup = true;
        initial._lastUpdated = new Date().toISOString();
        setData(initial);
        saveData(initial);
      }} />
    </>
  );

  const SECTIONS = {
    home: <DashboardHome data={data} goTo={setSection} />,
    bottles: <BottlesSection data={data} update={update} />,
    diapers: <DiapersSection data={data} update={update} />,
    sleep: <SleepSection data={data} update={update} />,
    food: <FoodSection data={data} update={update} />,
    growth: <GrowthSection data={data} update={update} />,
    milestones: <MilestonesSection data={data} update={update} />,
    teeth: <TeethSection data={data} update={update} />,
    appointments: <AppointmentsSection data={data} update={update} />,
    vaccines: <VaccinesSection data={data} update={update} />,
    medicines: <MedicinesSection data={data} update={update} />,
    temperature: <TemperatureSection data={data} update={update} />,
    baths: <BathsSection data={data} update={update} />,
    notes: <NotesSection data={data} update={update} />,
    pdf: <PdfSection data={data} />,
  };

  const navItems = [
    { key: "bottles", emoji: "🍼", label: "Biberons" },
    { key: "food", emoji: "🥕", label: "Aliments" },
    { key: "home", emoji: "🏠", label: null },
    { key: "milestones", emoji: "🏆", label: "Étapes" },
    { key: "notes", emoji: "📝", label: "Journal" },
  ];

  return (
    <>
      <style>{CSS}</style>
      <SyncBadge syncing={syncing} />

      <div style={{ maxWidth: 500, margin: "0 auto", minHeight: "100vh", background: "#FAFAF9", paddingBottom: 80 }}>
        {section !== "home" && (
          <div style={{ display: "flex", alignItems: "center", padding: "14px 16px", background: "#FAFAF9", position: "sticky", top: 0, zIndex: 100 }}>
            <span style={{ fontWeight: 800, fontSize: 15, color: "#374151" }}>{data.baby.name}</span>
          </div>
        )}

        <div style={{ padding: "0 14px" }}>
          {SECTIONS[section] || <DashboardHome data={data} goTo={setSection} />}
        </div>

        {/* Bottom nav */}
        <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 500, background: "#fff", borderTop: "1.5px solid #F3F4F6", display: "flex", justifyContent: "space-around", alignItems: "flex-end", padding: "8px 0 20px", zIndex: 200 }}>
          {navItems.map(n => {
            if (n.key === "home") return (
              <div key="home" onClick={() => setSection("home")} style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", marginTop: -15 }}>
                <div style={{ width: 54, height: 54, borderRadius: "50%", background: "linear-gradient(135deg, #7C3AED, #6366F1)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(124,58,237,0.45)", transition: "transform .15s", transform: section === "home" ? "scale(1.08)" : "scale(1)" }}>
                  <span style={{ fontSize: 24 }}>🏠</span>
                </div>
              </div>
            );
            return (
              <div key={n.key} onClick={() => setSection(n.key)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, cursor: "pointer", color: section === n.key ? "#7C3AED" : "#9CA3AF", transition: "color .2s", padding: "4px 8px" }}>
                <span style={{ fontSize: 20, transition: "transform .15s", transform: section === n.key ? "scale(1.15)" : "scale(1)" }}>{n.emoji}</span>
                <span style={{ fontSize: 10, fontWeight: 800 }}>{n.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
