import React, { useState } from "react";
import { PROFILE_AVATARS, PROFILE_COLORS } from "../constants";
import { babyAgeText } from "../utils/helpers";

const ProfileSelector = ({profiles,onSelect,onAdd,onDelete}) => {
  const [adding,setAdding] = useState(false);
  const [name,setName] = useState("");
  const [bd,setBd] = useState("");
  const [gender,setGender] = useState("boy");
  const [avatar,setAvatar] = useState("👶🏻");
  const [color,setColor] = useState("#A78BFA");
  const [confirmDelete,setConfirmDelete] = useState(null);
  const profileList = Object.values(profiles);

  const handleAdd = async () => {
    if(!name||!bd) return;
    await onAdd({name,birthDate:bd,gender,avatar,color});
    setAdding(false); setName(""); setBd("");
  };

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#0F0F14 0%,#1A1A2E 100%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <h1 style={{color:"#fff",fontSize:28,fontWeight:900,marginBottom:8,fontFamily:"'Nunito',sans-serif"}}>Baby Tracker</h1>
      <p style={{color:"#9A9AB0",fontSize:15,marginBottom:40,fontWeight:600}}>Qui suivons-nous aujourd'hui ?</p>

      <div style={{display:"flex",flexWrap:"wrap",gap:24,justifyContent:"center",marginBottom:40,maxWidth:500}}>
        {profileList.map(p => (
          <div key={p.id} style={{display:"flex",flexDirection:"column",alignItems:"center",cursor:"pointer",transition:"transform .2s",position:"relative"}}
            onClick={() => onSelect(p.id)}
            onMouseEnter={e=>e.currentTarget.style.transform="scale(1.08)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
            <div style={{width:100,height:100,borderRadius:24,background:`linear-gradient(135deg, ${p.color||"#A78BFA"}, ${p.color||"#A78BFA"}88)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:44,boxShadow:`0 8px 30px ${p.color||"#A78BFA"}44`,marginBottom:10,border:"3px solid transparent",transition:"border .2s"}}>
              {p.avatar||"👶"}
            </div>
            <span style={{color:"#E5E5EC",fontWeight:700,fontSize:15}}>{p.name}</span>
            <span style={{color:"#6B6B80",fontSize:12,fontWeight:600}}>{babyAgeText(p.birthDate)}</span>
            {/* Delete button */}
            <span onClick={e=>{e.stopPropagation();setConfirmDelete(p.id);}} style={{position:"absolute",top:-6,right:-6,width:24,height:24,borderRadius:12,background:"#2A2A36",color:"#6B6B80",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,cursor:"pointer",border:"2px solid #0F0F14"}}>×</span>
          </div>
        ))}

        {/* Add new profile */}
        <div onClick={()=>setAdding(true)} style={{display:"flex",flexDirection:"column",alignItems:"center",cursor:"pointer",transition:"transform .2s"}}
          onMouseEnter={e=>e.currentTarget.style.transform="scale(1.08)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
          <div style={{width:100,height:100,borderRadius:24,background:"#1E1E28",border:"3px dashed #3A3A4A",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,color:"#6B6B80",marginBottom:10}}>+</div>
          <span style={{color:"#6B6B80",fontWeight:700,fontSize:14}}>Ajouter</span>
        </div>
      </div>

      {/* Add profile modal */}
      {adding && (
        <div style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(0,0,0,.7)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setAdding(false)}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#1A1A24",borderRadius:24,padding:28,width:"90%",maxWidth:400,boxShadow:"0 20px 60px rgba(0,0,0,.5)"}}>
            <h3 style={{color:"#fff",fontSize:20,fontWeight:800,marginBottom:20}}>Nouveau bébé 🍼</h3>
            <div style={{marginBottom:14}}>
              <label style={{display:"block",fontSize:12,fontWeight:700,color:"#9A9AB0",marginBottom:5,textTransform:"uppercase"}}>Prénom</label>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="Lucas" style={{width:"100%",padding:"11px 14px",borderRadius:14,border:"2px solid #2A2A36",background:"#0F0F14",color:"#fff",fontSize:15,outline:"none",boxSizing:"border-box"}}/>
            </div>
            <div style={{marginBottom:14}}>
              <label style={{display:"block",fontSize:12,fontWeight:700,color:"#9A9AB0",marginBottom:5,textTransform:"uppercase"}}>Date de naissance</label>
              <input type="date" value={bd} onChange={e=>setBd(e.target.value)} style={{width:"100%",padding:"11px 14px",borderRadius:14,border:"2px solid #2A2A36",background:"#0F0F14",color:"#fff",fontSize:15,outline:"none",boxSizing:"border-box"}}/>
            </div>
            <div style={{marginBottom:14}}>
              <label style={{display:"block",fontSize:12,fontWeight:700,color:"#9A9AB0",marginBottom:5,textTransform:"uppercase"}}>Genre</label>
              <div style={{display:"flex",gap:10}}>
                {[["boy","👦 Garçon"],["girl","👧 Fille"]].map(([v,l])=>(
                  <button key={v} onClick={()=>setGender(v)} style={{flex:1,padding:"10px",borderRadius:14,border:"none",background:gender===v?"#7C3AED":"#1E1E28",color:gender===v?"#fff":"#9A9AB0",fontWeight:700,fontSize:14,cursor:"pointer"}}>{l}</button>
                ))}
              </div>
            </div>
            <div style={{marginBottom:14}}>
              <label style={{display:"block",fontSize:12,fontWeight:700,color:"#9A9AB0",marginBottom:5,textTransform:"uppercase"}}>Avatar</label>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {PROFILE_AVATARS.map(a=>(<span key={a} onClick={()=>setAvatar(a)} style={{fontSize:28,cursor:"pointer",padding:4,borderRadius:10,background:avatar===a?"#2A2A36":"transparent"}}>{a}</span>))}
              </div>
            </div>
            <div style={{marginBottom:20}}>
              <label style={{display:"block",fontSize:12,fontWeight:700,color:"#9A9AB0",marginBottom:5,textTransform:"uppercase"}}>Couleur</label>
              <div style={{display:"flex",gap:8}}>
                {PROFILE_COLORS.map(c=>(<span key={c} onClick={()=>setColor(c)} style={{width:30,height:30,borderRadius:10,background:c,cursor:"pointer",border:color===c?"3px solid #fff":"3px solid transparent"}}/>))}
              </div>
            </div>
            <button onClick={handleAdd} style={{width:"100%",padding:"14px",borderRadius:14,border:"none",background:"linear-gradient(135deg,#A78BFA,#818CF8)",color:"#fff",fontSize:16,fontWeight:800,cursor:"pointer"}}>Créer le profil ✨</button>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div style={{position:"fixed",inset:0,zIndex:1001,background:"rgba(0,0,0,.8)",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setConfirmDelete(null)}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#1A1A24",borderRadius:20,padding:24,width:"85%",maxWidth:340,textAlign:"center"}}>
            <div style={{fontSize:36,marginBottom:12}}>⚠️</div>
            <h3 style={{color:"#fff",fontSize:17,fontWeight:800,marginBottom:8}}>Supprimer ce profil ?</h3>
            <p style={{color:"#9A9AB0",fontSize:13,marginBottom:20}}>Toutes les données seront perdues.</p>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setConfirmDelete(null)} style={{flex:1,padding:12,borderRadius:14,border:"none",background:"#2A2A36",color:"#9A9AB0",fontWeight:700,cursor:"pointer"}}>Annuler</button>
              <button onClick={()=>{onDelete(confirmDelete);setConfirmDelete(null);}} style={{flex:1,padding:12,borderRadius:14,border:"none",background:"#EF4444",color:"#fff",fontWeight:700,cursor:"pointer"}}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSelector;
