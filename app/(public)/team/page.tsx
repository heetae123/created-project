import type { Metadata } from 'next';
import TeamClient from './TeamClient';
import { getSeoSettings } from '@/src/lib/api-server';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();
  return {
    title: '팀 소개',
    description: '마이파트너스 전문 팀을 소개합니다. 이벤트 기획·연출·운영의 최고 전문가들로 구성된 MICE 전문 팀.',
    alternates: { canonical: 'https://maiptns.com/team' },
    openGraph: {
      title: '팀 소개 | MAI PARTNERS',
      description: '이벤트 기획·연출·운영 전문가로 구성된 마이파트너스 팀.',
      url: 'https://maiptns.com/team',
      images: [seo.ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: '팀 소개 | MAI PARTNERS',
      description: 'MICE 전문 이벤트 기획팀 소개.',
      images: [seo.ogImage],
    },
  };
}

export default function TeamPage() { return <TeamClient />; }
