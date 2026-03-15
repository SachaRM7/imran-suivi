import { useTheme } from '../../theme/Theme';

const Chip = ({children,active,onClick,color="#A78BFA"}) => {
  const t = useTheme();
  return (<span onClick={onClick} style={{display:"inline-flex",alignItems:"center",padding:"7px 14px",borderRadius:20,fontSize:13,fontWeight:700,cursor:onClick?"pointer":"default",background:active?color:t.chipBg,color:active?"#fff":t.textSoft,border:active?"none":`1.5px solid ${t.chipBorder}`,transition:"all .2s",whiteSpace:"nowrap"}}>{children}</span>);
};

export default Chip;
