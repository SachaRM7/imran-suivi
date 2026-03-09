import React, { useState, useEffect, useCallback, useRef, createContext, useContext } from "react";
import { subscribeToProfiles, createProfile, deleteProfile, updateProfile, subscribeToData, saveData, uploadPhoto } from "./firebase";

/* ═══════════════════════════════════════════════════════
   BABY TRACKER & DEVELOPMENT DASHBOARD v2
   Multi-profil · Dark mode · Courbes OMS · Photos · PDF
   ═══════════════════════════════════════════════════════ */

// ─── Theme Context ───
const ThemeCtx = createContext();
const useTheme = () => useContext(ThemeCtx);

const LIGHT = {
  bg: "#FAFAF9", card: "#fff", cardBorder: "#F3F4F6", text: "#1F2937", textSoft: "#6B7280",
  textMuted: "#9CA3AF", accent: "#7C3AED", accentLight: "#F5F3FF", accentGrad: "linear-gradient(135deg, #A78BFA 0%, #818CF8 100%)",
  inputBorder: "#E5E7EB", shadow: "0 1px 3px rgba(0,0,0,0.04)", navBg: "#fff", navBorder: "#F3F4F6",
  heroGrad: "linear-gradient(135deg, #C4B5FD 0%, #A78BFA 35%, #818CF8 70%, #6366F1 100%)",
  modalBg: "rgba(0,0,0,0.4)", modalCard: "#fff", chipBg: "#F9FAFB", chipBorder: "#E5E7EB",
  success: "#10B981", successBg: "#ECFDF5", danger: "#EF4444", dangerBg: "#FEF2F2", warn: "#F59E0B", warnBg: "#FFFBEB",
};
const DARK = {
  bg: "#0F0F14", card: "#1A1A24", cardBorder: "#2A2A36", text: "#E5E5EC", textSoft: "#9A9AB0",
  textMuted: "#6B6B80", accent: "#A78BFA", accentLight: "#1E1B2E", accentGrad: "linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)",
  inputBorder: "#2A2A36", shadow: "0 1px 3px rgba(0,0,0,0.2)", navBg: "#15151E", navBorder: "#2A2A36",
  heroGrad: "linear-gradient(135deg, #2D1B69 0%, #1E1B4B 50%, #1A1A2E 100%)",
  modalBg: "rgba(0,0,0,0.7)", modalCard: "#1A1A24", chipBg: "#1E1E28", chipBorder: "#2A2A36",
  success: "#34D399", successBg: "#0D2818", danger: "#F87171", dangerBg: "#2D1215", warn: "#FBBF24", warnBg: "#2D2305",
};

// ─── OMS Weight Data (boys P3, P15, P50, P85, P97 — 0-24 months, kg) ───
const OMS_WEIGHT_BOYS = {
  P3:  [2.5,3.4,4.3,5.0,5.6,6.0,6.4,6.7,6.9,7.1,7.4,7.6,7.7,7.9,8.1,8.3,8.4,8.6,8.8,8.9,9.1,9.2,9.4,9.5,9.7],
  P15: [2.9,3.8,4.9,5.6,6.2,6.7,7.1,7.4,7.7,8.0,8.2,8.4,8.6,8.8,9.0,9.2,9.4,9.6,9.8,10.0,10.1,10.3,10.5,10.7,10.8],
  P50: [3.3,4.5,5.6,6.4,7.0,7.5,7.9,8.3,8.6,8.9,9.2,9.4,9.6,9.9,10.1,10.3,10.5,10.7,10.9,11.1,11.3,11.5,11.8,12.0,12.2],
  P85: [3.9,5.1,6.3,7.2,7.8,8.4,8.8,9.2,9.6,9.9,10.2,10.5,10.8,11.0,11.3,11.5,11.8,12.0,12.2,12.5,12.7,12.9,13.2,13.4,13.7],
  P97: [4.3,5.7,7.0,8.0,8.6,9.2,9.7,10.1,10.5,10.9,11.2,11.5,11.8,12.1,12.4,12.7,12.9,13.2,13.5,13.7,14.0,14.3,14.5,14.8,15.1],
};
const OMS_WEIGHT_GIRLS = {
  P3:  [2.4,3.2,3.9,4.5,5.0,5.4,5.7,6.0,6.2,6.5,6.7,6.9,7.0,7.2,7.4,7.5,7.7,7.8,8.0,8.1,8.3,8.4,8.6,8.7,8.9],
  P15: [2.8,3.6,4.5,5.2,5.7,6.1,6.5,6.8,7.0,7.3,7.5,7.7,7.9,8.1,8.3,8.5,8.7,8.8,9.0,9.2,9.4,9.5,9.7,9.9,10.1],
  P50: [3.2,4.2,5.1,5.8,6.4,6.9,7.3,7.6,7.9,8.2,8.5,8.7,8.9,9.2,9.4,9.6,9.8,10.0,10.2,10.4,10.6,10.9,11.1,11.3,11.5],
  P85: [3.7,4.8,5.8,6.6,7.3,7.8,8.2,8.6,9.0,9.3,9.6,9.9,10.1,10.4,10.6,10.9,11.1,11.4,11.6,11.8,12.1,12.3,12.6,12.8,13.1],
  P97: [4.2,5.4,6.5,7.4,8.1,8.7,9.1,9.6,10.0,10.3,10.7,11.0,11.3,11.6,11.9,12.2,12.4,12.7,13.0,13.2,13.5,13.8,14.1,14.4,14.7],
};
const OMS_HEIGHT_BOYS = {
  P3:  [46.3,51.1,54.7,57.6,60.0,61.9,63.6,65.1,66.5,67.7,69.0,70.2,71.3,72.4,73.4,74.4,75.4,76.3,77.2,78.1,78.9,79.7,80.5,81.3,82.1],
  P50: [49.9,54.7,58.4,61.4,63.9,65.9,67.6,69.2,70.6,72.0,73.3,74.5,75.7,76.9,78.0,79.1,80.2,81.2,82.3,83.2,84.2,85.1,86.0,86.9,87.8],
  P97: [53.4,58.4,62.2,65.3,67.8,69.9,71.6,73.2,74.7,76.2,77.6,78.9,80.2,81.3,82.5,83.7,84.9,86.1,87.3,88.4,89.5,90.5,91.6,92.6,93.5],
};
const OMS_HEIGHT_GIRLS = {
  P3:  [45.6,50.0,53.2,56.0,58.2,60.1,61.7,63.2,64.5,65.8,67.0,68.2,69.4,70.5,71.6,72.6,73.6,74.6,75.6,76.5,77.5,78.4,79.3,80.1,81.0],
  P50: [49.1,53.7,57.1,59.8,62.1,64.0,65.7,67.3,68.7,70.1,71.5,72.8,74.0,75.2,76.4,77.5,78.6,79.7,80.7,81.7,82.7,83.7,84.6,85.5,86.5],
  P97: [52.7,57.4,60.9,63.7,66.0,67.9,69.8,71.3,72.9,74.5,75.9,77.4,78.6,79.9,81.2,82.4,83.6,84.8,85.9,87.0,88.0,89.0,90.0,91.0,91.9],
};

// ─── Milestones ───
const DEFAULT_MILESTONES = {
  1:["Suit du regard un objet","Réagit aux sons forts","Lève la tête sur le ventre","Serre un doigt","Reconnaît voix maman/papa","Gazouillis"],
  2:["Sourire social","Tient la tête plus longtemps","Suit un visage des yeux","Gazouille","Mouvements symétriques","S'apaise dans les bras"],
  3:["Tête droite assis (tenu)","Ouvre/ferme les mains","Attrape des jouets","Rit aux éclats","Reconnaît visages à distance","Appui sur avant-bras"],
  4:["Retournement ventre→dos","Porte jouet à la bouche","Babille (ba-ba)","Pousse sur jambes","Suit objet à 180°","Exprime joie/mécontentement"],
  5:["Retournement dos→ventre","Transfère objet main à main","Pieds à la bouche","Distingue familier/inconnu","Répond à son prénom","Joue à coucou-caché"],
  6:["Assis avec appui","Début diversification","Rebondit debout (tenu)","Syllabes variées","Curiosité objets","Tend les bras"],
  7:["Assis sans soutien (bref)","Rampe/déplacement ventre","Pince grossière","Cherche objet caché","Réagit au prénom","Purées texturées"],
  8:["Assis stable sans soutien","Position assise→ventre","Début 4 pattes","Dit mama/papa (sans sens)","Tape des mains","Pince fine"],
  9:["Debout en s'agrippant","Fait au revoir","Comprend «non»","Pointe du doigt","Morceaux mous","Peur des inconnus"],
  10:["Cabotage le long des meubles","Pince pouce-index","Met/enlève objets contenant","Imite les adultes","1-2 mots significatifs","Boit au gobelet (aide)"],
  11:["Debout seul quelques sec","Empile 2 cubes","Consignes simples","Montre du doigt","Marche tenu 1-2 mains","Mange doigts autonome"],
  12:["Premiers pas","3-5 mots significatifs","Comprend ≈50 mots","Gobelet seul","Câlins/bisous","Jeu symbolique"],
  15:["Court maladroitement","10-15 mots","Verre seul","Lance balle","Pointe images livre","Frustration claire"],
  18:["Court bien","Combine 2 mots","≈50 mots actifs","Monte/descend escaliers","Jeu symbolique avancé","Mange seul proprement"],
  24:["Saute sur place","Phrases 2-3 mots","≈200 mots","S'habille partiellement","Joue avec autres enfants","Propreté diurne en approche"],
};

const TEETH_MAP = [
  {id:"LCI",name:"Incisive centrale inf. G",pos:"bottom",avg:"6-10m"},{id:"RCI",name:"Incisive centrale inf. D",pos:"bottom",avg:"6-10m"},
  {id:"LCS",name:"Incisive centrale sup. G",pos:"top",avg:"8-12m"},{id:"RCS",name:"Incisive centrale sup. D",pos:"top",avg:"8-12m"},
  {id:"LLS",name:"Incisive latérale sup. G",pos:"top",avg:"9-13m"},{id:"RLS",name:"Incisive latérale sup. D",pos:"top",avg:"9-13m"},
  {id:"LLI",name:"Incisive latérale inf. G",pos:"bottom",avg:"10-16m"},{id:"RLI",name:"Incisive latérale inf. D",pos:"bottom",avg:"10-16m"},
  {id:"LM1S",name:"1ère molaire sup. G",pos:"top",avg:"13-19m"},{id:"RM1S",name:"1ère molaire sup. D",pos:"top",avg:"13-19m"},
  {id:"LM1I",name:"1ère molaire inf. G",pos:"bottom",avg:"14-18m"},{id:"RM1I",name:"1ère molaire inf. D",pos:"bottom",avg:"14-18m"},
  {id:"LCanS",name:"Canine sup. G",pos:"top",avg:"16-22m"},{id:"RCanS",name:"Canine sup. D",pos:"top",avg:"16-22m"},
  {id:"LCanI",name:"Canine inf. G",pos:"bottom",avg:"17-23m"},{id:"RCanI",name:"Canine inf. D",pos:"bottom",avg:"17-23m"},
  {id:"LM2S",name:"2ème molaire sup. G",pos:"top",avg:"25-33m"},{id:"RM2S",name:"2ème molaire sup. D",pos:"top",avg:"25-33m"},
  {id:"LM2I",name:"2ème molaire inf. G",pos:"bottom",avg:"23-31m"},{id:"RM2I",name:"2ème molaire inf. D",pos:"bottom",avg:"23-31m"},
];

