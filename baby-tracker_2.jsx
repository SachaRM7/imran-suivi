import { useState, useEffect, useCallback, useRef } from "react";

// ─── Storage helpers ───
const STORAGE_KEY = "baby-tracker-data";
const loadData = async () => {
  try {
    const res = await window.storage.get(STORAGE_KEY);
    return res ? JSON.parse(res.value) : null;
  } catch { return null; }
};
const saveData = async (data) => {
  try { await window.storage.set(STORAGE_KEY, JSON.stringify(data)); } catch (e) { console.error(e); }
};

// ─── Default milestones by month ───
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
    "Transfert un objet d'une main à l'autre",
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
  ]
};

const TEETH_MAP = [
  { id: "LCI", name: "Incisive centrale inf. gauche", position: "bottom", order: 1, avgMonth: "6-10" },
  { id: "RCI", name: "Incisive centrale inf. droite", position: "bottom", order: 2, avgMonth: "6-10" },
  { id: "LCS", name: "Incisive centrale sup. gauche", position: "top", order: 3, avgMonth: "8-12" },
  { id: "RCS", name: "Incisive centrale sup. droite", position: "top", order: 4, avgMonth: "8-12" },
  { id: "LLS", name: "Incisive latérale sup. gauche", position: "top", order: 5, avgMonth: "9-13" },
  { id: "RLS", name: "Incisive latérale sup. droite", position: "top", order: 6, avgMonth: "9-13" },
  { id: "LLI", name: "Incisive latérale inf. gauche", position: "bottom", order: 7, avgMonth: "10-16" },
  { id: "RLI", name: "Incisive latérale inf. droite", position: "bottom", order: 8, avgMonth: "10-16" },
  { id: "LM1S", name: "1ère molaire sup. gauche", position: "top", order: 9, avgMonth: "13-19" },
  { id: "RM1S", name: "1ère molaire sup. droite", position: "top", order: 10, avgMonth: "13-19" },
  { id: "LM1I", name: "1ère molaire inf. gauche", position: "bottom", order: 11, avgMonth: "14-18" },
  { id: "RM1I", name: "1ère molaire inf. droite", position: "bottom", order: 12, avgMonth: "14-18" },
  { id: "LCanS", name: "Canine sup. gauche", position: "top", order: 13, avgMonth: "16-22" },
  { id: "RCanS", name: "Canine sup. droite", position: "top", order: 14, avgMonth: "16-22" },
  { id: "LCanI", name: "Canine inf. gauche", position: "bottom", order: 15, avgMonth: "17-23" },
  { id: "RCanI", name: "Canine inf. droite", position: "bottom", order: 16, avgMonth: "17-23" },
  { id: "LM2S", name: "2ème molaire sup. gauche", position: "top", order: 17, avgMonth: "25-33" },
  { id: "RM2S", name: "2ème molaire sup. droite", position: "top", order: 18, avgMonth: "25-33" },
  { id: "LM2I", name: "2ème molaire inf. gauche", position: "bottom", order: 19, avgMonth: "23-31" },
  { id: "RM2I", name: "2ème molaire inf. droite", position: "bottom", order: 20, avgMonth: "23-31" },
];

const FOOD_CATEGORIES = {
  "Légumes": ["Carotte", "Courgette", "Haricot vert", "Patate douce", "Potiron", "Petit pois", "Brocoli", "Épinard", "Panais", "Poireau", "Navet", "Betterave", "Artichaut", "Aubergine", "Fenouil", "Chou-fleur", "Tomate", "Avocat", "Maïs"],
  "Fruits": ["Pomme", "Poire", "Banane", "Pêche", "Abricot", "Prune", "Mangue", "Fraise", "Myrtille", "Framboise", "Melon", "Pastèque", "Kiwi", "Orange", "Clémentine", "Raisin", "Cerise", "Ananas"],
  "Féculents": ["Riz", "Pâtes", "Semoule", "Pomme de terre", "Quinoa", "Polenta", "Pain", "Lentilles", "Pois chiches"],
  "Protéines": ["Poulet", "Dinde", "Bœuf", "Veau", "Agneau", "Porc", "Jambon blanc", "Poisson blanc", "Saumon", "Cabillaud", "Œuf", "Tofu"],
  "Produits laitiers": ["Yaourt nature", "Fromage blanc", "Petit suisse", "Gruyère", "Comté", "Kiri", "Vache qui rit"]
};

const VEGGIE_COLORS = {
  "Légumes": "#6BCB77", "Fruits": "#FF6B6B", "Féculents": "#FFD93D",
  "Protéines": "#C084FC", "Produits laitiers": "#60A5FA"
};

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
  setup: false
});

// ─── Helpers ───
const fmt = (d) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
const fmtTime = (d) => new Date(d).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
const fmtFull = (d) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
const today = () => new Date().toISOString().slice(0, 10);
const now = () => new Date().toISOString().slice(0, 16);
const uuid = () => Math.random().toString(36).slice(2, 10);
const babyAgeMonths = (bd) => {
  if (!bd) return 0;
  const b = new Date(bd), n = new Date();
  return Math.max(0, (n.getFullYear() - b.getFullYear()) * 12 + n.getMonth() - b.getMonth());
};
const babyAgeDays = (bd) => {
  if (!bd) return 0;
  return Math.floor((new Date() - new Date(bd)) / 86400000);
};
const babyAgeText = (bd) => {
  if (!bd) return "";
  const days = babyAgeDays(bd);
  if (days < 31) return `${days} jour${days > 1 ? "s" : ""}`;
  const m = Math.floor(days / 30.44);
  const d = days - Math.round(m * 30.44);
  return `${m} mois${d > 0 ? ` et ${d} jour${d > 1 ? "s" : ""}` : ""}`;
};

const todayItems = (arr) => arr.filter(i => i.date?.startsWith(today()) || i.time?.startsWith(today()));

