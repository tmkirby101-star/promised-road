import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/preview.css';
import './styles/app.css';
import App from './App.tsx';
import { StoreProvider } from './lib/store';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </StrictMode>,
);
