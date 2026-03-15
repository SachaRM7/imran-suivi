import { useTheme } from '../../theme/Theme';

const IconBtn = ({onClick,children}) => {
  const t = useTheme();
  return (<span onClick={onClick} style={{cursor:"pointer",color:t.textMuted,display:"inline-flex",padding:4,borderRadius:8,transition:"color .15s",fontSize:14}}
    onMouseEnter={e=>e.currentTarget.style.color=t.danger} onMouseLeave={e=>e.currentTarget.style.color=t.textMuted}>{children}</span>);
};

export default IconBtn;
