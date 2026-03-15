import React, { useState } from "react";
import { useTheme } from "../../theme/Theme";
import { Card, Btn, Input, Modal, Chip, IconBtn, Empty } from "../ui";
import { uid, nowStr, todayStr, fmt, fmtTime } from "../../utils/helpers";

const isNightTime = () => { const h = new Date().getHours(); return h >= 20 || h < 7; };

const SleepSection = ({data,update}) => {
  const t=useTheme();
  const [modal,setModal]=useState(false);
  const [start,setStart]=useState(nowStr());
  const [end,setEnd]=useState("");
  const [type,setType]=useState("sieste");

  const ongoing=(data.sleep||[]).find(s=>!s.end);

  const startSleep=()=>{
    const night=isNightTime();
    update(d=>{d.sleep.push({id:uid(),start:nowStr(),end:null,type:night?"nuit":"sieste"})});
  };
  const stopSleep=()=>update(d=>{const s=d.sleep.find(x=>x.id===ongoing.id);if(s)s.end=nowStr()});

  const add=()=>{
    update(d=>{d.sleep.push({id:uid(),start,end:end||null,type})});
    setModal(false);
  };

  const remove=id=>update(d=>{d.sleep=d.sleep.filter(x=>x.id!==id)});
  const sorted=[...(data.sleep||[])].sort((a,b)=>b.start.localeCompare(a.start));

  const dur=s=>{
    if(!s.end)return"En cours 💤";
    const m=Math.round((new Date(s.end)-new Date(s.start))/6e4);
    return m>=60?`${Math.floor(m/60)}h${String(m%60).padStart(2,"0")}`:`${m} min`;
  };

  const isCrossDay=s=>s.end&&s.start.slice(0,10)!==s.end.slice(0,10);

  const isStartToday = start.startsWith(todayStr());
  const isEndToday = end.startsWith(todayStr());

  const night=isNightTime();

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          <div style={{fontSize:22,fontWeight:900}}>😴 Sommeil</div>
          <div style={{fontSize:13,color:t.textMuted,fontWeight:600}}>
            {sorted.filter(s=>s.start.startsWith(todayStr())).length} entrée(s) aujourd'hui
          </div>
        </div>
        <Btn onClick={()=>{setStart(nowStr());setEnd("");setModal(true)}} small>+ Manuel</Btn>
      </div>

      {/* Bouton principal */}
      {!ongoing ? (
        <button onClick={startSleep} style={{
          width:"100%",padding:"18px 0",borderRadius:20,border:"none",cursor:"pointer",
          background:night
            ?"linear-gradient(135deg,#1E1B4B 0%,#312E81 50%,#4338CA 100%)"
            :"linear-gradient(135deg,#A78BFA 0%,#818CF8 50%,#6366F1 100%)",
          color:"#fff",fontSize:17,fontWeight:900,
          boxShadow:night?"0 4px 20px rgba(99,102,241,.45)":"0 4px 20px rgba(167,139,250,.45)",
          marginBottom:18,letterSpacing:.3,transition:"transform .15s, box-shadow .15s",
        }}>
          {night?"🌙 Début nuit":"💤 Début sieste"}
        </button>
      ) : (
        <button onClick={stopSleep} style={{
          width:"100%",padding:"18px 0",borderRadius:20,border:"none",cursor:"pointer",
          background:"linear-gradient(135deg,#10B981 0%,#059669 100%)",
          color:"#fff",fontSize:17,fontWeight:900,
          boxShadow:"0 4px 20px rgba(16,185,129,.45)",
          marginBottom:18,letterSpacing:.3,
        }}>
          ⏰ Fin — {dur(ongoing)}
        </button>
      )}

      {sorted.length===0&&<Empty emoji="😴" text="Aucun sommeil enregistré"/>}
      {sorted.slice(0,30).map(s=>{
        const crossDay=isCrossDay(s);
        return (
          <Card key={s.id} highlighted={!s.end} style={{display:"flex",alignItems:"center",marginBottom:8}}>
            <span style={{fontSize:22,marginRight:16}}>{!s.end?"💤":s.type==="nuit"?"🌙":"😴"}</span>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontWeight:800,fontSize:14}}>{dur(s)}</span>
                {crossDay&&(
                  <span style={{fontSize:10,fontWeight:800,padding:"1px 6px",borderRadius:6,background:t.accentLight,color:t.accent}}>
                    ↩ nuit
                  </span>
                )}
              </div>
              <div style={{fontSize:12,color:t.textMuted,marginTop:1}}>
                {fmt(s.start)} {fmtTime(s.start)}{s.end?` → ${crossDay?fmt(s.end)+" ":""}${fmtTime(s.end)}`:"" }
              </div>
            </div>
            <IconBtn onClick={()=>remove(s.id)} style={{padding:8,margin:-8}}>🗑</IconBtn>
          </Card>
        );
      })}

      <Modal open={modal} onClose={()=>setModal(false)} title="Sommeil">
        <div style={{display:"flex",gap:8,marginBottom:14}}>
          {["sieste","nuit"].map(tp=>(
            <Chip key={tp} active={type===tp} onClick={()=>setType(tp)} color="#6366F1">
              {tp==="nuit"?"🌙":"💤"} {tp}
            </Chip>
          ))}
        </div>
        {isStartToday
          ? <Input label="Début" type="time" value={start.slice(11,16)} onChange={e=>setStart(todayStr()+"T"+e.target.value)}/>
          : <Input label="Début" type="datetime-local" value={start} onChange={e=>setStart(e.target.value)}/>
        }
        {(end===("")||isEndToday)
          ? <Input label="Fin (vide = en cours)" type="time" value={end.slice(11,16)} onChange={e=>setEnd(e.target.value?todayStr()+"T"+e.target.value:"")}/>
          : <Input label="Fin (vide = en cours)" type="datetime-local" value={end} onChange={e=>setEnd(e.target.value)}/>
        }
        <Btn onClick={add} full>Enregistrer</Btn>
      </Modal>
    </div>
  );
};

export default SleepSection;