// ─── Icons (inline SVG) ───
const Icon = ({ d, size = 20, color = "currentColor", ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>{d}</svg>
);

const Icons = {
  baby: <Icon d={<><circle cx="12" cy="8" r="4"/><path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/></>}/>,
  bottle: <Icon d={<><path d="M8 2h8l1 5H7z"/><rect x="7" y="7" width="10" height="13" rx="2"/><line x1="12" y1="7" x2="12" y2="2"/></>}/>,
  diaper: <Icon d={<><path d="M4 12a8 8 0 0016 0"/><path d="M4 12V8a2 2 0 012-2h12a2 2 0 012 2v4"/></>}/>,
  food: <Icon d={<><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></>}/>,
  growth: <Icon d={<><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>}/>,
  milestone: <Icon d={<><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>}/>,
  tooth: <Icon d={<><path d="M12 2C8 2 5 5 5 9c0 3 1 6 2 8s2 5 3 5 2-2 2-2 1 2 2 2 2-3 3-5 2-5 2-8c0-4-3-7-7-7z"/></>}/>,
  calendar: <Icon d={<><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>}/>,
  sleep: <Icon d={<><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></>}/>,
  note: <Icon d={<><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></>}/>,
  med: <Icon d={<><path d="M19 14c1.5 0 3-1.2 3-2.7V7a3 3 0 00-3-3h-4c-1.5 0-2.7 1.5-2.7 3"/><path d="M5 10c-1.5 0-3 1.2-3 2.7V17a3 3 0 003 3h4c1.5 0 2.7-1.5 2.7-3"/><path d="M12 2v20"/></>}/>,
  bath: <Icon d={<><path d="M4 12h16a1 1 0 011 1v3a4 4 0 01-4 4H7a4 4 0 01-4-4v-3a1 1 0 011-1z"/><path d="M6 12V5a2 2 0 012-2h1"/></>}/>,
  plus: <Icon d={<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>}/>,
  check: <Icon d={<><polyline points="20 6 9 17 4 12"/></>}/>,
  trash: <Icon d={<><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V3h6v3"/></>} size={16}/>,
  home: <Icon d={<><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>}/>,
  back: <Icon d={<><polyline points="15 18 9 12 15 6"/></>}/>,
  star: <Icon d={<><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>}/>,
  chart: <Icon d={<><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>}/>,
};

// ─── Component: Modal ───
const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "flex-end", justifyContent: "center"
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#fff", borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 500,
        maxHeight: "85vh", overflow: "auto", padding: "24px 20px 32px",
        boxShadow: "0 -8px 40px rgba(0,0,0,0.12)", animation: "slideUp .3s ease"
      }}>
        <div style={{ width: 40, height: 4, background: "#ddd", borderRadius: 4, margin: "0 auto 16px" }} />
        {title && <h3 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 700, fontFamily: "'Nunito', sans-serif" }}>{title}</h3>}
        {children}
      </div>
    </div>
  );
};

// ─── Component: Input ───
const Input = ({ label, ...props }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#666", marginBottom: 4, fontFamily: "'Nunito', sans-serif" }}>{label}</label>}
    <input {...props} style={{
      width: "100%", padding: "10px 14px", borderRadius: 12, border: "2px solid #e8e8e8",
      fontSize: 15, fontFamily: "'Nunito', sans-serif", outline: "none", boxSizing: "border-box",
      transition: "border-color .2s", ...props.style
    }} onFocus={e => e.target.style.borderColor = "#A78BFA"}
      onBlur={e => e.target.style.borderColor = "#e8e8e8"} />
  </div>
);

// ─── Component: Button ───
const Btn = ({ children, variant = "primary", small, ...props }) => {
  const styles = {
    primary: { background: "linear-gradient(135deg, #A78BFA, #818CF8)", color: "#fff" },
    secondary: { background: "#F3F0FF", color: "#7C3AED" },
    danger: { background: "#FEE2E2", color: "#DC2626" },
    ghost: { background: "transparent", color: "#7C3AED" },
  };
  return (
    <button {...props} style={{
      ...styles[variant], border: "none", borderRadius: 14,
      padding: small ? "8px 14px" : "12px 20px",
      fontSize: small ? 13 : 15, fontWeight: 700, fontFamily: "'Nunito', sans-serif",
      cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
      transition: "transform .15s, opacity .15s", ...props.style
    }}
      onMouseDown={e => e.currentTarget.style.transform = "scale(0.96)"}
      onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
    >{children}</button>
  );
};

const Chip = ({ children, active, onClick, color }) => (
  <span onClick={onClick} style={{
    display: "inline-block", padding: "6px 14px", borderRadius: 20,
    fontSize: 13, fontWeight: 600, cursor: onClick ? "pointer" : "default",
    background: active ? (color || "#A78BFA") : "#f5f3ff",
    color: active ? "#fff" : "#6B7280",
    transition: "all .2s", fontFamily: "'Nunito', sans-serif",
    border: active ? "none" : "1px solid #e8e8e8"
  }}>{children}</span>
);

// ─── Sections ───

