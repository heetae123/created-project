import { Metadata, ResolvingMetadata } from 'next';
import ServiceClient from './ServiceClient';
import { getSeoSettings } from '@/src/lib/api-server';

const SITE_NAME = "MAI PARTNERS";
const SITE_URL = "https://maiptns.com";

const serviceData: Record<string, { title: string; description: string }> = {
  ceremony: { title: "기념행사", description: "송년회, 창립행사, 신년회, 준공식, 협약식, 워크숍, 시상식 등" },
  promotion: { title: "프로모션", description: "브랜드 인지도를 높이는 창의적인 프로모션" },
  sports: { title: "Sports", description: "기업 체육대회, 단합행사, 팀빌딩, 레크레이션, e-sports 등" },
  vip: { title: "VIP 행사", description: "VIP 골프행사, VIP 의전 등 프리미엄 서비스" },
  international: { title: "국제행사", description: "인센티브 투어, 국제세미나, 포럼 등 글로벌 행사 기획" },
  conference: { title: "컨퍼런스", description: "국내 컨벤션, 세미나, 포럼, 사업설명회, 정기총회 등" },
  contest: { title: "컨테스트", description: "기술 경연대회, 학술제, 경진대회 등" },
  festival: { title: "공연 축제", description: "공연 기획, 콘서트, 지역축제, 관공서 기관 행사 등" },
  design: { title: "디자인", description: "행사 브랜딩, 공간 디자인, 그래픽 제작 등 비주얼 솔루션" },
  system: { title: "시스템 협업", description: "최첨단 음향, 조명, 영상 시스템 구축 및 운영" },
  hr: { title: "인재협업", description: "MC·모델·퍼포머 등 행사에 적합한 전문 인력을 매칭합니다" },
};

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  return Object.keys(serviceData).map((id) => ({ id }));
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  const service = serviceData[id];
  if (!service) return { title: { absolute: `서비스 | ${SITE_NAME}` }, alternates: { canonical: `${SITE_URL}/service` } };

  const seo = await getSeoSettings();
  const title = `${service.title} - 서비스 | ${SITE_NAME}`;
  const description = `${service.description} | 마이파트너스 이벤트 서비스`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `${SITE_URL}/service/${id}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/service/${id}`,
      images: [seo.ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [seo.ogImage],
    },
  };
}

export default async function ServicePage({ params }: Props) {
  const { id } = await params;
  const service = serviceData[id];

  const jsonLd = service
    ? {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: service.title,
        description: `${service.description} | 마이파트너스 이벤트 서비스`,
        url: `${SITE_URL}/service/${id}`,
        provider: {
          '@type': 'Organization',
          name: SITE_NAME,
          url: SITE_URL,
        },
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ServiceClient />
    </>
  );
}
