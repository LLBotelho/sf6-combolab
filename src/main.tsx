import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { CollectionProvider } from './hooks/useCollection';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { LoginPage } from './pages/LoginPage';
import App from './App';
import './styles.css';

function AuthenticatedApp() {
  const { user, loading } = useAuth();
  if (loading) return <main className="cloud-loading">CONECTANDO À ARENA...</main>;
  if (!user) return <LoginPage/>;
  return <CollectionProvider key={user.id}><App/></CollectionProvider>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><HashRouter><AuthProvider><AuthenticatedApp/></AuthProvider></HashRouter></React.StrictMode>,
);
