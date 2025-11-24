import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { PlasmicRootProvider } from '@plasmicapp/loader-react';
import { PLASMIC } from './plasmic-init';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <PlasmicRootProvider loader={PLASMIC}>
      <App />
    </PlasmicRootProvider>
  </React.StrictMode>
);