const FOOD_CATEGORIES = {
  "Légumes":["Carotte","Courgette","Haricot vert","Patate douce","Potiron","Petit pois","Brocoli","Épinard","Panais","Poireau","Navet","Betterave","Artichaut","Aubergine","Fenouil","Chou-fleur","Tomate","Avocat","Maïs","Concombre","Céleri","Poivron"],
  "Fruits":["Pomme","Poire","Banane","Pêche","Abricot","Prune","Mangue","Fraise","Myrtille","Framboise","Melon","Pastèque","Kiwi","Orange","Clémentine","Raisin","Cerise","Ananas","Figue","Datte"],
  "Féculents":["Riz","Pâtes","Semoule","Pomme de terre","Quinoa","Polenta","Pain","Lentilles","Pois chiches","Boulgour","Flocons d'avoine"],
  "Protéines":["Poulet","Dinde","Bœuf","Veau","Agneau","Jambon blanc","Poisson blanc","Saumon","Cabillaud","Sardine","Œuf","Tofu"],
  "Laitiers":["Yaourt nature","Fromage blanc","Petit suisse","Gruyère","Comté","Chèvre frais","Kiri","Vache qui rit","Ricotta"],
};
const CAT_COLORS = {"Légumes":"#22C55E","Fruits":"#F43F5E","Féculents":"#EAB308","Protéines":"#A855F7","Laitiers":"#3B82F6"};

const VACCINE_SCHEDULE = [
  {age:"2 mois",vaccines:["DTCaP-Hib-HepB (1ère dose)","Pneumocoque (1ère dose)"]},
  {age:"4 mois",vaccines:["DTCaP-Hib-HepB (2ème dose)","Pneumocoque (2ème dose)"]},
  {age:"5 mois",vaccines:["Méningocoque C (1ère dose)"]},
  {age:"11 mois",vaccines:["DTCaP-Hib-HepB (rappel)","Pneumocoque (rappel)"]},
  {age:"12 mois",vaccines:["ROR (1ère dose)","Méningocoque C (2ème dose)"]},
  {age:"16-18 mois",vaccines:["ROR (2ème dose)"]},
];

const PROFILE_AVATARS = ["👶","👶🏻","👶🏼","👶🏽","👶🏾","👶🏿","🧒","🧒🏻","🧒🏼","🧒🏽","🧒🏾","🧒🏿"];
const PROFILE_COLORS = ["#A78BFA","#F472B6","#34D399","#60A5FA","#FBBF24","#F87171","#818CF8","#2DD4BF"];

// ─── Helpers ───
const defaultState = () => ({
  bottles:[],diapers:[],sleep:[],foods:{},growth:[],milestones:JSON.parse(JSON.stringify(DEFAULT_MILESTONES)),
  milestonesChecked:{},teeth:{},appointments:[],notes:[],medicines:[],baths:[],vaccines:{},temperature:[],
  _lastUpdated:null
});
const fmt = d => new Date(d).toLocaleDateString("fr-FR",{day:"numeric",month:"short"});
const fmtTime = d => new Date(d).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});
const fmtFull = d => new Date(d).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"});
const todayStr = () => new Date().toISOString().slice(0,10);
const nowStr = () => new Date().toISOString().slice(0,16);
const uid = () => Math.random().toString(36).slice(2,10)+Date.now().toString(36);
const babyAgeMonths = bd => { if(!bd) return 0; const b=new Date(bd),n=new Date(); return Math.max(0,(n.getFullYear()-b.getFullYear())*12+n.getMonth()-b.getMonth()); };
const babyAgeText = bd => {
  if(!bd) return "";
  const days=Math.floor((new Date()-new Date(bd))/864e5);
  if(days<0) return "Pas encore né";
  if(days<31) return `${days} jour${days>1?"s":""}`;
  const m=Math.floor(days/30.44), d=Math.round(days-m*30.44);
  if(m<24) return `${m} mois${d>0?` et ${d}j`:""}`;
  const y=Math.floor(m/12), rm=m%12;
  return `${y} an${y>1?"s":""}${rm>0?` et ${rm} mois`:""}`;
};
const todayItems = arr => (arr||[]).filter(i => (i.date||i.time||i.start||"").startsWith(todayStr()));

// ─── CSS ───
const makeCSS = (t) => `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
body{font-family:'Nunito',sans-serif;background:${t.bg};color:${t.text};-webkit-font-smoothing:antialiased;overscroll-behavior:none;transition:background .3s,color .3s;}
input,textarea,select{font-family:'Nunito',sans-serif;color:${t.text};background:${t.card};}
@keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
@keyframes syncPulse{0%,100%{opacity:1}50%{opacity:.4}}
@keyframes profileHover{0%{transform:scale(1)}50%{transform:scale(1.05)}100%{transform:scale(1)}}
::-webkit-scrollbar{width:3px;height:3px}
::-webkit-scrollbar-thumb{background:${t.textMuted};border-radius:3px}
`;

// ─── UI Components ───
const Modal = ({open,onClose,title,children}) => {
  const t = useTheme();
  if(!open) return null;
  return (
    <div style={{position:"fixed",inset:0,zIndex:1000,background:t.modalBg,backdropFilter:"blur(6px)",display:"flex",alignItems:"flex-end",justifyContent:"center",animation:"fadeIn .2s"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:t.modalCard,borderRadius:"24px 24px 0 0",width:"100%",maxWidth:500,maxHeight:"88vh",overflow:"auto",padding:"20px 20px 36px",boxShadow:"0 -10px 50px rgba(0,0,0,.2)",animation:"slideUp .3s cubic-bezier(.16,1,.3,1)"}}>
        <div style={{width:36,height:4,background:t.textMuted,borderRadius:4,margin:"0 auto 18px",opacity:.4}}/>
        {title&&<h3 style={{margin:"0 0 18px",fontSize:19,fontWeight:800,color:t.text}}>{title}</h3>}
        {children}
      </div>
    </div>
  );
};

const Input = ({label,...props}) => {
  const t = useTheme();
  return (
    <div style={{marginBottom:14}}>
      {label&&<label style={{display:"block",fontSize:12,fontWeight:700,color:t.textSoft,marginBottom:5,textTransform:"uppercase",letterSpacing:.5}}>{label}</label>}
      <input {...props} style={{width:"100%",padding:"11px 14px",borderRadius:14,border:`2px solid ${t.inputBorder}`,fontSize:15,outline:"none",boxSizing:"border-box",background:t.card,color:t.text,transition:"border-color .2s",...props.style}}
        onFocus={e=>{e.target.style.borderColor=t.accent;}} onBlur={e=>{e.target.style.borderColor=t.inputBorder;}}/>
    </div>
  );
};

