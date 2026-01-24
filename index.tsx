import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { AppProvider } from './context/AppContext';

/**
 * Punto de entrada de la aplicación.
 * Se ha eliminado la importación de index.css ya que el proyecto utiliza Tailwind vía CDN e inline styles en index.html.
 */
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <AppProvider>
        <App />
      </AppProvider>
    </React.StrictMode>
  );
} else {
  console.error("Error crítico: No se encontró el elemento #root en el DOM.");
}