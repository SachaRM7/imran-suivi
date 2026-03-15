import { createContext, useContext } from "react";

export const ThemeCtx = createContext();
export const useTheme = () => useContext(ThemeCtx);

export const LIGHT = {
  bg: "#FAFAF9", card: "#fff", cardBorder: "#F3F4F6", text: "#1F2937", textSoft: "#6B7280",
  textMuted: "#9CA3AF", accent: "#7C3AED", accentLight: "#F5F3FF", accentGrad: "linear-gradient(135deg, #A78BFA 0%, #818CF8 100%)",
  inputBorder: "#E5E7EB", shadow: "0 1px 3px rgba(0,0,0,0.04)", navBg: "#fff", navBorder: "#F3F4F6",
  heroGrad: "linear-gradient(135deg, #C4B5FD 0%, #A78BFA 35%, #818CF8 70%, #6366F1 100%)",
  modalBg: "rgba(0,0,0,0.4)", modalCard: "#fff", chipBg: "#F9FAFB", chipBorder: "#E5E7EB",
  success: "#10B981", successBg: "#ECFDF5", danger: "#EF4444", dangerBg: "#FEF2F2", warn: "#F59E0B", warnBg: "#FFFBEB",
};
export const DARK = {
  bg: "#0F0F14", card: "#1A1A24", cardBorder: "#2A2A36", text: "#E5E5EC", textSoft: "#9A9AB0",
  textMuted: "#6B6B80", accent: "#A78BFA", accentLight: "#1E1B2E", accentGrad: "linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)",
  inputBorder: "#2A2A36", shadow: "0 1px 3px rgba(0,0,0,0.2)", navBg: "#15151E", navBorder: "#2A2A36",
  heroGrad: "linear-gradient(135deg, #2D1B69 0%, #1E1B4B 50%, #1A1A2E 100%)",
  modalBg: "rgba(0,0,0,0.7)", modalCard: "#1A1A24", chipBg: "#1E1E28", chipBorder: "#2A2A36",
  success: "#34D399", successBg: "#0D2818", danger: "#F87171", dangerBg: "#2D1215", warn: "#FBBF24", warnBg: "#2D2305",
};

export const makeCSS = (t) => `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
body{font-family:'Nunito',sans-serif;background:${t.bg};color:${t.text};-webkit-font-smoothing:antialiased;overscroll-behavior:none;transition:background .3s,color .3s;}
input,textarea,select{font-family:'Nunito',sans-serif;color:${t.text};background:${t.card};}
@keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
@keyframes syncPulse{0%,100%{opacity:1}50%{opacity:.4}}
@keyframes profileHover{0%{transform:scale(1)}50%{transform:scale(1.05)}100%{transform:scale(1)}}
::-webkit-scrollbar{width:3px;height:3px}
::-webkit-scrollbar-thumb{background:${t.textMuted};border-radius:3px}
`;
