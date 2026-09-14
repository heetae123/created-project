import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db, FIREBASE_API_KEY, FIREBASE_PROJECT_ID } from './firebase';

export interface PortfolioContentBlock {
  type: 'text' | 'image' | 'video';
  content?: string;
  url?: string;
  caption?: string;
}

export interface PortfolioPublicItem {
  id: string;
  category: string;
  subcategory?: string;
  title: string;
  thumbnail?: string;
  image?: string;
  client?: string;
  date?: string;
  description?: string;
  blocks?: PortfolioContentBlock[];
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BoardTextBlock {
  type: 'text';
  html: string;
}

export interface BoardImagesBlock {
  type: 'images';
  urls: string[];
  caption: string;
}

export interface BoardVideoBlock {
  type: 'video';
  url: string;
  caption: string;
}

export type BoardContentBlock = BoardTextBlock | BoardImagesBlock | BoardVideoBlock;

export interface BoardPublicPost {
  id: number;
  title: string;
  author: string;
  date: string;
  views: number;
  isNotice: boolean;
  category?: string;
  content: string;
  blocks?: BoardContentBlock[];
  thumbnail?: string;
  pinned?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

function decodeRouteId(id: string): string {
  try {
    return decodeURIComponent(id);
  } catch {
    return id;
  }
}

function toSerializable(value: unknown): any {
  if (value === null || value === undefined) return value;
  if (typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(toSerializable);

  if ('toDate' in value && typeof (value as { toDate?: unknown }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, toSerializable(item)]),
  );
}

export function plainTextFromHtml(value: string): string {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export async function getPortfolioItemsServer(): Promise<PortfolioPublicItem[]> {
  const snapshot = await getDocs(collection(db, 'portfolio'));
  const items = snapshot.docs.map((snapshotDoc) => ({
    ...toSerializable(snapshotDoc.data()),
    id: snapshotDoc.id,
  })) as PortfolioPublicItem[];

  return items.sort((a, b) => (b.sortOrder || 0) - (a.sortOrder || 0));
}

export async function getPortfolioItemServer(id: string): Promise<PortfolioPublicItem | null> {
  const decodedId = decodeRouteId(id);
  const snapshot = await getDoc(doc(db, 'portfolio', decodedId));
  if (!snapshot.exists()) return null;
  return { ...toSerializable(snapshot.data()), id: snapshot.id } as PortfolioPublicItem;
}

export async function getBoardPostsServer(): Promise<BoardPublicPost[]> {
  const snapshot = await getDocs(collection(db, 'board'));
  const posts = snapshot.docs.map((snapshotDoc) => {
    const data = toSerializable(snapshotDoc.data());
    delete data.password;
    return { ...data, id: Number(data.id ?? snapshotDoc.id) } as BoardPublicPost;
  });

  return posts.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return (b.id || 0) - (a.id || 0);
  });
}

export async function getBoardPostServer(id: string): Promise<BoardPublicPost | null> {
  const decodedId = decodeRouteId(id);
  const snapshot = await getDoc(doc(db, 'board', decodedId));
  if (!snapshot.exists()) return null;
  const data = toSerializable(snapshot.data());
  delete data.password;
  return { ...data, id: Number(data.id ?? snapshot.id) } as BoardPublicPost;
}

export interface SeoSettings {
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
}

export interface MapSettings {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  lat: number;
  lng: number;
  bizLicense?: string;
}

const FALLBACK_MAP: MapSettings = {
  companyName: '주식회사 마이파트너스',
  address: '경기도 용인시 기흥구 중부대로 184, 힉스유타워 A동 513호',
  phone: '050-6192-8300',
  email: 'info@maiptns.com',
  lat: 37.2692002,
  lng: 127.0908828,
  bizLicense: '442-88-03209',
};

const FALLBACK: SeoSettings = {
  title: 'MAI PARTNERS - 이벤트/MICE 기획 전문',
  description: '마이파트너스는 기업 행사, 컨퍼런스, 페스티벌, 프로모션 등 최고의 이벤트를 기획하는 MICE 전문 기업입니다.',
  keywords: '이벤트기획, 이벤트대행, MICE, 기업행사, 마이파트너스',
  ogTitle: 'MAI PARTNERS - 이벤트/MICE 기획 전문',
  ogDescription: '마이파트너스는 기업 행사, 컨퍼런스, 페스티벌, 프로모션 등 최고의 이벤트를 기획하는 MICE 전문 기업입니다.',
  ogImage: 'https://maiptns.com/og-image.jpg',
};

export async function getSeoSettings(): Promise<SeoSettings> {
  try {
    const snap = await getDoc(doc(db, 'settings', 'seo'));
    if (snap.exists()) {
      const data = snap.data().value as Partial<SeoSettings>;
      const ogImage = data.ogImage || FALLBACK.ogImage;
      return {
        title:         data.title         || FALLBACK.title,
        description:   data.description   || FALLBACK.description,
        keywords:      data.keywords      || FALLBACK.keywords,
        ogTitle:       data.ogTitle       || FALLBACK.ogTitle,
        ogDescription: data.ogDescription || FALLBACK.ogDescription,
        ogImage:       ogImage.replace(/^https:\/\/www\.maiptns\.com(?=\/)/i, 'https://maiptns.com'),
      };
    }
  } catch {
    // 빌드 시 Firestore 접근 실패 → fallback 사용
  }
  return FALLBACK;
}

export async function getMapSettingsServer(): Promise<MapSettings> {
  try {
    const snap = await getDoc(doc(db, 'settings', 'map'));
    if (snap.exists()) {
      const value = snap.data().value as Partial<MapSettings>;
      return {
        ...FALLBACK_MAP,
        ...value,
      };
    }
  } catch {
    // 빌드 시 Firestore 접근 실패는 실제 회사 정보 기본값으로 대체한다.
  }
  return FALLBACK_MAP;
}

export async function getFirestoreDocumentUpdateTimes(
  collectionName: 'portfolio' | 'board',
): Promise<Map<string, Date>> {
  const updateTimes = new Map<string, Date>();
  let pageToken = '';

  try {
    do {
      const url = new URL(
        `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${collectionName}`,
      );
      url.searchParams.set('key', FIREBASE_API_KEY);
      url.searchParams.set('pageSize', '1000');
      // 문서 본문은 빼고 name/updateTime 메타데이터만 받아 sitemap 빌드를 가볍게 유지한다.
      url.searchParams.set('mask.fieldPaths', 'updatedAt');
      if (pageToken) url.searchParams.set('pageToken', pageToken);

      // Static export 빌드 안에서 호출되므로 force-static과 충돌하는 no-store를 사용하지 않는다.
      const response = await fetch(url, { cache: 'force-cache' });
      if (!response.ok) throw new Error(`Firestore metadata request failed: ${response.status}`);

      const payload = await response.json() as {
        documents?: Array<{ name?: string; updateTime?: string }>;
        nextPageToken?: string;
      };
      for (const document of payload.documents || []) {
        if (!document.name || !document.updateTime) continue;
        const id = decodeURIComponent(document.name.split('/').pop() || '');
        const updatedAt = new Date(document.updateTime);
        if (id && !Number.isNaN(updatedAt.getTime())) updateTimes.set(id, updatedAt);
      }
      pageToken = payload.nextPageToken || '';
    } while (pageToken);
  } catch {
    // Sitemap은 메타데이터 조회 실패 시에도 lastmod만 생략하고 생성한다.
  }

  return updateTimes;
}
