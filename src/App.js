import React, { useState, useEffect, useCallback, useRef, createContext, useContext } from "react";
import { subscribeToProfilesMeta, saveProfilesMeta, subscribeToProfileData, saveProfileData, loadData } from "./firebase";

// ─── Theme system ───
const THEMES = {
  light: {
    bg: "#FAFAF9", card: "#fff", border: "#F3F4F6", text: "#1F2937",
    textMuted: "#9CA3AF", subtle: "#F9FAFB", input: "#fff", inputBorder: "#E5E7EB",
    navBg: "#fff", navBorder: "#F3F4F6", dayNavBg: "#F3F4F6", headerBg: "#FAFAF9",
    accentGrad: "linear-gradient(135deg, #7C3AED, #6366F1)",
  },
  dark: {
    bg: "#0F0F14", card: "#1A1A24", border: "#2D2D3A", text: "#F1F0F5",
    textMuted: "#6B7280", subtle: "#1F1F2E", input: "#1F1F2E", inputBorder: "#3D3D50",
    navBg: "#1A1A24", navBorder: "#2D2D3A", dayNavBg: "#1F1F2E", headerBg: "#0F0F14",
    accentGrad: "linear-gradient(135deg, #7C3AED, #6366F1)",
  },
};
const ThemeContext = createContext({ theme: THEMES.light, darkMode: false, toggleDark: () => {} });
const useTheme = () => useContext(ThemeContext);

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
  routines: [],
  customFoods: {},
  exercises: {},
  customExercises: {},
  books: [],
  testedRecipes: {},
  customRecipes: [],
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

// Sleep cross-day: inclut les entrées qui commencent OU se terminent ce jour
const sleepForDay = (sleepArr, dateStr) =>
  (sleepArr || []).filter(s => {
    const startDay = (s.start || "").slice(0, 10);
    const endDay = s.end ? s.end.slice(0, 10) : null;
    return startDay === dateStr || endDay === dateStr;
  });

// Retourne la date ISO du jour précédent
const prevDateStr = (ds) => { const d = new Date(ds + "T12:00:00"); d.setDate(d.getDate() - 1); return d.toISOString().slice(0, 10); };

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
.nav-fixed { padding-bottom: max(20px, env(safe-area-inset-bottom, 20px)); }
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .nav-fixed { padding-bottom: env(safe-area-inset-bottom) !important; }
}
`;

// ─── Reusable Components ───
const Modal = ({ open, onClose, title, children }) => {
  const { theme } = useTheme();
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)", display: "flex", alignItems: "flex-end", justifyContent: "center", animation: "fadeIn .2s ease" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: theme.card, borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 500, maxHeight: "88vh", overflow: "auto", padding: "20px 20px 36px", boxShadow: "0 -10px 50px rgba(0,0,0,0.25)", animation: "slideUp .3s cubic-bezier(.16,1,.3,1)" }}>
        <div style={{ width: 36, height: 4, background: theme.border, borderRadius: 4, margin: "0 auto 18px" }} />
        {title && <h3 style={{ margin: "0 0 18px", fontSize: 19, fontWeight: 800, color: theme.text }}>{title}</h3>}
        {children}
      </div>
    </div>
  );
};

const Input = ({ label, ...props }) => {
  const { theme } = useTheme();
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: theme.textMuted, marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</label>}
      <input {...props} style={{ width: "100%", padding: "11px 14px", borderRadius: 14, border: `2px solid ${theme.inputBorder}`, fontSize: 15, outline: "none", boxSizing: "border-box", background: theme.input, color: theme.text, transition: "border-color .2s, box-shadow .2s", ...props.style }}
        onFocus={e => { e.target.style.borderColor = "#A78BFA"; e.target.style.boxShadow = "0 0 0 3px rgba(167,139,250,0.15)"; }}
        onBlur={e => { e.target.style.borderColor = theme.inputBorder; e.target.style.boxShadow = "none"; }} />
    </div>
  );
};

const Btn = ({ children, variant = "primary", small, full, ...props }) => {
  const { theme } = useTheme();
  const styles = {
    primary: { background: "linear-gradient(135deg, #A78BFA 0%, #818CF8 100%)", color: "#fff", boxShadow: "0 4px 14px rgba(129,140,248,0.35)" },
    secondary: { background: theme.subtle, color: "#7C3AED", boxShadow: "none" },
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

const Chip = ({ children, active, onClick, color = "#A78BFA" }) => {
  const { theme } = useTheme();
  return (
    <span onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", padding: "7px 14px", borderRadius: 20,
      fontSize: 13, fontWeight: 700, cursor: onClick ? "pointer" : "default",
      background: active ? color : theme.subtle, color: active ? "#fff" : theme.textMuted,
      border: active ? "none" : `1.5px solid ${theme.border}`, transition: "all .2s", whiteSpace: "nowrap"
    }}>{children}</span>
  );
};

const Card = ({ children, onClick, highlighted, style: s }) => {
  const { theme } = useTheme();
  return (
    <div onClick={onClick} style={{
      background: theme.card, borderRadius: 18, padding: "14px 16px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: highlighted ? "2px solid #C4B5FD" : `1.5px solid ${theme.border}`,
      transition: "transform .15s, box-shadow .15s", cursor: onClick ? "pointer" : "default",
      ...(s || {})
    }}
      onMouseEnter={e => onClick && (e.currentTarget.style.transform = "translateY(-1px)")}
      onMouseLeave={e => onClick && (e.currentTarget.style.transform = "")}
    >{children}</div>
  );
};

const IconBtn = ({ onClick, children }) => (
  <span onClick={onClick} style={{ cursor: "pointer", color: "#6B7280", display: "inline-flex", padding: 4, borderRadius: 8, transition: "color .15s" }}
    onMouseEnter={e => e.currentTarget.style.color = "#EF4444"}
    onMouseLeave={e => e.currentTarget.style.color = "#6B7280"}
  >{children}</span>
);

const SyncBadge = ({ syncing }) => (
  <div style={{ position: "fixed", top: 12, right: 12, zIndex: 999, display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, background: syncing ? "#FEF3C7" : "#ECFDF5", fontSize: 11, fontWeight: 700, color: syncing ? "#D97706" : "#059669", animation: syncing ? "syncPulse 1s infinite" : "none" }}>
    <span style={{ width: 6, height: 6, borderRadius: "50%", background: syncing ? "#F59E0B" : "#10B981" }} />
    {syncing ? "Sync..." : "Connecté"}
  </div>
);

const EmptyState = ({ emoji, text }) => {
  const { theme } = useTheme();
  return (
    <div style={{ textAlign: "center", padding: "40px 20px", color: theme.textMuted }}>
      <div style={{ fontSize: 40, marginBottom: 8 }}>{emoji}</div>
      <div style={{ fontSize: 14, fontWeight: 600 }}>{text}</div>
    </div>
  );
};

// ─── Profile system ───
const PROFILE_AVATARS = {
  boy:  ["👶","👶🏻","👶🏼","👶🏽","👶🏾","👶🏿","👦","👦🏻","👦🏼","👦🏽","👦🏾","👦🏿"],
  girl: ["👶","👶🏻","👶🏼","👶🏽","👶🏾","👶🏿","👧","👧🏻","👧🏼","👧🏽","👧🏾","👧🏿"],
};
const PROFILE_COLORS = ["#C4B5FD", "#A78BFA", "#F9A8D4", "#FCA5A5", "#86EFAC", "#93C5FD", "#FCD34D", "#6EE7B7"];

const AddProfileModal = ({ onSave, onClose }) => {
  const [name, setName] = useState("");
  const [gender, setGender] = useState("boy");
  const [emoji, setEmoji] = useState("👶");
  const [color, setColor] = useState("#C4B5FD");

  const handleGender = (g) => {
    setGender(g);
    const list = PROFILE_AVATARS[g];
    if (!list.includes(emoji)) setEmoji(list[0]);
  };

  const avatars = PROFILE_AVATARS[gender];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#1A1A24", borderRadius: 24, padding: "28px 24px", width: "100%", maxWidth: 380, boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
        <h3 style={{ color: "#fff", margin: "0 0 22px", fontSize: 19, fontWeight: 800 }}>Nouveau profil</h3>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", color: "rgba(255,255,255,0.45)", fontSize: 11, fontWeight: 700, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Prénom</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Ex : Imran" style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "2px solid #2D2D3A", background: "#0F0F14", color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box" }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", color: "rgba(255,255,255,0.45)", fontSize: 11, fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Genre</label>
          <div style={{ display: "flex", gap: 8 }}>
            {[["boy","👦 Garçon"],["girl","👧 Fille"]].map(([g, label]) => (
              <button key={g} onClick={() => handleGender(g)} style={{ flex: 1, padding: "9px 0", borderRadius: 11, border: `2px solid ${gender === g ? "#A78BFA" : "#2D2D3A"}`, background: gender === g ? "#2D2D4A" : "transparent", color: gender === g ? "#C4B5FD" : "rgba(255,255,255,0.45)", fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all .15s" }}>{label}</button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", color: "rgba(255,255,255,0.45)", fontSize: 11, fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Avatar</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6 }}>
            {avatars.map(em => (
              <span key={em} onClick={() => setEmoji(em)} style={{ height: 40, borderRadius: 10, background: emoji === em ? "#2D2D4A" : "transparent", border: `2px solid ${emoji === em ? "#A78BFA" : "transparent"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, cursor: "pointer" }}>{em}</span>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 26 }}>
          <label style={{ display: "block", color: "rgba(255,255,255,0.45)", fontSize: 11, fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Couleur</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {PROFILE_COLORS.map(c => (
              <span key={c} onClick={() => setColor(c)} style={{ width: 30, height: 30, borderRadius: "50%", background: c, border: color === c ? "3px solid #fff" : "3px solid transparent", boxShadow: color === c ? "0 0 0 2px #A78BFA" : "none", cursor: "pointer" }} />
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", background: "#2D2D3A", color: "rgba(255,255,255,0.55)", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Annuler</button>
          <button onClick={() => { if (name.trim()) onSave({ name: name.trim(), emoji, color }); }} disabled={!name.trim()} style={{ flex: 2, padding: "12px", borderRadius: 12, border: "none", background: name.trim() ? "linear-gradient(135deg,#A78BFA,#818CF8)" : "#2D2D3A", color: name.trim() ? "#fff" : "rgba(255,255,255,0.3)", fontWeight: 700, fontSize: 14, cursor: name.trim() ? "pointer" : "default", transition: "all .2s" }}>Créer le profil</button>
        </div>
      </div>
    </div>
  );
};

const ProfileSelector = ({ profiles, onSelect, onAdd }) => {
  const { darkMode, toggleDark } = useTheme();
  const [showAdd, setShowAdd] = useState(false);
  const lastId = (() => { try { return localStorage.getItem("baby-tracker-last-profile"); } catch { return null; } })();
  const profileList = Object.entries(profiles || {});
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #0D0D18 0%, #1A0533 55%, #0D0D18 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: 6, fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 700, letterSpacing: 3, textTransform: "uppercase" }}>Baby Tracker</div>
      <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 900, marginBottom: 52, textAlign: "center", lineHeight: 1.35, margin: "0 0 52px" }}>
        Qui suivons-nous<br />aujourd'hui ?
      </h1>

      {/* Profiles grid */}
      <div style={{ display: "flex", gap: 28, flexWrap: "wrap", justifyContent: "center", marginBottom: 52, maxWidth: 420 }}>
        {profileList.map(([id, p]) => {
          const isLast = id === lastId;
          return (
            <div key={id} onClick={() => onSelect(id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <div style={{ width: 90, height: 90, borderRadius: 22, background: p.color || "#C4B5FD", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, border: isLast ? "3px solid rgba(255,255,255,0.85)" : "3px solid transparent", boxShadow: isLast ? "0 0 0 2px #A78BFA, 0 8px 28px rgba(167,139,250,0.45)" : "0 6px 20px rgba(0,0,0,0.4)", transition: "transform .15s, box-shadow .15s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.07)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}>
                {p.emoji || "👶"}
              </div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{p.name}</div>
              {isLast && <div style={{ fontSize: 10, color: "#A78BFA", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>Récent</div>}
            </div>
          );
        })}

        {/* Add profile */}
        <div onClick={() => setShowAdd(true)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <div style={{ width: 90, height: 90, borderRadius: 22, background: "rgba(255,255,255,0.05)", border: "2.5px dashed rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, color: "rgba(255,255,255,0.4)", transition: "background .15s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.09)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}>
            +
          </div>
          <div style={{ color: "rgba(255,255,255,0.4)", fontWeight: 700, fontSize: 14 }}>Ajouter</div>
        </div>
      </div>

      {/* Dark mode toggle */}
      <button onClick={toggleDark} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "8px 16px", color: "rgba(255,255,255,0.5)", fontSize: 13, cursor: "pointer", fontWeight: 700 }}>
        {darkMode ? "☀️ Mode clair" : "🌙 Mode sombre"}
      </button>

      {showAdd && (
        <AddProfileModal
          onSave={(meta) => { onAdd(meta); setShowAdd(false); }}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  );
};

// ─── SECTION: Dashboard Home ───
const DashboardHome = ({ data, goTo, onSwitchProfile }) => {
  const { darkMode, toggleDark } = useTheme();
  const age = babyAgeText(data.baby.birthDate);
  const todayB = todayItems(data.bottles);
  const todayD = todayItems(data.diapers);
  const todayS = sleepForDay(data.sleep, todayStr());
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
    { key: "exercises", emoji: "🧘", label: "Éveil", value: (() => { const t = todayStr(); const checks = data.exercises?.[t] || {}; return `${Object.keys(checks).length} faits`; })(), color: "#A78BFA" },
    { key: "books", emoji: "📖", label: "Bibliothèque", value: `${(data.books||[]).length} livre${(data.books||[]).length !== 1 ? "s" : ""}`, color: "#F59E0B" },
    { key: "routines", emoji: "🔄", label: "Routines", value: `${(data.routines||[]).length} routine${(data.routines||[]).length !== 1 ? "s" : ""}`, color: "#7C3AED" },
    { key: "notes", emoji: "📝", label: "Journal", value: `${(data.notes||[]).length} notes`, color: "#8B5CF6" },
    { key: "pdf", emoji: "📄", label: "Rapport PDF", value: "Exporter le jour", color: "#6366F1" },
  ];

  return (
    <div>
      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #C4B5FD 0%, #A78BFA 35%, #818CF8 70%, #6366F1 100%)", borderRadius: 28, padding: "28px 24px 24px", marginBottom: 20, color: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
        <div style={{ position: "absolute", bottom: -25, left: 20, width: 70, height: 70, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
        <div style={{ position: "absolute", top: 14, right: 16, display: "flex", gap: 6 }}>
          {onSwitchProfile && (
            <button onClick={onSwitchProfile} style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)", border: "none", borderRadius: 10, padding: "6px 10px", fontSize: 13, cursor: "pointer", color: "#fff", fontWeight: 700, lineHeight: 1 }}>Changer ↩</button>
          )}
          <button onClick={toggleDark} style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)", border: "none", borderRadius: 10, padding: "6px 10px", fontSize: 16, cursor: "pointer", color: "#fff", fontWeight: 700, lineHeight: 1 }}>
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>
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

const DayNav = ({ dateLabel, dayOffset, goToday, prev, next }) => {
  const { theme } = useTheme();
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: theme.dayNavBg, borderRadius: 12, padding: "8px 14px", marginBottom: 14 }}>
      <button onClick={prev} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, padding: "0 4px", color: theme.textMuted }}>◀</button>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: theme.text }}>{dateLabel}</span>
        {dayOffset !== 0 && <button onClick={goToday} style={{ background: "#6366F1", color: "#fff", border: "none", borderRadius: 8, padding: "3px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Aujourd'hui ↩</button>}
      </div>
      <button onClick={next} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, padding: "0 4px", color: dayOffset === 0 ? theme.border : theme.textMuted }} disabled={dayOffset === 0}>▶</button>
    </div>
  );
};

// ─── SECTION: Bottles ───
const BOTTLE_CONTENTS = [
  { key: "lait",     label: "Lait",     emoji: "🥛" },
  { key: "eau",      label: "Eau",      emoji: "💧" },
  { key: "cereales", label: "Céréales", emoji: "🥣" },
];

const BottlesSection = ({ data, update }) => {
  const { theme } = useTheme();
  const [modal, setModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [time, setTime] = useState(nowStr());
  const [note, setNote] = useState("");
  const [modalContent, setModalContent] = useState("lait");
  const [pendingMl, setPendingMl] = useState(null);
  const [sleepWarn, setSleepWarn] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteVal, setEditingNoteVal] = useState("");
  const contentTimer = useRef(null);
  const { dayOffset, dateStr, dateLabel, containerRef, goToday, prev, next } = useSwipeDay();

  const triggerSleepWarn = () => {
    if ((data.sleep||[]).find(s => !s.end)) { setSleepWarn(true); setTimeout(() => setSleepWarn(false), 10000); }
  };

  const saveBottle = (ml, content) => {
    update(d => { d.bottles.push({ id: uid(), amount: ml, time: nowStr(), note: "", content }); });
    setPendingMl(null);
    clearTimeout(contentTimer.current);
    triggerSleepWarn();
  };

  const handleQuickMl = (ml) => {
    clearTimeout(contentTimer.current);
    setPendingMl(ml);
    contentTimer.current = setTimeout(() => saveBottle(ml, "lait"), 5000);
  };

  const confirmContent = (contentKey) => {
    if (pendingMl) saveBottle(pendingMl, contentKey);
  };

  const openEdit = (b) => {
    setEditId(b.id); setAmount(String(b.amount)); setTime(b.time);
    setNote(b.note || ""); setModalContent(b.content || "lait"); setModal(true);
  };

  const saveBottleNote = (id, val) => {
    update(d => { const b = d.bottles.find(x => x.id === id); if (b) b.note = val.trim(); });
    setEditingNoteId(null);
  };

  const add = () => {
    if (!(Number(amount) > 0)) return;
    if (editId) {
      update(d => { const b = d.bottles.find(x => x.id === editId); if (b) { b.amount = Number(amount); b.time = time; b.note = note; b.content = modalContent; } });
    } else {
      update(d => { d.bottles.push({ id: uid(), amount: Number(amount), time, note, content: modalContent }); });
      triggerSleepWarn();
    }
    setModal(false); setAmount(""); setNote(""); setModalContent("lait"); setEditId(null);
  };

  const remove = (id) => update(d => { d.bottles = d.bottles.filter(b => b.id !== id); });
  const dayB = (data.bottles||[]).filter(b => b.time?.startsWith(dateStr)).sort((a, b) => b.time.localeCompare(a.time));
  const totalMl = dayB.reduce((s, b) => s + (b.amount || 0), 0);

  const LEGACY_CONTENT_LABELS = { "lait+eau": "🥛💧 Lait+Eau" };
  const contentTag = (b) => {
    if (!b.content) return "";
    const c = BOTTLE_CONTENTS.find(x => x.key === b.content);
    if (c) return ` · ${c.emoji} ${c.label}`;
    return LEGACY_CONTENT_LABELS[b.content] ? ` · ${LEGACY_CONTENT_LABELS[b.content]}` : "";
  };

  return (
    <div ref={containerRef}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, color: theme.text }}>🍼 Biberons</div>
          <div style={{ fontSize: 13, color: theme.textMuted, fontWeight: 600 }}>{dayB.length} biberon{dayB.length > 1 ? "s" : ""} — {totalMl} ml</div>
        </div>
        <Btn onClick={() => { setEditId(null); setTime(nowStr()); setModalContent("lait"); setModal(true); }} small>+ Détail</Btn>
      </div>

      <DayNav dateLabel={dateLabel} dayOffset={dayOffset} goToday={goToday} prev={prev} next={next} />

      {dayOffset === 0 && (
        <>
          <div style={{ display: "flex", gap: 7, marginBottom: pendingMl ? 10 : 18, flexWrap: "wrap" }}>
            {[60, 90, 120, 150, 180, 210, 240, 270].map(ml => (
              <Btn key={ml} variant={pendingMl === ml ? "primary" : "secondary"} small onClick={() => handleQuickMl(ml)}>{ml}ml</Btn>
            ))}
          </div>
          {/* Sélecteur contenu (entonnoir) */}
          <div style={{ overflow: "hidden", maxHeight: pendingMl ? 110 : 0, opacity: pendingMl ? 1 : 0, transition: "max-height .3s ease, opacity .25s ease", marginBottom: pendingMl ? 18 : 0 }}>
            <div style={{ background: theme.subtle, borderRadius: 14, padding: "12px 12px 14px", border: `1.5px solid ${theme.border}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: theme.textMuted, marginBottom: 9, textTransform: "uppercase", letterSpacing: 0.5 }}>
                {pendingMl} ml — Contenu ?{" "}
                <span style={{ fontWeight: 500, textTransform: "none", letterSpacing: 0, opacity: 0.7 }}>Lait auto dans 5 s</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {BOTTLE_CONTENTS.map(c => (
                  <button key={c.key} onClick={() => confirmContent(c.key)} style={{
                    flex: 1, padding: "10px 4px", borderRadius: 10,
                    border: `2px solid ${theme.border}`, background: theme.card,
                    cursor: "pointer", fontWeight: 700, fontSize: 11, color: theme.text,
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 3, transition: "all .15s"
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#818CF8"; e.currentTarget.style.background = "#EEF2FF"; e.currentTarget.style.color = "#4338CA"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.background = theme.card; e.currentTarget.style.color = theme.text; }}>
                    <span style={{ fontSize: 20 }}>{c.emoji}</span>
                    {c.label}
                  </button>
                ))}
              </div>
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
      {dayB.length === 0 && <EmptyState emoji="🍼" text={`Aucun biberon — ${dateLabel}`} />}
      {dayB.map(b => (
        <Card key={b.id} onClick={() => openEdit(b)} style={{ marginBottom: 8, cursor: "pointer" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ fontSize: 24, marginRight: 14 }}>🍼</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: theme.text }}>{b.amount} ml{contentTag(b)}</div>
              <div style={{ fontSize: 12, color: theme.textMuted }}>{fmtTime(b.time)}</div>
            </div>
            <span style={{ fontSize: 11, color: theme.textMuted, opacity: 0.5, marginRight: 4 }}>✏️</span>
            <span onClick={e => { e.stopPropagation(); remove(b.id); }}><IconBtn>🗑</IconBtn></span>
          </div>
          {editingNoteId === b.id ? (
            <input autoFocus value={editingNoteVal}
              onChange={e => setEditingNoteVal(e.target.value)}
              onBlur={() => saveBottleNote(b.id, editingNoteVal)}
              onKeyDown={e => { if (e.key === "Enter") e.target.blur(); if (e.key === "Escape") setEditingNoteId(null); }}
              onClick={e => e.stopPropagation()}
              placeholder="Note..."
              style={{ display: "block", width: "100%", marginTop: 6, fontSize: 12, border: "none", borderBottom: `1.5px solid #A78BFA`, outline: "none", background: "transparent", color: theme.text, padding: "2px 0", boxSizing: "border-box", fontFamily: "inherit" }} />
          ) : (
            <div onClick={e => { e.stopPropagation(); setEditingNoteId(b.id); setEditingNoteVal(b.note || ""); }}
              style={{ marginTop: 5, fontSize: 11, color: theme.textMuted, fontStyle: "italic", cursor: "text" }}>
              {b.note || "Ajouter une note..."}
            </div>
          )}
        </Card>
      ))}

      <Modal open={modal} onClose={() => { setModal(false); setEditId(null); }} title={editId ? "Modifier le biberon" : "Ajouter un biberon"}>
        <Input label="Quantité (ml)" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="120" />
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: theme.textMuted, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Contenu</label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {BOTTLE_CONTENTS.map(c => (
              <Chip key={c.key} active={modalContent === c.key} onClick={() => setModalContent(c.key)} color="#818CF8">{c.emoji} {c.label}</Chip>
            ))}
          </div>
        </div>
        <Input label="Heure" type="datetime-local" value={time} onChange={e => setTime(e.target.value)} />
        <Input label="Note (optionnel)" value={note} onChange={e => setNote(e.target.value)} placeholder="Refusé après 60ml..." />
        <Btn onClick={add} full style={{ marginTop: 4 }}>{editId ? "Modifier" : "Enregistrer"}</Btn>
      </Modal>
    </div>
  );
};