// Dashboard Home
const DashboardHome = ({ data, setSection }) => {
  const age = babyAgeText(data.baby.birthDate);
  const todayBottles = todayItems(data.bottles);
  const todayDiapers = todayItems(data.diapers);
  const todaySleep = todayItems(data.sleep);
  const totalMl = todayBottles.reduce((s, b) => s + (b.amount || 0), 0);
  const teethCount = Object.keys(data.teeth).length;
  const foodCount = Object.keys(data.foods).filter(k => data.foods[k]).length;
  const nextAppt = data.appointments.filter(a => a.date >= today()).sort((a, b) => a.date.localeCompare(b.date))[0];

  const cards = [
    { key: "bottles", icon: Icons.bottle, label: "Biberons", value: `${todayBottles.length} (${totalMl} ml)`, color: "#818CF8", bg: "#EDE9FE" },
    { key: "diapers", icon: Icons.diaper, label: "Couches", value: `${todayDiapers.length} changées`, color: "#F59E0B", bg: "#FEF3C7" },
    { key: "sleep", icon: Icons.sleep, label: "Sommeil", value: `${todaySleep.length} siestes`, color: "#6366F1", bg: "#E0E7FF" },
    { key: "food", icon: Icons.food, label: "Aliments goûtés", value: `${foodCount} aliments`, color: "#10B981", bg: "#D1FAE5" },
    { key: "growth", icon: Icons.growth, label: "Croissance", value: data.growth.length ? `${data.growth[data.growth.length-1].weight} kg` : "—", color: "#EC4899", bg: "#FCE7F3" },
    { key: "teeth", icon: Icons.tooth, label: "Dents", value: `${teethCount}/20`, color: "#F97316", bg: "#FFEDD5" },
    { key: "milestones", icon: Icons.milestone, label: "Étapes", value: "Voir progrès", color: "#8B5CF6", bg: "#F3E8FF" },
    { key: "appointments", icon: Icons.calendar, label: "RDV", value: nextAppt ? `${fmt(nextAppt.date)}` : "Aucun", color: "#0EA5E9", bg: "#E0F2FE" },
    { key: "medicines", icon: Icons.med, label: "Médicaments", value: `${data.medicines.length} enregistrés`, color: "#EF4444", bg: "#FEE2E2" },
    { key: "baths", icon: Icons.bath, label: "Bains", value: `${todayItems(data.baths).length} aujourd'hui`, color: "#06B6D4", bg: "#CFFAFE" },
    { key: "notes", icon: Icons.note, label: "Journal", value: `${data.notes.length} notes`, color: "#8B5CF6", bg: "#F3E8FF" },
  ];

  return (
    <div>
      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #C4B5FD 0%, #A78BFA 40%, #818CF8 100%)",
        borderRadius: 28, padding: "28px 24px", marginBottom: 24, color: "#fff",
        position: "relative", overflow: "hidden"
      }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
        <div style={{ position: "absolute", bottom: -20, left: -20, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
        <div style={{ fontSize: 14, opacity: 0.9, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>
          {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8, fontFamily: "'Nunito', sans-serif" }}>
          {data.baby.name || "Bébé"} {data.baby.gender === "boy" ? "👶🏻" : "👶🏻"}
        </div>
        {age && <div style={{ fontSize: 16, marginTop: 4, opacity: 0.9, fontWeight: 600 }}>{age}</div>}
      </div>

      {/* Quick stats bar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24, overflowX: "auto", paddingBottom: 4 }}>
        {[
          { emoji: "🍼", val: `${totalMl}ml` },
          { emoji: "🧷", val: todayDiapers.length },
          { emoji: "😴", val: todaySleep.length },
          { emoji: "🦷", val: teethCount },
        ].map((s, i) => (
          <div key={i} style={{
            flex: "0 0 auto", background: "#fff", borderRadius: 16, padding: "10px 18px",
            display: "flex", alignItems: "center", gap: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            border: "1px solid #f0f0f0", fontWeight: 700, fontSize: 15
          }}>
            <span style={{ fontSize: 20 }}>{s.emoji}</span> {s.val}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {cards.map(c => (
          <div key={c.key} onClick={() => setSection(c.key)} style={{
            background: "#fff", borderRadius: 20, padding: "18px 16px", cursor: "pointer",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)", border: "1px solid #f5f5f5",
            transition: "transform .15s, box-shadow .15s",
            display: "flex", flexDirection: "column", gap: 8
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)"; }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 12, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", color: c.color }}>
              {c.icon}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>{c.label}</div>
            <div style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 600 }}>{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Bottles Section ───
const BottlesSection = ({ data, update }) => {
  const [modal, setModal] = useState(false);
  const [amount, setAmount] = useState(120);
  const [time, setTime] = useState(now());
  const [note, setNote] = useState("");
  const add = () => {
    update(d => { d.bottles.push({ id: uuid(), amount: Number(amount), time, note }); });
    setModal(false); setAmount(120); setNote("");
  };
  const remove = (id) => update(d => { d.bottles = d.bottles.filter(b => b.id !== id); });
  const todayB = data.bottles.filter(b => b.time.startsWith(today())).sort((a, b) => b.time.localeCompare(a.time));
  const olderB = data.bottles.filter(b => !b.time.startsWith(today())).sort((a, b) => b.time.localeCompare(a.time));
  const totalToday = todayB.reduce((s, b) => s + b.amount, 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>🍼 Biberons</div>
          <div style={{ fontSize: 13, color: "#9CA3AF", fontWeight: 600 }}>Aujourd'hui : {todayB.length} biberons — {totalToday} ml</div>
        </div>
        <Btn onClick={() => { setTime(now()); setModal(true); }} small>{Icons.plus} Ajouter</Btn>
      </div>

      {/* Quick amounts */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {[60, 90, 120, 150, 180, 210, 240].map(ml => (
          <Btn key={ml} variant="secondary" small onClick={() => {
            update(d => { d.bottles.push({ id: uuid(), amount: ml, time: new Date().toISOString().slice(0, 16), note: "" }); });
          }}>{ml} ml</Btn>
        ))}
      </div>

      {todayB.map(b => (
        <div key={b.id} style={{
          display: "flex", alignItems: "center", padding: "14px 16px", marginBottom: 8,
          background: "#fff", borderRadius: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          border: "1px solid #f0f0f0"
        }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginRight: 14 }}>🍼</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{b.amount} ml</div>
            <div style={{ fontSize: 12, color: "#9CA3AF" }}>{fmtTime(b.time)} {b.note && `· ${b.note}`}</div>
          </div>
          <span onClick={() => remove(b.id)} style={{ cursor: "pointer", color: "#D1D5DB" }}>{Icons.trash}</span>
        </div>
      ))}

      {olderB.length > 0 && (
        <details style={{ marginTop: 16 }}>
          <summary style={{ fontSize: 13, fontWeight: 700, color: "#9CA3AF", cursor: "pointer" }}>Historique ({olderB.length})</summary>
          {olderB.slice(0, 30).map(b => (
            <div key={b.id} style={{ display: "flex", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f5f5f5", fontSize: 13 }}>
              <span style={{ flex: 1, fontWeight: 600 }}>{b.amount} ml</span>
              <span style={{ color: "#9CA3AF" }}>{fmt(b.time)} {fmtTime(b.time)}</span>
              <span onClick={() => remove(b.id)} style={{ cursor: "pointer", color: "#D1D5DB", marginLeft: 8 }}>{Icons.trash}</span>
            </div>
          ))}
        </details>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Ajouter un biberon">
        <Input label="Quantité (ml)" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
        <Input label="Heure" type="datetime-local" value={time} onChange={e => setTime(e.target.value)} />
        <Input label="Note (optionnel)" value={note} onChange={e => setNote(e.target.value)} placeholder="Ex: Refusé après 60ml" />
        <Btn onClick={add} style={{ width: "100%", justifyContent: "center", marginTop: 8 }}>Enregistrer</Btn>
      </Modal>
    </div>
  );
};

// ─── Diapers Section ───
const DiapersSection = ({ data, update }) => {
  const [modal, setModal] = useState(false);
  const [type, setType] = useState("pipi");
  const [time, setTime] = useState(now());
  const [note, setNote] = useState("");
  const add = () => {
    update(d => { d.diapers.push({ id: uuid(), type, time, note }); });
    setModal(false); setNote("");
  };
  const remove = (id) => update(d => { d.diapers = d.diapers.filter(x => x.id !== id); });
  const todayD = data.diapers.filter(d => d.time.startsWith(today())).sort((a, b) => b.time.localeCompare(a.time));
  const emoji = { pipi: "💧", caca: "💩", mixte: "💧💩" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>🧷 Couches</div>
          <div style={{ fontSize: 13, color: "#9CA3AF", fontWeight: 600 }}>Aujourd'hui : {todayD.length} changées</div>
        </div>
        <Btn onClick={() => { setTime(now()); setModal(true); }} small>{Icons.plus} Ajouter</Btn>
      </div>

      {/* Quick add */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {["pipi", "caca", "mixte"].map(t => (
          <Btn key={t} variant="secondary" onClick={() => {
            update(d => { d.diapers.push({ id: uuid(), type: t, time: new Date().toISOString().slice(0, 16), note: "" }); });
          }} style={{ flex: 1, justifyContent: "center" }}>{emoji[t]} {t}</Btn>
        ))}
      </div>

      {todayD.map(d => (
        <div key={d.id} style={{
          display: "flex", alignItems: "center", padding: "12px 16px", marginBottom: 8,
          background: "#fff", borderRadius: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.04)", border: "1px solid #f0f0f0"
        }}>
          <span style={{ fontSize: 24, marginRight: 14 }}>{emoji[d.type]}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, textTransform: "capitalize" }}>{d.type}</div>
            <div style={{ fontSize: 12, color: "#9CA3AF" }}>{fmtTime(d.time)} {d.note && `· ${d.note}`}</div>
          </div>
          <span onClick={() => remove(d.id)} style={{ cursor: "pointer", color: "#D1D5DB" }}>{Icons.trash}</span>
        </div>
      ))}

      <Modal open={modal} onClose={() => setModal(false)} title="Ajouter une couche">
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {["pipi", "caca", "mixte"].map(t => (
            <Chip key={t} active={type === t} onClick={() => setType(t)} color="#F59E0B">{emoji[t]} {t}</Chip>
          ))}
        </div>
        <Input label="Heure" type="datetime-local" value={time} onChange={e => setTime(e.target.value)} />
        <Input label="Note" value={note} onChange={e => setNote(e.target.value)} placeholder="Consistance, couleur..." />
        <Btn onClick={add} style={{ width: "100%", justifyContent: "center" }}>Enregistrer</Btn>
      </Modal>
    </div>
  );
};

// ─── Sleep Section ───
const SleepSection = ({ data, update }) => {
  const [modal, setModal] = useState(false);
  const [start, setStart] = useState(now());
  const [end, setEnd] = useState("");
  const [type, setType] = useState("sieste");
  const add = () => {
    update(d => { d.sleep.push({ id: uuid(), start, end: end || null, type }); });
    setModal(false);
  };
  const remove = (id) => update(d => { d.sleep = d.sleep.filter(x => x.id !== id); });
  const sorted = [...data.sleep].sort((a, b) => b.start.localeCompare(a.start));
  const duration = (s) => {
    if (!s.end) return "En cours 💤";
    const mins = Math.round((new Date(s.end) - new Date(s.start)) / 60000);
    const h = Math.floor(mins / 60);
    return h > 0 ? `${h}h${String(mins % 60).padStart(2, "0")}` : `${mins} min`;
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 800 }}>😴 Sommeil</div>
        <Btn onClick={() => { setStart(now()); setEnd(""); setModal(true); }} small>{Icons.plus} Ajouter</Btn>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <Btn variant="secondary" onClick={() => {
          update(d => { d.sleep.push({ id: uuid(), start: new Date().toISOString().slice(0, 16), end: null, type: "sieste" }); });
        }} style={{ flex: 1, justifyContent: "center" }}>💤 Début sieste</Btn>
        <Btn variant="secondary" onClick={() => {
          const ongoing = data.sleep.find(s => !s.end);
          if (ongoing) update(d => {
            const s = d.sleep.find(x => x.id === ongoing.id);
            if (s) s.end = new Date().toISOString().slice(0, 16);
          });
        }} style={{ flex: 1, justifyContent: "center" }}>⏰ Fin sieste</Btn>
      </div>

      {sorted.slice(0, 20).map(s => (
        <div key={s.id} style={{
          display: "flex", alignItems: "center", padding: "12px 16px", marginBottom: 8,
          background: !s.end ? "#EDE9FE" : "#fff", borderRadius: 16,
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)", border: "1px solid #f0f0f0"
        }}>
          <span style={{ fontSize: 22, marginRight: 14 }}>{!s.end ? "💤" : "😴"}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{duration(s)}</div>
            <div style={{ fontSize: 12, color: "#9CA3AF" }}>{fmt(s.start)} {fmtTime(s.start)} {s.end ? `→ ${fmtTime(s.end)}` : ""}</div>
          </div>
          <span onClick={() => remove(s.id)} style={{ cursor: "pointer", color: "#D1D5DB" }}>{Icons.trash}</span>
        </div>
      ))}

      <Modal open={modal} onClose={() => setModal(false)} title="Ajouter sommeil">
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {["sieste", "nuit"].map(t => <Chip key={t} active={type === t} onClick={() => setType(t)} color="#6366F1">{t === "nuit" ? "🌙" : "💤"} {t}</Chip>)}
        </div>
        <Input label="Début" type="datetime-local" value={start} onChange={e => setStart(e.target.value)} />
        <Input label="Fin (vide si en cours)" type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} />
        <Btn onClick={add} style={{ width: "100%", justifyContent: "center" }}>Enregistrer</Btn>
      </Modal>
    </div>
  );
};

