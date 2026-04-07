import type { Metadata } from 'next';
import PortfolioListClient from './PortfolioListClient';
import { getSeoSettings } from '@/src/lib/api-server';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();
  return {
    title: '포트폴리오',
    description: '마이파트너스 이벤트 기획 포트폴리오. 기업행사, 컨퍼런스, 페스티벌, 프로모션 등 다양한 성공 프로젝트 사례를 확인하세요.',
    alternates: { canonical: 'https://maiptns.com/portfolio' },
    openGraph: {
      title: '포트폴리오 | MAI PARTNERS',
      description: '기업행사·컨퍼런스·페스티벌 등 다양한 이벤트 기획 포트폴리오.',
      url: 'https://maiptns.com/portfolio',
      images: [seo.ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: '이벤트 포트폴리오 | MAI PARTNERS',
      description: '기업행사·컨퍼런스·페스티벌 성공 사례 모음.',
      images: [seo.ogImage],
    },
  };
}

export default function PortfolioPage() { return <PortfolioListClient />; }
