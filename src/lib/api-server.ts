import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from './firebase';

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
      return {
        title:         data.title         || FALLBACK.title,
        description:   data.description   || FALLBACK.description,
        keywords:      data.keywords      || FALLBACK.keywords,
        ogTitle:       data.ogTitle       || FALLBACK.ogTitle,
        ogDescription: data.ogDescription || FALLBACK.ogDescription,
        ogImage:       data.ogImage       || FALLBACK.ogImage,
      };
    }
  } catch {
    // 빌드 시 Firestore 접근 실패 → fallback 사용
  }
  return FALLBACK;
}
