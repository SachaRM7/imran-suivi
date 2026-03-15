import React, { useState, useRef } from "react";
import { useTheme } from "../../theme/Theme";
import { Card, Btn, Modal, IconBtn, Empty } from "../ui";
import { uid, fmtFull } from "../../utils/helpers";
import { uploadPhoto } from "../../firebase";

const NotesSection = ({data,update,profileId}) => {
  const t=useTheme(); const [modal,setModal]=useState(false); const [text,setText]=useState(""); const [mood,setMood]=useState("😊"); const [photoUrl,setPhotoUrl]=useState(""); const [uploading,setUploading]=useState(false);
  const fileRef=useRef();
  const handlePhoto=async(e)=>{
    const file=e.target.files?.[0]; if(!file)return;
    setUploading(true);
    try { const url=await uploadPhoto(profileId,file); setPhotoUrl(url); } catch(err){ console.error(err); alert("Erreur upload photo"); }
    setUploading(false);
  };
  const add=()=>{if(!text.trim()&&!photoUrl)return;update(d=>{d.notes.push({id:uid(),text,mood,photo:photoUrl||null,date:new Date().toISOString()})});setModal(false);setText("");setPhotoUrl("")};
  const remove=id=>update(d=>{d.notes=d.notes.filter(x=>x.id!==id)});
  const sorted=[...(data.notes||[])].sort((a,b)=>b.date.localeCompare(a.date));
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><div style={{fontSize:22,fontWeight:900}}>📝 Journal</div><Btn onClick={()=>setModal(true)} small>+ Écrire</Btn></div>
      {sorted.length===0&&<Empty emoji="📝" text="Écrivez vos premiers souvenirs"/>}
      {sorted.map(n=>(<Card key={n.id} style={{marginBottom:10}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:12,color:t.textMuted,fontWeight:700}}>{n.mood} {fmtFull(n.date)}</span><IconBtn onClick={()=>remove(n.id)}>🗑</IconBtn></div>
        {n.photo&&<img src={n.photo} alt="" style={{width:"100%",borderRadius:12,marginBottom:8,maxHeight:250,objectFit:"cover"}}/>}
        {n.text&&<div style={{fontSize:14,lineHeight:1.7,color:t.text}}>{n.text}</div>}
      </Card>))}
      <Modal open={modal} onClose={()=>setModal(false)} title="Nouveau souvenir">
        <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
          {["😊","😢","😴","🤒","🎉","❤️","😂","🥰","😤"].map(m=>(
            <span key={m} onClick={()=>setMood(m)} style={{
              fontSize:26,cursor:"pointer",padding:"6px",borderRadius:10,
              background:mood===m?t.accentLight:"transparent",
              transition:"background .15s, transform .1s",
              transform:mood===m?"scale(1.15)":"scale(1)",
              display:"inline-block",
            }}>{m}</span>
          ))}
        </div>
        <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Aujourd'hui, bébé a..." style={{width:"100%",minHeight:100,padding:"12px 14px",borderRadius:14,border:`2px solid ${t.inputBorder}`,fontSize:15,outline:"none",resize:"vertical",boxSizing:"border-box",background:t.card,color:t.text}}/>
        {/* Photo upload */}
        <div style={{marginTop:10,marginBottom:10}}>
          <input type="file" accept="image/*" ref={fileRef} onChange={handlePhoto} style={{display:"none"}}/>
          <Btn variant="secondary" small onClick={()=>fileRef.current?.click()} style={{width:"100%"}}>{uploading?"⏳ Upload en cours...":"📷 Ajouter une photo"}</Btn>
          {photoUrl&&<img src={photoUrl} alt="" style={{width:"100%",borderRadius:12,marginTop:8,maxHeight:200,objectFit:"cover"}}/>}
        </div>
        <Btn onClick={add} full>Enregistrer</Btn>
      </Modal>
    </div>
  );
};

export default NotesSection;
