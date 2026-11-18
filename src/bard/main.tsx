import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource-variable/cormorant-garamond';
import '@fontsource-variable/manrope';
import './styles/tokens.css';
import './styles/global.css';
import { BardShowcase } from './BardShowcase';
import './styles/showcase.css';
import './styles/dark.css';

document.documentElement.classList.add('bard-document');
document.body.classList.add('bard-body');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BardShowcase />
  </React.StrictMode>,
);