const Btn = ({children,variant="primary",small,full,...props}) => {
  const t = useTheme();
  const styles = {
    primary:{background:t.accentGrad,color:"#fff",boxShadow:"0 4px 14px rgba(129,140,248,.3)"},
    secondary:{background:t.accentLight,color:t.accent,boxShadow:"none"},
    danger:{background:t.dangerBg,color:t.danger,boxShadow:"none"},
    success:{background:t.successBg,color:t.success,boxShadow:"none"},
    ghost:{background:"transparent",color:t.accent,boxShadow:"none"},
  };
  return (
    <button {...props} style={{...styles[variant],border:"none",borderRadius:14,padding:small?"8px 14px":"12px 20px",fontSize:small?13:15,fontWeight:700,cursor:"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6,transition:"transform .1s",width:full?"100%":"auto",...props.style}}
      onMouseDown={e=>e.currentTarget.style.transform="scale(.97)"} onMouseUp={e=>e.currentTarget.style.transform="scale(1)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}
    >{children}</button>
  );
};

const Chip = ({children,active,onClick,color="#A78BFA"}) => {
  const t = useTheme();
  return (<span onClick={onClick} style={{display:"inline-flex",alignItems:"center",padding:"7px 14px",borderRadius:20,fontSize:13,fontWeight:700,cursor:onClick?"pointer":"default",background:active?color:t.chipBg,color:active?"#fff":t.textSoft,border:active?"none":`1.5px solid ${t.chipBorder}`,transition:"all .2s",whiteSpace:"nowrap"}}>{children}</span>);
};

const Card = ({children,onClick,highlighted,style:s}) => {
  const t = useTheme();
  return (<div onClick={onClick} style={{background:t.card,borderRadius:18,padding:"14px 16px",boxShadow:t.shadow,border:highlighted?`2px solid ${t.accent}`:`1.5px solid ${t.cardBorder}`,transition:"transform .15s",cursor:onClick?"pointer":"default",...(s||{})}}
    onMouseEnter={e=>onClick&&(e.currentTarget.style.transform="translateY(-1px)")} onMouseLeave={e=>onClick&&(e.currentTarget.style.transform="")}>{children}</div>);
};

const IconBtn = ({onClick,children}) => {
  const t = useTheme();
  return (<span onClick={onClick} style={{cursor:"pointer",color:t.textMuted,display:"inline-flex",padding:4,borderRadius:8,transition:"color .15s",fontSize:14}}
    onMouseEnter={e=>e.currentTarget.style.color=t.danger} onMouseLeave={e=>e.currentTarget.style.color=t.textMuted}>{children}</span>);
};

const SyncBadge = ({syncing}) => (
  <div style={{position:"fixed",top:12,right:56,zIndex:999,display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:20,background:syncing?"#FEF3C7":"#ECFDF5",fontSize:11,fontWeight:700,color:syncing?"#D97706":"#059669",animation:syncing?"syncPulse 1s infinite":"none"}}>
    <span style={{width:6,height:6,borderRadius:"50%",background:syncing?"#F59E0B":"#10B981"}}/>{syncing?"Sync...":"Sync ✓"}
  </div>
);

const Empty = ({emoji,text}) => { const t=useTheme(); return (<div style={{textAlign:"center",padding:"40px 20px",color:t.textMuted}}><div style={{fontSize:40,marginBottom:8}}>{emoji}</div><div style={{fontSize:14,fontWeight:600}}>{text}</div></div>); };

// ═══════════════════════════════════════
// PROFILE SELECTOR (Netflix style)
// ═══════════════════════════════════════
const ProfileSelector = ({profiles,onSelect,onAdd,onDelete}) => {
  const [adding,setAdding] = useState(false);
  const [name,setName] = useState("");
  const [bd,setBd] = useState("");
  const [gender,setGender] = useState("boy");
  const [avatar,setAvatar] = useState("👶🏻");
  const [color,setColor] = useState("#A78BFA");
  const [confirmDelete,setConfirmDelete] = useState(null);
  const profileList = Object.values(profiles);

  const handleAdd = async () => {
    if(!name||!bd) return;
    await onAdd({name,birthDate:bd,gender,avatar,color});
    setAdding(false); setName(""); setBd("");
  };

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#0F0F14 0%,#1A1A2E 100%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <h1 style={{color:"#fff",fontSize:28,fontWeight:900,marginBottom:8,fontFamily:"'Nunito',sans-serif"}}>Baby Tracker</h1>
      <p style={{color:"#9A9AB0",fontSize:15,marginBottom:40,fontWeight:600}}>Qui suivons-nous aujourd'hui ?</p>

      <div style={{display:"flex",flexWrap:"wrap",gap:24,justifyContent:"center",marginBottom:40,maxWidth:500}}>
        {profileList.map(p => (
          <div key={p.id} style={{display:"flex",flexDirection:"column",alignItems:"center",cursor:"pointer",transition:"transform .2s",position:"relative"}}
            onClick={() => onSelect(p.id)}
            onMouseEnter={e=>e.currentTarget.style.transform="scale(1.08)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
            <div style={{width:100,height:100,borderRadius:24,background:`linear-gradient(135deg, ${p.color||"#A78BFA"}, ${p.color||"#A78BFA"}88)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:44,boxShadow:`0 8px 30px ${p.color||"#A78BFA"}44`,marginBottom:10,border:"3px solid transparent",transition:"border .2s"}}>
              {p.avatar||"👶"}
            </div>
            <span style={{color:"#E5E5EC",fontWeight:700,fontSize:15}}>{p.name}</span>
            <span style={{color:"#6B6B80",fontSize:12,fontWeight:600}}>{babyAgeText(p.birthDate)}</span>
            {/* Delete button */}
            <span onClick={e=>{e.stopPropagation();setConfirmDelete(p.id);}} style={{position:"absolute",top:-6,right:-6,width:24,height:24,borderRadius:12,background:"#2A2A36",color:"#6B6B80",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,cursor:"pointer",border:"2px solid #0F0F14"}}>×</span>
          </div>
        ))}

        {/* Add new profile */}
        <div onClick={()=>setAdding(true)} style={{display:"flex",flexDirection:"column",alignItems:"center",cursor:"pointer",transition:"transform .2s"}}
          onMouseEnter={e=>e.currentTarget.style.transform="scale(1.08)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
          <div style={{width:100,height:100,borderRadius:24,background:"#1E1E28",border:"3px dashed #3A3A4A",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,color:"#6B6B80",marginBottom:10}}>+</div>
          <span style={{color:"#6B6B80",fontWeight:700,fontSize:14}}>Ajouter</span>
        </div>
      </div>

      {/* Add profile modal */}
      {adding && (
        <div style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(0,0,0,.7)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setAdding(false)}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#1A1A24",borderRadius:24,padding:28,width:"90%",maxWidth:400,boxShadow:"0 20px 60px rgba(0,0,0,.5)"}}>
            <h3 style={{color:"#fff",fontSize:20,fontWeight:800,marginBottom:20}}>Nouveau bébé 🍼</h3>
            <div style={{marginBottom:14}}>
              <label style={{display:"block",fontSize:12,fontWeight:700,color:"#9A9AB0",marginBottom:5,textTransform:"uppercase"}}>Prénom</label>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="Lucas" style={{width:"100%",padding:"11px 14px",borderRadius:14,border:"2px solid #2A2A36",background:"#0F0F14",color:"#fff",fontSize:15,outline:"none",boxSizing:"border-box"}}/>
            </div>
            <div style={{marginBottom:14}}>
              <label style={{display:"block",fontSize:12,fontWeight:700,color:"#9A9AB0",marginBottom:5,textTransform:"uppercase"}}>Date de naissance</label>
              <input type="date" value={bd} onChange={e=>setBd(e.target.value)} style={{width:"100%",padding:"11px 14px",borderRadius:14,border:"2px solid #2A2A36",background:"#0F0F14",color:"#fff",fontSize:15,outline:"none",boxSizing:"border-box"}}/>
            </div>
            <div style={{marginBottom:14}}>
              <label style={{display:"block",fontSize:12,fontWeight:700,color:"#9A9AB0",marginBottom:5,textTransform:"uppercase"}}>Genre</label>
              <div style={{display:"flex",gap:10}}>
                {[["boy","👦 Garçon"],["girl","👧 Fille"]].map(([v,l])=>(
                  <button key={v} onClick={()=>setGender(v)} style={{flex:1,padding:"10px",borderRadius:14,border:"none",background:gender===v?"#7C3AED":"#1E1E28",color:gender===v?"#fff":"#9A9AB0",fontWeight:700,fontSize:14,cursor:"pointer"}}>{l}</button>
                ))}
              </div>
            </div>
            <div style={{marginBottom:14}}>
              <label style={{display:"block",fontSize:12,fontWeight:700,color:"#9A9AB0",marginBottom:5,textTransform:"uppercase"}}>Avatar</label>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {PROFILE_AVATARS.map(a=>(<span key={a} onClick={()=>setAvatar(a)} style={{fontSize:28,cursor:"pointer",padding:4,borderRadius:10,background:avatar===a?"#2A2A36":"transparent"}}>{a}</span>))}
              </div>
            </div>
            <div style={{marginBottom:20}}>
              <label style={{display:"block",fontSize:12,fontWeight:700,color:"#9A9AB0",marginBottom:5,textTransform:"uppercase"}}>Couleur</label>
              <div style={{display:"flex",gap:8}}>
                {PROFILE_COLORS.map(c=>(<span key={c} onClick={()=>setColor(c)} style={{width:30,height:30,borderRadius:10,background:c,cursor:"pointer",border:color===c?"3px solid #fff":"3px solid transparent"}}/>))}
              </div>
            </div>
            <button onClick={handleAdd} style={{width:"100%",padding:"14px",borderRadius:14,border:"none",background:"linear-gradient(135deg,#A78BFA,#818CF8)",color:"#fff",fontSize:16,fontWeight:800,cursor:"pointer"}}>Créer le profil ✨</button>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div style={{position:"fixed",inset:0,zIndex:1001,background:"rgba(0,0,0,.8)",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setConfirmDelete(null)}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#1A1A24",borderRadius:20,padding:24,width:"85%",maxWidth:340,textAlign:"center"}}>
            <div style={{fontSize:36,marginBottom:12}}>⚠️</div>
            <h3 style={{color:"#fff",fontSize:17,fontWeight:800,marginBottom:8}}>Supprimer ce profil ?</h3>
            <p style={{color:"#9A9AB0",fontSize:13,marginBottom:20}}>Toutes les données seront perdues.</p>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setConfirmDelete(null)} style={{flex:1,padding:12,borderRadius:14,border:"none",background:"#2A2A36",color:"#9A9AB0",fontWeight:700,cursor:"pointer"}}>Annuler</button>
              <button onClick={()=>{onDelete(confirmDelete);setConfirmDelete(null);}} style={{flex:1,padding:12,borderRadius:14,border:"none",background:"#EF4444",color:"#fff",fontWeight:700,cursor:"pointer"}}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════
// DASHBOARD HOME
// ═══════════════════════════════════════
const DashboardHome = ({data,profile,goTo,onSwitchProfile}) => {
  const t = useTheme();
  const age = babyAgeText(profile.birthDate);
  const todayB = todayItems(data.bottles);
  const todayD = todayItems(data.diapers);
  const todayS = todayItems(data.sleep);
  const totalMl = todayB.reduce((s,b)=>s+(b.amount||0),0);
  const teethCount = Object.keys(data.teeth||{}).length;
  const foodCount = Object.keys(data.foods||{}).filter(k=>data.foods[k]).length;
  const nextAppt = (data.appointments||[]).filter(a=>a.date>=todayStr()).sort((a,b)=>a.date.localeCompare(b.date))[0];
  const lastG = (data.growth||[]).sort((a,b)=>b.date.localeCompare(a.date))[0];

  const cards = [
    {key:"bottles",emoji:"🍼",label:"Biberons",value:`${todayB.length} — ${totalMl} ml`},
    {key:"diapers",emoji:"🧷",label:"Couches",value:`${todayD.length} changées`},
    {key:"sleep",emoji:"😴",label:"Sommeil",value:`${todayS.length} siestes`},
    {key:"food",emoji:"🥕",label:"Diversification",value:`${foodCount} aliments`},
    {key:"growth",emoji:"📏",label:"Croissance",value:lastG?`${lastG.weight||"?"}kg · ${lastG.height||"?"}cm`:"—"},
    {key:"teeth",emoji:"🦷",label:"Dents",value:`${teethCount}/20`},
    {key:"milestones",emoji:"🏆",label:"Étapes",value:"Voir progrès"},
    {key:"appointments",emoji:"📅",label:"RDV",value:nextAppt?fmt(nextAppt.date):"Aucun"},
    {key:"vaccines",emoji:"💉",label:"Vaccins",value:"Calendrier"},
    {key:"medicines",emoji:"💊",label:"Médicaments",value:`${(data.medicines||[]).length}`},
    {key:"temperature",emoji:"🌡️",label:"Température",value:(data.temperature||[]).length?`${data.temperature[data.temperature.length-1].value}°C`:"—"},
    {key:"baths",emoji:"🛁",label:"Bains",value:`${todayItems(data.baths).length}`},
    {key:"notes",emoji:"📝",label:"Journal",value:`${(data.notes||[]).length} notes`},
    {key:"settings",emoji:"⚙️",label:"Paramètres",value:"PDF, thème..."},
  ];

  return (
    <div>
      <div style={{background:t.heroGrad,borderRadius:28,padding:"28px 24px 24px",marginBottom:20,color:"#fff",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-40,right:-40,width:140,height:140,borderRadius:"50%",background:"rgba(255,255,255,.1)"}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{fontSize:12,opacity:.85,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase"}}>{new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})}</div>
            <div style={{fontSize:30,fontWeight:900,marginTop:6}}>{profile.avatar||"👶"} {profile.name}</div>
            {age&&<div style={{fontSize:15,marginTop:4,opacity:.9,fontWeight:600}}>{age}</div>}
          </div>
          <span onClick={onSwitchProfile} style={{cursor:"pointer",fontSize:11,background:"rgba(255,255,255,.2)",padding:"6px 12px",borderRadius:12,fontWeight:700,backdropFilter:"blur(4px)"}}>Changer ↩</span>
        </div>
      </div>

      <div style={{display:"flex",gap:8,marginBottom:20,overflowX:"auto",paddingBottom:2}}>
        {[{e:"🍼",v:`${totalMl}ml`,k:"bottles"},{e:"🧷",v:todayD.length,k:"diapers"},{e:"😴",v:todayS.length,k:"sleep"},{e:"🦷",v:teethCount,k:"teeth"}].map((s,i)=>(
          <div key={i} onClick={()=>goTo(s.k)} style={{flex:"0 0 auto",background:t.card,borderRadius:14,padding:"9px 16px",display:"flex",alignItems:"center",gap:7,border:`1.5px solid ${t.cardBorder}`,fontWeight:800,fontSize:14,cursor:"pointer",color:t.text}}>
            <span style={{fontSize:18}}>{s.e}</span>{s.v}
          </div>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {cards.map(c=>(
          <Card key={c.key} onClick={()=>goTo(c.key)}>
            <div style={{fontSize:26,marginBottom:6}}>{c.emoji}</div>
            <div style={{fontSize:13,fontWeight:800,color:t.text}}>{c.label}</div>
            <div style={{fontSize:11,color:t.textMuted,fontWeight:600,marginTop:2}}>{c.value}</div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════
// BOTTLES
// ═══════════════════════════════════════
const BottlesSection = ({data,update}) => {
  const t=useTheme(); const [modal,setModal]=useState(false); const [amount,setAmount]=useState(120); const [time,setTime]=useState(nowStr()); const [note,setNote]=useState("");
  const quickAdd=ml=>update(d=>{d.bottles.push({id:uid(),amount:ml,time:nowStr(),note:""})});
  const add=()=>{update(d=>{d.bottles.push({id:uid(),amount:Number(amount),time,note})});setModal(false);setNote("")};
  const remove=id=>update(d=>{d.bottles=d.bottles.filter(b=>b.id!==id)});
  const todayB=(data.bottles||[]).filter(b=>b.time?.startsWith(todayStr())).sort((a,b)=>b.time.localeCompare(a.time));
  const olderB=(data.bottles||[]).filter(b=>!b.time?.startsWith(todayStr())).sort((a,b)=>b.time.localeCompare(a.time));
  const totalMl=todayB.reduce((s,b)=>s+(b.amount||0),0);
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div><div style={{fontSize:22,fontWeight:900}}>🍼 Biberons</div><div style={{fontSize:13,color:t.textMuted,fontWeight:600}}>Aujourd'hui : {todayB.length} — {totalMl} ml</div></div>
        <Btn onClick={()=>{setTime(nowStr());setModal(true)}} small>+ Détail</Btn>
      </div>
      <div style={{display:"flex",gap:7,marginBottom:18,flexWrap:"wrap"}}>{[60,90,120,150,180,210,240,270].map(ml=>(<Btn key={ml} variant="secondary" small onClick={()=>quickAdd(ml)}>{ml}ml</Btn>))}</div>
      {todayB.length===0&&<Empty emoji="🍼" text="Aucun biberon aujourd'hui"/>}
      {todayB.map(b=>(<Card key={b.id} style={{display:"flex",alignItems:"center",marginBottom:8}}><span style={{fontSize:24,marginRight:14}}>🍼</span><div style={{flex:1}}><div style={{fontWeight:800,fontSize:15}}>{b.amount} ml</div><div style={{fontSize:12,color:t.textMuted}}>{fmtTime(b.time)}{b.note?` · ${b.note}`:""}</div></div><IconBtn onClick={()=>remove(b.id)}>🗑</IconBtn></Card>))}
      {olderB.length>0&&(<details style={{marginTop:14}}><summary style={{fontSize:13,fontWeight:700,color:t.textMuted,cursor:"pointer",padding:"8px 0"}}>Historique ({olderB.length})</summary>{olderB.slice(0,50).map(b=>(<div key={b.id} style={{display:"flex",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${t.cardBorder}`,fontSize:13}}><span style={{flex:1,fontWeight:700}}>{b.amount} ml</span><span style={{color:t.textMuted}}>{fmt(b.time)} {fmtTime(b.time)}</span><IconBtn onClick={()=>remove(b.id)}>🗑</IconBtn></div>))}</details>)}
      <Modal open={modal} onClose={()=>setModal(false)} title="Ajouter un biberon"><Input label="Quantité (ml)" type="number" value={amount} onChange={e=>setAmount(e.target.value)}/><Input label="Heure" type="datetime-local" value={time} onChange={e=>setTime(e.target.value)}/><Input label="Note" value={note} onChange={e=>setNote(e.target.value)} placeholder="Refusé après 60ml..."/><Btn onClick={add} full style={{marginTop:4}}>Enregistrer</Btn></Modal>
    </div>
  );
};

// ═══════════════════════════════════════
// DIAPERS
// ═══════════════════════════════════════
const DiapersSection = ({data,update}) => {
  const t=useTheme(); const [modal,setModal]=useState(false); const [type,setType]=useState("pipi"); const [time,setTime]=useState(nowStr()); const [note,setNote]=useState("");
  const emojis={pipi:"💧",caca:"💩",mixte:"💧💩"};
  const quickAdd=tp=>update(d=>{d.diapers.push({id:uid(),type:tp,time:nowStr(),note:""})});
  const add=()=>{update(d=>{d.diapers.push({id:uid(),type,time,note})});setModal(false);setNote("")};
  const remove=id=>update(d=>{d.diapers=d.diapers.filter(x=>x.id!==id)});
  const todayD=(data.diapers||[]).filter(d=>d.time?.startsWith(todayStr())).sort((a,b)=>b.time.localeCompare(a.time));
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div><div style={{fontSize:22,fontWeight:900}}>🧷 Couches</div><div style={{fontSize:13,color:t.textMuted,fontWeight:600}}>Aujourd'hui : {todayD.length}</div></div>
        <Btn onClick={()=>{setTime(nowStr());setModal(true)}} small>+ Détail</Btn>
      </div>
      <div style={{display:"flex",gap:10,marginBottom:18}}>{["pipi","caca","mixte"].map(tp=>(<Btn key={tp} variant="secondary" onClick={()=>quickAdd(tp)} style={{flex:1}}>{emojis[tp]} {tp}</Btn>))}</div>
      {todayD.length===0&&<Empty emoji="🧷" text="Aucune couche aujourd'hui"/>}
      {todayD.map(d=>(<Card key={d.id} style={{display:"flex",alignItems:"center",marginBottom:8}}><span style={{fontSize:22,marginRight:14}}>{emojis[d.type]}</span><div style={{flex:1}}><div style={{fontWeight:700,fontSize:14,textTransform:"capitalize"}}>{d.type}</div><div style={{fontSize:12,color:t.textMuted}}>{fmtTime(d.time)}{d.note?` · ${d.note}`:""}</div></div><IconBtn onClick={()=>remove(d.id)}>🗑</IconBtn></Card>))}
      <Modal open={modal} onClose={()=>setModal(false)} title="Couche">
        <div style={{display:"flex",gap:8,marginBottom:14}}>{["pipi","caca","mixte"].map(tp=><Chip key={tp} active={type===tp} onClick={()=>setType(tp)} color="#F59E0B">{emojis[tp]} {tp}</Chip>)}</div>
        <Input label="Heure" type="datetime-local" value={time} onChange={e=>setTime(e.target.value)}/><Input label="Note" value={note} onChange={e=>setNote(e.target.value)} placeholder="Couleur, consistance..."/><Btn onClick={add} full>Enregistrer</Btn>
      </Modal>
    </div>
  );
};

