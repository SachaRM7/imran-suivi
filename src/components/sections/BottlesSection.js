import React, { useState } from "react";
import { useTheme } from "../../theme/Theme";
import { Card, Btn, Input, Modal, Chip, IconBtn, Empty } from "../ui";
import { uid, nowStr, todayStr, fmtTime, fmt } from "../../utils/helpers";

const TYPES = ["Lait", "Eau", "Céréales", "Autre"];
const TYPE_EMOJI = { "Lait":"🍼", "Eau":"💧", "Céréales":"🌾", "Autre":"🫙" };

const BottlesSection = ({data, update}) => {
  const t = useTheme();
  const [modal, setModal]     = useState(false);
  const [editId, setEditId]   = useState(null);
  const [amount, setAmount]   = useState("");
  const [time, setTime]       = useState(nowStr());
  const [note, setNote]       = useState("");
  const [type, setType]       = useState("Lait");
  const [selDate, setSelDate] = useState(todayStr());

  const isToday      = selDate === todayStr();
  const isModalToday = time.startsWith(todayStr());

  const quickAdd = ml => update(d => {
    d.bottles.push({id:uid(), amount:ml, time:nowStr(), note:"", type:"Lait"});
  });

  const openAdd = () => {
    setEditId(null); setAmount(""); setTime(nowStr()); setNote(""); setType("Lait"); setModal(true);
  };
  const openEdit = b => {
    setEditId(b.id); setAmount(String(b.amount)); setTime(b.time);
    setNote(b.note||""); setType(b.type||"Lait"); setModal(true);
  };

  const save = () => {
    if (!(Number(amount) > 0)) return;
    if (editId) {
      update(d => {
        const b = d.bottles.find(x => x.id === editId);
        if (b) { b.amount = Number(amount); b.time = time; b.note = note; b.type = type; }
      });
    } else {
      update(d => { d.bottles.push({id:uid(), amount:Number(amount), time, note, type}); });
    }
    setModal(false); setNote(""); setEditId(null);
  };

  const remove = id => update(d => { d.bottles = d.bottles.filter(b => b.id !== id); });

  const allBottles = data.bottles || [];
  const dayEntries = allBottles.filter(b => b.time?.startsWith(selDate)).sort((a,b) => b.time.localeCompare(a.time));
  const totalMl    = dayEntries.reduce((s,b) => s + (b.amount||0), 0);
  const allDates   = [...new Set(allBottles.map(b => b.time?.slice(0,10)).filter(Boolean))].sort().reverse();

  const prevDay = () => setSelDate(d => {
    const dt = new Date(d); dt.setDate(dt.getDate()-1); return dt.toISOString().slice(0,10);
  });
  const nextDay = () => setSelDate(d => {
    const dt = new Date(d); dt.setDate(dt.getDate()+1);
    const n = dt.toISOString().slice(0,10);
    return n <= todayStr() ? n : d;
  });

  return (
    <div>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div>
          <div style={{fontSize:22,fontWeight:900}}>🍼 Biberons</div>
          <div style={{fontSize:13,color:t.textMuted,fontWeight:600}}>
            {dayEntries.length} biberon{dayEntries.length!==1?"s":""} — {totalMl} ml
          </div>
        </div>
        <Btn onClick={openAdd} small>+ Détail</Btn>
      </div>

      {/* Navigation par jour */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:t.chipBg,borderRadius:14,padding:"8px 14px",marginBottom:14,border:`1.5px solid ${t.chipBorder}`}}>
        <span onClick={prevDay} style={{cursor:"pointer",color:t.accent,fontSize:22,lineHeight:1,padding:"0 6px",fontWeight:900,userSelect:"none"}}>‹</span>
        <span style={{fontWeight:800,fontSize:14,color:t.text}}>
          {isToday ? "Aujourd'hui" : fmt(selDate+"T12:00:00")}
        </span>
        <span onClick={nextDay} style={{cursor:"pointer",fontSize:22,lineHeight:1,padding:"0 6px",fontWeight:900,userSelect:"none",color:selDate<todayStr()?t.accent:t.textMuted}}>›</span>
      </div>

      {/* Quick add — chips quantité */}
      <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:18}}>
        {[60,90,120,150,180,210,240,270].map(ml=>(
          <button key={ml} onClick={()=>quickAdd(ml)} style={{
            background:t.accentLight, border:`1.5px solid ${t.chipBorder}`,
            borderRadius:20, padding:"8px 14px", fontSize:13, fontWeight:700,
            color:t.accent, cursor:"pointer",
          }}>{ml} ml</button>
        ))}
      </div>

      {/* Entrées du jour */}
      {dayEntries.length===0 && (
        <Empty emoji="🍼" text={isToday ? "Aucun biberon aujourd'hui" : "Aucun biberon ce jour"}/>
      )}
      {dayEntries.map(b=>(
        <Card key={b.id} style={{display:"flex",alignItems:"center",marginBottom:8}}>
          <span style={{fontSize:24,marginRight:14}}>{TYPE_EMOJI[b.type]||"🍼"}</span>
          <div style={{flex:1}}>
            <div style={{fontWeight:800,fontSize:15}}>
              {b.amount} ml
              {b.type&&b.type!=="Lait"&&(
                <span style={{fontSize:12,color:t.textSoft,fontWeight:600,marginLeft:6}}>· {b.type}</span>
              )}
            </div>
            <div style={{fontSize:12,color:t.textMuted}}>{fmtTime(b.time)}{b.note?` · ${b.note}`:""}</div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <IconBtn onClick={()=>openEdit(b)} style={{padding:6}}>✏️</IconBtn>
            <IconBtn onClick={()=>remove(b.id)} style={{padding:6}}>🗑</IconBtn>
          </div>
        </Card>
      ))}

      {/* Raccourcis jours */}
      {allDates.filter(d => d !== selDate).length > 0 && (
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:14}}>
          {allDates.slice(0,10).filter(d => d !== selDate).map(d=>(
            <span key={d} onClick={()=>setSelDate(d)} style={{
              fontSize:11, padding:"4px 10px", borderRadius:10, cursor:"pointer", fontWeight:700,
              background:t.chipBg, color:t.textSoft, border:`1px solid ${t.chipBorder}`,
            }}>{d===todayStr()?"Aujourd'hui":fmt(d+"T12:00:00")}</span>
          ))}
        </div>
      )}

      {/* Modal ajouter / modifier */}
      <Modal open={modal} onClose={()=>{setModal(false);setEditId(null);}} title={editId?"Modifier le biberon":"Ajouter un biberon"}>
        <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
          {TYPES.map(tp=>(
            <Chip key={tp} active={type===tp} onClick={()=>setType(tp)} color={t.accent}>
              {TYPE_EMOJI[tp]} {tp}
            </Chip>
          ))}
        </div>
        <Input label="Quantité (ml)" type="number" inputMode="decimal" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="120"/>
        {isModalToday
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
