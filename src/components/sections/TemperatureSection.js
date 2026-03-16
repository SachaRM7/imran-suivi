import React, { useState } from "react";
import { useTheme } from "../../theme/Theme";
import { Card, Btn, Input, Modal, IconBtn } from "../ui";
import { uid, nowStr, todayStr, fmt, fmtTime } from "../../utils/helpers";

const yesterday = () => { const d = new Date(); d.setDate(d.getDate()-1); return d.toISOString().slice(0,10); };

const TemperatureSection = ({data,update}) => {
  const t=useTheme();
  const [modal,setModal]=useState(false);
  const [editId,setEditId]=useState(null);
  const [value,setValue]=useState("");
  const [time,setTime]=useState(nowStr());
  const [note,setNote]=useState("");
  const [histDate,setHistDate]=useState(yesterday);

  const openAdd=()=>{setEditId(null);setValue("");setTime(nowStr());setNote("");setModal(true);};
  const openEdit=(tp)=>{setEditId(tp.id);setValue(String(tp.value));setTime(tp.time);setNote(tp.note||"");setModal(true);};

  const save=()=>{
    const num=Number(value);
    if(!num||num<34||num>42) return;
    if(editId){
      update(d=>{const x=(d.temperature||[]).find(i=>i.id===editId);if(x){x.value=num;x.time=time;x.note=note;}});
    } else {
      update(d=>{if(!d.temperature)d.temperature=[];d.temperature.push({id:uid(),value:num,time,note})});
    }
    setModal(false);setValue("");setNote("");setEditId(null);
  };

  const remove=id=>update(d=>{d.temperature=(d.temperature||[]).filter(x=>x.id!==id)});
  const sorted=[...(data.temperature||[])].sort((a,b)=>b.time.localeCompare(a.time));
  const todayT=sorted.filter(tp=>tp.time?.startsWith(todayStr()));
  const olderT=sorted.filter(tp=>!tp.time?.startsWith(todayStr()));

  const gc=v=>v>=38.0?t.danger:v>=37.5?t.warn:v>=36.5?t.success:"#0EA5E9";
  const label=v=>v>=38.0?"🔴 Fièvre":v>=37.5?"🟡 À surveiller":v>=36.5?"🟢 Normal":"🔵 Hypothermie";

  const histEntries=olderT.filter(tp=>tp.time?.slice(0,10)===histDate).sort((a,b)=>b.time.localeCompare(a.time));
  const histDates=[...new Set(olderT.map(tp=>tp.time?.slice(0,10)).filter(Boolean))].sort().reverse();
  const yest=yesterday();
  const prevDay=()=>setHistDate(d=>{const dt=new Date(d);dt.setDate(dt.getDate()-1);return dt.toISOString().slice(0,10);});
  const nextDay=()=>setHistDate(d=>{const dt=new Date(d);dt.setDate(dt.getDate()+1);const n=dt.toISOString().slice(0,10);return n<=yest?n:d;});

  const isModalToday = time.startsWith(todayStr());

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{fontSize:22,fontWeight:900}}>🌡️ Température</div>
        <Btn onClick={openAdd} small>+ Mesure</Btn>
      </div>

      {sorted.length===0&&(
        <div style={{textAlign:"center",padding:"50px 20px"}}>
          <div style={{fontSize:60,marginBottom:12}}>🌡️</div>
          <div style={{fontSize:16,fontWeight:700,color:t.textSoft,marginBottom:6}}>Aucune température relevée</div>
          <div style={{fontSize:13,color:t.textMuted,marginBottom:20}}>Mesurez la température de votre enfant</div>
          <Btn onClick={openAdd}>+ Nouvelle mesure</Btn>
        </div>
      )}

      {todayT.map(tp=>(
        <Card key={tp.id} style={{display:"flex",alignItems:"center",marginBottom:8}}>
          <div style={{
            width:50,height:50,borderRadius:14,marginRight:14,flexShrink:0,
            background:`${gc(tp.value)}15`,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontWeight:900,fontSize:16,color:gc(tp.value),
          }}>{tp.value}°</div>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,fontSize:13}}>{label(tp.value)}</div>
            <div style={{fontSize:12,color:t.textMuted}}>{fmtTime(tp.time)}{tp.note?` · ${tp.note}`:""}</div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <IconBtn onClick={()=>openEdit(tp)}>✏️</IconBtn>
            <IconBtn onClick={()=>remove(tp.id)}>🗑</IconBtn>
          </div>
        </Card>
      ))}

      {olderT.length>0&&(
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
            ?<div style={{textAlign:"center",padding:"18px 0",color:t.textMuted,fontSize:13}}>Aucune mesure ce jour</div>
            :histEntries.map(tp=>(
              <div key={tp.id} style={{display:"flex",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${t.cardBorder}`,fontSize:13}}>
                <span style={{fontWeight:900,fontSize:15,color:gc(tp.value),marginRight:8,minWidth:44}}>{tp.value}°</span>
                <span style={{flex:1,color:t.textSoft}}>{label(tp.value)}</span>
                <span style={{color:t.textMuted,marginRight:8}}>{fmtTime(tp.time)}{tp.note?` · ${tp.note}`:""}</span>
                <IconBtn onClick={()=>openEdit(tp)} style={{padding:4}}>✏️</IconBtn>
                <IconBtn onClick={()=>remove(tp.id)}>🗑</IconBtn>
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

      <Modal open={modal} onClose={()=>{setModal(false);setEditId(null);}} title={editId?"Modifier la température":"Température"}>
        <Input
          label="Température (°C)" type="number"
          inputMode="decimal" pattern="[0-9]*" step=".1"
          value={value} onChange={e=>setValue(e.target.value)} placeholder="Ex: 37.5"
        />
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

export default TemperatureSection;
