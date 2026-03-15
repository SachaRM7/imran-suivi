import React, { useState } from "react";
import { useTheme } from "../../theme/Theme";
import { Card } from "../ui";
import { babyAgeMonths } from "../../utils/helpers";
import { DEFAULT_MILESTONES } from "../../constants";

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

export default MilestonesSection;
