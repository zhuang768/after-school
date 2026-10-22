import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './ui/App';
import { WorkspaceProvider } from './ui/state';
import './styles.css';

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <WorkspaceProvider>
        <App />
      </WorkspaceProvider>
    </StrictMode>,
  );
}

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  void navigator.serviceWorker.register('/sw.js').catch(() => {
    const node = document.getElementById('sw-status');
    if (node) node.textContent = 'Offline copy could not be installed in this browser.';
  });
}