// ─── SECTION: Diapers ───
const DiapersSection = ({ data, update }) => {
  const { theme } = useTheme();
  const [modal, setModal] = useState(false);
  const [modalType, setModalType] = useState("pipi");
  const [time, setTime] = useState(nowStr());
  const [note, setNote] = useState("");
  const [selectedType, setSelectedType] = useState(null);
  const [quantity, setQuantity] = useState(null);
  const [consistency, setConsistency] = useState(null);
  const [color, setColor] = useState(null);
  const [sleepWarn, setSleepWarn] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteVal, setEditingNoteVal] = useState("");
  const { dayOffset, dateStr, dateLabel, containerRef, goToday, prev, next } = useSwipeDay();
  const triggerSleepWarn = () => {
    if ((data.sleep||[]).find(s => !s.end)) { setSleepWarn(true); setTimeout(() => setSleepWarn(false), 10000); }
  };

  const saveNote = (id, val) => {
    update(d => { const e = d.diapers.find(x => x.id === id); if (e) e.note = val.trim(); });
    setEditingNoteId(null);
  };

  const TYPE_EMOJIS = { pipi: "💦", caca: "💩", mixte: "💩💧" };
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

  const openEdit = (d) => {
    setEditId(d.id);
    setModalType(d.type);
    setTime(d.time?.slice(0, 16) || nowStr());
    setNote(d.note || "");
    setQuantity(d.quantity || null);
    setConsistency(d.consistency || null);
    setColor(d.color === "Normal" ? "Marron" : d.color || null);
    setModal(true);
  };

  const add = () => {
    if (editId) {
      update(d => {
        const e = d.diapers.find(x => x.id === editId);
        if (e) {
          e.type = modalType; e.time = time; e.note = note;
          e.quantity = (modalType === "pipi" || modalType === "mixte") ? quantity : null;
          e.consistency = (modalType === "caca" || modalType === "mixte") ? consistency : null;
          e.color = (modalType === "caca" || modalType === "mixte") ? color : null;
        }
      });
    } else {
      const entry = { id: uid(), type: modalType, time, note };
      if (modalType === "pipi" || modalType === "mixte") entry.quantity = quantity;
      if (modalType === "caca" || modalType === "mixte") { entry.consistency = consistency; entry.color = color; }
      update(d => { d.diapers.push(entry); });
      triggerSleepWarn();
    }
    setModal(false); setNote(""); setEditId(null);
    setQuantity(null); setConsistency(null); setColor(null);
  };
  const remove = (id) => update(d => { d.diapers = d.diapers.filter(x => x.id !== id); });
  const todayD = (data.diapers||[]).filter(d => d.time?.startsWith(dateStr)).sort((a, b) => b.time.localeCompare(a.time));

  const diapersLabel = (d) => {
    const parts = [TYPE_LABELS[d.type] || d.type];
    if (d.quantity) parts.push(d.quantity);
    if (d.consistency) parts.push(d.consistency);
    if (d.color) parts.push(d.color === "Normal" ? "Marron" : d.color);
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
        <Btn onClick={() => { setEditId(null); setTime(nowStr()); setNote(""); setQuantity(null); setConsistency(null); setColor(null); setModal(true); }} small>+ Détail</Btn>
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
                    {["Marron", "Vert", "Jaune", "Noir"].map(c => (
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
        <Card key={d.id} onClick={() => openEdit(d)} style={{ marginBottom: 8, cursor: "pointer" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ fontSize: 22, marginRight: 14 }}>{TYPE_EMOJIS[d.type] || "🧷"}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: theme.text }}>{diapersLabel(d)}</div>
              <div style={{ fontSize: 12, color: theme.textMuted }}>{fmtTime(d.time)}</div>
            </div>
            <span style={{ fontSize: 11, color: theme.textMuted, opacity: 0.5, marginRight: 4 }}>✏️</span>
            <span onClick={e => { e.stopPropagation(); remove(d.id); }}><IconBtn>🗑</IconBtn></span>
          </div>
          {/* Note inline */}
          {editingNoteId === d.id ? (
            <input
              autoFocus
              value={editingNoteVal}
              onChange={e => setEditingNoteVal(e.target.value)}
              onBlur={() => saveNote(d.id, editingNoteVal)}
              onKeyDown={e => { if (e.key === "Enter") e.target.blur(); if (e.key === "Escape") setEditingNoteId(null); }}
              placeholder="Note..."
              onClick={e => e.stopPropagation()}
              style={{ display: "block", width: "100%", marginTop: 6, fontSize: 12, border: "none", borderBottom: `1.5px solid #A78BFA`, outline: "none", background: "transparent", color: theme.text, padding: "2px 0", boxSizing: "border-box", fontFamily: "inherit" }}
            />
          ) : (
            <div
              onClick={e => { e.stopPropagation(); setEditingNoteId(d.id); setEditingNoteVal(d.note || ""); }}
              style={{ marginTop: 5, fontSize: 11, color: theme.textMuted, fontStyle: "italic", cursor: "text" }}
            >
              {d.note || "Ajouter une note..."}
            </div>
          )}
        </Card>
      ))}

      <Modal open={modal} onClose={() => { setModal(false); setEditId(null); setQuantity(null); setConsistency(null); setColor(null); }} title={editId ? "Modifier la couche" : "Couche"}>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {["pipi", "caca", "mixte"].map(t => <Chip key={t} active={modalType === t} onClick={() => setModalType(t)} color="#F59E0B">{TYPE_EMOJIS[t]} {TYPE_LABELS[t]}</Chip>)}
        </div>
        <Input label="Heure" type="datetime-local" value={time} onChange={e => setTime(e.target.value)} />
        {(modalType === "pipi" || modalType === "mixte") && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: theme.textMuted, marginBottom: 7, textTransform: "uppercase", letterSpacing: 0.5 }}>Quantité 💦</div>
            <div style={{ display: "flex", gap: 8 }}>
              {["+", "++", "+++"].map(q => (
                <button key={q} onClick={() => setQuantity(quantity === q ? null : q)} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `2px solid ${quantity === q ? "#6366F1" : theme.border}`, background: quantity === q ? "#EEF2FF" : theme.card, cursor: "pointer", fontWeight: 800, fontSize: 14, color: theme.text, transition: "all 0.15s" }}>{q}</button>
              ))}
            </div>
          </div>
        )}
        {(modalType === "caca" || modalType === "mixte") && (
          <>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: theme.textMuted, marginBottom: 7, textTransform: "uppercase", letterSpacing: 0.5 }}>Consistance 💩</div>
              <div style={{ display: "flex", gap: 8 }}>
                {["Dur", "Normal", "Liquide"].map(c => (
                  <button key={c} onClick={() => setConsistency(consistency === c ? null : c)} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `2px solid ${consistency === c ? "#F59E0B" : theme.border}`, background: consistency === c ? "#FEF3C7" : theme.card, cursor: "pointer", fontWeight: 700, fontSize: 13, color: theme.text, transition: "all 0.15s" }}>{c}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: theme.textMuted, marginBottom: 7, textTransform: "uppercase", letterSpacing: 0.5 }}>Couleur</div>
              <div style={{ display: "flex", gap: 8 }}>
                {["Marron", "Vert", "Jaune", "Noir"].map(c => (
                  <button key={c} onClick={() => setColor(color === c ? null : c)} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `2px solid ${color === c ? "#6B7280" : theme.border}`, background: color === c ? "#F3F4F6" : theme.card, cursor: "pointer", fontWeight: 700, fontSize: 11, color: theme.text, transition: "all 0.15s" }}>{c}</button>
                ))}
              </div>
            </div>
          </>
        )}
        <Input label="Note" value={note} onChange={e => setNote(e.target.value)} placeholder="Observations..." />
        <Btn onClick={add} full>{editId ? "Modifier" : "Enregistrer"}</Btn>
      </Modal>
    </div>
  );
};

// ─── SECTION: Sleep ───
const SleepSection = ({ data, update }) => {
  const { theme } = useTheme();
  const [modal, setModal] = useState(false);
  const [start, setStart] = useState(nowStr());
  const [end, setEnd] = useState("");
  const [type, setType] = useState("sieste");
  const [note, setNote] = useState("");
  const [editId, setEditId] = useState(null);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteVal, setEditingNoteVal] = useState("");
  const { dayOffset, dateStr, dateLabel, containerRef, goToday, prev, next } = useSwipeDay();

  const isNightHour = (dateTimeStr) => {
    const h = dateTimeStr ? new Date(dateTimeStr).getHours() : new Date().getHours();
    return h >= 20 || h < 7;
  };
  const typeFromHour = (dateTimeStr) => isNightHour(dateTimeStr) ? "nuit" : "sieste";

  const openEdit = (s) => { setEditId(s.id); setStart(s.start); setEnd(s.end || ""); setType(s.type || "sieste"); setNote(s.note || ""); setModal(true); };

  const add = () => {
    if (editId) {
      update(d => { const s = d.sleep.find(x => x.id === editId); if (s) { s.start = start; s.end = end || null; s.type = type; s.note = note; } });
    } else {
      update(d => { d.sleep.push({ id: uid(), start, end: end || null, type, note }); });
    }
    setModal(false); setNote(""); setEditId(null);
  };

  const saveSleepNote = (id, val) => {
    update(d => { const s = d.sleep.find(x => x.id === id); if (s) s.note = val.trim(); });
    setEditingNoteId(null);
  };

  const remove = (id) => update(d => { d.sleep = d.sleep.filter(x => x.id !== id); });
  const ongoing = (data.sleep||[]).find(s => !s.end);
  const isNight = ongoing?.type === "nuit";
  const dayItems = sleepForDay(data.sleep, dateStr).sort((a, b) => b.start.localeCompare(a.start));
  const dur = (s) => { if (!s.end) return "En cours 💤"; const m = Math.round((new Date(s.end) - new Date(s.start)) / 60000); return m >= 60 ? `${Math.floor(m/60)}h${String(m%60).padStart(2,"0")}` : `${m} min`; };

  return (
    <div ref={containerRef}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 22, fontWeight: 900 }}>😴 Sommeil</div>
        <Btn onClick={() => { const t = typeFromHour(null); setEditId(null); setStart(nowStr()); setEnd(""); setType(t); setNote(""); setModal(true); }} small>+ Manuel</Btn>
      </div>

      <DayNav dateLabel={dateLabel} dayOffset={dayOffset} goToday={goToday} prev={prev} next={next} />

      {dayOffset === 0 && (
        <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
          {!ongoing ? (
            <Btn variant="secondary" full onClick={() => { const t = typeFromHour(null); update(d => { d.sleep.push({ id: uid(), start: nowStr(), end: null, type: t, note: "" }); }); }}>
              {isNightHour(null) ? "🌙 Début nuit" : "💤 Début sieste"}
            </Btn>
          ) : (
            <Btn variant="success" full onClick={() => update(d => { const s = d.sleep.find(x => x.id === ongoing.id); if (s) s.end = nowStr(); })}>
              {isNight ? `☀️ Fin de nuit (${dur(ongoing)})` : `⏰ Fin sieste (${dur(ongoing)})`}
            </Btn>
          )}
        </div>
      )}

      {dayItems.length === 0 && <EmptyState emoji="😴" text={`Aucune sieste — ${dateLabel}`} />}
      {dayItems.map(s => {
        const startDay = (s.start || "").slice(0, 10);
        const endDay = s.end ? s.end.slice(0, 10) : null;
        const fromPrev = startDay !== dateStr;
        const toNext = endDay && endDay !== dateStr;
        const crossBadge = fromPrev
          ? (startDay === prevDateStr(dateStr) ? "🌙 Depuis hier soir" : `🌙 Depuis le ${fmt(s.start)}`)
          : toNext
          ? (endDay === (() => { const d = new Date(dateStr + "T12:00:00"); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10); })()
              ? "☀️ Réveil demain matin"
              : `☀️ Réveil le ${fmt(s.end)}`)
          : null;
        return (
        <Card key={s.id} highlighted={!s.end} onClick={() => openEdit(s)} style={{ marginBottom: 8, cursor: "pointer" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ fontSize: 22, marginRight: 14 }}>{!s.end ? (s.type === "nuit" ? "🌙" : "💤") : s.type === "nuit" ? "🌙" : "😴"}</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: theme.text }}>{dur(s)}</div>
                {crossBadge && (
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 6, background: "#EEF2FF", color: "#4338CA" }}>{crossBadge}</span>
                )}
              </div>
              <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 2 }}>{fmt(s.start)} {fmtTime(s.start)}{s.end ? ` → ${fmtTime(s.end)}` : ""}</div>
            </div>
            <span style={{ fontSize: 11, color: theme.textMuted, opacity: 0.5, marginRight: 4 }}>✏️</span>
            <span onClick={e => { e.stopPropagation(); remove(s.id); }}><IconBtn>🗑</IconBtn></span>
          </div>
          {editingNoteId === s.id ? (
            <input autoFocus value={editingNoteVal}
              onChange={e => setEditingNoteVal(e.target.value)}
              onBlur={() => saveSleepNote(s.id, editingNoteVal)}
              onKeyDown={e => { if (e.key === "Enter") e.target.blur(); if (e.key === "Escape") setEditingNoteId(null); }}
              onClick={e => e.stopPropagation()}
              placeholder="Note..."
              style={{ display: "block", width: "100%", marginTop: 6, fontSize: 12, border: "none", borderBottom: `1.5px solid #A78BFA`, outline: "none", background: "transparent", color: theme.text, padding: "2px 0", boxSizing: "border-box", fontFamily: "inherit" }} />
          ) : (
            <div onClick={e => { e.stopPropagation(); setEditingNoteId(s.id); setEditingNoteVal(s.note || ""); }}
              style={{ marginTop: 5, fontSize: 11, color: theme.textMuted, fontStyle: "italic", cursor: "text" }}>
              {s.note || "Ajouter une note..."}
            </div>
          )}
        </Card>
        );
      })}

      <Modal open={modal} onClose={() => { setModal(false); setEditId(null); }} title={editId ? "Modifier le sommeil" : "Ajouter sommeil"}>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {["sieste", "nuit"].map(t => <Chip key={t} active={type === t} onClick={() => setType(t)} color="#6366F1">{t === "nuit" ? "🌙" : "💤"} {t}</Chip>)}
        </div>
        <Input label="Début" type="datetime-local" value={start} onChange={e => { setStart(e.target.value); if (!editId) setType(typeFromHour(e.target.value)); }} />
        <Input label="Fin (vide = en cours)" type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} />
        <Input label="Note (optionnel)" value={note} onChange={e => setNote(e.target.value)} placeholder="Agité, dents..." />
        <Btn onClick={add} full>{editId ? "Modifier" : "Enregistrer"}</Btn>
      </Modal>
    </div>
  );
};

