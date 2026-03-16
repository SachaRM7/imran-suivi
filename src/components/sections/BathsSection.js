import React, { useState } from "react";
import { useTheme } from "../../theme/Theme";
import { Card, Btn, Input, Modal, IconBtn, Empty } from "../ui";
import { uid, nowStr, todayStr, fmt, fmtTime } from "../../utils/helpers";

const yesterday = () => { const d = new Date(); d.setDate(d.getDate()-1); return d.toISOString().slice(0,10); };

const BathsSection = ({data,update}) => {
  const t=useTheme();
  const [modal,setModal]=useState(false);
  const [editId,setEditId]=useState(null);
  const [time,setTime]=useState(nowStr());
  const [temp,setTemp]=useState("37");
  const [note,setNote]=useState("");
  const [histDate,setHistDate]=useState(yesterday);

  const openAdd=()=>{setEditId(null);setTime(nowStr());setTemp("37");setNote("");setModal(true);};
  const openEdit=(b)=>{setEditId(b.id);setTime(b.time);setTemp(String(b.temp||37));setNote(b.note||"");setModal(true);};

  const save=()=>{
    if(editId){
      update(d=>{const x=d.baths.find(i=>i.id===editId);if(x){x.time=time;x.temp=Number(temp);x.note=note;}});
    } else {
      update(d=>{d.baths.push({id:uid(),time,temp:Number(temp),note})});
    }
    setModal(false);setNote("");setEditId(null);
  };

  const remove=id=>update(d=>{d.baths=d.baths.filter(x=>x.id!==id)});
  const sorted=[...(data.baths||[])].sort((a,b)=>b.time.localeCompare(a.time));
  const todayB=sorted.filter(b=>b.time?.startsWith(todayStr()));
  const olderB=sorted.filter(b=>!b.time?.startsWith(todayStr()));

  const isModalToday = time.startsWith(todayStr());

  const histEntries=olderB.filter(b=>b.time?.slice(0,10)===histDate).sort((a,b)=>b.time.localeCompare(a.time));
  const histDates=[...new Set(olderB.map(b=>b.time?.slice(0,10)).filter(Boolean))].sort().reverse();
  const yest=yesterday();
  const prevDay=()=>setHistDate(d=>{const dt=new Date(d);dt.setDate(dt.getDate()-1);return dt.toISOString().slice(0,10);});
  const nextDay=()=>setHistDate(d=>{const dt=new Date(d);dt.setDate(dt.getDate()+1);const n=dt.toISOString().slice(0,10);return n<=yest?n:d;});

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{fontSize:22,fontWeight:900}}>🛁 Bains</div>
        <Btn onClick={openAdd} small>+ Ajouter</Btn>
      </div>

      <Btn variant="secondary" full onClick={()=>update(d=>{d.baths.push({id:uid(),time:nowStr(),temp:37,note:""})})}
        style={{marginBottom:16,background:t.accentLight,border:`1.5px solid ${t.chipBorder}`,color:t.accent,fontWeight:700}}>
        🛁 Bain maintenant (37°C)
      </Btn>

      {todayB.length===0&&olderB.length===0&&<Empty emoji="🛁" text="Aucun bain"/>}

      {todayB.map(b=>(
        <Card key={b.id} style={{display:"flex",alignItems:"center",marginBottom:8}}>
          <span style={{fontSize:22,marginRight:14}}>🛁</span>
          <div style={{flex:1}}>
            <div style={{fontWeight:800,fontSize:14}}>{b.temp}°C</div>
            <div style={{fontSize:12,color:t.textMuted}}>{fmtTime(b.time)}{b.note?` · ${b.note}`:""}</div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <IconBtn onClick={()=>openEdit(b)}>✏️</IconBtn>
            <IconBtn onClick={()=>remove(b.id)}>🗑</IconBtn>
          </div>
        </Card>
      ))}

      {olderB.length>0&&(
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
            ?<div style={{textAlign:"center",padding:"18px 0",color:t.textMuted,fontSize:13}}>Aucun bain ce jour</div>
            :histEntries.map(b=>(
              <div key={b.id} style={{display:"flex",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${t.cardBorder}`,fontSize:13}}>
                <span style={{fontSize:16,marginRight:8}}>🛁</span>
                <span style={{flex:1,fontWeight:700}}>{b.temp}°C</span>
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

      <Modal open={modal} onClose={()=>{setModal(false);setEditId(null);}} title={editId?"Modifier le bain":"Bain"}>
        {isModalToday
          ? <Input label="Heure" type="time" value={time.slice(11,16)} onChange={e=>setTime(todayStr()+"T"+e.target.value)}/>
          : <Input label="Heure" type="datetime-local" value={time} onChange={e=>setTime(e.target.value)}/>
        }
        <Input label="Temp eau (°C)" type="number" inputMode="decimal" pattern="[0-9]*" step=".5" value={temp} onChange={e=>setTemp(e.target.value)}/>
        <Input label="Note" value={note} onChange={e=>setNote(e.target.value)}/>
        <Btn onClick={save} full>{editId?"Mettre à jour":"Enregistrer"}</Btn>
      </Modal>
    </div>
  );
};

export default BathsSection;
