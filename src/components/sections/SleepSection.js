import React, { useState } from "react";
import { useTheme } from "../../theme/Theme";
import { Card, Btn, Input, Modal, Chip, IconBtn } from "../ui";
import { uid, nowStr, todayStr, fmt, fmtTime } from "../../utils/helpers";

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

export default SleepSection;
