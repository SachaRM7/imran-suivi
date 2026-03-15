import React, { useState } from "react";
import { useTheme } from "../../theme/Theme";
import { Btn, Input, Modal, Chip, Card, IconBtn } from "../ui";
import { uid, todayStr, fmt } from "../../utils/helpers";
import { PRESET_RECIPES } from "../../constants";

const REACTIONS = [
  { key:"aimé",    em:"❤️", label:"Adoré",   bg:"#FEF2F2", color:"#DC2626" },
  { key:"ok",      em:"👍", label:"Ok",       bg:"#F0F9FF", color:"#2563EB" },
  { key:"refusé",  em:"🚫", label:"Refusé",  bg:"#FEF3C7", color:"#D97706" },
];

const isCompatible = (recipe, foods) =>
  recipe.ingredients.length > 0 &&
  recipe.ingredients.every(i =>
    foods[i.name] &&
    foods[i.name].reaction !== "allergie" &&
    foods[i.name].reaction !== "refusé"
  );

const RecipesSection = ({data, update}) => {
  const t = useTheme();
  const [filter, setFilter] = useState("all");
  const [createModal, setCreateModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIngredients, setNewIngredients] = useState([{name:"",qty:""}]);

  const foods = data.foods || {};
  const reactions = data.recipeReactions || {};
  const customRecipes = data.recipes || [];

  const allRecipes = [
    ...PRESET_RECIPES.map(r => ({...r, isPreset:true})),
    ...customRecipes.map(r => ({...r, isPreset:false})),
  ];

  const getReaction = r => reactions[r.id]?.reaction;
  const getDate    = r => reactions[r.id]?.date;

  const filtered = allRecipes.filter(r => {
    if (filter === "preset")      return r.isPreset;
    if (filter === "custom")      return !r.isPreset;
    if (filter === "compatible")  return isCompatible(r, foods);
    if (filter === "loved")       return getReaction(r) === "aimé";
    if (filter === "untested")    return !getReaction(r);
    return true;
  });

  const setReactionFn = (id, reaction) => update(d => {
    if (!d.recipeReactions) d.recipeReactions = {};
    if (d.recipeReactions[id]?.reaction === reaction) delete d.recipeReactions[id];
    else d.recipeReactions[id] = { reaction, date: todayStr() };
  });

  const addIngredient = () => setNewIngredients(prev => [...prev, {name:"",qty:""}]);
  const removeIngredient = i => setNewIngredients(prev => prev.filter((_,idx) => idx !== i));
  const updateIngredient = (i, field, val) =>
    setNewIngredients(prev => prev.map((ing,idx) => idx === i ? {...ing, [field]:val} : ing));

  const createRecipe = () => {
    if (!newName.trim()) return;
    update(d => {
      if (!d.recipes) d.recipes = [];
      d.recipes.push({
        id: uid(),
        name: newName.trim(),
        ingredients: newIngredients.filter(i => i.name.trim()),
        date: todayStr(),
      });
    });
    setCreateModal(false);
    setNewName("");
    setNewIngredients([{name:"",qty:""}]);
  };

  const removeRecipe = id => update(d => { d.recipes = (d.recipes||[]).filter(r => r.id !== id); });

  return (
    <div>
      {/* 1. En-tête */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{fontSize:22,fontWeight:900}}>🍳 Recettes</div>
        <Btn small onClick={() => setCreateModal(true)}>+ Nouveau</Btn>
      </div>

      {/* 2. Filtres — ligne unique scrollable */}
      <div style={{
        display:"flex",gap:6,overflowX:"auto",paddingBottom:4,marginBottom:16,
        WebkitOverflowScrolling:"touch",scrollbarWidth:"none",
      }}>
        {[
          {key:"all",        label:"Toutes"},
          {key:"preset",     label:"Prédéfinies"},
          {key:"custom",     label:"Mes recettes"},
          {key:"compatible", label:"✅ Compatibles"},
          {key:"loved",      label:"❤️ Adorées"},
          {key:"untested",   label:"🆕 Pas testées"},
        ].map(f => (
          <Chip key={f.key} active={filter===f.key} onClick={() => setFilter(f.key)} color={t.accent}>
            {f.label}
          </Chip>
        ))}
      </div>

      {/* 4. Empty state */}
      {filtered.length === 0 && (
        <div style={{textAlign:"center",padding:"50px 20px",color:t.textMuted}}>
          <div style={{fontSize:64,marginBottom:12}}>🍳</div>
          <div style={{fontSize:16,fontWeight:700,color:t.textSoft,marginBottom:6}}>Aucune recette ici</div>
          <div style={{fontSize:13,fontWeight:500}}>Créez votre première recette ou changez de filtre</div>
        </div>
      )}

      {/* Cards */}
      {filtered.map(r => {
        const rxn = getReaction(r);
        const rxnDate = getDate(r);
        const compat = isCompatible(r, foods);
        const rxnInfo = REACTIONS.find(rx => rx.key === rxn);

        return (
          <Card key={r.id} style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
              <div style={{fontWeight:800,fontSize:15,flex:1,paddingRight:8}}>{r.name}</div>
              {!r.isPreset && (
                <IconBtn onClick={() => removeRecipe(r.id)} style={{padding:4,margin:-4}}>🗑</IconBtn>
              )}
            </div>

            {r.ingredients.length > 0 && (
              <div style={{fontSize:12,color:t.textMuted,marginBottom:8}}>
                {r.ingredients.map(i => `${i.name}${i.qty?` ${i.qty}`:""}`).join(" · ")}
              </div>
            )}

            {/* 3. Badges statut */}
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
              {compat && (
                <span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:6,background:"#ECFDF5",color:"#059669"}}>
                  ✅ Compatible
                </span>
              )}
              {rxnInfo && (
                <span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:6,background:rxnInfo.bg,color:rxnInfo.color}}>
                  {rxnInfo.em} {rxnDate ? fmt(rxnDate) : rxnInfo.label}
                </span>
              )}
              {r.isPreset && (
                <span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:6,background:t.chipBg,color:t.textSoft}}>
                  📚 Prédéfinie
                </span>
              )}
            </div>

            {/* Boutons de réaction */}
            <div style={{display:"flex",gap:6}}>
              {REACTIONS.map(rx => (
                <button key={rx.key} onClick={() => setReactionFn(r.id, rx.key)} style={{
                  flex:1,padding:"6px 4px",borderRadius:10,cursor:"pointer",
                  background:rxn===rx.key ? rx.bg : t.chipBg,
                  color:rxn===rx.key ? rx.color : t.textSoft,
                  fontWeight:700,fontSize:13,
                  opacity:rxn===rx.key ? 1 : 0.5,
                  filter:rxn===rx.key ? "none" : "grayscale(60%)",
                  transition:"all .2s",
                  border:`1.5px solid ${rxn===rx.key ? rx.color+"40" : t.cardBorder}`,
                }}>{rx.em} {rx.label}</button>
              ))}
            </div>
          </Card>
        );
      })}

      {/* 5. Modal Créer */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Nouvelle recette">
        <Input label="Nom de la recette" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ex: Purée brocoli fromage"/>
        <div style={{fontSize:12,fontWeight:800,color:t.textSoft,textTransform:"uppercase",letterSpacing:.6,margin:"14px 0 8px"}}>Ingrédients</div>
        {newIngredients.map((ing,i) => (
          <div key={i} style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}>
            <div style={{flex:2}}>
              <Input placeholder="Aliment" value={ing.name} onChange={e => updateIngredient(i,"name",e.target.value)}/>
            </div>
            <div style={{flex:1}}>
              <Input placeholder="Qté" value={ing.qty} onChange={e => updateIngredient(i,"qty",e.target.value)}/>
            </div>
            {newIngredients.length > 1 && (
              <IconBtn onClick={() => removeIngredient(i)} style={{padding:6,flexShrink:0}}>✕</IconBtn>
            )}
          </div>
        ))}
        <Btn variant="secondary" small full onClick={addIngredient} style={{marginTop:10}}>
          + Ajouter un ingrédient
        </Btn>
        <Btn onClick={createRecipe} full style={{marginTop:12}}>Enregistrer</Btn>
      </Modal>
    </div>
  );
};

export default RecipesSection;