// ═══════════════════════════════════════
// SLEEP
// ═══════════════════════════════════════
const SleepSection = ({data,update}) => {
  const t=useTheme(); const [modal,setModal]=useState(false); const [start,setStart]=useState(nowStr()); const [end,setEnd]=useState(""); const [type,setType]=useState("sieste");
  const add=()=>{update(d=>{d.sleep.push({id:uid(),start,end:end||null,type})});setModal(false)};
  const remove=id=>update(d=>{d.sleep=d.sleep.filter(x=>x.id!==id)});
  const sorted=[...(data.sleep||[])].sort((a,b)=>b.start.localeCompare(a.start));
  const ongoing=(data.sleep||[]).find(s=>!s.end);
  const dur=s=>{if(!s.end)return"En cours 💤";const m=Math.round((new Date(s.end)-new Date(s.start))/6e4);return m>=60?`${Math.floor(m/60)}h${String(m%60).padStart(2,"0")}`:`${m} min`};
  return (
    <div>
      <div style={{fontSize:22,fontWeight:900,marginBottom:16}}>😴 Sommeil</div>
      <div style={{display:"flex",gap:10,marginBottom:18}}>
        {!ongoing?<Btn variant="secondary" full onClick={()=>update(d=>{d.sleep.push({id:uid(),start:nowStr(),end:null,type:"sieste"})})}>💤 Début sieste</Btn>
        :<Btn variant="success" full onClick={()=>update(d=>{const s=d.sleep.find(x=>x.id===ongoing.id);if(s)s.end=nowStr()})}>⏰ Fin ({dur(ongoing)})</Btn>}
        <Btn onClick={()=>{setStart(nowStr());setEnd("");setModal(true)}} small>+ Manuel</Btn>
      </div>
      {sorted.slice(0,30).map(s=>(<Card key={s.id} highlighted={!s.end} style={{display:"flex",alignItems:"center",marginBottom:8}}><span style={{fontSize:22,marginRight:14}}>{!s.end?"💤":s.type==="nuit"?"🌙":"😴"}</span><div style={{flex:1}}><div style={{fontWeight:800,fontSize:14}}>{dur(s)}</div><div style={{fontSize:12,color:t.textMuted}}>{fmt(s.start)} {fmtTime(s.start)}{s.end?` → ${fmtTime(s.end)}`:""}</div></div><IconBtn onClick={()=>remove(s.id)}>🗑</IconBtn></Card>))}
      <Modal open={modal} onClose={()=>setModal(false)} title="Sommeil">
        <div style={{display:"flex",gap:8,marginBottom:14}}>{["sieste","nuit"].map(tp=><Chip key={tp} active={type===tp} onClick={()=>setType(tp)} color="#6366F1">{tp==="nuit"?"🌙":"💤"} {tp}</Chip>)}</div>
        <Input label="Début" type="datetime-local" value={start} onChange={e=>setStart(e.target.value)}/><Input label="Fin (vide=en cours)" type="datetime-local" value={end} onChange={e=>setEnd(e.target.value)}/><Btn onClick={add} full>Enregistrer</Btn>
      </Modal>
    </div>
  );
};

