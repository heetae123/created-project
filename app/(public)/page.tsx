import { Metadata } from 'next';
import { getSeoSettings } from '@/src/lib/api-server';
import HomeClient from './HomeClient';

const SITE_NAME = 'MAI PARTNERS';
const SITE_URL = 'https://maiptns.com';

/* ── 1. generateMetadata: title + description 명시 추가 ── */
export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();
  return {
    title: seo.title,              // 기본 <title> 태그 (구글 우선순위)
    description: seo.description,  // 기본 <meta name="description"> (구글 우선순위)
    alternates: { canonical: `${SITE_URL}/` },
    openGraph: {
      title: seo.ogTitle,
      description: seo.ogDescription,
      images: [{ url: seo.ogImage, width: 1200, height: 630, alt: seo.ogTitle }],
      url: `${SITE_URL}/`,
    },
    twitter: {
      title: seo.ogTitle,
      description: seo.ogDescription,
      images: [seo.ogImage],
    },
  };
}

/* ── 2. HomeStructuredData: seo 데이터 동적 반영 ── */
interface SeoData {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
}

function HomeStructuredData({ seo }: { seo: SeoData }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      /* ① WebSite */
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        'url': SITE_URL,
        'name': SITE_NAME,
        'alternateName': '마이파트너스',
        'inLanguage': 'ko-KR',
        'publisher': { '@id': `${SITE_URL}/#organization` },
      },
      /* ② WebPage — 동적 name/description */
      {
        '@type': 'WebPage',
        '@id': `${SITE_URL}/#webpage`,
        'url': SITE_URL,
        'name': seo.ogTitle || seo.title,
        'description': seo.ogDescription || seo.description,
        'inLanguage': 'ko-KR',
        'isPartOf': { '@id': `${SITE_URL}/#website` },
        'about': { '@id': `${SITE_URL}/#organization` },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
    />
  );
}

/* ── 3. HomePage: async로 seo 전달 ── */
export default async function HomePage() {
  const seo = await getSeoSettings();
  return (
    <>
      <HomeStructuredData seo={seo} />
      <HomeClient />
    </>
  );
}
