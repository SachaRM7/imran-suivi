import React, { useState } from "react";
import { useTheme } from "../../theme/Theme";
import { Card, Btn, Input, Modal, IconBtn, Empty } from "../ui";
import { uid, nowStr, todayStr, fmtTime } from "../../utils/helpers";

const DiapersSection = ({ data, update }) => {
  const t = useTheme();
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [type, setType] = useState("pipi");
  const [time, setTime] = useState(nowStr());
  const [note, setNote] = useState("");

  const emojis = { pipi: "💧", caca: "💩", mixte: "💧💩" };
  const typeColors = { pipi: "#3B82F6", caca: "#D97706", mixte: "#8B5CF6" };

  const todayD = (data.diapers || [])
    .filter(d => d.time?.startsWith(todayStr()))
    .sort((a, b) => b.time.localeCompare(a.time));

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditId(item.id);
      setType(item.type);
      setTime(item.time);
      setNote(item.note || "");
    } else {
      setEditId(null);
      setType("pipi");
      setTime(nowStr());
      setNote("");
    }
    setModal(true);
  };

  const save = () => {
    update(d => {
      if (editId) {
        const idx = d.diapers.findIndex(x => x.id === editId);
        if (idx !== -1) d.diapers[idx] = { ...d.diapers[idx], type, time, note };
      } else {
        d.diapers.push({ id: uid(), type, time, note });
      }
    });
    setModal(false);
  };

  const quickAdd = (tp) => update(d => {
    d.diapers.push({ id: uid(), type: tp, time: nowStr(), note: "" });
  });

  return (
    <div>
      {/* HEADER IDENTIQUE ANCIEN */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900 }}>🧷 Couches</div>
          <div style={{ fontSize: 13, color: t.textSoft, fontWeight: 600 }}>Aujourd'hui : {todayD.length}</div>
        </div>
        <Btn onClick={() => handleOpenModal()} small>+ Détail</Btn>
      </div>

      {/* QUICK ADD - LES GROS BOUTONS CHIPS */}
      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        {["pipi", "caca", "mixte"].map(tp => (
          <div 
            key={tp} 
            onClick={() => quickAdd(tp)}
            style={{ 
              flex: 1, padding: "12px 8px", borderRadius: 12, cursor: "pointer",
              textAlign: "center", background: t.accentLight, border: `1.5px solid ${t.chipBorder}`,
              transition: "transform 0.1s active"
            }}
          >
            <div style={{ fontSize: 20, marginBottom: 4 }}>{emojis[tp]}</div>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: typeColors[tp] }}>{tp}</div>
          </div>
        ))}
      </div>

      {todayD.length === 0 && <Empty emoji="🧷" text="Aucune couche aujourd'hui" />}
      
      {/* HISTORIQUE COMPACT + NOTES UX */}
      {todayD.map(d => (
        <Card key={d.id} style={{ marginBottom: 8, padding: "10px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ fontSize: 20, marginRight: 12 }}>{emojis[d.type]}</span>
              <div>
                <span style={{ fontWeight: 800, fontSize: 15, color: typeColors[d.type] }}>
                  {fmtTime(d.time)}
                </span>
                <span style={{ marginLeft: 8, fontSize: 14, fontWeight: 600, textTransform: "capitalize" }}>{d.type}</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <IconBtn onClick={() => handleOpenModal(d)}>✏️</IconBtn>
              <IconBtn onClick={() => update(dt => { dt.diapers = dt.diapers.filter(x => x.id !== d.id) })}>🗑️</IconBtn>
            </div>
          </div>
          
          {/* LIGNE DE NOTE / CTA FANTOME */}
          <div 
            onClick={() => handleOpenModal(d)}
            style={{ marginTop: 4, marginLeft: 32, cursor: "pointer" }}
          >
            {d.note ? (
              <div style={{ fontSize: 12, color: t.textSoft, fontStyle: "italic" }}>{d.note}</div>
            ) : (
              <div style={{ fontSize: 12, color: t.textSoft, opacity: 0.3 }}>Ajouter une note...</div>
            )}
          </div>
        </Card>
      ))}

      {/* MODALE AVEC VRAIS CHIPS COLORÉS */}
      <Modal open={modal} onClose={() => setModal(false)} title={editId ? "Modifier la couche" : "Nouvelle couche"}>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {["pipi", "caca", "mixte"].map(tp => (
            <div 
              key={tp}
              onClick={() => setType(tp)}
              style={{ 
                flex: 1, padding: "10px", borderRadius: 10, textAlign: "center", cursor: "pointer",
                background: type === tp ? typeColors[tp] : t.chipBg,
                color: type === tp ? "#fff" : t.textSoft,
                border: `1.2px solid ${type === tp ? typeColors[tp] : t.chipBorder}`,
                fontWeight: 700, fontSize: 13
              }}
            >
              {emojis[tp]} {tp}
            </div>
          ))}
        </div>
        <Input label="Heure" type="datetime-local" value={time} onChange={e => setTime(e.target.value)} />
        <Input label="Note" value={note} onChange={e => setNote(e.target.value)} placeholder="Couleur, consistance..." />
        <Btn onClick={save} full style={{ marginTop: 10 }}>Enregistrer</Btn>
      </Modal>
    </div>
  );
};

export default DiapersSection;