// ─── Baby recipes ───
const BABY_RECIPES = [
  {
    name: "Purée carotte-patate douce", emoji: "🥕", ageMin: 4, basePortions: 2,
    ingredients: [
      { name: "Carotte", qty: 150, unit: "g" },
      { name: "Patate douce", qty: 100, unit: "g" },
      { name: "Eau", qty: 200, unit: "ml" },
    ],
    steps: "Éplucher et couper en dés. Mettre dans le bol avec l'eau. Programme Vapeur 15min. Mixer vitesse 7 pendant 30s. Ajouter un filet d'huile d'olive.",
  },
  {
    name: "Compote pomme-poire", emoji: "🍎", ageMin: 4, basePortions: 3,
    ingredients: [
      { name: "Pomme", qty: 200, unit: "g" },
      { name: "Poire", qty: 150, unit: "g" },
      { name: "Eau", qty: 50, unit: "ml" },
    ],
    steps: "Éplucher, épépiner et couper. Programme Vapeur 12min. Mixer vitesse 5 pendant 20s. Servir tiède ou froid.",
  },
  {
    name: "Purée brocoli-pomme de terre", emoji: "🥦", ageMin: 5, basePortions: 2,
    ingredients: [
      { name: "Brocoli", qty: 150, unit: "g" },
      { name: "Pomme de terre", qty: 100, unit: "g" },
      { name: "Eau", qty: 200, unit: "ml" },
    ],
    steps: "Couper le brocoli en fleurettes, éplucher la pomme de terre. Programme Vapeur 15min. Mixer vitesse 8 pendant 40s.",
  },
  {
    name: "Velouté courgette-semoule", emoji: "🫑", ageMin: 5, basePortions: 2,
    ingredients: [
      { name: "Courgette", qty: 200, unit: "g" },
      { name: "Semoule", qty: 30, unit: "g" },
      { name: "Eau", qty: 150, unit: "ml" },
    ],
    steps: "Couper la courgette. Programme Vapeur 10min. Ajouter la semoule cuite. Mixer vitesse 6 pendant 20s.",
  },
  {
    name: "Purée épinard-riz", emoji: "🥬", ageMin: 6, basePortions: 2,
    ingredients: [
      { name: "Épinard", qty: 150, unit: "g" },
      { name: "Riz", qty: 40, unit: "g" },
      { name: "Eau", qty: 200, unit: "ml" },
    ],
    steps: "Blanchir les épinards. Cuire le riz séparément. Mixer les épinards vitesse 8 pendant 45s. Incorporer le riz et mixer à nouveau vitesse 5.",
  },
  {
    name: "Poulet carotte riz", emoji: "🍗", ageMin: 7, basePortions: 2,
    ingredients: [
      { name: "Poulet", qty: 80, unit: "g" },
      { name: "Carotte", qty: 120, unit: "g" },
      { name: "Riz", qty: 40, unit: "g" },
      { name: "Eau", qty: 250, unit: "ml" },
    ],
    steps: "Couper le poulet et la carotte. Programme Vapeur 20min. Cuire le riz séparément. Tout mixer vitesse 6 pendant 30s.",
  },
  {
    name: "Saumon patate douce", emoji: "🐟", ageMin: 7, basePortions: 2,
    ingredients: [
      { name: "Saumon", qty: 80, unit: "g" },
      { name: "Patate douce", qty: 150, unit: "g" },
      { name: "Eau", qty: 200, unit: "ml" },
    ],
    steps: "Couper le saumon sans arêtes. Éplucher la patate douce. Programme Vapeur 15min. Mixer vitesse 7 pendant 25s. Vérifier l'absence d'arêtes.",
  },
  {
    name: "Banane flocons d'avoine", emoji: "🍌", ageMin: 5, basePortions: 1,
    ingredients: [
      { name: "Banane", qty: 100, unit: "g" },
      { name: "Flocons d'avoine", qty: 30, unit: "g" },
      { name: "Lait", qty: 100, unit: "ml" },
    ],
    steps: "Écraser la banane à la fourchette. Cuire les flocons d'avoine avec le lait (3min micro-ondes). Mélanger les deux.",
  },
  {
    name: "Potiron lentilles corail", emoji: "🎃", ageMin: 6, basePortions: 3,
    ingredients: [
      { name: "Potiron", qty: 200, unit: "g" },
      { name: "Lentilles rouges", qty: 60, unit: "g" },
      { name: "Eau", qty: 300, unit: "ml" },
    ],
    steps: "Couper le potiron. Rincer les lentilles. Programme Vapeur 20min. Mixer vitesse 8 pendant 40s. Assaisonner légèrement.",
  },
  {
    name: "Poireaux pomme de terre", emoji: "🧅", ageMin: 5, basePortions: 2,
    ingredients: [
      { name: "Poireau", qty: 150, unit: "g" },
      { name: "Pomme de terre", qty: 120, unit: "g" },
      { name: "Eau", qty: 200, unit: "ml" },
    ],
    steps: "Couper le poireau (partie verte et blanche). Éplucher la pomme de terre. Programme Vapeur 18min. Mixer vitesse 7 pendant 35s.",
  },
  {
    name: "Compote pêche abricot", emoji: "🍑", ageMin: 4, basePortions: 3,
    ingredients: [
      { name: "Pêche", qty: 180, unit: "g" },
      { name: "Abricot", qty: 120, unit: "g" },
      { name: "Eau", qty: 30, unit: "ml" },
    ],
    steps: "Éplucher et dénoyauter. Programme Vapeur 10min. Mixer vitesse 5 pendant 15s. Parfait servi frais.",
  },
  {
    name: "Haricots verts carotte", emoji: "🫘", ageMin: 5, basePortions: 2,
    ingredients: [
      { name: "Haricots verts", qty: 150, unit: "g" },
      { name: "Carotte", qty: 100, unit: "g" },
      { name: "Eau", qty: 250, unit: "ml" },
    ],
    steps: "Équeter les haricots, couper la carotte. Programme Vapeur 18min. Mixer vitesse 8 pendant 45s pour texture lisse.",
  },
  {
    name: "Bœuf carotte patate douce", emoji: "🥩", ageMin: 8, basePortions: 2,
    ingredients: [
      { name: "Bœuf", qty: 80, unit: "g" },
      { name: "Carotte", qty: 100, unit: "g" },
      { name: "Patate douce", qty: 100, unit: "g" },
      { name: "Eau", qty: 300, unit: "ml" },
    ],
    steps: "Couper le bœuf en petits morceaux. Éplucher et couper les légumes. Programme Vapeur 25min. Mixer vitesse 7 pendant 40s.",
  },
  {
    name: "Mangue banane", emoji: "🥭", ageMin: 5, basePortions: 2,
    ingredients: [
      { name: "Mangue", qty: 150, unit: "g" },
      { name: "Banane", qty: 100, unit: "g" },
    ],
    steps: "Éplucher et couper. Pas besoin de cuisson ! Mixer à froid vitesse 7 pendant 20s. Servir immédiatement.",
  },
  {
    name: "Pois chiches courgette", emoji: "🫛", ageMin: 7, basePortions: 2,
    ingredients: [
      { name: "Pois chiches", qty: 80, unit: "g" },
      { name: "Courgette", qty: 150, unit: "g" },
      { name: "Eau", qty: 150, unit: "ml" },
    ],
    steps: "Utiliser des pois chiches en boîte (rincés). Couper la courgette. Programme Vapeur 10min. Mixer vitesse 8 pendant 50s pour texture homogène.",
  },
  {
    name: "Butternut pomme cannelle", emoji: "🍂", ageMin: 5, basePortions: 2,
    ingredients: [
      { name: "Butternut", qty: 180, unit: "g" },
      { name: "Pomme", qty: 100, unit: "g" },
      { name: "Eau", qty: 200, unit: "ml" },
    ],
    steps: "Éplucher et couper. Programme Vapeur 15min. Une pincée de cannelle (dès 6 mois). Mixer vitesse 7 pendant 30s.",
  },
];

// ─── SECTION: Food ───
const RECIPE_EMOJIS = ["🍲","🥣","🍛","🥗","🍝","🍜","🥘","🍵"];

