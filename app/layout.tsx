import type { Metadata, Viewport } from 'next';
import '../src/index.css';
import { getSeoSettings } from '@/src/lib/api-server';

/* ================================================================
   전역 Viewport
   ================================================================ */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5, // 접근성: 확대 허용 (1 이면 SEO 감점)
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F97316' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
};

/* ================================================================
   전역 Metadata — 관리자 SEO 설정에서 동적으로 읽어옴
   ================================================================ */
export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();

  return {
    metadataBase: new URL('https://maiptns.com'),

    /* ── 기본 (관리자 설정값) ── */
    title: {
      default: seo.title,
      template: '%s | MAI PARTNERS',
    },
    description: seo.description,
    keywords: seo.keywords,

    /* ── 작성자 ── */
    authors: [{ name: 'MAI PARTNERS', url: 'https://maiptns.com' }],
    creator: 'MAI PARTNERS',
    publisher: 'MAI PARTNERS',
    category: 'Event Planning',
    applicationName: 'MAI PARTNERS',

    /* ── Open Graph (기본 구조만 — 제목/설명/이미지는 각 페이지에서 설정) ── */
    openGraph: {
      siteName: 'MAI PARTNERS',
      locale: 'ko_KR',
      type: 'website',
    },

    /* ── Twitter Card (기본 구조만 — 제목/설명/이미지는 각 페이지에서 설정) ── */
    twitter: {
      card: 'summary_large_image',
    },

    /* ── 로봇 ── */
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    /* ── 아이콘 ── */
    icons: {
      icon: '/favicon.ico',
      apple: '/logo.png',
    },

    /* ── 네이버 등 기타 (하드코딩 유지) ── */
    other: {
      'naver-site-verification': 'naver8d4e7eab6e92c5591d01ceb032e0b8b0',
      'format-detection': 'telephone=no',
      'mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-title': 'MAI PARTNERS',
      'geo.region': 'KR-11',
      'geo.placename': 'Seoul',
    },
  };
}

/* ================================================================
   Organization 스키마 (전역)
   ================================================================ */
function OrganizationSchema({ ogImage }: { ogImage: string }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EventPlanningService',
    'name': 'MAI PARTNERS',
    'alternateName': ['마이파트너스', 'MAI파트너스', 'MAIPARTNERS', '마이 파트너스'],
    'url': 'https://maiptns.com',
    'logo': {
      '@type': 'ImageObject',
      'url': 'https://maiptns.com/logo.png',
    },
    'image': ogImage,
    'description': '기업 행사, 컨퍼런스, 페스티벌, 프로모션 등 MICE 전문 이벤트 기획 기업',
    'contactPoint': {
      '@type': 'ContactPoint',
      'contactType': 'customer service',
      'email': 'info@maiptns.com',
      'areaServed': { '@type': 'Country', 'name': 'KR' },
      'availableLanguage': ['Korean', 'English'],
    },
    'address': {
      '@type': 'PostalAddress',
      'addressLocality': '서울',
      'addressCountry': 'KR',
    },
    'areaServed': { '@type': 'Country', 'name': 'South Korea' },
    'hasOfferCatalog': {
      '@type': 'OfferCatalog',
      'name': '이벤트 기획 서비스',
      'itemListElement': [
        {
          '@type': 'OfferCatalog', 'name': '기업 행사',
          'itemListElement': [
            { '@type': 'Offer', 'itemOffered': { '@type': 'Service', 'name': '기념행사 (송년회·창립행사·시상식)' }},
            { '@type': 'Offer', 'itemOffered': { '@type': 'Service', 'name': 'VIP 행사 (골프행사·VIP의전)' }},
            { '@type': 'Offer', 'itemOffered': { '@type': 'Service', 'name': '스포츠 (체육대회·팀빌딩·레크리에이션)' }},
          ],
        },
        {
          '@type': 'OfferCatalog', 'name': 'MICE',
          'itemListElement': [
            { '@type': 'Offer', 'itemOffered': { '@type': 'Service', 'name': '컨퍼런스 (세미나·포럼·총회)' }},
            { '@type': 'Offer', 'itemOffered': { '@type': 'Service', 'name': '국제행사 (인센티브투어·국제세미나)' }},
            { '@type': 'Offer', 'itemOffered': { '@type': 'Service', 'name': '컨테스트 (경연대회·학술제)' }},
          ],
        },
        {
          '@type': 'OfferCatalog', 'name': '크리에이티브',
          'itemListElement': [
            { '@type': 'Offer', 'itemOffered': { '@type': 'Service', 'name': '프로모션 (브랜드런칭·체험행사)' }},
            { '@type': 'Offer', 'itemOffered': { '@type': 'Service', 'name': '공연·축제 (콘서트·지역축제)' }},
            { '@type': 'Offer', 'itemOffered': { '@type': 'Service', 'name': '디자인 (공간디자인·행사브랜딩)' }},
          ],
        },
        {
          '@type': 'OfferCatalog', 'name': '기술 지원',
          'itemListElement': [
            { '@type': 'Offer', 'itemOffered': { '@type': 'Service', 'name': '시스템 (음향·조명·영상)' }},
            { '@type': 'Offer', 'itemOffered': { '@type': 'Service', 'name': '인재협업 (MC·모델·퍼포머)' }},
          ],
        },
      ],
    },
    'knowsAbout': [
      'Event Planning', 'MICE', 'Conference Management', 'Corporate Events',
      'Festival Production', 'Stage Design', 'AV Systems',
    ],
    'slogan': '최고의 이벤트, 최적의 파트너',
    'potentialAction': {
      '@type': 'CommunicateAction',
      'target': { '@type': 'EntryPoint', 'urlTemplate': 'https://maiptns.com/contact/' },
      'name': '이벤트 문의하기',
    },
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  );
}

/* ================================================================
   LocalBusiness 스키마 (Google 지도/로컬 검색)
   ================================================================ */
function LocalBusinessSchema({ ogImage }: { ogImage: string }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    'name': 'MAI PARTNERS (마이파트너스)',
    'image': ogImage,
    'url': 'https://maiptns.com',
    'address': {
      '@type': 'PostalAddress',
      'addressLocality': '서울',
      'addressCountry': 'KR',
    },
    'priceRange': '$$',
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  );
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const seo = await getSeoSettings();
  return (
    <html lang="ko">
      <head>
        <OrganizationSchema ogImage={seo.ogImage} />
        <LocalBusinessSchema ogImage={seo.ogImage} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
