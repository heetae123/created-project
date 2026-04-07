import type { Metadata } from 'next';
import AboutClient from './AboutClient';
import { getSeoSettings } from '@/src/lib/api-server';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();
  return {
    title: '회사 소개',
    description: '마이파트너스의 비전, 미션, 기업 가치를 소개합니다. 기업행사·컨퍼런스·페스티벌 등 MICE 전문 기업으로 성장해온 마이파트너스를 만나보세요.',
    alternates: { canonical: 'https://maiptns.com/about' },
    openGraph: {
      title: '회사 소개 | MAI PARTNERS',
      description: '마이파트너스의 비전, 미션, 기업 가치를 소개합니다. MICE 전문 이벤트 기획 기업 마이파트너스.',
      url: 'https://maiptns.com/about',
      images: [seo.ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: '회사 소개 | MAI PARTNERS',
      description: 'MICE 전문 이벤트 기획 기업 마이파트너스의 비전과 미션.',
      images: [seo.ogImage],
    },
  };
}

export default function AboutPage() { return <AboutClient />; }