const FoodSection = ({ data, update }) => {
  const { theme } = useTheme();
  const [view, setView] = useState("aliments");
  const [cat, setCat] = useState("Légumes");
  const [addFoodCat, setAddFoodCat] = useState(null);
  const [customName, setCustomName] = useState("");
  const [recipeModal, setRecipeModal] = useState(null);
  const [portions, setPortions] = useState(1);
  const [recipeFilters, setRecipeFilters] = useState(new Set());
  const [recipeNote, setRecipeNote] = useState("");
  const [recipeTab, setRecipeTab] = useState("all");
  const [createModal, setCreateModal] = useState(false);
  const [editRecipeId, setEditRecipeId] = useState(null);
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("🍲");
  const [newIngredients, setNewIngredients] = useState([{ name: "", qty: "", unit: "g" }]);
  const [newPortions, setNewPortions] = useState(2);
  const [newSteps, setNewSteps] = useState("");

  const toggle = (name) => update(d => { d.foods[name] ? delete d.foods[name] : d.foods[name] = { date: todayStr(), reaction: "ok" }; });
  const setReaction = (name, r) => update(d => { if (d.foods[name]) d.foods[name].reaction = r; });
  const deleteCustomFood = (c, food) => update(d => {
    if (d.customFoods?.[c]) d.customFoods[c] = d.customFoods[c].filter(f => f !== food);
    delete d.foods[food];
  });
  const addCustomFood = () => {
    const name = customName.trim();
    if (!name || !addFoodCat) return;
    update(d => {
      if (!d.customFoods) d.customFoods = {};
      if (!d.customFoods[addFoodCat]) d.customFoods[addFoodCat] = [];
      if (!d.customFoods[addFoodCat].includes(name)) d.customFoods[addFoodCat].push(name);
    });
    setCustomName("");
    setAddFoodCat(null);
  };

  const toggleRecipeFilter = (f) => {
    setRecipeFilters(prev => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f); else next.add(f);
      return next;
    });
  };

  const saveRating = (recipeName, rating, note) => {
    update(d => {
      if (!d.testedRecipes) d.testedRecipes = {};
      d.testedRecipes[recipeName] = { date: todayStr(), rating, note };
    });
  };

  const customRecipes = Array.isArray(data.customRecipes) ? data.customRecipes : [];

  const openCreate = () => {
    setEditRecipeId(null); setNewName(""); setNewEmoji("🍲");
    setNewIngredients([{ name: "", qty: "", unit: "g" }]);
    setNewPortions(2); setNewSteps(""); setCreateModal(true);
  };

  const openEdit = (recipe, e) => {
    e.stopPropagation();
    setEditRecipeId(recipe.id); setNewName(recipe.name); setNewEmoji(recipe.emoji);
    setNewIngredients(recipe.ingredients.map(i => ({ ...i, qty: String(i.qty) })));
    setNewPortions(recipe.basePortions); setNewSteps(recipe.steps || ""); setCreateModal(true);
  };

  const saveCustomRecipe = () => {
    const name = newName.trim();
    if (!name) return;
    const ingredients = newIngredients
      .filter(i => i.name.trim())
      .map(i => ({ name: i.name.trim(), qty: Number(i.qty) || 0, unit: i.unit }));
    if (editRecipeId) {
      update(d => {
        const idx = (d.customRecipes || []).findIndex(r => r.id === editRecipeId);
        if (idx !== -1) d.customRecipes[idx] = { ...d.customRecipes[idx], name, emoji: newEmoji, ingredients, basePortions: newPortions, steps: newSteps.trim() };
      });
    } else {
      update(d => {
        if (!Array.isArray(d.customRecipes)) d.customRecipes = [];
        d.customRecipes.push({ id: uid(), name, emoji: newEmoji, ingredients, basePortions: newPortions, steps: newSteps.trim(), createdAt: todayStr() });
      });
    }
    setCreateModal(false);
  };

  const deleteCustomRecipe = (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Supprimer cette recette ?")) return;
    update(d => { d.customRecipes = (d.customRecipes || []).filter(r => r.id !== id); });
  };

  const updateIngredient = (idx, field, val) => setNewIngredients(prev => prev.map((ing, i) => i === idx ? { ...ing, [field]: val } : ing));
  const addIngredientRow = () => setNewIngredients(prev => [...prev, { name: "", qty: "", unit: "g" }]);
  const removeIngredientRow = (idx) => setNewIngredients(prev => prev.filter((_, i) => i !== idx));

  const tried = Object.keys(data.foods||{}).filter(k => data.foods[k]).length;
  const customTotal = Object.values(data.customFoods||{}).reduce((s, arr) => s + (Array.isArray(arr) ? arr.length : 0), 0);
  const total = Object.values(FOOD_CATEGORIES).flat().length + customTotal;

  const validated = new Set(Object.keys(data.foods||{}).filter(k => data.foods[k]));
  const testedRecipes = data.testedRecipes || {};
  const allRecipePool = [
    ...BABY_RECIPES.map(r => ({ ...r, isCustom: false })),
    ...customRecipes.map(r => ({ ...r, isCustom: true, ageMin: null })),
  ];
  const testedCount = allRecipePool.filter(r => testedRecipes[r.name]).length;

  const RATING_EMOJIS = { loved: "❤️", ok: "👍", refused: "🚫" };
  const RATING_LABELS = { loved: "Adoré", ok: "Ok", refused: "Refusé" };
  const RATING_COLORS = { loved: { bg: "#FEF2F2", border: "#FECACA", text: "#991B1B" }, ok: { bg: "#F0FDF4", border: "#86EFAC", text: "#166534" }, refused: { bg: "#FFF7ED", border: "#FED7AA", text: "#9A3412" } };

  const filteredRecipes = allRecipePool.filter(recipe => {
    if (recipeTab === "predefined" && recipe.isCustom) return false;
    if (recipeTab === "custom" && !recipe.isCustom) return false;
    const realIngs = recipe.ingredients.filter(i => i.name !== "Eau" && i.name !== "Lait");
    if (recipeFilters.has("compatible") && !realIngs.every(i => validated.has(i.name))) return false;
    if (recipeFilters.has("loved") && testedRecipes[recipe.name]?.rating !== "loved") return false;
    if (recipeFilters.has("untested") && testedRecipes[recipe.name]) return false;
    return true;
  });

  const renderFoodItem = (food, isCustom = false) => {
    const t = !!data.foods?.[food];
    const r = data.foods?.[food]?.reaction;
    const bg = t ? (r === "allergie" ? "#FEF2F2" : r === "refusé" ? "#FFFBEB" : "#F0FDF4") : theme.card;
    const bd = t ? (r === "allergie" ? "#FECACA" : r === "refusé" ? "#FDE68A" : "#86EFAC") : isCustom ? "#C4B5FD" : theme.border;
    return (
      <div key={food} onClick={() => toggle(food)} style={{ padding: "11px 13px", borderRadius: 14, cursor: "pointer", background: bg, border: `2px ${isCustom && !t ? "dashed" : "solid"} ${bd}`, transition: "all .2s", position: "relative" }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: theme.text, paddingRight: isCustom ? 18 : 0 }}>
          {t ? "✓ " : ""}{food}
          {isCustom && <span style={{ marginLeft: 5, fontSize: 10, color: "#A78BFA", fontWeight: 800 }}>✎</span>}
        </div>
        {isCustom && (
          <span onClick={e => { e.stopPropagation(); deleteCustomFood(cat, food); }} style={{ position: "absolute", top: 7, right: 8, fontSize: 12, color: "#9CA3AF", cursor: "pointer", lineHeight: 1 }}>✕</span>
        )}
        {t && (
          <div style={{ display: "flex", gap: 3, marginTop: 6 }} onClick={e => e.stopPropagation()}>
            {[["ok","👍"],["refusé","🚫"],["allergie","⚠️"]].map(([rv, em]) => (
              <span key={rv} onClick={() => setReaction(food, rv)} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 8, fontWeight: 700, cursor: "pointer", background: r === rv ? (rv === "allergie" ? "#EF4444" : rv === "refusé" ? "#F59E0B" : "#10B981") : theme.subtle, color: r === rv ? "#fff" : theme.textMuted }}>{em}</span>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 14, color: theme.text }}>{view === "aliments" ? "🥕 Diversification" : "🍳 Recettes"}</div>

      {/* Toggle vue */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18, background: theme.subtle, borderRadius: 12, padding: 4 }}>
        {[["aliments", "🥕 Aliments"], ["cuisine", "🍳 Recettes"]].map(([v, label]) => (
          <button key={v} onClick={() => setView(v)} style={{ flex: 1, padding: "8px 0", borderRadius: 9, border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer", background: view === v ? theme.card : "transparent", color: view === v ? "#7C3AED" : theme.textMuted, boxShadow: view === v ? "0 1px 4px rgba(0,0,0,0.08)" : "none", transition: "all .15s" }}>{label}</button>
        ))}
      </div>

      {view === "aliments" && (
        <>
          <div style={{ fontSize: 13, color: theme.textMuted, fontWeight: 600, marginBottom: 14 }}>{tried}/{total} aliments goûtés</div>
          <div style={{ background: theme.subtle, borderRadius: 10, height: 8, marginBottom: 18, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${total > 0 ? (tried / total) * 100 : 0}%`, background: "linear-gradient(90deg, #22C55E, #10B981)", borderRadius: 10, transition: "width .4s" }} />
          </div>
          <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 14, paddingBottom: 2 }}>
            {Object.keys(FOOD_CATEGORIES).map(c => <Chip key={c} active={cat === c} onClick={() => setCat(c)} color={CAT_COLORS[c]}>{c}</Chip>)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {FOOD_CATEGORIES[cat].map(food => renderFoodItem(food, false))}
            {(data.customFoods?.[cat] || []).map(food => renderFoodItem(food, true))}
            {/* Bouton + Ajouter en bas de la grille */}
            <div onClick={() => { setAddFoodCat(cat); setCustomName(""); }} style={{ padding: "11px 13px", borderRadius: 14, cursor: "pointer", border: `2px dashed ${theme.border}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: theme.textMuted, fontWeight: 700, fontSize: 13, transition: "border-color .2s, color .2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#A78BFA"; e.currentTarget.style.color = "#A78BFA"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textMuted; }}>
              + Ajouter
            </div>
          </div>
        </>
      )}

      {view === "cuisine" && (
        <>
          {/* Tab toggle */}
          <div style={{ display: "flex", gap: 6, marginBottom: 12, background: theme.subtle, borderRadius: 12, padding: 4 }}>
            {[["all","📖 Toutes"],["predefined","🍳 Prédéfinies"],["custom","✏️ Mes recettes"]].map(([v, label]) => (
              <button key={v} onClick={() => setRecipeTab(v)} style={{ flex: 1, padding: "7px 0", borderRadius: 9, border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer", background: recipeTab === v ? theme.card : "transparent", color: recipeTab === v ? "#7C3AED" : theme.textMuted, boxShadow: recipeTab === v ? "0 1px 4px rgba(0,0,0,0.08)" : "none", transition: "all .15s" }}>{label}</button>
            ))}
          </div>

          {/* Compteur + bouton créer + filtres */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ fontSize: 13, color: theme.textMuted, fontWeight: 600 }}>{testedCount}/{allRecipePool.length} recettes testées</div>
            <Btn onClick={openCreate} small>+ Créer</Btn>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
            {[
              ["compatible", "✅ Compatibles"],
              ["loved",      "❤️ Adorées"],
              ["untested",   "🆕 Pas testées"],
            ].map(([f, label]) => (
              <Chip key={f} active={recipeFilters.has(f)} onClick={() => toggleRecipeFilter(f)} color="#7C3AED">{label}</Chip>
            ))}
          </div>

          {filteredRecipes.length === 0 && <EmptyState emoji="🍳" text="Aucune recette pour ces filtres" />}
          {filteredRecipes.map((recipe, i) => {
            const realIngs = recipe.ingredients.filter(i => i.name !== "Eau" && i.name !== "Lait");
            const missing = realIngs.filter(ing => !validated.has(ing.name));
            const compatible = missing.length === 0;
            const tested = testedRecipes[recipe.name];
            return (
              <Card key={recipe.id || i} onClick={() => { setRecipeModal(recipe); setPortions(recipe.basePortions); setRecipeNote(tested?.note || ""); }} style={{ marginBottom: 10, cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <span style={{ fontSize: 28, flexShrink: 0 }}>{recipe.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <div style={{ fontWeight: 800, fontSize: 14, color: theme.text, flex: 1 }}>{recipe.name}</div>
                      {recipe.isCustom && (
                        <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 6, background: "#EDE9FE", color: "#7C3AED", flexShrink: 0 }}>✏️ Perso</span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: theme.textMuted, marginBottom: 6 }}>
                      {recipe.ageMin ? `≥ ${recipe.ageMin} mois · ` : ""}{realIngs.map(i => i.name).join(", ")}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 8, background: compatible ? "#F0FDF4" : "#FFFBEB", color: compatible ? "#166534" : "#92400E", border: `1px solid ${compatible ? "#86EFAC" : "#FDE68A"}` }}>
                        {compatible ? "✓ Compatible" : `⚠️ Manque : ${missing.map(i => i.name).join(", ")}`}
                      </span>
                      {tested
                        ? <span style={{ fontSize: 11, fontWeight: 700, color: theme.textMuted }}>{RATING_EMOJIS[tested.rating]} {fmt(tested.date)}</span>
                        : <span style={{ fontSize: 10, color: theme.textMuted }}>Pas encore testée</span>
                      }
                    </div>
                  </div>
                  {recipe.isCustom && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                      <IconBtn onClick={(e) => openEdit(recipe, e)}>✏️</IconBtn>
                      <IconBtn onClick={(e) => deleteCustomRecipe(recipe.id, e)}>🗑</IconBtn>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </>
      )}

      {/* Modal création/édition recette custom */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title={editRecipeId ? "Modifier la recette" : "Créer une recette"}>
        <Input label="Nom de la recette" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ex: Purée courgette maison" autoFocus />

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: theme.textMuted, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Emoji</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {RECIPE_EMOJIS.map(e => (
              <button key={e} onClick={() => setNewEmoji(e)} style={{ width: 40, height: 40, borderRadius: 10, border: `2px solid ${newEmoji === e ? "#7C3AED" : theme.border}`, background: newEmoji === e ? "#EDE9FE" : theme.card, fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{e}</button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: theme.textMuted, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Ingrédients</div>
          {newIngredients.map((ing, idx) => (
            <div key={idx} style={{ display: "flex", gap: 6, marginBottom: 6, alignItems: "center" }}>
              <input
                value={ing.name}
                onChange={e => updateIngredient(idx, "name", e.target.value)}
                placeholder="Ingrédient"
                style={{ flex: 2, border: `1.5px solid ${theme.inputBorder}`, borderRadius: 8, padding: "7px 10px", fontSize: 13, background: theme.input, color: theme.text, outline: "none" }}
              />
              <input
                value={ing.qty}
                onChange={e => updateIngredient(idx, "qty", e.target.value)}
                placeholder="Qté"
                type="number"
                min="0"
                style={{ flex: 1, border: `1.5px solid ${theme.inputBorder}`, borderRadius: 8, padding: "7px 10px", fontSize: 13, background: theme.input, color: theme.text, outline: "none" }}
              />
              <select
                value={ing.unit}
                onChange={e => updateIngredient(idx, "unit", e.target.value)}
                style={{ flex: 1, border: `1.5px solid ${theme.inputBorder}`, borderRadius: 8, padding: "7px 6px", fontSize: 13, background: theme.input, color: theme.text, outline: "none" }}
              >
                <option value="g">g</option>
                <option value="ml">ml</option>
                <option value="unité">unité</option>
              </select>
              {newIngredients.length > 1 && (
                <button onClick={() => removeIngredientRow(idx)} style={{ width: 28, height: 28, borderRadius: 7, border: "none", background: theme.subtle, color: theme.textMuted, cursor: "pointer", fontSize: 14, flexShrink: 0 }}>✕</button>
              )}
            </div>
          ))}
          <button onClick={addIngredientRow} style={{ fontSize: 13, fontWeight: 700, color: "#7C3AED", background: "none", border: "none", cursor: "pointer", padding: "4px 0" }}>+ Ajouter un ingrédient</button>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: theme.textMuted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Nombre de portions</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => setNewPortions(p => Math.max(1, p - 1))} style={{ width: 30, height: 30, borderRadius: 8, border: `1.5px solid ${theme.border}`, background: theme.card, fontSize: 16, fontWeight: 700, cursor: "pointer", color: theme.text, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
            <span style={{ fontSize: 18, fontWeight: 900, color: "#7C3AED", minWidth: 24, textAlign: "center" }}>{newPortions}</span>
            <button onClick={() => setNewPortions(p => p + 1)} style={{ width: 30, height: 30, borderRadius: 8, border: `1.5px solid ${theme.border}`, background: theme.card, fontSize: 16, fontWeight: 700, cursor: "pointer", color: theme.text, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: theme.textMuted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Étapes de préparation</div>
          <textarea
            value={newSteps}
            onChange={e => setNewSteps(e.target.value)}
            placeholder={"1. Éplucher et couper...\n2. Cuire vapeur 15min...\n3. Mixer et servir."}
            rows={4}
            style={{ width: "100%", border: `1.5px solid ${theme.inputBorder}`, borderRadius: 10, padding: "8px 12px", fontSize: 13, background: theme.input, color: theme.text, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit", lineHeight: 1.5 }}
          />
        </div>

        <Btn onClick={saveCustomRecipe} disabled={!newName.trim()} full>Enregistrer</Btn>
      </Modal>

      {/* Modal ajout aliment custom */}
      <Modal open={!!addFoodCat} onClose={() => setAddFoodCat(null)} title="Ajouter un aliment">
        <div style={{ fontSize: 12, fontWeight: 700, color: theme.textMuted, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
          Catégorie : <span style={{ color: CAT_COLORS[addFoodCat] || "#7C3AED" }}>{addFoodCat}</span>
        </div>
        <Input label="Nom de l'aliment" value={customName} onChange={e => setCustomName(e.target.value)} placeholder="Ex: Butternut" autoFocus />
        <Btn onClick={addCustomFood} disabled={!customName.trim()} full>Ajouter</Btn>
      </Modal>

      <Modal open={!!recipeModal} onClose={() => setRecipeModal(null)} title={recipeModal ? `${recipeModal.emoji} ${recipeModal.name}` : ""}>
        {recipeModal && (() => {
          const mult = portions / recipeModal.basePortions;
          return (
            <>
              {/* Portions selector */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: theme.subtle, borderRadius: 12, padding: "10px 14px", marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>Portions</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button onClick={() => setPortions(p => Math.max(1, p - 1))} style={{ width: 30, height: 30, borderRadius: 8, border: `1.5px solid ${theme.border}`, background: theme.card, fontSize: 16, fontWeight: 700, cursor: "pointer", color: theme.text, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                  <span style={{ fontSize: 18, fontWeight: 900, color: "#7C3AED", minWidth: 24, textAlign: "center" }}>{portions}</span>
                  <button onClick={() => setPortions(p => p + 1)} style={{ width: 30, height: 30, borderRadius: 8, border: `1.5px solid ${theme.border}`, background: theme.card, fontSize: 16, fontWeight: 700, cursor: "pointer", color: theme.text, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                </div>
              </div>
              <div style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 700, marginBottom: 8 }}>INGRÉDIENTS</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
                {recipeModal.ingredients.map(ing => {
                  const isNeutral = ing.name === "Eau" || ing.name === "Lait";
                  const ok = isNeutral || validated.has(ing.name);
                  const scaledQty = Math.round(ing.qty * mult);
                  return (
                    <span key={ing.name} style={{ fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 8, background: ok ? "#F0FDF4" : "#FEF2F2", color: ok ? "#166534" : "#991B1B", border: `1px solid ${ok ? "#86EFAC" : "#FECACA"}` }}>
                      {ok ? "✓ " : "✗ "}{scaledQty}{ing.unit} {ing.name}
                    </span>
                  );
                })}
              </div>
              <div style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 700, marginBottom: 8 }}>PRÉPARATION</div>
              <div style={{ fontSize: 13, lineHeight: 1.6, color: "#374151", background: "#F9FAFB", borderRadius: 12, padding: 14 }}>{recipeModal.steps}</div>
              <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 12, textAlign: "center" }}>Dès {recipeModal.ageMin} mois</div>

              {/* Mon retour */}
              <div style={{ marginTop: 20, borderTop: `1px solid ${theme.border}`, paddingTop: 16 }}>
                <div style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 700, marginBottom: 10 }}>MON RETOUR</div>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  {(["loved","ok","refused"]).map(r => {
                    const active = testedRecipes[recipeModal.name]?.rating === r;
                    const c = RATING_COLORS[r];
                    return (
                      <button key={r} onClick={() => saveRating(recipeModal.name, r, recipeNote)}
                        style={{ flex: 1, padding: "10px 4px", borderRadius: 12, border: `2px solid ${active ? c.border : theme.border}`, background: active ? c.bg : theme.card, cursor: "pointer", fontWeight: 700, fontSize: 11, color: active ? c.text : theme.textMuted, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, transition: "all .15s" }}>
                        <span style={{ fontSize: 22 }}>{RATING_EMOJIS[r]}</span>
                        {RATING_LABELS[r]}
                      </button>
                    );
                  })}
                </div>
                <input
                  value={recipeNote}
                  onChange={e => setRecipeNote(e.target.value)}
                  onBlur={() => { if (testedRecipes[recipeModal.name]) saveRating(recipeModal.name, testedRecipes[recipeModal.name].rating, recipeNote); }}
                  placeholder="Notes (texture, quantité mangée...)"
                  style={{ width: "100%", border: `1.5px solid ${theme.inputBorder}`, borderRadius: 10, padding: "8px 12px", fontSize: 13, background: theme.input, color: theme.text, outline: "none", boxSizing: "border-box" }}
                />
              </div>
            </>
          );
        })()}
      </Modal>
    </div>
  );
};

// ─── OMS / WHO Growth data ───
// Calcul exact de l'âge en mois à la date de mesure
const measureMonth = (birthDate, measureDate) => {
  const b = new Date(birthDate), m = new Date(measureDate);
  return (m.getFullYear() - b.getFullYear()) * 12 + m.getMonth() - b.getMonth()
    + (m.getDate() - b.getDate()) / 30;
};

// Poids OMS [P3, P50, P97] en kg, mois 0–24, garçon / fille
const OMS_WEIGHT = {
  boy: [
    [2.5,3.3,4.3],[3.4,4.5,5.7],[4.3,5.6,6.9],[5.0,6.4,7.9],[5.6,7.0,8.6],
    [6.0,7.5,9.3],[6.4,7.9,9.7],[6.7,8.3,10.2],[6.9,8.6,10.5],[7.1,8.9,10.9],
    [7.4,9.2,11.2],[7.6,9.4,11.5],[7.7,9.6,11.8],[7.9,9.9,12.1],[8.1,10.1,12.4],
    [8.3,10.3,12.6],[8.4,10.5,12.9],[8.6,10.7,13.2],[8.8,10.9,13.5],[8.9,11.1,13.7],
    [9.1,11.3,14.0],[9.2,11.5,14.3],[9.4,11.8,14.6],[9.5,12.0,14.9],[9.7,12.2,15.2],
  ],
  girl: [
    [2.4,3.2,4.2],[3.2,4.2,5.5],[3.9,5.1,6.6],[4.5,5.8,7.5],[5.0,6.4,8.2],
    [5.4,6.9,8.8],[5.7,7.3,9.3],[6.0,7.6,9.7],[6.3,7.9,10.1],[6.5,8.2,10.4],
    [6.7,8.5,10.8],[6.9,8.7,11.1],[7.0,8.9,11.5],[7.2,9.2,11.8],[7.4,9.4,12.1],
    [7.6,9.6,12.4],[7.7,9.8,12.6],[7.9,10.0,12.9],[8.1,10.2,13.2],[8.2,10.4,13.5],
    [8.4,10.6,13.7],[8.6,10.9,14.0],[8.7,11.1,14.3],[8.9,11.3,14.6],[9.0,11.5,14.8],
  ],
};

// ─── SECTION: Growth ───
const GrowthSection = ({ data, update }) => {
  const { theme } = useTheme();
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [head, setHead] = useState("");
  const [date, setDate] = useState(todayStr());

  const closeModal = () => { setModal(false); setEditId(null); setWeight(""); setHeight(""); setHead(""); setDate(todayStr()); };

  const add = () => {
    if (editId) {
      update(d => {
        const g = d.growth.find(x => x.id === editId);
        if (g) { g.date = date; g.weight = Number(weight) || null; g.height = Number(height) || null; g.head = Number(head) || null; }
      });
    } else {
      update(d => { d.growth.push({ id: uid(), date, weight: Number(weight) || null, height: Number(height) || null, head: Number(head) || null }); });
    }
    closeModal();
  };
  const remove = (id) => update(d => { d.growth = d.growth.filter(x => x.id !== id); });
  const sorted = [...(data.growth||[])].sort((a, b) => b.date.localeCompare(a.date));

  const birthDate = data.baby?.birthDate || null;
  const gender = data.baby?.gender === "girl" ? "girl" : "boy";
  const omsData = OMS_WEIGHT[gender]; // 25 rows: months 0–24

  // Points bébé projetés sur l'axe des mois OMS
  const babyPoints = birthDate
    ? (data.growth||[])
        .filter(g => g.weight != null)
        .map(g => ({ month: measureMonth(birthDate, g.date), weight: g.weight, date: g.date }))
        .filter(p => p.month >= 0 && p.month <= 24)
        .sort((a, b) => a.month - b.month)
    : [];

  // SVG layout
  const W = 320, H = 175;
  const ML = 28, MR = 8, MT = 10, MB = 22;
  const cW = W - ML - MR, cH = H - MT - MB;
  const minKg = 1, maxKg = 16;
  const xM  = (m)  => ML + (m / 24) * cW;
  const yKg = (kg) => MT + cH - ((kg - minKg) / (maxKg - minKg)) * cH;

  const omsPolyline = (pIdx) => omsData.map((row, m) => `${xM(m)},${yKg(row[pIdx])}`).join(" ");
  const omsAreaPts  = () => [
    ...omsData.map((row, m) => `${xM(m)},${yKg(row[2])}`),
    ...[...omsData].reverse().map((row, i) => `${xM(24 - i)},${yKg(row[0])}`),
  ].join(" ");

  const babyPolyline = babyPoints.map(p => `${xM(p.month)},${yKg(p.weight)}`).join(" ");

  const xTicks = [0, 3, 6, 9, 12, 15, 18, 21, 24];
  const yTicks = [2, 4, 6, 8, 10, 12, 14];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: theme.text }}>📏 Croissance</div>
        <Btn onClick={() => { setEditId(null); setDate(todayStr()); setWeight(""); setHeight(""); setHead(""); setModal(true); }} small>+ Mesure</Btn>
      </div>

      {/* Courbe OMS */}
      <Card style={{ marginBottom: 16, padding: "14px 12px 8px" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: theme.textMuted, marginBottom: 6 }}>
          📈 Poids vs OMS ({gender === "girl" ? "Fille" : "Garçon"})
          <span style={{ fontWeight: 500, marginLeft: 6 }}>— P3 · P50 · P97</span>
        </div>
        {!birthDate ? (
          <div style={{ fontSize: 12, color: theme.textMuted, fontStyle: "italic", padding: "16px 0", textAlign: "center" }}>
            Date de naissance manquante
          </div>
        ) : (
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", overflow: "visible" }}>
            {/* Zone P3–P97 */}
            <polygon points={omsAreaPts()} fill="#EDE9FE" opacity="0.45" />
            {/* P3 */}
            <polyline points={omsPolyline(0)} fill="none" stroke="#C4B5FD" strokeWidth="1.2" strokeDasharray="4,3" />
            {/* P50 */}
            <polyline points={omsPolyline(1)} fill="none" stroke="#7C3AED" strokeWidth="2" />
            {/* P97 */}
            <polyline points={omsPolyline(2)} fill="none" stroke="#C4B5FD" strokeWidth="1.2" strokeDasharray="4,3" />

            {/* Ligne bébé */}
            {babyPoints.length >= 2 && (
              <polyline points={babyPolyline} fill="none" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            )}
            {/* Points bébé */}
            {babyPoints.map((p, i) => (
              <g key={i}>
                <circle cx={xM(p.month)} cy={yKg(p.weight)} r="4.5" fill="#fff" stroke="#F97316" strokeWidth="2.5" />
                <text x={xM(p.month)} y={Math.max(yKg(p.weight) - 7, MT + 8)} textAnchor="middle" fontSize="8" fill="#F97316" fontWeight="700">{p.weight}kg</text>
              </g>
            ))}

            {/* Message si aucun point */}
            {babyPoints.length === 0 && (
              <text x={W / 2} y={H / 2 + 4} textAnchor="middle" fontSize="10" fill="#9CA3AF">
                Ajoutez une première mesure pour voir les données bébé
              </text>
            )}

            {/* Axes */}
            <line x1={ML} y1={MT} x2={ML} y2={MT + cH} stroke={theme.border} strokeWidth="1" />
            <line x1={ML} y1={MT + cH} x2={ML + cW} y2={MT + cH} stroke={theme.border} strokeWidth="1" />
            {/* X ticks */}
            {xTicks.map(m => (
              <g key={m}>
                <line x1={xM(m)} y1={MT + cH} x2={xM(m)} y2={MT + cH + 3} stroke="#D1D5DB" strokeWidth="1" />
                <text x={xM(m)} y={H - 5} textAnchor="middle" fontSize="8" fill="#9CA3AF">{m}m</text>
              </g>
            ))}
            {/* Y ticks */}
            {yTicks.map(kg => (
              <g key={kg}>
                <line x1={ML - 3} y1={yKg(kg)} x2={ML} y2={yKg(kg)} stroke="#D1D5DB" strokeWidth="1" />
                <text x={ML - 5} y={yKg(kg) + 3} textAnchor="end" fontSize="8" fill="#9CA3AF">{kg}</text>
              </g>
            ))}
          </svg>
        )}
      </Card>

      {sorted.length === 0 && <EmptyState emoji="📏" text="Aucune mesure — ajoutez la première !" />}
      {sorted.map(g => (
        <Card key={g.id} style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: theme.text }}>{fmtFull(g.date)}</div>
            <div style={{ fontSize: 12, color: theme.textMuted, display: "flex", gap: 12, marginTop: 4 }}>
              {g.weight && <span>⚖️ {g.weight} kg</span>}
              {g.height && <span>📏 {g.height} cm</span>}
              {g.head && <span>🧠 {g.head} cm</span>}
            </div>
          </div>
          <IconBtn onClick={() => { setEditId(g.id); setDate(g.date); setWeight(g.weight ?? ""); setHeight(g.height ?? ""); setHead(g.head ?? ""); setModal(true); }}>✏️</IconBtn>
          <IconBtn onClick={() => remove(g.id)}>🗑</IconBtn>
        </Card>
      ))}

      <Modal open={modal} onClose={closeModal} title={editId ? "Modifier la mesure" : "Nouvelle mesure"}>
        <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} />
        <Input label="Poids (kg)" type="number" step="0.01" value={weight} onChange={e => setWeight(e.target.value)} placeholder="6.5" />
        <Input label="Taille (cm)" type="number" step="0.1" value={height} onChange={e => setHeight(e.target.value)} placeholder="67" />
        <Input label="Tour de tête (cm)" type="number" step="0.1" value={head} onChange={e => setHead(e.target.value)} placeholder="43" />
        <Btn onClick={add} full style={{ marginTop: 4 }}>Enregistrer</Btn>
      </Modal>
    </div>
  );
};

// ─── MONTHLY GUIDE DATA ───
const MONTHLY_GUIDE = {
  1: {
    title: "Le premier mois",
    growth: "Pic de croissance possible entre J7 et J10. Perte de poids normale les premiers jours (jusqu'à 10%).",
    teeth: null,
    awakening: "Bébé dort 16-17h par jour. Cycles de sommeil courts (45-60min). Vision floue au-delà de 30cm.",
    motor: "Réflexes archaïques (grasping, Moro). Mouvements involontaires des bras et jambes.",
    tip: "Le peau à peau favorise la régulation thermique et le lien d'attachement.",
  },
  2: {
    title: "2 mois — Premier sourire",
    growth: "Prise de poids régulière (~150-200g/semaine). Premier vaccin (DTP + Pneumocoque).",
    teeth: null,
    awakening: "Début du sourire social. Fixe les visages. Commence à gazouiller. Périodes d'éveil plus longues.",
    motor: "Tient la tête quelques secondes. Mouvements plus fluides. Ouvre et ferme les mains.",
    tip: "Parlez-lui beaucoup : il apprend les intonations de votre voix.",
  },
  3: {
    title: "3 mois — L'éveil s'accélère",
    growth: "La croissance ralentit légèrement. Poids de naissance généralement doublé d'ici 4 mois.",
    teeth: null,
    awakening: "Rit aux éclats. Reconnaît les visages familiers à distance. Suit des objets à 180°.",
    motor: "Tête stable en position assise (tenu). Appui sur avant-bras en tummy time. Attrape les jouets.",
    tip: "C'est l'âge idéal pour introduire un portique d'éveil.",
  },
  4: {
    title: "4 mois — La découverte des mains",
    growth: "Pic de croissance fréquent. Bébé peut réclamer plus de lait.",
    teeth: "Premiers signes possibles de poussée dentaire (bave, mâchouille) même si les dents n'arrivent qu'à 6 mois en moyenne.",
    awakening: "Porte tout à la bouche. Distingue les couleurs primaires. Babille (ba-ba, ga-ga).",
    motor: "Retournement ventre→dos. Pousse fort sur ses jambes quand on le tient debout.",
    tip: "Si bébé montre de l'intérêt pour la nourriture, ce n'est pas encore le moment — diversification à partir de 4-6 mois selon avis pédiatre.",
  },
  5: {
    title: "5 mois — Le grand retournement",
    growth: "Croissance stable. Certains bébés commencent la diversification sur avis médical.",
    teeth: "Gencives possiblement gonflées. Anneaux de dentition au frais peuvent soulager.",
    awakening: "Répond à son prénom. Distingue familier et inconnu. Aime les jeux de coucou-caché.",
    motor: "Retournement dos→ventre. Transfère des objets main à main. Met les pieds à la bouche.",
    tip: "Laissez bébé explorer pieds nus : ça stimule la proprioception.",
  },
  6: {
    title: "6 mois — Cap diversification",
    growth: "Début de la diversification alimentaire. Poids de naissance triplé vers 12 mois.",
    teeth: "Première dent possible (incisives centrales inférieures). Poussée = irritabilité, joues rouges, fesses rouges possibles.",
    awakening: "Syllabes variées. Tend les bras pour être porté. Grande curiosité pour les objets.",
    motor: "Tient assis avec appui. Rebondit debout quand on le tient. Début des déplacements.",
    tip: "Commencez par des légumes un par un pendant 3 jours pour détecter les allergies.",
  },
  7: {
    title: "7 mois — L'explorateur",
    growth: "Introduction progressive des protéines (viande, poisson, œuf).",
    teeth: "Incisives centrales en cours. Bavage important.",
    awakening: "Cherche un objet caché (permanence de l'objet). Réagit clairement à son prénom.",
    motor: "Assis sans soutien bref. Rampe ou se déplace sur le ventre. Pince grossière.",
    tip: "Sécurisez la maison : bébé va bientôt se déplacer partout.",
  },
  8: {
    title: "8 mois — L'angoisse de séparation",
    growth: "Passage aux textures plus épaisses. Introduction des petits morceaux mous.",
    teeth: "Incisives latérales supérieures possibles.",
    awakening: "Dit 'mama/papa' sans forcément le sens. Tape des mains. Angoisse du 8ème mois (peur des inconnus).",
    motor: "Assis stable. Début du 4 pattes. Pince fine pouce-index en développement.",
    tip: "L'angoisse de séparation est normale : rassurez, ne forcez pas. Rituels de séparation courts.",
  },
  9: {
    title: "9 mois — Debout !",
    growth: "Visite médicale des 9 mois obligatoire. Diversification bien établie.",
    teeth: "Incisives latérales (4 dents possibles).",
    awakening: "Comprend 'non'. Pointe du doigt. Fait au revoir. Peur des inconnus encore présente.",
    motor: "Se met debout en s'agrippant. Cabotage le long des meubles. Morceaux mous acceptés.",
    tip: "Proposez des aliments en morceaux (DME/BLW) pour développer la motricité fine.",
  },
  10: {
    title: "10 mois — Le petit singe",
    growth: "3 repas + lait. Introduction progressive de tous les aliments.",
    teeth: "4-6 dents possibles.",
    awakening: "Imite les adultes. 1-2 mots significatifs. Comprend des consignes simples.",
    motor: "Cabotage fluide. Pince pouce-index précise. Met et enlève des objets d'un contenant.",
    tip: "Encouragez l'autonomie à table : cuillère, gobelet.",
  },
  11: {
    title: "11 mois — Presque debout",
    growth: "Alimentation proche de celle de la famille (sauf sel, sucre, miel).",
    teeth: "6-8 dents possibles. Premières molaires en approche.",
    awakening: "Montre du doigt ce qu'il veut. Comprend de plus en plus. Empile 2 cubes.",
    motor: "Debout seul quelques secondes. Marche tenu une ou deux mains. Mange avec les doigts.",
    tip: "Lisez ensemble chaque jour : le vocabulaire se construit maintenant.",
  },
  12: {
    title: "12 mois — Joyeux anniversaire !",
    growth: "Poids de naissance triplé. Taille augmentée de ~50%. Visite des 12 mois.",
    teeth: "8 dents en moyenne. ROR 1ère dose + Méningocoque C.",
    awakening: "3-5 mots significatifs. Comprend ~50 mots. Jeu symbolique (donner à manger à la poupée).",
    motor: "Premiers pas. Gobelet seul. Câlins et bisous volontaires.",
    tip: "Chaque enfant a son rythme : ne pas comparer avec les autres.",
  },
  15: {
    title: "15 mois",
    growth: "Croissance ralentit. Appétit possiblement plus irrégulier (néophobie possible).",
    teeth: "Premières molaires en cours (13-19 mois).",
    awakening: "10-15 mots. Pointe des images dans les livres. Frustration s'exprime clairement.",
    motor: "Court maladroitement. Lance une balle. Boit au verre seul.",
    tip: "La néophobie alimentaire est normale. Proposez sans forcer, ça peut prendre 10-15 expositions.",
  },
  18: {
    title: "18 mois",
    growth: "Visite des 18 mois. ROR 2ème dose.",
    teeth: "Canines en cours (16-22 mois). Douloureux — gel gingival si besoin.",
    awakening: "~50 mots actifs. Combine 2 mots. Jeu symbolique avancé (cuisine, ménage).",
    motor: "Court bien. Monte/descend les escaliers (avec aide). Mange seul proprement.",
    tip: "Encouragez le langage : reformulez ses phrases en version complète plutôt que de corriger.",
  },
  24: {
    title: "24 mois — 2 ans",
    growth: "Visite des 2 ans. Courbe de croissance plus linéaire.",
    teeth: "20 dents de lait bientôt complètes. 2èmes molaires (23-33 mois).",
    awakening: "~200 mots. Phrases 2-3 mots. Joue avec d'autres enfants. Début de la propreté diurne.",
    motor: "Saute sur place. S'habille partiellement. Pédale un tricycle.",
    tip: "Pour la propreté, suivez les signes de maturité de l'enfant, pas le calendrier.",
  },
};

// ─── SECTION: Milestones ───
const MilestonesSection = ({ data, update }) => {
  const { theme } = useTheme();
  const ageM = babyAgeMonths(data.baby.birthDate);
  const availableMonths = Object.keys(data.milestones || DEFAULT_MILESTONES).map(Number).sort((a, b) => a - b);
  const [month, setMonth] = useState(availableMonths.includes(ageM) ? ageM : availableMonths.find(m => m >= ageM) || availableMonths[0] || 1);
  const [guideOpen, setGuideOpen] = useState(false);
  const toggle = (m, idx) => { const key = `${m}-${idx}`; update(d => { d.milestonesChecked[key] = !d.milestonesChecked[key]; }); };
  const items = (data.milestones || DEFAULT_MILESTONES)[month] || [];
  const checkedN = items.filter((_, i) => data.milestonesChecked?.[`${month}-${i}`]).length;

  const guide = MONTHLY_GUIDE[month] || null;
  const guideRows = guide ? [
    guide.growth   && { icon: "📈", label: "Croissance", text: guide.growth },
    guide.teeth    && { icon: "🦷", label: "Dents",      text: guide.teeth },
    guide.awakening && { icon: "💡", label: "Éveil",     text: guide.awakening },
    guide.motor    && { icon: "🏃", label: "Motricité",  text: guide.motor },
    guide.tip      && { icon: "✨", label: "Conseil",    text: guide.tip },
  ].filter(Boolean) : [];

  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 900, color: theme.text, marginBottom: 4 }}>🏆 Étapes de développement</div>
      <div style={{ fontSize: 13, color: theme.textMuted, fontWeight: 600, marginBottom: 14 }}>Mois {month} — {checkedN}/{items.length} acquises</div>

      <div style={{ display: "flex", gap: 5, overflowX: "auto", marginBottom: 14, paddingBottom: 4 }}>
        {availableMonths.map(m => {
          const total = ((data.milestones || DEFAULT_MILESTONES)[m] || []).length;
          const done = ((data.milestones || DEFAULT_MILESTONES)[m] || []).filter((_, i) => data.milestonesChecked?.[`${m}-${i}`]).length;
          return (
            <span key={m} onClick={() => setMonth(m)} style={{
              flex: "0 0 auto", minWidth: 38, height: 38, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, fontSize: 13, cursor: "pointer",
              background: month === m ? "#7C3AED" : (total > 0 && done === total) ? "#D1FAE5" : theme.cardBg,
              color: month === m ? "#fff" : (total > 0 && done === total) ? "#059669" : theme.textMuted,
              border: m === ageM && month !== m ? "2px solid #C4B5FD" : "1.5px solid transparent"
            }}>{m}</span>
          );
        })}
      </div>

      {guide && (
        <div style={{ marginBottom: 14, borderRadius: 18, border: "1.5px solid #C4B5FD", background: theme.cardBg, overflow: "hidden" }}>
          <div
            onClick={() => setGuideOpen(o => !o)}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", cursor: "pointer" }}
          >
            <div style={{ fontWeight: 800, fontSize: 14, color: "#7C3AED" }}>📅 Guide — {guide.title}</div>
            <div style={{ fontSize: 18, color: "#7C3AED", lineHeight: 1, transition: "transform .2s", transform: guideOpen ? "rotate(180deg)" : "rotate(0deg)" }}>›</div>
          </div>
          {guideOpen && (
            <div style={{ padding: "0 16px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
              {guideRows.map(({ icon, label, text }) => (
                <div key={label} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{icon}</span>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "#7C3AED", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 13, color: theme.text, lineHeight: 1.5 }}>{text}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ background: theme.border, borderRadius: 10, height: 8, marginBottom: 18, overflow: "hidden" }}>
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
// ─── Lightbox photo ───
const PhotoViewer = ({ src, onClose }) => {
  if (!src) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 3000, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "zoom-out" }}>
      <img src={src} alt="" onClick={e => e.stopPropagation()} style={{ maxWidth: "92vw", maxHeight: "88vh", objectFit: "contain", borderRadius: 8, cursor: "default" }} />
      <div onClick={onClose} style={{ position: "absolute", top: 16, right: 16, width: 36, height: 36, borderRadius: 18, background: "rgba(255,255,255,0.15)", color: "#fff", fontSize: 22, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>×</div>
    </div>
  );
};

const NotesSection = ({ data, update }) => {
  const { theme } = useTheme();
  const [modal, setModal] = useState(false);
  const [text, setText] = useState("");
  const [mood, setMood] = useState("😊");
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [viewPhoto, setViewPhoto] = useState(null);

  const resetForm = () => { setText(""); setMood("😊"); setPhoto(null); setPreview(null); };

  const add = () => {
    if (!text.trim()) return;
    update(d => { d.notes.push({ id: uid(), text, mood, photo: photo || null, date: new Date().toISOString() }); });
    setModal(false); resetForm();
  };

  const remove = (id) => update(d => { d.notes = d.notes.filter(x => x.id !== id); });
  const sorted = [...(data.notes||[])].sort((a, b) => b.date.localeCompare(a.date));

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Preview instantané (avant compression)
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    setPhotoLoading(true);
    try {
      const compressed = await compressImage(file, 1200, 0.7);
      setPhoto(compressed);
    } catch (err) {
      console.error("Compression error:", err);
      alert("Erreur lors du traitement de la photo : " + err.message);
      setPreview(null);
    } finally {
      setPhotoLoading(false);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    if (preview) { URL.revokeObjectURL(preview); setPreview(null); }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: theme.text }}>📝 Journal</div>
        <Btn onClick={() => { resetForm(); setModal(true); }} small>+ Écrire</Btn>
      </div>
      {sorted.length === 0 && <EmptyState emoji="📝" text="Écrivez vos premiers souvenirs" />}
      {sorted.map(n => (
        <Card key={n.id} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: theme.textMuted, fontWeight: 700 }}>{n.mood} {fmtFull(n.date)}</span>
            <IconBtn onClick={() => remove(n.id)}>🗑</IconBtn>
          </div>
          {n.photo && <img src={n.photo} alt="" onClick={e => { e.stopPropagation(); setViewPhoto(n.photo); }} style={{ width: "100%", maxHeight: 400, objectFit: "contain", borderRadius: 12, marginBottom: 8, background: theme.subtle, cursor: "zoom-in", display: "block" }} />}
          <div style={{ fontSize: 14, lineHeight: 1.7, color: theme.text }}>{n.text}</div>
        </Card>
      ))}
      <Modal open={modal} onClose={() => { setModal(false); resetForm(); }} title="Nouveau souvenir">
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {["😊","😢","😴","🤒","🎉","❤️","😂","🥰","😤"].map(m => (
            <span key={m} onClick={() => setMood(m)} style={{ fontSize: 24, cursor: "pointer", padding: 4, borderRadius: 8, background: mood === m ? "#F3E8FF" : "transparent" }}>{m}</span>
          ))}
        </div>
        {/* Photo */}
        <div style={{ marginBottom: 14 }}>
          {(preview || photo) && (
            <div style={{ position: "relative", marginBottom: 8 }}>
              <img src={preview || photo} alt="" style={{ width: "100%", maxHeight: 300, objectFit: "contain", borderRadius: 10, background: theme.subtle }} />
              {photoLoading && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700 }}>
                  ⏳ Compression...
                </div>
              )}
            </div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <label style={{ flex: 1, padding: "9px 14px", borderRadius: 12, border: `1.5px dashed ${theme.inputBorder}`, background: theme.subtle, color: theme.textMuted, fontSize: 13, fontWeight: 700, cursor: "pointer", textAlign: "center" }}>
              {photoLoading ? "⏳ En cours..." : (preview || photo) ? "📷 Changer" : "📷 Ajouter une photo"}
              <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{ display: "none" }} />
            </label>
            {(preview || photo) && <Btn variant="secondary" small onClick={removePhoto}>✕</Btn>}
          </div>
        </div>
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Aujourd'hui, bébé a..."
          style={{ width: "100%", minHeight: 120, padding: "12px 14px", borderRadius: 14, border: `2px solid ${theme.inputBorder}`, background: theme.input, color: theme.text, fontSize: 15, fontFamily: "inherit", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
        <Btn onClick={add} full style={{ marginTop: 8 }} disabled={!text.trim()}>Enregistrer</Btn>
      </Modal>
      <PhotoViewer src={viewPhoto} onClose={() => setViewPhoto(null)} />
    </div>
  );
};

// ─── SECTION: PDF / Rapport du jour ───
const PdfSection = ({ data }) => {
  const { theme } = useTheme();
  const today = todayStr();
  const age = babyAgeText(data.baby?.birthDate);

  const CSS = `body{font-family:Arial,sans-serif;padding:24px;color:#333;max-width:780px;margin:0 auto;font-size:14px}h1{color:#7C3AED;border-bottom:2px solid #C4B5FD;padding-bottom:10px;margin-bottom:4px;font-size:22px}.sub{color:#6B7280;margin-bottom:24px;font-size:13px}h2{color:#7C3AED;margin:24px 0 8px;font-size:16px}table{width:100%;border-collapse:collapse;margin-bottom:4px}th,td{padding:7px 10px;text-align:left;border-bottom:1px solid #F3F4F6;font-size:13px}th{background:#F9FAFB;font-weight:700;color:#6B7280;font-size:11px;text-transform:uppercase;letter-spacing:.5px}blockquote{margin:6px 0;padding:8px 12px;border-left:3px solid #C4B5FD;background:#F5F3FF;border-radius:0 8px 8px 0}.tag{display:inline-block;background:#F5F3FF;padding:4px 10px;border-radius:8px;margin:3px;font-size:13px}footer{margin-top:40px;font-size:11px;color:#9CA3AF;border-top:1px solid #F3F4F6;padding-top:12px;text-align:center}@media print{body{padding:0}}`;

  const downloadBlob = (html, filename) => {
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const durStr = (s) => { if (!s.end) return "En cours"; const m = Math.round((new Date(s.end) - new Date(s.start)) / 60000); return m >= 60 ? `${Math.floor(m/60)}h${String(m%60).padStart(2,"0")}` : `${m} min`; };
  const durMin = (s) => s.end ? Math.round((new Date(s.end) - new Date(s.start)) / 60000) : 0;
  const fmtMin = (m) => m >= 60 ? `${Math.floor(m/60)}h${String(m%60).padStart(2,"0")}` : `${m}min`;

  const exportDayReport = () => {
    const dayBottles = (data.bottles||[]).filter(b=>(b.time||"").startsWith(today)).sort((a,b)=>a.time.localeCompare(b.time));
    const dayDiapers = (data.diapers||[]).filter(d=>(d.time||"").startsWith(today)).sort((a,b)=>a.time.localeCompare(b.time));
    const daySleep   = sleepForDay(data.sleep, today).sort((a,b)=>a.start.localeCompare(b.start));
    const dayMeds    = (data.medicines||[]).filter(m=>(m.time||"").startsWith(today)).sort((a,b)=>a.time.localeCompare(b.time));
    const dayTemp    = (data.temperature||[]).filter(t=>(t.time||"").startsWith(today)).sort((a,b)=>a.time.localeCompare(b.time));
    const dayBaths   = (data.baths||[]).filter(b=>(b.time||"").startsWith(today)).sort((a,b)=>a.time.localeCompare(b.time));
    const dayNotes   = (data.notes||[]).filter(n=>(n.date||"").startsWith(today));
    const dayGrowth  = (data.growth||[]).filter(g=>g.date===today);
    const dayBooks   = (data.books||[]).filter(b=>(b.date||"").startsWith(today));
    const dayVax     = VACCINE_SCHEDULE.flatMap((p,pi)=>p.vaccines.map((v,vi)=>({name:v,age:p.age,key:`${pi}-${vi}`}))).filter(v=>data.vaccines?.[v.key]===today);
    const dayFoods   = Object.entries(data.foods||{}).filter(([,v])=>v?.date===today);
    const todayChecks = data.exercises?.[today] || {};
    const dayExercises = Object.keys(todayChecks).filter(k=>todayChecks[k]);

    let sections = "";
    if (dayBottles.length > 0) {
      const total = dayBottles.reduce((s,b)=>s+(b.amount||0),0);
      sections += `<h2>🍼 Biberons (${dayBottles.length} repas · ${total} ml)</h2><table><tr><th>Heure</th><th>Quantité</th><th>Contenu</th><th>Note</th></tr>${dayBottles.map(b=>`<tr><td>${fmtTime(b.time)}</td><td><b>${b.amount} ml</b></td><td>${b.content||"—"}</td><td>${b.note||"—"}</td></tr>`).join("")}</table>`;
    }
    if (dayDiapers.length > 0) {
      sections += `<h2>🧷 Couches (${dayDiapers.length})</h2><table><tr><th>Heure</th><th>Type</th><th>Détail</th><th>Note</th></tr>${dayDiapers.map(d=>{const det=[d.quantity,d.consistency,d.color].filter(Boolean).join(" · ");return`<tr><td>${fmtTime(d.time)}</td><td>${d.type}</td><td>${det||"—"}</td><td>${d.note||"—"}</td></tr>`}).join("")}</table>`;
    }
    if (daySleep.length > 0) {
      const total = daySleep.filter(s=>s.end).reduce((s,x)=>s+durMin(x),0);
      sections += `<h2>😴 Sommeil (${daySleep.length}${total>0?" · total "+fmtMin(total):""})</h2><table><tr><th>Type</th><th>Début</th><th>Fin</th><th>Durée</th><th>Note</th></tr>${daySleep.map(s=>`<tr><td>${s.type||"sieste"}</td><td>${fmtTime(s.start)}</td><td>${s.end?fmtTime(s.end):"En cours"}</td><td>${durStr(s)}</td><td>${s.note||"—"}</td></tr>`).join("")}</table>`;
    }
    if (dayMeds.length > 0) {
      sections += `<h2>💊 Médicaments</h2><table><tr><th>Heure</th><th>Médicament</th><th>Dosage</th><th>Note</th></tr>${dayMeds.map(m=>`<tr><td>${fmtTime(m.time)}</td><td><b>${m.name}</b></td><td>${m.dose||"—"}</td><td>${m.note||"—"}</td></tr>`).join("")}</table>`;
    }
    if (dayTemp.length > 0) {
      sections += `<h2>🌡️ Températures</h2><table><tr><th>Heure</th><th>Valeur</th><th>Note</th></tr>${dayTemp.map(t=>`<tr><td>${fmtTime(t.time)}</td><td><b>${t.value}°C</b></td><td>${t.note||"—"}</td></tr>`).join("")}</table>`;
    }
    if (dayBaths.length > 0) {
      sections += `<h2>🛁 Bains</h2><table><tr><th>Heure</th><th>Temp. eau</th><th>Note</th></tr>${dayBaths.map(b=>`<tr><td>${fmtTime(b.time)}</td><td>${b.temp||"—"}°C</td><td>${b.note||"—"}</td></tr>`).join("")}</table>`;
    }
    if (dayVax.length > 0) {
      sections += `<h2>💉 Vaccins</h2>${dayVax.map(v=>`<div class="tag">✓ ${v.name} (${v.age})</div>`).join("")}`;
    }
    if (dayFoods.length > 0) {
      sections += `<h2>🥕 Aliments introduits</h2>${dayFoods.map(([name,v])=>`<div class="tag">${name} — ${v.reaction||"ok"}</div>`).join("")}`;
    }
    if (dayGrowth.length > 0) {
      sections += `<h2>📏 Croissance</h2>${dayGrowth.map(g=>`<div class="tag">${g.weight?`⚖️ ${g.weight}kg `:""}${g.height?`📏 ${g.height}cm `:""}${g.head?`🧠 ${g.head}cm`:""}</div>`).join("")}`;
    }
    if (dayBooks.length > 0) {
      sections += `<h2>📖 Livres</h2>${dayBooks.map(b=>`<div class="tag">${b.title} ${"⭐".repeat(b.interest||0)}</div>`).join("")}`;
    }
    if (dayExercises.length > 0) {
      sections += `<h2>🧘 Éveil & Exercices</h2>${dayExercises.map(e=>`<div class="tag">✓ ${e}</div>`).join("")}`;
    }
    if (dayNotes.length > 0) {
      sections += `<h2>📝 Notes</h2>${dayNotes.map(n=>`<blockquote>${n.mood||""} ${n.text||""}</blockquote>`).join("")}`;
    }
    if (!sections) { alert("Aucune donnée enregistrée aujourd'hui !"); return; }

    const todayFmt = new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Rapport du jour — ${data.baby.name}</title><style>${CSS}</style></head><body><h1>📋 Rapport du jour — ${data.baby.name}</h1><p class="sub"><strong>${todayFmt}</strong>${age?` · ${age}`:""}</p>${sections}<footer>Généré le ${new Date().toLocaleDateString("fr-FR")} — Baby Tracker</footer></body></html>`;
    downloadBlob(html, `rapport-${data.baby.name||"bebe"}-${today}.html`);
  };

  const exportWeekReport = () => {
    const pad = n => String(n).padStart(2,"0");
    const days = Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);return`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;});

    const weekStart = days[0], weekEnd = days[6];
    const inWeek = (ts) => ts && ts.slice(0,10) >= weekStart && ts.slice(0,10) <= weekEnd;

    const weekBottles = (data.bottles||[]).filter(b=>inWeek(b.time));
    const weekDiapers = (data.diapers||[]).filter(d=>inWeek(d.time));
    const weekSleep   = (data.sleep||[]).filter(s=>inWeek(s.start));
    const weekMeds    = (data.medicines||[]).filter(m=>inWeek(m.time));
    const weekTemp    = (data.temperature||[]).filter(t=>inWeek(t.time));
    const weekBaths   = (data.baths||[]).filter(b=>inWeek(b.time));
    const weekNotes   = (data.notes||[]).filter(n=>inWeek(n.date));
    const weekGrowth  = (data.growth||[]).filter(g=>inWeek(g.date));
    const weekBooks   = (data.books||[]).filter(b=>inWeek(b.date));

    const anyData = weekBottles.length + weekDiapers.length + weekSleep.length + weekMeds.length + weekTemp.length + weekBaths.length + weekNotes.length + weekGrowth.length + weekBooks.length > 0;
    if (!anyData) { alert("Aucune donnée enregistrée cette semaine !"); return; }

    const summaryRows = days.map(d => {
      const bs = weekBottles.filter(b=>(b.time||"").startsWith(d));
      const ds = weekDiapers.filter(x=>(x.time||"").startsWith(d));
      const ss = weekSleep.filter(s=>(s.start||"").startsWith(d));
      const totalMl = bs.reduce((s,b)=>s+(b.amount||0),0);
      const totalSleep = ss.filter(s=>s.end).reduce((s,x)=>s+durMin(x),0);
      const label = new Date(d+"T12:00:00").toLocaleDateString("fr-FR",{weekday:"short",day:"numeric",month:"short"});
      return {d,label,bottles:bs.length,ml:totalMl,diapers:ds.length,sleep:ss.length,sleepMin:totalSleep};
    });

    let sections = `<h2>📅 Résumé jour par jour</h2><table><tr><th>Jour</th><th>🍼</th><th>ml</th><th>🧷</th><th>😴</th><th>Sommeil total</th></tr>${summaryRows.map(r=>`<tr><td>${r.label}</td><td>${r.bottles||"—"}</td><td>${r.ml?r.ml+"ml":"—"}</td><td>${r.diapers||"—"}</td><td>${r.sleep||"—"}</td><td>${r.sleepMin?fmtMin(r.sleepMin):"—"}</td></tr>`).join("")}</table>`;

    if (weekBottles.length > 0) {
      const total = weekBottles.reduce((s,b)=>s+(b.amount||0),0);
      sections += `<h2>🍼 Biberons (${weekBottles.length} · ${total} ml · moy. ${Math.round(total/7)} ml/j)</h2><table><tr><th>Jour</th><th>Heure</th><th>Quantité</th><th>Note</th></tr>${weekBottles.sort((a,b)=>a.time.localeCompare(b.time)).map(b=>`<tr><td>${new Date(b.time).toLocaleDateString("fr-FR",{weekday:"short",day:"numeric"})}</td><td>${fmtTime(b.time)}</td><td><b>${b.amount}ml</b></td><td>${b.note||"—"}</td></tr>`).join("")}</table>`;
    }
    if (weekDiapers.length > 0) {
      const pipi=weekDiapers.filter(d=>d.type==="pipi").length, caca=weekDiapers.filter(d=>d.type==="caca").length, mixte=weekDiapers.filter(d=>d.type==="mixte").length;
      sections += `<h2>🧷 Couches (${weekDiapers.length} · Pipi:${pipi} / Caca:${caca} / Mixte:${mixte})</h2><table><tr><th>Jour</th><th>Heure</th><th>Type</th><th>Détail</th></tr>${weekDiapers.sort((a,b)=>a.time.localeCompare(b.time)).map(d=>{const det=[d.quantity,d.consistency,d.color].filter(Boolean).join(" · ");return`<tr><td>${new Date(d.time).toLocaleDateString("fr-FR",{weekday:"short",day:"numeric"})}</td><td>${fmtTime(d.time)}</td><td>${d.type}</td><td>${det||"—"}</td></tr>`}).join("")}</table>`;
    }
    if (weekSleep.length > 0) {
      const total = weekSleep.filter(s=>s.end).reduce((s,x)=>s+durMin(x),0);
      sections += `<h2>😴 Sommeil (${weekSleep.length} · total ${fmtMin(total)})</h2><table><tr><th>Jour</th><th>Type</th><th>Début</th><th>Fin</th><th>Durée</th></tr>${weekSleep.sort((a,b)=>a.start.localeCompare(b.start)).map(s=>`<tr><td>${new Date(s.start).toLocaleDateString("fr-FR",{weekday:"short",day:"numeric"})}</td><td>${s.type||"sieste"}</td><td>${fmtTime(s.start)}</td><td>${s.end?fmtTime(s.end):"En cours"}</td><td>${s.end?fmtMin(durMin(s)):"—"}</td></tr>`).join("")}</table>`;
    }
    if (weekMeds.length > 0) {
      sections += `<h2>💊 Médicaments</h2><table><tr><th>Jour</th><th>Heure</th><th>Médicament</th><th>Dosage</th><th>Note</th></tr>${weekMeds.sort((a,b)=>a.time.localeCompare(b.time)).map(m=>`<tr><td>${new Date(m.time).toLocaleDateString("fr-FR",{weekday:"short",day:"numeric"})}</td><td>${fmtTime(m.time)}</td><td><b>${m.name}</b></td><td>${m.dose||"—"}</td><td>${m.note||"—"}</td></tr>`).join("")}</table>`;
    }
    if (weekTemp.length > 0) {
      sections += `<h2>🌡️ Températures</h2><table><tr><th>Jour</th><th>Heure</th><th>Valeur</th><th>Note</th></tr>${weekTemp.sort((a,b)=>a.time.localeCompare(b.time)).map(t=>`<tr><td>${new Date(t.time).toLocaleDateString("fr-FR",{weekday:"short",day:"numeric"})}</td><td>${fmtTime(t.time)}</td><td><b>${t.value}°C</b></td><td>${t.note||"—"}</td></tr>`).join("")}</table>`;
    }
    if (weekBaths.length > 0) {
      sections += `<h2>🛁 Bains</h2><table><tr><th>Jour</th><th>Heure</th><th>Temp. eau</th><th>Note</th></tr>${weekBaths.sort((a,b)=>a.time.localeCompare(b.time)).map(b=>`<tr><td>${new Date(b.time).toLocaleDateString("fr-FR",{weekday:"short",day:"numeric"})}</td><td>${fmtTime(b.time)}</td><td>${b.temp||"—"}°C</td><td>${b.note||"—"}</td></tr>`).join("")}</table>`;
    }
    if (weekGrowth.length > 0) {
      sections += `<h2>📏 Croissance</h2><table><tr><th>Date</th><th>Poids</th><th>Taille</th><th>Tour de tête</th></tr>${weekGrowth.sort((a,b)=>a.date.localeCompare(b.date)).map(g=>`<tr><td>${fmtFull(g.date)}</td><td>${g.weight?g.weight+" kg":"—"}</td><td>${g.height?g.height+" cm":"—"}</td><td>${g.head?g.head+" cm":"—"}</td></tr>`).join("")}</table>`;
    }
    if (weekBooks.length > 0) {
      sections += `<h2>📖 Livres</h2>${weekBooks.map(b=>`<div class="tag">${b.title} ${"⭐".repeat(b.interest||0)}</div>`).join("")}`;
    }
    if (weekNotes.length > 0) {
      sections += `<h2>📝 Notes</h2>${weekNotes.sort((a,b)=>a.date.localeCompare(b.date)).map(n=>`<blockquote><b>${new Date((n.date||"")+"T12:00:00").toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})}</b><br>${n.mood||""} ${n.text||""}</blockquote>`).join("")}`;
    }

    const weekStartFmt = new Date(weekStart+"T12:00:00").toLocaleDateString("fr-FR",{day:"numeric",month:"long"});
    const weekEndFmt   = new Date(weekEnd+"T12:00:00").toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"});
    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Rapport hebdomadaire — ${data.baby.name}</title><style>${CSS}</style></head><body><h1>📊 Rapport hebdomadaire — ${data.baby.name}</h1><p class="sub">${weekStartFmt} – ${weekEndFmt}${age?` · ${age}`:""}</p>${sections}<footer>Généré le ${new Date().toLocaleDateString("fr-FR")} — Baby Tracker</footer></body></html>`;
    downloadBlob(html, `rapport-semaine-${data.baby.name||"bebe"}-${weekStart}.html`);
  };

  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 900, color: theme.text, marginBottom: 20 }}>📄 Rapports</div>
      <Card onClick={exportDayReport} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
        <span style={{ fontSize: 28 }}>📄</span>
        <div>
          <div style={{ fontWeight: 800, fontSize: 14, color: theme.text }}>Rapport du jour</div>
          <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 2 }}>Toutes les entrées d'aujourd'hui</div>
        </div>
      </Card>
      <Card onClick={exportWeekReport} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
        <span style={{ fontSize: 28 }}>📊</span>
        <div>
          <div style={{ fontWeight: 800, fontSize: 14, color: theme.text }}>Rapport hebdomadaire</div>
          <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 2 }}>Les 7 derniers jours</div>
        </div>
      </Card>
      <div style={{ fontSize: 11, color: theme.textMuted, textAlign: "center", marginTop: 16, lineHeight: 1.6 }}>
        📱 Le rapport se télécharge en HTML.<br/>
        Ouvrez-le dans Safari/Chrome → Partager → Imprimer pour le convertir en PDF.
      </div>
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

// ─── Utilitaire : compression image → base64 ───
const compressImage = (file, maxDim = 1200, quality = 0.7) =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const drawToBase64 = (dim, q) => {
          const scale = Math.min(dim / img.width, dim / img.height, 1);
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
          return canvas.toDataURL("image/jpeg", q);
        };
        let result = drawToBase64(maxDim, quality);
        // Si > 200KB en base64 (~266KB raw), recompresse une fois
        if (result.length > 266000) result = drawToBase64(900, 0.5);
        resolve(result);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

// ─── SECTION: Bibliothèque ───
const BooksSection = ({ data, update }) => {
  const { theme } = useTheme();
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [title, setTitle] = useState("");
  const [interest, setInterest] = useState(3);
  const [date, setDate] = useState(todayStr());
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState("recent");
  const [viewPhoto, setViewPhoto] = useState(null);

  const books = [...(data.books || [])].sort((a, b) => {
    if (sortMode === "interestDesc") return (b.interest - a.interest) || (b.date || "").localeCompare(a.date || "");
    if (sortMode === "interestAsc")  return (a.interest - b.interest) || (b.date || "").localeCompare(a.date || "");
    return (b.date || "").localeCompare(a.date || "");
  });
  const filtered = search.trim() ? books.filter(b => b.title.toLowerCase().includes(search.trim().toLowerCase())) : books;

  const resetForm = () => { setTitle(""); setInterest(3); setDate(todayStr()); setNote(""); setPhoto(null); setEditId(null); };
  const openAdd = () => { resetForm(); setModal(true); };
  const openEdit = (b) => { setEditId(b.id); setTitle(b.title); setInterest(b.interest || 3); setDate(b.date); setNote(b.note || ""); setPhoto(b.photo || null); setModal(true); };

  const save = () => {
    if (!title.trim()) return;
    if (editId) {
      update(d => { const b = d.books.find(x => x.id === editId); if (b) { b.title = title.trim(); b.interest = interest; b.date = date; b.note = note; b.photo = photo; } });
    } else {
      update(d => { d.books.push({ id: uid(), title: title.trim(), interest, date, note, photo }); });
    }
    setModal(false); resetForm();
  };

  const remove = (id) => update(d => { d.books = d.books.filter(x => x.id !== id); });

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Preview instantané avant compression
    setPhoto(URL.createObjectURL(file));
    setPhotoLoading(true);
    try {
      setPhoto(await compressImage(file));
    } catch (err) {
      console.error("Compression error:", err);
      alert("Erreur lors du traitement de la photo : " + err.message);
      setPhoto(null);
    } finally {
      setPhotoLoading(false);
    }
  };

  const total = books.length;
  const byStars = [5, 4, 3, 2, 1].map(s => ({ stars: s, count: books.filter(b => b.interest === s).length }));
  const maxCount = Math.max(...byStars.map(x => x.count), 1);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, color: theme.text }}>📚 Bibliothèque</div>
          <div style={{ fontSize: 13, color: theme.textMuted, fontWeight: 600 }}>{total} livre{total !== 1 ? "s" : ""} lus</div>
        </div>
        <Btn onClick={openAdd} small>+ Ajouter</Btn>
      </div>

      {/* Tri */}
      {total > 0 && (
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          {[["recent","📅 Récent"],["interestDesc","⭐ Intérêt ↓"],["interestAsc","⭐ Intérêt ↑"]].map(([mode, label]) => (
            <Chip key={mode} active={sortMode === mode} onClick={() => setSortMode(mode)} color="#F59E0B">{label}</Chip>
          ))}
        </div>
      )}

      {/* Stats */}
      {total > 0 && (
        <Card style={{ marginBottom: 16 }}>
          {byStars.filter(x => x.count > 0).map(({ stars, count }) => (
            <div key={stars} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
              <span style={{ fontSize: 11, width: 58, flexShrink: 0, letterSpacing: -1 }}>{"⭐".repeat(stars)}</span>
              <div style={{ flex: 1, height: 6, background: theme.subtle, borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(count / maxCount) * 100}%`, background: "linear-gradient(90deg, #FCD34D, #F59E0B)", borderRadius: 4, transition: "width .4s" }} />
              </div>
              <span style={{ fontSize: 11, color: theme.textMuted, fontWeight: 700, width: 16, textAlign: "right" }}>{count}</span>
            </div>
          ))}
        </Card>
      )}

      {/* Recherche */}
      {total > 10 && (
        <div style={{ marginBottom: 14 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Rechercher un titre..."
            style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: `1.5px solid ${theme.inputBorder}`, background: theme.input, color: theme.text, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
        </div>
      )}

      {filtered.length === 0 && <EmptyState emoji="📚" text={search ? "Aucun résultat" : "Aucun livre pour l'instant"} />}
      {filtered.map(b => (
        <Card key={b.id} onClick={() => openEdit(b)} style={{ marginBottom: 10, cursor: "pointer" }}>
          <div style={{ display: "flex", gap: 12 }}>
            {b.photo
              ? <img src={b.photo} alt="" onClick={e => { e.stopPropagation(); setViewPhoto(b.photo); }} style={{ width: 60, height: 60, borderRadius: 10, objectFit: "cover", flexShrink: 0, cursor: "zoom-in" }} />
              : <div style={{ width: 60, height: 60, borderRadius: 10, background: theme.subtle, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>📖</div>
            }
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: theme.text, marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.title}</div>
              <div style={{ fontSize: 13, marginBottom: 3, letterSpacing: -1 }}>{"⭐".repeat(b.interest || 0)}</div>
              <div style={{ fontSize: 12, color: theme.textMuted }}>{fmt(b.date)}{b.note ? ` · ${b.note}` : ""}</div>
            </div>
            <span onClick={e => { e.stopPropagation(); remove(b.id); }}><IconBtn>🗑</IconBtn></span>
          </div>
        </Card>
      ))}

      <Modal open={modal} onClose={() => { setModal(false); resetForm(); }} title={editId ? "Modifier le livre" : "Ajouter un livre"}>
        <Input label="Titre du livre" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Petit ours brun" autoFocus />

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: theme.textMuted, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Intérêt de bébé</label>
          <div style={{ display: "flex", gap: 4 }}>
            {[1, 2, 3, 4, 5].map(s => (
              <span key={s} onClick={() => setInterest(s)} style={{ fontSize: 30, cursor: "pointer", transition: "transform .1s", display: "inline-block", lineHeight: 1 }}
                onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.25)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}>
                {s <= interest ? "⭐" : "☆"}
              </span>
            ))}
          </div>
        </div>

        <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} />

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: theme.textMuted, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Photo (optionnel)</label>
          {photo && <img src={photo} alt="" style={{ width: "100%", maxHeight: 320, objectFit: "contain", borderRadius: 10, marginBottom: 8, background: theme.subtle }} />}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <label style={{ flex: 1, padding: "9px 14px", borderRadius: 12, border: `1.5px dashed ${theme.inputBorder}`, background: theme.subtle, color: theme.textMuted, fontSize: 13, fontWeight: 700, cursor: "pointer", textAlign: "center" }}>
              {photoLoading ? "Compression..." : photo ? "Changer la photo" : "📷 Choisir une photo"}
              <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: "none" }} />
            </label>
            {photo && <Btn variant="danger" small onClick={() => setPhoto(null)}>✕</Btn>}
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: theme.textMuted, marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>Note (optionnel)</label>
          <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Réaction de bébé, pages préférées..." rows={3}
            style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: `1.5px solid ${theme.inputBorder}`, background: theme.input, color: theme.text, fontSize: 14, outline: "none", resize: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
        </div>

        <Btn onClick={save} disabled={!title.trim()} full>{editId ? "Modifier" : "Enregistrer"}</Btn>
      </Modal>
      <PhotoViewer src={viewPhoto} onClose={() => setViewPhoto(null)} />
    </div>
  );
};

