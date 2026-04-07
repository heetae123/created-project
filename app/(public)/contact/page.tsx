import type { Metadata } from 'next';
import ContactClient from './ContactClient';
import { getSeoSettings } from '@/src/lib/api-server';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();
  return {
    title: '문의하기',
    description: '이벤트 기획 문의. 기업행사, 컨퍼런스, 페스티벌, 프로모션 견적 상담. 마이파트너스 전문 담당자가 빠르게 답변해 드립니다.',
    alternates: { canonical: 'https://maiptns.com/contact' },
    openGraph: {
      title: '이벤트 기획 문의 | MAI PARTNERS',
      description: '기업행사·컨퍼런스·페스티벌 기획 견적 상담. 전문 담당자가 빠르게 답변합니다.',
      url: 'https://maiptns.com/contact',
      images: [seo.ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: '이벤트 기획 문의 | MAI PARTNERS',
      description: '기업행사·컨퍼런스·페스티벌 기획 견적 상담.',
      images: [seo.ogImage],
    },
  };
}

export default function ContactPage() { return <ContactClient />; }
