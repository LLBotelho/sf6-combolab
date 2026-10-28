import { NavLink, Route, Routes } from 'react-router-dom';
import { BookOpen, UserRound, Settings2, X, AlertTriangle, Star } from 'lucide-react';
import { useCollection } from './hooks/useCollection';
import { HomePage } from './pages/HomePage';
import { FavoritesPage } from './pages/FavoritesPage';
import { FighterPage } from './pages/FighterPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  const { data, warning, dismissWarning } = useCollection();
  return <div className="app-shell">
    <header className="site-header"><div className="header-inner">
      <NavLink to="/" className="site-logo"><span className="logo-icon"><img src="/assets/sf6-logo.svg" alt="" aria-hidden="true" /></span><span className="logo-copy"><strong>COMBO<span>LAB</span></strong></span></NavLink>
      <nav className="main-nav" aria-label="Navegação principal"><NavLink to="/" end className={({isActive}) => isActive ? 'nav-active' : ''}><UserRound size={16}/> PERSONAGENS</NavLink><NavLink to="/mains" className={({isActive}) => isActive ? 'nav-active' : ''}><Star size={17}/> MEUS FAVORITOS <span className="nav-count">{data.mains.length}</span></NavLink><NavLink to="/settings" className={({isActive}) => isActive ? 'nav-active' : ''}><Settings2 size={16}/> CONFIGURAÇÕES</NavLink></nav>
      <div className="header-status"><span className="header-status-dot"/> LOCAL MODE <span className="status-version">/ v0.1</span></div>
    </div></header>
    {warning && <div role="alert" className="warning-banner"><AlertTriangle size={17}/><span>{warning}</span><button onClick={dismissWarning} aria-label="Fechar aviso"><X size={18}/></button></div>}
    <Routes><Route path="/" element={<HomePage/>}/><Route path="/mains" element={<FavoritesPage/>}/><Route path="/fighter/:characterId" element={<FighterPage/>}/><Route path="/settings" element={<SettingsPage/>}/><Route path="*" element={<HomePage/>}/></Routes>
    <footer className="site-footer"><div className="footer-inner"><div className="footer-brand"><Star size={17}/> BUILT FOR THE GRIND. <span>MADE FOR THE FIGHT.</span></div><div className="footer-links"><span><BookOpen size={14}/> FAN PROJECT / NÃO OFICIAL</span><span>SEM AFILIAÇÃO COM A CAPCOM</span></div></div></footer>
  </div>;
}
