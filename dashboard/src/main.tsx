import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { KundenProvider } from './context/KundenContext';
import './index.css';

// Theme vor dem ersten Render anwenden — verhindert Flackern.
if (localStorage.getItem('theme') === 'light') {
  document.documentElement.classList.add('light');
}

// Einstiegspunkt: Router + Auth- und Kunden-Kontext umschließen die gesamte App.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <KundenProvider>
          <App />
        </KundenProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
