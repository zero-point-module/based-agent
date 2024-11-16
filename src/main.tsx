import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './styles/main.css';
import '@coinbase/onchainkit/styles.css';

import App from './App.tsx';
import Layout from './components/layout.tsx';
import Providers from './config/providers.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <Layout>
        <App />
      </Layout>
    </Providers>
  </StrictMode>
);
