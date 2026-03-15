import React, { useState } from "react";
import { useTheme } from "../../theme/Theme";
import { Card, Btn, Input, Modal, IconBtn, Empty } from "../ui";
import { uid, nowStr, fmt, fmtTime } from "../../utils/helpers";

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

export default BathsSection;
