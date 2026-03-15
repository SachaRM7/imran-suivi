import React from "react";
import { useTheme } from "../../theme/Theme";
import { Card, IconBtn } from "../ui";
import { todayStr, fmt } from "../../utils/helpers";
import { TEETH_MAP } from "../../constants";

const TeethSection = ({data,update}) => {
  const t=useTheme();
  const toggle=id=>update(d=>{if(!d.teeth)d.teeth={};d.teeth[id]?delete d.teeth[id]:d.teeth[id]={date:todayStr()}});
  const count=Object.keys(data.teeth||{}).length;
  const renderJaw=(teeth)=>(
    <div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center"}}>
      {teeth.map(th=>(<div key={th.id} onClick={()=>toggle(th.id)} style={{width:38,height:38,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:18,background:data.teeth?.[th.id]?t.warnBg:t.chipBg,border:`2px solid ${data.teeth?.[th.id]?t.warn:t.cardBorder}`,transition:"all .2s"}} title={th.name}>{data.teeth?.[th.id]?"🦷":"○"}</div>))}
    </div>
  );
  return (
    <div>
      <div style={{fontSize:22,fontWeight:900,marginBottom:4}}>🦷 Dents de lait</div>
      <div style={{fontSize:13,color:t.textMuted,fontWeight:600,marginBottom:18}}>{count}/20</div>
      <Card style={{padding:20,marginBottom:16,textAlign:"center"}}>
        <div style={{fontSize:12,fontWeight:700,color:t.textSoft,marginBottom:10}}>Mâchoire supérieure</div>
        {renderJaw(TEETH_MAP.filter(th=>th.pos==="top"))}
        <div style={{height:16}}/>
        <div style={{fontSize:12,fontWeight:700,color:t.textSoft,marginBottom:10}}>Mâchoire inférieure</div>
        {renderJaw(TEETH_MAP.filter(th=>th.pos==="bottom"))}
      </Card>
      {TEETH_MAP.map(th=>(<div key={th.id} onClick={()=>toggle(th.id)} style={{display:"flex",alignItems:"center",padding:"10px 14px",marginBottom:5,borderRadius:12,cursor:"pointer",background:data.teeth?.[th.id]?t.warnBg:t.card,border:`1.5px solid ${t.cardBorder}`,fontSize:13}}>
        <span style={{marginRight:10,fontSize:16}}>{data.teeth?.[th.id]?"🦷":"○"}</span><span style={{flex:1,fontWeight:600,color:t.text}}>{th.name}</span><span style={{color:t.textMuted,fontSize:11}}>{th.avg}</span>
        {data.teeth?.[th.id]&&<span style={{fontSize:10,marginLeft:8,color:t.success,fontWeight:700}}>{fmt(data.teeth[th.id].date)}</span>}
      </div>))}
    </div>
  );
};

export default TeethSection;