// ─── Food Diversification ───
const FoodSection = ({ data, update }) => {
  const [cat, setCat] = useState("Légumes");
  const toggleFood = (name) => {
    update(d => {
      if (d.foods[name]) {
        delete d.foods[name];
      } else {
        d.foods[name] = { date: today(), reaction: "ok" };
      }
    });
  };
  const setReaction = (name, reaction) => {
    update(d => { if (d.foods[name]) d.foods[name].reaction = reaction; });
  };
  const triedCount = Object.keys(data.foods).filter(k => data.foods[k]).length;
  const totalCount = Object.values(FOOD_CATEGORIES).flat().length;

  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>🥕 Diversification alimentaire</div>
      <div style={{ fontSize: 13, color: "#9CA3AF", fontWeight: 600, marginBottom: 16 }}>{triedCount}/{totalCount} aliments goûtés</div>

      {/* Progress bar */}
      <div style={{ background: "#f3f4f6", borderRadius: 10, height: 10, marginBottom: 20, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(triedCount / totalCount) * 100}%`, background: "linear-gradient(90deg, #6BCB77, #10B981)", borderRadius: 10, transition: "width .3s" }} />
      </div>

      {/* Category tabs */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 16, paddingBottom: 4 }}>
        {Object.keys(FOOD_CATEGORIES).map(c => (
          <Chip key={c} active={cat === c} onClick={() => setCat(c)} color={VEGGIE_COLORS[c]}>{c}</Chip>
        ))}
      </div>

      {/* Foods grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {FOOD_CATEGORIES[cat].map(food => {
          const tried = !!data.foods[food];
          const reaction = data.foods[food]?.reaction;
          return (
            <div key={food} onClick={() => toggleFood(food)} style={{
              padding: "12px 14px", borderRadius: 14, cursor: "pointer",
              background: tried ? (reaction === "allergie" ? "#FEE2E2" : reaction === "refusé" ? "#FEF3C7" : "#D1FAE5") : "#fff",
              border: tried ? "2px solid " + (reaction === "allergie" ? "#FCA5A5" : reaction === "refusé" ? "#FCD34D" : "#6BCB77") : "2px solid #f0f0f0",
              transition: "all .2s"
            }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{tried ? "✓ " : ""}{food}</div>
              {tried && (
                <div style={{ display: "flex", gap: 4, marginTop: 6 }} onClick={e => e.stopPropagation()}>
                  {["ok", "refusé", "allergie"].map(r => (
                    <span key={r} onClick={() => setReaction(food, r)} style={{
                      fontSize: 10, padding: "2px 8px", borderRadius: 8, fontWeight: 600,
                      background: reaction === r ? (r === "allergie" ? "#DC2626" : r === "refusé" ? "#F59E0B" : "#10B981") : "#f3f4f6",
                      color: reaction === r ? "#fff" : "#6B7280", cursor: "pointer"
                    }}>{r === "ok" ? "👍" : r === "refusé" ? "🚫" : "⚠️"} {r}</span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Growth Section ───
const GrowthSection = ({ data, update }) => {
  const [modal, setModal] = useState(false);
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [head, setHead] = useState("");
  const [date, setDate] = useState(today());
  const add = () => {
    update(d => { d.growth.push({ id: uuid(), date, weight: Number(weight) || null, height: Number(height) || null, head: Number(head) || null }); });
    setModal(false); setWeight(""); setHeight(""); setHead("");
  };
  const remove = (id) => update(d => { d.growth = d.growth.filter(x => x.id !== id); });
  const sorted = [...data.growth].sort((a, b) => b.date.localeCompare(a.date));

  // Mini chart
  const chartData = [...data.growth].sort((a, b) => a.date.localeCompare(b.date));
  const maxW = Math.max(...chartData.map(g => g.weight || 0), 1);
  const maxH = Math.max(...chartData.map(g => g.height || 0), 1);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 800 }}>📏 Croissance</div>
        <Btn onClick={() => { setDate(today()); setModal(true); }} small>{Icons.plus} Mesure</Btn>
      </div>

      {/* Mini chart */}
      {chartData.length >= 2 && (
        <div style={{ background: "#fff", borderRadius: 16, padding: 16, marginBottom: 16, border: "1px solid #f0f0f0" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#6B7280", marginBottom: 8 }}>Courbe de poids</div>
          <svg viewBox={`0 0 ${Math.max(chartData.length * 50, 200)} 100`} style={{ width: "100%", height: 80 }}>
            <polyline
              points={chartData.map((g, i) => `${i * 50 + 25},${90 - ((g.weight || 0) / maxW) * 70}`).join(" ")}
              fill="none" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            />
            {chartData.map((g, i) => (
              <g key={i}>
                <circle cx={i * 50 + 25} cy={90 - ((g.weight || 0) / maxW) * 70} r="4" fill="#A78BFA" />
                <text x={i * 50 + 25} y={90 - ((g.weight || 0) / maxW) * 70 - 8} textAnchor="middle" fontSize="8" fill="#7C3AED" fontWeight="700">{g.weight}kg</text>
              </g>
            ))}
          </svg>
        </div>
      )}

      {sorted.map(g => (
        <div key={g.id} style={{
          display: "flex", alignItems: "center", padding: "14px 16px", marginBottom: 8,
          background: "#fff", borderRadius: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.04)", border: "1px solid #f0f0f0"
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{fmt(g.date)}</div>
            <div style={{ fontSize: 12, color: "#9CA3AF", display: "flex", gap: 12, marginTop: 4 }}>
              {g.weight && <span>⚖️ {g.weight} kg</span>}
              {g.height && <span>📏 {g.height} cm</span>}
              {g.head && <span>🧠 {g.head} cm</span>}
            </div>
          </div>
          <span onClick={() => remove(g.id)} style={{ cursor: "pointer", color: "#D1D5DB" }}>{Icons.trash}</span>
        </div>
      ))}

      <Modal open={modal} onClose={() => setModal(false)} title="Nouvelle mesure">
        <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} />
        <Input label="Poids (kg)" type="number" step="0.01" value={weight} onChange={e => setWeight(e.target.value)} placeholder="Ex: 6.5" />
        <Input label="Taille (cm)" type="number" step="0.1" value={height} onChange={e => setHeight(e.target.value)} placeholder="Ex: 67" />
        <Input label="Tour de tête (cm)" type="number" step="0.1" value={head} onChange={e => setHead(e.target.value)} placeholder="Ex: 43" />
        <Btn onClick={add} style={{ width: "100%", justifyContent: "center" }}>Enregistrer</Btn>
      </Modal>
    </div>
  );
};

// ─── Milestones Section ───
const MilestonesSection = ({ data, update }) => {
  const ageM = babyAgeMonths(data.baby.birthDate);
  const [month, setMonth] = useState(Math.max(1, Math.min(12, ageM || 1)));
  const toggle = (m, idx) => {
    const key = `${m}-${idx}`;
    update(d => { d.milestonesChecked[key] = !d.milestonesChecked[key]; });
  };
  const items = data.milestones[month] || [];
  const checkedCount = items.filter((_, i) => data.milestonesChecked[`${month}-${i}`]).length;

  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>🏆 Étapes de développement</div>
      <div style={{ fontSize: 13, color: "#9CA3AF", fontWeight: 600, marginBottom: 16 }}>Mois {month} — {checkedCount}/{items.length} acquises</div>

      <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 16, paddingBottom: 4 }}>
        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => {
          const total = (data.milestones[m] || []).length;
          const done = (data.milestones[m] || []).filter((_, i) => data.milestonesChecked[`${m}-${i}`]).length;
          const isAll = total > 0 && done === total;
          return (
            <span key={m} onClick={() => setMonth(m)} style={{
              flex: "0 0 auto", width: 40, height: 40, borderRadius: 12,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: 14, cursor: "pointer",
              background: month === m ? "#A78BFA" : isAll ? "#D1FAE5" : "#f5f3ff",
              color: month === m ? "#fff" : isAll ? "#10B981" : "#6B7280",
              border: m === ageM ? "2px solid #A78BFA" : "none"
            }}>{m}</span>
          );
        })}
      </div>

      {/* Progress bar */}
      <div style={{ background: "#f3f4f6", borderRadius: 10, height: 8, marginBottom: 20, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${items.length ? (checkedCount / items.length) * 100 : 0}%`, background: "linear-gradient(90deg, #A78BFA, #8B5CF6)", borderRadius: 10, transition: "width .3s" }} />
      </div>

      {items.map((item, i) => {
        const checked = !!data.milestonesChecked[`${month}-${i}`];
        return (
          <div key={i} onClick={() => toggle(month, i)} style={{
            display: "flex", alignItems: "center", padding: "14px 16px", marginBottom: 8,
            background: checked ? "#F3E8FF" : "#fff", borderRadius: 16, cursor: "pointer",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)", border: checked ? "2px solid #C4B5FD" : "2px solid #f0f0f0",
            transition: "all .2s"
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8, marginRight: 14,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: checked ? "#A78BFA" : "#f3f4f6", color: checked ? "#fff" : "#D1D5DB",
              transition: "all .2s"
            }}>
              {checked && Icons.check}
            </div>
            <div style={{ fontWeight: 600, fontSize: 14, color: checked ? "#7C3AED" : "#374151", textDecoration: checked ? "line-through" : "none" }}>{item}</div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Teeth Section ───
const TeethSection = ({ data, update }) => {
  const toggle = (id) => {
    update(d => {
      if (d.teeth[id]) delete d.teeth[id];
      else d.teeth[id] = { date: today() };
    });
  };
  const topTeeth = TEETH_MAP.filter(t => t.position === "top");
  const botTeeth = TEETH_MAP.filter(t => t.position === "bottom");
  const count = Object.keys(data.teeth).length;

  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>🦷 Poussées dentaires</div>
      <div style={{ fontSize: 13, color: "#9CA3AF", fontWeight: 600, marginBottom: 20 }}>{count}/20 dents sorties</div>

      <div style={{ background: "#fff", borderRadius: 20, padding: 20, border: "1px solid #f0f0f0", marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#6B7280", marginBottom: 8, textAlign: "center" }}>Mâchoire supérieure</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginBottom: 16 }}>
          {topTeeth.map(t => (
            <div key={t.id} onClick={() => toggle(t.id)} style={{
              width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", fontSize: 18, transition: "all .2s",
              background: data.teeth[t.id] ? "#FEF3C7" : "#f9fafb",
              border: data.teeth[t.id] ? "2px solid #F59E0B" : "2px solid #e5e7eb",
            }} title={t.name}>{data.teeth[t.id] ? "🦷" : "○"}</div>
          ))}
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#6B7280", marginBottom: 8, textAlign: "center" }}>Mâchoire inférieure</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
          {botTeeth.map(t => (
            <div key={t.id} onClick={() => toggle(t.id)} style={{
              width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", fontSize: 18, transition: "all .2s",
              background: data.teeth[t.id] ? "#FEF3C7" : "#f9fafb",
              border: data.teeth[t.id] ? "2px solid #F59E0B" : "2px solid #e5e7eb",
            }} title={t.name}>{data.teeth[t.id] ? "🦷" : "○"}</div>
          ))}
        </div>
      </div>

      <div style={{ fontSize: 13, fontWeight: 700, color: "#6B7280", marginBottom: 8 }}>Détail des dents</div>
      {TEETH_MAP.map(t => (
        <div key={t.id} onClick={() => toggle(t.id)} style={{
          display: "flex", alignItems: "center", padding: "10px 14px", marginBottom: 6,
          background: data.teeth[t.id] ? "#FEF3C7" : "#fff", borderRadius: 12, cursor: "pointer",
          border: "1px solid #f0f0f0", fontSize: 13
        }}>
          <span style={{ marginRight: 10 }}>{data.teeth[t.id] ? "🦷" : "○"}</span>
          <span style={{ flex: 1, fontWeight: 600 }}>{t.name}</span>
          <span style={{ color: "#9CA3AF", fontSize: 11 }}>{t.avgMonth} mois</span>
        </div>
      ))}
    </div>
  );
};

// ─── Appointments Section ───
const AppointmentsSection = ({ data, update }) => {
  const [modal, setModal] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(today());
  const [time, setTime] = useState("09:00");
  const [doctor, setDoctor] = useState("");
  const [note, setNote] = useState("");
  const [type, setType] = useState("pédiatre");
  const add = () => {
    update(d => { d.appointments.push({ id: uuid(), title, date, time, doctor, note, type }); });
    setModal(false); setTitle(""); setDoctor(""); setNote("");
  };
  const remove = (id) => update(d => { d.appointments = d.appointments.filter(x => x.id !== id); });
  const upcoming = data.appointments.filter(a => a.date >= today()).sort((a, b) => a.date.localeCompare(b.date));
  const past = data.appointments.filter(a => a.date < today()).sort((a, b) => b.date.localeCompare(a.date));
  const typeEmoji = { pédiatre: "👨‍⚕️", vaccin: "💉", urgence: "🚑", spécialiste: "🏥", autre: "📋" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 800 }}>📅 Rendez-vous</div>
        <Btn onClick={() => setModal(true)} small>{Icons.plus} Nouveau</Btn>
      </div>

      {upcoming.length > 0 && <div style={{ fontSize: 13, fontWeight: 700, color: "#10B981", marginBottom: 8 }}>À venir</div>}
      {upcoming.map(a => (
        <div key={a.id} style={{
          padding: "14px 16px", marginBottom: 8, background: "#fff", borderRadius: 16,
          border: "2px solid #D1FAE5", boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{typeEmoji[a.type] || "📋"} {a.title || a.type}</div>
            <span onClick={() => remove(a.id)} style={{ cursor: "pointer", color: "#D1D5DB" }}>{Icons.trash}</span>
          </div>
          <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>
            {fmtFull(a.date)} à {a.time} {a.doctor && `· Dr. ${a.doctor}`}
          </div>
          {a.note && <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>{a.note}</div>}
        </div>
      ))}

      {past.length > 0 && (
        <details style={{ marginTop: 12 }}>
          <summary style={{ fontSize: 13, fontWeight: 700, color: "#9CA3AF", cursor: "pointer" }}>Passés ({past.length})</summary>
          {past.map(a => (
            <div key={a.id} style={{ padding: "10px 0", borderBottom: "1px solid #f5f5f5", fontSize: 13 }}>
              <span style={{ fontWeight: 600 }}>{typeEmoji[a.type]} {a.title || a.type}</span> — {fmt(a.date)}
              <span onClick={() => remove(a.id)} style={{ cursor: "pointer", color: "#D1D5DB", float: "right" }}>{Icons.trash}</span>
            </div>
          ))}
        </details>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Nouveau rendez-vous">
        <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
          {["pédiatre", "vaccin", "urgence", "spécialiste", "autre"].map(t => (
            <Chip key={t} active={type === t} onClick={() => setType(t)} color="#0EA5E9">{typeEmoji[t]} {t}</Chip>
          ))}
        </div>
        <Input label="Titre" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Visite des 6 mois" />
        <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} />
        <Input label="Heure" type="time" value={time} onChange={e => setTime(e.target.value)} />
        <Input label="Médecin" value={doctor} onChange={e => setDoctor(e.target.value)} placeholder="Dr. Martin" />
        <Input label="Notes" value={note} onChange={e => setNote(e.target.value)} placeholder="Préparer carnet de santé..." />
        <Btn onClick={add} style={{ width: "100%", justifyContent: "center" }}>Enregistrer</Btn>
      </Modal>
    </div>
  );
};

// ─── Medicines Section ───
const MedicinesSection = ({ data, update }) => {
  const [modal, setModal] = useState(false);
  const [name, setName] = useState("");
  const [dose, setDose] = useState("");
  const [time, setTime] = useState(now());
  const [note, setNote] = useState("");
  const add = () => {
    update(d => { d.medicines.push({ id: uuid(), name, dose, time, note }); });
    setModal(false); setName(""); setDose(""); setNote("");
  };
  const remove = (id) => update(d => { d.medicines = d.medicines.filter(x => x.id !== id); });
  const sorted = [...data.medicines].sort((a, b) => b.time.localeCompare(a.time));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 800 }}>💊 Médicaments</div>
        <Btn onClick={() => { setTime(now()); setModal(true); }} small>{Icons.plus} Ajouter</Btn>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {["Doliprane", "Vitamine D", "Fer"].map(m => (
          <Btn key={m} variant="secondary" small onClick={() => {
            update(d => { d.medicines.push({ id: uuid(), name: m, dose: "", time: new Date().toISOString().slice(0, 16), note: "" }); });
          }}>{m}</Btn>
        ))}
      </div>

      {sorted.map(m => (
        <div key={m.id} style={{
          display: "flex", alignItems: "center", padding: "12px 16px", marginBottom: 8,
          background: "#fff", borderRadius: 16, border: "1px solid #f0f0f0"
        }}>
          <span style={{ fontSize: 22, marginRight: 14 }}>💊</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{m.name} {m.dose && `— ${m.dose}`}</div>
            <div style={{ fontSize: 12, color: "#9CA3AF" }}>{fmt(m.time)} {fmtTime(m.time)} {m.note && `· ${m.note}`}</div>
          </div>
          <span onClick={() => remove(m.id)} style={{ cursor: "pointer", color: "#D1D5DB" }}>{Icons.trash}</span>
        </div>
      ))}

      <Modal open={modal} onClose={() => setModal(false)} title="Ajouter médicament">
        <Input label="Nom" value={name} onChange={e => setName(e.target.value)} placeholder="Doliprane, Vitamine D..." />
        <Input label="Dosage" value={dose} onChange={e => setDose(e.target.value)} placeholder="2.5ml, 1 goutte..." />
        <Input label="Heure" type="datetime-local" value={time} onChange={e => setTime(e.target.value)} />
        <Input label="Note" value={note} onChange={e => setNote(e.target.value)} placeholder="Avant/après repas..." />
        <Btn onClick={add} style={{ width: "100%", justifyContent: "center" }}>Enregistrer</Btn>
      </Modal>
    </div>
  );
};

// ─── Baths Section ───
const BathsSection = ({ data, update }) => {
  const [modal, setModal] = useState(false);
  const [time, setTime] = useState(now());
  const [temp, setTemp] = useState("37");
  const [note, setNote] = useState("");
  const add = () => {
    update(d => { d.baths.push({ id: uuid(), time, temp: Number(temp), note }); });
    setModal(false); setNote("");
  };
  const remove = (id) => update(d => { d.baths = d.baths.filter(x => x.id !== id); });
  const sorted = [...data.baths].sort((a, b) => b.time.localeCompare(a.time));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 800 }}>🛁 Bains</div>
        <Btn onClick={() => { setTime(now()); setModal(true); }} small>{Icons.plus} Ajouter</Btn>
      </div>

      <Btn variant="secondary" onClick={() => {
        update(d => { d.baths.push({ id: uuid(), time: new Date().toISOString().slice(0, 16), temp: 37, note: "" }); });
      }} style={{ width: "100%", justifyContent: "center", marginBottom: 16 }}>🛁 Bain maintenant (37°C)</Btn>

      {sorted.map(b => (
        <div key={b.id} style={{
          display: "flex", alignItems: "center", padding: "12px 16px", marginBottom: 8,
          background: "#fff", borderRadius: 16, border: "1px solid #f0f0f0"
        }}>
          <span style={{ fontSize: 22, marginRight: 14 }}>🛁</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{b.temp}°C</div>
            <div style={{ fontSize: 12, color: "#9CA3AF" }}>{fmt(b.time)} {fmtTime(b.time)} {b.note && `· ${b.note}`}</div>
          </div>
          <span onClick={() => remove(b.id)} style={{ cursor: "pointer", color: "#D1D5DB" }}>{Icons.trash}</span>
        </div>
      ))}

      <Modal open={modal} onClose={() => setModal(false)} title="Ajouter un bain">
        <Input label="Heure" type="datetime-local" value={time} onChange={e => setTime(e.target.value)} />
        <Input label="Température eau (°C)" type="number" step="0.5" value={temp} onChange={e => setTemp(e.target.value)} />
        <Input label="Note" value={note} onChange={e => setNote(e.target.value)} placeholder="Produit utilisé, durée..." />
        <Btn onClick={add} style={{ width: "100%", justifyContent: "center" }}>Enregistrer</Btn>
      </Modal>
    </div>
  );
};

