import React, { useState } from "react";
import { useTheme } from "../../theme/Theme";
import { Card, Btn, Input, Modal, IconBtn } from "../ui";
import { uid } from "../../utils/helpers";

const DEFAULT_ROUTINES = [
  { id:"rt1", name:"Réveil",  emoji:"🌅", items:[{id:"i1",label:"Biberon / Tétée"},{id:"i2",label:"Change couche"},{id:"i3",label:"Habillage"},{id:"i4",label:"Éveil / Jeux"}],  checked:{} },
  { id:"rt2", name:"Bain",    emoji:"🛁", items:[{id:"i5",label:"Bain"},{id:"i6",label:"Soin corps"},{id:"i7",label:"Pyjama"},{id:"i8",label:"Biberon / Tétée"}], checked:{} },
  { id:"rt3", name:"Coucher", emoji:"🌙", items:[{id:"i9",label:"Bain"},{id:"i10",label:"Biberon / Tétée"},{id:"i11",label:"Lecture"},{id:"i12",label:"Lumières tamisées"},{id:"i13",label:"Dodo"}], checked:{} },
];

const RoutinesSection = ({data, update}) => {
  const t = useTheme();
  const [activeRoutineId, setActiveRoutine] = useState(null);
  const [editModal, setEditModal] = useState(false);
  const [createModal, setCreateModal] = useState(false);

  // Edit modal state
  const [editName, setEditName] = useState("");
  const [editEmoji, setEditEmoji] = useState("📋");
  const [editItems, setEditItems] = useState([]);
  const [editId, setEditId] = useState(null);

  const routines = data.routines?.length ? data.routines : DEFAULT_ROUTINES;

  const routine = routines.find(r => r.id === activeRoutineId) || null;
  const checkedCount = routine ? Object.values(routine.checked || {}).filter(Boolean).length : 0;

  // ─── Mutations ───
  const ensureRoutines = (d) => {
    if (!d.routines?.length) d.routines = DEFAULT_ROUTINES.map(r => ({...r, checked:{}}));
  };

  const toggleItem = (routineId, itemId) => update(d => {
    ensureRoutines(d);
    const r = d.routines.find(r => r.id === routineId);
    if (!r) return;
    if (!r.checked) r.checked = {};
    r.checked[itemId] = !r.checked[itemId];
  });

  const resetRoutine = () => update(d => {
    ensureRoutines(d);
    const r = d.routines.find(r => r.id === activeRoutineId);
    if (r) r.checked = {};
  });

  const deleteRoutine = id => {
    update(d => {
      ensureRoutines(d);
      d.routines = d.routines.filter(r => r.id !== id);
    });
    if (activeRoutineId === id) setActiveRoutine(null);
  };

  // ─── Edit modal helpers ───
  const openEditModal = (r) => {
    setEditId(r.id);
    setEditName(r.name);
    setEditEmoji(r.emoji);
    setEditItems(r.items.map(i => ({...i})));
    setEditModal(true);
  };

  const addItem = () => setEditItems(prev => [...prev, {id: uid(), label:""}]);
  const removeItem = i => setEditItems(prev => prev.filter((_,idx) => idx !== i));
  const updateItem = (i, val) => setEditItems(prev => prev.map((it,idx) => idx === i ? {...it, label:val} : it));
  const moveItem = (i, dir) => setEditItems(prev => {
    const arr = [...prev];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return arr;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    return arr;
  });

  const saveEdit = () => {
    if (!editName.trim()) return;
    update(d => {
      if (!d.routines?.length) d.routines = DEFAULT_ROUTINES.map(r => ({...r, checked:{}}));
      const idx = d.routines.findIndex(r => r.id === editId);
      if (idx !== -1) {
        d.routines[idx].name  = editName.trim();
        d.routines[idx].emoji = editEmoji;
        d.routines[idx].items = editItems.filter(i => i.label.trim());
      }
    });
    setEditModal(false);
  };

  // ─── Create modal ───
  const openCreateModal = () => {
    setEditId(uid());
    setEditName("");
    setEditEmoji("📋");
    setEditItems([{id:uid(),label:""}]);
    setCreateModal(true);
  };

  const saveCreate = () => {
    if (!editName.trim()) return;
    update(d => {
      if (!d.routines?.length) d.routines = DEFAULT_ROUTINES.map(r => ({...r, checked:{}}));
      d.routines.push({
        id: editId,
        name: editName.trim(),
        emoji: editEmoji,
        items: editItems.filter(i => i.label.trim()),
        checked: {},
      });
    });
    setCreateModal(false);
  };

  // ─── Shared modal body (edit & create) ───
  const ModalBody = ({onSave}) => (
    <>
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        <div style={{width:60}}>
          <Input label="Emoji" value={editEmoji} onChange={e=>setEditEmoji(e.target.value)} placeholder="🌙"/>
        </div>
        <div style={{flex:1}}>
          <Input label="Nom" value={editName} onChange={e=>setEditName(e.target.value)} placeholder="Ex : Coucher"/>
        </div>
      </div>
      <div style={{fontSize:12,fontWeight:800,color:t.textSoft,textTransform:"uppercase",letterSpacing:.6,marginBottom:8}}>
        Actions
      </div>
      {editItems.map((it,i) => (
        <div key={it.id} style={{display:"flex",alignItems:"center",gap:4,marginBottom:6}}>
          <div style={{flex:1}}>
            <Input placeholder={`Action ${i+1}`} value={it.label} onChange={e=>updateItem(i,e.target.value)}/>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
            <span onClick={() => moveItem(i,-1)} style={{
              cursor:"pointer",padding:"6px 8px",borderRadius:8,
              color:t.textMuted,fontSize:14,fontWeight:700,
              display:i===0?"none":"inline-flex",
            }}>↑</span>
            <span onClick={() => moveItem(i,1)} style={{
              cursor:"pointer",padding:"6px 8px",borderRadius:8,
              color:t.textMuted,fontSize:14,fontWeight:700,
              display:i===editItems.length-1?"none":"inline-flex",
            }}>↓</span>
            <IconBtn onClick={() => removeItem(i)}>✕</IconBtn>
          </div>
        </div>
      ))}
      <Btn variant="secondary" small full onClick={addItem} style={{marginTop:10}}>
        + Ajouter une action
      </Btn>
      <Btn onClick={onSave} full style={{marginTop:12}}>Enregistrer</Btn>
    </>
  );

  // ─── Vue détail ───
  if (routine) {
    const progress = routine.items.length ? (checkedCount / routine.items.length) * 100 : 0;
    return (
      <div>
        {/* 1. En-tête vue détail */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <span onClick={() => setActiveRoutine(null)} style={{
            cursor:"pointer",color:t.accent,fontSize:14,fontWeight:700,
            display:"flex",alignItems:"center",gap:4,
          }}>‹ Retour</span>
          <Btn variant="secondary" small onClick={resetRoutine}>↺ Réinitialiser</Btn>
        </div>

        <div style={{marginBottom:12}}>
          <div style={{fontSize:20,fontWeight:900}}>{routine.emoji} {routine.name}</div>
          <div style={{fontSize:13,fontWeight:700,color:t.textSoft,marginTop:4}}>
            {checkedCount}/{routine.items.length} complété
          </div>
        </div>

        {/* 2. Barre de progression avec fond */}
        <div style={{background:t.cardBorder,borderRadius:10,height:8,marginBottom:18,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${progress}%`,background:t.accentGrad,borderRadius:10,transition:"width .4s"}}/>
        </div>

        {/* 3. Empty state ou liste */}
        {routine.items.length === 0 ? (
          <div style={{textAlign:"center",padding:"40px 20px"}}>
            <div style={{fontSize:48,marginBottom:12}}>📋</div>
            <div style={{fontSize:14,fontWeight:700,color:t.textSoft,marginBottom:16}}>
              Aucune action dans cette routine
            </div>
            <Btn variant="secondary" onClick={() => openEditModal(routine)}>
              + Ajouter des actions
            </Btn>
          </div>
        ) : (
          routine.items.map(item => {
            const checked = !!(routine.checked?.[item.id]);
            return (
              <div key={item.id} onClick={() => toggleItem(routine.id, item.id)} style={{
                display:"flex",alignItems:"center",gap:14,
                padding:"14px 16px",marginBottom:8,borderRadius:14,cursor:"pointer",
                background:checked?t.accentLight:t.card,
                border:`1.5px solid ${checked?t.accent:t.cardBorder}`,
                transition:"all .2s",
              }}>
                <div style={{
                  width:22,height:22,borderRadius:7,flexShrink:0,
                  background:checked?t.accent:t.chipBg,
                  border:`2px solid ${checked?t.accent:t.inputBorder}`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  transition:"all .2s",
                }}>
                  {checked&&<span style={{color:"#fff",fontSize:13,fontWeight:900}}>✓</span>}
                </div>
                <span style={{
                  flex:1,fontSize:14,fontWeight:700,
                  color:checked?t.accent:t.text,
                  textDecoration:checked?"line-through":"none",
                  opacity:checked?.7:1,
                  transition:"all .2s",
                }}>{item.label}</span>
              </div>
            );
          })
        )}

        <Btn variant="ghost" small onClick={() => openEditModal(routine)} style={{marginTop:8}}>
          ✏️ Modifier la routine
        </Btn>

        <Modal open={editModal} onClose={() => setEditModal(false)} title="Modifier la routine">
          <ModalBody onSave={saveEdit}/>
        </Modal>
      </div>
    );
  }

  // ─── Vue liste ───
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div style={{fontSize:22,fontWeight:900}}>📋 Routines</div>
        <Btn small onClick={openCreateModal}>+ Nouveau</Btn>
      </div>

      {routines.map(r => {
        const done = Object.values(r.checked||{}).filter(Boolean).length;
        const total = r.items.length;
        const pct = total ? (done/total)*100 : 0;
        return (
          <Card key={r.id} style={{marginBottom:10,cursor:"pointer"}} onClick={() => setActiveRoutine(r.id)}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:total?10:0}}>
              <span style={{fontSize:28}}>{r.emoji}</span>
              <div style={{flex:1}}>
                <div style={{fontWeight:800,fontSize:15}}>{r.name}</div>
                <div style={{fontSize:12,color:t.textMuted,marginTop:2}}>{total} action{total!==1?"s":""}</div>
              </div>
              <div style={{display:"flex",gap:4,alignItems:"center"}} onClick={e=>e.stopPropagation()}>
                <Btn variant="secondary" small onClick={() => openEditModal(r)}>✏️</Btn>
                <Btn variant="danger" small onClick={() => deleteRoutine(r.id)}>🗑</Btn>
              </div>
            </div>
            {total>0&&(
              <>
                <div style={{background:t.cardBorder,borderRadius:10,height:6,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${pct}%`,background:t.accentGrad,borderRadius:10,transition:"width .4s"}}/>
                </div>
                <div style={{fontSize:11,color:t.textMuted,marginTop:5,textAlign:"right"}}>{done}/{total}</div>
              </>
            )}
          </Card>
        );
      })}

      <Modal open={editModal} onClose={() => setEditModal(false)} title="Modifier la routine">
        <ModalBody onSave={saveEdit}/>
      </Modal>
      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Nouvelle routine">
        <ModalBody onSave={saveCreate}/>
      </Modal>
    </div>
  );
};

export default RoutinesSection;