// ═══════════════════════════════════════
// FOOD
// ═══════════════════════════════════════
const FoodSection = ({data,update}) => {
  const t=useTheme(); const [cat,setCat]=useState("Légumes");
  const toggle=name=>update(d=>{d.foods[name]?delete d.foods[name]:d.foods[name]={date:todayStr(),reaction:"ok"}});
  const setR=(name,r)=>update(d=>{if(d.foods[name])d.foods[name].reaction=r});
  const tried=Object.keys(data.foods||{}).filter(k=>data.foods[k]).length;
  const total=Object.values(FOOD_CATEGORIES).flat().length;
  return (
    <div>
      <div style={{fontSize:22,fontWeight:900,marginBottom:4}}>🥕 Diversification</div>
      <div style={{fontSize:13,color:t.textMuted,fontWeight:600,marginBottom:14}}>{tried}/{total} aliments goûtés</div>
      <div style={{background:t.cardBorder,borderRadius:10,height:8,marginBottom:18,overflow:"hidden"}}><div style={{height:"100%",width:`${(tried/total)*100}%`,background:"linear-gradient(90deg,#22C55E,#10B981)",borderRadius:10,transition:"width .4s"}}/></div>
      <div style={{display:"flex",gap:6,overflowX:"auto",marginBottom:14,paddingBottom:2}}>{Object.keys(FOOD_CATEGORIES).map(c=><Chip key={c} active={cat===c} onClick={()=>setCat(c)} color={CAT_COLORS[c]}>{c}</Chip>)}</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {FOOD_CATEGORIES[cat].map(food=>{
          const done=!!data.foods?.[food]; const r=data.foods?.[food]?.reaction;
          const bg=done?(r==="allergie"?t.dangerBg:r==="refusé"?t.warnBg:t.successBg):t.card;
          const bd=done?(r==="allergie"?t.danger:r==="refusé"?t.warn:t.success):t.cardBorder;
          return (<div key={food} onClick={()=>toggle(food)} style={{padding:"11px 13px",borderRadius:14,cursor:"pointer",background:bg,border:`2px solid ${bd}`,transition:"all .2s"}}>
            <div style={{fontWeight:700,fontSize:13,color:t.text}}>{done?"✓ ":""}{food}</div>
            {done&&(<div style={{display:"flex",gap:3,marginTop:6}} onClick={e=>e.stopPropagation()}>{[["ok","👍"],["refusé","🚫"],["allergie","⚠️"]].map(([rv,em])=>(<span key={rv} onClick={()=>setR(food,rv)} style={{fontSize:10,padding:"2px 7px",borderRadius:8,fontWeight:700,cursor:"pointer",background:r===rv?(rv==="allergie"?t.danger:rv==="refusé"?t.warn:t.success):t.chipBg,color:r===rv?"#fff":t.textSoft}}>{em}</span>))}</div>)}
          </div>);
        })}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════
// GROWTH with OMS curves
// ═══════════════════════════════════════
const GrowthSection = ({data,update,profile}) => {
  const t=useTheme(); const [modal,setModal]=useState(false); const [weight,setWeight]=useState(""); const [height,setHeight]=useState(""); const [head,setHead]=useState(""); const [date,setDate]=useState(todayStr());
  const add=()=>{update(d=>{d.growth.push({id:uid(),date,weight:Number(weight)||null,height:Number(height)||null,head:Number(head)||null})});setModal(false);setWeight("");setHeight("");setHead("")};
  const remove=id=>update(d=>{d.growth=d.growth.filter(x=>x.id!==id)});
  const sorted=[...(data.growth||[])].sort((a,b)=>b.date.localeCompare(a.date));
  const chartData=[...(data.growth||[])].sort((a,b)=>a.date.localeCompare(b.date));
  const gender=profile?.gender||"boy";
  const omsW=gender==="girl"?OMS_WEIGHT_GIRLS:OMS_WEIGHT_BOYS;
  const omsH=gender==="girl"?OMS_HEIGHT_GIRLS:OMS_HEIGHT_BOYS;
  const [chartType,setChartType]=useState("weight");

  // SVG OMS chart
  const renderOMSChart = (type) => {
    const oms = type==="weight"?omsW:omsH;
    const unit = type==="weight"?"kg":"cm";
    const babyData = chartData.filter(g=>g[type]).map(g=>({month:babyAgeMonths(profile.birthDate)-Math.round((new Date()-new Date(g.date))/2.628e9),value:g[type]})).filter(g=>g.month>=0&&g.month<=24);
    const percentiles = type==="weight"?["P3","P15","P50","P85","P97"]:["P3","P50","P97"];
    const pColors = {"P3":"#D1D5DB","P15":"#9CA3AF","P50":t.accent,"P85":"#9CA3AF","P97":"#D1D5DB"};
    const allVals = percentiles.flatMap(p=>oms[p]);
    const minV=Math.min(...allVals)*0.9, maxV=Math.max(...allVals)*1.05;
    const W=340,H=180,padL=35,padR=10,padT=15,padB=25;
    const cW=W-padL-padR, cH=H-padT-padB;
    const x=m=>padL+(m/24)*cW;
    const y=v=>padT+cH-(((v-minV)/(maxV-minV))*cH);

    return (
      <Card style={{padding:16,marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <span style={{fontSize:12,fontWeight:700,color:t.textSoft}}>📈 Courbe OMS — {type==="weight"?"Poids":"Taille"}</span>
          <div style={{display:"flex",gap:4}}>{["weight","height"].map(tp=>(<span key={tp} onClick={()=>setChartType(tp)} style={{fontSize:11,padding:"3px 10px",borderRadius:8,fontWeight:700,cursor:"pointer",background:chartType===tp?t.accent:t.chipBg,color:chartType===tp?"#fff":t.textSoft}}>{tp==="weight"?"Poids":"Taille"}</span>))}</div>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:180}}>
          {/* Grid */}
          {[0,6,12,18,24].map(m=>(<g key={m}><line x1={x(m)} y1={padT} x2={x(m)} y2={H-padB} stroke={t.cardBorder} strokeWidth=".5"/><text x={x(m)} y={H-6} textAnchor="middle" fontSize="8" fill={t.textMuted}>{m}m</text></g>))}
          {/* Percentile bands */}
          {percentiles.length===5&&<polygon points={`${oms.P3.map((v,i)=>`${x(i)},${y(v)}`).join(" ")} ${[...oms.P97].reverse().map((v,i)=>`${x(24-i)},${y(v)}`).join(" ")}`} fill={t.accent} opacity=".06"/>}
          {/* Percentile lines */}
          {percentiles.map(p=>(<polyline key={p} points={oms[p].map((v,i)=>`${x(i)},${y(v)}`).join(" ")} fill="none" stroke={pColors[p]||t.textMuted} strokeWidth={p==="P50"?"1.5":".8"} strokeDasharray={p==="P50"?"":"4 3"} opacity={p==="P50"?1:.6}/>))}
          {/* Labels */}
          {percentiles.map(p=>(<text key={p} x={W-padR+2} y={y(oms[p][24])+3} fontSize="7" fill={t.textMuted}>{p}</text>))}
          {/* Baby data */}
          {babyData.length>=2&&<polyline points={babyData.map(d=>`${x(d.month)},${y(d.value)}`).join(" ")} fill="none" stroke={t.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>}
          {babyData.map((d,i)=>(<g key={i}><circle cx={x(d.month)} cy={y(d.value)} r="4" fill={t.card} stroke={t.accent} strokeWidth="2.5"/><text x={x(d.month)} y={y(d.value)-8} textAnchor="middle" fontSize="8" fill={t.accent} fontWeight="700">{d.value}{unit}</text></g>))}
        </svg>
        <div style={{display:"flex",justifyContent:"center",gap:12,marginTop:8,fontSize:10,color:t.textMuted}}>
          <span>--- P3/P97 (extrêmes)</span>
          <span style={{color:t.accent,fontWeight:700}}>━ P50 (médiane)</span>
          <span style={{color:t.accent}}>● Bébé</span>
        </div>
      </Card>
    );
  };

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{fontSize:22,fontWeight:900}}>📏 Croissance</div>
        <Btn onClick={()=>{setDate(todayStr());setModal(true)}} small>+ Mesure</Btn>
      </div>
      {chartData.length>=1&&renderOMSChart(chartType)}
      {sorted.map(g=>(<Card key={g.id} style={{display:"flex",alignItems:"center",marginBottom:8}}><div style={{flex:1}}><div style={{fontWeight:800,fontSize:14}}>{fmtFull(g.date)}</div><div style={{fontSize:12,color:t.textSoft,display:"flex",gap:12,marginTop:4}}>{g.weight&&<span>⚖️ {g.weight} kg</span>}{g.height&&<span>📏 {g.height} cm</span>}{g.head&&<span>🧠 {g.head} cm</span>}</div></div><IconBtn onClick={()=>remove(g.id)}>🗑</IconBtn></Card>))}
      <Modal open={modal} onClose={()=>setModal(false)} title="Nouvelle mesure"><Input label="Date" type="date" value={date} onChange={e=>setDate(e.target.value)}/><Input label="Poids (kg)" type="number" step=".01" value={weight} onChange={e=>setWeight(e.target.value)} placeholder="6.5"/><Input label="Taille (cm)" type="number" step=".1" value={height} onChange={e=>setHeight(e.target.value)} placeholder="67"/><Input label="Tour de tête (cm)" type="number" step=".1" value={head} onChange={e=>setHead(e.target.value)} placeholder="43"/><Btn onClick={add} full style={{marginTop:4}}>Enregistrer</Btn></Modal>
    </div>
  );
};

// ═══════════════════════════════════════
// MILESTONES
// ═══════════════════════════════════════
const MilestonesSection = ({data,update,profile}) => {
  const t=useTheme(); const ageM=babyAgeMonths(profile.birthDate);
  const avail=Object.keys(data.milestones||DEFAULT_MILESTONES).map(Number).sort((a,b)=>a-b);
  const [month,setMonth]=useState(avail.includes(ageM)?ageM:avail.find(m=>m>=ageM)||avail[0]||1);
  const toggle=(m,i)=>{const k=`${m}-${i}`;update(d=>{d.milestonesChecked[k]=!d.milestonesChecked[k]})};
  const items=(data.milestones||DEFAULT_MILESTONES)[month]||[];
  const checkedN=items.filter((_,i)=>data.milestonesChecked?.[`${month}-${i}`]).length;
  return (
    <div>
      <div style={{fontSize:22,fontWeight:900,marginBottom:4}}>🏆 Étapes</div>
      <div style={{fontSize:13,color:t.textMuted,fontWeight:600,marginBottom:14}}>Mois {month} — {checkedN}/{items.length}</div>
      <div style={{display:"flex",gap:5,overflowX:"auto",marginBottom:14,paddingBottom:4}}>
        {avail.map(m=>{const tot=(data.milestones||DEFAULT_MILESTONES)[m]?.length||0;const done=((data.milestones||DEFAULT_MILESTONES)[m]||[]).filter((_,i)=>data.milestonesChecked?.[`${m}-${i}`]).length;
          return (<span key={m} onClick={()=>setMonth(m)} style={{flex:"0 0 auto",minWidth:38,height:38,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,cursor:"pointer",background:month===m?t.accent:(tot>0&&done===tot)?t.successBg:t.chipBg,color:month===m?"#fff":(tot>0&&done===tot)?t.success:t.textSoft,border:m===ageM&&month!==m?`2px solid ${t.accent}`:"1.5px solid transparent"}}>{m}</span>);
        })}
      </div>
      <div style={{background:t.cardBorder,borderRadius:10,height:8,marginBottom:18,overflow:"hidden"}}><div style={{height:"100%",width:`${items.length?(checkedN/items.length)*100:0}%`,background:t.accentGrad,borderRadius:10,transition:"width .4s"}}/></div>
      {items.map((item,i)=>{const checked=!!data.milestonesChecked?.[`${month}-${i}`];
        return (<Card key={i} onClick={()=>toggle(month,i)} highlighted={checked} style={{display:"flex",alignItems:"center",marginBottom:8}}>
          <div style={{width:30,height:30,borderRadius:10,marginRight:14,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,background:checked?t.accent:t.chipBg,color:checked?"#fff":t.textMuted,transition:"all .2s",flexShrink:0}}>{checked?"✓":""}</div>
          <div style={{fontWeight:600,fontSize:14,color:checked?t.accent:t.text,textDecoration:checked?"line-through":"none"}}>{item}</div>
        </Card>);
      })}
    </div>
  );
};

// ═══════════════════════════════════════
// TEETH
// ═══════════════════════════════════════
const TeethSection = ({data,update}) => {
  const t=useTheme();
  const toggle=id=>update(d=>{if(!d.teeth)d.teeth={};d.teeth[id]?delete d.teeth[id]:d.teeth[id]={date:todayStr()}});
  const count=Object.keys(data.teeth||{}).length;
  const renderJaw=(teeth)=>(
    <div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center"}}>
      {teeth.map(th=>(<div key={th.id} onClick={()=>toggle(th.id)} style={{width:38,height:38,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:18,background:data.teeth?.[th.id]?t.warnBg:t.chipBg,border:`2px solid ${data.teeth?.[th.id]?t.warn:t.cardBorder}`,transition:"all .2s"}} title={th.name}>{data.teeth?.[th.id]?"🦷":"○"}</div>))}
    </div>
  );
  return (
    <div>
      <div style={{fontSize:22,fontWeight:900,marginBottom:4}}>🦷 Dents de lait</div>
      <div style={{fontSize:13,color:t.textMuted,fontWeight:600,marginBottom:18}}>{count}/20</div>
      <Card style={{padding:20,marginBottom:16,textAlign:"center"}}>
        <div style={{fontSize:12,fontWeight:700,color:t.textSoft,marginBottom:10}}>Mâchoire supérieure</div>
        {renderJaw(TEETH_MAP.filter(th=>th.pos==="top"))}
        <div style={{height:16}}/>
        <div style={{fontSize:12,fontWeight:700,color:t.textSoft,marginBottom:10}}>Mâchoire inférieure</div>
        {renderJaw(TEETH_MAP.filter(th=>th.pos==="bottom"))}
      </Card>
      {TEETH_MAP.map(th=>(<div key={th.id} onClick={()=>toggle(th.id)} style={{display:"flex",alignItems:"center",padding:"10px 14px",marginBottom:5,borderRadius:12,cursor:"pointer",background:data.teeth?.[th.id]?t.warnBg:t.card,border:`1.5px solid ${t.cardBorder}`,fontSize:13}}>
        <span style={{marginRight:10,fontSize:16}}>{data.teeth?.[th.id]?"🦷":"○"}</span><span style={{flex:1,fontWeight:600,color:t.text}}>{th.name}</span><span style={{color:t.textMuted,fontSize:11}}>{th.avg}</span>
        {data.teeth?.[th.id]&&<span style={{fontSize:10,marginLeft:8,color:t.success,fontWeight:700}}>{fmt(data.teeth[th.id].date)}</span>}
      </div>))}
    </div>
  );
};

// ═══════════════════════════════════════
// APPOINTMENTS
// ═══════════════════════════════════════
const AppointmentsSection = ({data,update}) => {
  const t=useTheme(); const [modal,setModal]=useState(false); const [title,setTitle]=useState(""); const [date,setDate]=useState(todayStr()); const [time,setTime]=useState("09:00"); const [doctor,setDoctor]=useState(""); const [note,setNote]=useState(""); const [type,setType]=useState("pédiatre");
  const emojis={"pédiatre":"👨‍⚕️",vaccin:"💉",urgence:"🚑",spécialiste:"🏥",autre:"📋"};
  const add=()=>{update(d=>{d.appointments.push({id:uid(),title,date,time,doctor,note,type})});setModal(false);setTitle("");setDoctor("");setNote("")};
  const remove=id=>update(d=>{d.appointments=d.appointments.filter(x=>x.id!==id)});
  const upcoming=(data.appointments||[]).filter(a=>a.date>=todayStr()).sort((a,b)=>a.date.localeCompare(b.date));
  const past=(data.appointments||[]).filter(a=>a.date<todayStr()).sort((a,b)=>b.date.localeCompare(a.date));
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><div style={{fontSize:22,fontWeight:900}}>📅 Rendez-vous</div><Btn onClick={()=>setModal(true)} small>+ Nouveau</Btn></div>
      {upcoming.length===0&&past.length===0&&<Empty emoji="📅" text="Aucun rendez-vous"/>}
      {upcoming.map(a=>(<Card key={a.id} highlighted style={{marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between"}}><div style={{fontWeight:800,fontSize:15}}>{emojis[a.type]||"📋"} {a.title||a.type}</div><IconBtn onClick={()=>remove(a.id)}>🗑</IconBtn></div><div style={{fontSize:12,color:t.textSoft,marginTop:4}}>{fmtFull(a.date)} à {a.time}{a.doctor?` · Dr. ${a.doctor}`:""}</div>{a.note&&<div style={{fontSize:12,color:t.textMuted,marginTop:2}}>{a.note}</div>}</Card>))}
      {past.length>0&&<details style={{marginTop:12}}><summary style={{fontSize:13,fontWeight:700,color:t.textMuted,cursor:"pointer"}}>Passés ({past.length})</summary>{past.map(a=>(<div key={a.id} style={{padding:"8px 0",borderBottom:`1px solid ${t.cardBorder}`,fontSize:13,display:"flex",justifyContent:"space-between"}}><span><b>{emojis[a.type]} {a.title||a.type}</b> — {fmt(a.date)}</span><IconBtn onClick={()=>remove(a.id)}>🗑</IconBtn></div>))}</details>}
      <Modal open={modal} onClose={()=>setModal(false)} title="Nouveau RDV">
        <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>{Object.entries(emojis).map(([tp,e])=><Chip key={tp} active={type===tp} onClick={()=>setType(tp)} color="#0EA5E9">{e} {tp}</Chip>)}</div>
        <Input label="Titre" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Visite 6 mois"/><Input label="Date" type="date" value={date} onChange={e=>setDate(e.target.value)}/><Input label="Heure" type="time" value={time} onChange={e=>setTime(e.target.value)}/><Input label="Médecin" value={doctor} onChange={e=>setDoctor(e.target.value)}/><Input label="Notes" value={note} onChange={e=>setNote(e.target.value)}/><Btn onClick={add} full>Enregistrer</Btn>
      </Modal>
    </div>
  );
};

// ═══════════════════════════════════════
// VACCINES
// ═══════════════════════════════════════
const VaccinesSection = ({data,update}) => {
  const t=useTheme();
  const toggle=key=>update(d=>{if(!d.vaccines)d.vaccines={};d.vaccines[key]=d.vaccines[key]?null:todayStr()});
  return (
    <div>
      <div style={{fontSize:22,fontWeight:900,marginBottom:16}}>💉 Calendrier vaccinal</div>
      {VACCINE_SCHEDULE.map((p,pi)=>(<div key={pi} style={{marginBottom:16}}>
        <div style={{fontSize:14,fontWeight:800,color:t.accent,marginBottom:8}}>{p.age}</div>
        {p.vaccines.map((v,vi)=>{const key=`${pi}-${vi}`;const done=!!data.vaccines?.[key];
          return (<Card key={key} onClick={()=>toggle(key)} highlighted={done} style={{display:"flex",alignItems:"center",marginBottom:6}}>
            <div style={{width:26,height:26,borderRadius:8,marginRight:12,display:"flex",alignItems:"center",justifyContent:"center",background:done?t.success:t.chipBg,color:"#fff",fontSize:12,fontWeight:800,flexShrink:0}}>{done?"✓":""}</div>
            <div style={{flex:1}}><div style={{fontWeight:600,fontSize:13,color:done?t.success:t.text}}>{v}</div>{done&&<div style={{fontSize:11,color:t.textMuted}}>Fait le {fmt(data.vaccines[key])}</div>}</div>
          </Card>);
        })}
      </div>))}
    </div>
  );
};

// ═══════════════════════════════════════
// MEDICINES
// ═══════════════════════════════════════
const MedicinesSection = ({data,update}) => {
  const t=useTheme(); const [modal,setModal]=useState(false); const [name,setName]=useState(""); const [dose,setDose]=useState(""); const [time,setTime]=useState(nowStr()); const [note,setNote]=useState("");
  const add=()=>{update(d=>{d.medicines.push({id:uid(),name,dose,time,note})});setModal(false);setName("");setDose("");setNote("")};
  const quick=n=>update(d=>{d.medicines.push({id:uid(),name:n,dose:"",time:nowStr(),note:""})});
  const remove=id=>update(d=>{d.medicines=d.medicines.filter(x=>x.id!==id)});
  const sorted=[...(data.medicines||[])].sort((a,b)=>b.time.localeCompare(a.time));
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><div style={{fontSize:22,fontWeight:900}}>💊 Médicaments</div><Btn onClick={()=>{setTime(nowStr());setModal(true)}} small>+ Ajouter</Btn></div>
      <div style={{display:"flex",gap:7,marginBottom:18,flexWrap:"wrap"}}>{["Doliprane","Vitamine D","Fer","Sérum phy"].map(m=><Btn key={m} variant="secondary" small onClick={()=>quick(m)}>{m}</Btn>)}</div>
      {sorted.length===0&&<Empty emoji="💊" text="Aucun médicament"/>}
      {sorted.map(m=>(<Card key={m.id} style={{display:"flex",alignItems:"center",marginBottom:8}}><span style={{fontSize:22,marginRight:14}}>💊</span><div style={{flex:1}}><div style={{fontWeight:800,fontSize:14}}>{m.name}{m.dose?` — ${m.dose}`:""}</div><div style={{fontSize:12,color:t.textMuted}}>{fmt(m.time)} {fmtTime(m.time)}{m.note?` · ${m.note}`:""}</div></div><IconBtn onClick={()=>remove(m.id)}>🗑</IconBtn></Card>))}
      <Modal open={modal} onClose={()=>setModal(false)} title="Médicament"><Input label="Nom" value={name} onChange={e=>setName(e.target.value)}/><Input label="Dosage" value={dose} onChange={e=>setDose(e.target.value)} placeholder="2.5ml"/><Input label="Heure" type="datetime-local" value={time} onChange={e=>setTime(e.target.value)}/><Input label="Note" value={note} onChange={e=>setNote(e.target.value)}/><Btn onClick={add} full>Enregistrer</Btn></Modal>
    </div>
  );
};

// ═══════════════════════════════════════
// TEMPERATURE
// ═══════════════════════════════════════
const TemperatureSection = ({data,update}) => {
  const t=useTheme(); const [modal,setModal]=useState(false); const [value,setValue]=useState("37.0"); const [time,setTime]=useState(nowStr()); const [note,setNote]=useState("");
  const add=()=>{update(d=>{if(!d.temperature)d.temperature=[];d.temperature.push({id:uid(),value:Number(value),time,note})});setModal(false);setNote("")};
  const remove=id=>update(d=>{d.temperature=(d.temperature||[]).filter(x=>x.id!==id)});
  const sorted=[...(data.temperature||[])].sort((a,b)=>b.time.localeCompare(a.time));
  const gc=v=>v>=38.5?t.danger:v>=37.5?t.warn:t.success;
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><div style={{fontSize:22,fontWeight:900}}>🌡️ Température</div><Btn onClick={()=>{setTime(nowStr());setModal(true)}} small>+ Mesure</Btn></div>
      {sorted.length===0&&<Empty emoji="🌡️" text="Aucune mesure"/>}
      {sorted.map(tp=>(<Card key={tp.id} style={{display:"flex",alignItems:"center",marginBottom:8}}><div style={{width:50,height:50,borderRadius:14,background:`${gc(tp.value)}15`,display:"flex",alignItems:"center",justifyContent:"center",marginRight:14,fontWeight:900,fontSize:16,color:gc(tp.value),flexShrink:0}}>{tp.value}°</div><div style={{flex:1}}><div style={{fontWeight:700,fontSize:13}}>{tp.value>=38.5?"🔴 Fièvre":tp.value>=37.5?"🟡 Subfébrile":"🟢 Normal"}</div><div style={{fontSize:12,color:t.textMuted}}>{fmt(tp.time)} {fmtTime(tp.time)}{tp.note?` · ${tp.note}`:""}</div></div><IconBtn onClick={()=>remove(tp.id)}>🗑</IconBtn></Card>))}
      <Modal open={modal} onClose={()=>setModal(false)} title="Température"><Input label="°C" type="number" step=".1" value={value} onChange={e=>setValue(e.target.value)}/><Input label="Heure" type="datetime-local" value={time} onChange={e=>setTime(e.target.value)}/><Input label="Note" value={note} onChange={e=>setNote(e.target.value)}/><Btn onClick={add} full>Enregistrer</Btn></Modal>
    </div>
  );
};

// ═══════════════════════════════════════
// BATHS
// ═══════════════════════════════════════
const BathsSection = ({data,update}) => {
  const t=useTheme(); const [modal,setModal]=useState(false); const [time,setTime]=useState(nowStr()); const [temp,setTemp]=useState("37"); const [note,setNote]=useState("");
  const add=()=>{update(d=>{d.baths.push({id:uid(),time,temp:Number(temp),note})});setModal(false);setNote("")};
  const remove=id=>update(d=>{d.baths=d.baths.filter(x=>x.id!==id)});
  const sorted=[...(data.baths||[])].sort((a,b)=>b.time.localeCompare(a.time));
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><div style={{fontSize:22,fontWeight:900}}>🛁 Bains</div><Btn onClick={()=>{setTime(nowStr());setModal(true)}} small>+ Ajouter</Btn></div>
      <Btn variant="secondary" full onClick={()=>update(d=>{d.baths.push({id:uid(),time:nowStr(),temp:37,note:""})})} style={{marginBottom:16}}>🛁 Bain maintenant (37°C)</Btn>
      {sorted.length===0&&<Empty emoji="🛁" text="Aucun bain"/>}
      {sorted.map(b=>(<Card key={b.id} style={{display:"flex",alignItems:"center",marginBottom:8}}><span style={{fontSize:22,marginRight:14}}>🛁</span><div style={{flex:1}}><div style={{fontWeight:800,fontSize:14}}>{b.temp}°C</div><div style={{fontSize:12,color:t.textMuted}}>{fmt(b.time)} {fmtTime(b.time)}{b.note?` · ${b.note}`:""}</div></div><IconBtn onClick={()=>remove(b.id)}>🗑</IconBtn></Card>))}
      <Modal open={modal} onClose={()=>setModal(false)} title="Bain"><Input label="Heure" type="datetime-local" value={time} onChange={e=>setTime(e.target.value)}/><Input label="Temp eau (°C)" type="number" step=".5" value={temp} onChange={e=>setTemp(e.target.value)}/><Input label="Note" value={note} onChange={e=>setNote(e.target.value)}/><Btn onClick={add} full>Enregistrer</Btn></Modal>
    </div>
  );
};

// ═══════════════════════════════════════
// NOTES / JOURNAL with Photos
// ═══════════════════════════════════════
const NotesSection = ({data,update,profileId}) => {
  const t=useTheme(); const [modal,setModal]=useState(false); const [text,setText]=useState(""); const [mood,setMood]=useState("😊"); const [photoUrl,setPhotoUrl]=useState(""); const [uploading,setUploading]=useState(false);
  const fileRef=useRef();
  const handlePhoto=async(e)=>{
    const file=e.target.files?.[0]; if(!file)return;
    setUploading(true);
    try { const url=await uploadPhoto(profileId,file); setPhotoUrl(url); } catch(err){ console.error(err); alert("Erreur upload photo"); }
    setUploading(false);
  };
  const add=()=>{if(!text.trim()&&!photoUrl)return;update(d=>{d.notes.push({id:uid(),text,mood,photo:photoUrl||null,date:new Date().toISOString()})});setModal(false);setText("");setPhotoUrl("")};
  const remove=id=>update(d=>{d.notes=d.notes.filter(x=>x.id!==id)});
  const sorted=[...(data.notes||[])].sort((a,b)=>b.date.localeCompare(a.date));
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><div style={{fontSize:22,fontWeight:900}}>📝 Journal</div><Btn onClick={()=>setModal(true)} small>+ Écrire</Btn></div>
      {sorted.length===0&&<Empty emoji="📝" text="Écrivez vos premiers souvenirs"/>}
      {sorted.map(n=>(<Card key={n.id} style={{marginBottom:10}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:12,color:t.textMuted,fontWeight:700}}>{n.mood} {fmtFull(n.date)}</span><IconBtn onClick={()=>remove(n.id)}>🗑</IconBtn></div>
        {n.photo&&<img src={n.photo} alt="" style={{width:"100%",borderRadius:12,marginBottom:8,maxHeight:250,objectFit:"cover"}}/>}
        {n.text&&<div style={{fontSize:14,lineHeight:1.7,color:t.text}}>{n.text}</div>}
      </Card>))}
      <Modal open={modal} onClose={()=>setModal(false)} title="Nouveau souvenir">
        <div style={{display:"flex",gap:8,marginBottom:14}}>
          {["😊","😢","😴","🤒","🎉","❤️","😂","🥰","😤"].map(m=>(<span key={m} onClick={()=>setMood(m)} style={{fontSize:24,cursor:"pointer",padding:4,borderRadius:8,background:mood===m?t.accentLight:"transparent"}}>{m}</span>))}
        </div>
        <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Aujourd'hui, bébé a..." style={{width:"100%",minHeight:100,padding:"12px 14px",borderRadius:14,border:`2px solid ${t.inputBorder}`,fontSize:15,outline:"none",resize:"vertical",boxSizing:"border-box",background:t.card,color:t.text}}/>
        {/* Photo upload */}
        <div style={{marginTop:10,marginBottom:10}}>
          <input type="file" accept="image/*" ref={fileRef} onChange={handlePhoto} style={{display:"none"}}/>
          <Btn variant="secondary" small onClick={()=>fileRef.current?.click()} style={{width:"100%"}}>{uploading?"⏳ Upload en cours...":"📷 Ajouter une photo"}</Btn>
          {photoUrl&&<img src={photoUrl} alt="" style={{width:"100%",borderRadius:12,marginTop:8,maxHeight:200,objectFit:"cover"}}/>}
        </div>
        <Btn onClick={add} full>Enregistrer</Btn>
      </Modal>
    </div>
  );
};

