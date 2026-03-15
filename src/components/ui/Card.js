import { useTheme } from '../../theme/Theme';

const Card = ({children,onClick,highlighted,style:s}) => {
  const t = useTheme();
  return (<div onClick={onClick} style={{background:t.card,borderRadius:18,padding:"14px 16px",boxShadow:t.shadow,border:highlighted?`2px solid ${t.accent}`:`1.5px solid ${t.cardBorder}`,transition:"transform .15s",cursor:onClick?"pointer":"default",...(s||{})}}
    onMouseEnter={e=>onClick&&(e.currentTarget.style.transform="translateY(-1px)")} onMouseLeave={e=>onClick&&(e.currentTarget.style.transform="")}>{children}</div>);
};

export default Card;
