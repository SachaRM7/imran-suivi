import { useTheme } from '../../theme/Theme';

const Btn = ({children,variant="primary",small,full,...props}) => {
  const t = useTheme();
  const styles = {
    primary:{background:t.accentGrad,color:"#fff",boxShadow:"0 4px 14px rgba(129,140,248,.3)"},
    secondary:{background:t.accentLight,color:t.accent,boxShadow:"none"},
    danger:{background:t.dangerBg,color:t.danger,boxShadow:"none"},
    success:{background:t.successBg,color:t.success,boxShadow:"none"},
    ghost:{background:"transparent",color:t.accent,boxShadow:"none"},
  };
  return (
    <button {...props} style={{...styles[variant],border:"none",borderRadius:14,padding:small?"8px 14px":"12px 20px",fontSize:small?13:15,fontWeight:700,cursor:"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6,transition:"transform .1s",width:full?"100%":"auto",...props.style}}
      onMouseDown={e=>e.currentTarget.style.transform="scale(.97)"} onMouseUp={e=>e.currentTarget.style.transform="scale(1)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}
    >{children}</button>
  );
};

export default Btn;
