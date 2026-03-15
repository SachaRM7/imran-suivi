import React, { useState } from "react";
import { useTheme } from "../../theme/Theme";
import { Card, Btn, Input, Modal, IconBtn } from "../ui";
import { uid, todayStr, fmtFull, babyAgeMonths } from "../../utils/helpers";
import { OMS_WEIGHT_BOYS, OMS_WEIGHT_GIRLS, OMS_HEIGHT_BOYS, OMS_HEIGHT_GIRLS } from "../../constants";

const GrowthSection = ({data,update,profile}) => {
  const t=useTheme();
  const [modal,setModal]=useState(false);
  const [weight,setWeight]=useState("");
  const [height,setHeight]=useState("");
  const [head,setHead]=useState("");
  const [date,setDate]=useState(todayStr());
  const [chartType,setChartType]=useState("weight");

  const add=()=>{
    update(d=>{d.growth.push({id:uid(),date,weight:Number(weight)||null,height:Number(height)||null,head:Number(head)||null})});
    setModal(false);setWeight("");setHeight("");setHead("");
  };
  const remove=id=>update(d=>{d.growth=d.growth.filter(x=>x.id!==id)});

  const sorted=[...(data.growth||[])].sort((a,b)=>b.date.localeCompare(a.date));
  const chartData=[...(data.growth||[])].sort((a,b)=>a.date.localeCompare(b.date));

  const gender=profile?.gender||"boy";
  const omsW=gender==="girl"?OMS_WEIGHT_GIRLS:OMS_WEIGHT_BOYS;
  const omsH=gender==="girl"?OMS_HEIGHT_GIRLS:OMS_HEIGHT_BOYS;

  const renderOMSChart = (type) => {
    const isHead = type==="head";
    const oms = type==="weight"?omsW:omsH;
    const unit = type==="weight"?"kg":"cm";

    const babyPoints = chartData
      .filter(g=>g[type])
      .map(g=>({
        month: babyAgeMonths(profile.birthDate)-Math.round((new Date()-new Date(g.date))/2.628e9),
        value: g[type],
      }))
      .filter(g=>g.month>=0&&g.month<=24);

    const percentiles = type==="weight"?["P3","P15","P50","P85","P97"]:["P3","P50","P97"];
    const pColors={"P3":"#D1D5DB","P15":"#9CA3AF","P50":t.accent,"P85":"#9CA3AF","P97":"#D1D5DB"};

    const W=340,H=180,padL=35,padR=10,padT=15,padB=25;
    const cW=W-padL-padR, cH=H-padT-padB;

    let minV, maxV, x, y;
    if(!isHead) {
      const allVals=percentiles.flatMap(p=>oms[p]);
      minV=Math.min(...allVals)*0.9; maxV=Math.max(...allVals)*1.05;
    } else if(babyPoints.length>0) {
      const vals=babyPoints.map(d=>d.value);
      minV=Math.min(...vals)*0.95; maxV=Math.max(...vals)*1.05;
    } else {
      minV=30; maxV=50;
    }
    x=m=>padL+(m/24)*cW;
    y=v=>padT+cH-(((v-minV)/(maxV-minV))*cH);

    return (
      <Card style={{padding:16,marginBottom:16}}>
        <div style={{fontSize:12,fontWeight:700,color:t.textSoft,marginBottom:12}}>
          📈 Courbe {type==="weight"?"Poids":type==="height"?"Taille":"Tour de tête"}
        </div>

        {/* 1. Segmented control */}
        <div style={{display:"flex",gap:0,marginBottom:12,background:t.chipBg,borderRadius:12,padding:3,border:`1.5px solid ${t.chipBorder}`}}>
          {[
            {key:"weight",label:"⚖️ Poids"},
            {key:"height",label:"📏 Taille"},
            {key:"head",  label:"🧠 Tête"},
          ].map(tp=>(
            <div key={tp.key} onClick={()=>setChartType(tp.key)} style={{
              flex:1,textAlign:"center",padding:"8px 4px",borderRadius:10,
              fontSize:12,fontWeight:800,cursor:"pointer",
              background:chartType===tp.key?t.accent:"transparent",
              color:chartType===tp.key?"#fff":t.textSoft,
              transition:"all .2s",
            }}>{tp.label}</div>
          ))}
        </div>

        {/* Message si pas de données OMS pour la tête */}
        {isHead&&(
          <div style={{fontSize:11,color:t.textMuted,marginBottom:8,textAlign:"center",fontStyle:"italic"}}>
            Données OMS non disponibles pour le tour de tête — seules vos mesures sont affichées
          </div>
        )}

        <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:180}}>
          {[0,6,12,18,24].map(m=>(
            <g key={m}>
              <line x1={x(m)} y1={padT} x2={x(m)} y2={H-padB} stroke={t.cardBorder} strokeWidth=".5"/>
              <text x={x(m)} y={H-6} textAnchor="middle" fontSize="8" fill={t.textMuted}>{m}m</text>
            </g>
          ))}

          {!isHead&&(<>
            {percentiles.length===5&&(
              <polygon
                points={`${oms.P3.map((v,i)=>`${x(i)},${y(v)}`).join(" ")} ${[...oms.P97].reverse().map((v,i)=>`${x(24-i)},${y(v)}`).join(" ")}`}
                fill={t.accent} opacity=".06"
              />
            )}
            {percentiles.map(p=>(
              <polyline key={p}
                points={oms[p].map((v,i)=>`${x(i)},${y(v)}`).join(" ")}
                fill="none" stroke={pColors[p]||t.textMuted}
                strokeWidth={p==="P50"?"1.5":".8"}
                strokeDasharray={p==="P50"?"":"4 3"}
                opacity={p==="P50"?1:.6}
              />
            ))}
            {percentiles.map(p=>(
              <text key={p} x={W-padR+2} y={y(oms[p][24])+3} fontSize="7" fill={t.textMuted}>{p}</text>
            ))}
          </>)}

          {babyPoints.length>=2&&(
            <polyline
              points={babyPoints.map(d=>`${x(d.month)},${y(d.value)}`).join(" ")}
              fill="none" stroke={t.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            />
          )}
          {babyPoints.map((d,i)=>(
            <g key={i}>
              <circle cx={x(d.month)} cy={y(d.value)} r="4" fill={t.card} stroke={t.accent} strokeWidth="2.5"/>
              <text x={x(d.month)} y={y(d.value)-8} textAnchor="middle" fontSize="8" fill={t.accent} fontWeight="700">
                {d.value}{unit}
              </text>
            </g>
          ))}
        </svg>

        {!isHead&&(
          <div style={{display:"flex",justifyContent:"center",gap:12,marginTop:8,fontSize:10,color:t.textMuted}}>
            <span>--- P3/P97 (extrêmes)</span>
            <span style={{color:t.accent,fontWeight:700}}>━ P50 (médiane)</span>
            <span style={{color:t.accent}}>● Bébé</span>
          </div>
        )}
      </Card>
    );
  };

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{fontSize:22,fontWeight:900}}>📏 Croissance</div>
        <Btn onClick={()=>{setDate(todayStr());setModal(true)}} small>+ Mesure</Btn>
      </div>

      {chartData.length>=1&&renderOMSChart(chartType)}

      {/* 2. Historique — meilleur contraste + icônes espacées */}
      {sorted.map(g=>(
        <Card key={g.id} style={{display:"flex",alignItems:"center",marginBottom:8}}>
          <div style={{flex:1}}>
            <div style={{fontWeight:800,fontSize:14}}>{fmtFull(g.date)}</div>
            <div style={{fontSize:12,color:t.text,display:"flex",gap:12,marginTop:4}}>
              {g.weight&&<span>⚖️ {g.weight} kg</span>}
              {g.height&&<span>📏 {g.height} cm</span>}
              {g.head&&<span>🧠 {g.head} cm</span>}
            </div>
          </div>
          <div style={{display:"flex",gap:16}}>
            <IconBtn onClick={()=>remove(g.id)} style={{padding:8}}>🗑</IconBtn>
          </div>
        </Card>
      ))}

      {/* 3. Modal — pavé numérique mobile */}
      <Modal open={modal} onClose={()=>setModal(false)} title="Nouvelle mesure">
        <Input label="Date" type="date" value={date} onChange={e=>setDate(e.target.value)}/>
        <Input
          label="Poids (kg)" type="number" inputMode="decimal" pattern="[0-9]*" step=".01"
          value={weight} onChange={e=>setWeight(e.target.value)} placeholder="6.5"
        />
        <Input
          label="Taille (cm)" type="number" inputMode="decimal" pattern="[0-9]*" step=".1"
          value={height} onChange={e=>setHeight(e.target.value)} placeholder="67"
        />
        <Input
          label="Tour de tête (cm)" type="number" inputMode="decimal" pattern="[0-9]*" step=".1"
          value={head} onChange={e=>setHead(e.target.value)} placeholder="43"
        />
        <Btn onClick={add} full style={{marginTop:4}}>Enregistrer</Btn>
      </Modal>
    </div>
  );
};

export default GrowthSection;
