import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { CollectionProvider } from './hooks/useCollection';
import App from './App';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><HashRouter><CollectionProvider><App/></CollectionProvider></HashRouter></React.StrictMode>,
);
