import type { Metadata } from 'next';
import BoardListClient from './BoardListClient';
import { getSeoSettings } from '@/src/lib/api-server';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();
  return {
    title: '공지사항',
    description: '마이파트너스의 최신 공지사항과 소식. 이벤트 업계 트렌드, 새로운 서비스, 프로젝트 소식을 확인하세요.',
    alternates: { canonical: 'https://maiptns.com/board' },
    openGraph: {
      title: '공지사항 | MAI PARTNERS',
      description: '마이파트너스 최신 공지사항과 이벤트 업계 소식.',
      url: 'https://maiptns.com/board',
      images: [seo.ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: '공지사항 | MAI PARTNERS',
      description: '마이파트너스 최신 소식.',
      images: [seo.ogImage],
    },
  };
}

export default function BoardPage() { return <BoardListClient />; }
