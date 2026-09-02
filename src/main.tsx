import {
  StrictMode,
} from 'react';

import {
  createRoot,
} from 'react-dom/client';

import App from './App.tsx';

import PublicGuideBot from './components/PublicGuideBot.tsx';

import './index.css';


createRoot(
  document.getElementById(
    'root'
  )!
).render(
  <StrictMode>
    <App />
    <PublicGuideBot />
  </StrictMode>,
);
