// ─── OMS Weight Data (boys P3, P15, P50, P85, P97 — 0-24 months, kg) ───
export const OMS_WEIGHT_BOYS = {
  P3:  [2.5,3.4,4.3,5.0,5.6,6.0,6.4,6.7,6.9,7.1,7.4,7.6,7.7,7.9,8.1,8.3,8.4,8.6,8.8,8.9,9.1,9.2,9.4,9.5,9.7],
  P15: [2.9,3.8,4.9,5.6,6.2,6.7,7.1,7.4,7.7,8.0,8.2,8.4,8.6,8.8,9.0,9.2,9.4,9.6,9.8,10.0,10.1,10.3,10.5,10.7,10.8],
  P50: [3.3,4.5,5.6,6.4,7.0,7.5,7.9,8.3,8.6,8.9,9.2,9.4,9.6,9.9,10.1,10.3,10.5,10.7,10.9,11.1,11.3,11.5,11.8,12.0,12.2],
  P85: [3.9,5.1,6.3,7.2,7.8,8.4,8.8,9.2,9.6,9.9,10.2,10.5,10.8,11.0,11.3,11.5,11.8,12.0,12.2,12.5,12.7,12.9,13.2,13.4,13.7],
  P97: [4.3,5.7,7.0,8.0,8.6,9.2,9.7,10.1,10.5,10.9,11.2,11.5,11.8,12.1,12.4,12.7,12.9,13.2,13.5,13.7,14.0,14.3,14.5,14.8,15.1],
};
export const OMS_WEIGHT_GIRLS = {
  P3:  [2.4,3.2,3.9,4.5,5.0,5.4,5.7,6.0,6.2,6.5,6.7,6.9,7.0,7.2,7.4,7.5,7.7,7.8,8.0,8.1,8.3,8.4,8.6,8.7,8.9],
  P15: [2.8,3.6,4.5,5.2,5.7,6.1,6.5,6.8,7.0,7.3,7.5,7.7,7.9,8.1,8.3,8.5,8.7,8.8,9.0,9.2,9.4,9.5,9.7,9.9,10.1],
  P50: [3.2,4.2,5.1,5.8,6.4,6.9,7.3,7.6,7.9,8.2,8.5,8.7,8.9,9.2,9.4,9.6,9.8,10.0,10.2,10.4,10.6,10.9,11.1,11.3,11.5],
  P85: [3.7,4.8,5.8,6.6,7.3,7.8,8.2,8.6,9.0,9.3,9.6,9.9,10.1,10.4,10.6,10.9,11.1,11.4,11.6,11.8,12.1,12.3,12.6,12.8,13.1],
  P97: [4.2,5.4,6.5,7.4,8.1,8.7,9.1,9.6,10.0,10.3,10.7,11.0,11.3,11.6,11.9,12.2,12.4,12.7,13.0,13.2,13.5,13.8,14.1,14.4,14.7],
};
export const OMS_HEIGHT_BOYS = {
  P3:  [46.3,51.1,54.7,57.6,60.0,61.9,63.6,65.1,66.5,67.7,69.0,70.2,71.3,72.4,73.4,74.4,75.4,76.3,77.2,78.1,78.9,79.7,80.5,81.3,82.1],
  P50: [49.9,54.7,58.4,61.4,63.9,65.9,67.6,69.2,70.6,72.0,73.3,74.5,75.7,76.9,78.0,79.1,80.2,81.2,82.3,83.2,84.2,85.1,86.0,86.9,87.8],
  P97: [53.4,58.4,62.2,65.3,67.8,69.9,71.6,73.2,74.7,76.2,77.6,78.9,80.2,81.3,82.5,83.7,84.9,86.1,87.3,88.4,89.5,90.5,91.6,92.6,93.5],
};
export const OMS_HEIGHT_GIRLS = {
  P3:  [45.6,50.0,53.2,56.0,58.2,60.1,61.7,63.2,64.5,65.8,67.0,68.2,69.4,70.5,71.6,72.6,73.6,74.6,75.6,76.5,77.5,78.4,79.3,80.1,81.0],
  P50: [49.1,53.7,57.1,59.8,62.1,64.0,65.7,67.3,68.7,70.1,71.5,72.8,74.0,75.2,76.4,77.5,78.6,79.7,80.7,81.7,82.7,83.7,84.6,85.5,86.5],
  P97: [52.7,57.4,60.9,63.7,66.0,67.9,69.8,71.3,72.9,74.5,75.9,77.4,78.6,79.9,81.2,82.4,83.6,84.8,85.9,87.0,88.0,89.0,90.0,91.0,91.9],
};

// ─── Milestones ───
export const DEFAULT_MILESTONES = {
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

export const TEETH_MAP = [
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

export const FOOD_CATEGORIES = {
  "Légumes":["Carotte","Courgette","Haricot vert","Patate douce","Potiron","Petit pois","Brocoli","Épinard","Panais","Poireau","Navet","Betterave","Artichaut","Aubergine","Fenouil","Chou-fleur","Tomate","Avocat","Maïs","Concombre","Céleri","Poivron"],
  "Fruits":["Pomme","Poire","Banane","Pêche","Abricot","Prune","Mangue","Fraise","Myrtille","Framboise","Melon","Pastèque","Kiwi","Orange","Clémentine","Raisin","Cerise","Ananas","Figue","Datte"],
  "Féculents":["Riz","Pâtes","Semoule","Pomme de terre","Quinoa","Polenta","Pain","Lentilles","Pois chiches","Boulgour","Flocons d'avoine"],
  "Protéines":["Poulet","Dinde","Bœuf","Veau","Agneau","Jambon blanc","Poisson blanc","Saumon","Cabillaud","Sardine","Œuf","Tofu"],
  "Laitiers":["Yaourt nature","Fromage blanc","Petit suisse","Gruyère","Comté","Chèvre frais","Kiri","Vache qui rit","Ricotta"],
};
export const CAT_COLORS = {"Légumes":"#22C55E","Fruits":"#F43F5E","Féculents":"#EAB308","Protéines":"#A855F7","Laitiers":"#3B82F6"};

export const VACCINE_SCHEDULE = [
  {age:"2 mois",vaccines:["DTCaP-Hib-HepB (1ère dose)","Pneumocoque (1ère dose)"]},
  {age:"4 mois",vaccines:["DTCaP-Hib-HepB (2ème dose)","Pneumocoque (2ème dose)"]},
  {age:"5 mois",vaccines:["Méningocoque C (1ère dose)"]},
  {age:"11 mois",vaccines:["DTCaP-Hib-HepB (rappel)","Pneumocoque (rappel)"]},
  {age:"12 mois",vaccines:["ROR (1ère dose)","Méningocoque C (2ème dose)"]},
  {age:"16-18 mois",vaccines:["ROR (2ème dose)"]},
];

export const PROFILE_AVATARS = ["👶","👶🏻","👶🏼","👶🏽","👶🏾","👶🏿","🧒","🧒🏻","🧒🏼","🧒🏽","🧒🏾","🧒🏿"];
export const PROFILE_COLORS = ["#A78BFA","#F472B6","#34D399","#60A5FA","#FBBF24","#F87171","#818CF8","#2DD4BF"];
