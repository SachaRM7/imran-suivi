import React, { useState } from "react";
import { useTheme } from "../../theme/Theme";
import { Chip, Btn, Input, Modal } from "../ui";
import { todayStr } from "../../utils/helpers";
import { FOOD_CATEGORIES, CAT_COLORS } from "../../constants";

const placeholders = {
  "Légumes":   "Ex: Butternut",
  "Fruits":    "Ex: Litchi",
  "Féculents": "Ex: Patate douce",
  "Protéines": "Ex: Dinde",
  "Laitiers":  "Ex: Petit suisse",
};

const FoodSection = ({data,update}) => {
  const t=useTheme();
  const [cat,setCat]=useState("Légumes");
  const [modal,setModal]=useState(false);
  const [customName,setCustomName]=useState("");

  const toggle=name=>update(d=>{d.foods[name]?delete d.foods[name]:d.foods[name]={date:todayStr(),reaction:"ok"}});
  const setR=(name,r)=>update(d=>{if(d.foods[name])d.foods[name].reaction=r});

  const addCustom=()=>{
    if(!customName.trim())return;
    update(d=>{d.foods[customName.trim()]={date:todayStr(),reaction:"ok"}});
    setModal(false);setCustomName("");
  };

  const tried=Object.keys(data.foods||{}).filter(k=>data.foods[k]).length;
  const total=Object.values(FOOD_CATEGORIES).flat().length;

  return (
    <div>
      <div style={{fontSize:22,fontWeight:900,marginBottom:4}}>🥕 Diversification</div>
      <div style={{fontSize:13,color:t.textMuted,fontWeight:600,marginBottom:14}}>{tried}/{total} aliments goûtés</div>
      <div style={{background:t.cardBorder,borderRadius:10,height:8,marginBottom:18,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${(tried/total)*100}%`,background:"linear-gradient(90deg,#22C55E,#10B981)",borderRadius:10,transition:"width .4s"}}/>
      </div>
      <div style={{display:"flex",gap:6,overflowX:"auto",marginBottom:14,paddingBottom:2}}>
        {Object.keys(FOOD_CATEGORIES).map(c=><Chip key={c} active={cat===c} onClick={()=>setCat(c)} color={CAT_COLORS[c]}>{c}</Chip>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {FOOD_CATEGORIES[cat].map(food=>{
          const done=!!data.foods?.[food]; const r=data.foods?.[food]?.reaction;
          const bg=done?(r==="allergie"?t.dangerBg:r==="refusé"?t.warnBg:t.successBg):t.card;
          const bd=done?(r==="allergie"?t.danger:r==="refusé"?t.warn:t.success):t.cardBorder;
          return (
            <div key={food} onClick={()=>toggle(food)} style={{padding:"11px 13px",borderRadius:14,cursor:"pointer",background:bg,border:`2px solid ${bd}`,transition:"all .2s"}}>
              <div style={{fontWeight:700,fontSize:13,color:t.text}}>{done?"✓ ":""}{food}</div>
              {done&&(
                <div style={{display:"flex",gap:8,marginTop:6}} onClick={e=>e.stopPropagation()}>
                  {[["ok","👍"],["refusé","🚫"],["allergie","⚠️"]].map(([rv,em])=>(
                    <span key={rv} onClick={()=>setR(food,rv)} style={{
                      fontSize:12,padding:"4px 10px",borderRadius:8,fontWeight:700,cursor:"pointer",
                      background:r===rv?(rv==="allergie"?t.danger:rv==="refusé"?t.warn:t.success):t.chipBg,
                      color:r===rv?"#fff":t.textSoft,
                      opacity:r===rv?1:0.35,
                      filter:r===rv?"none":"grayscale(80%)",
                      transition:"all .2s",
                    }}>{em}</span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {/* Bouton + Ajouter */}
        <div onClick={()=>setModal(true)} style={{
          padding:"11px 13px",borderRadius:14,cursor:"pointer",
          background:`${CAT_COLORS[cat]}10`,
          border:`2px dashed ${CAT_COLORS[cat]}40`,
          display:"flex",alignItems:"center",justifyContent:"center",gap:6,
          transition:"all .2s",
        }}>
          <span style={{color:CAT_COLORS[cat],fontWeight:700,fontSize:13}}>+ Ajouter</span>
        </div>
      </div>

      <Modal open={modal} onClose={()=>setModal(false)} title={`Ajouter — ${cat}`}>
        <Input
          label="Aliment"
          value={customName}
          onChange={e=>setCustomName(e.target.value)}
          placeholder={placeholders[cat]||"Nom de l'aliment"}
        />
        <Btn onClick={addCustom} full>Enregistrer</Btn>
      </Modal>
    </div>
  );
};

export default FoodSection;
