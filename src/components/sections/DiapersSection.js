import React, { useState } from "react";
import { useTheme } from "../../theme/Theme";
import { Card, Btn, Input, Modal, Chip, IconBtn, Empty } from "../ui";
import { uid, nowStr, todayStr, fmtTime, fmt } from "../../utils/helpers";

const typeColors = {
  pipi:  { main: "#3B82F6", light: "#EFF6FF", border: "#93C5FD" },
  caca:  { main: "#D97706", light: "#FEF3C7", border: "#FCD34D" },
  selles:{ main: "#D97706", light: "#FEF3C7", border: "#FCD34D" },
  mixte: { main: "#8B5CF6", light: "#F5F3FF", border: "#C4B5FD" },
};
const getTypeColor = (tp) => typeColors[tp] || typeColors.mixte;

const DiapersSection = ({data,update}) => {
  const t=useTheme();
  const [modal,setModal]=useState(false);
  const [modalType,setModalType]=useState("pipi");
  const [modalTime,setModalTime]=useState(nowStr());
  const [modalNote,setModalNote]=useState("");
  const [selectedType,setSelectedType]=useState(null);
  const [quantity,setQuantity]=useState(null);
  const [consistency,setConsistency]=useState(null);
  const [color,setColor]=useState(null);

  const emojis={pipi:"💦",caca:"💩",mixte:"🧷"};
  const typeLabels={pipi:"Pipi",caca:"Caca",mixte:"Mixte"};

  const isModalToday = modalTime.startsWith(todayStr());

  const resetFunnel=()=>{setSelectedType(null);setQuantity(null);setConsistency(null);setColor(null);};

  const quickAdd=(tp,qty,cons,col)=>{
    const entry={id:uid(),type:tp,time:new Date().toISOString(),note:""};
    if(qty)entry.quantity=qty;
    if(cons)entry.consistency=cons;
    if(col)entry.color=col;
    update(d=>{d.diapers.push(entry)});
    resetFunnel();
  };

  const handleTypeClick=(tp)=>{
    if(selectedType===tp){resetFunnel();return;}
    setSelectedType(tp);setQuantity(null);setConsistency(null);setColor(null);
  };

  const handleQuantity=(qty)=>{
    setQuantity(qty);
    if(selectedType==="pipi"){quickAdd("pipi",qty,null,null);}
    else if(selectedType==="mixte"&&consistency&&color){quickAdd("mixte",qty,consistency,color);}
  };

  const handleConsistency=(cons)=>{
    setConsistency(cons);
    if(selectedType==="caca"&&color){quickAdd("caca",null,cons,color);}
    else if(selectedType==="mixte"&&quantity&&color){quickAdd("mixte",quantity,cons,color);}
  };

  const handleColor=(col)=>{
    setColor(col);
    if(selectedType==="caca"&&consistency){quickAdd("caca",null,consistency,col);}
    else if(selectedType==="mixte"&&quantity&&consistency){quickAdd("mixte",quantity,consistency,col);}
  };

  const addModal=()=>{
    update(d=>{d.diapers.push({id:uid(),type:modalType,time:modalTime,note:modalNote})});
    setModal(false);setModalNote("");
  };
  const remove=id=>update(d=>{d.diapers=d.diapers.filter(x=>x.id!==id)});
  const todayD=(data.diapers||[]).filter(d=>d.time?.startsWith(todayStr())).sort((a,b)=>b.time.localeCompare(a.time));
  const olderD=(data.diapers||[]).filter(d=>!d.time?.startsWith(todayStr())).sort((a,b)=>b.time.localeCompare(a.time));

  const diaperDetail=(d)=>{
    const parts=[];
    if(d.quantity)parts.push({"+":"peu","++":"normal","+++":"beaucoup"}[d.quantity]||d.quantity);
    if(d.consistency)parts.push(d.consistency);
    if(d.color)parts.push(d.color);
    return parts.join(" · ");
  };

  const tc = selectedType ? getTypeColor(selectedType) : null;

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div><div style={{fontSize:22,fontWeight:900}}>🧷 Couches</div><div style={{fontSize:13,color:t.textMuted,fontWeight:600}}>Aujourd'hui : {todayD.length}</div></div>
        <Btn onClick={()=>{setModalTime(nowStr());setModal(true)}} small>+ Détail</Btn>
      </div>

      {/* Étape 1 — boutons type */}
      <div style={{display:"flex",gap:10,marginBottom:selectedType?0:18}}>
        {["pipi","caca","mixte"].map(tp=>{
          const active=selectedType===tp;
          const c=getTypeColor(tp);
          return (
            <button key={tp} onClick={()=>handleTypeClick(tp)} style={{
              flex:1,padding:"14px 8px",
              borderRadius:active?"18px 18px 0 0":18,
              border:`2px solid ${active?c.main:t.cardBorder}`,
              borderBottom:active?"none":"",
              background:active?c.light:t.card,
              cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:6,
              transition:"all .2s",transform:active?"scale(1.02)":"scale(1)"
            }}>
              <span style={{fontSize:26}}>{emojis[tp]}</span>
              <span style={{fontSize:12,fontWeight:800,color:active?c.main:t.text}}>{typeLabels[tp]}</span>
            </button>
          );
        })}
      </div>

      {/* Étape 2 — champs conditionnels */}
      {selectedType&&tc&&(
        <div style={{
          animation:"slideDown .25s ease",
          background:tc.light,borderRadius:18,borderTopLeftRadius:0,
          padding:"14px 14px 16px",marginBottom:18,
          border:`2px solid ${tc.main}`,borderTop:"none"
        }}>
          {/* Quantité pipi (pipi + mixte) */}
          {(selectedType==="pipi"||selectedType==="mixte")&&(
            <div style={{marginBottom:selectedType==="mixte"?16:0}}>
              <div style={{fontSize:11,fontWeight:800,color:t.textSoft,textTransform:"uppercase",letterSpacing:.6,marginBottom:8}}>Quantité 💦</div>
              <div style={{display:"flex",gap:8}}>
                {["+","++","+++"].map(q=>(
                  <button key={q} onClick={()=>handleQuantity(q)} style={{
                    flex:1,padding:"11px 4px",borderRadius:14,
                    border:`2px solid ${quantity===q?tc.main:t.inputBorder}`,
                    background:quantity===q?tc.main:t.card,
                    color:quantity===q?"#fff":t.text,
                    fontWeight:900,fontSize:15,cursor:"pointer",transition:"all .15s"
                  }}>{q}</button>
                ))}
              </div>
            </div>
          )}

          {/* Consistance + couleur (caca + mixte) */}
          {(selectedType==="caca"||selectedType==="mixte")&&(
            <>
              <div style={{marginBottom:12}}>
                <div style={{fontSize:11,fontWeight:800,color:t.textSoft,textTransform:"uppercase",letterSpacing:.6,marginBottom:8}}>Consistance 💩</div>
                <div style={{display:"flex",gap:8}}>
                  {["Dur","Normal","Liquide"].map(c=>(
                    <button key={c} onClick={()=>handleConsistency(c)} style={{
                      flex:1,padding:"11px 4px",borderRadius:14,
                      border:`2px solid ${consistency===c?tc.main:t.inputBorder}`,
                      background:consistency===c?tc.main:t.card,
                      color:consistency===c?"#fff":t.text,
                      fontWeight:700,fontSize:13,cursor:"pointer",transition:"all .15s"
                    }}>{c}</button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{fontSize:11,fontWeight:800,color:t.textSoft,textTransform:"uppercase",letterSpacing:.6,marginBottom:8}}>Couleur</div>
                <div style={{display:"flex",gap:8}}>
                  {[["Normal","#D4A574"],["Vert","#22C55E"],["Jaune","#EAB308"],["Noir","#374151"]].map(([c,col])=>(
                    <button key={c} onClick={()=>handleColor(c)} style={{
                      flex:1,padding:"11px 4px",borderRadius:14,
                      border:`2px solid ${color===c?col:t.inputBorder}`,
                      background:color===c?col:t.card,
                      color:color===c?"#fff":t.text,
                      fontWeight:700,fontSize:12,cursor:"pointer",transition:"all .15s"
                    }}>{c}</button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {todayD.length===0&&<Empty emoji="🧷" text="Aucune couche aujourd'hui"/>}
      {todayD.map(d=>{
        const detail=diaperDetail(d);
        return (
          <Card key={d.id} style={{display:"flex",alignItems:"center",marginBottom:8}}>
            <span style={{fontSize:22,marginRight:14}}>{emojis[d.type]||"🧷"}</span>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:14}}>{emojis[d.type]||"🧷"} {typeLabels[d.type]||d.type}{detail?` · ${detail}`:""} · {fmtTime(d.time)}</div>
              {d.note&&<div style={{fontSize:12,color:t.textMuted}}>{d.note}</div>}
            </div>
            <div style={{display:"flex",gap:12,alignItems:"center"}}>
              <IconBtn onClick={()=>remove(d.id)} style={{padding:6}}>🗑</IconBtn>
            </div>
          </Card>
        );
      })}

      {olderD.length>0&&(
        <div style={{marginTop:18}}>
          <div style={{fontSize:12,fontWeight:800,color:t.textSoft,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>
            Historique ({olderD.length})
          </div>
          {olderD.slice(0,80).map(d=>{
            const detail=diaperDetail(d);
            return (
              <div key={d.id} style={{display:"flex",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${t.cardBorder}`,fontSize:13}}>
                <span style={{fontSize:16,marginRight:8}}>{emojis[d.type]||"🧷"}</span>
                <span style={{flex:1,fontWeight:700}}>{typeLabels[d.type]||d.type}{detail?` · ${detail}`:""}</span>
                <span style={{color:t.textMuted}}>{fmt(d.time)} {fmtTime(d.time)}</span>
                <IconBtn onClick={()=>remove(d.id)}>🗑</IconBtn>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={modal} onClose={()=>setModal(false)} title="Couche">
        <div style={{display:"flex",gap:8,marginBottom:14}}>
          {["pipi","caca","mixte"].map(tp=>(
            <Chip key={tp} active={modalType===tp} onClick={()=>setModalType(tp)} color={getTypeColor(tp).main}>
              {emojis[tp]} {typeLabels[tp]}
            </Chip>
          ))}
        </div>
        {isModalToday
          ? <Input label="Heure" type="time" value={modalTime.slice(11,16)} onChange={e=>setModalTime(todayStr()+"T"+e.target.value)}/>
          : <Input label="Heure" type="datetime-local" value={modalTime} onChange={e=>setModalTime(e.target.value)}/>
        }
        <Input label="Note" value={modalNote} onChange={e=>setModalNote(e.target.value)} placeholder="Couleur, consistance..."/>
        <Btn onClick={addModal} full>Enregistrer</Btn>
      </Modal>
    </div>
  );
};

export default DiapersSection;
