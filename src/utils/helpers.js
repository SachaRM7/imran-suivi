import { DEFAULT_MILESTONES } from '../constants';

export const defaultState = () => ({
  bottles:[],diapers:[],sleep:[],foods:{},growth:[],milestones:JSON.parse(JSON.stringify(DEFAULT_MILESTONES)),
  milestonesChecked:{},teeth:{},appointments:[],notes:[],medicines:[],baths:[],vaccines:{},temperature:[],
  recipes:[],recipeReactions:{},routines:[],exercisesChecked:{},customExercises:{},books:[],
  _lastUpdated:null
});

export const fmt = d => new Date(d).toLocaleDateString("fr-FR",{day:"numeric",month:"short"});
export const fmtTime = d => new Date(d).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});
export const fmtFull = d => new Date(d).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"});
export const todayStr = () => new Date().toISOString().slice(0,10);
export const nowStr = () => new Date().toISOString().slice(0,16);
export const uid = () => Math.random().toString(36).slice(2,10)+Date.now().toString(36);

export const babyAgeMonths = bd => {
  if(!bd) return 0;
  const b=new Date(bd),n=new Date();
  return Math.max(0,(n.getFullYear()-b.getFullYear())*12+n.getMonth()-b.getMonth());
};

export const babyAgeText = bd => {
  if(!bd) return "";
  const days=Math.floor((new Date()-new Date(bd))/864e5);
  if(days<0) return "Pas encore né";
  if(days<31) return `${days} jour${days>1?"s":""}`;
  const m=Math.floor(days/30.44), d=Math.round(days-m*30.44);
  if(m<24) return `${m} mois${d>0?` et ${d}j`:""}`;
  const y=Math.floor(m/12), rm=m%12;
  return `${y} an${y>1?"s":""}${rm>0?` et ${rm} mois`:""}`;
};

export const todayItems = arr => (arr||[]).filter(i => (i.date||i.time||i.start||"").startsWith(todayStr()));
