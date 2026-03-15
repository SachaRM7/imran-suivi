import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../../theme/Theme";
import { Card } from "../ui";
import { babyAgeMonths } from "../../utils/helpers";
import { DEFAULT_MILESTONES } from "../../constants";

// ─── Confetti CSS pur — zéro dépendance externe ────────────────────────────
const COLORS = ["#A78BFA","#818CF8","#34D399","#FBBF24","#F472B6","#60A5FA","#FB923C"];
const rand = (min, max) => Math.random() * (max - min) + min;

const Confetti = ({ active, onDone }) => {
  const pieces = useRef(
    Array.from({length: 60}, (_, i) => ({
      id: i,
      x: rand(5, 95),
      delay: rand(0, 0.6),
      dur: rand(1.2, 2.2),
      size: rand(7, 13),
      color: COLORS[i % COLORS.length],
      rotate: rand(-180, 180),
      drift: rand(-40, 40),
    }))
  ).current;

  useEffect(() => {
    if (!active) return;
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [active, onDone]);

  if (!active) return null;

  return (
    <div style={{
      position:"fixed", inset:0, pointerEvents:"none",
      zIndex:9999, overflow:"hidden",
    }}>
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-20px) rotate(0deg) translateX(0); opacity:1; }
          100% { transform: translateY(110vh) rotate(var(--r)) translateX(var(--d)); opacity:0; }
        }
      `}</style>
      {pieces.map(p => (
        <div key={p.id} style={{
          position:"absolute",
          left:`${p.x}%`,
          top: 0,
          width: p.size,
          height: p.size * 0.5,
          borderRadius: 2,
          background: p.color,
          "--r": `${p.rotate}deg`,
          "--d": `${p.drift}px`,
          animation: `confettiFall ${p.dur}s ${p.delay}s ease-in forwards`,
        }}/>
      ))}
    </div>
  );
};

// ─── Section ────────────────────────────────────────────────────────────────
const MilestonesSection = ({data,update,profile}) => {
  const t    = useTheme();
  const ageM = babyAgeMonths(profile.birthDate);
  const avail = Object.keys(data.milestones||DEFAULT_MILESTONES).map(Number).sort((a,b)=>a-b);
  const [month, setMonth]         = useState(avail.includes(ageM)?ageM:avail.find(m=>m>=ageM)||avail[0]||1);
  const [showConfetti, setConfetti] = useState(false);

  const toggle = (m, i) => {
    const key = `${m}-${i}`;
    const wasChecked = !!data.milestonesChecked?.[key];
    update(d => { d.milestonesChecked[key] = !d.milestonesChecked[key]; });
    if (!wasChecked) {
      const list = (data.milestones||DEFAULT_MILESTONES)[m] || [];
      const nowChecked = list.filter((_,idx) => {
        const k = `${m}-${idx}`;
        return k === key || !!data.milestonesChecked?.[k];
      }).length;
      if (nowChecked === list.length) setConfetti(true);
    }
  };

  const items    = (data.milestones||DEFAULT_MILESTONES)[month] || [];
  const checkedN = items.filter((_,i) => data.milestonesChecked?.[`${month}-${i}`]).length;

  return (
    <div>
      <Confetti active={showConfetti} onDone={() => setConfetti(false)} />

      <div style={{fontSize:22,fontWeight:900,marginBottom:4}}>🏆 Étapes</div>
      <div style={{fontSize:13,color:t.textMuted,fontWeight:600,marginBottom:14}}>Mois {month} — {checkedN}/{items.length}</div>

      <div style={{display:"flex",gap:5,overflowX:"auto",marginBottom:14,paddingBottom:4}}>
        {avail.map(m => {
          const tot  = (data.milestones||DEFAULT_MILESTONES)[m]?.length || 0;
          const done = ((data.milestones||DEFAULT_MILESTONES)[m]||[]).filter((_,i)=>data.milestonesChecked?.[`${m}-${i}`]).length;
          return (
            <span key={m} onClick={() => setMonth(m)} style={{
              flex:"0 0 auto",minWidth:38,height:38,borderRadius:12,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontWeight:800,fontSize:13,cursor:"pointer",
              background: month===m ? t.accent : (tot>0&&done===tot) ? t.successBg : t.chipBg,
              color:       month===m ? "#fff"   : (tot>0&&done===tot) ? "#059669"   : t.textSoft,
              border: m===ageM&&month!==m ? `2px solid ${t.accent}` : "1.5px solid transparent",
            }}>{m}</span>
          );
        })}
      </div>

      <div style={{background:t.cardBorder,borderRadius:10,height:8,marginBottom:18,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${items.length?(checkedN/items.length)*100:0}%`,background:t.accentGrad,borderRadius:10,transition:"width .4s"}}/>
      </div>

      {items.map((item,i) => {
        const checked = !!data.milestonesChecked?.[`${month}-${i}`];
        return (
          <Card key={i} onClick={() => toggle(month,i)} highlighted={checked} style={{display:"flex",alignItems:"center",marginBottom:8}}>
            <div style={{width:30,height:30,borderRadius:10,marginRight:14,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,background:checked?t.accent:t.chipBg,color:checked?"#fff":t.textMuted,transition:"all .2s",flexShrink:0}}>{checked?"✓":""}</div>
            <div style={{fontWeight:checked?800:600,fontSize:14,color:checked?t.accent:t.text,textDecoration:"none"}}>{item}</div>
          </Card>
        );
      })}
    </div>
  );
};

export default MilestonesSection;
