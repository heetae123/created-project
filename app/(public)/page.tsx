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
      /* ③ BreadcrumbList — trailing slash 제거 */
      {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': '홈', 'item': SITE_URL },
          { '@type': 'ListItem', 'position': 2, 'name': '회사소개', 'item': `${SITE_URL}/about` },
          { '@type': 'ListItem', 'position': 3, 'name': '서비스', 'item': `${SITE_URL}/service` },
          { '@type': 'ListItem', 'position': 4, 'name': '포트폴리오', 'item': `${SITE_URL}/portfolio` },
          { '@type': 'ListItem', 'position': 5, 'name': '팀 소개', 'item': `${SITE_URL}/team` },
          { '@type': 'ListItem', 'position': 6, 'name': '공지사항', 'item': `${SITE_URL}/board` },
          { '@type': 'ListItem', 'position': 7, 'name': '문의하기', 'item': `${SITE_URL}/contact` },
        ],
      },
      /* ④ FAQPage */
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': '이벤트 기획 비용은 얼마인가요?',
            'acceptedAnswer': { '@type': 'Answer', 'text': '행사 규모, 장소, 참석 인원, 프로그램 구성에 따라 달라집니다. 문의하기 페이지에서 상세 내용을 보내주시면 맞춤 견적을 안내해 드립니다.' },
          },
          {
            '@type': 'Question',
            'name': '소규모 행사도 기획 가능한가요?',
            'acceptedAnswer': { '@type': 'Answer', 'text': '네, 10인 이하 소규모 VIP 행사부터 수천 명 규모의 대형 페스티벌까지 모든 규모의 행사를 기획합니다. 워크숍, 팀빌딩 등 소규모 행사도 전문적으로 운영합니다.' },
          },
          {
            '@type': 'Question',
            'name': '어떤 종류의 행사를 기획하나요?',
            'acceptedAnswer': { '@type': 'Answer', 'text': '기업 기념행사(송년회, 창립행사), 컨퍼런스·세미나, 프로모션, 체육대회·팀빌딩, VIP행사, 국제행사, 공연·축제, 컨테스트 등 MICE 전 분야를 다룹니다.' },
          },
          {
            '@type': 'Question',
            'name': '행사 준비 기간은 얼마나 필요한가요?',
            'acceptedAnswer': { '@type': 'Answer', 'text': '소규모 행사는 최소 2-4주, 대규모 컨퍼런스나 페스티벌은 2-6개월의 준비 기간을 권장합니다. 긴급 행사도 협의 가능하니 먼저 문의해 주세요.' },
          },
          {
            '@type': 'Question',
            'name': '지방이나 해외 행사도 가능한가요?',
            'acceptedAnswer': { '@type': 'Answer', 'text': '네, 전국 어디서든 행사 기획 및 운영이 가능합니다. 해외 행사(인센티브 투어, 국제 세미나 등)도 기획·운영한 경험이 있습니다.' },
          },
        ],
      },
    ],
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
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