// ─── Notes / Journal Section ───
const NotesSection = ({ data, update }) => {
  const [modal, setModal] = useState(false);
  const [text, setText] = useState("");
  const [mood, setMood] = useState("😊");
  const add = () => {
    if (!text.trim()) return;
    update(d => { d.notes.push({ id: uuid(), text, mood, date: new Date().toISOString() }); });
    setModal(false); setText("");
  };
  const remove = (id) => update(d => { d.notes = d.notes.filter(x => x.id !== id); });
  const sorted = [...data.notes].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 800 }}>📝 Journal de bébé</div>
        <Btn onClick={() => setModal(true)} small>{Icons.plus} Écrire</Btn>
      </div>

      {sorted.map(n => (
        <div key={n.id} style={{
          padding: "16px", marginBottom: 10, background: "#fff", borderRadius: 16,
          border: "1px solid #f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: "#9CA3AF", fontWeight: 600 }}>{n.mood} {fmtFull(n.date)}</span>
            <span onClick={() => remove(n.id)} style={{ cursor: "pointer", color: "#D1D5DB" }}>{Icons.trash}</span>
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.6, color: "#374151" }}>{n.text}</div>
        </div>
      ))}

      <Modal open={modal} onClose={() => setModal(false)} title="Nouveau souvenir">
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {["😊", "😢", "😴", "🤒", "🎉", "❤️", "😂"].map(m => (
            <span key={m} onClick={() => setMood(m)} style={{
              fontSize: 24, cursor: "pointer", padding: 4, borderRadius: 8,
              background: mood === m ? "#F3E8FF" : "transparent"
            }}>{m}</span>
          ))}
        </div>
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Aujourd'hui, bébé a..."
          style={{
            width: "100%", minHeight: 120, padding: "12px 14px", borderRadius: 12,
            border: "2px solid #e8e8e8", fontSize: 15, fontFamily: "'Nunito', sans-serif",
            outline: "none", resize: "vertical", boxSizing: "border-box"
          }} />
        <Btn onClick={add} style={{ width: "100%", justifyContent: "center", marginTop: 8 }}>Enregistrer</Btn>
      </Modal>
    </div>
  );
};

