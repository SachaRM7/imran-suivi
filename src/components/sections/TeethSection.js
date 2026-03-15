import React from "react";
import { useTheme } from "../../theme/Theme";
import { Card } from "../ui";
import { todayStr, fmt } from "../../utils/helpers";
import { TEETH_MAP } from "../../constants";

const getToothOffset = (index, total, isUpper) => {
  const mid = (total - 1) / 2;
  const distance = Math.abs(index - mid) / mid;
  const offset = Math.round(distance * distance * 12);
  return isUpper ? offset : -offset;
};

const TeethSection = ({data,update}) => {
  const t=useTheme();
  const toggle=id=>update(d=>{if(!d.teeth)d.teeth={};d.teeth[id]?delete d.teeth[id]:d.teeth[id]={date:todayStr()}});
  const count=Object.keys(data.teeth||{}).length;

  const SectionTitle = ({children}) => (
    <div style={{fontSize:13,fontWeight:800,color:t.textSoft,textTransform:"uppercase",letterSpacing:1,marginTop:20,marginBottom:10}}>
      {children}
    </div>
  );

  // 1. Arc U-shape
  const renderJaw = (teeth, isUpper) => (
    <div style={{display:"flex",justifyContent:"center",gap:6,padding:"0 10px"}}>
      {teeth.map((th,i) => (
        <div key={th.id} onClick={() => toggle(th.id)} title={th.name} style={{
          width:40,height:40,borderRadius:14,
          display:"flex",alignItems:"center",justifyContent:"center",
          cursor:"pointer",fontSize:18,
          background:data.teeth?.[th.id]?t.accentLight:t.chipBg,
          border:`2px solid ${data.teeth?.[th.id]?t.accent:t.cardBorder}`,
          transition:"all .2s",
          transform:`translateY(${getToothOffset(i,teeth.length,isUpper)}px)`,
        }}>
          {data.teeth?.[th.id]?"🦷":""}
        </div>
      ))}
    </div>
  );

  const topTeeth    = TEETH_MAP.filter(th=>th.pos==="top");
  const bottomTeeth = TEETH_MAP.filter(th=>th.pos==="bottom");

  // 3. Item de liste
  const ToothItem = ({th}) => (
    <div onClick={()=>toggle(th.id)} style={{
      display:"flex",alignItems:"center",padding:"10px 14px",marginBottom:5,
      borderRadius:12,cursor:"pointer",fontSize:13,
      background:data.teeth?.[th.id]?t.accentLight:t.card,
      border:`1.5px solid ${data.teeth?.[th.id]?t.accent:t.cardBorder}`,
    }}>
      <span style={{marginRight:10,fontSize:16}}>
        {data.teeth?.[th.id]?"🦷":<span style={{color:t.cardBorder}}>○</span>}
      </span>
      <span style={{flex:1,fontWeight:600,color:t.text}}>{th.name}</span>
      <span style={{color:t.textSoft,fontSize:11}}>{th.avg}</span>
      {data.teeth?.[th.id]&&(
        <span style={{fontSize:10,marginLeft:8,color:t.accent,fontWeight:700}}>
          {fmt(data.teeth[th.id].date)}
        </span>
      )}
    </div>
  );

  return (
    <div>
      <div style={{fontSize:22,fontWeight:900,marginBottom:4}}>🦷 Dents de lait</div>
      <div style={{fontSize:13,color:t.textMuted,fontWeight:600,marginBottom:18}}>{count}/20</div>

      {/* Schéma mâchoire */}
      <Card style={{padding:20,marginBottom:16,textAlign:"center"}}>
        <div style={{fontSize:12,fontWeight:700,color:t.textSoft,marginBottom:14}}>Mâchoire supérieure</div>
        {renderJaw(topTeeth, true)}
        <div style={{height:20}}/>
        <div style={{fontSize:12,fontWeight:700,color:t.textSoft,marginBottom:10}}>Mâchoire inférieure</div>
        {renderJaw(bottomTeeth, false)}
      </Card>

      {/* 4. Liste pliable */}
      <details style={{marginTop:16}}>
        <summary style={{
          fontSize:14,fontWeight:700,color:t.textSoft,cursor:"pointer",
          padding:"10px 0",userSelect:"none",listStyle:"none",
          display:"flex",alignItems:"center",gap:6,
        }}>
          📋 Voir la liste détaillée
        </summary>
        <div style={{marginTop:8}}>
          {/* 2. Deux sections */}
          <SectionTitle>Mâchoire supérieure</SectionTitle>
          {topTeeth.map(th=><ToothItem key={th.id} th={th}/>)}
          <SectionTitle>Mâchoire inférieure</SectionTitle>
          {bottomTeeth.map(th=><ToothItem key={th.id} th={th}/>)}
        </div>
      </details>
    </div>
  );
};

export default TeethSection;
