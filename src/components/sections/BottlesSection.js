import React, { useState } from "react";
import { useTheme } from "../../theme/Theme";
import { Card, Btn, Input, Modal, IconBtn, Empty } from "../ui";
import { uid, nowStr, todayStr, fmtTime, fmt } from "../../utils/helpers";

const BottlesSection = ({data,update}) => {
  const t=useTheme(); const [modal,setModal]=useState(false); const [amount,setAmount]=useState(""); const [time,setTime]=useState(nowStr()); const [note,setNote]=useState("");
  const quickAdd=ml=>update(d=>{d.bottles.push({id:uid(),amount:ml,time:nowStr(),note:""})});
  const add=()=>{if(!(Number(amount)>0))return;update(d=>{d.bottles.push({id:uid(),amount:Number(amount),time,note})});setModal(false);setNote("")};
  const remove=id=>update(d=>{d.bottles=d.bottles.filter(b=>b.id!==id)});
  const todayB=(data.bottles||[]).filter(b=>b.time?.startsWith(todayStr())).sort((a,b)=>b.time.localeCompare(a.time));
  const olderB=(data.bottles||[]).filter(b=>!b.time?.startsWith(todayStr())).sort((a,b)=>b.time.localeCompare(a.time));
  const totalMl=todayB.reduce((s,b)=>s+(b.amount||0),0);
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div><div style={{fontSize:22,fontWeight:900}}>🍼 Biberons</div><div style={{fontSize:13,color:t.textMuted,fontWeight:600}}>Aujourd'hui : {todayB.length} — {totalMl} ml</div></div>
        <Btn onClick={()=>{setTime(nowStr());setModal(true)}} small>+ Détail</Btn>
      </div>
      <div style={{display:"flex",gap:7,marginBottom:18,flexWrap:"wrap"}}>{[60,90,120,150,180,210,240,270].map(ml=>(<Btn key={ml} variant="secondary" small onClick={()=>quickAdd(ml)}>{ml}ml</Btn>))}</div>
      {todayB.length===0&&<Empty emoji="🍼" text="Aucun biberon aujourd'hui"/>}
      {todayB.map(b=>(<Card key={b.id} style={{display:"flex",alignItems:"center",marginBottom:8}}><span style={{fontSize:24,marginRight:14}}>🍼</span><div style={{flex:1}}><div style={{fontWeight:800,fontSize:15}}>{b.amount} ml</div><div style={{fontSize:12,color:t.textMuted}}>{fmtTime(b.time)}{b.note?` · ${b.note}`:""}</div></div><IconBtn onClick={()=>remove(b.id)}>🗑</IconBtn></Card>))}
      {olderB.length>0&&(<details style={{marginTop:14}}><summary style={{fontSize:13,fontWeight:700,color:t.textMuted,cursor:"pointer",padding:"8px 0"}}>Historique ({olderB.length})</summary>{olderB.slice(0,50).map(b=>(<div key={b.id} style={{display:"flex",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${t.cardBorder}`,fontSize:13}}><span style={{flex:1,fontWeight:700}}>{b.amount} ml</span><span style={{color:t.textMuted}}>{fmt(b.time)} {fmtTime(b.time)}</span><IconBtn onClick={()=>remove(b.id)}>🗑</IconBtn></div>))}</details>)}
      <Modal open={modal} onClose={()=>setModal(false)} title="Ajouter un biberon"><Input label="Quantité (ml)" type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="120"/><Input label="Heure" type="datetime-local" value={time} onChange={e=>setTime(e.target.value)}/><Input label="Note" value={note} onChange={e=>setNote(e.target.value)} placeholder="Refusé après 60ml..."/><Btn onClick={add} full style={{marginTop:4}}>Enregistrer</Btn></Modal>
    </div>
  );
};

export default BottlesSection;
