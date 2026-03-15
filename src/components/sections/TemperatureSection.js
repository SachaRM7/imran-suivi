import React, { useState } from "react";
import { useTheme } from "../../theme/Theme";
import { Card, Btn, Input, Modal, IconBtn, Empty } from "../ui";
import { uid, nowStr, fmt, fmtTime } from "../../utils/helpers";

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

export default TemperatureSection;
