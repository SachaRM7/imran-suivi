const SyncBadge = ({syncing}) => (
  <div style={{position:"fixed",top:12,right:56,zIndex:999,display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:20,background:syncing?"#FEF3C7":"#ECFDF5",fontSize:11,fontWeight:700,color:syncing?"#D97706":"#059669",animation:syncing?"syncPulse 1s infinite":"none"}}>
    <span style={{width:6,height:6,borderRadius:"50%",background:syncing?"#F59E0B":"#10B981"}}/>{syncing?"Sync...":"Sync ✓"}
  </div>
);

export default SyncBadge;
