import React, { useState } from "react";
import { useTheme } from "../../theme/Theme";
import { Card, Btn, Modal } from "../ui";
import { babyAgeText, fmtFull, fmtTime, fmt, todayStr } from "../../utils/helpers";
import { TEETH_MAP, VACCINE_SCHEDULE, DEFAULT_MILESTONES } from "../../constants";

// ─── CSS commun aux rapports ───────────────────────────────────────────────
const REPORT_CSS = `
  body{font-family:Arial,sans-serif;max-width:740px;margin:40px auto;color:#333;line-height:1.6}
  h1{color:#7C3AED;border-bottom:3px solid #7C3AED;padding-bottom:8px;margin-bottom:16px}
  h2{color:#7C3AED;margin-top:28px;margin-bottom:4px;font-size:16px}
  h3{color:#8B5CF6;font-size:13px;margin:16px 0 6px}
  table{width:100%;border-collapse:collapse;margin:8px 0}
  td,th{border:1px solid #ddd;padding:6px 10px;font-size:12px}
  th{background:#f5f3ff;font-weight:700}
  .stat{color:#666;font-size:12px;margin:0 0 12px;font-style:italic}
  .tag{display:inline-block;background:#f5f3ff;padding:2px 8px;border-radius:8px;margin:2px;font-size:12px}
  .footer{font-size:11px;color:#999;margin-top:30px;border-top:1px solid #eee;padding-top:8px}
  @media print{body{margin:20px}}
`;

// ─── Utilitaires ────────────────────────────────────────────────────────────
const groupByDay = (items, dateField = "time") => {
  const groups = {};
  items.forEach(item => {
    const day = (item[dateField] || "").slice(0, 10);
    if (!day) return;
    if (!groups[day]) groups[day] = [];
    groups[day].push(item);
  });
  return Object.entries(groups).sort(([a],[b]) => a.localeCompare(b));
};

const calcSleepDuration = (entries) => {
  const mins = entries.filter(s => s.end).reduce((acc,s) => {
    return acc + Math.round((new Date(s.end) - new Date(s.start)) / 60000);
  }, 0);
  return mins >= 60
    ? `${Math.floor(mins/60)}h${String(mins%60).padStart(2,"0")}min`
    : `${mins}min`;
};

const diapersBreakdown = (diapers) => {
  const pipi   = diapers.filter(d => d.type==="pipi").length;
  const caca   = diapers.filter(d => d.type==="caca"||d.type==="selles").length;
  const mixte  = diapers.filter(d => d.type==="mixte").length;
  const parts  = [];
  if (pipi)  parts.push(`${pipi} pipi`);
  if (caca)  parts.push(`${caca} selles`);
  if (mixte) parts.push(`${mixte} mixte`);
  return parts.join(" · ") || "—";
};

const tempStats = (temps) => {
  const vals = temps.map(x => x.value).filter(Boolean);
  if (!vals.length) return "";
  return `min ${Math.min(...vals)}°C · max ${Math.max(...vals)}°C`;
};


