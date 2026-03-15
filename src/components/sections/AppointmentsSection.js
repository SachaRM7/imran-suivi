import React, { useState } from "react";
import { useTheme } from "../../theme/Theme";
import { Card, Btn, Input, Modal, Chip, IconBtn, Empty } from "../ui";
import { uid, todayStr, fmtFull, fmt } from "../../utils/helpers";

const AppointmentsSection = ({data,update}) => {
  const t=useTheme(); const [modal,setModal]=useState(false); const [title,setTitle]=useState(""); const [date,setDate]=useState(todayStr()); const [time,setTime]=useState("09:00"); const [doctor,setDoctor]=useState(""); const [note,setNote]=useState(""); const [type,setType]=useState("pédiatre");
  const emojis={"pédiatre":"👨‍⚕️",vaccin:"💉",urgence:"🚑",spécialiste:"🏥",autre:"📋"};
  const add=()=>{update(d=>{d.appointments.push({id:uid(),title,date,time,doctor,note,type})});setModal(false);setTitle("");setDoctor("");setNote("")};
  const remove=id=>update(d=>{d.appointments=d.appointments.filter(x=>x.id!==id)});
  const upcoming=(data.appointments||[]).filter(a=>a.date>=todayStr()).sort((a,b)=>a.date.localeCompare(b.date));
  const past=(data.appointments||[]).filter(a=>a.date<todayStr()).sort((a,b)=>b.date.localeCompare(a.date));
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><div style={{fontSize:22,fontWeight:900}}>📅 Rendez-vous</div><Btn onClick={()=>setModal(true)} small>+ Nouveau</Btn></div>
      {upcoming.length===0&&past.length===0&&<Empty emoji="📅" text="Aucun rendez-vous"/>}
      {upcoming.map(a=>(<Card key={a.id} highlighted style={{marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between"}}><div style={{fontWeight:800,fontSize:15}}>{emojis[a.type]||"📋"} {a.title||a.type}</div><IconBtn onClick={()=>remove(a.id)}>🗑</IconBtn></div><div style={{fontSize:12,color:t.textSoft,marginTop:4}}>{fmtFull(a.date)} à {a.time}{a.doctor?` · Dr. ${a.doctor}`:""}</div>{a.note&&<div style={{fontSize:12,color:t.textMuted,marginTop:2}}>{a.note}</div>}</Card>))}
      {past.length>0&&<details style={{marginTop:12}}><summary style={{fontSize:13,fontWeight:700,color:t.textMuted,cursor:"pointer"}}>Passés ({past.length})</summary>{past.map(a=>(<div key={a.id} style={{padding:"8px 0",borderBottom:`1px solid ${t.cardBorder}`,fontSize:13,display:"flex",justifyContent:"space-between"}}><span><b>{emojis[a.type]} {a.title||a.type}</b> — {fmt(a.date)}</span><IconBtn onClick={()=>remove(a.id)}>🗑</IconBtn></div>))}</details>}
      <Modal open={modal} onClose={()=>setModal(false)} title="Nouveau RDV">
        <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>{Object.entries(emojis).map(([tp,e])=><Chip key={tp} active={type===tp} onClick={()=>setType(tp)} color="#0EA5E9">{e} {tp}</Chip>)}</div>
        <Input label="Titre" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Visite 6 mois"/><Input label="Date" type="date" value={date} onChange={e=>setDate(e.target.value)}/><Input label="Heure" type="time" value={time} onChange={e=>setTime(e.target.value)}/><Input label="Médecin" value={doctor} onChange={e=>setDoctor(e.target.value)}/><Input label="Notes" value={note} onChange={e=>setNote(e.target.value)}/><Btn onClick={add} full>Enregistrer</Btn>
      </Modal>
    </div>
  );
};

export default AppointmentsSection;
