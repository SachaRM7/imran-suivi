import React, { useState } from "react";
import { useTheme } from "../../theme/Theme";
import { Chip } from "../ui";
import { todayStr } from "../../utils/helpers";
import { FOOD_CATEGORIES, CAT_COLORS } from "../../constants";

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

export default FoodSection;
