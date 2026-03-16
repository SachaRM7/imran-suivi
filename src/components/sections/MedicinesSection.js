import React, { useState } from "react";
import { useTheme } from "../../theme/Theme";
import { Card, Btn, Input, Modal, IconBtn, Empty } from "../ui";
import { uid, nowStr, todayStr, fmt, fmtTime } from "../../utils/helpers";

const yesterday = () => { const d = new Date(); d.setDate(d.getDate()-1); return d.toISOString().slice(0,10); };

const MedicinesSection = ({data,update}) => {
  const t=useTheme();
  const [modal,setModal]=useState(false);
  const [editId,setEditId]=useState(null);
  const [name,setName]=useState("");
  const [dose,setDose]=useState("");
  const [time,setTime]=useState(nowStr());
  const [note,setNote]=useState("");
  const [histDate,setHistDate]=useState(yesterday);

  const openAdd=()=>{setEditId(null);setName("");setDose("");setTime(nowStr());setNote("");setModal(true);};
  const openEdit=(m)=>{setEditId(m.id);setName(m.name||"");setDose(m.dose||"");setTime(m.time);setNote(m.note||"");setModal(true);};

  const save=()=>{
    if(editId){
      update(d=>{const x=d.medicines.find(i=>i.id===editId);if(x){x.name=name;x.dose=dose;x.time=time;x.note=note;}});
    } else {
      update(d=>{d.medicines.push({id:uid(),name,dose,time,note})});
    }
    setModal(false);setName("");setDose("");setNote("");setEditId(null);
  };

  const quick=n=>update(d=>{d.medicines.push({id:uid(),name:n,dose:"",time:nowStr(),note:""})});
  const remove=id=>update(d=>{d.medicines=d.medicines.filter(x=>x.id!==id)});
  const sorted=[...(data.medicines||[])].sort((a,b)=>b.time.localeCompare(a.time));
  const todayM=sorted.filter(m=>m.time?.startsWith(todayStr()));
  const olderM=sorted.filter(m=>!m.time?.startsWith(todayStr()));

  const isModalToday = time.startsWith(todayStr());

  const histEntries=olderM.filter(m=>m.time?.slice(0,10)===histDate).sort((a,b)=>b.time.localeCompare(a.time));
  const histDates=[...new Set(olderM.map(m=>m.time?.slice(0,10)).filter(Boolean))].sort().reverse();
  const yest=yesterday();
  const prevDay=()=>setHistDate(d=>{const dt=new Date(d);dt.setDate(dt.getDate()-1);return dt.toISOString().slice(0,10);});
  const nextDay=()=>setHistDate(d=>{const dt=new Date(d);dt.setDate(dt.getDate()+1);const n=dt.toISOString().slice(0,10);return n<=yest?n:d;});

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{fontSize:22,fontWeight:900}}>💊 Médicaments</div>
        <Btn onClick={openAdd} small>+ Ajouter</Btn>
      </div>

      <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:18}}>
        {["Doliprane","Vitamine D","Fer","Sérum phy"].map(m=>(
          <Btn key={m} variant="secondary" small onClick={()=>quick(m)}
            style={{background:t.accentLight,border:`1.5px solid ${t.chipBorder}`,borderRadius:20,padding:"8px 14px",fontSize:13,fontWeight:700,color:t.accent}}>
            💊 {m}
          </Btn>
        ))}
      </div>

      {todayM.length===0&&olderM.length===0&&<Empty emoji="💊" text="Aucun médicament"/>}

      {todayM.map(m=>(
        <Card key={m.id} style={{display:"flex",alignItems:"center",marginBottom:8}}>
          <span style={{fontSize:22,marginRight:14}}>💊</span>
          <div style={{flex:1}}>
            <div style={{fontWeight:800,fontSize:14}}>{m.name}{m.dose?` — ${m.dose}`:""}</div>
            <div style={{fontSize:12,color:t.textMuted}}>{fmtTime(m.time)}{m.note?` · ${m.note}`:""}</div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <IconBtn onClick={()=>openEdit(m)}>✏️</IconBtn>
            <IconBtn onClick={()=>remove(m.id)}>🗑</IconBtn>
          </div>
        </Card>
      ))}

      {olderM.length>0&&(
        <div style={{marginTop:18}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
            <div style={{fontSize:12,fontWeight:800,color:t.textSoft,textTransform:"uppercase",letterSpacing:1}}>Historique</div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span onClick={prevDay} style={{cursor:"pointer",color:t.accent,fontSize:20,lineHeight:1,padding:"0 4px"}}>‹</span>
              <span style={{fontWeight:700,fontSize:13,color:t.text,minWidth:70,textAlign:"center"}}>{fmt(histDate+"T12:00:00")}</span>
              <span onClick={nextDay} style={{cursor:"pointer",color:histDate<yest?t.accent:t.textMuted,fontSize:20,lineHeight:1,padding:"0 4px"}}>›</span>
            </div>
          </div>
          {histEntries.length===0
            ?<div style={{textAlign:"center",padding:"18px 0",color:t.textMuted,fontSize:13}}>Aucun médicament ce jour</div>
            :histEntries.map(m=>(
              <div key={m.id} style={{display:"flex",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${t.cardBorder}`,fontSize:13}}>
                <span style={{fontSize:16,marginRight:8}}>💊</span>
                <span style={{flex:1,fontWeight:700}}>{m.name}{m.dose?` — ${m.dose}`:""}</span>
                <span style={{color:t.textMuted,marginRight:8}}>{fmtTime(m.time)}</span>
                <IconBtn onClick={()=>openEdit(m)} style={{padding:4}}>✏️</IconBtn>
                <IconBtn onClick={()=>remove(m.id)}>🗑</IconBtn>
              </div>
            ))
          }
          {histDates.length>0&&(
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:10}}>
              {histDates.slice(0,10).map(d=>(
                <span key={d} onClick={()=>setHistDate(d)} style={{
                  fontSize:11,padding:"4px 10px",borderRadius:10,cursor:"pointer",fontWeight:700,
                  background:histDate===d?t.accent:t.chipBg,
                  color:histDate===d?"#fff":t.textSoft,
                  border:`1px solid ${histDate===d?t.accent:t.chipBorder}`,
                }}>{fmt(d+"T12:00:00")}</span>
              ))}
            </div>
          )}
        </div>
      )}

      <Modal open={modal} onClose={()=>{setModal(false);setEditId(null);}} title={editId?"Modifier le médicament":"Médicament"}>
        <Input label="Nom" value={name} onChange={e=>setName(e.target.value)}/>
        <Input label="Dosage" value={dose} onChange={e=>setDose(e.target.value)} placeholder="2.5ml"/>
        {isModalToday
          ? <Input label="Heure" type="time" value={time.slice(11,16)} onChange={e=>setTime(todayStr()+"T"+e.target.value)}/>
          : <Input label="Heure" type="datetime-local" value={time} onChange={e=>setTime(e.target.value)}/>
        }
        <Input label="Note" value={note} onChange={e=>setNote(e.target.value)}/>
        <Btn onClick={save} full>{editId?"Mettre à jour":"Enregistrer"}</Btn>
      </Modal>
    </div>
  );
};

export default MedicinesSection;
