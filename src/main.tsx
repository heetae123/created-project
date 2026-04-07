import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// ── Chunk load failure guard ──────────────────────────────
// After a new deployment, old hashed chunk URLs no longer exist.
// Detect the error and reload once — the fresh index.html will
// reference the new chunk URLs and everything works again.
// sessionStorage prevents an infinite reload loop.
function handleChunkError(reason: unknown) {
  const msg = (reason as any)?.message ?? String(reason);
  const isChunk =
    (reason as any)?.name === 'ChunkLoadError' ||
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('Importing a module script failed') ||
    msg.includes('Unable to preload CSS');

  if (!isChunk) return;

  const KEY = '__chunk_reload';
  const last = Number(sessionStorage.getItem(KEY) ?? 0);
  if (Date.now() - last > 15_000) {
    sessionStorage.setItem(KEY, String(Date.now()));
    window.location.reload();
  }
}

window.addEventListener('error', e => handleChunkError(e.error));
window.addEventListener('unhandledrejection', e => handleChunkError(e.reason));
// ─────────────────────────────────────────────────────────

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
