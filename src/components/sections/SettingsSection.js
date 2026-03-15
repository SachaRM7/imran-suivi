import React from "react";
import { useTheme } from "../../theme/Theme";
import { Card } from "../ui";
import { babyAgeText, fmtFull, fmt } from "../../utils/helpers";
import { TEETH_MAP, VACCINE_SCHEDULE, DEFAULT_MILESTONES } from "../../constants";

const SettingsSection = ({data,profile,darkMode,setDarkMode,onSwitchProfile}) => {
  const t=useTheme();

  const exportPDF = () => {
    // Generate a printable HTML and trigger print
    const age = babyAgeText(profile.birthDate);
    const lastG = (data.growth||[]).sort((a,b)=>b.date.localeCompare(a.date))[0];
    const teethCount = Object.keys(data.teeth||{}).length;
    const foodCount = Object.keys(data.foods||{}).filter(k=>data.foods[k]).length;
    const foodList = Object.keys(data.foods||{}).filter(k=>data.foods[k]).join(", ");
    const teethList = TEETH_MAP.filter(th=>data.teeth?.[th.id]).map(th=>`${th.name} (${fmt(data.teeth[th.id].date)})`).join(", ");
    const vaccinesDone = VACCINE_SCHEDULE.flatMap((p,pi)=>p.vaccines.map((v,vi)=>data.vaccines?.[`${pi}-${vi}`]?`${v} — ${fmt(data.vaccines[`${pi}-${vi}`])}`:"").filter(Boolean));
    const milestonesDone = Object.keys(data.milestonesChecked||{}).filter(k=>data.milestonesChecked[k]).map(k=>{const [m,i]=k.split("-");return (data.milestones||DEFAULT_MILESTONES)[m]?.[i]}).filter(Boolean);
    const appointments = (data.appointments||[]).map(a=>`${a.type} — ${fmtFull(a.date)} — ${a.title||""} ${a.doctor?`Dr.${a.doctor}`:""}`).join("<br/>");
    const growthTable = (data.growth||[]).sort((a,b)=>a.date.localeCompare(b.date)).map(g=>`<tr><td>${fmtFull(g.date)}</td><td>${g.weight||"—"} kg</td><td>${g.height||"—"} cm</td><td>${g.head||"—"} cm</td></tr>`).join("");

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Carnet de santé — ${profile.name}</title>
    <style>body{font-family:Arial,sans-serif;max-width:700px;margin:40px auto;color:#333;line-height:1.6}h1{color:#7C3AED;border-bottom:3px solid #7C3AED;padding-bottom:8px}h2{color:#7C3AED;margin-top:24px}table{width:100%;border-collapse:collapse;margin:8px 0}td,th{border:1px solid #ddd;padding:6px 10px;font-size:13px}th{background:#f5f3ff}.tag{display:inline-block;background:#f5f3ff;padding:2px 8px;border-radius:8px;margin:2px;font-size:12px}@media print{body{margin:20px}}</style></head>
    <body><h1>👶 Carnet de santé — ${profile.name}</h1>
    <p><strong>Date de naissance :</strong> ${fmtFull(profile.birthDate)} &nbsp;|&nbsp; <strong>Âge :</strong> ${age} &nbsp;|&nbsp; <strong>Genre :</strong> ${profile.gender==="boy"?"Garçon":"Fille"}</p>
    <p><strong>Dernière mesure :</strong> ${lastG?`${lastG.weight||"?"} kg, ${lastG.height||"?"} cm, tête ${lastG.head||"?"} cm`:"Aucune"}</p>
    <h2>📏 Croissance</h2><table><tr><th>Date</th><th>Poids</th><th>Taille</th><th>Tête</th></tr>${growthTable}</table>
    <h2>🦷 Dents (${teethCount}/20)</h2><p>${teethList||"Aucune encore"}</p>
    <h2>🥕 Diversification (${foodCount} aliments)</h2><p>${foodList||"Pas encore commencé"}</p>
    <h2>💉 Vaccins</h2>${vaccinesDone.length?vaccinesDone.map(v=>`<div class="tag">${v}</div>`).join(""):"<p>Aucun enregistré</p>"}
    <h2>🏆 Étapes acquises</h2>${milestonesDone.length?milestonesDone.map(m=>`<div class="tag">✓ ${m}</div>`).join(""):"<p>Aucune cochée</p>"}
    <h2>📅 Rendez-vous</h2>${appointments||"<p>Aucun</p>"}
    <hr style="margin-top:30px"><p style="font-size:11px;color:#999">Généré le ${fmtFull(new Date().toISOString())} — Baby Tracker</p>
    </body></html>`;

    const w = window.open("","_blank");
    w.document.write(html);
    w.document.close();
    setTimeout(()=>w.print(), 500);
  };

  const requestNotifications = async () => {
    if (!("Notification" in window)) { alert("Les notifications ne sont pas supportées sur ce navigateur"); return; }
    const perm = await Notification.requestPermission();
    if (perm === "granted") {
      new Notification("Baby Tracker 🍼", { body: `Notifications activées pour ${profile.name} !`, icon: "👶" });
      alert("Notifications activées !");
    } else {
      alert("Notifications refusées. Vous pouvez les activer dans les paramètres du navigateur.");
    }
  };

  return (
    <div>
      <div style={{fontSize:22,fontWeight:900,marginBottom:20}}>⚙️ Paramètres</div>

      {/* Dark mode */}
      <Card style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <div><div style={{fontWeight:700,fontSize:14}}>🌙 Mode sombre</div><div style={{fontSize:12,color:t.textMuted}}>Reposant pour les yeux la nuit</div></div>
        <div onClick={()=>setDarkMode(!darkMode)} style={{width:52,height:28,borderRadius:14,background:darkMode?t.accent:t.cardBorder,cursor:"pointer",position:"relative",transition:"background .3s"}}>
          <div style={{width:22,height:22,borderRadius:11,background:"#fff",position:"absolute",top:3,left:darkMode?27:3,transition:"left .3s",boxShadow:"0 1px 3px rgba(0,0,0,.2)"}}/>
        </div>
      </Card>

      {/* PDF export */}
      <Card onClick={exportPDF} style={{marginBottom:10,cursor:"pointer"}}>
        <div style={{fontWeight:700,fontSize:14}}>📄 Exporter en PDF</div>
        <div style={{fontSize:12,color:t.textMuted}}>Générer le carnet de santé complet</div>
      </Card>

      {/* Notifications */}
      <Card onClick={requestNotifications} style={{marginBottom:10,cursor:"pointer"}}>
        <div style={{fontWeight:700,fontSize:14}}>🔔 Activer les notifications</div>
        <div style={{fontSize:12,color:t.textMuted}}>Rappels RDV et vaccins</div>
      </Card>

      {/* Switch profile */}
      <Card onClick={onSwitchProfile} style={{marginBottom:10,cursor:"pointer"}}>
        <div style={{fontWeight:700,fontSize:14}}>👶 Changer de profil</div>
        <div style={{fontSize:12,color:t.textMuted}}>Revenir à la sélection des bébés</div>
      </Card>

      {/* Info */}
      <Card style={{marginTop:20,textAlign:"center"}}>
        <div style={{fontSize:13,color:t.textMuted,fontWeight:600}}>Baby Tracker v2.0</div>
        <div style={{fontSize:11,color:t.textMuted,marginTop:4}}>Fait avec ❤️ pour {profile.name}</div>
      </Card>
    </div>
  );
};

export default SettingsSection;
