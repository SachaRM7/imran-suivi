import { useTheme } from '../../theme/Theme';

const Input = ({label,...props}) => {
  const t = useTheme();
  return (
    <div style={{marginBottom:14}}>
      {label&&<label style={{display:"block",fontSize:12,fontWeight:700,color:t.textSoft,marginBottom:5,textTransform:"uppercase",letterSpacing:.5}}>{label}</label>}
      <input {...props} style={{width:"100%",padding:"11px 14px",borderRadius:14,border:`2px solid ${t.inputBorder}`,fontSize:15,outline:"none",boxSizing:"border-box",background:t.card,color:t.text,transition:"border-color .2s",...props.style}}
        onFocus={e=>{e.target.style.borderColor=t.accent;}} onBlur={e=>{e.target.style.borderColor=t.inputBorder;}}/>
    </div>
  );
};

export default Input;
