import { useTheme } from '../../theme/Theme';

const Modal = ({open,onClose,title,children}) => {
  const t = useTheme();
  if(!open) return null;
  return (
    <div style={{position:"fixed",inset:0,zIndex:1000,background:t.modalBg,backdropFilter:"blur(6px)",display:"flex",alignItems:"flex-end",justifyContent:"center",animation:"fadeIn .2s"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:t.modalCard,borderRadius:"24px 24px 0 0",width:"100%",maxWidth:500,maxHeight:"88vh",overflow:"auto",padding:"20px 20px 36px",boxShadow:"0 -10px 50px rgba(0,0,0,.2)",animation:"slideUp .3s cubic-bezier(.16,1,.3,1)"}}>
        <div style={{width:36,height:4,background:t.textMuted,borderRadius:4,margin:"0 auto 18px",opacity:.4}}/>
        {title&&<h3 style={{margin:"0 0 18px",fontSize:19,fontWeight:800,color:t.text}}>{title}</h3>}
        {children}
      </div>
    </div>
  );
};

export default Modal;
