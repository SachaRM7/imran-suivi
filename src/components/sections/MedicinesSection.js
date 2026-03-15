import React, { useState } from "react";
import { useTheme } from "../../theme/Theme";
import { Card, Btn, Input, Modal, IconBtn, Empty } from "../ui";
import { uid, nowStr, fmt, fmtTime } from "../../utils/helpers";

const MedicinesSection = ({data,update}) => {
  const t=useTheme(); const [modal,setModal]=useState(false); const [name,setName]=useState(""); const [dose,setDose]=useState(""); const [time,setTime]=useState(nowStr()); const [note,setNote]=useState("");
  const add=()=>{update(d=>{d.medicines.push({id:uid(),name,dose,time,note})});setModal(false);setName("");setDose("");setNote("")};
  const quick=n=>update(d=>{d.medicines.push({id:uid(),name:n,dose:"",time:nowStr(),note:""})});
  const remove=id=>update(d=>{d.medicines=d.medicines.filter(x=>x.id!==id)});
  const sorted=[...(data.medicines||[])].sort((a,b)=>b.time.localeCompare(a.time));
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><div style={{fontSize:22,fontWeight:900}}>💊 Médicaments</div><Btn onClick={()=>{setTime(nowStr());setModal(true)}} small>+ Ajouter</Btn></div>
      <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:18}}>
        {["Doliprane","Vitamine D","Fer","Sérum phy"].map(m=>(
          <Btn key={m} variant="secondary" small onClick={()=>quick(m)} style={{background:t.accentLight,border:`1.5px solid ${t.chipBorder}`,borderRadius:20,padding:"8px 14px",fontSize:13,fontWeight:700,color:t.accent}}>
            💊 {m}
          </Btn>
        ))}
      </div>
      {sorted.length===0&&<Empty emoji="💊" text="Aucun médicament"/>}
      {sorted.map(m=>(<Card key={m.id} style={{display:"flex",alignItems:"center",marginBottom:8}}><span style={{fontSize:22,marginRight:14}}>💊</span><div style={{flex:1}}><div style={{fontWeight:800,fontSize:14}}>{m.name}{m.dose?` — ${m.dose}`:""}</div><div style={{fontSize:12,color:t.textMuted}}>{fmt(m.time)} {fmtTime(m.time)}{m.note?` · ${m.note}`:""}</div></div><IconBtn onClick={()=>remove(m.id)}>🗑</IconBtn></Card>))}
      <Modal open={modal} onClose={()=>setModal(false)} title="Médicament"><Input label="Nom" value={name} onChange={e=>setName(e.target.value)}/><Input label="Dosage" value={dose} onChange={e=>setDose(e.target.value)} placeholder="2.5ml"/><Input label="Heure" type="datetime-local" value={time} onChange={e=>setTime(e.target.value)}/><Input label="Note" value={note} onChange={e=>setNote(e.target.value)}/><Btn onClick={add} full>Enregistrer</Btn></Modal>
    </div>
  );
};

export default MedicinesSection;
