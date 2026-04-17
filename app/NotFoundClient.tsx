"use client";
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

const PortfolioDetail = dynamic(() => import('@/src/components/PortfolioDetail'), { ssr: false });
const BoardDetail = dynamic(() => import('@/src/components/BoardDetail'), { ssr: false });

export default function NotFoundClient() {
  const pathname = usePathname() ?? '';
  const segments = pathname.split('/').filter(Boolean);
  const section = segments[0];
  const id = segments[1];

  if (section === 'portfolio' && id && id !== 'view') {
    return <PortfolioDetail id={id} />;
  }
  if (section === 'board' && id && id !== 'view') {
    return <BoardDetail id={id} />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-zinc-900">
      <h1 className="text-8xl font-black text-[#F97316] mb-4">404</h1>
      <p className="text-2xl font-bold mb-8">페이지를 찾을 수 없습니다</p>
      <a
        href="/"
        className="px-8 py-3 bg-[#F97316] text-white font-bold rounded-full hover:bg-[#EA580C] transition-colors"
      >
        홈으로 돌아가기
      </a>
    </div>
  );
}
