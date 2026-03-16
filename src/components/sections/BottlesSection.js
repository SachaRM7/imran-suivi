import React, { useState } from "react";
import { useTheme } from "../../theme/Theme";
import { Card, Btn, Input, Modal, IconBtn, Empty } from "../ui";
import { uid, nowStr, todayStr, fmtTime, fmt } from "../../utils/helpers";

const yesterday = () => { const d = new Date(); d.setDate(d.getDate()-1); return d.toISOString().slice(0,10); };

const BottlesSection = ({data,update}) => {
  const t=useTheme();
  const [modal,setModal]=useState(false);
  const [editId,setEditId]=useState(null);
  const [amount,setAmount]=useState("");
  const [time,setTime]=useState(nowStr());
  const [note,setNote]=useState("");
  const [histDate,setHistDate]=useState(yesterday);

  const quickAdd=ml=>update(d=>{d.bottles.push({id:uid(),amount:ml,time:nowStr(),note:""})});

  const isToday = time.startsWith(todayStr());

  const openAdd=()=>{setEditId(null);setAmount("");setTime(nowStr());setNote("");setModal(true);};
  const openEdit=(b)=>{setEditId(b.id);setAmount(String(b.amount));setTime(b.time);setNote(b.note||"");setModal(true);};

  const save=()=>{
    if(!(Number(amount)>0)) return;
    if(editId){
      update(d=>{const b=d.bottles.find(x=>x.id===editId);if(b){b.amount=Number(amount);b.time=time;b.note=note;}});
    } else {
      update(d=>{d.bottles.push({id:uid(),amount:Number(amount),time,note})});
    }
    setModal(false);setNote("");setEditId(null);
  };

  const remove=id=>update(d=>{d.bottles=d.bottles.filter(b=>b.id!==id)});
  const todayB=(data.bottles||[]).filter(b=>b.time?.startsWith(todayStr())).sort((a,b)=>b.time.localeCompare(a.time));
  const olderB=(data.bottles||[]).filter(b=>!b.time?.startsWith(todayStr()));
  const totalMl=todayB.reduce((s,b)=>s+(b.amount||0),0);

  const histEntries=olderB.filter(b=>b.time?.slice(0,10)===histDate).sort((a,b)=>b.time.localeCompare(a.time));
  const histDates=[...new Set(olderB.map(b=>b.time?.slice(0,10)).filter(Boolean))].sort().reverse();
  const yest=yesterday();
  const prevDay=()=>setHistDate(d=>{const dt=new Date(d);dt.setDate(dt.getDate()-1);return dt.toISOString().slice(0,10);});
  const nextDay=()=>setHistDate(d=>{const dt=new Date(d);dt.setDate(dt.getDate()+1);const n=dt.toISOString().slice(0,10);return n<=yest?n:d;});

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          <div style={{fontSize:22,fontWeight:900}}>🍼 Biberons</div>
          <div style={{fontSize:13,color:t.textMuted,fontWeight:600}}>Aujourd'hui : {todayB.length} — {totalMl} ml</div>
        </div>
        <Btn onClick={openAdd} small>+ Détail</Btn>
      </div>

      <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:18}}>
        {[60,90,120,150,180,210,240,270].map(ml=>(
          <Btn key={ml} variant="secondary" small onClick={()=>quickAdd(ml)}
            style={{background:t.chipBg,border:`1.5px solid ${t.chipBorder}`,padding:"8px 14px",borderRadius:20,fontSize:13,fontWeight:700}}
          >{ml}ml</Btn>
        ))}
      </div>

      {todayB.length===0&&<Empty emoji="🍼" text="Aucun biberon aujourd'hui"/>}
      {todayB.map(b=>(
        <Card key={b.id} style={{display:"flex",alignItems:"center",marginBottom:8}}>
          <span style={{fontSize:24,marginRight:14}}>🍼</span>
          <div style={{flex:1}}>
            <div style={{fontWeight:800,fontSize:15}}>{b.amount} ml</div>
            <div style={{fontSize:12,color:t.textMuted}}>{fmtTime(b.time)}{b.note?` · ${b.note}`:""}</div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <IconBtn onClick={()=>openEdit(b)} style={{padding:6}}>✏️</IconBtn>
            <IconBtn onClick={()=>remove(b.id)} style={{padding:6}}>🗑</IconBtn>
          </div>
        </Card>
      ))}

      {olderB.length>0&&(
        <div style={{marginTop:18}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
            <div style={{fontSize:12,fontWeight:800,color:t.textSoft,textTransform:"uppercase",letterSpacing:1}}>
              Historique
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span onClick={prevDay} style={{cursor:"pointer",color:t.accent,fontSize:20,lineHeight:1,padding:"0 4px"}}>‹</span>
              <span style={{fontWeight:700,fontSize:13,color:t.text,minWidth:70,textAlign:"center"}}>{fmt(histDate+"T12:00:00")}</span>
              <span onClick={nextDay} style={{cursor:"pointer",color:histDate<yest?t.accent:t.textMuted,fontSize:20,lineHeight:1,padding:"0 4px"}}>›</span>
            </div>
          </div>
          {histEntries.length===0
            ?<div style={{textAlign:"center",padding:"18px 0",color:t.textMuted,fontSize:13}}>Aucun biberon ce jour</div>
            :histEntries.map(b=>(
              <div key={b.id} style={{display:"flex",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${t.cardBorder}`,fontSize:13}}>
                <span style={{flex:1,fontWeight:700}}>{b.amount} ml</span>
                <span style={{color:t.textMuted,marginRight:8}}>{fmtTime(b.time)}{b.note?` · ${b.note}`:""}</span>
                <IconBtn onClick={()=>openEdit(b)} style={{padding:4}}>✏️</IconBtn>
                <IconBtn onClick={()=>remove(b.id)}>🗑</IconBtn>
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

      <Modal open={modal} onClose={()=>{setModal(false);setEditId(null);}} title={editId?"Modifier le biberon":"Ajouter un biberon"}>
        <Input label="Quantité (ml)" type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="120"/>
        {isToday
          ? <Input label="Heure" type="time" value={time.slice(11,16)} onChange={e=>setTime(todayStr()+"T"+e.target.value)}/>
          : <Input label="Heure" type="datetime-local" value={time} onChange={e=>setTime(e.target.value)}/>
        }
        <Input label="Note" value={note} onChange={e=>setNote(e.target.value)} placeholder="Refusé après 60ml..."/>
        <Btn onClick={save} full style={{marginTop:4}}>{editId?"Mettre à jour":"Enregistrer"}</Btn>
      </Modal>
    </div>
  );
};

export default BottlesSection;