const SettingsSection = ({data,profile,darkMode,setDarkMode,onSwitchProfile}) => {
  const t = useTheme();
  const [previewHtml, setPreviewHtml]   = useState(null);
  const [previewTitle, setPreviewTitle] = useState("");

  // ─── Rapport du jour ────────────────────────────────────────────────────
  const exportDayReport = () => {
    const today     = todayStr();
    const bottles   = (data.bottles||[]).filter(b => b.time?.startsWith(today)).sort((a,b)=>a.time.localeCompare(b.time));
    const diapers   = (data.diapers||[]).filter(d => d.time?.startsWith(today)).sort((a,b)=>a.time.localeCompare(b.time));
    const sleeps    = (data.sleep||[]).filter(s => s.start?.startsWith(today)).sort((a,b)=>a.start.localeCompare(b.start));
    const meds      = (data.medicines||[]).filter(m => m.time?.startsWith(today)).sort((a,b)=>a.time.localeCompare(b.time));
    const temps     = (data.temperature||[]).filter(x => x.time?.startsWith(today)).sort((a,b)=>a.time.localeCompare(b.time));

    // Biberons
    const totalMl = bottles.reduce((s,b) => s+(b.amount||0), 0);
    let bottleHtml = "";
    if (bottles.length) {
      bottleHtml = `<p class="stat"><strong>Synthèse :</strong> ${bottles.length} biberon${bottles.length>1?"s":""} — ${totalMl} ml au total</p>`;
      bottleHtml += `<table><tr><th>Heure</th><th>Quantité</th><th>Note</th></tr>`;
      bottles.forEach(b => { bottleHtml += `<tr><td>${fmtTime(b.time)}</td><td>${b.amount} ml</td><td>${b.note||"—"}</td></tr>`; });
      bottleHtml += `</table>`;
    }

    // Couches
    let diaperHtml = "";
    if (diapers.length) {
      diaperHtml = `<p class="stat"><strong>Synthèse :</strong> ${diapers.length} couche${diapers.length>1?"s":""} (${diapersBreakdown(diapers)})</p>`;
      diaperHtml += `<table><tr><th>Heure</th><th>Type</th><th>Détail</th><th>Note</th></tr>`;
      diapers.forEach(d => {
        const detail = [d.quantity&&({"+":"peu","++":"normal","+++":"beaucoup"}[d.quantity]||d.quantity),d.consistency,d.color].filter(Boolean).join(", ");
        diaperHtml += `<tr><td>${fmtTime(d.time)}</td><td>${d.type}</td><td>${detail||"—"}</td><td>${d.note||"—"}</td></tr>`;
      });
      diaperHtml += `</table>`;
    }

    // Sommeil
    let sleepHtml = "";
    if (sleeps.length) {
      const durTxt = calcSleepDuration(sleeps);
      sleepHtml = `<p class="stat"><strong>Synthèse :</strong> ${sleeps.length} session${sleeps.length>1?"s":""} — ${durTxt} de sommeil total</p>`;
      sleepHtml += `<table><tr><th>Type</th><th>Début</th><th>Fin</th><th>Durée</th></tr>`;
      sleeps.forEach(s => {
        const dur = s.end ? (() => { const m=Math.round((new Date(s.end)-new Date(s.start))/60000); return m>=60?`${Math.floor(m/60)}h${String(m%60).padStart(2,"0")}min`:`${m}min`; })() : "En cours";
        sleepHtml += `<tr><td>${s.type||"sieste"}</td><td>${fmtTime(s.start)}</td><td>${s.end?fmtTime(s.end):"—"}</td><td>${dur}</td></tr>`;
      });
      sleepHtml += `</table>`;
    }

    // Médicaments
    let medsHtml = "";
    if (meds.length) {
      medsHtml = `<p class="stat"><strong>Synthèse :</strong> ${meds.length} prise${meds.length>1?"s":""}</p>`;
      medsHtml += `<table><tr><th>Heure</th><th>Médicament</th><th>Dose</th><th>Note</th></tr>`;
      meds.forEach(m => { medsHtml += `<tr><td>${fmtTime(m.time)}</td><td>${m.name}</td><td>${m.dose||"—"}</td><td>${m.note||"—"}</td></tr>`; });
      medsHtml += `</table>`;
    }

    // Température
    let tempHtml = "";
    if (temps.length) {
      const stats = tempStats(temps);
      tempHtml = `<p class="stat"><strong>Synthèse :</strong> ${temps.length} mesure${temps.length>1?"s":""}${stats?" — "+stats:""}</p>`;
      tempHtml += `<table><tr><th>Heure</th><th>Valeur</th><th>Note</th></tr>`;
      temps.forEach(x => { tempHtml += `<tr><td>${fmtTime(x.time)}</td><td>${x.value}°C</td><td>${x.note||"—"}</td></tr>`; });
      tempHtml += `</table>`;
    }

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
    <title>Rapport du jour — ${profile.name}</title>
    <style>${REPORT_CSS}</style></head>
    <body>
    <h1>📋 Rapport du jour — ${profile.name}</h1>
    <p><strong>Date :</strong> ${fmtFull(today)} &nbsp;|&nbsp; <strong>Âge :</strong> ${babyAgeText(profile.birthDate)}</p>
    ${bottles.length  ? `<h2>🍼 Biberons</h2>${bottleHtml}` : ""}
    ${diapers.length  ? `<h2>🧷 Couches</h2>${diaperHtml}` : ""}
    ${sleeps.length   ? `<h2>😴 Sommeil</h2>${sleepHtml}` : ""}
    ${meds.length     ? `<h2>💊 Médicaments</h2>${medsHtml}` : ""}
    ${temps.length    ? `<h2>🌡️ Température</h2>${tempHtml}` : ""}
    ${!bottles.length&&!diapers.length&&!sleeps.length&&!meds.length&&!temps.length ? "<p>Aucune donnée enregistrée aujourd'hui.</p>" : ""}
    <p class="footer">Généré le ${fmtFull(new Date().toISOString())} — Baby Tracker</p>
    </body></html>`;

    setPreviewHtml(html);
    setPreviewTitle("Rapport du jour");
  };

  // ─── Rapport hebdomadaire ───────────────────────────────────────────────
  const exportWeekReport = () => {
    const sevenDaysAgo = new Date(Date.now() - 7*24*60*60*1000).toISOString().slice(0,10);
    const inRange = d => d >= sevenDaysAgo;

    const weekBottles = (data.bottles||[]).filter(b => inRange(b.time?.slice(0,10)||""));
    const weekDiapers = (data.diapers||[]).filter(d => inRange(d.time?.slice(0,10)||""));
    const weekSleeps  = (data.sleep||[]).filter(s => inRange(s.start?.slice(0,10)||""));
    const weekMeds    = (data.medicines||[]).filter(m => inRange(m.time?.slice(0,10)||""));
    const weekTemps   = (data.temperature||[]).filter(x => inRange(x.time?.slice(0,10)||""));

    let sections = "";

    // Biberons par jour
    if (weekBottles.length) {
      const totalMl = weekBottles.reduce((s,b)=>s+(b.amount||0),0);
      sections += `<h2>🍼 Biberons</h2>`;
      sections += `<p class="stat"><strong>Synthèse :</strong> ${weekBottles.length} biberons — ${totalMl} ml au total — moy. ${Math.round(totalMl/7)} ml/jour</p>`;
      groupByDay(weekBottles,"time").forEach(([day,items]) => {
        const dayTotal = items.reduce((s,b)=>s+(b.amount||0),0);
        sections += `<h3>${fmtFull(day)} — ${items.length} bib. (${dayTotal} ml)</h3>`;
        sections += `<table><tr><th>Heure</th><th>Quantité</th><th>Note</th></tr>`;
        items.sort((a,b)=>a.time.localeCompare(b.time)).forEach(b => {
          sections += `<tr><td>${fmtTime(b.time)}</td><td>${b.amount} ml</td><td>${b.note||"—"}</td></tr>`;
        });
        sections += `</table>`;
      });
    }

    // Couches par jour
    if (weekDiapers.length) {
      sections += `<h2>🧷 Couches</h2>`;
      sections += `<p class="stat"><strong>Synthèse :</strong> ${weekDiapers.length} couches (${diapersBreakdown(weekDiapers)}) — moy. ${(weekDiapers.length/7).toFixed(1)}/jour</p>`;
      groupByDay(weekDiapers,"time").forEach(([day,items]) => {
        sections += `<h3>${fmtFull(day)} — ${items.length} couche${items.length>1?"s":""} (${diapersBreakdown(items)})</h3>`;
        sections += `<table><tr><th>Heure</th><th>Type</th><th>Détail</th></tr>`;
        items.sort((a,b)=>a.time.localeCompare(b.time)).forEach(d => {
          const det=[d.quantity&&({"+":"peu","++":"normal","+++":"beaucoup"}[d.quantity]||d.quantity),d.consistency,d.color].filter(Boolean).join(", ");
          sections += `<tr><td>${fmtTime(d.time)}</td><td>${d.type}</td><td>${det||"—"}</td></tr>`;
        });
        sections += `</table>`;
      });
    }

    // Sommeil par jour
    if (weekSleeps.length) {
      const durTxt = calcSleepDuration(weekSleeps);
      sections += `<h2>😴 Sommeil</h2>`;
      sections += `<p class="stat"><strong>Synthèse :</strong> ${weekSleeps.length} sessions — ${durTxt} de sommeil total</p>`;
      groupByDay(weekSleeps,"start").forEach(([day,items]) => {
        const dayDur = calcSleepDuration(items);
        sections += `<h3>${fmtFull(day)} — ${items.length} session${items.length>1?"s":""} (${dayDur})</h3>`;
        sections += `<table><tr><th>Type</th><th>Début</th><th>Fin</th><th>Durée</th></tr>`;
        items.sort((a,b)=>a.start.localeCompare(b.start)).forEach(s => {
          const dur = s.end ? (() => { const m=Math.round((new Date(s.end)-new Date(s.start))/60000); return m>=60?`${Math.floor(m/60)}h${String(m%60).padStart(2,"0")}min`:`${m}min`; })() : "En cours";
          sections += `<tr><td>${s.type||"sieste"}</td><td>${fmtTime(s.start)}</td><td>${s.end?fmtTime(s.end):"—"}</td><td>${dur}</td></tr>`;
        });
        sections += `</table>`;
      });
    }

    // Médicaments par jour
    if (weekMeds.length) {
      sections += `<h2>💊 Médicaments</h2>`;
      sections += `<p class="stat"><strong>Synthèse :</strong> ${weekMeds.length} prise${weekMeds.length>1?"s":""} sur 7 jours</p>`;
      groupByDay(weekMeds,"time").forEach(([day,items]) => {
        sections += `<h3>${fmtFull(day)} — ${items.length} prise${items.length>1?"s":""}</h3>`;
        sections += `<table><tr><th>Heure</th><th>Médicament</th><th>Dose</th></tr>`;
        items.sort((a,b)=>a.time.localeCompare(b.time)).forEach(m => {
          sections += `<tr><td>${fmtTime(m.time)}</td><td>${m.name}</td><td>${m.dose||"—"}</td></tr>`;
        });
        sections += `</table>`;
      });
    }

    // Température par jour
    if (weekTemps.length) {
      const stats = tempStats(weekTemps);
      sections += `<h2>🌡️ Température</h2>`;
      sections += `<p class="stat"><strong>Synthèse :</strong> ${weekTemps.length} mesure${weekTemps.length>1?"s":""}${stats?" — "+stats:""}</p>`;
      groupByDay(weekTemps,"time").forEach(([day,items]) => {
        sections += `<h3>${fmtFull(day)}</h3>`;
        sections += `<table><tr><th>Heure</th><th>Valeur</th><th>État</th></tr>`;
        items.sort((a,b)=>a.time.localeCompare(b.time)).forEach(x => {
          const etat = x.value>=38?"🔴 Fièvre":x.value>=37.5?"🟡 À surveiller":x.value>=36.5?"🟢 Normal":"🔵 Hypothermie";
          sections += `<tr><td>${fmtTime(x.time)}</td><td>${x.value}°C</td><td>${etat}</td></tr>`;
        });
        sections += `</table>`;
      });
    }

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
    <title>Rapport hebdomadaire — ${profile.name}</title>
    <style>${REPORT_CSS}</style></head>
    <body>
    <h1>📊 Rapport hebdomadaire — ${profile.name}</h1>
    <p><strong>Période :</strong> ${fmtFull(sevenDaysAgo)} → ${fmtFull(todayStr())} &nbsp;|&nbsp; <strong>Âge :</strong> ${babyAgeText(profile.birthDate)}</p>
    ${sections || "<p>Aucune donnée sur les 7 derniers jours.</p>"}
    <p class="footer">Généré le ${fmtFull(new Date().toISOString())} — Baby Tracker</p>
    </body></html>`;

    setPreviewHtml(html);
    setPreviewTitle("Rapport hebdomadaire");
  };

  // ─── Carnet de santé complet ────────────────────────────────────────────
  const exportHealthRecord = () => {
    const age = babyAgeText(profile.birthDate);
    const lastG = (data.growth||[]).sort((a,b)=>b.date.localeCompare(a.date))[0];
    const teethCount = Object.keys(data.teeth||{}).length;
    const foodCount  = Object.keys(data.foods||{}).filter(k=>data.foods[k]).length;
    const foodList   = Object.keys(data.foods||{}).filter(k=>data.foods[k]).join(", ");
    const teethList  = TEETH_MAP.filter(th=>data.teeth?.[th.id]).map(th=>`${th.name} (${fmt(data.teeth[th.id].date)})`).join(", ");
    const vaccinesDone = VACCINE_SCHEDULE.flatMap((p,pi)=>p.vaccines.map((v,vi)=>data.vaccines?.[`${pi}-${vi}`]?`${v} — ${fmt(data.vaccines[`${pi}-${vi}`])}`:"").filter(Boolean));
    const milestonesDone = Object.keys(data.milestonesChecked||{}).filter(k=>data.milestonesChecked[k]).map(k=>{const [m,i]=k.split("-");return (data.milestones||DEFAULT_MILESTONES)[m]?.[i]}).filter(Boolean);
    const appointments = (data.appointments||[]).map(a=>`${a.type} — ${fmtFull(a.date)} — ${a.title||""} ${a.doctor?`Dr.${a.doctor}`:""}`).join("<br/>");
    const growthTable  = (data.growth||[]).sort((a,b)=>a.date.localeCompare(b.date)).map(g=>`<tr><td>${fmtFull(g.date)}</td><td>${g.weight||"—"} kg</td><td>${g.height||"—"} cm</td><td>${g.head||"—"} cm</td></tr>`).join("");

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
    <title>Carnet de santé — ${profile.name}</title>
    <style>${REPORT_CSS}</style></head>
    <body><h1>👶 Carnet de santé — ${profile.name}</h1>
    <p><strong>Date de naissance :</strong> ${fmtFull(profile.birthDate)} &nbsp;|&nbsp; <strong>Âge :</strong> ${age} &nbsp;|&nbsp; <strong>Genre :</strong> ${profile.gender==="boy"?"Garçon":"Fille"}</p>
    <p><strong>Dernière mesure :</strong> ${lastG?`${lastG.weight||"?"} kg, ${lastG.height||"?"} cm, tête ${lastG.head||"?"} cm`:"Aucune"}</p>
    <h2>📏 Croissance</h2><table><tr><th>Date</th><th>Poids</th><th>Taille</th><th>Tête</th></tr>${growthTable}</table>
    <h2>🦷 Dents (${teethCount}/20)</h2><p>${teethList||"Aucune encore"}</p>
    <h2>🥕 Diversification (${foodCount} aliments)</h2><p>${foodList||"Pas encore commencé"}</p>
    <h2>💉 Vaccins</h2>${vaccinesDone.length?vaccinesDone.map(v=>`<div class="tag">${v}</div>`).join(""):"<p>Aucun enregistré</p>"}
    <h2>🏆 Étapes acquises</h2>${milestonesDone.length?milestonesDone.map(m=>`<div class="tag">✓ ${m}</div>`).join(""):"<p>Aucune cochée</p>"}
    <h2>📅 Rendez-vous</h2>${appointments||"<p>Aucun</p>"}
    <p class="footer">Généré le ${fmtFull(new Date().toISOString())} — Baby Tracker</p>
    </body></html>`;

    setPreviewHtml(html);
    setPreviewTitle("Carnet de santé");
  };

  const handlePrint = () => {
    if (!previewHtml) return;
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:0;height:0;border:none;';
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open(); doc.write(previewHtml); doc.close();
    setTimeout(() => {
      try { iframe.contentWindow.focus(); iframe.contentWindow.print(); }
      catch(e) {
        const blob = new Blob([previewHtml],{type:"text/html;charset=utf-8"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `rapport-${profile.name}-${todayStr()}.html`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      }
      setTimeout(() => document.body.removeChild(iframe), 2000);
    }, 500);
  };

  const requestNotifications = async () => {
    if (!("Notification" in window)) { alert("Les notifications ne sont pas supportées sur ce navigateur"); return; }
    const perm = await Notification.requestPermission();
    if (perm === "granted") {
      new Notification("Baby Tracker 🍼", {body:`Notifications activées pour ${profile.name} !`,icon:"👶"});
      alert("Notifications activées !");
    } else { alert("Notifications refusées. Vous pouvez les activer dans les paramètres du navigateur."); }
  };

  return (
    <div>
      <div style={{fontSize:22,fontWeight:900,marginBottom:20}}>⚙️ Paramètres</div>

      <Card style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <div><div style={{fontWeight:700,fontSize:14}}>🌙 Mode sombre</div><div style={{fontSize:12,color:t.textMuted}}>Reposant pour les yeux la nuit</div></div>
        <div onClick={()=>setDarkMode(!darkMode)} style={{width:52,height:28,borderRadius:14,background:darkMode?t.accent:t.cardBorder,cursor:"pointer",position:"relative",transition:"background .3s"}}>
          <div style={{width:22,height:22,borderRadius:11,background:"#fff",position:"absolute",top:3,left:darkMode?27:3,transition:"left .3s",boxShadow:"0 1px 3px rgba(0,0,0,.2)"}}/>
        </div>
      </Card>

      <Card onClick={exportDayReport} style={{marginBottom:10,cursor:"pointer"}}>
        <div style={{fontWeight:700,fontSize:14}}>📋 Rapport du jour</div>
        <div style={{fontSize:12,color:t.textMuted}}>Biberons, couches, sommeil, médicaments</div>
      </Card>

      <Card onClick={exportWeekReport} style={{marginBottom:10,cursor:"pointer"}}>
        <div style={{fontWeight:700,fontSize:14}}>📊 Rapport hebdomadaire</div>
        <div style={{fontSize:12,color:t.textMuted}}>7 derniers jours — regroupé par jour</div>
      </Card>

      <Card onClick={exportHealthRecord} style={{marginBottom:10,cursor:"pointer"}}>
        <div style={{fontWeight:700,fontSize:14}}>📄 Carnet de santé complet</div>
        <div style={{fontSize:12,color:t.textMuted}}>Croissance, vaccins, étapes, rendez-vous</div>
      </Card>

      <Card onClick={requestNotifications} style={{marginBottom:10,cursor:"pointer"}}>
        <div style={{fontWeight:700,fontSize:14}}>🔔 Activer les notifications</div>
        <div style={{fontSize:12,color:t.textMuted}}>Rappels RDV et vaccins</div>
      </Card>

      <Card onClick={onSwitchProfile} style={{marginBottom:10,cursor:"pointer"}}>
        <div style={{fontWeight:700,fontSize:14}}>👶 Changer de profil</div>
        <div style={{fontSize:12,color:t.textMuted}}>Revenir à la sélection des bébés</div>
      </Card>

      <Card style={{marginTop:20,textAlign:"center"}}>
        <div style={{fontSize:13,color:t.textMuted,fontWeight:600}}>Baby Tracker v2.0</div>
        <div style={{fontSize:11,color:t.textMuted,marginTop:4}}>Fait avec ❤️ pour {profile.name}</div>
      </Card>

      <Modal open={!!previewHtml} onClose={() => setPreviewHtml(null)} title={previewTitle}>
        <div style={{maxHeight:"55vh",overflowY:"auto",background:"#fff",color:"#333",padding:16,borderRadius:12,marginBottom:16,border:"1px solid #E5E7EB",fontSize:13,lineHeight:1.6}}
          dangerouslySetInnerHTML={{__html: previewHtml}}/>
        <div style={{display:"flex",gap:10}}>
          <Btn variant="secondary" onClick={() => setPreviewHtml(null)} style={{flex:1}}>Fermer</Btn>
          <Btn onClick={handlePrint} style={{flex:2}}>🖨️ Imprimer / PDF</Btn>
        </div>
      </Modal>
    </div>
  );
};

export default SettingsSection;