// ═══════════════════════════════════════
// SETTINGS (Dark mode, PDF Export, Notifications)
// ═══════════════════════════════════════
const SettingsSection = ({data,profile,darkMode,setDarkMode,onSwitchProfile}) => {
  const t=useTheme();

  const exportPDF = () => {
    // Generate a printable HTML and trigger print
    const age = babyAgeText(profile.birthDate);
    const lastG = (data.growth||[]).sort((a,b)=>b.date.localeCompare(a.date))[0];
    const teethCount = Object.keys(data.teeth||{}).length;
    const foodCount = Object.keys(data.foods||{}).filter(k=>data.foods[k]).length;
    const foodList = Object.keys(data.foods||{}).filter(k=>data.foods[k]).join(", ");
    const teethList = TEETH_MAP.filter(th=>data.teeth?.[th.id]).map(th=>`${th.name} (${fmt(data.teeth[th.id].date)})`).join(", ");
    const vaccinesDone = VACCINE_SCHEDULE.flatMap((p,pi)=>p.vaccines.map((v,vi)=>data.vaccines?.[`${pi}-${vi}`]?`${v} — ${fmt(data.vaccines[`${pi}-${vi}`])}`:"").filter(Boolean));
    const milestonesDone = Object.keys(data.milestonesChecked||{}).filter(k=>data.milestonesChecked[k]).map(k=>{const [m,i]=k.split("-");return (data.milestones||DEFAULT_MILESTONES)[m]?.[i]}).filter(Boolean);
    const appointments = (data.appointments||[]).map(a=>`${a.type} — ${fmtFull(a.date)} — ${a.title||""} ${a.doctor?`Dr.${a.doctor}`:""}`).join("<br/>");
    const growthTable = (data.growth||[]).sort((a,b)=>a.date.localeCompare(b.date)).map(g=>`<tr><td>${fmtFull(g.date)}</td><td>${g.weight||"—"} kg</td><td>${g.height||"—"} cm</td><td>${g.head||"—"} cm</td></tr>`).join("");

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Carnet de santé — ${profile.name}</title>
    <style>body{font-family:Arial,sans-serif;max-width:700px;margin:40px auto;color:#333;line-height:1.6}h1{color:#7C3AED;border-bottom:3px solid #7C3AED;padding-bottom:8px}h2{color:#7C3AED;margin-top:24px}table{width:100%;border-collapse:collapse;margin:8px 0}td,th{border:1px solid #ddd;padding:6px 10px;font-size:13px}th{background:#f5f3ff}.tag{display:inline-block;background:#f5f3ff;padding:2px 8px;border-radius:8px;margin:2px;font-size:12px}@media print{body{margin:20px}}</style></head>
    <body><h1>👶 Carnet de santé — ${profile.name}</h1>
    <p><strong>Date de naissance :</strong> ${fmtFull(profile.birthDate)} &nbsp;|&nbsp; <strong>Âge :</strong> ${age} &nbsp;|&nbsp; <strong>Genre :</strong> ${profile.gender==="boy"?"Garçon":"Fille"}</p>
    <p><strong>Dernière mesure :</strong> ${lastG?`${lastG.weight||"?"} kg, ${lastG.height||"?"} cm, tête ${lastG.head||"?"} cm`:"Aucune"}</p>
    <h2>📏 Croissance</h2><table><tr><th>Date</th><th>Poids</th><th>Taille</th><th>Tête</th></tr>${growthTable}</table>
    <h2>🦷 Dents (${teethCount}/20)</h2><p>${teethList||"Aucune encore"}</p>
    <h2>🥕 Diversification (${foodCount} aliments)</h2><p>${foodList||"Pas encore commencé"}</p>
    <h2>💉 Vaccins</h2>${vaccinesDone.length?vaccinesDone.map(v=>`<div class="tag">${v}</div>`).join(""):"<p>Aucun enregistré</p>"}
    <h2>🏆 Étapes acquises</h2>${milestonesDone.length?milestonesDone.map(m=>`<div class="tag">✓ ${m}</div>`).join(""):"<p>Aucune cochée</p>"}
    <h2>📅 Rendez-vous</h2>${appointments||"<p>Aucun</p>"}
    <hr style="margin-top:30px"><p style="font-size:11px;color:#999">Généré le ${fmtFull(new Date().toISOString())} — Baby Tracker</p>
    </body></html>`;

    const w = window.open("","_blank");
    w.document.write(html);
    w.document.close();
    setTimeout(()=>w.print(), 500);
  };

  const requestNotifications = async () => {
    if (!("Notification" in window)) { alert("Les notifications ne sont pas supportées sur ce navigateur"); return; }
    const perm = await Notification.requestPermission();
    if (perm === "granted") {
      new Notification("Baby Tracker 🍼", { body: `Notifications activées pour ${profile.name} !`, icon: "👶" });
      alert("Notifications activées !");
    } else {
      alert("Notifications refusées. Vous pouvez les activer dans les paramètres du navigateur.");
    }
  };

  return (
    <div>
      <div style={{fontSize:22,fontWeight:900,marginBottom:20}}>⚙️ Paramètres</div>

      {/* Dark mode */}
      <Card style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <div><div style={{fontWeight:700,fontSize:14}}>🌙 Mode sombre</div><div style={{fontSize:12,color:t.textMuted}}>Reposant pour les yeux la nuit</div></div>
        <div onClick={()=>setDarkMode(!darkMode)} style={{width:52,height:28,borderRadius:14,background:darkMode?t.accent:t.cardBorder,cursor:"pointer",position:"relative",transition:"background .3s"}}>
          <div style={{width:22,height:22,borderRadius:11,background:"#fff",position:"absolute",top:3,left:darkMode?27:3,transition:"left .3s",boxShadow:"0 1px 3px rgba(0,0,0,.2)"}}/>
        </div>
      </Card>

      {/* PDF export */}
      <Card onClick={exportPDF} style={{marginBottom:10,cursor:"pointer"}}>
        <div style={{fontWeight:700,fontSize:14}}>📄 Exporter en PDF</div>
        <div style={{fontSize:12,color:t.textMuted}}>Générer le carnet de santé complet</div>
      </Card>

      {/* Notifications */}
      <Card onClick={requestNotifications} style={{marginBottom:10,cursor:"pointer"}}>
        <div style={{fontWeight:700,fontSize:14}}>🔔 Activer les notifications</div>
        <div style={{fontSize:12,color:t.textMuted}}>Rappels RDV et vaccins</div>
      </Card>

      {/* Switch profile */}
      <Card onClick={onSwitchProfile} style={{marginBottom:10,cursor:"pointer"}}>
        <div style={{fontWeight:700,fontSize:14}}>👶 Changer de profil</div>
        <div style={{fontSize:12,color:t.textMuted}}>Revenir à la sélection des bébés</div>
      </Card>

      {/* Info */}
      <Card style={{marginTop:20,textAlign:"center"}}>
        <div style={{fontSize:13,color:t.textMuted,fontWeight:600}}>Baby Tracker v2.0</div>
        <div style={{fontSize:11,color:t.textMuted,marginTop:4}}>Fait avec ❤️ pour {profile.name}</div>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════
export default function App() {
  const [profiles, setProfiles] = useState({});
  const [activeProfileId, setActiveProfileId] = useState(null);
  const [data, setData] = useState(null);
  const [section, setSection] = useState("home");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem("baby-tracker-dark") === "true"; } catch { return false; }
  });
  const saveTimer = useRef(null);
  const ignoreNext = useRef(false);

  const theme = darkMode ? DARK : LIGHT;

  // Save dark mode pref
  useEffect(() => { try { localStorage.setItem("baby-tracker-dark", darkMode); } catch {} }, [darkMode]);

  // Subscribe to profiles
  useEffect(() => {
    const unsub = subscribeToProfiles((p) => { setProfiles(p); setLoading(false); });
    return unsub;
  }, []);

  // Subscribe to active profile data
  useEffect(() => {
    if (!activeProfileId) return;
    setData(null);
    const unsub = subscribeToData(activeProfileId, (val) => {
      if (ignoreNext.current) { ignoreNext.current = false; return; }
      setData(val || defaultState());
      setSyncing(false);
    });
    return unsub;
  }, [activeProfileId]);

  const update = useCallback((fn) => {
    if (!activeProfileId) return;
    setData(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      fn(next);
      next._lastUpdated = new Date().toISOString();
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        setSyncing(true);
        ignoreNext.current = true;
        saveData(activeProfileId, next).then(() => setSyncing(false));
      }, 600);
      return next;
    });
  }, [activeProfileId]);

  const handleCreateProfile = async (info) => {
    const id = await createProfile(info);
    // Init data for this profile
    const initial = defaultState();
    initial._lastUpdated = new Date().toISOString();
    await saveData(id, initial);
    setActiveProfileId(id);
    setSection("home");
  };

  const handleDeleteProfile = async (id) => {
    await deleteProfile(id);
    if (activeProfileId === id) { setActiveProfileId(null); setData(null); }
  };

  const handleSwitchProfile = () => { setActiveProfileId(null); setData(null); setSection("home"); };

  // ─── Notification scheduler ───
  useEffect(() => {
    if (!data || !activeProfileId || !("Notification" in window) || Notification.permission !== "granted") return;
    const profile = profiles[activeProfileId];
    if (!profile) return;
    // Check upcoming appointments (today)
    const todayAppts = (data.appointments || []).filter(a => a.date === todayStr());
    todayAppts.forEach(a => {
      const now = new Date();
      const apptTime = new Date(`${a.date}T${a.time}`);
      const diff = apptTime - now;
      if (diff > 0 && diff < 3600000) { // less than 1h away
        setTimeout(() => {
          new Notification(`📅 RDV pour ${profile.name}`, { body: `${a.title || a.type} à ${a.time}${a.doctor ? ` — Dr. ${a.doctor}` : ""}` });
        }, Math.max(diff - 900000, 0)); // 15min before
      }
    });
  }, [data, activeProfileId, profiles]);

  // ─── Rendering ───
  if (loading) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#0F0F14"}}>
      <div style={{textAlign:"center"}}><div style={{fontSize:52,marginBottom:12,animation:"pulse 1.5s infinite"}}>👶</div><div style={{color:"#A78BFA",fontWeight:800,fontSize:15,fontFamily:"'Nunito',sans-serif"}}>Chargement...</div></div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=swap');@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}`}</style>
    </div>
  );

  // Profile selector
  if (!activeProfileId) return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');*{margin:0;padding:0;box-sizing:border-box;font-family:'Nunito',sans-serif;-webkit-tap-highlight-color:transparent}`}</style>
      <ProfileSelector profiles={profiles} onSelect={id=>setActiveProfileId(id)} onAdd={handleCreateProfile} onDelete={handleDeleteProfile} />
    </>
  );

  if (!data) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:theme.bg}}>
      <style>{makeCSS(theme)}</style>
      <div style={{textAlign:"center"}}><div style={{fontSize:40,animation:"pulse 1.5s infinite"}}>👶</div><div style={{color:theme.accent,fontWeight:800,marginTop:8}}>Chargement...</div></div>
    </div>
  );

  const profile = profiles[activeProfileId] || {};

  const SECTIONS = {
    home: <DashboardHome data={data} profile={profile} goTo={setSection} onSwitchProfile={handleSwitchProfile} />,
    bottles: <BottlesSection data={data} update={update} />,
    diapers: <DiapersSection data={data} update={update} />,
    sleep: <SleepSection data={data} update={update} />,
    food: <FoodSection data={data} update={update} />,
    growth: <GrowthSection data={data} update={update} profile={profile} />,
    milestones: <MilestonesSection data={data} update={update} profile={profile} />,
    teeth: <TeethSection data={data} update={update} />,
    appointments: <AppointmentsSection data={data} update={update} />,
    vaccines: <VaccinesSection data={data} update={update} />,
    medicines: <MedicinesSection data={data} update={update} />,
    temperature: <TemperatureSection data={data} update={update} />,
    baths: <BathsSection data={data} update={update} />,
    notes: <NotesSection data={data} update={update} profileId={activeProfileId} />,
    settings: <SettingsSection data={data} profile={profile} darkMode={darkMode} setDarkMode={setDarkMode} onSwitchProfile={handleSwitchProfile} />,
  };

  const navItems = [
    {key:"home",emoji:"🏠",label:"Accueil"},
    {key:"bottles",emoji:"🍼",label:"Biberons"},
    {key:"food",emoji:"🥕",label:"Aliments"},
    {key:"milestones",emoji:"🏆",label:"Étapes"},
    {key:"notes",emoji:"📝",label:"Journal"},
  ];

  return (
    <ThemeCtx.Provider value={theme}>
      <style>{makeCSS(theme)}</style>
      <SyncBadge syncing={syncing} />
      {/* Dark mode toggle floating */}
      <div onClick={()=>setDarkMode(!darkMode)} style={{position:"fixed",top:12,right:12,zIndex:999,cursor:"pointer",fontSize:18,background:theme.card,width:32,height:32,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:theme.shadow,border:`1px solid ${theme.cardBorder}`}}>
        {darkMode?"☀️":"🌙"}
      </div>

      <div style={{maxWidth:500,margin:"0 auto",minHeight:"100vh",background:theme.bg,paddingBottom:80,transition:"background .3s"}}>
        {section!=="home"&&(
          <div style={{display:"flex",alignItems:"center",padding:"14px 16px",gap:10,background:theme.bg,position:"sticky",top:0,zIndex:100}}>
            <span onClick={()=>setSection("home")} style={{cursor:"pointer",color:theme.accent,fontSize:20,fontWeight:900}}>‹</span>
            <span style={{fontWeight:800,fontSize:15,color:theme.text}}>{profile.name}</span>
          </div>
        )}
        <div style={{padding:"0 14px"}}>{SECTIONS[section]||<DashboardHome data={data} profile={profile} goTo={setSection} onSwitchProfile={handleSwitchProfile}/>}</div>
        <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:500,background:theme.navBg,borderTop:`1.5px solid ${theme.navBorder}`,display:"flex",justifyContent:"space-around",padding:"8px 0 20px",zIndex:200}}>
          {navItems.map(n=>(
            <div key={n.key} onClick={()=>setSection(n.key)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:1,cursor:"pointer",color:section===n.key?theme.accent:theme.textMuted,transition:"color .2s",padding:"4px 8px"}}>
              <span style={{fontSize:20,transition:"transform .15s",transform:section===n.key?"scale(1.15)":"scale(1)"}}>{n.emoji}</span>
              <span style={{fontSize:10,fontWeight:800}}>{n.label}</span>
            </div>
          ))}
        </div>
      </div>
    </ThemeCtx.Provider>
  );
}