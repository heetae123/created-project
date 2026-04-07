import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

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
