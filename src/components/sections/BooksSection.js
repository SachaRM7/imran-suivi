import React, { useState, useRef } from "react";
import { useTheme } from "../../theme/Theme";
import { Card, Btn, Input, Modal, Chip, IconBtn } from "../ui";
import { uid, todayStr, fmt } from "../../utils/helpers";

const BooksSection = ({data, update}) => {
  const t = useTheme();
  const fileRef = useRef(null);

  const [modal, setModal]       = useState(false);
  const [editId, setEditId]     = useState(null);
  const [title, setTitle]       = useState("");
  const [author, setAuthor]     = useState("");
  const [interest, setInterest] = useState(3);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [sort, setSort]         = useState("recent");

  const books = data.books || [];

  const resetModal = () => { setEditId(null); setTitle(""); setAuthor(""); setInterest(3); setPhotoUrl(null); };
  const openAdd    = () => { resetModal(); setModal(true); };
  const openEdit   = (b) => { setEditId(b.id); setTitle(b.title); setAuthor(b.author||""); setInterest(b.interest||3); setPhotoUrl(b.photo||null); setModal(true); };

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPhotoUrl(ev.target.result);
    reader.readAsDataURL(file);
  };

  const save = () => {
    if (!title.trim()) return;
    update(d => {
      if (!d.books) d.books = [];
      if (editId) {
        const idx = d.books.findIndex(b => b.id === editId);
        if (idx !== -1) d.books[idx] = {...d.books[idx], title:title.trim(), author:author.trim(), interest, photo:photoUrl};
      } else {
        d.books.push({id:uid(), title:title.trim(), author:author.trim(), interest, photo:photoUrl, date:todayStr()});
      }
    });
    setModal(false); resetModal();
  };

  const remove = id => update(d => { d.books = (d.books||[]).filter(b => b.id !== id); });

  const sorted = [...books].sort((a,b) => {
    if (sort === "interest_desc") return (b.interest||0)-(a.interest||0);
    if (sort === "interest_asc")  return (a.interest||0)-(b.interest||0);
    return (b.date||"").localeCompare(a.date||""); // recent
  });

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          <div style={{fontSize:22,fontWeight:900}}>📚 Bibliothèque</div>
          <div style={{fontSize:13,color:t.textMuted,fontWeight:600,marginTop:2}}>{books.length} livre{books.length!==1?"s":""}</div>
        </div>
        <Btn small onClick={openAdd}>+ Ajouter</Btn>
      </div>

      {/* 4. Filtres — Chip avec color → texte blanc quand active */}
      <div style={{display:"flex",gap:6,marginBottom:16}}>
        {[
          {key:"recent",       label:"📅 Récent"},
          {key:"interest_desc",label:"⭐ Intérêt ↓"},
          {key:"interest_asc", label:"⭐ Intérêt ↑"},
        ].map(f => (
          <Chip key={f.key} active={sort===f.key} onClick={() => setSort(f.key)} color={t.accent}>
            {f.label}
          </Chip>
        ))}
      </div>

      {books.length === 0 && (
        <div style={{textAlign:"center",padding:"50px 20px"}}>
          <div style={{fontSize:60,marginBottom:12}}>📚</div>
          <div style={{fontSize:16,fontWeight:700,color:t.textSoft,marginBottom:6}}>Aucun livre pour l'instant</div>
          <div style={{fontSize:13,color:t.textMuted,marginBottom:20}}>Ajoutez les livres préférés de bébé</div>
          <Btn onClick={openAdd}>+ Premier livre</Btn>
        </div>
      )}

      {sorted.map(book => (
        <Card key={book.id} style={{display:"flex",alignItems:"center",marginBottom:8}}>
          {/* 2. Placeholder plus coloré */}
          {!book.photo ? (
            <div style={{width:60,height:60,borderRadius:10,background:t.accentLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0,marginRight:14}}>📖</div>
          ) : (
            <img src={book.photo} alt="" style={{width:60,height:60,borderRadius:10,objectFit:"cover",flexShrink:0,marginRight:14}}/>
          )}
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontWeight:800,fontSize:14,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{book.title}</div>
            {book.author&&<div style={{fontSize:12,color:t.textMuted,marginTop:1}}>{book.author}</div>}
            <div style={{fontSize:12,marginTop:3}}>
              {"⭐".repeat(book.interest||0)}{"☆".repeat(5-(book.interest||0))}
            </div>
          </div>
          <div style={{display:"flex",gap:4,flexShrink:0}}>
            <IconBtn onClick={() => openEdit(book)} style={{padding:6}}>✏️</IconBtn>
            <IconBtn onClick={() => remove(book.id)} style={{padding:6}}>🗑</IconBtn>
          </div>
        </Card>
      ))}

      <Modal open={modal} onClose={() => { setModal(false); resetModal(); }} title={editId?"Modifier le livre":"Nouveau livre"}>
        <Input label="Titre" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Le Petit Prince"/>
        <Input label="Auteur (optionnel)" value={author} onChange={e => setAuthor(e.target.value)} placeholder="Ex: Saint-Exupéry"/>

        {/* 3. Étoiles — zone de clic agrandie */}
        <div style={{marginBottom:14}}>
          <label style={{display:"block",fontSize:12,fontWeight:700,color:t.textSoft,marginBottom:8,textTransform:"uppercase",letterSpacing:.5}}>
            Intérêt de bébé
          </label>
          <div style={{display:"flex",gap:10}}>
            {[1,2,3,4,5].map(n => (
              <span key={n} onClick={() => setInterest(n)} style={{
                fontSize:28,cursor:"pointer",padding:"4px 2px",
                color: n<=interest ? "#FBBF24" : t.textMuted,
                transition:"color .15s, transform .1s",
                transform: n<=interest ? "scale(1.1)" : "scale(1)",
                display:"inline-block",
              }}>
                {n<=interest?"⭐":"☆"}
              </span>
            ))}
          </div>
        </div>

        {/* Photo */}
        <div style={{marginBottom:14}}>
          <label style={{display:"block",fontSize:12,fontWeight:700,color:t.textSoft,marginBottom:8,textTransform:"uppercase",letterSpacing:.5}}>
            Photo (optionnel)
          </label>
          <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handlePhoto}/>
          <Btn variant="secondary" small onClick={() => fileRef.current?.click()}>
            📷 {photoUrl ? "Changer la photo" : "Ajouter une photo"}
          </Btn>
          {/* 1. Aperçu contraint */}
          {photoUrl && (
            <img src={photoUrl} alt="" style={{width:"100%",maxHeight:160,objectFit:"cover",borderRadius:14,marginTop:8,marginBottom:8}}/>
          )}
          {photoUrl && (
            <Btn variant="danger" small onClick={() => setPhotoUrl(null)} style={{marginTop:4}}>✕ Supprimer</Btn>
          )}
        </div>

        <Btn onClick={save} full>Enregistrer</Btn>
      </Modal>
    </div>
  );
};

export default BooksSection;
