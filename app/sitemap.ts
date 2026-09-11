import { MetadataRoute } from 'next';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';

export const dynamic = 'force-static';

const SITE_URL = 'https://maiptns.com';

// ── Hardcoded service data (from render.js) ─────────────
const serviceSlugs = [
  'ceremony', 'promotion', 'sports', 'vip', 'international',
  'conference', 'contest', 'festival', 'design', 'system', 'hr'
];

// Firestore Timestamp, ISO 문자열, 숫자 등 실제 저장된 날짜만 Date로 변환
function toDate(val: unknown): Date | undefined {
  if (!val) return undefined;
  // Firestore Timestamp 객체 (.toDate() 메서드 보유)
  if (typeof val === 'object' && val !== null && 'toDate' in val) {
    return (val as { toDate: () => Date }).toDate();
  }
  const d = new Date(val as string | number);
  return isNaN(d.getTime()) ? undefined : d;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/greeting`, changeFrequency: 'yearly', priority: 0.6 },
    { url: `${SITE_URL}/service`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/portfolio`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/team`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/board`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/contact`, changeFrequency: 'yearly', priority: 0.8 },
  ];

  // 2. Service detail routes
  const serviceRoutes: MetadataRoute.Sitemap = serviceSlugs.map((slug) => ({
    url: `${SITE_URL}/service/${slug}`,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  try {
    // 3. Portfolio routes — lastModified는 문서의 실제 수정일 사용
    const portfolioSnap = await getDocs(collection(db, "portfolio"));
    const portfolioRoutes: MetadataRoute.Sitemap = portfolioSnap.docs.map((doc) => {
      const data = doc.data();
      const lastModified = toDate(data.updatedAt ?? data.createdAt);
      return {
        url: `${SITE_URL}/portfolio/${encodeURIComponent(doc.id)}`,
        ...(lastModified ? { lastModified } : {}),
        changeFrequency: 'monthly',
        priority: 0.6,
      };
    });

    // 4. Board routes — lastModified는 문서의 실제 수정일 사용
    const boardSnap = await getDocs(collection(db, "board"));
    const boardRoutes: MetadataRoute.Sitemap = boardSnap.docs.map((doc) => {
      const data = doc.data();
      const lastModified = toDate(data.updatedAt ?? data.createdAt);
      return {
        url: `${SITE_URL}/board/${encodeURIComponent(doc.id)}`,
        ...(lastModified ? { lastModified } : {}),
        changeFrequency: 'weekly',
        priority: 0.5,
      };
    });

    return [...staticRoutes, ...serviceRoutes, ...portfolioRoutes, ...boardRoutes];
  } catch (e) {
    console.error("Sitemap generation error:", e);
    return [...staticRoutes, ...serviceRoutes];
  }
}
