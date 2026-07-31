import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { RouterProvider } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import { router } from './router/index.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <RouterProvider 
          router={router} 
          future={{ 
            v7_startTransition: true, 
          }} 
        />
      </ErrorBoundary>
    </HelmetProvider>
  </StrictMode>,
);