// ─── SECTION: Exercices / Éveil ───
const DEFAULT_EXERCISES = {
  0: [
    { label: "Peau à peau", tip: "Posez bébé torse nu contre votre peau. 20-30min idéal. Régule sa température, son rythme cardiaque et renforce le lien." },
    { label: "Tummy time (1-2min)", tip: "Sur une surface ferme, bébé sur le ventre. Restez face à lui pour l'encourager. Renforce le cou et prépare le retournement." },
    { label: "Suivi visuel doigt", tip: "Déplacez lentement votre doigt à 30cm de ses yeux, de gauche à droite. Stimule la coordination oculaire dès les premiers jours." },
    { label: "Musique douce", tip: "Chantez ou mettez de la musique calme. Le son de votre voix est le plus stimulant pour lui à cet âge." },
    { label: "Massage bébé", tip: "Avec une huile neutre, massez doucement bras, jambes, ventre (dans le sens des aiguilles d'une montre). Apaise et aide la digestion." },
    { label: "Parler/chanter", tip: "Racontez ce que vous faites : le bain, le change, la cuisine. Il absorbe les intonations et le rythme du langage." },
  ],
  1: [
    { label: "Tummy time (3-5min)", tip: "Augmentez progressivement la durée. Placez un miroir ou un jouet devant lui pour motiver l'effort de tête." },
    { label: "Mobile au-dessus", tip: "Suspendez un mobile contrasté (noir/blanc/rouge) à 30-40cm. Il l'observe quelques minutes par session." },
    { label: "Hochet sonore", tip: "Secouez doucement un hochet de chaque côté de sa tête. Il va tourner les yeux puis la tête vers le son." },
    { label: "Noir & blanc contrastes", tip: "Montrez des flashcards ou livres noir/blanc. La vision des contrastes est optimale avant 3 mois." },
    { label: "Berceuse", tip: "Répétez les mêmes chansons : la mémorisation des mélodies familières débute très tôt." },
    { label: "Gym douce bras/jambes", tip: "Allongé sur le dos, bougez doucement ses bras et jambes en alternance, comme s'il pédalait. Stimule la conscience corporelle." },
  ],
  2: [
    { label: "Tummy time (5-10min)", tip: "À 2 mois, bébé commence à lever la tête à 45°. Encouragez avec votre voix placée devant lui." },
    { label: "Attraper un jouet", tip: "Suspendez un jouet léger à portée de sa main. Il va tenter de l'attraper — motricité volontaire qui débute." },
    { label: "Miroir devant bébé", tip: "Les bébés adorent les miroirs. Placez-en un pendant le tummy time. Stimule la curiosité et l'attention." },
    { label: "Lecture d'images", tip: "Lisez à voix haute en montrant les images du doigt. Le rythme de votre voix associé aux images construit le langage." },
    { label: "Jeu de coucou", tip: "Cachez votre visage derrière vos mains, puis réapparaissez avec un sourire. Il commence à anticiper la réapparition." },
    { label: "Toucher textures", tip: "Faites toucher des surfaces douces, rugueuses, lisses. Chaque texture active de nouvelles connexions sensorielles." },
  ],
  3: [
    { label: "Tummy time (10min)", tip: "À 3 mois, visez 10min d'affilée. Bébé devrait lever la tête à 90° et s'appuyer sur les avant-bras." },
    { label: "Rouler sur le côté", tip: "Allongé sur le dos, guidez doucement ses jambes d'un côté pour initier le roulement. Prépare le retournement." },
    { label: "Jouet sonore chercher", tip: "Faites sonner un hochet hors de son champ visuel. Il va tourner la tête pour localiser le son." },
    { label: "Bulle de savon", tip: "Soufflez des bulles devant lui. Il les suit des yeux — excellent pour le tracking visuel et la surprise." },
    { label: "Chanson avec gestes", tip: "Les comptines avec gestes (Promenons-nous dans les bois...) associent son, rythme et mouvement." },
    { label: "Portique d'éveil", tip: "Placez bébé sous un portique avec jouets suspendus. Il va tenter de les frapper avec les bras et les jambes." },
  ],
  4: [
    { label: "Tummy time (15min)", tip: "Objectif : 15min par session. Il commence à se redresser sur les mains. Signe que les épaules et le dos renforcent." },
    { label: "Assis soutenu", tip: "Installez bébé assis en le soutenant dans le dos. Quelques minutes. Nouveau point de vue = nouvelle stimulation." },
    { label: "Jouet main à main", tip: "Donnez un jouet léger dans une main. Il va le passer dans l'autre — transfert bimanuel, étape clé du développement." },
    { label: "Livre tissu", tip: "Les livres en tissu aux textures variées combinent lecture, toucher et manipulation. Adaptés à la bouche aussi." },
    { label: "Jeu de pieds", tip: "Attachez un petit grelot à sa cheville. Il découvre que ses mouvements créent du son — notion de cause à effet." },
    { label: "Musique variée", tip: "Variez les styles : classique, jazz, world. La diversité musicale enrichit les connexions auditives." },
  ],
  5: [
    { label: "Position assise aidée", tip: "Asseyez-le entre vos jambes ou avec un soutien. Il va commencer à se tenir quelques secondes seul." },
    { label: "Attraper petits objets", tip: "Proposez des objets de taille variée. La pince grossière (toute la main) se développe, prémisse de la pince fine." },
    { label: "Jeu du miroir", tip: "Asseyez-le devant un miroir et observez ses réactions. Il commence à interagir avec son reflet." },
    { label: "Boîte à trésors textures", tip: "Une boîte avec objets du quotidien (brosse, tissu, cuillère en bois). Exploration sensorielle libre et sécurisée." },
    { label: "Comptines gestuelles", tip: "Les chansons avec mouvements des mains (Bateau sur l'eau...) développent l'imitation motrice." },
    { label: "Rouler ventre-dos", tip: "Il maîtrise bientôt le retournement complet. Encouragez avec un jouet légèrement hors de portée." },
  ],
  6: [
    { label: "4 pattes encourager", tip: "Placez un jouet attractif légèrement hors de portée pour encourager les déplacements en rampant." },
    { label: "Tour de cubes", tip: "Empilez 2 cubes devant lui et laissez-le les faire tomber. Puis montrez-lui à les empiler. Cause à effet + motricité." },
    { label: "Jeu cache-cache objet", tip: "Cachez un jouet sous un foulard devant ses yeux. Il comprend que l'objet existe encore : permanence de l'objet." },
    { label: "Lecture interactive", tip: "Pointez les images et nommez-les. Attendez sa réaction avant de tourner la page. Dialogue préverbal." },
    { label: "Boire au gobelet", tip: "Proposez un gobelet à bec avec quelques ml d'eau. Stimule la coordination main-bouche et prépare la diversification." },
    { label: "Pataugeoire/eau", tip: "Un bac d'eau tiède avec gobelets et jouets flottants. L'eau est une stimulation sensorielle forte, très appréciée." },
  ],
  7: [
    { label: "Ramper/4 pattes", tip: "Si bébé est en 4 pattes mais ne rampe pas, rampez vous-même devant lui. L'imitation est son moteur principal." },
    { label: "Empiler 2 cubes", tip: "Montrez-lui comment empiler, puis guidez ses mains. La coordination bimanuelle et la planification motrice se développent." },
    { label: "Coucou-caché avancé", tip: "Cachez-vous derrière un meuble et réapparaissez. Il comprend que vous existez même hors de sa vue." },
    { label: "Instruments musique", tip: "Tambourin, maracas, xylophone jouet. Créer du son volontairement renforce la notion d'action-réaction." },
    { label: "Nommer objets", tip: "Pointez et nommez tout dans son environnement. Il enregistre des dizaines de mots passifs avant de les dire." },
    { label: "Boîte à formes", tip: "Même sans réussir, l'essai de faire entrer une forme est excellent pour la résolution de problèmes." },
  ],
  8: [
    { label: "Cabotage meubles", tip: "Placez des jouets attractifs sur le canapé pour l'encourager à se déplacer debout en tenant le bord." },
    { label: "Pincer petits objets", tip: "Des céréales soufflées ou petits morceaux mous à ramasser. La pince fine pouce-index se précise." },
    { label: "Pointer images livre", tip: "Demandez 'où est le chien ?' Il va bientôt pointer. Lie le mot à l'image avant même de parler." },
    { label: "Jouer avec balle", tip: "Une balle légère à pousser, faire rouler, attraper. Développe la coordination oculomotrice et l'anticipation." },
    { label: "Danser avec musique", tip: "Tenez-le et dansez, ou posez-le debout et laissez-le rebondir. Le rythme musical est inné." },
    { label: "Jeu d'imitation", tip: "Faites des grimaces, tapez des mains, agitez les bras. Il imite, puis prend l'initiative : c'est lui qui dirige le jeu." },
  ],
  9: [
    { label: "Debout appui", tip: "Laissez-le se mettre debout en tenant votre doigt ou un meuble stable. Ne forcez pas, attendez son initiative." },
    { label: "Jeu contenant/contenu", tip: "Une boîte et des objets à mettre dedans/enlever. Répété à l'infini, c'est une façon d'explorer la logique spatiale." },
    { label: "Téléphone jouet", tip: "Parler dans un téléphone jouet stimule le langage. Il va bientôt faire semblant de téléphoner : jeu symbolique naissant." },
    { label: "Puzzle 2 pièces", tip: "Les puzzles encastrables à grosses poignées développent la résolution de problèmes et la motricité fine." },
    { label: "Gribouillage", tip: "Crayon épais ou doigt dans la purée. Les premiers traits sont aléatoires mais bébé comprend que son geste laisse une trace." },
    { label: "Marche avec aide", tip: "Tenez ses deux mains et guidez les premiers pas. Ou utilisez un trotteur derrière." },
  ],
  10: [
    { label: "Premiers pas aidés", tip: "Tenez-lui une main et encouragez. Certains marchent seuls à 10 mois, d'autres à 15 — la fourchette normale est large." },
    { label: "Empiler 3+ cubes", tip: "La tour qui tombe est aussi enrichissante que la tour debout. Il anticipe, expérimente, recommence." },
    { label: "Nommer parties corps", tip: "Où est le nez de bébé ? La bouche ? Pointez sur lui et sur vous. Il comprend avant de répondre." },
    { label: "Jeu de balle", tip: "Assis face à lui, faites rouler la balle et attendez qu'il la renvoie. Tour de rôle = base de la conversation." },
    { label: "Enfiler gros anneaux", tip: "Les anneaux à enfiler sur un axe développent la coordination œil-main et la planification du geste." },
    { label: "Lecture quotidienne", tip: "10 min de lecture par jour à cet âge = impact mesurable sur le vocabulaire à 2 ans. La régularité prime sur la durée." },
  ],
  11: [
    { label: "Marche tenue 1 main", tip: "Proposez une main, pas deux. Il doit gérer l'équilibre avec un seul point d'appui — étape vers la marche libre." },
    { label: "Crayons cire gros", tip: "Des crayons à section triangulaire, faciles à tenir. Le gribouillage développe la préhension et l'expression." },
    { label: "Jeu symbolique (poupée)", tip: "Donnez à manger à une poupée, mettez-la au lit. Il rejoue des scènes de sa vie — cognition sociale en développement." },
    { label: "Escaliers à 4 pattes", tip: "Guidez-le pour monter 2-3 marches à 4 pattes, toujours surveillé. Confiance motrice et proprioception." },
    { label: "Chansons actions", tip: "Tête, épaules, genoux, pieds... Il pointe les parties du corps nommées. Vocabulaire corporel + coordination." },
    { label: "Jeu sable/eau", tip: "Remplir, vider, transvaser. Ces gestes simples développent la motricité fine et la compréhension du volume." },
  ],
  12: [
    { label: "Marche libre", tip: "Laissez-le explorer pieds nus sur différentes surfaces. Les chutes font partie de l'apprentissage — restez proche sans retenir." },
    { label: "Jeu encastrement", tip: "Les puzzles et boîtes à formes sont passionnants à 12 mois. L'échec répété suivi du succès construit la persévérance." },
    { label: "Gribouillage libre", tip: "Grandes feuilles, crayons épais. L'objectif n'est pas de dessiner mais de voir que son geste crée quelque chose." },
    { label: "Ballon taper pied", tip: "Un ballon léger à pousser avec le pied — coordination motrice complexe qui prépare les jeux de balle futurs." },
    { label: "Jeu construction", tip: "Empiler, aligner, renverser. Variez les matériaux : cubes, gobelets, boîtes. L'architecture spontanée révèle sa logique." },
    { label: "Danse libre", tip: "Mettez de la musique et laissez-le bouger librement. La danse spontanée est excellente pour l'équilibre et la joie." },
  ],
};

