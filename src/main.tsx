import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/preview.css';
import './styles/app.css';
import App from './App.tsx';
import BookPrototype from './prototype/BookPrototype.tsx';
import { StoreProvider } from './lib/store';

// #book opens the isolated storybook prototype; everything else is the live app.
function Root() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const on = () => setHash(window.location.hash);
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);

  if (hash === '#book') return <BookPrototype />;
  return (
    <StoreProvider>
      <App />
    </StoreProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
