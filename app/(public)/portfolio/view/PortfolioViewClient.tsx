"use client";
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

const PortfolioDetail = dynamic(() => import('@/src/components/PortfolioDetail'), { ssr: false });

export default function PortfolioViewClient() {
  const pathname = usePathname();
  // Firebase rewrite로 이 페이지가 서빙될 때 실제 URL(/portfolio/새아이디)에서 ID 추출
  const segments = pathname.split('/').filter(Boolean);
  const id = segments[segments.length - 1] ?? '';
  // /portfolio/view로 직접 접근한 경우는 id가 'view'이므로 빈 문자열 처리
  const portfolioId = id === 'view' ? '' : id;
  return <PortfolioDetail id={portfolioId} />;
}