const ExercisesSection = ({ data, update }) => {
  const { theme } = useTheme();
  const [addModal, setAddModal] = useState(false);
  const [customName, setCustomName] = useState("");
  const [expandedTip, setExpandedTip] = useState(null);

  const birthDate = data.baby?.birthDate;
  const ageMonths = birthDate ? Math.floor((Date.now() - new Date(birthDate)) / (30.44 * 86400000)) : 0;

  const bucketKeys = Object.keys(DEFAULT_EXERCISES).map(Number).sort((a, b) => a - b);
  const bucket = bucketKeys.filter(k => k <= Math.max(0, ageMonths)).pop() ?? 0;

  const normalize = (e) => typeof e === "string" ? { label: e, tip: null } : e;
  const predefined = (DEFAULT_EXERCISES[bucket] || []).map(normalize);
  const custom = Array.isArray(data.customExercises?.[bucket]) ? data.customExercises[bucket] : [];
  const allLabels = [...predefined.map(e => e.label), ...custom];

  const today = todayStr();
  const todayChecks = data.exercises?.[today] || {};
  const done = allLabels.filter(l => todayChecks[l]).length;

  const toggle = (label) => update(d => {
    if (!d.exercises) d.exercises = {};
    if (!d.exercises[today]) d.exercises[today] = {};
    if (d.exercises[today][label]) delete d.exercises[today][label];
    else d.exercises[today][label] = true;
  });

  const addCustom = () => {
    const name = customName.trim();
    if (!name) return;
    update(d => {
      if (!d.customExercises) d.customExercises = {};
      if (!Array.isArray(d.customExercises[bucket])) d.customExercises[bucket] = [];
      if (!d.customExercises[bucket].includes(name)) d.customExercises[bucket].push(name);
    });
    setCustomName(""); setAddModal(false);
  };

  const deleteCustom = (name) => update(d => {
    if (Array.isArray(d.customExercises?.[bucket]))
      d.customExercises[bucket] = d.customExercises[bucket].filter(e => e !== name);
    if (d.exercises?.[today]?.[name]) delete d.exercises[today][name];
  });

  const toggleTip = (label) => setExpandedTip(prev => prev === label ? null : label);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, color: theme.text }}>🧘 Éveil & Exercices</div>
          <div style={{ fontSize: 13, color: theme.textMuted, fontWeight: 600 }}>
            {birthDate ? `${ageMonths} mois · Exercices ${bucket} mois` : "Date de naissance non définie"}
          </div>
        </div>
        <Btn onClick={() => setAddModal(true)} small>+ Perso</Btn>
      </div>

      <div style={{ fontSize: 13, color: theme.textMuted, fontWeight: 600, marginBottom: 8 }}>{done}/{allLabels.length} faits aujourd'hui</div>
      <div style={{ background: theme.subtle, borderRadius: 10, height: 8, marginBottom: 20, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${allLabels.length ? (done / allLabels.length) * 100 : 0}%`, background: "linear-gradient(90deg, #A78BFA, #818CF8)", borderRadius: 10, transition: "width .4s" }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {predefined.map(({ label, tip }) => {
          const checked = !!todayChecks[label];
          const open = expandedTip === label;
          return (
            <div key={label} style={{ borderRadius: 14, background: checked ? "#EDE9FE" : theme.card, border: `2px solid ${checked ? "#A78BFA" : theme.border}`, transition: "all .2s", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", padding: "12px 13px", gap: 10 }}>
                <div
                  onClick={() => toggle(label)}
                  style={{ width: 26, height: 26, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, background: checked ? "#7C3AED" : theme.subtle, color: checked ? "#fff" : theme.textMuted, cursor: "pointer", transition: "all .2s" }}
                >
                  {checked ? "✓" : ""}
                </div>
                <div onClick={() => toggle(label)} style={{ flex: 1, fontWeight: 700, fontSize: 13, color: checked ? "#5B21B6" : theme.text, cursor: "pointer", textDecoration: checked ? "line-through" : "none" }}>
                  {label}
                </div>
                {tip && (
                  <div
                    onClick={() => toggleTip(label)}
                    style={{ fontSize: 16, cursor: "pointer", opacity: open ? 1 : 0.5, color: "#7C3AED", flexShrink: 0, lineHeight: 1, padding: "2px 4px" }}
                    title="Voir l'explication"
                  >ℹ️</div>
                )}
              </div>
              {open && tip && (
                <div style={{ margin: "0 13px 12px", padding: "8px 12px", background: theme.subtle, borderRadius: 10, fontSize: 12, color: theme.textMuted, lineHeight: 1.6 }}>
                  {tip}
                </div>
              )}
            </div>
          );
        })}
        {custom.map(name => {
          const checked = !!todayChecks[name];
          return (
            <div key={name} style={{ padding: "12px 13px", borderRadius: 14, background: checked ? "#EDE9FE" : theme.card, border: `2px dashed ${checked ? "#A78BFA" : "#C4B5FD"}`, transition: "all .2s", display: "flex", alignItems: "center", gap: 10 }}>
              <div
                onClick={() => toggle(name)}
                style={{ width: 26, height: 26, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, background: checked ? "#7C3AED" : theme.subtle, color: checked ? "#fff" : theme.textMuted, cursor: "pointer", transition: "all .2s" }}
              >
                {checked ? "✓" : ""}
              </div>
              <div onClick={() => toggle(name)} style={{ flex: 1, fontWeight: 700, fontSize: 13, color: checked ? "#5B21B6" : theme.text, cursor: "pointer" }}>
                {name} <span style={{ fontSize: 10, color: "#A78BFA", fontWeight: 800 }}>✎</span>
              </div>
              <span onClick={() => deleteCustom(name)} style={{ fontSize: 14, color: theme.textMuted, cursor: "pointer", padding: "2px 4px" }}>✕</span>
            </div>
          );
        })}
      </div>

      {allLabels.length === 0 && <EmptyState emoji="🧘" text="Aucun exercice défini pour cet âge" />}

      <Modal open={addModal} onClose={() => setAddModal(false)} title="Ajouter un exercice">
        <div style={{ fontSize: 12, fontWeight: 700, color: theme.textMuted, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
          Tranche d'âge : <span style={{ color: "#A78BFA" }}>{bucket} mois</span>
        </div>
        <Input label="Nom de l'exercice" value={customName} onChange={e => setCustomName(e.target.value)} placeholder="Ex: Jeu d'eau" autoFocus />
        <Btn onClick={addCustom} disabled={!customName.trim()} full>Ajouter</Btn>
      </Modal>
    </div>
  );
};

// Assure que toutes les clés attendues existent (Firebase peut omettre les tableaux vides)
const sanitize = (val) => {
  const def = defaultState();
  const merged = { ...def, ...(val || {}) };
  ["bottles","diapers","sleep","growth","appointments","notes","medicines","baths","temperature","routines","books","customRecipes"].forEach(k => {
    if (!Array.isArray(merged[k])) merged[k] = [];
  });
  ["foods","teeth","vaccines","milestonesChecked","customFoods","exercises","customExercises","testedRecipes"].forEach(k => {
    if (!merged[k] || typeof merged[k] !== "object" || Array.isArray(merged[k])) merged[k] = {};
  });
  // Garantit que chaque catégorie customFoods est un tableau
  Object.keys(merged.customFoods).forEach(cat => {
    if (!Array.isArray(merged.customFoods[cat])) merged.customFoods[cat] = [];
  });
  // Normalise chaque routine : garantit que items est un tableau
  merged.routines = merged.routines.map(r => ({
    ...r,
    items: Array.isArray(r.items) ? r.items.map(item => ({ checked: false, note: "", ...item })) : []
  }));
  return merged;
};

// ─── SECTION: Routines ───
const RoutinesSection = ({ data, update }) => {
  const { theme } = useTheme();
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null); // null = création, string = édition
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🌅");
  // items: {id: string|null, label: string}[] — id null = nouvelle action
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const EMOJIS = ["🌅", "🌙", "🍽️", "🛁", "💊", "🏋️", "📖", "🎮"];
  const routines = data.routines || [];

  const resetIfNeeded = (id) => {
    update(d => {
      const r = (d.routines||[]).find(x => x.id === id);
      if (r && r.lastResetDate !== todayStr()) {
        r.items.forEach(item => { item.checked = false; item.note = ""; });
        r.lastResetDate = todayStr();
      }
    });
  };

  const openDetail = (id) => { resetIfNeeded(id); setSelected(id); };

  const openCreate = () => {
    setEditId(null);
    setName(""); setEmoji("🌅"); setItems([]); setNewItem("");
    setModalOpen(true);
  };

  const openEdit = (r) => {
    setEditId(r.id);
    setName(r.name);
    setEmoji(r.emoji);
    setItems((r.items||[]).map(i => ({ id: i.id, label: i.label })));
    setNewItem("");
    setModalOpen(true);
  };

  const saveRoutine = () => {
    if (!name.trim()) return;
    if (editId) {
      update(d => {
        const r = (d.routines||[]).find(x => x.id === editId);
        if (!r) return;
        r.name = name.trim();
        r.emoji = emoji;
        // Preserve existing items (by id) to keep checked/note state
        r.items = items.map(item => {
          if (item.id) {
            const existing = r.items.find(x => x.id === item.id);
            return existing ? { ...existing, label: item.label } : { id: uid(), label: item.label, checked: false, note: "" };
          }
          return { id: uid(), label: item.label, checked: false, note: "" };
        });
      });
    } else {
      update(d => {
        if (!d.routines) d.routines = [];
        d.routines.push({ id: uid(), name: name.trim(), emoji, items: items.map(item => ({ id: uid(), label: item.label, checked: false, note: "" })), createdAt: nowStr(), lastResetDate: todayStr(), lastUsed: null });
      });
    }
    setModalOpen(false); setEditId(null);
    setName(""); setEmoji("🌅"); setItems([]);
  };

  const addItem = () => {
    if (!newItem.trim()) return;
    setItems([...items, { id: null, label: newItem.trim() }]);
    setNewItem("");
  };

  const moveItem = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    setItems(next);
  };

  const toggleCheck = (routineId, itemId) => {
    update(d => {
      const r = (d.routines||[]).find(x => x.id === routineId);
      if (r) { const item = r.items.find(x => x.id === itemId); if (item) { item.checked = !item.checked; r.lastUsed = nowStr(); } }
    });
  };

  const setItemNote = (routineId, itemId, note) => {
    update(d => {
      const r = (d.routines||[]).find(x => x.id === routineId);
      if (r) { const item = r.items.find(x => x.id === itemId); if (item) item.note = note; }
    });
  };

  const resetAll = (routineId) => {
    update(d => {
      const r = (d.routines||[]).find(x => x.id === routineId);
      if (r) { r.items.forEach(item => { item.checked = false; item.note = ""; }); r.lastResetDate = todayStr(); }
    });
  };

  const deleteRoutine = (id) => {
    update(d => { d.routines = (d.routines||[]).filter(x => x.id !== id); });
    if (selected === id) setSelected(null);
    setConfirmDelete(null);
  };

  const selectedRoutine = routines.find(r => r.id === selected);

  if (selected && selectedRoutine) {
    const done = selectedRoutine.items.filter(i => i.checked).length;
    const total = selectedRoutine.items.length;
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: theme.text }}>{selectedRoutine.emoji} {selectedRoutine.name}</div>
            <div style={{ fontSize: 13, color: theme.textMuted, fontWeight: 600 }}>{done}/{total} complété{done > 1 ? "s" : ""}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn small variant="secondary" onClick={() => resetAll(selected)}>↺ Réinit.</Btn>
            <Btn small variant="secondary" onClick={() => setSelected(null)}>← Retour</Btn>
          </div>
        </div>
        <div style={{ background: theme.subtle, borderRadius: 10, height: 6, marginBottom: 18, overflow: "hidden" }}>
          <div style={{ height: "100%", width: total ? `${(done/total)*100}%` : "0%", background: "linear-gradient(90deg, #7C3AED, #6366F1)", borderRadius: 10, transition: "width .4s" }} />
        </div>
        {selectedRoutine.items.map(item => (
          <Card key={item.id} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div onClick={() => toggleCheck(selected, item.id)} style={{ width: 24, height: 24, borderRadius: 8, border: `2px solid ${item.checked ? "#7C3AED" : theme.border}`, background: item.checked ? "#7C3AED" : theme.card, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, transition: "all .15s" }}>
                {item.checked && <span style={{ color: "#fff", fontSize: 13, lineHeight: 1 }}>✓</span>}
              </div>
              <span style={{ fontWeight: 700, fontSize: 14, flex: 1, textDecoration: item.checked ? "line-through" : "none", color: item.checked ? theme.textMuted : theme.text }}>{item.label}</span>
            </div>
            <input value={item.note || ""} onChange={e => setItemNote(selected, item.id, e.target.value)} placeholder="Note (optionnel)..." style={{ marginTop: 8, width: "100%", background: "none", border: "none", borderBottom: `1px solid ${theme.border}`, fontSize: 12, color: theme.textMuted, outline: "none", padding: "4px 0", boxSizing: "border-box" }} />
          </Card>
        ))}
        {total === 0 && <EmptyState emoji="🔄" text="Aucune action dans cette routine" />}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: theme.text }}>🔄 Routines</div>
        <Btn small onClick={openCreate}>+ Nouvelle</Btn>
      </div>
      {routines.length === 0 && <EmptyState emoji="🔄" text="Aucune routine créée" />}
      {routines.map(r => {
        const done = r.lastResetDate === todayStr() ? r.items.filter(i => i.checked).length : 0;
        const total = r.items.length;
        return (
          <Card key={r.id} style={{ marginBottom: 10, cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center" }} onClick={() => openDetail(r.id)}>
              <span style={{ fontSize: 28, marginRight: 14 }}>{r.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: theme.text }}>{r.name}</div>
                <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 2 }}>{done}/{total} ✓ aujourd'hui</div>
                {total > 0 && (
                  <div style={{ background: theme.subtle, borderRadius: 6, height: 4, marginTop: 6, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(done/total)*100}%`, background: "#7C3AED", borderRadius: 6, transition: "width .4s" }} />
                  </div>
                )}
              </div>
              {confirmDelete === r.id ? (
                <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
                  <Btn small onClick={() => deleteRoutine(r.id)} style={{ background: "#EF4444", color: "#fff" }}>Supprimer</Btn>
                  <Btn small variant="secondary" onClick={() => setConfirmDelete(null)}>Annuler</Btn>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 4 }} onClick={e => e.stopPropagation()}>
                  <IconBtn onClick={() => openEdit(r)}>✏️</IconBtn>
                  <IconBtn onClick={() => setConfirmDelete(r.id)}>🗑</IconBtn>
                </div>
              )}
            </div>
          </Card>
        );
      })}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditId(null); }} title={editId ? "Modifier la routine" : "Nouvelle routine"}>
        <Input label="Nom" value={name} onChange={e => setName(e.target.value)} placeholder="Routine du matin..." />
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: theme.textMuted, marginBottom: 8 }}>Emoji</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {EMOJIS.map(e => (
              <button key={e} onClick={() => setEmoji(e)} style={{ fontSize: 22, padding: "6px 10px", borderRadius: 10, border: `2px solid ${emoji === e ? "#7C3AED" : theme.border}`, background: emoji === e ? "#EDE9FE" : theme.card, cursor: "pointer" }}>{e}</button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: theme.textMuted, marginBottom: 8 }}>Actions</div>
          {items.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <button onClick={() => moveItem(i, -1)} disabled={i === 0} style={{ fontSize: 9, padding: "1px 4px", borderRadius: 4, border: `1px solid ${theme.border}`, background: theme.subtle, cursor: i === 0 ? "default" : "pointer", color: i === 0 ? theme.textMuted : theme.text, opacity: i === 0 ? 0.35 : 1, lineHeight: 1 }}>↑</button>
                <button onClick={() => moveItem(i, 1)} disabled={i === items.length - 1} style={{ fontSize: 9, padding: "1px 4px", borderRadius: 4, border: `1px solid ${theme.border}`, background: theme.subtle, cursor: i === items.length - 1 ? "default" : "pointer", color: i === items.length - 1 ? theme.textMuted : theme.text, opacity: i === items.length - 1 ? 0.35 : 1, lineHeight: 1 }}>↓</button>
              </div>
              <input
                value={item.label}
                onChange={e => setItems(items.map((it, j) => j === i ? { ...it, label: e.target.value } : it))}
                style={{ flex: 1, border: `1.5px solid ${theme.inputBorder}`, borderRadius: 10, padding: "7px 10px", fontSize: 13, background: theme.input, color: theme.text, outline: "none" }}
              />
              <IconBtn onClick={() => setItems(items.filter((_, j) => j !== i))}>✕</IconBtn>
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <input value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => { if (e.key === "Enter") addItem(); }} placeholder="Ex : Vitamine D..." style={{ flex: 1, border: `1.5px solid ${theme.inputBorder}`, borderRadius: 10, padding: "8px 12px", fontSize: 13, background: theme.input, color: theme.text, outline: "none" }} />
            <Btn small onClick={addItem}>+ Ajouter</Btn>
          </div>
        </div>
        <Btn onClick={saveRoutine} full disabled={!name.trim()}>{editId ? "Enregistrer les modifications" : "Créer la routine"}</Btn>
      </Modal>
    </div>
  );
};

