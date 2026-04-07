const fs = require('fs-extra');
const path = require('path');

async function finalizeBuild() {
  const outDir = path.join(__dirname, 'out');
  const distDir = path.join(__dirname, 'dist');
  const adminDest = path.join(outDir, 'admin');

  console.log('Finalizing build: Merging Vite admin into Next.js out...');

  try {
    // 1. Ensure out/admin directory exists
    await fs.ensureDir(adminDest);

    // 2. Copy Vite build (dist) to out/admin
    // Note: Vite should be built with base: '/admin/' if we want it to work here
    await fs.copy(distDir, adminDest);

    console.log('Build finalized successfully! "out" folder is ready for Firebase Hosting.');
  } catch (err) {
    console.error('Error during finalize-build:', err);
    process.exit(1);
  }
}

finalizeBuild();
