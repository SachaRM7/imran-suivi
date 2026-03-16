import React, { useState } from "react";
import { useTheme } from "../../theme/Theme";
import { Card, Btn, Input, Modal, Chip, IconBtn, Empty } from "../ui";
import { uid, nowStr, todayStr, fmtTime, fmt } from "../../utils/helpers";

const TYPE_CFG = {
  pipi:  { main:"#3B82F6", light:"#EFF6FF", border:"#93C5FD", emoji:"💦", label:"Pipi" },
  caca:  { main:"#D97706", light:"#FEF3C7", border:"#FCD34D", emoji:"💩", label:"Caca" },
  mixte: { main:"#8B5CF6", light:"#F5F3FF", border:"#C4B5FD", emoji:"💩💦", label:"Mixte" },
};

const DiapersSection = ({data, update}) => {
  const t = useTheme();
  const [selDate, setSelDate]   = useState(todayStr());
  const [modal, setModal]       = useState(false);
  const [editId, setEditId]     = useState(null);
  const [modalType, setModalType]   = useState("pipi");
  const [modalTime, setModalTime]   = useState(nowStr());
  const [modalNote, setModalNote]   = useState("");
  const [modalQty, setModalQty]     = useState("");
  const [modalCons, setModalCons]   = useState("");
  const [modalColor, setModalColor] = useState("");

  // Quick Entry funnel state
  const [selType, setSelType]       = useState(null);
  const [quantity, setQuantity]     = useState(null);
  const [consistency, setConsistency] = useState(null);
  const [color, setColor]           = useState(null);

  const isToday      = selDate === todayStr();
  const isModalToday = modalTime.startsWith(todayStr());

  const resetFunnel = () => { setSelType(null); setQuantity(null); setConsistency(null); setColor(null); };

  const quickAdd = (tp, qty, cons, col) => {
    const entry = { id: uid(), type: tp, time: nowStr(), note: "" };
    if (qty)  entry.quantity    = qty;
    if (cons) entry.consistency = cons;
    if (col)  entry.color       = col;
    update(d => { d.diapers.push(entry); });
    resetFunnel();
  };

  const handleTypeClick = (tp) => {
    if (selType === tp) { resetFunnel(); return; }
    setSelType(tp); setQuantity(null); setConsistency(null); setColor(null);
  };

  const handleQuantity = (qty) => {
    setQuantity(qty);
    if (selType === "pipi") { quickAdd("pipi", qty, null, null); }
    else if (selType === "mixte" && consistency && color) { quickAdd("mixte", qty, consistency, color); }
  };

  const handleConsistency = (cons) => {
    setConsistency(cons);
    if (selType === "caca" && color) { quickAdd("caca", null, cons, color); }
    else if (selType === "mixte" && quantity && color) { quickAdd("mixte", quantity, cons, color); }
  };

  const handleColor = (col) => {
    setColor(col);
    if (selType === "caca" && consistency) { quickAdd("caca", null, consistency, col); }
    else if (selType === "mixte" && quantity && consistency) { quickAdd("mixte", quantity, consistency, col); }
  };

  const openAdd = () => {
    setEditId(null); setModalType("pipi"); setModalTime(nowStr());
    setModalNote(""); setModalQty(""); setModalCons(""); setModalColor(""); setModal(true);
  };
  const openEdit = (d) => {
    setEditId(d.id); setModalType(d.type || "pipi"); setModalTime(d.time);
    setModalNote(d.note || ""); setModalQty(d.quantity || ""); setModalCons(d.consistency || ""); setModalColor(d.color || "");
    setModal(true);
  };

  const save = () => {
    if (editId) {
      update(d => {
        const x = d.diapers.find(i => i.id === editId);
        if (x) {
          x.type = modalType; x.time = modalTime; x.note = modalNote;
          if (modalQty)   x.quantity    = modalQty;    else delete x.quantity;
          if (modalCons)  x.consistency = modalCons;   else delete x.consistency;
          if (modalColor) x.color       = modalColor;  else delete x.color;
        }
      });
    } else {
      const entry = { id: uid(), type: modalType, time: modalTime, note: modalNote };
      if (modalQty)   entry.quantity    = modalQty;
      if (modalCons)  entry.consistency = modalCons;
      if (modalColor) entry.color       = modalColor;
      update(d => { d.diapers.push(entry); });
    }
    setModal(false); setEditId(null);
  };

  const remove = id => update(d => { d.diapers = d.diapers.filter(x => x.id !== id); });

  const allDiapers = data.diapers || [];
  const dayEntries = allDiapers.filter(d => d.time?.startsWith(selDate)).sort((a, b) => b.time.localeCompare(a.time));
  const allDates   = [...new Set(allDiapers.map(d => d.time?.slice(0,10)).filter(Boolean))].sort().reverse();

  const prevDay = () => setSelDate(d => {
    const dt = new Date(d); dt.setDate(dt.getDate()-1); return dt.toISOString().slice(0,10);
  });
  const nextDay = () => setSelDate(d => {
    const dt = new Date(d); dt.setDate(dt.getDate()+1);
    const n = dt.toISOString().slice(0,10);
    return n <= todayStr() ? n : d;
  });

  const diaperDetail = (d) => {
    const parts = [];
    if (d.quantity)    parts.push({"+":"peu","++":"normal","+++":"beaucoup"}[d.quantity] || d.quantity);
    if (d.consistency) parts.push(d.consistency);
    if (d.color)       parts.push(d.color);
    return parts.join(" · ");
  };

  const tc = selType ? TYPE_CFG[selType] : null;

  return (
    <div>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div>
          <div style={{fontSize:22,fontWeight:900}}>🧷 Couches</div>
          <div style={{fontSize:13,color:t.textMuted,fontWeight:600}}>
            {dayEntries.length} couche{dayEntries.length!==1?"s":""} ce jour
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

      {/* Quick Entry — étape 1 : type */}
      <div style={{display:"flex",gap:10,marginBottom:selType?0:18}}>
        {["pipi","caca","mixte"].map(tp => {
          const cfg = TYPE_CFG[tp];
          const active = selType === tp;
          return (
            <button key={tp} onClick={() => handleTypeClick(tp)} style={{
              flex:1, padding:"14px 8px",
              borderRadius: active ? "18px 18px 0 0" : 18,
              border: `2px solid ${active ? cfg.main : t.cardBorder}`,
              borderBottom: active ? "none" : undefined,
              background: active ? cfg.light : t.card,
              cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:6,
              transition:"all .2s", transform: active ? "scale(1.02)" : "scale(1)",
            }}>
              <span style={{fontSize:26}}>{cfg.emoji}</span>
              <span style={{fontSize:12,fontWeight:800,color:active?cfg.main:t.text}}>{cfg.label}</span>
            </button>
          );
        })}
      </div>

      {/* Quick Entry — étape 2 : sous-options */}
      {selType && tc && (
        <div style={{
          animation:"slideDown .25s ease",
          background:tc.light, borderRadius:18, borderTopLeftRadius:0,
          padding:"14px 14px 16px", marginBottom:18,
          border:`2px solid ${tc.main}`, borderTop:"none",
        }}>
          {(selType === "pipi" || selType === "mixte") && (
            <div style={{marginBottom:selType==="mixte"?16:0}}>
              <div style={{fontSize:11,fontWeight:800,color:t.textSoft,textTransform:"uppercase",letterSpacing:.6,marginBottom:8}}>Quantité 💦</div>
              <div style={{display:"flex",gap:8}}>
                {["+","++","+++"].map(q => (
                  <button key={q} onClick={() => handleQuantity(q)} style={{
                    flex:1, padding:"11px 4px", borderRadius:14,
                    border:`2px solid ${quantity===q?tc.main:t.inputBorder}`,
                    background:quantity===q?tc.main:t.card,
                    color:quantity===q?"#fff":t.text,
                    fontWeight:900, fontSize:15, cursor:"pointer", transition:"all .15s",
                  }}>{q}</button>
                ))}
              </div>
            </div>
          )}
          {(selType === "caca" || selType === "mixte") && (
            <>
              <div style={{marginBottom:12}}>
                <div style={{fontSize:11,fontWeight:800,color:t.textSoft,textTransform:"uppercase",letterSpacing:.6,marginBottom:8}}>Consistance 💩</div>
                <div style={{display:"flex",gap:8}}>
                  {["Liquide","Mou","Dur"].map(c => (
                    <button key={c} onClick={() => handleConsistency(c)} style={{
                      flex:1, padding:"11px 4px", borderRadius:14,
                      border:`2px solid ${consistency===c?tc.main:t.inputBorder}`,
                      background:consistency===c?tc.main:t.card,
                      color:consistency===c?"#fff":t.text,
                      fontWeight:700, fontSize:13, cursor:"pointer", transition:"all .15s",
                    }}>{c}</button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{fontSize:11,fontWeight:800,color:t.textSoft,textTransform:"uppercase",letterSpacing:.6,marginBottom:8}}>Couleur</div>
                <div style={{display:"flex",gap:8}}>
                  {[["Jaune","#EAB308"],["Vert","#22C55E"],["Marron","#D97706"],["Noir","#374151"]].map(([c,col]) => (
                    <button key={c} onClick={() => handleColor(c)} style={{
                      flex:1, padding:"11px 4px", borderRadius:14,
                      border:`2px solid ${color===c?col:t.inputBorder}`,
                      background:color===c?col:t.card,
                      color:color===c?"#fff":t.text,
                      fontWeight:700, fontSize:12, cursor:"pointer", transition:"all .15s",
                    }}>{c}</button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Entrées du jour */}
      {dayEntries.length === 0 && (
        <Empty emoji="🧷" text={isToday ? "Aucune couche aujourd'hui" : "Aucune couche ce jour"}/>
      )}
      {dayEntries.map(d => {
        const cfg = TYPE_CFG[d.type] || TYPE_CFG.mixte;
        const detail = diaperDetail(d);
        return (
          <Card key={d.id} style={{display:"flex",alignItems:"center",marginBottom:8}}>
            <div style={{
              width:38, height:38, borderRadius:12, flexShrink:0, marginRight:12,
              background:cfg.light, border:`2px solid ${cfg.border}`,
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:20,
            }}>{cfg.emoji}</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:800,fontSize:14,color:t.text}}>
                {cfg.label}
                {detail && <span style={{fontSize:12,color:t.textSoft,fontWeight:600,marginLeft:6}}>· {detail}</span>}
              </div>
              <div style={{fontSize:12,color:t.textMuted}}>
                {fmtTime(d.time)}{d.note && <em style={{marginLeft:4}}>· {d.note}</em>}
              </div>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <IconBtn onClick={() => openEdit(d)} style={{padding:6}}>✏️</IconBtn>
              <IconBtn onClick={() => remove(d.id)} style={{padding:6}}>🗑</IconBtn>
            </div>
          </Card>
        );
      })}

      {/* Raccourcis jours */}
      {allDates.filter(d => d !== selDate).length > 0 && (
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:14}}>
          {allDates.slice(0,10).filter(d => d !== selDate).map(d => (
            <span key={d} onClick={() => setSelDate(d)} style={{
              fontSize:11, padding:"4px 10px", borderRadius:10, cursor:"pointer", fontWeight:700,
              background:t.chipBg, color:t.textSoft, border:`1px solid ${t.chipBorder}`,
            }}>{d===todayStr()?"Aujourd'hui":fmt(d+"T12:00:00")}</span>
          ))}
        </div>
      )}

      {/* Modal ajouter / modifier */}
      <Modal open={modal} onClose={() => { setModal(false); setEditId(null); }} title={editId?"Modifier la couche":"Ajouter une couche"}>
        <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
          {["pipi","caca","mixte"].map(tp => (
            <Chip key={tp} active={modalType===tp} onClick={() => setModalType(tp)} color={TYPE_CFG[tp].main}>
              {TYPE_CFG[tp].emoji} {TYPE_CFG[tp].label}
            </Chip>
          ))}
        </div>
        {isModalToday
          ? <Input label="Heure" type="time" value={modalTime.slice(11,16)} onChange={e => setModalTime(todayStr()+"T"+e.target.value)}/>
          : <Input label="Heure" type="datetime-local" value={modalTime} onChange={e => setModalTime(e.target.value)}/>
        }
        {(modalType === "pipi" || modalType === "mixte") && (
          <div style={{marginBottom:12}}>
            <div style={{fontSize:11,fontWeight:800,color:t.textSoft,textTransform:"uppercase",letterSpacing:.6,marginBottom:8}}>Quantité</div>
            <div style={{display:"flex",gap:8}}>
              {["+","++","+++"].map(q => (
                <button key={q} onClick={() => setModalQty(modalQty===q?"":q)} style={{
                  flex:1, padding:"10px 4px", borderRadius:14,
                  border:`2px solid ${modalQty===q?TYPE_CFG[modalType].main:t.inputBorder}`,
                  background:modalQty===q?TYPE_CFG[modalType].main:t.card,
                  color:modalQty===q?"#fff":t.text,
                  fontWeight:900, fontSize:15, cursor:"pointer",
                }}>{q}</button>
              ))}
            </div>
          </div>
        )}
        {(modalType === "caca" || modalType === "mixte") && (
          <>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:11,fontWeight:800,color:t.textSoft,textTransform:"uppercase",letterSpacing:.6,marginBottom:8}}>Consistance</div>
              <div style={{display:"flex",gap:8}}>
                {["Liquide","Mou","Dur"].map(c => (
                  <button key={c} onClick={() => setModalCons(modalCons===c?"":c)} style={{
                    flex:1, padding:"10px 4px", borderRadius:14,
                    border:`2px solid ${modalCons===c?TYPE_CFG[modalType].main:t.inputBorder}`,
                    background:modalCons===c?TYPE_CFG[modalType].main:t.card,
                    color:modalCons===c?"#fff":t.text,
                    fontWeight:700, fontSize:13, cursor:"pointer",
                  }}>{c}</button>
                ))}
              </div>
            </div>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:11,fontWeight:800,color:t.textSoft,textTransform:"uppercase",letterSpacing:.6,marginBottom:8}}>Couleur</div>
              <div style={{display:"flex",gap:8}}>
                {[["Jaune","#EAB308"],["Vert","#22C55E"],["Marron","#D97706"],["Noir","#374151"]].map(([c,col]) => (
                  <button key={c} onClick={() => setModalColor(modalColor===c?"":c)} style={{
                    flex:1, padding:"10px 4px", borderRadius:14,
                    border:`2px solid ${modalColor===c?col:t.inputBorder}`,
                    background:modalColor===c?col:t.card,
                    color:modalColor===c?"#fff":t.text,
                    fontWeight:700, fontSize:12, cursor:"pointer",
                  }}>{c}</button>
                ))}
              </div>
            </div>
          </>
        )}
        <Input label="Note" value={modalNote} onChange={e => setModalNote(e.target.value)} placeholder="Observations..."/>
        <Btn onClick={save} full style={{marginTop:4}}>{editId?"Mettre à jour":"Enregistrer"}</Btn>
      </Modal>
    </div>
  );
};

export default DiapersSection;