// ═══════════════════════════════════════
//  MAIN APP
// ═══════════════════════════════════════
export default function App() {
  const [data, setData] = useState(null);
  const [section, setSection] = useState("home");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem("baby-tracker-dark") === "true"; } catch { return false; }
  });

  // ─── Profile state ───
  const [profiles, setProfiles] = useState(null);   // { [id]: { name, emoji, color } }
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [activeProfileId, setActiveProfileId] = useState(() => {
    try { return localStorage.getItem("baby-tracker-last-profile") || null; } catch { return null; }
  });

  const saveTimer = useRef(null);
  const ignoreNext = useRef(false);
  const migrated = useRef(false);

  useEffect(() => {
    try { localStorage.setItem("baby-tracker-dark", darkMode); } catch {}
  }, [darkMode]);

  const theme = darkMode ? THEMES.dark : THEMES.light;
  const toggleDark = () => setDarkMode(d => !d);

  // ─── Load profiles meta (+ one-time migration from legacy path) ───
  useEffect(() => {
    const unsub = subscribeToProfilesMeta(async (val) => {
      if (val !== null) {
        setProfiles(val);
        setProfilesLoading(false);
        // Si le profil mémorisé n'existe plus, reset
        setActiveProfileId(prev => {
          if (prev && !val[prev]) {
            try { localStorage.removeItem("baby-tracker-last-profile"); } catch {}
            return null;
          }
          return prev;
        });
        return;
      }
      // First launch: no profiles yet — migrate legacy data
      if (migrated.current) return;
      migrated.current = true;
      const legacy = await loadData();
      const id = uid();
      const meta = { [id]: { name: legacy?.baby?.name || "Bébé", emoji: "👶", color: "#C4B5FD" } };
      await saveProfilesMeta(meta);
      await saveProfileData(id, legacy || defaultState());
      // subscription will fire again with val !== null
    });
    return unsub;
  }, []);

  // ─── Subscribe to active profile data ───
  useEffect(() => {
    if (!activeProfileId) return;
    setLoading(true);
    const unsub = subscribeToProfileData(activeProfileId, (val) => {
      if (ignoreNext.current) { ignoreNext.current = false; return; }
      setData(sanitize(val));
      setLoading(false);
      setSyncing(false);
    });
    return unsub;
  }, [activeProfileId]);

  // ─── Profile actions ───
  const selectProfile = (id) => {
    try { localStorage.setItem("baby-tracker-last-profile", id); } catch {}
    setData(null);
    setSection("home");
    setActiveProfileId(id);
  };

  const switchProfile = () => {
    try { localStorage.removeItem("baby-tracker-last-profile"); } catch {}
    setActiveProfileId(null);
    setData(null);
    setSection("home");
  };

  const handleAddProfile = async (meta) => {
    const id = uid();
    const newMeta = { ...(profiles || {}), [id]: meta };
    await saveProfilesMeta(newMeta);
    await saveProfileData(id, defaultState());
  };

  // ─── Update helper with debounced save ───
  const update = useCallback((fn) => {
    setData(prev => {
      const next = sanitize(JSON.parse(JSON.stringify(prev || {})));
      fn(next);
      next._lastUpdated = new Date().toISOString();
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        setSyncing(true);
        ignoreNext.current = true;
        saveProfileData(activeProfileId, next).then(() => setSyncing(false));
      }, 600);
      return next;
    });
  }, [activeProfileId]);

  // ─── Loading screen ───
  const loadingScreen = (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0D0D18" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 52, marginBottom: 12, animation: "pulse 1.5s infinite" }}>👶</div>
          <div style={{ color: "#A78BFA", fontWeight: 800, fontSize: 15 }}>Connexion...</div>
        </div>
      </div>
    </>
  );

  if (profilesLoading) return loadingScreen;

  // ─── Profile selector (always shown when no active profile) ───
  if (!activeProfileId) return (
    <ThemeContext.Provider value={{ theme, darkMode, toggleDark }}>
      <style>{CSS}</style>
      <ProfileSelector profiles={profiles} onSelect={selectProfile} onAdd={handleAddProfile} />
    </ThemeContext.Provider>
  );

  if (loading) return loadingScreen;

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
        saveProfileData(activeProfileId, initial);
      }} />
    </>
  );

  const SECTIONS = {
    home: <DashboardHome data={data} goTo={setSection} onSwitchProfile={switchProfile} />,
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
    routines: <RoutinesSection data={data} update={update} />,
    exercises: <ExercisesSection data={data} update={update} />,
    books: <BooksSection data={data} update={update} />,
    pdf: <PdfSection data={data} />,
  };

  const navItems = [
    { key: "bottles", emoji: "🍼", label: "Biberon" },
    { key: "diapers", emoji: "🧷", label: "Couche" },
    { key: "home",    emoji: "🏠", label: "Home", isCenter: true },
    { key: "sleep",   emoji: "😴", label: "Sommeil" },
    { key: "routines",emoji: "🔄", label: "Routine" },
  ];

  return (
    <ThemeContext.Provider value={{ theme, darkMode, toggleDark }}>
      <style>{CSS}</style>
      <SyncBadge syncing={syncing} />

      <div style={{ maxWidth: 500, margin: "0 auto", minHeight: "100vh", background: theme.bg, paddingBottom: 100, transition: "background .2s" }}>
        {section !== "home" && (
          <div style={{ display: "flex", alignItems: "center", padding: "14px 16px", background: theme.headerBg, position: "sticky", top: 0, zIndex: 100, borderBottom: `1px solid ${theme.border}` }}>
            <span style={{ fontWeight: 800, fontSize: 15, color: theme.text }}>{data.baby.name}</span>
          </div>
        )}

        <div style={{ padding: "0 14px" }}>
          {SECTIONS[section] || SECTIONS.home}
        </div>

        {/* Bottom nav */}
        <div className="nav-fixed" style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 500, background: `${theme.navBg}F0`, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderTop: `1.5px solid ${theme.navBorder}`, display: "flex", justifyContent: "space-around", alignItems: "flex-end", paddingTop: 8, zIndex: 200, transition: "background .2s" }}>
          {navItems.map(n => {
            if (n.isCenter) return (
              <div key="home" onClick={() => setSection("home")} style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", marginTop: -16 }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: theme.accentGrad, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(129,140,248,.4)", transition: "transform .15s", transform: section === "home" ? "scale(1.08)" : "scale(1)" }}>
                  <span style={{ fontSize: 22 }}>🏠</span>
                </div>
              </div>
            );
            const active = section === n.key;
            return (
              <div key={n.key} onClick={() => setSection(n.key)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, cursor: "pointer", color: active ? "#7C3AED" : theme.textMuted, transition: "color .2s", padding: "4px 8px", minWidth: 44 }}>
                <span style={{ fontSize: 20, transition: "transform .15s", transform: active ? "scale(1.15)" : "scale(1)" }}>{n.emoji}</span>
                <span style={{ fontSize: 10, fontWeight: 800 }}>{n.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </ThemeContext.Provider>
  );
}