// ─── Setup Screen ───
const SetupScreen = ({ onComplete }) => {
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("boy");

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: 24, background: "linear-gradient(180deg, #F5F3FF 0%, #EDE9FE 100%)"
    }}>
      <div style={{ fontSize: 60, marginBottom: 16 }}>👶</div>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: "#4C1D95", fontFamily: "'Nunito', sans-serif", marginBottom: 4 }}>Bienvenue !</h1>
      <p style={{ fontSize: 15, color: "#7C3AED", marginBottom: 32, textAlign: "center" }}>Configurons le suivi de votre petit trésor</p>

      <div style={{ width: "100%", maxWidth: 360 }}>
        <Input label="Prénom de bébé" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Lucas" />
        <Input label="Date de naissance" type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} />
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#666", marginBottom: 8, fontFamily: "'Nunito', sans-serif" }}>Genre</label>
          <div style={{ display: "flex", gap: 10 }}>
            {[["boy", "👦 Garçon"], ["girl", "👧 Fille"]].map(([v, l]) => (
              <Btn key={v} variant={gender === v ? "primary" : "secondary"} onClick={() => setGender(v)} style={{ flex: 1, justifyContent: "center" }}>{l}</Btn>
            ))}
          </div>
        </div>

        <Btn onClick={() => {
          if (name && birthDate) onComplete({ name, birthDate, gender });
        }} style={{ width: "100%", justifyContent: "center", padding: "14px 24px", fontSize: 17 }}>
          Commencer le suivi ✨
        </Btn>
      </div>
    </div>
  );
};

