import React, { useState, useEffect, useCallback, useRef } from "react";
import { subscribeToProfiles, createProfile, deleteProfile, subscribeToData, saveData } from "./firebase";
import { ThemeCtx, LIGHT, DARK, makeCSS } from './theme/Theme';
import { todayStr, defaultState } from './utils/helpers';
import { SyncBadge } from './components/ui';
import ProfileSelector from './components/ProfileSelector';
import { DashboardHome, BottlesSection, DiapersSection, SleepSection, FoodSection, RecipesSection, GrowthSection, MilestonesSection, TeethSection, AppointmentsSection, VaccinesSection, MedicinesSection, TemperatureSection, BathsSection, NotesSection, SettingsSection, RoutinesSection, ExercisesSection, BooksSection } from './components/sections';

/* ═══════════════════════════════════════════════════════
   BABY TRACKER & DEVELOPMENT DASHBOARD v2
   Multi-profil · Dark mode · Courbes OMS · Photos · PDF
   ═══════════════════════════════════════════════════════ */

// ═══════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════
export default function App() {
  const [profiles, setProfiles] = useState({});
  const [activeProfileId, setActiveProfileId] = useState(null);
  const [data, setData] = useState(null);
  const [section, setSection] = useState("home");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem("baby-tracker-dark") === "true"; } catch { return false; }
  });
  const saveTimer = useRef(null);
  const ignoreNext = useRef(false);

  const theme = darkMode ? DARK : LIGHT;

  // Save dark mode pref
  useEffect(() => { try { localStorage.setItem("baby-tracker-dark", darkMode); } catch {} }, [darkMode]);

  // Subscribe to profiles
  useEffect(() => {
    const unsub = subscribeToProfiles((p) => { setProfiles(p); setLoading(false); });
    return unsub;
  }, []);

  // Subscribe to active profile data
  useEffect(() => {
    if (!activeProfileId) return;
    setData(null);
    const unsub = subscribeToData(activeProfileId, (val) => {
      if (ignoreNext.current) { ignoreNext.current = false; return; }
      setData(val || defaultState());
      setSyncing(false);
    });
    return unsub;
  }, [activeProfileId]);

  const update = useCallback((fn) => {
    if (!activeProfileId) return;
    setData(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      fn(next);
      next._lastUpdated = new Date().toISOString();
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        setSyncing(true);
        ignoreNext.current = true;
        saveData(activeProfileId, next).then(() => setSyncing(false));
      }, 600);
      return next;
    });
  }, [activeProfileId]);

  const handleCreateProfile = async (info) => {
    const id = await createProfile(info);
    const initial = defaultState();
    initial._lastUpdated = new Date().toISOString();
    await saveData(id, initial);
    setActiveProfileId(id);
    setSection("home");
  };

  const handleDeleteProfile = async (id) => {
    await deleteProfile(id);
    if (activeProfileId === id) { setActiveProfileId(null); setData(null); }
  };

  const handleSwitchProfile = () => { setActiveProfileId(null); setData(null); setSection("home"); };

  // ─── Notification scheduler ───
  useEffect(() => {
    if (!data || !activeProfileId || !("Notification" in window) || Notification.permission !== "granted") return;
    const profile = profiles[activeProfileId];
    if (!profile) return;
    const todayAppts = (data.appointments || []).filter(a => a.date === todayStr());
    todayAppts.forEach(a => {
      const now = new Date();
      const apptTime = new Date(`${a.date}T${a.time}`);
      const diff = apptTime - now;
      if (diff > 0 && diff < 3600000) {
        setTimeout(() => {
          new Notification(`📅 RDV pour ${profile.name}`, { body: `${a.title || a.type} à ${a.time}${a.doctor ? ` — Dr. ${a.doctor}` : ""}` });
        }, Math.max(diff - 900000, 0));
      }
    });
  }, [data, activeProfileId, profiles]);

  // ─── Rendering ───
  if (loading) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#0F0F14"}}>
      <div style={{textAlign:"center"}}><div style={{fontSize:52,marginBottom:12,animation:"pulse 1.5s infinite"}}>👶</div><div style={{color:"#A78BFA",fontWeight:800,fontSize:15,fontFamily:"'Nunito',sans-serif"}}>Chargement...</div></div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=swap');@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}`}</style>
    </div>
  );

  if (!activeProfileId) return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');*{margin:0;padding:0;box-sizing:border-box;font-family:'Nunito',sans-serif;-webkit-tap-highlight-color:transparent}`}</style>
      <ProfileSelector profiles={profiles} onSelect={id=>setActiveProfileId(id)} onAdd={handleCreateProfile} onDelete={handleDeleteProfile} />
    </>
  );

  if (!data) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:theme.bg}}>
      <style>{makeCSS(theme)}</style>
      <div style={{textAlign:"center"}}><div style={{fontSize:40,animation:"pulse 1.5s infinite"}}>👶</div><div style={{color:theme.accent,fontWeight:800,marginTop:8}}>Chargement...</div></div>
    </div>
  );

  const profile = profiles[activeProfileId] || {};

  const SECTIONS = {
    home: <DashboardHome data={data} profile={profile} goTo={setSection} onSwitchProfile={handleSwitchProfile} />,
    bottles: <BottlesSection data={data} update={update} />,
    diapers: <DiapersSection data={data} update={update} />,
    sleep: <SleepSection data={data} update={update} />,
    food: <FoodSection data={data} update={update} />,
    recipes: <RecipesSection data={data} update={update} />,
    routines: <RoutinesSection data={data} update={update} />,
    exercises: <ExercisesSection data={data} update={update} profile={profile} />,
    books: <BooksSection data={data} update={update} />,
    growth: <GrowthSection data={data} update={update} profile={profile} />,
    milestones: <MilestonesSection data={data} update={update} profile={profile} />,
    teeth: <TeethSection data={data} update={update} />,
    appointments: <AppointmentsSection data={data} update={update} />,
    vaccines: <VaccinesSection data={data} update={update} />,
    medicines: <MedicinesSection data={data} update={update} />,
    temperature: <TemperatureSection data={data} update={update} />,
    baths: <BathsSection data={data} update={update} />,
    notes: <NotesSection data={data} update={update} profileId={activeProfileId} />,
    settings: <SettingsSection data={data} profile={profile} darkMode={darkMode} setDarkMode={setDarkMode} onSwitchProfile={handleSwitchProfile} />,
  };

  const navItems = [
    {key:"home",emoji:"🏠",label:"Accueil"},
    {key:"bottles",emoji:"🍼",label:"Biberons"},
    {key:"food",emoji:"🥕",label:"Aliments"},
    {key:"milestones",emoji:"🏆",label:"Étapes"},
    {key:"notes",emoji:"📝",label:"Journal"},
  ];

  return (
    <ThemeCtx.Provider value={theme}>
      <style>{makeCSS(theme)}</style>
      <SyncBadge syncing={syncing} />
      <div onClick={()=>setDarkMode(!darkMode)} style={{position:"fixed",top:12,right:12,zIndex:999,cursor:"pointer",fontSize:18,background:theme.card,width:32,height:32,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:theme.shadow,border:`1px solid ${theme.cardBorder}`}}>
        {darkMode?"☀️":"🌙"}
      </div>
      <div style={{maxWidth:500,margin:"0 auto",minHeight:"100vh",background:theme.bg,paddingBottom:80,transition:"background .3s"}}>
        {section!=="home"&&(
          <div style={{display:"flex",alignItems:"center",padding:"14px 16px",gap:10,background:theme.bg,position:"sticky",top:0,zIndex:100}}>
            <span onClick={()=>setSection("home")} style={{cursor:"pointer",color:theme.accent,fontSize:20,fontWeight:900}}>‹</span>
            <span style={{fontWeight:800,fontSize:15,color:theme.text}}>{profile.name}</span>
          </div>
        )}
        <div style={{padding:"0 14px"}}>{SECTIONS[section]||<DashboardHome data={data} profile={profile} goTo={setSection} onSwitchProfile={handleSwitchProfile}/>}</div>
        <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:500,background:theme.navBg,borderTop:`1.5px solid ${theme.navBorder}`,display:"flex",justifyContent:"space-around",padding:"8px 0 20px",zIndex:200}}>
          {navItems.map(n=>(
            <div key={n.key} onClick={()=>setSection(n.key)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:1,cursor:"pointer",color:section===n.key?theme.accent:theme.textMuted,transition:"color .2s",padding:"4px 8px"}}>
              <span style={{fontSize:24,transition:"transform .15s",transform:section===n.key?"scale(1.15)":"scale(1)"}}>{n.emoji}</span>
              <span style={{fontSize:11,fontWeight:800}}>{n.label}</span>
            </div>
          ))}
        </div>
      </div>
    </ThemeCtx.Provider>
  );
}
