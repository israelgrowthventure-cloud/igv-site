import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { PlasmicRootProvider } from '@plasmicapp/loader-react';
import { PLASMIC } from './plasmic-init';

// Build version: 0.1.4 - Deploy timestamp: 2025-12-02T16:40:00Z
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <PlasmicRootProvider loader={PLASMIC}>
      <App />
    </PlasmicRootProvider>
  </React.StrictMode>
);
