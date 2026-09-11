import { createHash } from 'node:crypto';

const PROJECT_ID = 'mai-entertainment';
const API_KEY = 'AIzaSyBVgi2x239eAjP-mM2r9azJJEgJfhjvriw';
const API_ROOT = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.keys(value).sort().map((key) => [key, stableValue(value[key])]),
  );
}

async function getCollectionDocuments(collectionName) {
  const documents = [];
  let pageToken = '';

  do {
    const url = new URL(`${API_ROOT}/${collectionName}`);
    url.searchParams.set('key', API_KEY);
    url.searchParams.set('pageSize', '1000');
    if (pageToken) url.searchParams.set('pageToken', pageToken);

    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Firestore ${collectionName} 조회 실패: HTTP ${response.status}`);
    }

    const payload = await response.json();
    documents.push(...(payload.documents || []));
    pageToken = payload.nextPageToken || '';
  } while (pageToken);

  return documents.map((document) => {
    const fields = { ...(document.fields || {}) };
    if (collectionName === 'board') {
      delete fields.views;
      delete fields.password;
    }
    return { name: document.name, fields: stableValue(fields) };
  }).sort((a, b) => a.name.localeCompare(b.name));
}

export async function createContentManifest() {
  const [portfolio, board] = await Promise.all([
    getCollectionDocuments('portfolio'),
    getCollectionDocuments('board'),
  ]);
  const content = stableValue({ portfolio, board });
  const version = createHash('sha256').update(JSON.stringify(content)).digest('hex');

  return {
    version,
    generatedAt: new Date().toISOString(),
    counts: { portfolio: portfolio.length, board: board.length },
  };
}
