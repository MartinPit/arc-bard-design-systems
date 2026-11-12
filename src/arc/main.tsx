import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/fraunces';
import '@fontsource-variable/inter';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/ibm-plex-mono/600.css';
import './tokens.css';
import './arc.css';
import { ArcShowcase } from './ArcShowcase';

document.documentElement.classList.add('arc-document');
document.body.classList.add('arc-body');

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ArcShowcase />
  </React.StrictMode>,
);
