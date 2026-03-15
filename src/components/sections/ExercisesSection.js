import React, { useState } from "react";
import { useTheme } from "../../theme/Theme";
import { Card, Btn, Input, Modal, IconBtn } from "../ui";
import { uid, todayStr, babyAgeMonths } from "../../utils/helpers";
import { EXERCISES_BY_MONTH } from "../../constants";

const ExercisesSection = ({data, update, profile}) => {
  const t = useTheme();
  const ageM = babyAgeMonths(profile?.birthDate);
  const [selectedMonth, setSelectedMonth] = useState(ageM);
  const [expandedTip, setExpandedTip] = useState(null);
  const [addModal, setAddModal] = useState(false);
  const [newLabel, setNewLabel]   = useState("");
  const [customDesc, setCustomDesc] = useState("");

  const toggleTip = label => setExpandedTip(prev => prev === label ? null : label);

  // Preset + custom pour un mois donné
  const getExercises = m => {
    const preset  = (EXERCISES_BY_MONTH[m] || []).map((e,i) => ({...e, id:`p-${m}-${i}`, isPreset:true}));
    const custom  = (data.customExercises?.[m] || []).map(e => ({...e, isPreset:false}));
    return [...preset, ...custom];
  };

  const isCheckedToday = id => data.exercisesChecked?.[id] === todayStr();

  const toggleExercise = id => update(d => {
    if (!d.exercisesChecked) d.exercisesChecked = {};
    if (d.exercisesChecked[id] === todayStr()) delete d.exercisesChecked[id];
    else d.exercisesChecked[id] = todayStr();
  });

  const addCustom = () => {
    if (!newLabel.trim()) return;
    update(d => {
      if (!d.customExercises) d.customExercises = {};
      if (!d.customExercises[selectedMonth]) d.customExercises[selectedMonth] = [];
      d.customExercises[selectedMonth].push({id: uid(), label: newLabel.trim(), tip: customDesc.trim() || null});
    });
    setAddModal(false); setNewLabel(""); setCustomDesc("");
  };

  const removeCustom = (m, id) => update(d => {
    if (!d.customExercises?.[m]) return;
    d.customExercises[m] = d.customExercises[m].filter(e => e.id !== id);
  });

  const exercises = getExercises(selectedMonth);
  const doneCount = exercises.filter(e => isCheckedToday(e.id)).length;

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          <div style={{fontSize:22,fontWeight:900}}>🧩 Éveil & Exercices</div>
          <div style={{fontSize:13,color:t.textMuted,fontWeight:600,marginTop:2}}>
            Mois {selectedMonth} — {doneCount}/{exercises.length} aujourd'hui
          </div>
        </div>
        <Btn small onClick={() => setAddModal(true)}>+ Perso</Btn>
      </div>

      {/* 1. Timeline des mois */}
      <div style={{display:"flex",gap:5,overflowX:"auto",marginBottom:14,paddingBottom:4}}>
        {Array.from({length:25},(_,m)=>m).map(m => {
          const exs   = getExercises(m);
          const total = exs.length;
          const done  = exs.filter(e => isCheckedToday(e.id)).length;
          const isCurrent = selectedMonth === m;
          const isAge     = m === ageM && !isCurrent;
          return (
            <span key={m} onClick={() => setSelectedMonth(m)} style={{
              flex:"0 0 auto",minWidth:38,height:38,borderRadius:12,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontWeight:800,fontSize:13,cursor:"pointer",
              background: isCurrent ? t.accent : (total>0&&done===total) ? t.successBg : t.chipBg,
              color: isCurrent ? "#fff" : (total>0&&done===total) ? "#059669" : t.textSoft,
              border: isAge ? `2px solid ${t.accent}` : "1.5px solid transparent",
              transition:"all .2s",
            }}>{m}</span>
          );
        })}
      </div>

      {/* Barre de progression */}
      <div style={{background:t.cardBorder,borderRadius:10,height:8,marginBottom:18,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${exercises.length?(doneCount/exercises.length)*100:0}%`,background:t.accentGrad,borderRadius:10,transition:"width .4s"}}/>
      </div>

      {exercises.length === 0 && (
        <div style={{textAlign:"center",padding:"40px 20px"}}>
          <div style={{fontSize:48,marginBottom:12}}>🧩</div>
          <div style={{fontSize:14,fontWeight:700,color:t.textSoft,marginBottom:16}}>
            Aucun exercice pour le mois {selectedMonth}
          </div>
          <Btn variant="secondary" onClick={() => setAddModal(true)}>+ Ajouter un exercice</Btn>
        </div>
      )}

      {exercises.map(ex => {
        const checked = isCheckedToday(ex.id);
        const tipOpen = expandedTip === ex.label;
        return (
          <Card key={ex.id} style={{
            marginBottom:8,
            background: checked ? t.accentLight : t.card,
            border: `1.5px solid ${checked ? t.accent : t.cardBorder}`,
          }}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              {/* Coche */}
              <div onClick={() => toggleExercise(ex.id)} style={{
                width:26,height:26,borderRadius:8,flexShrink:0,cursor:"pointer",
                background: checked ? t.accent : t.chipBg,
                border: `2px solid ${checked ? t.accent : t.inputBorder}`,
                display:"flex",alignItems:"center",justifyContent:"center",
                transition:"all .2s",
              }}>
                {checked && <span style={{color:"#fff",fontSize:12,fontWeight:900}}>✓</span>}
              </div>

              {/* Label */}
              <div onClick={() => toggleExercise(ex.id)} style={{
                flex:1,fontWeight:checked?800:600,fontSize:14,
                color:checked?t.accent:t.text,cursor:"pointer",
              }}>{ex.label}</div>

              {/* Chevron tip — 2. accordéon */}
              {ex.tip && (
                <span onClick={e => {e.stopPropagation();toggleTip(ex.label);}} style={{
                  cursor:"pointer",padding:"6px 8px",borderRadius:8,
                  color:t.textSoft,fontSize:12,fontWeight:700,
                  display:"inline-flex",
                  transform: tipOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition:"transform .2s",
                }}>▾</span>
              )}

              {/* Supprimer si custom */}
              {!ex.isPreset && (
                <IconBtn onClick={() => removeCustom(selectedMonth, ex.id)} style={{padding:4}}>✕</IconBtn>
              )}
            </div>

            {/* Description dépliée */}
            {tipOpen && ex.tip && (
              <div style={{
                fontSize:12,lineHeight:1.6,color:t.textSoft,
                padding:"8px 10px",background:t.chipBg,
                borderRadius:10,marginTop:8,
              }}>
                {ex.tip}
              </div>
            )}
          </Card>
        );
      })}

      {/* Modal ajout exercice perso */}
      {/* 3. Reset à la fermeture */}
      <Modal open={addModal} onClose={() => { setAddModal(false); setNewLabel(""); setCustomDesc(""); }} title={`Exercice perso — mois ${selectedMonth}`}>
        <Input label="Exercice" value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="Ex: Massage des jambes"/>
        {/* 1. Nouveau champ description */}
        <div style={{marginBottom:14}}>
          <label style={{display:"block",fontSize:12,fontWeight:700,color:t.textSoft,marginBottom:5,textTransform:"uppercase",letterSpacing:.5}}>
            Instructions (optionnel)
          </label>
          <textarea
            value={customDesc}
            onChange={e => setCustomDesc(e.target.value)}
            placeholder="Ex: Placer bébé sur le ventre et stimuler avec un jouet coloré..."
            style={{width:"100%",minHeight:80,padding:"12px 14px",borderRadius:14,border:`2px solid ${t.inputBorder}`,fontSize:14,lineHeight:1.5,outline:"none",resize:"vertical",boxSizing:"border-box",background:t.card,color:t.text,fontFamily:"'Nunito',sans-serif"}}
            onFocus={e => e.target.style.borderColor = t.accent}
            onBlur={e  => e.target.style.borderColor = t.inputBorder}
          />
        </div>
        <Btn onClick={addCustom} full>Ajouter</Btn>
      </Modal>
    </div>
  );
};

export default ExercisesSection;
