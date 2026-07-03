import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.css';
import { App } from './App';
import { PortalProvider } from './store/PortalContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PortalProvider>
      <App />
    </PortalProvider>
  </StrictMode>,
);
