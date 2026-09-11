import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { createContentManifest } from './content-manifest-lib.mjs';

const outputPath = resolve(process.argv[2] || 'out/content-version.json');
const manifest = await createContentManifest();

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`콘텐츠 버전 생성: ${manifest.version} (포트폴리오 ${manifest.counts.portfolio}, 게시판 ${manifest.counts.board})`);
