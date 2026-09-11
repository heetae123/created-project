import { appendFile } from 'node:fs/promises';
import { createContentManifest } from './content-manifest-lib.mjs';

const LIVE_MANIFEST_URL = 'https://maiptns.com/content-version.json';
const current = await createContentManifest();
let deployed = null;

try {
  const response = await fetch(`${LIVE_MANIFEST_URL}?t=${Date.now()}`, { cache: 'no-store' });
  if (response.ok) deployed = await response.json();
} catch {
  // 배포본을 확인할 수 없으면 안전하게 다시 배포한다.
}

const changed = !deployed || deployed.version !== current.version;
console.log(changed
  ? `콘텐츠 변경 감지: ${deployed?.version || '배포 버전 없음'} -> ${current.version}`
  : `콘텐츠 변경 없음: ${current.version}`);

if (process.env.GITHUB_OUTPUT) {
  await appendFile(process.env.GITHUB_OUTPUT, `changed=${changed}\n`, 'utf8');
}
