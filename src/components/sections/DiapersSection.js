import React, { useState } from "react";
import { Card, Btn, Input, Modal, Chip, IconBtn, Empty } from "../ui";
import { uid, nowStr, todayStr, fmtTime } from "../../utils/helpers";

const DiapersSection = ({ data, update }) => {
  const [modal, setModal] = useState(false);
  const [type, setType] = useState("pipi");
  const [time, setTime] = useState(nowStr());
  const [note, setNote] = useState("");
  const emojis = { pipi: "💧", caca: "💩", mixte: "💧💩" };

  const quickAdd = (tp) => update(d => {
    d.diapers.push({ id: uid(), type: tp, time: nowStr(), note: "" });
  });

  const add = () => {
    update(d => { d.diapers.push({ id: uid(), type, time, note }); });
    setModal(false); setNote("");
  };

  const remove = (id) => update(d => {
    d.diapers = d.diapers.filter(x => x.id !== id);
  });

  const todayD = (data.diapers||[]).filter(d => d.time?.startsWith(todayStr())).sort((a, b) => b.time.localeCompare(a.time));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900 }}>🧷 Couches</div>
          <div style={{ fontSize: 13, color: "#9CA3AF", fontWeight: 600 }}>Aujourd'hui : {todayD.length}</div>
        </div>
        <Btn onClick={() => { setTime(nowStr()); setModal(true); }} small>+ Détail</Btn>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        {["pipi", "caca", "mixte"].map(tp => (
          <Btn key={tp} variant="secondary" onClick={() => quickAdd(tp)} style={{ flex: 1, fontSize: 13 }}>
            {emojis[tp]} {tp}
          </Btn>
        ))}
      </div>

      {todayD.length === 0 && <Empty emoji="🧷" text="Aucune couche aujourd'hui" />}

      {todayD.map(d => (
        <Card key={d.id} style={{ display: "flex", alignItems: "center", marginBottom: 8, padding: "10px 14px" }}>
          <span style={{ fontSize: 22, marginRight: 14 }}>{emojis[d.type]}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, textTransform: "capitalize" }}>{d.type}</div>
            <div style={{ fontSize: 12, color: "#9CA3AF" }}>{fmtTime(d.time)}{d.note ? ` · ${d.note}` : ""}</div>
            {!d.note && <div style={{ fontSize: 12, color: "#9CA3AF", opacity: 0.3 }}>Ajouter une note...</div>}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
             <IconBtn onClick={() => { setType(d.type); setTime(d.time); setNote(d.note || ""); setModal(true); }}>✏️</IconBtn>
             <IconBtn onClick={() => remove(d.id)}>🗑️</IconBtn>
          </div>
        </Card>
      ))}

      <Modal open={modal} onClose={() => setModal(false)} title="Couche">
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {["pipi", "caca", "mixte"].map(tp => (
            <Chip key={tp} active={type === tp} onClick={() => setType(tp)} color="#F59E0B">
              {emojis[tp]} {tp}
            </Chip>
          ))}
        </div>
        <Input label="Heure" type="datetime-local" value={time} onChange={e => setTime(e.target.value)} />
        <Input label="Note" value={note} onChange={e => setNote(e.target.value)} placeholder="Couleur, consistance..." />
        <Btn onClick={add} full>Enregistrer</Btn>
      </Modal>
    </div>
  );
};

export default DiapersSection;
