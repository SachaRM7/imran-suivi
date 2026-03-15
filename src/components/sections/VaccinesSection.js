import React from "react";
import { useTheme } from "../../theme/Theme";
import { Card } from "../ui";
import { todayStr, fmt } from "../../utils/helpers";
import { VACCINE_SCHEDULE } from "../../constants";

const VaccinesSection = ({data,update}) => {
  const t=useTheme();
  const toggle=key=>update(d=>{if(!d.vaccines)d.vaccines={};d.vaccines[key]=d.vaccines[key]?null:todayStr()});
  return (
    <div>
      <div style={{fontSize:22,fontWeight:900,marginBottom:16}}>💉 Calendrier vaccinal</div>
      {VACCINE_SCHEDULE.map((p,pi)=>(<div key={pi} style={{marginBottom:16}}>
        <div style={{fontSize:14,fontWeight:800,color:t.accent,marginBottom:8}}>{p.age}</div>
        {p.vaccines.map((v,vi)=>{const key=`${pi}-${vi}`;const done=!!data.vaccines?.[key];
          return (<Card key={key} onClick={()=>toggle(key)} highlighted={done} style={{display:"flex",alignItems:"center",marginBottom:6}}>
            <div style={{width:26,height:26,borderRadius:8,marginRight:12,display:"flex",alignItems:"center",justifyContent:"center",background:done?t.success:t.chipBg,color:"#fff",fontSize:12,fontWeight:800,flexShrink:0}}>{done?"✓":""}</div>
            <div style={{flex:1}}><div style={{fontWeight:600,fontSize:13,color:done?t.success:t.text}}>{v}</div>{done&&<div style={{fontSize:11,color:t.textMuted}}>Fait le {fmt(data.vaccines[key])}</div>}</div>
          </Card>);
        })}
      </div>))}
    </div>
  );
};

export default VaccinesSection;
