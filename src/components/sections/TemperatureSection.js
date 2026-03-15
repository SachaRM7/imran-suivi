import React, { useState } from "react";
import { useTheme } from "../../theme/Theme";
import { Card, Btn, Input, Modal, IconBtn } from "../ui";
import { uid, nowStr, fmt, fmtTime } from "../../utils/helpers";

const TemperatureSection = ({data,update}) => {
  const t=useTheme();
  const [modal,setModal]=useState(false);
  const [value,setValue]=useState("");   // 1. vide, pas de pré-remplissage
  const [time,setTime]=useState(nowStr());
  const [note,setNote]=useState("");

  // 1. Validation basique avant ajout
  const add=()=>{
    const num=Number(value);
    if(!num||num<34||num>42) return;
    update(d=>{if(!d.temperature)d.temperature=[];d.temperature.push({id:uid(),value:num,time,note})});
    setModal(false);setValue("");setNote("");
  };

  const remove=id=>update(d=>{d.temperature=(d.temperature||[]).filter(x=>x.id!==id)});
  const sorted=[...(data.temperature||[])].sort((a,b)=>b.time.localeCompare(a.time));

  // 3. Seuils pédiatriques incluant hypothermie
  const gc=v=>v>=38.0?t.danger:v>=37.5?t.warn:v>=36.5?t.success:"#0EA5E9";
  const label=v=>v>=38.0?"🔴 Fièvre":v>=37.5?"🟡 À surveiller":v>=36.5?"🟢 Normal":"🔵 Hypothermie";

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{fontSize:22,fontWeight:900}}>🌡️ Température</div>
        <Btn onClick={()=>{setTime(nowStr());setModal(true)}} small>+ Mesure</Btn>
      </div>

      {/* 2. Empty state interactif */}
      {sorted.length===0&&(
        <div style={{textAlign:"center",padding:"50px 20px"}}>
          <div style={{fontSize:60,marginBottom:12}}>🌡️</div>
          <div style={{fontSize:16,fontWeight:700,color:t.textSoft,marginBottom:6}}>Aucune température relevée</div>
          <div style={{fontSize:13,color:t.textMuted,marginBottom:20}}>Mesurez la température de votre enfant</div>
          <Btn onClick={()=>{setTime(nowStr());setModal(true);}}>+ Nouvelle mesure</Btn>
        </div>
      )}

      {sorted.map(tp=>(
        <Card key={tp.id} style={{display:"flex",alignItems:"center",marginBottom:8}}>
          {/* 3. Indicateur coloré — bleu pour hypothermie */}
          <div style={{
            width:50,height:50,borderRadius:14,marginRight:14,flexShrink:0,
            background:`${gc(tp.value)}15`,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontWeight:900,fontSize:16,color:gc(tp.value),
          }}>{tp.value}°</div>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,fontSize:13}}>{label(tp.value)}</div>
            <div style={{fontSize:12,color:t.textMuted}}>{fmt(tp.time)} {fmtTime(tp.time)}{tp.note?` · ${tp.note}`:""}</div>
          </div>
          <IconBtn onClick={()=>remove(tp.id)}>🗑</IconBtn>
        </Card>
      ))}

      <Modal open={modal} onClose={()=>setModal(false)} title="Température">
        {/* 1. Pavé numérique mobile */}
        <Input
          label="Température (°C)" type="number"
          inputMode="decimal" pattern="[0-9]*" step=".1"
          value={value} onChange={e=>setValue(e.target.value)} placeholder="Ex: 37.5"
        />
        <Input label="Heure" type="datetime-local" value={time} onChange={e=>setTime(e.target.value)}/>
        <Input label="Note" value={note} onChange={e=>setNote(e.target.value)}/>
        <Btn onClick={add} full>Enregistrer</Btn>
      </Modal>
    </div>
  );
};

export default TemperatureSection;
