import React from "react";
import { useTheme } from "../../theme/Theme";
import { Card } from "../ui";
import { babyAgeText, todayItems, todayStr, fmt } from "../../utils/helpers";

const SectionTitle = ({children, t}) => (
  <div style={{fontSize:12,fontWeight:800,color:t.textSoft,textTransform:"uppercase",letterSpacing:1,marginTop:24,marginBottom:12}}>{children}</div>
);

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

  const dailyCards = [
    {key:"bottles",emoji:"🍼",label:"Biberons",value:`${todayB.length} — ${totalMl} ml`},
    {key:"diapers",emoji:"🧷",label:"Couches",value:`${todayD.length} changées`},
    {key:"sleep",emoji:"😴",label:"Sommeil",value:`${todayS.length} siestes`},
    {key:"food",emoji:"🥕",label:"Diversification",value:`${foodCount} aliments`},
    {key:"baths",emoji:"🛁",label:"Bains",value:`${todayItems(data.baths).length}`},
  ];

  const healthCards = [
    {key:"growth",emoji:"📏",label:"Croissance",value:lastG?`${lastG.weight||"?"}kg · ${lastG.height||"?"}cm`:"—"},
    {key:"teeth",emoji:"🦷",label:"Dents",value:`${teethCount}/20`},
    {key:"temperature",emoji:"🌡️",label:"Température",value:(data.temperature||[]).length?`${data.temperature[data.temperature.length-1].value}°C`:"—"},
    {key:"medicines",emoji:"💊",label:"Médicaments",value:`${(data.medicines||[]).length}`},
    {key:"vaccines",emoji:"💉",label:"Vaccins",value:"Calendrier"},
    {key:"appointments",emoji:"📅",label:"RDV",value:nextAppt?fmt(nextAppt.date):"Aucun"},
  ];

  const memoryCards = [
    {key:"milestones",emoji:"🏆",label:"Étapes",value:"Voir progrès"},
    {key:"notes",emoji:"📝",label:"Journal",value:`${(data.notes||[]).length} notes`},
    {key:"settings",emoji:"⚙️",label:"Paramètres",value:"PDF, thème..."},
  ];

  const cardGrid = (cards) => (
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
      {cards.map(c=>(
        <Card key={c.key} onClick={()=>goTo(c.key)}>
          <div style={{fontSize:32,marginBottom:10}}>{c.emoji}</div>
          <div style={{fontSize:13,fontWeight:800,color:t.text}}>{c.label}</div>
          <div style={{fontSize:11,color:t.textMuted,fontWeight:600,marginTop:2}}>{c.value}</div>
        </Card>
      ))}
    </div>
  );

  return (
    <div>
      <div style={{background:t.heroGrad,borderRadius:28,padding:"28px 24px 24px",marginBottom:20,color:"#fff",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-40,right:-40,width:140,height:140,borderRadius:"50%",background:"rgba(255,255,255,.1)"}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{fontSize:12,color:"#FFFFFF",opacity:.95,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase"}}>{new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})}</div>
            <div style={{fontSize:30,fontWeight:900,marginTop:6}}>{profile.avatar||"👶"} {profile.name}</div>
            {age&&<div style={{fontSize:15,marginTop:4,opacity:.9,fontWeight:600}}>{age}</div>}
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <span onClick={onSwitchProfile} style={{cursor:"pointer",fontSize:11,background:"rgba(255,255,255,.2)",padding:"6px 12px",borderRadius:12,fontWeight:700,backdropFilter:"blur(4px)"}}>Changer ↩</span>
          </div>
        </div>
      </div>

      <div style={{display:"flex",gap:8,marginBottom:20,overflowX:"auto",paddingBottom:2}}>
        {[{e:"🍼",v:`${totalMl}ml`,k:"bottles"},{e:"🧷",v:todayD.length,k:"diapers"},{e:"😴",v:todayS.length,k:"sleep"},{e:"🦷",v:teethCount,k:"teeth"}].map((s,i)=>(
          <div key={i} onClick={()=>goTo(s.k)} style={{flex:"0 0 auto",background:t.card,borderRadius:14,padding:"9px 16px",display:"flex",alignItems:"center",gap:7,border:`1.5px solid ${t.cardBorder}`,fontWeight:800,fontSize:14,cursor:"pointer",color:t.text}}>
            <span style={{fontSize:18}}>{s.e}</span>{s.v}
          </div>
        ))}
      </div>

      <SectionTitle t={t}>Quotidien</SectionTitle>
      {cardGrid(dailyCards)}

      <SectionTitle t={t}>Santé</SectionTitle>
      {cardGrid(healthCards)}

      <SectionTitle t={t}>Souvenirs & Réglages</SectionTitle>
      {cardGrid(memoryCards)}
    </div>
  );
};

export default DashboardHome;
