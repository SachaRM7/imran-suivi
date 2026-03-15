import { useTheme } from '../../theme/Theme';

const Empty = ({emoji,text}) => {
  const t = useTheme();
  return (<div style={{textAlign:"center",padding:"40px 20px",color:t.textMuted}}><div style={{fontSize:40,marginBottom:8}}>{emoji}</div><div style={{fontSize:14,fontWeight:600}}>{text}</div></div>);
};

export default Empty;
