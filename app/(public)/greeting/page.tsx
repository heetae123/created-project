import type { Metadata } from 'next';
import GreetingClient from './GreetingClient';
import { getSeoSettings } from '@/src/lib/api-server';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();
  return {
    title: '대표 인사말',
    description: '마이파트너스 대표 인사말. 최고의 이벤트 기획과 MICE 전문성으로 고객의 성공적인 행사를 만들어갑니다.',
    alternates: { canonical: 'https://maiptns.com/greeting' },
    openGraph: {
      title: '대표 인사말 | MAI PARTNERS',
      description: '마이파트너스 대표의 인사말. MICE 전문 이벤트 기획.',
      url: 'https://maiptns.com/greeting',
      images: [seo.ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: '대표 인사말 | MAI PARTNERS',
      description: 'MICE 전문 이벤트 기획 기업 마이파트너스.',
      images: [seo.ogImage],
    },
  };
}

export default function GreetingPage() { return <GreetingClient />; }