// ─── Main App ───
export default function BabyTracker() {
  const [data, setData] = useState(null);
  const [section, setSection] = useState("home");
  const [loading, setLoading] = useState(true);
  const saveTimeout = useRef(null);

  // Load data on mount
  useEffect(() => {
    (async () => {
      const saved = await loadData();
      setData(saved || defaultState());
      setLoading(false);
    })();
  }, []);

  // Auto-save
  const update = useCallback((fn) => {
    setData(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      fn(next);
      clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(() => saveData(next), 500);
      return next;
    });
  }, []);

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F5F3FF" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16, animation: "pulse 1.5s infinite" }}>👶</div>
        <div style={{ color: "#7C3AED", fontWeight: 700, fontFamily: "'Nunito', sans-serif" }}>Chargement...</div>
      </div>
    </div>
  );

  if (!data) return null;

  // Setup
  if (!data.setup) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Nunito', sans-serif; }
          @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
          @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
        `}</style>
        <SetupScreen onComplete={(baby) => {
          update(d => { d.baby = baby; d.setup = true; });
        }} />
      </>
    );
  }

  const sections = {
    home: <DashboardHome data={data} setSection={setSection} />,
    bottles: <BottlesSection data={data} update={update} />,
    diapers: <DiapersSection data={data} update={update} />,
    sleep: <SleepSection data={data} update={update} />,
    food: <FoodSection data={data} update={update} />,
    growth: <GrowthSection data={data} update={update} />,
    milestones: <MilestonesSection data={data} update={update} />,
    teeth: <TeethSection data={data} update={update} />,
    appointments: <AppointmentsSection data={data} update={update} />,
    medicines: <MedicinesSection data={data} update={update} />,
    baths: <BathsSection data={data} update={update} />,
    notes: <NotesSection data={data} update={update} />,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Nunito', sans-serif; background: #FAFAF9; }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: #ddd; border-radius: 4px; }
      `}</style>

      <div style={{ maxWidth: 500, margin: "0 auto", minHeight: "100vh", background: "#FAFAF9", paddingBottom: 80 }}>
        {/* Top bar */}
        {section !== "home" && (
          <div style={{
            display: "flex", alignItems: "center", padding: "16px 20px", gap: 12,
            background: "#FAFAF9", position: "sticky", top: 0, zIndex: 100
          }}>
            <span onClick={() => setSection("home")} style={{ cursor: "pointer", color: "#7C3AED" }}>{Icons.back}</span>
            <span style={{ fontWeight: 800, fontSize: 16, color: "#374151" }}>{data.baby.name}</span>
          </div>
        )}

        <div style={{ padding: "0 16px" }}>
          {sections[section]}
        </div>

        {/* Bottom nav */}
        <div style={{
          position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
          width: "100%", maxWidth: 500, background: "#fff",
          borderTop: "1px solid #f0f0f0", display: "flex", justifyContent: "space-around",
          padding: "10px 0 18px", zIndex: 200
        }}>
          {[
            { key: "home", icon: Icons.home, label: "Accueil" },
            { key: "bottles", icon: Icons.bottle, label: "Biberons" },
            { key: "food", icon: Icons.food, label: "Aliments" },
            { key: "milestones", icon: Icons.milestone, label: "Étapes" },
            { key: "notes", icon: Icons.note, label: "Journal" },
          ].map(nav => (
            <div key={nav.key} onClick={() => setSection(nav.key)} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
              cursor: "pointer", color: section === nav.key ? "#7C3AED" : "#9CA3AF",
              transition: "color .2s"
            }}>
              {nav.icon}
              <span style={{ fontSize: 10, fontWeight: 700 }}>{nav.label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
