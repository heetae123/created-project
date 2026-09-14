import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const outDir = join(process.cwd(), 'out');
const sitemapXml = await readFile(join(outDir, 'sitemap.xml'), 'utf8');
const urls = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1].replace(/&amp;/g, '&'));
const imageEntries = [...sitemapXml.matchAll(/<image:loc>(.*?)<\/image:loc>/g)].length;

async function htmlForUrl(url) {
  const pathname = decodeURIComponent(new URL(url).pathname).replace(/^\//, '');
  const candidates = pathname
    ? [join(outDir, `${pathname}.html`), join(outDir, pathname, 'index.html')]
    : [join(outDir, 'index.html')];

  for (const candidate of candidates) {
    try {
      await access(candidate);
      return readFile(candidate, 'utf8');
    } catch {
      // 다음 정적 출력 경로 형식을 확인한다.
    }
  }
  throw new Error(`정적 HTML 없음: ${url}`);
}

const results = [];
for (const url of urls) {
  const html = await htmlForUrl(url);
  const canonical = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i)?.[1]
    || html.match(/<link[^>]+href="([^"]+)"[^>]+rel="canonical"/i)?.[1]
    || '';
  const title = html.match(/<title>(.*?)<\/title>/i)?.[1] || '';
  const description = html.match(/<meta[^>]+name="description"[^>]+content="([^"]*)"/i)?.[1]
    || html.match(/<meta[^>]+content="([^"]*)"[^>]+name="description"/i)?.[1]
    || '';
  const noindex = /<meta[^>]+(?:name="robots"[^>]+content="[^"]*noindex|content="[^"]*noindex[^"]*"[^>]+name="robots")/i.test(html);
  const h1 = (html.match(/<h1\b/gi) || []).length;
  const hrefs = [...html.matchAll(/href="([^"]+)"/gi)].map((match) => match[1]);
  results.push({ url, canonical, title, description, noindex, h1, hrefs });
}

const portfolioDetails = results.filter(({ url }) => new URL(url).pathname.startsWith('/portfolio/'));
const boardDetails = results.filter(({ url }) => new URL(url).pathname.startsWith('/board/'));
const sitemapBlocks = [...sitemapXml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((match) => match[1]);
const portfolioSitemapBlocks = sitemapBlocks.filter((block) => /<loc>[^<]*\/portfolio\//.test(block));
const portfolioList = results.find(({ url }) => new URL(url).pathname === '/portfolio');
const boardList = results.find(({ url }) => new URL(url).pathname === '/board');

const failures = [
  ...(new Set(urls).size !== urls.length ? ['Sitemap URL이 중복되었습니다.'] : []),
  ...results.filter((result) => result.noindex).map((result) => `Sitemap URL에 noindex 발견: ${result.url}`),
  ...results.filter((result) => !result.canonical).map((result) => `Canonical 없음: ${result.url}`),
  ...results.filter((result) => !result.description).map((result) => `Meta description 없음: ${result.url}`),
  ...results.filter((result) => result.h1 === 0).map((result) => `H1 없음: ${result.url}`),
  ...portfolioDetails.filter((result) => result.canonical !== result.url).map((result) => `포트폴리오 canonical 오류: ${result.url} -> ${result.canonical}`),
  ...portfolioDetails.filter((result) => result.title === '포트폴리오 | MAI PARTNERS').map((result) => `포트폴리오 고유 제목 없음: ${result.url}`),
  ...portfolioSitemapBlocks.filter((block) => !block.includes('<lastmod>')).map((block) => `포트폴리오 lastmod 없음: ${block.match(/<loc>(.*?)<\/loc>/)?.[1] || ''}`),
  ...portfolioSitemapBlocks.filter((block) => !block.includes('<image:loc>')).map((block) => `포트폴리오 sitemap 이미지 없음: ${block.match(/<loc>(.*?)<\/loc>/)?.[1] || ''}`),
];

const portfolioLinks = portfolioList?.hrefs.filter((href) => href.startsWith('/portfolio/')).length || 0;
const boardLinks = boardList?.hrefs.filter((href) => href.startsWith('/board/')).length || 0;
if (portfolioLinks === 0) failures.push('포트폴리오 목록에 상세 href가 없습니다.');
if (portfolioLinks < portfolioDetails.length) {
  failures.push(`포트폴리오 내부 링크 부족: ${portfolioLinks}/${portfolioDetails.length}`);
}
if (boardLinks === 0) failures.push('게시판 목록에 상세 href가 없습니다.');

console.log(JSON.stringify({
  sitemapUrls: urls.length,
  sitemapImages: imageEntries,
  portfolioDetails: portfolioDetails.length,
  boardDetails: boardDetails.length,
  portfolioLinks,
  boardLinks,
  pagesWithoutH1: results.filter((result) => result.h1 === 0).length,
  pagesWithoutH1Urls: results.filter((result) => result.h1 === 0).map((result) => result.url),
  failures: failures.length,
}, null, 2));

if (failures.length > 0) {
  console.error(failures.slice(0, 20).join('\n'));
  process.exit(1);
}
