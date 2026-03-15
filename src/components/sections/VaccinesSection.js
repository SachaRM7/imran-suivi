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
      {VACCINE_SCHEDULE.map((p,pi)=>(
        <div key={pi} style={{marginBottom:16}}>
          {/* 2. Intertitre avec filet */}
          <div style={{
            fontSize:14,fontWeight:800,color:t.accent,
            marginBottom:12,paddingBottom:6,
            borderBottom:`1.5px solid ${t.cardBorder}`,
          }}>{p.age}</div>
          {p.vaccines.map((v,vi)=>{
            const key=`${pi}-${vi}`;
            const done=!!data.vaccines?.[key];
            return (
              /* 1. Fond vert + bordure verte, sans highlighted */
              <Card key={key} onClick={()=>toggle(key)} highlighted={false} style={{
                display:"flex",alignItems:"center",marginBottom:6,
                background:done?t.successBg:t.card,
                border:`${done?"2px":"1.5px"} solid ${done?t.success:t.cardBorder}`,
              }}>
                <div style={{
                  width:26,height:26,borderRadius:8,marginRight:12,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  background:done?t.success:t.chipBg,
                  color:"#fff",fontSize:12,fontWeight:800,flexShrink:0,
                }}>{done?"✓":""}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:done?700:600,fontSize:13,color:done?t.success:t.text}}>{v}</div>
                  {done&&<div style={{fontSize:11,color:t.textSoft}}>Fait le {fmt(data.vaccines[key])}</div>}
                </div>
              </Card>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default VaccinesSection;
